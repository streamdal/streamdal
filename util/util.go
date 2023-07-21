package util

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/gofrs/uuid"
	"github.com/streamdal/snitch-protos/build/go/protos"
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

func CtxStringValue(ctx context.Context, key string) string {
	if ctx == nil {
		return ""
	}

	v, ok := ctx.Value(key).(string)
	if !ok {
		return ""
	}

	return v
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
