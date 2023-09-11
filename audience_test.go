package snitch

import (
	"context"
	"reflect"
	"sync"
	"testing"
	"time"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-go-client/server/serverfakes"
)

func TestAudToStr(t *testing.T) {
	t.Run("nil returns empty string", func(t *testing.T) {
		if audToStr(nil) != "" {
			t.Error("expected empty string")
		}
	})

	t.Run("returns correct string", func(t *testing.T) {
		aud := &protos.Audience{
			ServiceName:   "mysvc1",
			ComponentName: "kafka",
			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
			OperationName: "mytopic",
		}

		want := "mysvc1:kafka:2:mytopic"
		got := audToStr(aud)

		if want != got {
			t.Errorf("wanted: '%s', got: '%s'", want, got)
		}
	})
}

func TestStrToAud(t *testing.T) {
	t.Run("empty string returns nil", func(t *testing.T) {
		if strToAud("") != nil {
			t.Error("expected nil")
		}
	})

	t.Run("returns correct string", func(t *testing.T) {
		want := &protos.Audience{
			ServiceName:   "mysvc1",
			ComponentName: "kafka",
			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
			OperationName: "mytopic",
		}
		got := strToAud("mysvc1:kafka:2:mytopic")

		if got == nil {
			t.Error("expected non-nil")
		}

		if !reflect.DeepEqual(want, got) {
			t.Errorf("wanted: '%v', got: '%v'", want, got)
		}
	})
}

func TestSeenAudience(t *testing.T) {
	ctx := context.Background()

	s := &Snitch{
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
	}

	aud := &protos.Audience{
		ServiceName:   "mysvc1",
		ComponentName: "kafka",
		OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
		OperationName: "mytopic",
	}

	t.Run("empty audiences", func(t *testing.T) {
		if s.seenAudience(ctx, aud) != false {
			t.Error("expected false")
		}
	})

	t.Run("audience seen", func(t *testing.T) {
		s.audiences[audToStr(aud)] = struct{}{}

		if s.seenAudience(ctx, aud) != true {
			t.Error("expected true")
		}
	})
}

func TestAddAudience(t *testing.T) {
	ctx := context.Background()

	fakeClient := &serverfakes.FakeIServerClient{}

	s := &Snitch{
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
		serverClient: fakeClient,
	}

	aud := &protos.Audience{
		ServiceName:   "mysvc1",
		ComponentName: "kafka",
		OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
		OperationName: "mytopic",
	}

	s.addAudience(ctx, aud)

	// Allow time for goroutine to run
	time.Sleep(time.Millisecond * 500)

	if fakeClient.NewAudienceCallCount() != 1 {
		t.Error("expected NewAudience to be called")
	}
}
