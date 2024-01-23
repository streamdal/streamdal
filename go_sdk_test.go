package streamdal

import (
	"context"
	"fmt"
	"net"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"

	"github.com/streamdal/go-sdk/hostfunc"
	"github.com/streamdal/go-sdk/kv"
	"github.com/streamdal/go-sdk/logger"
	"github.com/streamdal/go-sdk/logger/loggerfakes"
	"github.com/streamdal/go-sdk/metrics/metricsfakes"
	"github.com/streamdal/go-sdk/server/serverfakes"
)

type InternalServer struct {
	// Must be implemented in order to satisfy the protos InternalServer interface
	protos.UnimplementedInternalServer
}

func (i *InternalServer) GetAttachCommandsByService(ctx context.Context, req *protos.GetAttachCommandsByServiceRequest) (*protos.GetAttachCommandsByServiceResponse, error) {
	return &protos.GetAttachCommandsByServiceResponse{}, nil
}

func (i *InternalServer) SendTail(srv protos.Internal_SendTailServer) error {
	return nil
}

func (i *InternalServer) Register(req *protos.RegisterRequest, srv protos.Internal_RegisterServer) error {
	for {
		if err := srv.Send(&protos.Command{}); err != nil {
			return errors.Wrap(err, "unable to send cmd")
		}
	}
}

var _ = Describe("Streamdal", func() {
	Context("validateConfig", func() {
		var cfg *Config

		BeforeEach(func() {
			cfg = &Config{
				ServiceName: "service",
				ShutdownCtx: context.Background(),
				ServerURL:   "http://localhost:8082",
				ServerToken: "foo",
				DryRun:      false,
				StepTimeout: 0,
				Logger:      &logger.TinyLogger{},
			}
		})

		It("should return error if config is nil", func() {
			err := validateConfig(nil)
			Expect(err).To(HaveOccurred())
			Expect(err).To(Equal(ErrEmptyConfig))
		})

		It("should error on empty service name", func() {
			cfg.ServiceName = ""
			err := validateConfig(cfg)
			Expect(err).To(HaveOccurred())
			Expect(err).To(Equal(ErrEmptyServiceName))
		})

		It("should error on missing shutdown context", func() {
			cfg.ShutdownCtx = nil
			err := validateConfig(cfg)
			Expect(err).To(HaveOccurred())
			Expect(err).To(Equal(ErrMissingShutdownCtx))
		})

		It("should error on invalid step timeout duration", func() {
			_ = os.Setenv("STREAMDAL_STEP_TIMEOUT", "foo")
			err := validateConfig(cfg)
			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("unable to parse StepTimeout"))
			_ = os.Unsetenv("STREAMDAL_STEP_TIMEOUT")
		})
	})

	Context("toProto", func() {
		It("should convert public Audience struct to protobuf version", func() {
			audPublic := Audience{
				ComponentName: "test-component",
				OperationType: OperationTypeProducer,
				OperationName: "test-operation",
			}

			audProto := audPublic.toProto("service")
			Expect(audProto.ServiceName).To(Equal("service"))
			Expect(audProto.ComponentName).To(Equal(audPublic.ComponentName))
			Expect(audProto.OperationType).To(Equal(protos.OperationType_OPERATION_TYPE_PRODUCER))
			Expect(audProto.OperationName).To(Equal(audPublic.OperationName))
		})
	})

	Context("New", func() {
		It("returns a new instance of Streamdal", func() {
			lis, err := net.Listen("tcp", ":18082")
			Expect(err).ToNot(HaveOccurred())

			srv := grpc.NewServer()
			protos.RegisterInternalServer(srv, &InternalServer{})

			go func() {
				if err := srv.Serve(lis); err != nil {
					panic("failed to serve: " + err.Error())
				}
			}()

			// Give gRPC a moment to startup
			time.Sleep(time.Second)

			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			cfg := &Config{
				ServiceName: "mysvc1",
				ShutdownCtx: ctx,
				ServerURL:   "localhost:18082",
				ServerToken: "foo",
				DryRun:      false,
				Logger:      &loggerfakes.FakeLogger{},
			}

			_, err = New(cfg)
			Expect(err).ToNot(HaveOccurred())
		})
	})

	Context("getPipelines", func() {
		ctx := context.Background()

		fakeClient := &serverfakes.FakeIServerClient{}

		s := &Streamdal{
			pipelinesMtx: &sync.RWMutex{},
			pipelines:    map[string]map[string]*protos.Command{},
			serverClient: fakeClient,
			audiencesMtx: &sync.RWMutex{},
			audiences:    map[string]struct{}{},
		}

		aud := &protos.Audience{
			ServiceName:   "mysvc1",
			ComponentName: "kafka",
			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
			OperationName: "mytopic",
		}

		It("returns no pipelines bur announces the audience", func() {
			pipelines := s.getPipelines(ctx, aud)
			Expect(len(pipelines)).To(Equal(0))

			// Allow time for goroutine to run
			time.Sleep(time.Millisecond * 500)

			// Audience should be created on the server
			Expect(fakeClient.NewAudienceCallCount()).To(Equal(1))
		})

		It("returns a single pipeline", func() {
			s.pipelines[audToStr(aud)] = map[string]*protos.Command{
				uuid.New().String(): {},
			}
			Expect(len(s.getPipelines(ctx, aud))).To(Equal(1))
		})
	})

	Context("handleConditions", func() {
		var fakeClient *serverfakes.FakeIServerClient
		var s *Streamdal
		var pipeline *protos.Pipeline
		var step *protos.PipelineStep
		var aud *protos.Audience
		var req *ProcessRequest

		BeforeEach(func() {
			fakeClient = &serverfakes.FakeIServerClient{}

			s = &Streamdal{
				serverClient: fakeClient,
				metrics:      &metricsfakes.FakeIMetrics{},
				config: &Config{
					Logger: &loggerfakes.FakeLogger{},
					DryRun: false,
				},
			}

			aud = &protos.Audience{}
			pipeline = &protos.Pipeline{}
			step = &protos.PipelineStep{}
			req = &ProcessRequest{}
		})

		FIt("handles notify condition", func() {
			condition := &protos.PipelineStepConditions{
				Notify: true,
			}
			//conditions := []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_NOTIFY}

			cond := s.handleCondition(context.Background(), req, &ProcessResponse{}, condition, step, pipeline, aud)
			//cond := s.handleCondition(context.Background(), conditions, pipeline, step, aud, req)
			Expect(cond.abortCondition).To(Equal(protos.AbortCondition_ABORT_CONDITION_UNSET))
			Expect(fakeClient.NotifyCallCount()).To(Equal(1))
		})

		//It("handles abort condition", func() {
		//	conditions := []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT_CURRENT}
		//
		//	cond := s.handleConditions(context.Background(), conditions, pipeline, step, aud, req)
		//	Expect(cond.continuePipeline).To(BeFalse())
		//})
	})

	//Context("Process", func() {
	//	It("return error when process request is nil", func() {
	//		s := &Streamdal{}
	//		resp := s.Process(context.Background(), nil)
	//		Expect(resp.Error).To(BeTrue())
	//		Expect(resp.ErrorMessage).To(ContainSubstring(ErrEmptyProcessRequest.Error()))
	//		Expect(len(resp.PipelineStatus)).To(Equal(0))
	//	})
	//
	//	It("processes successfully", func() {
	//		aud := &protos.Audience{
	//			ServiceName:   "mysvc1",
	//			ComponentName: "kafka",
	//			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
	//			OperationName: "mytopic",
	//		}
	//
	//		wasmData, err := os.ReadFile("test-assets/wasm/detective.wasm")
	//		Expect(err).ToNot(HaveOccurred())
	//
	//		pipeline := &protos.Pipeline{
	//			Id:   uuid.New().String(),
	//			Name: "Test Pipeline",
	//			Steps: []*protos.PipelineStep{
	//				{
	//					Name:          "Step 1",
	//					XWasmId:       stringPtr(uuid.New().String()),
	//					XWasmBytes:    wasmData,
	//					XWasmFunction: stringPtr("f"),
	//					OnSuccess:     make([]protos.PipelineStepCondition, 0),
	//					OnFailure:     []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT_CURRENT},
	//					Step: &protos.PipelineStep_Detective{
	//						Detective: &steps.DetectiveStep{
	//							Path:   stringPtr("object.payload"),
	//							Args:   []string{"gmail.com"},
	//							Negate: boolPtr(false),
	//							Type:   steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
	//						},
	//					},
	//				},
	//			},
	//		}
	//
	//		s := &Streamdal{
	//			serverClient: &serverfakes.FakeIServerClient{},
	//			functionsMtx: &sync.RWMutex{},
	//			functions:    map[string]*function{},
	//			audiencesMtx: &sync.RWMutex{},
	//			audiences:    map[string]struct{}{},
	//			tails:        map[string]map[string]*Tail{},
	//			tailsMtx:     &sync.RWMutex{},
	//			config: &Config{
	//				ServiceName:     "mysvc1",
	//				Logger:          &logger.TinyLogger{},
	//				StepTimeout:     time.Millisecond * 10,
	//				PipelineTimeout: time.Millisecond * 100,
	//			},
	//			metrics:      &metricsfakes.FakeIMetrics{},
	//			pipelinesMtx: &sync.RWMutex{},
	//			pipelines: map[string]map[string]*protos.Command{
	//				audToStr(aud): {
	//					pipeline.Id: {
	//						Audience: aud,
	//						Command: &protos.Command_AttachPipeline{
	//							AttachPipeline: &protos.AttachPipelineCommand{
	//								Pipeline: pipeline,
	//							},
	//						},
	//					},
	//				},
	//			},
	//		}
	//
	//		resp := s.Process(context.Background(), &ProcessRequest{
	//			ComponentName: aud.ComponentName,
	//			OperationType: OperationType(aud.OperationType),
	//			OperationName: aud.OperationName,
	//			Data:          []byte(`{"object":{"payload":"streamdal@gmail.com"}`),
	//		})
	//		Expect(resp.Error).To(BeFalse())
	//		Expect(resp.ErrorMessage).To(Equal(""))
	//		Expect(len(resp.PipelineStatus)).To(Equal(1))
	//		Expect(len(resp.PipelineStatus[0].StepStatus)).To(Equal(1))
	//	})
	//
	//	It("fails on a detective match and aborts entire pipeline", func() {
	//		aud := &protos.Audience{
	//			ServiceName:   "mysvc1",
	//			ComponentName: "kafka",
	//			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
	//			OperationName: "mytopic",
	//		}
	//
	//		wasmData, err := os.ReadFile("test-assets/wasm/detective.wasm")
	//		Expect(err).ToNot(HaveOccurred())
	//
	//		pipeline := &protos.Pipeline{
	//			Id:   uuid.New().String(),
	//			Name: "Test Pipeline",
	//			Steps: []*protos.PipelineStep{
	//				{
	//					Name:          "Step 1",
	//					XWasmId:       stringPtr(uuid.New().String()),
	//					XWasmBytes:    wasmData,
	//					XWasmFunction: stringPtr("f"),
	//					OnSuccess:     make([]protos.PipelineStepCondition, 0),
	//					OnFailure:     []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT_ALL},
	//					Step: &protos.PipelineStep_Detective{
	//						Detective: &steps.DetectiveStep{
	//							Path:   stringPtr("object.payload"),
	//							Args:   []string{"gmail.com"},
	//							Negate: boolPtr(false),
	//							Type:   steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
	//						},
	//					},
	//				},
	//				{
	//					Name:          "Step 2",
	//					XWasmId:       stringPtr(uuid.New().String()),
	//					XWasmBytes:    wasmData,
	//					XWasmFunction: stringPtr("f"),
	//					OnSuccess:     make([]protos.PipelineStepCondition, 0),
	//					OnFailure:     []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT_ALL},
	//					Step: &protos.PipelineStep_Detective{
	//						Detective: &steps.DetectiveStep{
	//							Path:   stringPtr("object.payload"),
	//							Args:   []string{"gmail.com"},
	//							Negate: boolPtr(false),
	//							Type:   steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
	//						},
	//					},
	//				},
	//			},
	//		}
	//
	//		s := &Streamdal{
	//			serverClient: &serverfakes.FakeIServerClient{},
	//			functionsMtx: &sync.RWMutex{},
	//			functions:    map[string]*function{},
	//			audiencesMtx: &sync.RWMutex{},
	//			audiences:    map[string]struct{}{},
	//			config: &Config{
	//				ServiceName:     "mysvc1",
	//				Logger:          &logger.TinyLogger{},
	//				StepTimeout:     time.Millisecond * 10,
	//				PipelineTimeout: time.Millisecond * 100,
	//			},
	//			metrics:      &metricsfakes.FakeIMetrics{},
	//			tails:        map[string]map[string]*Tail{},
	//			tailsMtx:     &sync.RWMutex{},
	//			pipelinesMtx: &sync.RWMutex{},
	//			pipelines: map[string]map[string]*protos.Command{
	//				audToStr(aud): {
	//					pipeline.Id: {
	//						Audience: aud,
	//						Command: &protos.Command_AttachPipeline{
	//							AttachPipeline: &protos.AttachPipelineCommand{
	//								Pipeline: pipeline,
	//							},
	//						},
	//					},
	//				},
	//			},
	//		}
	//
	//		resp := s.Process(context.Background(), &ProcessRequest{
	//			ComponentName: aud.ComponentName,
	//			OperationType: OperationType(aud.OperationType),
	//			OperationName: aud.OperationName,
	//			Data:          []byte(`{"object":{"payload":"streamdal@hotmail.com"}}`),
	//		})
	//		Expect(resp.Error).To(BeTrue())
	//		Expect(resp.ErrorMessage).To(ContainSubstring("Step failed"))
	//		Expect(len(resp.PipelineStatus)).To(Equal(1))
	//		Expect(len(resp.PipelineStatus[0].StepStatus)).To(Equal(1))
	//		Expect(resp.PipelineStatus[0].StepStatus[0].AbortStatus).To(Equal(protos.AbortStatus_ABORT_STATUS_ALL))
	//	})
	//})
	//
	//Context("Multithreaded test", func() {
	//	It("succeeds with multiple threads", func() {
	//
	//		aud := &protos.Audience{
	//			ServiceName:   "mysvc1",
	//			ComponentName: "kafka",
	//			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
	//			OperationName: "mytopic",
	//		}
	//
	//		wasmDetective, err := os.ReadFile("test-assets/wasm/detective.wasm")
	//		Expect(err).ToNot(HaveOccurred())
	//
	//		transformDetective, err := os.ReadFile("test-assets/wasm/transform.wasm")
	//		Expect(err).ToNot(HaveOccurred())
	//
	//		pipeline := &protos.Pipeline{
	//			Id:   uuid.New().String(),
	//			Name: "Multithreaded Test Pipeline",
	//			Steps: []*protos.PipelineStep{
	//				{
	//					Name:          "Multithreaded - Detective Step",
	//					XWasmId:       stringPtr(uuid.New().String()),
	//					XWasmBytes:    wasmDetective,
	//					XWasmFunction: stringPtr("f"),
	//					OnSuccess:     make([]protos.PipelineStepCondition, 0),
	//					OnFailure:     []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT_ALL},
	//					Step: &protos.PipelineStep_Detective{
	//						Detective: &steps.DetectiveStep{
	//							Path:   stringPtr("object.payload"),
	//							Args:   []string{".com"},
	//							Negate: boolPtr(false),
	//							Type:   steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
	//						},
	//					},
	//				},
	//				{
	//					Name:          "Multithreaded - Transform Step",
	//					XWasmId:       stringPtr(uuid.New().String()),
	//					XWasmBytes:    transformDetective,
	//					XWasmFunction: stringPtr("f"),
	//					OnSuccess:     make([]protos.PipelineStepCondition, 0),
	//					OnFailure:     []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT_ALL},
	//					Step: &protos.PipelineStep_Transform{
	//						Transform: &steps.TransformStep{
	//							Path: "object.payload",
	//							Type: steps.TransformType_TRANSFORM_TYPE_MASK_VALUE,
	//							Options: &steps.TransformStep_MaskOptions{
	//								MaskOptions: &steps.TransformMaskOptions{
	//									Path: "object.payload",
	//									Mask: "*",
	//								},
	//							},
	//						},
	//					},
	//				},
	//			},
	//		}
	//
	//		s := &Streamdal{
	//			serverClient: &serverfakes.FakeIServerClient{},
	//			functionsMtx: &sync.RWMutex{},
	//			functions:    map[string]*function{},
	//			audiencesMtx: &sync.RWMutex{},
	//			audiences:    map[string]struct{}{},
	//			tails:        map[string]map[string]*Tail{},
	//			tailsMtx:     &sync.RWMutex{},
	//			config: &Config{
	//				ServiceName:     "mysvc1",
	//				Logger:          &logger.TinyLogger{},
	//				StepTimeout:     time.Millisecond * 100,
	//				PipelineTimeout: time.Minute, // Due to mutex, this should be longer than the entire test will take under CI
	//				DryRun:          false,
	//			},
	//			metrics:      &metricsfakes.FakeIMetrics{},
	//			pipelinesMtx: &sync.RWMutex{},
	//			pipelines: map[string]map[string]*protos.Command{
	//				audToStr(aud): {
	//					pipeline.Id: {
	//						Audience: aud,
	//						Command: &protos.Command_AttachPipeline{
	//							AttachPipeline: &protos.AttachPipelineCommand{
	//								Pipeline: pipeline,
	//							},
	//						},
	//					},
	//				},
	//			},
	//		}
	//
	//		payload := []byte(`{"object":{"payload":"streamdal@gmail.com"}}`)
	//
	//		// Run 100 requests in parallel
	//		wg := &sync.WaitGroup{}
	//		for i := 0; i < 100; i++ {
	//			wg.Add(1)
	//			go func() {
	//				defer GinkgoRecover()
	//				defer wg.Done()
	//				resp := s.Process(context.Background(), &ProcessRequest{
	//					ComponentName: aud.ComponentName,
	//					OperationType: OperationType(aud.OperationType),
	//					OperationName: aud.OperationName,
	//					Data:          payload,
	//				})
	//
	//				Expect(resp.Error).To(BeFalse())
	//				Expect(resp).To(BeAssignableToTypeOf(&ProcessResponse{}))
	//				Expect(len(resp.PipelineStatus)).To(Equal(1))
	//				Expect(len(resp.PipelineStatus[0].StepStatus)).To(Equal(2))
	//				Expect(resp.PipelineStatus[0].StepStatus[0].Error).To(BeFalse())
	//				Expect(resp.PipelineStatus[0].StepStatus[1].Error).To(BeFalse())
	//				Expect(resp.PipelineStatus[0].StepStatus[0].AbortStatus).To(Equal(protos.AbortStatus_ABORT_STATUS_UNSET))
	//				Expect(resp.PipelineStatus[0].StepStatus[1].AbortStatus).To(Equal(protos.AbortStatus_ABORT_STATUS_UNSET))
	//				Expect(string(resp.Data)).To(Equal(`{"object":{"payload":"stre***************"}}`))
	//			}()
	//		}
	//
	//		wg.Wait()
	//	})
	//})
})

func createStreamdalClient() (*Streamdal, *kv.KV, error) {
	kvClient, err := kv.New(&kv.Config{})
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to create kv client")
	}

	hfClient, err := hostfunc.New(kvClient, &logger.TinyLogger{})
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to create hostfunc client")
	}

	return &Streamdal{
		pipelinesMtx: &sync.RWMutex{},
		pipelines:    map[string]map[string]*protos.Command{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
		kv:           kvClient,
		hf:           hfClient,
	}, kvClient, nil
}

func createWASMRequestForKV(action shared.KVAction, key string, value []byte, mode steps.KVMode) (*protos.WASMRequest, error) {
	wasmData, err := os.ReadFile("test-assets/wasm/kv.wasm")
	if err != nil {
		return nil, errors.Wrap(err, "unable to read wasm file")
	}

	// Caller should overwrite whatever fields they need to
	return &protos.WASMRequest{
		Step: &protos.PipelineStep{
			Step: &protos.PipelineStep_Kv{
				Kv: &steps.KVStep{
					Action: action,
					Mode:   mode,
					Key:    key,
					Value:  value,
				},
			},
			XWasmId:       stringPtr(uuid.New().String()),
			XWasmFunction: stringPtr("f"),
			XWasmBytes:    wasmData,
		},
		InputPayload: nil,
	}, nil
}

func TestKVRequestStaticModeKeyDoesNotExist(t *testing.T) {
	key := "does-not-exist"

	req, err := createWASMRequestForKV(shared.KVAction_KV_ACTION_EXISTS, key, nil, steps.KVMode_KV_MODE_STATIC)
	if err != nil {
		t.Fatalf("unable to create WASMRequest for kv test: %s", err)
	}

	sdClient, _, err := createStreamdalClient()
	if err != nil {
		t.Fatalf("unable to create client for kv test: %s", err)
	}

	// Create WASM func from request
	f, err := sdClient.createFunction(req.Step)
	if err != nil {
		t.Fatalf("unable to create func: %s", err)
	}

	// Function already created from WASM bytes, no need to pass it again (and consume extra WASM mem)
	req.Step.XWasmBytes = nil

	data, err := proto.Marshal(req)
	if err != nil {
		t.Fatalf("Unable to marshal WASMRequest: %s", err)
	}

	// Exec WASM func; should receive WASMResponse{}
	res, err := f.Exec(context.Background(), data)
	if err != nil {
		t.Fatalf("unable to exec WASM func: %s", err)
	}

	wasmResp := &protos.WASMResponse{}

	if err := proto.Unmarshal(res, wasmResp); err != nil {
		t.Fatal("unable to unmarshal wasm response: " + err.Error())
	}

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_FALSE {
		t.Errorf("expected ExitCode = %d, got = %d; exit_msg: %s",
			protos.WASMExitCode_WASM_EXIT_CODE_FALSE,
			wasmResp.ExitCode,
			wasmResp.ExitMsg,
		)
	}

	expectedMsg := fmt.Sprintf("key '%s' does not exist", key)

	if !strings.Contains(wasmResp.ExitMsg, expectedMsg) {
		t.Errorf("expected ExitMsg to contain '%s', got = %s", expectedMsg, wasmResp.ExitMsg)
	}
}

func TestKVRequestDynamicModeKeyExists(t *testing.T) {
	key := "object.foo"

	req, err := createWASMRequestForKV(shared.KVAction_KV_ACTION_EXISTS, key, nil, steps.KVMode_KV_MODE_DYNAMIC)
	if err != nil {
		t.Fatalf("unable to create WASMRequest for kv test: %s", err)
	}

	// This should cause lookup to use "bar" for key
	req.InputPayload = []byte(`{"object":{"foo":"bar"}}"`)

	sdClient, kvClient, err := createStreamdalClient()
	if err != nil {
		t.Fatalf("unable to create client for kv test: %s", err)
	}

	kvClient.Set("bar", "")

	// Create WASM func from request
	f, err := sdClient.createFunction(req.Step)
	if err != nil {
		t.Fatalf("unable to create func: %s", err)
	}

	// Function already created from WASM bytes, no need to pass it again (and consume extra WASM mem)
	req.Step.XWasmBytes = nil

	data, err := proto.Marshal(req)
	if err != nil {
		t.Fatalf("Unable to marshal WASMRequest: %s", err)
	}

	// Exec WASM func; should receive WASMResponse{}
	res, err := f.Exec(context.Background(), data)
	if err != nil {
		t.Fatalf("unable to exec WASM func: %s", err)
	}

	wasmResp := &protos.WASMResponse{}

	if err := proto.Unmarshal(res, wasmResp); err != nil {
		t.Fatal("unable to unmarshal wasm response: " + err.Error())
	}

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_TRUE {
		t.Errorf("expected ExitCode = %d, got = %d; exit_msg: %s",
			protos.WASMExitCode_WASM_EXIT_CODE_TRUE,
			wasmResp.ExitCode,
			wasmResp.ExitMsg,
		)
	}

	expectedMsg := "key 'bar' exists"

	if !strings.Contains(wasmResp.ExitMsg, expectedMsg) {
		t.Errorf("expected ExitMsg to contain '%s', got = %s", expectedMsg, wasmResp.ExitMsg)
	}
}

func TestKVRequestDynamicModeKeyDoesNotExist(t *testing.T) {
	key := "object.foo"

	req, err := createWASMRequestForKV(shared.KVAction_KV_ACTION_EXISTS, key, nil, steps.KVMode_KV_MODE_DYNAMIC)
	if err != nil {
		t.Fatalf("unable to create WASMRequest for kv test: %s", err)
	}

	req.InputPayload = []byte(`{"object":{"foo":"bar"}}"`)

	sdClient, _, err := createStreamdalClient()
	if err != nil {
		t.Fatalf("unable to create client for kv test: %s", err)
	}

	// Create WASM func from request
	f, err := sdClient.createFunction(req.Step)
	if err != nil {
		t.Fatalf("unable to create func: %s", err)
	}

	// Function already created from WASM bytes, no need to pass it again (and consume extra WASM mem)
	req.Step.XWasmBytes = nil

	data, err := proto.Marshal(req)
	if err != nil {
		t.Fatalf("Unable to marshal WASMRequest: %s", err)
	}

	// Exec WASM func; should receive WASMResponse{}
	res, err := f.Exec(context.Background(), data)
	if err != nil {
		t.Fatalf("unable to exec WASM func: %s", err)
	}

	wasmResp := &protos.WASMResponse{}

	if err := proto.Unmarshal(res, wasmResp); err != nil {
		t.Fatal("unable to unmarshal wasm response: " + err.Error())
	}

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_FALSE {
		t.Errorf("expected ExitCode = %d, got = %d; exit_msg: %s",
			protos.WASMExitCode_WASM_EXIT_CODE_FALSE,
			wasmResp.ExitCode,
			wasmResp.ExitMsg,
		)
	}

	expectedMsg := "key 'bar' does not exist"

	if !strings.Contains(wasmResp.ExitMsg, expectedMsg) {
		t.Errorf("expected ExitMsg to contain '%s', got = %s", expectedMsg, wasmResp.ExitMsg)
	}
}

// WARNING: TODO: NEED TO ADD TESTS FOR ON_ERROR

func TestKVRequestStaticModeKeyExists(t *testing.T) {
	key := "existing-key"

	req, err := createWASMRequestForKV(shared.KVAction_KV_ACTION_EXISTS, key, nil, steps.KVMode_KV_MODE_STATIC)
	if err != nil {
		t.Fatalf("unable to create WASMRequest for kv test: %s", err)
	}

	sdClient, kvClient, err := createStreamdalClient()
	if err != nil {
		t.Fatalf("unable to create client for kv test: %s", err)
	}

	// Add the key to the KV store
	kvClient.Set(key, "")

	// Create WASM func from request
	f, err := sdClient.createFunction(req.Step)
	if err != nil {
		t.Fatalf("unable to create func: %s", err)
	}

	// Function already created from WASM bytes, no need to pass it again (and consume extra WASM mem)
	req.Step.XWasmBytes = nil

	data, err := proto.Marshal(req)
	if err != nil {
		t.Fatalf("Unable to marshal WASMRequest: %s", err)
	}

	// Exec WASM func; should receive WASMResponse{}
	res, err := f.Exec(context.Background(), data)
	if err != nil {
		t.Fatalf("unable to exec WASM func: %s", err)
	}

	wasmResp := &protos.WASMResponse{}

	if err := proto.Unmarshal(res, wasmResp); err != nil {
		t.Fatal("unable to unmarshal wasm response: " + err.Error())
	}

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_TRUE {
		t.Errorf("expected ExitCode = %d, got = %d; exit_msg: %s",
			protos.WASMExitCode_WASM_EXIT_CODE_TRUE,
			wasmResp.ExitCode,
			wasmResp.ExitMsg,
		)
	}

	expectedMsg := fmt.Sprintf("key '%s' exists", key)

	if !strings.Contains(wasmResp.ExitMsg, expectedMsg) {
		t.Errorf("expected ExitMsg to contain '%s', got = %s", expectedMsg, wasmResp.ExitMsg)
	}
}

func stringPtr(in string) *string {
	return &in
}

func boolPtr(in bool) *bool {
	return &in
}
