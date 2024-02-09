from dataclasses import dataclass, field
import streamdal_protos.protos as protos
from threading import Thread, Lock, Event
from queue import SimpleQueue, Empty
import asyncio
import logging
from datetime import datetime
from copy import deepcopy, copy

WORKER_POOL_SIZE = 3
DEFAULT_COUNTER_REAPER_INTERVAL = 10
DEFAULT_COUNTER_TTL = 10

# Counter type constants
COUNTER_CONSUME_BYTES = "counter_consume_bytes"
COUNTER_CONSUME_PROCESSED = "counter_consume_processed"
COUNTER_CONSUME_ERRORS = "counter_consume_errors"
COUNTER_PRODUCE_BYTES = "counter_produce_bytes"
COUNTER_PRODUCE_PROCESSED = "counter_produce_processed"
COUNTER_PRODUCE_ERRORS = "counter_produce_errors"
COUNTER_NOTIFY = "counter_notify"

COUNTER_DROPPED_TAIL_MESSAGES = "counter_dropped_tail_messages"

COUNTER_CONSUME_BYTES_RATE = "counter_consume_bytes_rate"
COUNTER_PRODUCE_BYTES_RATE = "counter_produce_bytes_rate"
COUNTER_CONSUME_PROCESSED_RATE = "counter_consume_processed_rate"
COUNTER_PRODUCE_PROCESSED_RATE = "counter_produce_processed_rate"


@dataclass
class CounterEntry:
    """
    Class CounterEntry is used to increase a counter metric

    It is not necessary to create a counter directly, as one will be created
    for the given CounterEntry if it does not already exist.
    """

    name: str
    aud: protos.Audience
    labels: dict = field(default_factory=dict)
    value: float = 0.0


@dataclass
class Counter:
    """Class Counter is a data class that represents a single counter metric"""

    entry: CounterEntry
    lock: Lock = Lock()
    last_updated: datetime = datetime.utcnow()
    value: float = 0.0

    def __init__(self, entry: CounterEntry):
        self.entry = entry

    def incr(self, value: float):
        """Increment the counter by the given value"""
        self.lock.acquire(blocking=True)
        self.value += value
        self.last_updated = datetime.utcnow()
        self.lock.release()

    def reset(self):
        """Reset the counter to 0"""
        self.lock.acquire(blocking=True)
        self.value = 0.0
        self.lock.release()

    def val(self) -> float:
        """Return the current value of the counter"""
        self.lock.acquire(blocking=False)
        value = copy(self.value)
        self.lock.release()
        return value


def composite_id(entry: CounterEntry) -> str:
    """
    Return a composite ID for the given CounterEntry
    This ID is used to uniquely identify a counter metric based on its
    type, rule, ruleset, and labels.
    """
    labels = list(entry.labels.values())
    return "{}-{}".format(entry.name, "-".join(labels))


class Metrics:
    """Class Metrics is used to manage counter metrics, and ship them to Streamdal server asynchronously"""

    loop: asyncio.AbstractEventLoop
    log: logging.Logger
    exit: Event
    counters: dict = field(default_factory=dict)
    stub: protos.InternalStub = None
    lock: Lock
    publish_queue: SimpleQueue = SimpleQueue()
    incr_queue: SimpleQueue = SimpleQueue()

    def __init__(self, **kwargs):
        log = kwargs.get("log", logging.getLogger("streamdal-client"))
        log.setLevel(logging.DEBUG)

        self.stub = kwargs.get("stub")
        self.log = log
        self.counters = {}
        self.lock = Lock()
        self.loop = kwargs.get("loop")
        self.auth_token = kwargs.get("auth_token")
        self.exit = kwargs.get("exit")

        self.__start()

    def __start(self):
        """Start the background tasks that manage counters and publish metrics"""

        self.workers = []

        for i in range(WORKER_POOL_SIZE):
            incr_worker = Thread(
                target=self.run_incrementer_worker, args=(i + 1,), daemon=False
            )
            incr_worker.start()
            self.workers.append(incr_worker)

            # Run counter incrementer. We use no blocking queue when increasing counters and then
            # this background thread does the actual incrementing. This is to avoid blocking the caller of incr()
            publish_worker = Thread(
                target=self.run_publisher_worker, args=(i + 1,), daemon=False
            )
            publish_worker.start()
            self.workers.append(publish_worker)

        # Run counter reaper, this cleans up old empty counters to prevent memory leaks
        reaper = Thread(target=self.run_reaper, daemon=False)
        reaper.start()
        self.workers.append(reaper)

        # Run counter publisher. This reads values from counters,
        # adds them to the publish queue and then resets the counter.
        publisher = Thread(target=self.run_publisher, daemon=False)
        publisher.start()
        self.workers.append(publisher)

    def get_counter(self, entry: CounterEntry) -> Counter:
        id = composite_id(entry)
        self.lock.acquire(blocking=False)
        c = self.counters.get(id)
        self.lock.release()
        return c

    def new_counter(self, entry: CounterEntry) -> Counter:
        c = Counter(entry)

        self.lock.acquire(blocking=True)
        self.counters[composite_id(entry)] = c
        self.lock.release()

        return c

    def incr(self, entry: CounterEntry) -> None:
        # TODO: validate
        self.incr_queue.put_nowait(entry)

    def shutdown(self, *args) -> None:
        """Shutdown the metrics service, pushing all in-memory data before we allow exit"""
        self.log.debug("Shutting down metrics service")
        # TODO: flush before we exit the metrics service
        self.exit.set()

        for worker in self.workers:
            self.log.debug("Waiting for worker {} to exit".format(worker.name))
            try:
                if worker.is_alive():
                    worker.join()
            except RuntimeError as e:
                self.log.error("Could not exit worker {}".format(worker.name))
                continue

    def publish_metrics(self, entry: CounterEntry) -> None:
        async def call(request: protos.MetricsRequest):
            try:
                await self.stub.metrics(
                    request, metadata={"auth-token": self.auth_token}
                )
            except Exception as e:
                self.log.warning("Failed to publish metrics")

        req = protos.MetricsRequest()
        req.metrics = [
            protos.Metric(
                name=entry.name,
                value=entry.value,
                labels=entry.labels,
                audience=entry.aud,
            )
        ]

        self.loop.create_task(call(req))

    def run_publisher_worker(self, id: int) -> None:
        """Counter worker pool is responsible for listening to incr() requests and publish queue"""
        self.log.debug("Starting counter worker {}".format(id))
        while not self.exit.is_set():
            self.exit.wait(1)

            # Get entry from the queue. This is blocking to avoid having to handle queue.Empty exceptions
            try:
                entry = self.publish_queue.get(block=False)
            except Empty:
                continue

            try:
                self.publish_metrics(entry)
            except Exception as e:
                self.log.error("Failed to publish metrics: {}".format(e))

        self.log.debug("Exiting counter worker {}".format(id))

    def remove_counter(self, id: str) -> None:
        """Remove a counter from the internal map"""
        self.lock.acquire(blocking=True)
        del self.counters[id]
        self.lock.release()

    def run_publisher(self) -> None:
        """
        Counter ticker is a background task that reads values from counters,
        adds them to the publish queue, and then resets the counter's value to zero.
        """
        self.log.debug("Starting publisher")
        while not self.exit.is_set():
            self.lock.acquire(blocking=True)
            counters = list(self.counters.values())
            self.lock.release()

            for counter in counters:
                # We don't need to publish empty counters
                # run_reaper() will clean these up if they remain zero for a while
                if counter.val() == 0:
                    continue

                # Ensure a fresh copy of the CounterEntry
                entry = deepcopy(counter.entry)
                entry.value = counter.val()

                # Reset counter's value to 0
                counter.reset()

                # Put in the publish queue for a publisher worker to pick up
                self.publish_queue.put_nowait(entry)

            self.exit.wait(1)

        self.log.debug("Exiting publisher")

    def run_reaper(self):
        """Reaper is a background task that prunes old counters from the internal map"""
        self.log.debug("Starting reaper")
        while not self.exit.is_set():
            # Sleep on startup and then and between each loop run
            self.exit.wait(DEFAULT_COUNTER_REAPER_INTERVAL)

            # Get all counters
            # Loop over each counter, get the value,
            #   if value > 0, continue
            #   if now() - last_updated > 10 seconds, remove counter
            self.lock.acquire(blocking=True)
            items = self.counters.copy()
            self.lock.release()

            for name in items:
                counter = items[name]
                if counter.val() > 0:
                    continue

                if (datetime.utcnow() - counter.last_updated).total_seconds() > 10:
                    self.remove_counter(name)

                    self.log.debug("reaped stale counter '{}'".format(name))

        self.log.debug("Exiting reaper")

    def run_incrementer_worker(self, id: int) -> None:
        """
        Incrementer is a background task that listens to incr() requests sent to incr_queue and increments counters
        """
        self.log.debug("Starting incrementer {}".format(id))

        while not self.exit.is_set():
            try:
                entry = self.incr_queue.get(block=False)
            except Empty:
                self.exit.wait(1)
                continue

            counter = self.get_counter(entry)
            if counter is None:
                counter = self.new_counter(entry)
                counter.incr(entry.value)
            else:
                counter.incr(entry.value)

        self.log.info("Exiting incrementer {}".format(id))
