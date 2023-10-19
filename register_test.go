package streamdal

import (
	"context"
	"sync"

	"github.com/google/uuid"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/streamdal/protos/build/go/protos"
	"github.com/streamdal/protos/build/go/protos/shared"

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

	Context("attachPipeline", func() {
		It("should attach a pipeline", func() {
			s := &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    make(map[string]map[string]*protos.Command),
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
				},
			}

			err := s.attachPipeline(context.Background(), nil)
			Expect(err).To(Equal(ErrEmptyCommand))

			aud := &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			cmd := &protos.Command{
				Audience: aud,
				Command: &protos.Command_AttachPipeline{
					AttachPipeline: &protos.AttachPipelineCommand{
						Pipeline: &protos.Pipeline{
							Id: uuid.New().String(),
						},
					},
				},
			}

			err = s.attachPipeline(context.Background(), cmd)

			Expect(err).To(BeNil())
			Expect(len(s.pipelines)).To(Equal(1))
			Expect(len(s.pipelines[audToStr(aud)])).To(Equal(1))
		})
	})

	Context("detachPipeline", func() {
		It("should detach a pipeline", func() {
			pipelineID := uuid.New().String()

			s := &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    make(map[string]map[string]*protos.Command),
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
				},
			}

			err := s.detachPipeline(context.Background(), nil)
			Expect(err).To(Equal(ErrEmptyCommand))

			aud := &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			cmd := &protos.Command{
				Audience: aud,
				Command: &protos.Command_DetachPipeline{
					DetachPipeline: &protos.DetachPipelineCommand{
						PipelineId: pipelineID,
					},
				},
			}

			s.pipelines[audToStr(aud)] = make(map[string]*protos.Command)
			s.pipelines[audToStr(aud)][pipelineID] = cmd

			err = s.detachPipeline(context.Background(), cmd)

			Expect(err).To(BeNil())
			Expect(len(s.pipelines)).To(Equal(0))
		})
	})

	Context("pausePipeline", func() {
		It("should pause a pipeline", func() {
			pipelineID := uuid.New().String()

			s := &Streamdal{
				pipelinesPausedMtx: &sync.RWMutex{},
				pipelinesPaused:    make(map[string]map[string]*protos.Command),
				pipelinesMtx:       &sync.RWMutex{},
				pipelines:          make(map[string]map[string]*protos.Command),
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
				},
			}

			err := s.pausePipeline(context.Background(), nil)
			Expect(err).To(Equal(ErrEmptyCommand))

			aud := &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			attachCmd := &protos.Command{
				Audience: aud,
				Command: &protos.Command_AttachPipeline{
					AttachPipeline: &protos.AttachPipelineCommand{
						Pipeline: &protos.Pipeline{
							Id: pipelineID,
						},
					},
				},
			}

			if err := s.pausePipeline(context.Background(), attachCmd); err != ErrPipelineNotActive {

			}

			s.pipelines[audToStr(aud)] = make(map[string]*protos.Command)
			s.pipelines[audToStr(aud)][pipelineID] = attachCmd

			pauseCmd := &protos.Command{
				Audience: aud,
				Command: &protos.Command_PausePipeline{
					PausePipeline: &protos.PausePipelineCommand{
						PipelineId: pipelineID,
					},
				},
			}

			err = s.pausePipeline(context.Background(), pauseCmd)
			Expect(err).To(BeNil())

			Expect(len(s.pipelinesPaused)).To(Equal(1))
			Expect(len(s.pipelinesPaused[audToStr(aud)])).To(Equal(1))
			// It should no longer be in active pipeline map
			Expect(len(s.pipelines)).To(Equal(0))
		})
	})

	Context("resumePipeline", func() {
		It("should resume a pipeline", func() {
			pipelineID := uuid.New().String()

			s := &Streamdal{
				pipelinesPausedMtx: &sync.RWMutex{},
				pipelinesPaused:    make(map[string]map[string]*protos.Command),
				pipelinesMtx:       &sync.RWMutex{},
				pipelines:          make(map[string]map[string]*protos.Command),
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
				},
			}

			err := s.resumePipeline(context.Background(), nil)
			Expect(err).To(Equal(ErrEmptyCommand))

			aud := &protos.Audience{
				OperationName: "test-operation",
				ServiceName:   "test-service",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				ComponentName: "test-component",
			}

			resumeCmd := &protos.Command{
				Audience: aud,
				Command: &protos.Command_ResumePipeline{
					ResumePipeline: &protos.ResumePipelineCommand{
						PipelineId: pipelineID,
					},
				},
			}

			err = s.resumePipeline(context.Background(), resumeCmd)
			Expect(err).To(Equal(ErrPipelineNotPaused))

			attachCmd := &protos.Command{
				Audience: aud,
				Command: &protos.Command_AttachPipeline{
					AttachPipeline: &protos.AttachPipelineCommand{
						Pipeline: &protos.Pipeline{
							Id: pipelineID,
						},
					},
				},
			}

			s.pipelinesPaused[audToStr(aud)] = make(map[string]*protos.Command)
			s.pipelinesPaused[audToStr(aud)][pipelineID] = attachCmd

			err = s.resumePipeline(context.Background(), resumeCmd)
			Expect(err).To(BeNil())
			Expect(len(s.pipelines)).To(Equal(1))
			Expect(len(s.pipelines[audToStr(aud)])).To(Equal(1))
			// It should no longer be in paused pipeline map
			Expect(len(s.pipelinesPaused)).To(Equal(0))
		})
	})
})
