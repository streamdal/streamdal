package util

import (
	"context"
	"fmt"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/grpc/metadata"
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

	return strings.ToLower(fmt.Sprintf("%s/%s/%s", audience.ServiceName, audience.ComponentName, audience.OperationType))
}

func AudienceFromStr(s string) *protos.Audience {
	if s == "" {
		return nil
	}

	parts := strings.Split(s, "/")
	if len(parts) != 3 {
		return nil
	}

	opType := protos.OperationType_OPERATION_TYPE_UNSET

	if parts[2] == strings.ToLower(protos.OperationType_OPERATION_TYPE_CONSUMER.String()) {
		opType = protos.OperationType_OPERATION_TYPE_CONSUMER
	} else {
		opType = protos.OperationType_OPERATION_TYPE_PRODUCER
	}

	return &protos.Audience{
		ServiceName:   strings.ToLower(parts[0]),
		ComponentName: strings.ToLower(parts[1]),
		OperationType: opType,
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
