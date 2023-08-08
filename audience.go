package snitch

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

func (s *Snitch) addAudience(ctx context.Context, aud *protos.Audience) {
	// Don't need to add twice
	if s.seenAudience(ctx, aud) {
		return
	}

	s.audiencesMtx.Lock()
	if s.audiences == nil {
		s.audiences = make(map[string]struct{})
	}
	s.audiences[audToStr(aud)] = struct{}{}
	s.audiencesMtx.Unlock()

	// Run as goroutine to avoid blocking processing
	go func() {
		if err := s.serverClient.NewAudience(ctx, aud); err != nil {
			s.config.Logger.Errorf("failed to add audience: %s", err)
		}
	}()
}

func (s *Snitch) seenAudience(_ context.Context, aud *protos.Audience) bool {
	s.audiencesMtx.RLock()
	defer s.audiencesMtx.RUnlock()

	if s.audiences == nil {
		return false
	}

	_, ok := s.audiences[audToStr(aud)]
	return ok
}

func audToStr(aud *protos.Audience) string {
	if aud == nil {
		return ""
	}

	return fmt.Sprintf("%s:%s:%d:%s", aud.ServiceName, aud.ComponentName, aud.OperationType, aud.OperationName)
}

func strToAud(str string) *protos.Audience {
	if str == "" {
		return nil
	}

	parts := strings.Split(str, ":")
	if len(parts) != 4 {
		return nil
	}

	opType, err := strconv.Atoi(parts[2])
	if err != nil {
		return nil
	}

	return &protos.Audience{
		ServiceName:   parts[0],
		ComponentName: parts[1],
		OperationType: protos.OperationType(opType),
		OperationName: parts[3],
	}
}
