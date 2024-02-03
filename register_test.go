package streamdal

import (
	"context"
	"sync"

	"github.com/google/uuid"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"

	"github.com/streamdal/go-sdk/kv/kvfakes"
	"github.com/streamdal/go-sdk/logger/loggerfakes"
)

var _ = Describe("Register", func() {
	Context("handleKVCommand", func() {
		var s *Streamdal
		var fakeKV *kvfakes.FakeIKV

		BeforeEach(func() {
			fakeKV = &kvfakes.FakeIKV{}

			s = &Streamdal{
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
				},
				kv: fakeKV,
			}
		})

		It("should create a new key", func() {
			cmd := &protos.KVCommand{
				Instructions: []*protos.KVInstruction{
					{
						Id:     uuid.New().String(),
						Action: shared.KVAction_KV_ACTION_CREATE,
						Object: &protos.KVObject{
							Key:   "test-key",
							Value: []byte("test-value"),
						},
					},
				},
				Overwrite: false,
			}

			err := s.handleKVCommand(context.Background(), cmd)
			Expect(err).To(BeNil())
			Expect(fakeKV.SetCallCount()).To(Equal(1))
		})

		It("should delete a key", func() {
			cmd := &protos.KVCommand{
				Instructions: []*protos.KVInstruction{
					{
						Id:     uuid.New().String(),
						Action: shared.KVAction_KV_ACTION_DELETE,
						Object: &protos.KVObject{
							Key: "test-key",
						},
					},
				},
			}

			err := s.handleKVCommand(context.Background(), cmd)

			Expect(err).To(BeNil())
			Expect(fakeKV.DeleteCallCount()).To(Equal(1))
		})

		It("should purge all keys", func() {
			cmd := &protos.KVCommand{
				Instructions: []*protos.KVInstruction{
					{
						Id:     uuid.New().String(),
						Action: shared.KVAction_KV_ACTION_DELETE_ALL,
					},
				},
			}

			err := s.handleKVCommand(context.Background(), cmd)

			Expect(err).To(BeNil())
			Expect(fakeKV.PurgeCallCount()).To(Equal(1))
		})
	})

	Context("setPipelines", func() {
		It("should save pipelines", func() {
			s := &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    make(map[string][]*protos.Pipeline),
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
				},
			}

			err := s.setPipelines(context.Background(), nil)
			Expect(err).To(Equal(ErrEmptyCommand))

			aud := &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			cmd := &protos.Command{
				Audience: aud,
				Command: &protos.Command_SetPipelines{
					SetPipelines: &protos.SetPipelinesCommand{
						Pipelines: []*protos.Pipeline{
							{
								Id: uuid.New().String(),
							},
						},
					},
				},
			}

			err = s.setPipelines(context.Background(), cmd)

			Expect(err).To(BeNil())
			Expect(len(s.pipelines)).To(Equal(1))
			Expect(len(s.pipelines[audToStr(aud)])).To(Equal(1))
		})
	})

	Context("handleCommand", func() {
		var s *Streamdal
		var fakeLogger *loggerfakes.FakeLogger

		BeforeEach(func() {
			fakeLogger = &loggerfakes.FakeLogger{}
			s = &Streamdal{
				config: &Config{
					ServiceName: "test-service",
					Logger:      fakeLogger,
				},
			}
		})

		It("safely handles nil command", func() {
			err := s.handleCommand(context.Background(), nil)
			Expect(err).To(BeNil())
			Expect(fakeLogger.DebugCallCount()).To(Equal(1))
		})

		It("safely handles keep-alives", func() {
			err := s.handleCommand(context.Background(), &protos.Command{
				Command: &protos.Command_KeepAlive{
					KeepAlive: &protos.KeepAliveCommand{},
				},
			})

			Expect(err).To(BeNil())
			Expect(fakeLogger.DebugCallCount()).To(Equal(1))
		})

		It("ignores commands with invalid service name", func() {
			err := s.handleCommand(context.Background(), &protos.Command{
				Audience: &protos.Audience{
					ServiceName: "invalid-service",
				},
			})

			Expect(err).To(BeNil())
			Expect(fakeLogger.DebugfCallCount()).To(Equal(1))
		})
	})
})
