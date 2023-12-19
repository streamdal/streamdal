package types

import "github.com/streamdal/protos/build/go/protos"

type CounterName string

const (
	ConsumeBytes          CounterName = "counter_consume_bytes"
	ConsumeProcessedCount CounterName = "counter_consume_processed"
	ConsumeErrorCount     CounterName = "counter_consume_errors"
	ProduceBytes          CounterName = "counter_produce_bytes"
	ProduceProcessedCount CounterName = "counter_produce_processed"
	ProduceErrorCount     CounterName = "counter_produce_errors"
	NotifyCount           CounterName = "counter_notify"

	DroppedTailMessages CounterName = "counter_dropped_tail_messages"

	ConsumeBytesRate     CounterName = "counter_consume_bytes_rate"
	ProduceBytesRate     CounterName = "counter_produce_bytes_rate"
	ConsumeProcessedRate CounterName = "counter_consume_processed_rate"
	ProduceProcessedRate CounterName = "counter_produce_processed_rate"
)

type CounterEntry struct {
	Name     CounterName // counter name
	Audience *protos.Audience
	Labels   map[string]string
	Value    int64
}
