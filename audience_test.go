package snitch

import (
	"context"
	"reflect"
	"sync"
	"testing"
	"time"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-go-client/logger/loggerfakes"
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

func TestAddAudience(t *testing.T) {
	ctx := context.Background()

	fakeClient := &serverfakes.FakeIServerClient{}

	s := &Snitch{
		audiencesMtx: &sync.RWMutex{},
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

func TestAddAudiences(t *testing.T) {
	ctx := context.Background()

	fakeClient := &serverfakes.FakeIServerClient{}

	s := &Snitch{
		config: &Config{
			Logger: &loggerfakes.FakeLogger{},
		},
		audiencesMtx: &sync.RWMutex{},
		audiences: map[string]struct{}{
			audToStr(&protos.Audience{
				ServiceName:   "mysvc1",
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "mytopic",
			}): {},
			audToStr(&protos.Audience{
				ServiceName:   "mysvc2",
				ComponentName: "rabbitmq",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "events.orders.#",
			}): {},
			"bad-audience": {},
		},
		serverClient: fakeClient,
	}
	s.addAudiences(ctx)

	// Allow time for goroutine to run
	time.Sleep(time.Second)

	callCount := fakeClient.NewAudienceCallCount()
	if callCount != 2 {
		t.Errorf("expected NewAudience to be called 2 times, actual was '%d'", callCount)
	}
}
