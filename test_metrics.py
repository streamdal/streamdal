import metrics
import snitch_protos.protos as protos


def test_composite_id():
    entry = metrics.CounterEntry(
        name="test",
        rule_id="rule",
        ruleset_id="ruleset",
        labels={"test": "test", "id": "some-uuid", "unit": "bytes"},
        value=0.0,
        audience=protos.Audience()
    )
    assert metrics.composite_id(entry) == "test-some-uuid-bytes"


def test_new_counter():
    entry = metrics.CounterEntry(
        name="test",
        rule_id="rule",
        ruleset_id="ruleset",
        labels={},
        audience=protos.Audience()
    )

    m = metrics.Metrics()
    m.new_counter(entry)

    counter = m.get_counter(entry)

    assert len(m.counters) == 1
    assert counter is not None
    assert counter.entry.name == "test"


def test_incr_counter():
    entry = metrics.CounterEntry(
        name="test",
        rule_id="rule",
        ruleset_id="ruleset",
        labels={},
        audience=protos.Audience()
    )

    m = metrics.Metrics()
    c = m.new_counter(entry)

    c.incr(2)

    assert c.val() == 2.0

def test_incr_metrics():
    entry = metrics.CounterEntry(
        name="test",
        rule_id="rule",
        ruleset_id="ruleset",
        labels={},
        audience=protos.Audience(),
        value=3.0
    )

    m = metrics.Metrics()
    m.incr(entry=entry)

    c = m.get_counter(metrics.CounterEntry(
        name="test",
        rule_id="rule",
        ruleset_id="ruleset",
        labels={},
        audience=protos.Audience(),
    ))

    assert c.val() == 3.0


def test_flush_counter():
    pass


def test_flush_counters():
    pass


def test_publish_metrics():
    pass


def test_run_reaper():
    pass