package types

type CounterType string
type CounterName string

const (
	CounterTypeCount CounterType = "count"
	CounterTypeBytes CounterType = "bytes"

	CounterPublish        CounterName = "publish"
	CounterConsume        CounterName = "consume"
	CounterSizeExceeded   CounterName = "size_exceeded"
	CounterRule           CounterName = "rule"
	CounterFailureTrigger CounterName = "failure_trigger"
)

type CounterEntry struct {
	Name      CounterName // counter name
	RuleID    string      // uuid of the rule
	RuleSetID string      // uuid of the rule set
	Type      CounterType // "count", "bytes"
	Labels    map[string]string
	Value     int64
}
