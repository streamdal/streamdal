package snitch

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
	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-protos/build/go/protos"
	"github.com/streamdal/snitch-protos/build/go/protos/shared"
	"github.com/streamdal/snitch-protos/build/go/protos/steps"

	"github.com/streamdal/snitch-go-client/hostfunc"
	"github.com/streamdal/snitch-go-client/kv"
	"github.com/streamdal/snitch-go-client/logger"
	"github.com/streamdal/snitch-go-client/logger/loggerfakes"
	"github.com/streamdal/snitch-go-client/metrics/metricsfakes"
	"github.com/streamdal/snitch-go-client/server/serverfakes"
)

func TestValidateConfig(t *testing.T) {
	t.Run("invalid config", func(t *testing.T) {
		err := validateConfig(nil)
		if !errors.Is(err, ErrEmptyConfig) {
			t.Error("expected error but got nil")
		}
	})

	t.Run("empty data source", func(t *testing.T) {
		cfg := &Config{
			ServiceName: "",
			ShutdownCtx: context.Background(),
			SnitchURL:   "http://localhost:9090",
			SnitchToken: "foo",
			DryRun:      false,
			StepTimeout: time.Second,
			Logger:      &logger.NoOpLogger{},
		}
		err := validateConfig(cfg)
		if !errors.Is(err, ErrEmptyServiceName) {
			t.Error("expected ErrEmptyServiceName")
		}
	})

	t.Run("empty context", func(t *testing.T) {
		cfg := &Config{
			ServiceName: "mysvc1",
			ShutdownCtx: nil,
			SnitchURL:   "http://localhost:9090",
			SnitchToken: "foo",
			DryRun:      false,
			StepTimeout: time.Second,
			Logger:      &logger.NoOpLogger{},
		}
		err := validateConfig(cfg)
		if !errors.Is(err, ErrMissingShutdownCtx) {
			t.Error("expected ErrMissingShutdownCtx")
		}
	})

	t.Run("invalid step timeout duration", func(t *testing.T) {
		_ = os.Setenv("SNITCH_STEP_TIMEOUT", "foo")
		cfg := &Config{
			SnitchURL:       "localhost:9090",
			SnitchToken:     "foo",
			ServiceName:     "mysvc1",
			PipelineTimeout: 0,
			StepTimeout:     0,
			DryRun:          false,
			ShutdownCtx:     context.Background(),
			Logger:          &logger.NoOpLogger{},
		}
		err := validateConfig(cfg)
		if err == nil {
			t.Error("expected error but got nil")
		}

		if err != nil && !strings.Contains(err.Error(), "unable to parse StepTimeout") {
			t.Errorf("expected error to contain 'unable to Parse StepTimeout' error; got '%+v'", err)
		}

		_ = os.Unsetenv("SNITCH_STEP_TIMEOUT")
	})
}

func TestToProto(t *testing.T) {
	audPublic := Audience{
		ServiceName:   "test-service",
		ComponentName: "test-component",
		OperationType: OperationTypeProducer,
		OperationName: "test-operation",
	}

	audProto := audPublic.ToProto()
	if audProto.ServiceName != audPublic.ServiceName {
		t.Errorf("expected ServiceName '%s', got '%s'", audPublic.ServiceName, audProto.ServiceName)
	}

	if audProto.ComponentName != audPublic.ComponentName {
		t.Errorf("expected ComponentName '%s', got '%s'", audPublic.ComponentName, audProto.ComponentName)
	}

	if audProto.OperationType != protos.OperationType_OPERATION_TYPE_PRODUCER {
		t.Errorf("expected OperationType '%d', got '%d'", protos.OperationType_OPERATION_TYPE_PRODUCER, audProto.OperationType)
	}

	if audProto.OperationName != audPublic.OperationName {
		t.Errorf("expected OperationName '%s', got '%s'", audPublic.OperationName, audProto.OperationName)
	}
}

type InternalServer struct {
	// Must be implemented in order to satisfy the protos InternalServer interface
	protos.UnimplementedInternalServer
}

func (i *InternalServer) GetAttachCommandsByService(ctx context.Context, req *protos.GetAttachCommandsByServiceRequest) (*protos.GetAttachCommandsByServiceResponse, error) {
	return &protos.GetAttachCommandsByServiceResponse{}, nil
}

func (i *InternalServer) Register(req *protos.RegisterRequest, srv protos.Internal_RegisterServer) error {
	for {
		if err := srv.Send(&protos.Command{}); err != nil {
			return errors.Wrap(err, "unable to send cmd")
		}
	}
}

func TestNew(t *testing.T) {
	lis, err := net.Listen("tcp", ":9090")
	if err != nil {
		t.Fatalf("failed to listen: %v", err)
	}

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
		SnitchURL:   "localhost:9090",
		SnitchToken: "foo",
		DryRun:      false,
		Logger:      &loggerfakes.FakeLogger{},
	}

	if _, err := New(cfg); err != nil {
		t.Fatalf("unexpected error: %s", err)
	}
}

func TestGetPipelines(t *testing.T) {
	ctx := context.Background()

	fakeClient := &serverfakes.FakeIServerClient{}

	s := &Snitch{
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

	t.Run("no pipelines", func(t *testing.T) {
		pipelines := s.getPipelines(ctx, aud)
		if len(pipelines) != 0 {
			t.Error("expected empty map")
		}

		// Allow time for goroutine to run
		time.Sleep(time.Millisecond * 500)

		// Audience should be created on the server
		if fakeClient.NewAudienceCallCount() != 1 {
			t.Error("expected NewAudience to be called")
		}
	})

	t.Run("single pipeline", func(t *testing.T) {
		s.pipelines[audToStr(aud)] = map[string]*protos.Command{
			uuid.New().String(): {},
		}

		if len(s.getPipelines(ctx, aud)) != 1 {
			t.Error("expected 1 pipeline")
		}
	})
}

func TestHandleConditions(t *testing.T) {
	fakeClient := &serverfakes.FakeIServerClient{}

	s := &Snitch{
		serverClient: fakeClient,
		metrics:      &metricsfakes.FakeIMetrics{},
		config: &Config{
			Logger: &loggerfakes.FakeLogger{},
			DryRun: false,
		},
	}

	aud := &protos.Audience{}
	pipeline := &protos.Pipeline{}
	step := &protos.PipelineStep{}
	req := &ProcessRequest{}

	t.Run("notify condition", func(t *testing.T) {
		conditions := []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_NOTIFY}

		got := s.handleConditions(context.Background(), conditions, pipeline, step, aud, req)
		if got != true {
			t.Error("handleConditions() should return true")
		}
		if fakeClient.NotifyCallCount() != 1 {
			t.Error("expected Notify() to be called")
		}
	})

	t.Run("abort condition", func(t *testing.T) {
		conditions := []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT}

		got := s.handleConditions(context.Background(), conditions, pipeline, step, aud, req)
		if got != false {
			t.Error("handleConditions() should return false")
		}
	})

}

func TestProcess_nil(t *testing.T) {
	s := &Snitch{}
	_, err := s.Process(context.Background(), nil)
	if err == nil || !strings.Contains(err.Error(), "request cannot be empty") {
		t.Error("expected error")
	}
}

func TestProcess_success(t *testing.T) {
	aud := &protos.Audience{
		ServiceName:   "mysvc1",
		ComponentName: "kafka",
		OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
		OperationName: "mytopic",
	}

	wasmData, err := os.ReadFile("src/detective.wasm")
	if err != nil {
		t.Fatal(err)
	}

	pipeline := &protos.Pipeline{
		Id:   uuid.New().String(),
		Name: "Test Pipeline",
		Steps: []*protos.PipelineStep{
			{
				Name:          "Step 1",
				XWasmId:       stringPtr(uuid.New().String()),
				XWasmBytes:    wasmData,
				XWasmFunction: stringPtr("f"),
				OnSuccess:     make([]protos.PipelineStepCondition, 0),
				OnFailure:     []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT},
				Step: &protos.PipelineStep_Detective{
					Detective: &steps.DetectiveStep{
						Path:   stringPtr("object.payload"),
						Args:   []string{"gmail.com"},
						Negate: boolPtr(false),
						Type:   steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
					},
				},
			},
		},
	}

	s := &Snitch{
		serverClient: &serverfakes.FakeIServerClient{},
		functionsMtx: &sync.RWMutex{},
		functions:    map[string]*function{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
		tails:        map[string]map[string]*Tail{},
		tailsMtx:     &sync.RWMutex{},
		config: &Config{
			ServiceName:     "mysvc1",
			Logger:          &logger.NoOpLogger{},
			StepTimeout:     time.Millisecond * 10,
			PipelineTimeout: time.Millisecond * 100,
		},
		metrics:      &metricsfakes.FakeIMetrics{},
		pipelinesMtx: &sync.RWMutex{},
		pipelines: map[string]map[string]*protos.Command{
			audToStr(aud): {
				pipeline.Id: {
					Audience: aud,
					Command: &protos.Command_AttachPipeline{
						AttachPipeline: &protos.AttachPipelineCommand{
							Pipeline: pipeline,
						},
					},
				},
			},
		},
	}

	resp, err := s.Process(context.Background(), &ProcessRequest{
		ComponentName: aud.ComponentName,
		OperationType: OperationType(aud.OperationType),
		OperationName: aud.OperationName,
		Data:          []byte(`{"object":{"payload":"streamdal@gmail.com"}`),
	})
	if err != nil {
		t.Fatal(err)
	}

	if resp.Error {
		t.Error(resp.Message)
	}

	if resp.Message == "No pipelines, message ignored" {
		t.Error("no pipelines, message ignored")
	}
}

func TestProcess_matchfail_and_abort(t *testing.T) {
	aud := &protos.Audience{
		ServiceName:   "mysvc1",
		ComponentName: "kafka",
		OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
		OperationName: "mytopic",
	}

	wasmData, err := os.ReadFile("src/detective.wasm")
	if err != nil {
		t.Fatal(err)
	}

	pipeline := &protos.Pipeline{
		Id:   uuid.New().String(),
		Name: "Test Pipeline",
		Steps: []*protos.PipelineStep{
			{
				Name:          "Step 1",
				XWasmId:       stringPtr(uuid.New().String()),
				XWasmBytes:    wasmData,
				XWasmFunction: stringPtr("f"),
				OnSuccess:     make([]protos.PipelineStepCondition, 0),
				OnFailure:     []protos.PipelineStepCondition{protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT},
				Step: &protos.PipelineStep_Detective{
					Detective: &steps.DetectiveStep{
						Path:   stringPtr("object.payload"),
						Args:   []string{"gmail.com"},
						Negate: boolPtr(false),
						Type:   steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
					},
				},
			},
		},
	}

	s := &Snitch{
		serverClient: &serverfakes.FakeIServerClient{},
		functionsMtx: &sync.RWMutex{},
		functions:    map[string]*function{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
		config: &Config{
			ServiceName:     "mysvc1",
			Logger:          &logger.NoOpLogger{},
			StepTimeout:     time.Millisecond * 10,
			PipelineTimeout: time.Millisecond * 100,
		},
		metrics:      &metricsfakes.FakeIMetrics{},
		tails:        map[string]map[string]*Tail{},
		tailsMtx:     &sync.RWMutex{},
		pipelinesMtx: &sync.RWMutex{},
		pipelines: map[string]map[string]*protos.Command{
			audToStr(aud): {
				pipeline.Id: {
					Audience: aud,
					Command: &protos.Command_AttachPipeline{
						AttachPipeline: &protos.AttachPipelineCommand{
							Pipeline: pipeline,
						},
					},
				},
			},
		},
	}

	resp, err := s.Process(context.Background(), &ProcessRequest{
		ComponentName: aud.ComponentName,
		OperationType: OperationType(aud.OperationType),
		OperationName: aud.OperationName,
		Data:          []byte(`{"object":{"payload":"streamdal@hotmail.com"}`),
	})
	if err != nil {
		t.Fatal(err)
	}

	if !resp.Error {
		t.Error("expected ProcessResponse.Error = true")
	}

	if resp.Message != "detective step failed" {
		t.Error("Expected ProcessResponse.Message = 'detective step failed'")
	}
}

func stringPtr(in string) *string {
	return &in
}

func boolPtr(in bool) *bool {
	return &in
}

func createSnitchClient() (*Snitch, *kv.KV, error) {
	kvClient, err := kv.New(&kv.Config{})
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to create kv client")
	}

	hfClient, err := hostfunc.New(kvClient, &logger.NoOpLogger{})
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to create hostfunc client")
	}

	return &Snitch{
		pipelinesMtx: &sync.RWMutex{},
		pipelines:    map[string]map[string]*protos.Command{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
		kv:           kvClient,
		hf:           hfClient,
	}, kvClient, nil
}

func createWASMRequestForKV(action shared.KVAction, key string, value []byte, mode steps.KVMode) (*protos.WASMRequest, error) {
	wasmData, err := os.ReadFile("src/kv.wasm")
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

	snitchClient, _, err := createSnitchClient()
	if err != nil {
		t.Fatalf("unable to create snitch client for kv test: %s", err)
	}

	// Create WASM func from request
	f, err := snitchClient.createFunction(req.Step)
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

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_FAILURE {
		t.Errorf("expected ExitCode = %d, got = %d; exit_msg: %s",
			protos.WASMExitCode_WASM_EXIT_CODE_FAILURE,
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

	snitchClient, kvClient, err := createSnitchClient()
	if err != nil {
		t.Fatalf("unable to create snitch client for kv test: %s", err)
	}

	kvClient.Set("bar", "")

	// Create WASM func from request
	f, err := snitchClient.createFunction(req.Step)
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

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS {
		t.Errorf("expected ExitCode = %d, got = %d; exit_msg: %s",
			protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS,
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

	snitchClient, _, err := createSnitchClient()
	if err != nil {
		t.Fatalf("unable to create snitch client for kv test: %s", err)
	}

	// Create WASM func from request
	f, err := snitchClient.createFunction(req.Step)
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

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_FAILURE {
		t.Errorf("expected ExitCode = %d, got = %d; exit_msg: %s",
			protos.WASMExitCode_WASM_EXIT_CODE_FAILURE,
			wasmResp.ExitCode,
			wasmResp.ExitMsg,
		)
	}

	expectedMsg := "key 'bar' does not exist"

	if !strings.Contains(wasmResp.ExitMsg, expectedMsg) {
		t.Errorf("expected ExitMsg to contain '%s', got = %s", expectedMsg, wasmResp.ExitMsg)
	}
}

func TestKVRequestStaticModeKeyExists(t *testing.T) {
	key := "existing-key"

	req, err := createWASMRequestForKV(shared.KVAction_KV_ACTION_EXISTS, key, nil, steps.KVMode_KV_MODE_STATIC)
	if err != nil {
		t.Fatalf("unable to create WASMRequest for kv test: %s", err)
	}

	snitchClient, kvClient, err := createSnitchClient()
	if err != nil {
		t.Fatalf("unable to create snitch client for kv test: %s", err)
	}

	// Add the key to the KV store
	kvClient.Set(key, "")

	// Create WASM func from request
	f, err := snitchClient.createFunction(req.Step)
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

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS {
		t.Errorf("expected ExitCode = %d, got = %d; exit_msg: %s",
			protos.WASMExitCode_WASM_EXIT_CODE_FAILURE,
			wasmResp.ExitCode,
			wasmResp.ExitMsg,
		)
	}

	expectedMsg := fmt.Sprintf("key '%s' exists", key)

	if !strings.Contains(wasmResp.ExitMsg, expectedMsg) {
		t.Errorf("expected ExitMsg to contain '%s', got = %s", expectedMsg, wasmResp.ExitMsg)
	}
}

func TestHttpRequest(t *testing.T) {
	wasmData, err := os.ReadFile("src/httprequest.wasm")
	if err != nil {
		t.Fatal(err)
	}

	req := &protos.WASMRequest{
		Step: &protos.PipelineStep{
			Step: &protos.PipelineStep_HttpRequest{
				HttpRequest: &steps.HttpRequestStep{
					Request: &steps.HttpRequest{
						Url:    "https://www.google.com",
						Method: steps.HttpRequestMethod_HTTP_REQUEST_METHOD_GET,
						Body:   []byte(``),
					},
				},
			},
			XWasmId:       stringPtr(uuid.New().String()),
			XWasmFunction: stringPtr("f"),
			XWasmBytes:    wasmData,
		},
		InputPayload: []byte(``),
	}

	s := &Snitch{
		pipelinesMtx: &sync.RWMutex{},
		pipelines:    map[string]map[string]*protos.Command{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
	}

	f, err := s.createFunction(req.Step)
	if err != nil {
		t.Fatal(err)
	}

	req.Step.XWasmBytes = nil

	data, err := proto.Marshal(req)
	if err != nil {
		t.Fatalf("Unable to marshal WASMRequest: %s", err)
	}

	res, err := f.Exec(context.Background(), data)
	if err != nil {
		t.Fatal(err)
	}

	wasmResp := &protos.WASMResponse{}

	if err := proto.Unmarshal(res, wasmResp); err != nil {
		t.Fatal("unable to unmarshal wasm response: " + err.Error())
	}

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS {
		t.Errorf("expected ExitCode = 0, got = %d", wasmResp.ExitCode)
	}
}

func TestInferSchema(t *testing.T) {
	wasmResp, err := inferSchema("json-examples/small.json")
	if err != nil {
		t.Error(err)
	}

	if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS {
		t.Errorf("expected ExitCode = 0, got = %d", wasmResp.ExitCode)
	}

	if !strings.Contains(wasmResp.ExitMsg, "inferred fresh schema") {
		t.Errorf("expected ExitMsg to contain 'inferred fresh schema', got = %s", wasmResp.ExitMsg)
	}
}

func inferSchema(fileName string) (*protos.WASMResponse, error) {
	wasmData, err := os.ReadFile("src/inferschema.wasm")
	if err != nil {
		return nil, err
	}

	payloadData, err := os.ReadFile(fileName)
	if err != nil {
		return nil, errors.Wrap(err, "unable to load json file")
	}

	req := &protos.WASMRequest{
		Step: &protos.PipelineStep{
			Step: &protos.PipelineStep_InferSchema{
				InferSchema: &steps.InferSchemaStep{
					CurrentSchema: nil,
				},
			},
			XWasmId:       stringPtr(uuid.New().String()),
			XWasmFunction: stringPtr("f"),
			XWasmBytes:    wasmData,
		},
		InputPayload: payloadData,
	}

	s := &Snitch{
		pipelinesMtx: &sync.RWMutex{},
		pipelines:    map[string]map[string]*protos.Command{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
	}

	f, err := s.createFunction(req.Step)
	if err != nil {
		return nil, err
	}

	req.Step.XWasmBytes = nil

	data, err := proto.Marshal(req)
	if err != nil {
		return nil, err
	}

	res, err := f.Exec(context.Background(), data)
	if err != nil {
		return nil, err
	}

	wasmResp := &protos.WASMResponse{}

	if err := proto.Unmarshal(res, wasmResp); err != nil {
		return nil, fmt.Errorf("unable to unmarshal wasm response: %s", err)
	}

	return wasmResp, nil
}

func BenchmarkInferSchema_FreshSchema(b *testing.B) {
	b.Run("small.json", func(b *testing.B) {
		benchmarkInferSchema("json-examples/small.json", nil, b)
	})

	b.Run("medium.json", func(b *testing.B) {
		benchmarkInferSchema("json-examples/medium.json", nil, b)
	})

	b.Run("large.json", func(b *testing.B) {
		benchmarkInferSchema("json-examples/large.json", nil, b)
	})
}

func BenchmarkInferSchema_MatchExisting(b *testing.B) {
	// Each test will infer a schema first for the payload and then
	// use that schema to match the payload again, simulating a never changing schema
	b.Run("small.json", func(b *testing.B) {
		wasmResp, _ := inferSchema("json-examples/small.json")
		benchmarkInferSchema("json-examples/small.json", wasmResp.OutputStep, b)
	})

	b.Run("medium.json", func(b *testing.B) {
		wasmResp, _ := inferSchema("json-examples/medium.json")
		benchmarkInferSchema("json-examples/medium.json", wasmResp.OutputStep, b)
	})

	b.Run("large.json", func(b *testing.B) {
		wasmResp, _ := inferSchema("json-examples/large.json")
		benchmarkInferSchema("json-examples/large.json", wasmResp.OutputStep, b)
	})
}

func benchmarkInferSchema(fileName string, currentSchema []byte, b *testing.B) {
	wasmData, err := os.ReadFile("src/inferschema.wasm")
	if err != nil {
		b.Fatal(err)
	}

	payloadData, err := os.ReadFile(fileName)
	if err != nil {
		b.Fatal(err)
	}

	req := &protos.WASMRequest{
		Step: &protos.PipelineStep{
			Step: &protos.PipelineStep_InferSchema{
				InferSchema: &steps.InferSchemaStep{
					CurrentSchema: currentSchema,
				},
			},
			XWasmId:       stringPtr(uuid.New().String()),
			XWasmFunction: stringPtr("f"),
			XWasmBytes:    wasmData,
		},
		InputPayload: payloadData,
	}

	s := &Snitch{
		pipelinesMtx: &sync.RWMutex{},
		pipelines:    map[string]map[string]*protos.Command{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
	}

	f, err := s.createFunction(req.Step)
	if err != nil {
		b.Fatal(err)
	}

	req.Step.XWasmBytes = nil

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		data, err := proto.Marshal(req)
		if err != nil {
			b.Fatalf("Unable to marshal WASMRequest: %s", err)
		}

		res, err := f.Exec(context.Background(), data)
		if err != nil {
			b.Fatal(err)
		}

		wasmResp := &protos.WASMResponse{}

		if err := proto.Unmarshal(res, wasmResp); err != nil {
			b.Fatal("unable to unmarshal wasm response: " + err.Error())
		}

		if wasmResp.ExitCode != protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS {
			b.Errorf("expected ExitCode = 0, got = %d", wasmResp.ExitCode)
		}
	}
}

//func BenchmarkMatchSmallJSON(b *testing.B) {
//	matchBench("json-examples/small.json", b)
//}
//
//func BenchmarkMatchMediumJSON(b *testing.B) {
//	matchBench("json-examples/medium.json", b)
//}
//
//func BenchmarkMatchLargeJSON(b *testing.B) {
//	matchBench("json-examples/large.json", b)
//}
//
//func BenchmarkTransformSmallJSON(b *testing.B) {
//	transformBench("json-examples/small.json", b)
//}
//
//func BenchmarkTransformMediumJSON(b *testing.B) {
//	transformBench("json-examples/medium.json", b)
//}
//
//func BenchmarkTransformLargeJSON(b *testing.B) {
//	transformBench("json-examples/large.json", b)
//}

//func matchBench(fileName string, b *testing.B) {
//	jsonData, err := os.ReadFile(fileName)
//	if err != nil {
//		b.Error("unable to read json: " + err.Error())
//	}
//
//	d, err := setup(Match)
//	if err != nil {
//		b.Error(err)
//	}
//
//	b.ResetTimer()
//
//	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
//	defer cancel()
//
//	for i := 0; i < b.N; i++ {
//		cfg := &protos.RuleConfigMatch{
//			Path:     "firstname",
//			Type:     "string_contains_any",
//			Operator: protos.MatchOperator_MATCH_OPERATOR_ISMATCH,
//			Args:     []string{"Rani"},
//		}
//		_, err := d.runMatch(ctx, jsonData, cfg)
//		if err != nil {
//			cancel()
//			b.Fatal("error during runMatch: " + err.Error())
//		}
//		cancel()
//	}
//}
//
//func transformBench(fileName string, b *testing.B) {
//	jsonData, err := os.ReadFile(fileName)
//	if err != nil {
//		b.Error("unable to read json: " + err.Error())
//	}
//
//	d, err := setup(Transform)
//	if err != nil {
//		b.Error(err)
//	}
//
//	b.ResetTimer()
//
//	fm := &protos.FailureModeTransform{
//		Type:  protos.FailureModeTransform_TRANSFORM_TYPE_REPLACE,
//		Path:  "firstname",
//		Value: "Testing",
//	}
//
//	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
//	defer cancel()
//
//	for i := 0; i < b.N; i++ {
//		_, err := d.failTransform(ctx, jsonData, fm)
//		if err != nil {
//			b.Error("error during runTransform: " + err.Error())
//		}
//	}
//}
