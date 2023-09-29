package snitch

import (
	"context"
	"sync"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/streamdal/snitch-go-client/logger/loggerfakes"
	"github.com/streamdal/snitch-go-client/server/serverfakes"
	"github.com/streamdal/snitch-protos/build/go/protos"
)

var _ = Describe("Audience", func() {
	Context("audToStr", func() {
		It("nil returns empty string", func() {
			Expect(audToStr(nil)).To(Equal(""))
		})

		It("returns correct string", func() {
			aud := &protos.Audience{
				ServiceName:   "mysvc1",
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "mytopic",
			}

			want := "mysvc1:kafka:2:mytopic"
			got := audToStr(aud)

			Expect(got).To(Equal(want))
		})
	})

	Context("strToAud", func() {
		It("empty string returns nil", func() {
			Expect(strToAud("")).To(BeNil())
		})

		It("returns correct string", func() {
			want := &protos.Audience{
				ServiceName:   "mysvc1",
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "mytopic",
			}
			got := strToAud("mysvc1:kafka:2:mytopic")

			Expect(got).To(Equal(want))
		})
	})

	Context("addAudience", func() {
		It("adds an audience", func() {
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

			Expect(fakeClient.NewAudienceCallCount()).To(Equal(1))
		})
	})

	Context("addAudiences", func() {
		It("calls to snitch server", func() {
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

			Expect(fakeClient.NewAudienceCallCount()).To(Equal(2))
		})
	})
})
