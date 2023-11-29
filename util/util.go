package util

import (
	"fmt"
	"strings"

	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/charmbracelet/log"
	"github.com/pkg/errors"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/cli/config"
	"github.com/streamdal/cli/types"
)

type stackTracer interface {
	StackTrace() errors.StackTrace
}

func AudienceEquals(a, b *protos.Audience) bool {
	if a == nil || b == nil {
		return false
	}

	return AudienceToStr(a) == AudienceToStr(b)
}

func AudienceToStr(audience *protos.Audience) string {
	if audience == nil {
		return ""
	}

	return strings.ToLower(fmt.Sprintf("%s:%s:%s:%s",
		audience.ServiceName,
		audience.OperationType,
		audience.OperationName,
		audience.ComponentName,
	))
}

func ContainsAudience(a *protos.Audience, b []*protos.Audience) bool {
	for _, aud := range b {
		if AudienceEquals(a, aud) {
			return true
		}
	}

	return false
}

func SelectedToTailComponent(name, desc string) *types.TailComponent {
	if name == "" || desc == "" {
		return nil
	}

	// We know that the description is going to be in the format:
	// fmt.Sprintf("[::b]%s[-:-:-] / [::b]%s / [::b]%s[-:-:-]", aud.ServiceName, aud.OperationType, aud.ComponentName)

	// Strip extra chars
	desc = strings.ReplaceAll(desc, "[::b]", "")
	desc = strings.ReplaceAll(desc, "[-:-:-]", "")
	desc = strings.ReplaceAll(desc, " ", "")

	splitDesc := strings.Split(desc, "/")

	if len(splitDesc) != 3 {
		return nil
	}

	// We know that the name is going to be the operation name
	return &types.TailComponent{
		Name:        name,
		Description: desc,
		Audience: &protos.Audience{
			ServiceName:   splitDesc[0],
			OperationName: name,
			OperationType: StrOperationTypeToProtos(splitDesc[1]),
			ComponentName: splitDesc[2],
		},
	}
}

// StrOperationTypeToProtos translates an operationType string to the proto enum
func StrOperationTypeToProtos(operationType string) protos.OperationType {
	switch operationType {
	case "consumer":
		return protos.OperationType_OPERATION_TYPE_CONSUMER
	case "producer":
		return protos.OperationType_OPERATION_TYPE_PRODUCER
	default:
		return protos.OperationType_OPERATION_TYPE_UNSET
	}
}

// ProtosOperationTypeToStr translates the proto enum to a human-readable string
func ProtosOperationTypeToStr(operationType protos.OperationType) string {
	switch operationType {
	case protos.OperationType_OPERATION_TYPE_CONSUMER:
		return "consumer"
	case protos.OperationType_OPERATION_TYPE_PRODUCER:
		return "producer"
	default:
		return ""
	}
}

func ReportErrorAndExit(t statsd.Statter, cfg *config.Config, err error) {
	tags := cfg.GetStatsdTags()

	if err, ok := err.(stackTracer); ok {
		stack := err.StackTrace()
		loc := fmt.Sprintf("%s:%d", stack[0], stack[0])
		tags = append(tags, statsd.Tag{"location", loc})
	}

	_ = t.Gauge(types.GaugeUptimeSeconds, 0, 1.0, tags...)
	_ = t.Inc(types.CounterErrorsTotal, 1, 1.0, tags...)
	_ = t.Close()
	log.Fatal(err)

}
