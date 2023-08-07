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
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/golang/protobuf/proto"

	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/relistan/go-director"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-go-client/logger"
	"github.com/streamdal/snitch-go-client/metrics"
	"github.com/streamdal/snitch-go-client/server"
)

// Module is a constant that represents which type of WASM module we will run the pipelines against
type Module string

// OperationType is a constant that represents whether we are publishing or consuming,
// it must match the protobuf enum of the rule
type OperationType int

type ClientType int

const (
	// Publish tells Process to run the pipelines against the publish ruleset
	Publish OperationType = 1

	// Consume tells Process to run the pipelines against the consume ruleset
	Consume OperationType = 2

	// RuleUpdateInterval is how often to check for rule updates
	RuleUpdateInterval = time.Second * 30

	// ReconnectSleep determines the length of time to wait between reconnect attempts to snitch server
	ReconnectSleep = time.Second * 5

	// Match is the name of the WASM module that contains the match function
	Match Module = "match"

	// Transform is the name of the WASM module that contains the transform function
	Transform Module = "transform"

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
	ErrMessageDropped = errors.New("message dropped by plumber data pipelines")

	ErrEmptyCommand = errors.New("command cannot be empty")
)

type ISnitch interface {
	ApplyRules(ctx context.Context, mode OperationType, key string, data []byte) ([]byte, error)
}

type Snitch struct {
	*Config
	functions          map[string]*function
	pipelines          map[string]map[string]*protos.Command
	pipelinesPaused    map[string]map[string]*protos.Command
	functionsMtx       *sync.RWMutex
	pipelinesMtx       *sync.RWMutex
	pipelinesPausedMtx *sync.RWMutex
	ServerClient       server.IServerClient
	metrics            metrics.IMetrics
	audiences          map[string]struct{}
	audiencesMtx       *sync.RWMutex
	sessionID          string
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
}

type SnitchRequest struct {
	ComponentName string
	OperationType OperationType
	OperationName string
	Data          []byte
}

type SnitchResponse struct {
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

	s := &Snitch{
		functions:          make(map[string]*function),
		functionsMtx:       &sync.RWMutex{},
		ServerClient:       serverClient,
		pipelines:          make(map[string]map[string]*protos.Command),
		pipelinesMtx:       &sync.RWMutex{},
		pipelinesPaused:    make(map[string]map[string]*protos.Command),
		pipelinesPausedMtx: &sync.RWMutex{},
		Config:             cfg,
		metrics:            m,
		sessionID:          uuid.New().String(),
	}

	if cfg.DryRun {
		cfg.Logger.Warn("data pipelines running in dry run mode")
	}

	// Start register
	loop := director.NewFreeLooper(director.FOREVER, make(chan error, 1))
	go s.register(loop)

	return s, nil
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
			to = "1s"
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
			to = "1s"
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
		if err := s.ServerClient.NewAudience(ctx, aud); err != nil {
			s.Logger.Errorf("failed to add audience: %s", err)
		}
	}()
}

func (s *Snitch) runStep(ctx context.Context, step *protos.PipelineStep, data []byte) (*protos.WASMResponse, error) {
	// Get WASM module
	f, err := s.getFunction(ctx, step)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get wasm data")
	}

	req := &protos.WASMRequest{
		Input: data,
		Step:  step,
	}

	reqBytes, err := proto.Marshal(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal WASM request")
	}

	// Run WASM module
	respBytes, err := f.Exec(ctx, reqBytes)
	if err != nil {
		return nil, errors.Wrap(err, "failed to execute wasm module")
	}

	resp := &protos.WASMResponse{}
	if err := proto.Unmarshal(respBytes, resp); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal WASM response")
	}

	return resp, nil
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

func (s *Snitch) Process(ctx context.Context, req *SnitchRequest) (*SnitchResponse, error) {
	if req == nil {
		return nil, errors.New("request cannot be nil")
	}

	payloadSize := len(req.Data)

	aud := &protos.Audience{
		ServiceName:   s.ServiceName,
		ComponentName: req.ComponentName,
		OperationType: protos.OperationType(req.OperationType),
		OperationName: req.OperationName,
	}

	pipelines := s.getPipelines(ctx, aud)
	if len(pipelines) == 0 {
		// No pipelines for this mode, nothing to do
		return &SnitchResponse{Data: req.Data}, nil
	}

	if payloadSize > MaxPayloadSize {
		//_ = s.metrics.Incr(ctx, &types.CounterEntry{
		//	Name:   types.CounterSizeExceeded,
		//	Type:   types.CounterTypeCount,
		//	Labels: map[string]string{"service_name": s.ServiceName, "audience": audToStr(aud)},
		//	Value:  1,
		//})
		msg := fmt.Sprintf("data size exceeds maximum, skipping pipelines on audience %s", audToStr(aud))
		s.Logger.Warn(msg)
		return &SnitchResponse{Data: req.Data, Error: true, Message: msg}, nil
	}

	for _, pipeline := range pipelines {
		for _, step := range pipeline.GetAttachPipeline().GetPipeline().Steps {
			wasmResp, err := s.runStep(ctx, step, req.Data)
			if err != nil {
				shouldContinue := s.handleConditions(ctx, step.OnFailure, pipeline.GetAttachPipeline().GetPipeline(), step, aud)
				if !shouldContinue {
					return &SnitchResponse{
						Data:    wasmResp.Output,
						Error:   true,
						Message: err.Error(),
					}, nil
				}
			}

			// Check on success and on-failures
			switch wasmResp.ExitCode {
			case protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS:
				shouldContinue := s.handleConditions(ctx, step.OnSuccess, pipeline.GetAttachPipeline().GetPipeline(), step, aud)
				if !shouldContinue {
					return &SnitchResponse{
						Data:    wasmResp.Output,
						Error:   false,
						Message: "",
					}, nil
				}
			case protos.WASMExitCode_WASM_EXIT_CODE_FAILURE:
				shouldContinue := s.handleConditions(ctx, step.OnFailure, pipeline.GetAttachPipeline().GetPipeline(), step, aud)
				if !shouldContinue {
					return &SnitchResponse{
						Data:    wasmResp.Output,
						Error:   false,
						Message: "",
					}, nil
				}
			}
		}
	}

	return nil, nil
}

func (s *Snitch) handleConditions(
	ctx context.Context,
	conditions []protos.PipelineStepCondition,
	pipeline *protos.Pipeline,
	step *protos.PipelineStep,
	aud *protos.Audience,
) bool {
	shouldContinue := true
	for _, condition := range conditions {
		switch condition {
		case protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_NOTIFY:
			s.Logger.Debugf("Step '%s' failed, notifying", step.Name)
			if !s.DryRun {
				if err := s.ServerClient.Notify(ctx, pipeline, step, aud); err != nil {
					s.Logger.Errorf("failed to notify condition: %v", err)
				}
			}
		case protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT:
			s.Logger.Debugf("Step '%s' failed, aborting further pipeline steps", step.Name)
			shouldContinue = false
		default:
			// Assume continue
			s.Logger.Debugf("Step '%s' failed, continuing to next step", step.Name)
		}
	}

	return shouldContinue
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
