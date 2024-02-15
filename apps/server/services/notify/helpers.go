package notify

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

// prettyJSON returns a pretty-printed JSON string
func prettyJSON(input []byte) string {
	if len(input) == 0 {
		return ""
	}

	payload := map[string]interface{}{}

	if err := json.Unmarshal(input, &payload); err != nil {
		return string(input)
	}

	pretty, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return string(input)
	}

	return string(pretty)
}

// operationTypeString makes protobuf type human-readable
func operationTypeString(ot protos.OperationType) string {
	switch ot {
	case protos.OperationType_OPERATION_TYPE_CONSUMER:
		return "Consumer"
	case protos.OperationType_OPERATION_TYPE_PRODUCER:
		return "Producer"
	default:
		return "Unknown"
	}
}

// metadataToString converts a metadata map to a human-readable string
func metadataToString(metadata map[string]string) string {
	if len(metadata) == 0 {
		return ""
	}

	var sb strings.Builder
	for k, v := range metadata {
		sb.WriteString(fmt.Sprintf("%s = %s\n", k, v))
	}
	return sb.String()
}

// conditionToString converts a step condition to a human-readable string
func conditionToString(req *protos.NotifyRequest) string {
	switch req.ConditionType {
	case protos.NotifyRequest_CONDITION_TYPE_ON_TRUE:
		return "on_true"
	case protos.NotifyRequest_CONDITION_TYPE_ON_FALSE:
		return "on_false"
	case protos.NotifyRequest_CONDITION_TYPE_ON_ERROR:
		return "on_error"
	default:
		return "unknown"
	}
}

// stepToString converts a step type to a human readable string
// TODO: expand this function with subtypes for transform, detective, and any others that have it
func stepToString(step *protos.PipelineStep) string {
	switch {
	case step.GetSchemaValidation() != nil:
		return "Schema Validation"
	case step.GetDetective() != nil:
		return "Detective"
	case step.GetHttpRequest() != nil:
		return "HTTP Request"
	case step.GetTransform() != nil:
		return "Transform"
	case step.GetEncode() != nil:
		return "Encode"
	case step.GetDecode() != nil:
		return "Decode"
	case step.GetValidJson() != nil:
		return "Valid JSON"
	case step.GetKv() != nil:
		return "KV"
	}

	return "Unknown Step Type"
}
