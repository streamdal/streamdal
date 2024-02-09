import asyncio
import threading
import time

import pytest
import streamdal_protos.protos as protos
from streamdal.metrics import Metrics, CounterEntry, Counter, composite_id
from threading import Event, Lock
from queue import SimpleQueue
from unittest.mock import AsyncMock, Mock


class TestMetrics:
    metrics: Metrics

    @pytest.fixture(autouse=True)
    def before_each(self):
        metrics = object.__new__(Metrics)
        metrics.exit = Event()
        metrics.counters = {}
        metrics.stub = AsyncMock()
        metrics.lock = Lock()
        metrics.publish_queue = SimpleQueue()
        metrics.incr_queue = SimpleQueue()
        metrics.log = Mock()

        self.metrics = metrics

    def test_composite_id(self):
        entry = CounterEntry(
            name="test",
            labels={"test": "test", "id": "some-uuid", "unit": "bytes"},
            value=0.0,
            aud=protos.Audience(),
        )
        assert composite_id(entry) == "test-test-some-uuid-bytes"

    def test_new_counter(self):
        entry = CounterEntry(
            name="test",
            labels={},
            aud=protos.Audience(),
        )

        self.metrics.new_counter(entry)

        counter = self.metrics.get_counter(entry)

        assert len(self.metrics.counters) == 1
        assert counter is not None
        assert counter.entry.name == "test"

    def test_incr_counter(self):
        entry = CounterEntry(
            name="test",
            labels={},
            aud=protos.Audience(),
        )

        c = self.metrics.new_counter(entry)
        c.incr(2)

        assert c.val() == 2.0

    def test_reset(self):
        entry = CounterEntry(
            name="test",
            labels={},
            aud=protos.Audience(),
        )

        counter = self.metrics.new_counter(entry)
        counter.incr(1.0)
        counter.incr(2.0)

        assert counter is not None
        assert len(self.metrics.counters) == 1
        assert counter.val() == 3.0

        counter.reset()

        assert counter.val() == 0.0

    def test_incr_metrics(self):
        worker = threading.Thread(
            target=self.metrics.run_incrementer_worker, args=(1,), daemon=False
        )
        worker.start()

        entry = CounterEntry(
            name="test", labels={"type": "bytes"}, value=3.0, aud=protos.Audience()
        )

        self.metrics.incr(entry=entry)

        # Allow inrcrementor worker time to pick up the job
        time.sleep(2)

        c = self.metrics.get_counter(
            CounterEntry(
                name="test",
                labels={"type": "bytes"},
                aud=protos.Audience(),
            )
        )

        self.metrics.exit.set()
        worker.join()

        assert c is not None
        assert c.val() == 3.0

    # TODO: fix broken test
    # def test_publish_metrics(self):
    #     fake_stub = AsyncMock()
    #     self.metrics.stub = fake_stub
    #     self.metrics.loop = asyncio.new_event_loop()
    #
    #     self.metrics.publish_metrics(
    #         entry=CounterEntry(
    #             name="test",
    #             labels={},
    #             value=1.0,
    #         )
    #     )
    #
    #     fake_stub.metrics.assert_called_once()

    def test_run_publisher(self):
        counter = Counter(
            entry=CounterEntry(name="test", labels={}, aud=protos.Audience()),
        )
        counter.incr(1.0)
        self.metrics.counters = {"test-test": counter}

        worker = threading.Thread(target=self.metrics.run_publisher, daemon=False)
        worker.start()

        time.sleep(2)
        self.metrics.exit.set()
        worker.join()

        assert self.metrics.publish_queue.qsize() == 1

    # TODO: fix broken test
    # def test_run_reaper(self):
    #     self.metrics.counters = {
    #         "test-test": Counter(
    #             entry=CounterEntry(name="test", pipeline_id="test", labels={}, audience=protos.Audience()),
    #         )
    #     }
    #
    #     assert len(self.metrics.counters) == 1
    #
    #     worker = threading.Thread(target=self.metrics.run_reaper, daemon=False)
    #     worker.start()
    #     #
    #     time.sleep(15)
    #     self.metrics.exit.set()
    #     worker.join()
    #
    #     assert len(self.metrics.counters) == 0
