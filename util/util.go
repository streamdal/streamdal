package util

import (
	"fmt"
	"strings"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

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
