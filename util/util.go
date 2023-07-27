package util

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/grpc/metadata"
)

const (
	GRPCRequestIDMetadataKey = "request-id"
)

var (
	SpaceRegex = regexp.MustCompile(`\s+`)
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

func AudienceStr(audience *protos.Audience) string {
	if audience == nil {
		return ""
	}

	return fmt.Sprintf("%s:%s:%s", audience.ServiceName, audience.ComponentName, audience.OperationType)
}

func NormalizeString(s string) string {
	s = strings.ToLower(s)
	return SpaceRegex.ReplaceAllString(s, "-")
}
