package notify

import (
	"encoding/json"

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

// operationTypeString makes protobuf type human readable
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
