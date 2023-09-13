// Package snitch is a library that allows running of Client data pipelines against data
// This package is designed to be included in golang message bus libraries. The only public
// method is Process() which is used to run pipelines against data.
//
// Use of this package requires a running instance of a snitch server.
// The server can be downloaded at https://github.com/streamdal/snitch
//
// The following environment variables must be set:
// - SNITCH_URL: The address of the Client server
// - SNITCH_TOKEN: The token to use when connecting to the Client server
//
// Optional parameters:
// - SNITCH_DRY_RUN: If true, rule hits will only be logged, no failure modes will be ran
package snitch

import (
	"context"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/relistan/go-director"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-go-client/hostfunc"
	"github.com/streamdal/snitch-go-client/kv"
	"github.com/streamdal/snitch-go-client/logger"
	"github.com/streamdal/snitch-go-client/metrics"
	"github.com/streamdal/snitch-go-client/server"
	"github.com/streamdal/snitch-go-client/types"
)

// OperationType is a constant that represents whether we are publishing or consuming,
// it must match the protobuf enum of the rule
type OperationType int

type ClientType int

const (
	// OperationTypeConsumer tells Process to run the pipelines against the consume ruleset
	OperationTypeConsumer OperationType = 1

	// OperationTypeProducer tells Process to run the pipelines against the produce ruleset
	OperationTypeProducer OperationType = 2

	// RuleUpdateInterval is how often to check for rule updates
	RuleUpdateInterval = time.Second * 30

	// ReconnectSleep determines the length of time to wait between reconnect attempts to snitch server
	ReconnectSleep = time.Second * 5

	// MaxPayloadSize is the maximum size of data that can be sent to the WASM module
	MaxPayloadSize = 1024 * 1024 // 1Mi

	ClientTypeSDK  ClientType = 1
	ClientTypeShim ClientType = 2
)

var (
	ErrEmptyConfig        = errors.New("config cannot be empty")
	ErrEmptyServiceName   = errors.New("data source cannot be empty")
	ErrMissingShutdownCtx = errors.New("shutdown context cannot be nil")

	// ErrMessageDropped is returned when a message is dropped by the plumber data pipelines
	// An end user may check for this error and handle it accordingly in their code
	//ErrMessageDropped = errors.New("message dropped by plumber data pipelines")

	ErrEmptyCommand = errors.New("command cannot be empty")
)

type ISnitch interface {
	Process(ctx context.Context, req *ProcessRequest) (*ProcessResponse, error)
}

type Snitch struct {
	config             *Config
	functions          map[string]*function
	pipelines          map[string]map[string]*protos.Command
	pipelinesPaused    map[string]map[string]*protos.Command
	functionsMtx       *sync.RWMutex
	pipelinesMtx       *sync.RWMutex
	pipelinesPausedMtx *sync.RWMutex
	serverClient       server.IServerClient
	metrics            metrics.IMetrics
	audiences          map[string]struct{}
	audiencesMtx       *sync.RWMutex
	sessionID          string
	kv                 kv.IKV
	hf                 *hostfunc.HostFunc
	tailsMtx           *sync.RWMutex
	tails              map[string]map[string]*Tail
}

type Config struct {
	SnitchURL       string
	SnitchToken     string
	ServiceName     string
	PipelineTimeout time.Duration
	StepTimeout     time.Duration
	DryRun          bool
	ShutdownCtx     context.Context
	Logger          logger.Logger
	ClientType      ClientType
	Audiences       []*Audience
}

type Audience struct {
	ServiceName   string
	ComponentName string
	OperationType OperationType
	OperationName string
}

type ProcessRequest struct {
	ComponentName string
	OperationType OperationType
	OperationName string
	Data          []byte
}

type ProcessResponse struct {
	Data    []byte
	Error   bool
	Message string
}

func New(cfg *Config) (*Snitch, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to validate config")
	}

	// We instantiate this library based on whether or not we have a Client URL+token
	// If these are not provided, the wrapper library will not perform rule checks and
	// will act as normal
	if cfg.SnitchURL == "" || cfg.SnitchToken == "" {
		return nil, nil
	}

	serverClient, err := server.New(cfg.SnitchURL, cfg.SnitchToken)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to connect to snitch server '%s'", cfg.SnitchURL)
	}

	m, err := metrics.New(&metrics.Config{
		ServerClient: serverClient,
		ShutdownCtx:  cfg.ShutdownCtx,
		Log:          cfg.Logger,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to start metrics service")
	}

	kvInstance, err := kv.New(&kv.Config{
		Logger: cfg.Logger,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to start kv service")
	}

	hf, err := hostfunc.New(kvInstance, cfg.Logger)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create hostfunc instance")
	}

	s := &Snitch{
		functions:          make(map[string]*function),
		functionsMtx:       &sync.RWMutex{},
		serverClient:       serverClient,
		pipelines:          make(map[string]map[string]*protos.Command),
		pipelinesMtx:       &sync.RWMutex{},
		pipelinesPaused:    make(map[string]map[string]*protos.Command),
		pipelinesPausedMtx: &sync.RWMutex{},
		audiences:          map[string]struct{}{},
		audiencesMtx:       &sync.RWMutex{},
		config:             cfg,
		metrics:            m,
		sessionID:          uuid.New().String(),
		kv:                 kvInstance,
		hf:                 hf,
		tailsMtx:           &sync.RWMutex{},
		tails:              make(map[string]map[string]*Tail),
	}

	if cfg.DryRun {
		cfg.Logger.Warn("data pipelines running in dry run mode")
	}

	if err := s.pullInitialPipelines(cfg.ShutdownCtx); err != nil {
		return nil, err
	}

	errCh := make(chan error, 0)

	// Start register
	go func() {
		if err := s.register(director.NewFreeLooper(director.FOREVER, make(chan error, 1))); err != nil {
			errCh <- errors.Wrap(err, "register error")
		}
	}()

	// Start heartbeat
	go s.heartbeat(director.NewTimedLooper(director.FOREVER, time.Second, make(chan error, 1)))

	go s.watchForShutdown()

	// Make sure we were able to start without issues
	select {
	case err := <-errCh:
		return nil, errors.Wrap(err, "received error on startup")
	case <-time.After(time.Second * 5):
		return s, nil
	}
}
func validateConfig(cfg *Config) error {
	if cfg == nil {
		return ErrEmptyConfig
	}

	if cfg.ShutdownCtx == nil {
		return ErrMissingShutdownCtx
	}

	if cfg.ServiceName == "" {
		cfg.ServiceName = os.Getenv("SNITCH_SERVICE_NAME")
		if cfg.ServiceName == "" {
			return ErrEmptyServiceName
		}
	}

	// Can be specified in config for lib use, or via envar for shim use
	if cfg.SnitchURL == "" {
		cfg.SnitchURL = os.Getenv("SNITCH_URL")
	}

	// Can be specified in config for lib use, or via envar for shim use
	if cfg.SnitchToken == "" {
		cfg.SnitchToken = os.Getenv("SNITCH_TOKEN")
	}

	// Can be specified in config for lib use, or via envar for shim use
	if os.Getenv("SNITCH_DRY_RUN") == "true" {
		cfg.DryRun = true
	}

	// Can be specified in config for lib use, or via envar for shim use
	if cfg.StepTimeout == 0 {
		to := os.Getenv("SNITCH_STEP_TIMEOUT")
		if to == "" {
			to = "10ms"
		}

		timeout, err := time.ParseDuration(to)
		if err != nil {
			return errors.Wrap(err, "unable to parse SNITCH_STEP_TIMEOUT")
		}
		cfg.StepTimeout = timeout
	}

	// Can be specified in config for lib use, or via envar for shim use
	if cfg.PipelineTimeout == 0 {
		to := os.Getenv("SNITCH_PIPELINE_TIMEOUT")
		if to == "" {
			to = "100ms"
		}

		timeout, err := time.ParseDuration(to)
		if err != nil {
			return errors.Wrap(err, "unable to parse SNITCH_PIPELINE_TIMEOUT")
		}
		cfg.PipelineTimeout = timeout
	}

	// Default to NOOP logger if none is provided
	if cfg.Logger == nil {
		cfg.Logger = &logger.NoOpLogger{}
	}

	return nil
}

func (s *Snitch) watchForShutdown() {
	<-s.config.ShutdownCtx.Done()

	// Shut down all tails
	s.tailsMtx.RLock()
	defer s.tailsMtx.RUnlock()
	for _, tails := range s.tails {
		for reqID, tail := range tails {
			s.config.Logger.Debugf("Shutting down tail '%s' for pipeline %s", reqID, tail.Request.GetTail().Request.PipelineId)
			tail.CancelFunc()
		}
	}
}

func (s *Snitch) pullInitialPipelines(ctx context.Context) error {
	cmds, err := s.serverClient.GetAttachCommandsByService(ctx, s.config.ServiceName)
	if err != nil {
		return errors.Wrap(err, "unable to pull initial pipelines")
	}

	for _, cmd := range cmds.Active {
		s.config.Logger.Debugf("Attaching pipeline '%s'", cmd.GetAttachPipeline().Pipeline.Name)
		if err := s.attachPipeline(ctx, cmd); err != nil {
			s.config.Logger.Errorf("failed to attach pipeline: %s", err)
		}
	}

	for _, cmd := range cmds.Paused {
		s.config.Logger.Debugf("Pipeline '%s' is paused", cmd.GetAttachPipeline().Pipeline.Name)
		if _, ok := s.pipelinesPaused[audToStr(cmd.Audience)]; !ok {
			s.pipelinesPaused[audToStr(cmd.Audience)] = make(map[string]*protos.Command)
		}

		s.pipelinesPaused[audToStr(cmd.Audience)][cmd.GetAttachPipeline().Pipeline.Id] = cmd
	}

	return nil
}

func (s *Snitch) heartbeat(loop *director.TimedLooper) {
	var quit bool
	loop.Loop(func() error {
		if quit {
			time.Sleep(time.Millisecond * 50)
			return nil
		}

		select {
		case <-s.config.ShutdownCtx.Done():
			quit = true
			loop.Quit()
			return nil
		default:
			// NOOP
		}

		if err := s.serverClient.HeartBeat(s.config.ShutdownCtx, s.sessionID); err != nil {
			if strings.Contains(err.Error(), "connection refused") {
				// Snitch server went away, log, sleep, and wait for reconnect
				s.config.Logger.Warn("failed to send heartbeat, snitch server went away, waiting for reconnect")
				time.Sleep(ReconnectSleep)
				return nil
			}
			s.config.Logger.Errorf("failed to send heartbeat: %s", err)
		}

		return nil
	})
}

func (s *Snitch) runStep(ctx context.Context, step *protos.PipelineStep, data []byte) (*protos.WASMResponse, error) {
	s.config.Logger.Debugf("Running step '%s'", step.Name)
	// Get WASM module
	f, err := s.getFunction(ctx, step)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get wasm data")
	}

	// Don't need this anymore, and don't want to send it to the wasm function
	step.XWasmBytes = nil

	req := &protos.WASMRequest{
		InputPayload: data,
		Step:         step,
	}

	reqBytes, err := proto.Marshal(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal WASM request")
	}

	timeoutCtx, cancel := context.WithTimeout(ctx, s.config.StepTimeout)
	defer cancel()

	// Run WASM module
	respBytes, err := f.Exec(timeoutCtx, reqBytes)
	if err != nil {
		return nil, errors.Wrap(err, "failed to execute wasm module")
	}

	resp := &protos.WASMResponse{}
	if err := proto.Unmarshal(respBytes, resp); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal WASM response")
	}

	return resp, nil
}

func (s *Snitch) getPipelines(ctx context.Context, aud *protos.Audience) map[string]*protos.Command {
	s.pipelinesMtx.RLock()
	defer s.pipelinesMtx.RUnlock()

	pipelines, ok := s.pipelines[audToStr(aud)]
	if !ok {
		// No pipelines for this audience key
		// But we should notify snitch server we've seen it
		s.addAudience(ctx, aud)

		return make(map[string]*protos.Command)
	}

	return pipelines
}

func (s *Snitch) Process(ctx context.Context, req *ProcessRequest) (*ProcessResponse, error) {
	if req == nil {
		return nil, errors.New("request cannot be nil")
	}

	data := req.Data
	payloadSize := int64(len(data))

	aud := &protos.Audience{
		ServiceName:   s.config.ServiceName,
		ComponentName: req.ComponentName,
		OperationType: protos.OperationType(req.OperationType),
		OperationName: req.OperationName,
	}

	labels := map[string]string{
		"service":       s.config.ServiceName,
		"component":     req.ComponentName,
		"operation":     req.OperationName,
		"pipeline_name": "",
		"pipeline_id":   "",
	}

	counterError := types.ConsumeErrorCount
	counterProcessed := types.ConsumeProcessedCount
	counterBytes := types.ConsumeBytes
	rateBytes := types.ConsumeBytesRate
	rateProcessed := types.ConsumeProcessedRate
	if req.OperationType == OperationTypeProducer {
		counterError = types.ProduceErrorCount
		counterProcessed = types.ProduceProcessedCount
		counterBytes = types.ProduceBytes
		rateBytes = types.ProduceBytesRate
		rateProcessed = types.ProduceProcessedRate
	}

	// Rate counters
	_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: rateBytes, Labels: map[string]string{}, Value: payloadSize, Audience: aud})
	_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: rateProcessed, Labels: map[string]string{}, Value: 1, Audience: aud})

	pipelines := s.getPipelines(ctx, aud)
	if len(pipelines) == 0 {
		// No pipelines for this mode, nothing to do
		return &ProcessResponse{Data: data, Message: "No pipelines, message ignored"}, nil
	}

	if payloadSize > MaxPayloadSize {

		_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: counterError, Labels: labels, Value: 1})

		msg := fmt.Sprintf("data size exceeds maximum, skipping pipelines on audience %s", audToStr(aud))
		s.config.Logger.Warn(msg)
		return &ProcessResponse{Data: data, Error: true, Message: msg}, nil
	}

	for _, p := range pipelines {
		originalData := data // Used for tail request
		pipeline := p.GetAttachPipeline().GetPipeline()
		labels["pipeline_name"] = pipeline.Name
		labels["pipeline_id"] = pipeline.Id

		_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: counterProcessed, Labels: labels, Value: 1})
		_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: counterBytes, Labels: labels, Value: payloadSize})

		// If a step
		timeoutCtx, timeoutCxl := context.WithTimeout(ctx, s.config.PipelineTimeout)

		for _, step := range pipeline.Steps {

			select {
			case <-timeoutCtx.Done():
				timeoutCxl()
				return &ProcessResponse{
					Data:    req.Data,
					Error:   true,
					Message: "pipeline timeout exceeded",
				}, nil
			default:
				// NOOP
			}

			wasmResp, err := s.runStep(timeoutCtx, step, data)
			if err != nil {
				s.config.Logger.Errorf("failed to run step '%s': %s", step.Name, err)
				shouldContinue := s.handleConditions(ctx, step.OnFailure, pipeline, step, aud, req)
				if !shouldContinue {
					timeoutCxl()
					return &ProcessResponse{
						Data:    req.Data,
						Error:   true,
						Message: err.Error(),
					}, nil
				}

				// wasmResp will be nil, so don't allow code below to execute
				continue
			}

			// Check on success and on-failures
			switch wasmResp.ExitCode {
			case protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS:
				s.config.Logger.Debugf("Step '%s' returned exit code success", step.Name)

				shouldContinue := s.handleConditions(ctx, step.OnSuccess, pipeline, step, aud, req)
				if !shouldContinue {
					timeoutCxl()
					return &ProcessResponse{
						Data:    wasmResp.OutputPayload,
						Error:   false,
						Message: "",
					}, nil
				}
			case protos.WASMExitCode_WASM_EXIT_CODE_FAILURE:
				s.config.Logger.Errorf("Step '%s' returned exit code failure", step.Name)

				_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: counterError, Labels: labels, Value: 1})

				shouldContinue := s.handleConditions(ctx, step.OnFailure, pipeline, step, aud, req)
				if !shouldContinue {
					timeoutCxl()
					return &ProcessResponse{
						Data:    wasmResp.OutputPayload,
						Error:   true,
						Message: "detective step failed", // TODO: WASM module should return the error message, not just "detective run completed"
					}, nil
				}
			case protos.WASMExitCode_WASM_EXIT_CODE_INTERNAL_ERROR:
				s.config.Logger.Errorf("Step '%s' returned exit code internal error", step.Name)

				_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: counterError, Labels: labels, Value: 1})

				shouldContinue := s.handleConditions(ctx, step.OnFailure, pipeline, step, aud, req)
				if !shouldContinue {
					timeoutCxl()
					return &ProcessResponse{
						Data:    wasmResp.OutputPayload,
						Error:   true,
						Message: "detective step failed:" + wasmResp.ExitMsg,
					}, nil
				}
			default:
				_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: counterError, Labels: labels, Value: 1})
				s.config.Logger.Debugf("Step '%s' returned unknown exit code %d", step.Name, wasmResp.ExitCode)
			}

			data = wasmResp.OutputPayload
		}

		timeoutCxl()

		// Perform tail if necessary
		s.sendTail(aud, pipeline.Id, originalData, data)
	}

	// Dry run should not modify anything, but we must allow pipeline to
	// mutate internal state in order to function properly
	if s.config.DryRun {
		data = req.Data
	}

	return &ProcessResponse{
		Data:    data,
		Error:   false,
		Message: "",
	}, nil
}

func (s *Snitch) handleConditions(
	ctx context.Context,
	conditions []protos.PipelineStepCondition,
	pipeline *protos.Pipeline,
	step *protos.PipelineStep,
	aud *protos.Audience,
	req *ProcessRequest,
) bool {
	shouldContinue := true
	for _, condition := range conditions {
		switch condition {
		case protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_NOTIFY:
			s.config.Logger.Debugf("Step '%s' condition triggered, notifying", step.Name)
			if !s.config.DryRun {
				if err := s.serverClient.Notify(ctx, pipeline, step, aud); err != nil {
					s.config.Logger.Errorf("failed to notify condition: %v", err)
				}

				labels := map[string]string{
					"service":       s.config.ServiceName,
					"component":     req.ComponentName,
					"operation":     req.OperationName,
					"pipeline_name": pipeline.Name,
					"pipeline_id":   pipeline.Id,
				}
				_ = s.metrics.Incr(ctx, &types.CounterEntry{Name: types.NotifyCount, Labels: labels, Value: 1})
			}
		case protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT:
			s.config.Logger.Debugf("Step '%s' failed, aborting further pipeline steps", step.Name)
			shouldContinue = false
		default:
			// Assume continue
			s.config.Logger.Debugf("Step '%s' failed, continuing to next step", step.Name)
		}
	}

	return shouldContinue
}

func (a *Audience) ToProto() *protos.Audience {
	return &protos.Audience{
		ServiceName:   a.ServiceName,
		ComponentName: a.ComponentName,
		OperationType: protos.OperationType(a.OperationType),
		OperationName: a.OperationName,
	}
}
