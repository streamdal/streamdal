package util

import (
	"context"
	"fmt"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/grpc/metadata"

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

func AudienceToStr(audience *protos.Audience) string {
	if audience == nil {
		return ""
	}

	return strings.ToLower(fmt.Sprintf("%s/%s/%s/%s", audience.ServiceName, audience.OperationType, audience.OperationName, audience.ComponentName))
}

func AudienceFromStr(s string) *protos.Audience {
	if s == "" {
		return nil
	}

	parts := strings.Split(s, "/")
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

func ConvertConfigStrAudience(config map[*protos.Audience]string) map[string]string {
	if config == nil {
		return nil
	}

	m := map[string]string{}

	for k, v := range config {
		m[AudienceToStr(k)] = v
	}

	return m
}

func AudienceEquals(a, b *protos.Audience) bool {
	if a == nil || b == nil {
		return false
	}

	return AudienceToStr(a) == AudienceToStr(b)
}
