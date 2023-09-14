package types

type CounterName string

const (
	ConsumeBytes          CounterName = "counter_consume_bytes"
	ConsumeProcessedCount CounterName = "counter_consume_processed"
	ConsumeErrorCount     CounterName = "counter_consume_errors"
	ProduceBytes          CounterName = "counter_produce_bytes"
	ProduceProcessedCount CounterName = "counter_produce_processed"
	ProduceErrorCount     CounterName = "counter_produce_errors"
	NotifyCount           CounterName = "counter_notify"
	DroppedTailMessages   CounterName = "counter_dropped_tail_messages"
)

type CounterEntry struct {
	Name   CounterName // counter name
	Labels map[string]string
	Value  int64
}
