from snitchpy.metrics import Metrics, CounterEntry, Counter, composite_id
import snitch_protos.protos as protos


def test_composite_id():
    entry = CounterEntry(
        name="test",
        rule_id="rule",
        ruleset_id="ruleset",
        labels={"test": "test", "id": "some-uuid", "unit": "bytes"},
        value=0.0,
        audience=protos.Audience()
    )
    assert composite_id(entry) == "test-some-uuid-bytes"


def test_new_counter():
    pass
    # entry = CounterEntry(
    #     name="test",
    #     rule_id="rule",
    #     ruleset_id="ruleset",
    #     labels={},
    #     audience=protos.Audience()
    # )
    #
    # m = Metrics()
    # m.new_counter(entry)
    #
    # counter = m.get_counter(entry)
    #
    # assert len(m.counters) == 1
    # assert counter is not None
    # assert counter.entry.name == "test"


def test_incr_counter():
    pass
    # entry = CounterEntry(
    #     name="test",
    #     rule_id="rule",
    #     ruleset_id="ruleset",
    #     labels={},
    #     audience=protos.Audience()
    # )
    #
    # m = Metrics()
    # c = m.new_counter(entry)
    #
    # c.incr(2)
    #
    # assert c.val() == 2.0

def test_incr_metrics():
    pass
    # entry = CounterEntry(
    #     name="test",
    #     rule_id="rule",
    #     ruleset_id="ruleset",
    #     labels={},
    #     audience=protos.Audience(),
    #     value=3.0
    # )
    #
    # m = Metrics()
    # m.incr(entry=entry)
    #
    # c = m.get_counter(CounterEntry(
    #     name="test",
    #     rule_id="rule",
    #     ruleset_id="ruleset",
    #     labels={},
    #     audience=protos.Audience(),
    # ))
    #
    # assert c.val() == 3.0


def test_flush_counter():
    pass


def test_flush_counters():
    pass


def test_publish_metrics():
    pass


def test_run_reaper():
    pass