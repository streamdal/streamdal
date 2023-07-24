import time
from dataclasses import dataclass
import snitch_protos.protos as protos
from threading import Lock
from multiprocessing import Process
from queue import SimpleQueue
import asyncio
import logging
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


@dataclass(frozen=True)
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

    counters: dict[str:Counter] = {}
    stub: protos.InternalStub = None
    lock: Lock
    publish_queue: SimpleQueue = SimpleQueue()
    incr_queue: SimpleQueue = SimpleQueue()

    def __init__(self, **kwargs):
        if kwargs.get("stub") is None:
            raise ValueError("stub is required")

        self.stub = kwargs.get("stub")
        self.log = kwargs.get("log", logging.getLogger("snitch-client"))
        self.loop = asyncio.get_event_loop()
        self.lock = Lock()

        # Start publisher worker threads
        workers = {int: Process}
        for i in range(WORKER_POOL_SIZE):
            worker = Process(target=self.run_counter_worker_pool, args=(i+1,), daemon=False)
            worker.start()
            workers[i] = worker

        # Run counter incrementer. We use no blocking queue when increasing counters and then
        # this background thread does the actual incrementing. This is to avoid blocking the caller of incr()
        Process(target=self.run_incrementer, daemon=False).start()

        # Run counter reaper, this cleans up old empty counters to prevent memory leaks
        Process(target=self.run_reaper, daemon=False).start()

        # Run counter publisher. This reads values from counters,
        # adds them to the publish queue and then resets the counter.
        Process(target=self.run_publisher, daemon=False).start()


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



    # TODO: figure out if we can capture shutdown and force counters
    # TODO: flush before we exit the metrics service
    def shutdown(self) -> None:
        pass

    def publish_metrics(self, entry: CounterEntry) -> None:
        async def call(request: protos.MetricsRequest):
            await self.stub.metrics(request)

        req = protos.MetricsRequest()
        req.rule_id = entry.rule_id
        req.rule_name = entry.ruleset_id
        req.audience = entry.audience # TODO: implement
        req.metadata = None # TODO: what is this?

        self.loop.run_until_complete(call(req))
        self.log.debug("Published metrics: {}".format(req))

    def run_counter_worker_pool(self) -> None:
        """Counter worker pool is responsible for listening to incr() requests and flush requests"""
        while True:
            # Get entry from the queue. This is blocking to avoid having to handle queue.Empty exceptions
            entry = self.publish_queue.get(block=True)

            try:
                self.publish_metrics(entry)
            except Exception as e:
                self.log.error("Failed to publish metrics: {}".format(e))

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

    def run_reaper(self) -> None:
        """Reaper is a background task that prunes old counters from the internal map"""
        while True:
            # Sleep on startup and then and between each loop run
            time.sleep(DEFAULT_COUNTER_REAPER_INTERVAL)
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

    def run_incrementer(self) -> None:
        while True:
            # Blocking to avoid having to handle queue.Empty exceptions
            entry = self.incr_queue.get(block=True)

            counter = self.get_counter(entry)
            if counter is None:
                counter = self.new_counter(entry)
                counter.incr(entry.value)
            else:
                counter.incr(entry.value)