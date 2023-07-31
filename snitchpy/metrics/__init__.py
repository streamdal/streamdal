import time
from dataclasses import dataclass
import snitch_protos.protos as protos
from threading import Thread, Lock, Event
from queue import SimpleQueue, Empty
import asyncio
import logging
import signal
from datetime import datetime
from copy import deepcopy

WORKER_POOL_SIZE = 3
DEFAULT_COUNTER_REAPER_INTERVAL = 10
DEFAULT_COUNTER_TTL = 10

# Counter type constants
COUNTER_PUBLISH = "publish"
COUNTER_CONSUME = "consume"
COUNTER_SIZE_EXCEEDED = "size_exceeded"
COUNTER_RULE = "rule"
COUNTER_FAILURE_TRIGGER = "failure_trigger"


@dataclass
class CounterEntry:
    """
    Class CounterEntry is used to increase a counter metric

    It is not necessary to create a counter directly, as one will be created
    for the given CounterEntry if it does not already exist.
    """

    name: str
    rule_id: str
    ruleset_id: str
    audience: protos.Audience
    labels: dict = dict[str:str]
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

    def val(self):
        """Return the current value of the counter"""
        self.lock.acquire(blocking=False)
        value = self.value
        self.lock.release()
        return value


def composite_id(entry: CounterEntry) -> str:
    """
    Return a composite ID for the given CounterEntry
    This ID is used to uniquely identify a counter metric based on its
    type, rule, ruleset, and labels.
    """
    labels = list(entry.labels.values())
    return "-".join(labels)


class Metrics:
    """Class Metrics is used to manage counter metrics, and ship them to Snitch server asynchronously"""

    log: logging.Logger
    exit: Event
    counters: dict[str:Counter] = {}
    stub: protos.InternalStub = None
    lock: Lock
    publish_queue: SimpleQueue = SimpleQueue()
    incr_queue: SimpleQueue = SimpleQueue()

    def __init__(self, **kwargs):
        log = kwargs.get("log", logging.getLogger("snitch-client"))
        log.setLevel(logging.DEBUG)

        self.stub = kwargs.get("stub")
        self.log = log
        self.lock = Lock()

        # TODO: remove after testing
        if kwargs.get("exit") is None:
            self.exit = Event()
            events = [signal.SIGINT, signal.SIGTERM, signal.SIGQUIT, signal.SIGHUP]
            for e in events:
                signal.signal(e, self.shutdown)

        self.__start()

    def __start(self):
        """Start the background tasks that manage counters and publish metrics"""

        self.workers = []

        for i in range(WORKER_POOL_SIZE):
            incr_worker = Thread(target=self.run_incrementer_worker, args=(i+1,), daemon=False)
            incr_worker.start()
            self.workers.append(incr_worker)

            # Run counter incrementer. We use no blocking queue when increasing counters and then
            # this background thread does the actual incrementing. This is to avoid blocking the caller of incr()
            publish_worker = Thread(target=self.run_publisher_worker, args=(i+1,), daemon=False)
            publish_worker.start()
            self.workers.append(publish_worker)

        # Run counter reaper, this cleans up old empty counters to prevent memory leaks
        reaper = Thread(target=self.run_reaper, daemon=False)
        reaper.start()

        # Run counter publisher. This reads values from counters,
        # adds them to the publish queue and then resets the counter.
        publisher = Thread(target=self.run_publisher, daemon=False)
        publisher.start()

        for worker in self.workers:
            worker.join()

        reaper.join()
        publisher.join()

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
        # DODO: validate
        self.incr_queue.put_nowait(entry)

    def shutdown(self, *args) -> None:
        """Shutdown the metrics service, pushing all in-memory data before we allow exit"""
        self.log.debug("Shutting down metrics service")
        # TODO: flush before we exit the metrics service
        self.exit.set()
        pass

    def publish_metrics(self, entry: CounterEntry) -> None:
        async def call(request: protos.MetricsRequest):
            await self.stub.metrics(request)

        req = protos.MetricsRequest()
        req.rule_id = entry.rule_id
        req.rule_name = entry.ruleset_id
        req.audience = entry.audience  # TODO: implement
        req.metadata = None  # TODO: what is this?

        loop = asyncio.new_event_loop()
        loop.run_until_complete(call(req))
        self.log.debug("Published metrics: {}".format(req))

    def run_publisher_worker(self, id: int) -> None:
        """Counter worker pool is responsible for listening to incr() requests and publish queue """
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
            self.exit.wait(1)

            for id, counter in self.counters:

                # We don't need to publish empty counters
                # run_reaper() will clean these up if they remain zero for a while
                if counter.val() > 0:
                    continue

                # Ensure a fresh copy of the CounterEntry
                entry = deepcopy(counter.entry)
                entry.value = counter.val()

                # Reset counter's value to 0
                counter.reset()

                # Put in the publish queue for a publisher worker to pick up
                self.publish_queue.put_nowait(entry)

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
            for id, counter in self.counters:
                if counter.val() > 0:
                    continue

                if (datetime.utcnow() - counter.last_updated).total_seconds() > 10:
                    self.remove_counter(id)
                    self.log.debug("reaped stale counter '{}'".format(id))

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
