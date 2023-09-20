package util

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos/shared"
	"google.golang.org/grpc/metadata"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/wasm"
)

const (
	GRPCRequestIDMetadataKey = "request-id"
)

func GenerateUUID() string {
	v, err := uuid.NewV4()
	if err != nil {
		panic("unable to generate v4 uuid: " + err.Error())
	}

	return v.String()
}

// CtxMetadata will return a map[string]string of the metadata in the given context (if md exists).
// NOTE: Will use only first value in metadata value slice.
func CtxMetadata(ctx context.Context) map[string]string {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return map[string]string{}
	}

	m := map[string]string{}

	for k, v := range md {
		if len(v) < 1 {
			continue
		}

		m[k] = v[0]
	}

	return m
}

func CtxStringValue(ctx context.Context, key string) string {
	if ctx == nil {
		return ""
	}

	values := metadata.ValueFromIncomingContext(ctx, key)
	if len(values) == 0 {
		return ""
	}

	return values[0]
}

func CtxRequestId(ctx context.Context) string {
	return CtxStringValue(ctx, GRPCRequestIDMetadataKey)
}

func ParseConfigKey(key string) (*protos.Audience, string) {
	key = strings.TrimPrefix(key, "config:")
	parts := strings.Split(key, ":")
	if len(parts) < 5 {
		return nil, ""
	}

	audStr := strings.Join(parts[:len(parts)-1], ":")
	return AudienceFromStr(audStr), parts[len(parts)-1]
}

func AudienceToStr(audience *protos.Audience) string {
	if audience == nil {
		return ""
	}

	str := strings.ToLower(fmt.Sprintf("%s:%s:%s:%s", audience.ServiceName, audience.OperationType, audience.OperationName, audience.ComponentName))

	return str
}

// AudienceFromStr will parse a string into an Audience. If the string is invalid,
// nil will be returned.
func AudienceFromStr(s string) *protos.Audience {
	if s == "" {
		return nil
	}

	parts := strings.Split(s, ":")
	if len(parts) != 4 {
		return nil
	}

	opType := protos.OperationType_OPERATION_TYPE_UNSET

	if parts[1] == strings.ToLower(protos.OperationType_OPERATION_TYPE_CONSUMER.String()) {
		opType = protos.OperationType_OPERATION_TYPE_CONSUMER
	} else {
		opType = protos.OperationType_OPERATION_TYPE_PRODUCER
	}

	return &protos.Audience{
		ServiceName:   strings.ToLower(parts[0]),
		OperationType: opType,
		OperationName: strings.ToLower(parts[2]),
		ComponentName: strings.ToLower(parts[3]),
	}
}

func StandardResponse(ctx context.Context, code protos.ResponseCode, msg string) *protos.StandardResponse {
	reqId := CtxRequestId(ctx)

	return &protos.StandardResponse{
		Id:      reqId,
		Code:    code,
		Message: msg,
	}
}

func PopulateWASMFields(pipeline *protos.Pipeline, prefix string) error {
	if pipeline == nil {
		return errors.New("pipeline cannot be nil")
	}

	for _, s := range pipeline.Steps {
		var (
			mapping *wasm.Mapping
			err     error
		)

		// We can do this dynamically later
		switch s.Step.(type) {
		case *protos.PipelineStep_Detective:
			mapping, err = wasm.Load("detective", prefix)
		case *protos.PipelineStep_Transform:
			mapping, err = wasm.Load("transform", prefix)
		case *protos.PipelineStep_Kv:
			mapping, err = wasm.Load("kv", prefix)
		case *protos.PipelineStep_HttpRequest:
			mapping, err = wasm.Load("httprequest", prefix)
		default:
			return errors.Errorf("unknown pipeline step type: %T", s.Step)
		}

		if err != nil {
			return errors.Wrapf(err, "error loading '%T' WASM mapping", s.Step)
		}

		s.XWasmFunction = &mapping.FuncName
		s.XWasmBytes = mapping.Contents
		s.XWasmId = &mapping.ID
	}

	return nil
}

func StripWASMFields(pipeline *protos.Pipeline) {
	if pipeline == nil {
		return
	}

	for _, s := range pipeline.Steps {
		s.XWasmFunction = nil
		s.XWasmBytes = nil
	}
}

func StringPtr(in string) *string {
	return &in
}

func ConvertConfigStrAudience(config map[*protos.Audience][]string) map[string]string {
	if config == nil {
		return nil
	}

	m := map[string]string{}

	for k, v := range config {
		// TODO: update to support multiple pipelines per audience
		// TODO: this will require changes to frontend since the response will change
		m[AudienceToStr(k)] = v[0]
	}

	return m
}

func AudienceEquals(a, b *protos.Audience) bool {
	if a == nil || b == nil {
		return false
	}

	return AudienceToStr(a) == AudienceToStr(b)
}

// GenerateKVRequest is used for converting from plain KVObjects to instructions.
// This func is used to simplify transforming KV HTTP requests -> KV broadcast requests.
func GenerateKVRequest(action shared.KVAction, kvs []*protos.KVObject, overwrite bool) *protos.KVRequest {
	instructions := make([]*protos.KVInstruction, 0)

	for _, kv := range kvs {
		i := &protos.KVInstruction{
			Id:                       GenerateUUID(),
			Action:                   action,
			Object:                   kv,
			RequestedAtUnixTsNanoUtc: time.Now().UTC().UnixNano(),
		}

		instructions = append(instructions, i)
	}

	return &protos.KVRequest{
		Instructions: instructions,
		Overwrite:    overwrite,
	}
}

func CounterName(name string, labels map[string]string) string {
	vals := make([]string, 0)
	for k, v := range labels {
		vals = append(vals, fmt.Sprintf("%s-%s", k, v))
	}

	return fmt.Sprintf("%s-%s", name, strings.Join(vals, "-"))
}
