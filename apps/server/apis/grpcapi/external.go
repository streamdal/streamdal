package grpcapi

import (
	"bytes"
	"context"
	"crypto/sha1"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/streamdal/apps/server/services/store"
	"github.com/streamdal/streamdal/apps/server/types"
	"github.com/streamdal/streamdal/apps/server/util"
	"github.com/streamdal/streamdal/apps/server/validate"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

const (
	// audienceRateInterval is how often GetAudienceRates() will send new data to the frontend
	audienceRateInterval = time.Second

	// streamKeepaliveInterval is how often we send a keepalive on gRPC streams
	streamKeepaliveInterval = 10 * time.Second
)

// ExternalServer implements the external GRPC API interface
type ExternalServer struct {
	GRPCAPI
	// Must be implemented in order to satisfy the protos ExternalServer interface
	protos.UnimplementedExternalServer
}

func (g *GRPCAPI) newExternalServer() *ExternalServer {
	return &ExternalServer{
		GRPCAPI: *g,
	}
}

func (s *ExternalServer) GetAll(ctx context.Context, req *protos.GetAllRequest) (*protos.GetAllResponse, error) {
	if err := validate.GetAllRequest(req); err != nil {
		return nil, errors.Wrap(err, "invalid get all request")
	}

	// Fetch live/connected SDK clients
	liveInfo, err := s.getAllLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get live info")
	}

	// Fetch all recorded audiences
	audiences, err := s.Options.StoreService.GetAudiences(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get audiences")
	}

	// Fetch all defined pipelines
	pipelines, err := s.getAllPipelineInfo(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipelines")
	}

	allPipelineConfigs, err := s.Options.StoreService.GetAllConfig(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get config")
	}

	// Convert map of *protos.Audience:*protos.PipelineConfigs to string:*protos.PipelineConfigs
	convAllPipelineConfigs := util.ConvertPipelineConfigsAudToStr(allPipelineConfigs)

	return &protos.GetAllResponse{
		Live:                   liveInfo,
		Audiences:              audiences,
		Pipelines:              pipelines,
		Configs:                convAllPipelineConfigs,
		GeneratedAtUnixTsNsUtc: time.Now().UTC().UnixNano(),
	}, nil
}

func (s *ExternalServer) GetAllStream(req *protos.GetAllRequest, server protos.External_GetAllStreamServer) error {
	if err := validate.GetAllRequest(req); err != nil {
		return errors.Wrap(err, "invalid get all request")
	}

	llog := s.log.WithFields(logrus.Fields{
		"method": "GetAllStream",
	})

	// Generate initial GetAllResponse
	resp, err := s.GetAll(server.Context(), req)
	if err != nil {
		llog.Errorf("unable to complete initial GetAll: %s", err)
		return fmt.Errorf("unable to complete initial GetAll: %s", err)
	}

	// Send initial response
	if err := server.Send(resp); err != nil {
		llog.Errorf("unable to send initial GetAll response: %s", err)
		return fmt.Errorf("unable to send initial GetAll response: %s", err)
	}

	// Cleanup after Listen()
	requestID := util.CtxRequestId(server.Context())
	defer s.Options.PubSubService.Close(types.PubSubChangesTopic, requestID)

	sendInProgress := false

	keepaliveTicker := time.NewTicker(streamKeepaliveInterval)
	defer keepaliveTicker.Stop()

MAIN:
	for {
		select {
		case <-server.Context().Done():
			llog.Debug("client closed connection")
			break MAIN
		case <-s.Options.ShutdownContext.Done():
			llog.Debug("server shutting down")
			break MAIN
		case <-s.Options.PubSubService.Listen(types.PubSubChangesTopic, requestID):
			s.log.Debug("received update on the changes pubsub topic")

			if sendInProgress {
				llog.Debug("send in progress, skipping changes message")
				continue
			}

			sendInProgress = true

			llog.Debug("launching goroutine to send delayed GetAllResponse")

			// Artificial update slowdown -- we do this to avoid spamming the
			// client with updates when there are many concurrent Listen() hits
			go func() {
				defer func() {
					sendInProgress = false
				}()

				time.Sleep(100 * time.Millisecond)

				llog.Debug("received changes message via pubsub")

				// Generate a GetAllResponse
				resp, err := s.GetAll(server.Context(), req)
				if err != nil {
					llog.Errorf("unable to complete GetAll: %s", err)
					return
				}

				// Send response
				if err := server.Send(resp); err != nil {
					llog.Errorf("unable to send GetAll response: %s", err)
					return
				}
			}()
		case <-keepaliveTicker.C:
			if err := server.Send(&protos.GetAllResponse{
				XKeepalive: util.Pointer(true),
			}); err != nil {
				s.log.Errorf("GetAllStream(): unable to send keepalive message: %v", err)
			}
		}
	}

	llog.Debug("closing stream")

	return nil
}

func (s *ExternalServer) getAllLive(ctx context.Context) ([]*protos.LiveInfo, error) {
	liveInfo := make([]*protos.LiveInfo, 0)

	liveData, err := s.Options.StoreService.GetLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get live data")
	}

	for _, v := range liveData {
		live := &protos.LiveInfo{
			Audiences: make([]*protos.Audience, 0),
		}

		// If register entry, fill out client info
		if v.Register {
			if err := validate.ClientInfo(v.Value); err != nil {
				s.log.Errorf("getAllLive: unable to validate client info for session id '%s': %v", v.SessionID, err)
				continue
			}

			// There might be no audience - service name + node name etc. should be in ClientInfo though!

			live.Client = v.Value

			liveInfo = append(liveInfo, live)

			// Audiences will get filled out later
		}
	}

	// No register entries == no one connected to any instances of server
	if len(liveData) == 0 {
		return liveInfo, nil
	}

	// Have register entries - fill out audiences for each
	for _, li := range liveInfo {
		// Find all live entry audiences with same session ID (and are NOT register)
		for _, ld := range liveData {
			if *li.Client.XSessionId == ld.SessionID && !ld.Register {
				li.Audiences = append(li.Audiences, ld.Audience)
			}
		}
	}

	return liveInfo, nil
}

// getAllPipelineInfo returns a map of pipeline IDs to pipeline info.
// *protos.PipelineInfo contains the pipeline itself and a list of audiences the
// pipeline is attached to.
func (s *ExternalServer) getAllPipelineInfo(ctx context.Context) (map[string]*protos.PipelineInfo, error) {
	gen := make(map[string]*protos.PipelineInfo)

	// Get all pipelines
	allPipelines, err := s.Options.StoreService.GetPipelines(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipelines")
	}

	for pipelineID, pipeline := range allPipelines {
		util.StripWASMFields(pipeline)

		gen[pipelineID] = &protos.PipelineInfo{
			Audiences: make([]*protos.Audience, 0),
			Pipeline:  pipeline,
		}
	}

	// Get audience <-> pipeline mappings
	allPipelineConfigs, err := s.Options.StoreService.GetAllConfig(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipeline config")
	}

	// Update pipeline info with info about attached pipelines
	for aud, pipelineConfigs := range allPipelineConfigs {
		for _, p := range pipelineConfigs.Configs {
			if _, ok := gen[p.Id]; ok {
				gen[p.Id].Audiences = append(gen[p.Id].Audiences, aud)
			}
		}
	}

	return gen, nil
}

// GetPipelines returns a list of all known pipelines.
func (s *ExternalServer) GetPipelines(ctx context.Context, req *protos.GetPipelinesRequest) (*protos.GetPipelinesResponse, error) {
	if err := validate.GetPipelinesRequest(req); err != nil {
		return nil, errors.Wrap(err, "invalid get pipelines request")
	}

	// Read all keys in "streamdal_pipelines"
	pipelines, err := s.Options.StoreService.GetPipelines(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipelines")
	}

	// Convert map to slice
	pipelineSlice := make([]*protos.Pipeline, 0)

	for _, pipeline := range pipelines {
		pipelineSlice = append(pipelineSlice, pipeline)

		// Strip WASM fields (to save on b/w)
		util.StripWASMFields(pipeline)
	}

	return &protos.GetPipelinesResponse{
		Pipelines: pipelineSlice,
	}, nil
}

// GetPipeline returns a single pipeline by ID.
func (s *ExternalServer) GetPipeline(ctx context.Context, req *protos.GetPipelineRequest) (*protos.GetPipelineResponse, error) {
	if err := validate.GetPipelineRequest(req); err != nil {
		return nil, errors.Wrap(err, "invalid get pipeline request")
	}

	pipeline, err := s.Options.StoreService.GetPipeline(ctx, req.PipelineId)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipelines")
	}

	// Strip WASM fields (to save on b/w)
	util.StripWASMFields(pipeline)

	pipeline.XNotificationConfigs = make([]*protos.NotificationConfig, 0)

	return &protos.GetPipelineResponse{
		Pipeline: pipeline,
	}, nil
}

// CreatePipeline creates a new pipeline and saves it to the store.
func (s *ExternalServer) CreatePipeline(ctx context.Context, req *protos.CreatePipelineRequest) (*protos.CreatePipelineResponse, error) {
	if err := validate.CreatePipelineRequest(req); err != nil {
		return nil, errors.Wrap(err, "invalid create pipeline request")
	}

	if s.Options.DemoMode {
		return &protos.CreatePipelineResponse{
			Message:    "Demo mode, request ignored",
			PipelineId: req.Pipeline.Id,
		}, nil
	}

	// Create ID for pipeline
	req.Pipeline.Id = util.GenerateUUID()

	// Populate WASM fields
	if err := util.PopulateWASMFields(req.Pipeline, s.Options.Config.WASMDir); err != nil {
		return nil, errors.Wrap(err, "unable to populate WASM fields")
	}

	if err := s.Options.StoreService.CreatePipeline(ctx, req.Pipeline); err != nil {
		return nil, errors.Wrap(err, "unable to store pipeline")
	}

	// Send telemetry
	telTags := []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"status", "detached"},
	}
	_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumPipelines, 1, 1.0, telTags...)

	for _, step := range req.Pipeline.Steps {
		stepTags := []statsd.Tag{
			{"install_id", s.Options.InstallID},
			{"pipeline_id", req.Pipeline.Id},
			{"step_type", util.GetStepType(step)},
		}

		_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumSteps, 1, 1.0, stepTags...)
	}

	return &protos.CreatePipelineResponse{
		Message:    "Pipeline created successfully",
		PipelineId: req.Pipeline.Id,
	}, nil
}

// UpdatePipeline updates an existing pipeline (and broadcasts the update which
// will cause the broadcast handlers to emit SetPipeline commands to any
// connected SDKs).
func (s *ExternalServer) UpdatePipeline(ctx context.Context, req *protos.UpdatePipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.UpdatePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	// Is this a known pipeline?
	originalPipeline, err := s.Options.StoreService.GetPipeline(ctx, req.Pipeline.Id)
	if err != nil {
		if errors.Is(err, store.ErrPipelineNotFound) {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_NOT_FOUND, err.Error()), nil
		}

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Re-populate WASM bytes (since they are stripped for UI)
	if err := util.PopulateWASMFields(req.Pipeline, s.Options.Config.WASMDir); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, errors.Wrap(err, "unable to repopulate WASM data").Error()), nil
	}

	// Update pipeline in storage
	if err := s.Options.StoreService.UpdatePipeline(ctx, req.Pipeline); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Send telemetry
	s.sendStepDeltaTelemetry(originalPipeline, req.Pipeline)

	// Pipeline exists - broadcast the update; handlers will emit updated
	// SetPipelines command to any connected SDKs.
	if err := s.Options.BusService.BroadcastUpdatePipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("pipeline '%s' updated", req.Pipeline.Id),
	}, nil
}

// sendStepDeltaTelemetry sends telemetry for the delta between the original and updated pipeline steps
// We use a simple sha1 hash of the step in order to account for any modifications to the step. For example
// if a step type changes from detective to transform, we still want to count it as a step deletion and addition
// since we have the step type as a tag. Otherwise we might be incrementing/decrementing with the wrong tags.
func (s *ExternalServer) sendStepDeltaTelemetry(original, updated *protos.Pipeline) {
	originalSteps := make(map[string]*protos.PipelineStep)
	for _, step := range original.Steps {
		hash := fmt.Sprintf("%x", sha1.Sum([]byte(step.String())))
		originalSteps[hash] = step
	}

	updatedSteps := make(map[string]*protos.PipelineStep)
	for _, step := range updated.Steps {
		hash := fmt.Sprintf("%x", sha1.Sum([]byte(step.String())))
		updatedSteps[hash] = step
	}

	// Perform delta on steps in originalPipeline vs updateSteps
	for _, step := range original.Steps {
		// Step not included in updated steps, means it was deleted or type modified
		if _, ok := updatedSteps[step.String()]; !ok {
			// Step was deleted
			stepTags := []statsd.Tag{
				{"install_id", s.Options.InstallID},
				{"pipeline_id", original.Id},
				{"step_type", util.GetStepType(step)},
			}

			_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumSteps, -1, 1.0, stepTags...)
			continue
		}
	}

	for _, step := range updated.Steps {
		// Step not included in original steps, means it was added or type modified
		if _, ok := originalSteps[step.String()]; !ok {
			// Step was added
			stepTags := []statsd.Tag{
				{"install_id", s.Options.InstallID},
				{"pipeline_id", original.Id},
				{"step_type", util.GetStepType(step)},
				{"step_subtype", util.GetStepSubType(step)},
			}

			_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumSteps, 1, 1.0, stepTags...)
			continue
		}
	}
}

func (s *ExternalServer) DeletePipeline(ctx context.Context, req *protos.DeletePipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.DeletePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	// Does this pipeline exist?
	if _, err := s.Options.StoreService.GetPipeline(ctx, req.PipelineId); err != nil {
		if errors.Is(err, store.ErrPipelineNotFound) {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_NOT_FOUND, err.Error()), nil
		}

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			"unable to fetch existing pipeline: "+err.Error()), nil
	}

	audiences, err := s.Options.StoreService.GetAudiencesByPipelineID(ctx, req.PipelineId)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			"unable to get audiences by pipeline: "+err.Error()), nil
	}

	// Inject audiences into req so bus handler doesn't have to perform config lookup
	req.XAudiences = audiences

	// Pipeline exists, delete it
	if err := s.Options.StoreService.DeletePipeline(ctx, req.PipelineId); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			"unable to delete pipeline: "+err.Error()), nil
	}

	// Delete pipeline config (we can safely delete because bus handler will just
	// emit a SetPipelines cmd without the pipeline config)
	if _, err := s.Options.StoreService.DeletePipelineConfig(ctx, req.PipelineId); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			"unable to delete pipeline config(s): "+err.Error()), nil
	}

	// Send telemetry
	status := "detached"
	if s.Options.StoreService.IsPipelineAttachedAny(ctx, req.PipelineId) {
		status = "attached"
	}

	_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumPipelines, -1, 1.0, []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"status", status},
	}...)

	// Zero out step gauge for this pipeline
	s.Options.Telemetry.Gauge(types.GaugeUsageNumSteps, 0, 1.0, []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"pipeline_id", req.PipelineId},
	}...)

	// Now broadcast delete
	if err := s.Options.BusService.BroadcastDeletePipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("pipeline '%s' deleted", req.PipelineId),
	}, nil
}

func (s *ExternalServer) SetPipelines(ctx context.Context, req *protos.SetPipelinesRequest) (*protos.StandardResponse, error) {
	if err := validate.SetPipelinesRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	// Do these pipelines exist?
	for _, pipelineID := range req.PipelineIds {
		if _, err := s.Options.StoreService.GetPipeline(ctx, pipelineID); err != nil {
			if errors.Is(err, store.ErrPipelineNotFound) {
				return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_NOT_FOUND, err.Error()), nil
			}

			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
		}
	}

	// 02.02.2024 - Decided to not require an audience check. This shouldn't
	// cause any issues and would be helpful/needed for when we want to support
	// setting up pipeline configurations via terraform and other automation
	// tools.

	// Get previous pipelines for telemetry
	existingPipelines, err := s.Options.StoreService.GetPipelineConfigsByAudience(ctx, req.Audience)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			fmt.Sprintf("unable to get existing pipelines by audience: %s", err)), nil
	}

	// NOTE: We do not care about any pipelines that the SDK is executing - the
	// SDK should be dumb - it receives a new SetPipeline command and discards +
	// replaces the pipelines it's executing with the new ones in SetPipeline cmd.

	// Store the new pipeline config
	if err := s.Options.StoreService.SetPipelines(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			fmt.Sprintf("unable to store pipelines: %s", err)), nil
	}

	// Update ACTIVE pipeline usage telemetry
	_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumPipelines, int64(len(req.PipelineIds)), 1.0, []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"status", "active"},
	}...)

	// Figure out how many pipelines have been _removed_ so we can decrement "inactive" gauge
	delta := len(req.PipelineIds) - len(existingPipelines.Configs)

	// Detach metrics are always negative
	if delta > 0 {
		delta = -delta
	}

	// Update INACTIVE pipeline usage telemetry
	_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumPipelines, int64(delta), 1.0, []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"status", "inactive"},
	}...)

	// Pipeline exists, broadcast SetPipelines request to other nodes so they
	// can emit a SetPipelines command + emit a *protos.GetAllResponse update
	// for UI.
	if err := s.Options.BusService.BroadcastSetPipelines(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:   util.CtxRequestId(ctx),
		Code: protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("successfully set '%d' pipelines for audience '%s'",
			len(req.PipelineIds), util.AudienceToStr(req.Audience)),
	}, nil
}

// pause true == pause, false == resume
func (s *ExternalServer) setPausePipeline(ctx context.Context, aud *protos.Audience, pipelineID string, pause bool) (*protos.StandardResponse, error) {
	var action string

	if pause {
		action = "pause"
	} else {
		action = "resume"
	}

	// Does this pipeline exist?
	if _, err := s.Options.StoreService.GetPipeline(ctx, pipelineID); err != nil {
		if errors.Is(err, store.ErrPipelineNotFound) {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_NOT_FOUND, "pipeline not found"), nil
		}

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			fmt.Sprintf("unable to lookup pipeline: %s", err)), nil
	}

	// Is this pipeline being used?
	config, err := s.Options.StoreService.GetPipelineConfigsByAudience(ctx, aud)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			fmt.Sprintf("unable to get config by audience: %s", err)), nil
	}

	if len(config.Configs) == 0 {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_OK,
			fmt.Sprintf("nothing to do - pipeline '%s' not being used by audience '%s'", pipelineID, util.AudienceToStr(aud))), nil
	}

	// Can attempt to pause/resume; Pause/ResumePipeline() will noop if pipeline is already paused/resumed
	updated, err := s.Options.StoreService.SetPauseResume(ctx, aud, pipelineID, pause)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			fmt.Sprintf("unable to set pause/resume for pipeline: %s", err)), nil
	}

	statusMessage := fmt.Sprintf("pipeline '%s' for audience '%s' is already %sd", pipelineID, util.AudienceToStr(aud), action)

	// Only broadcast change if it was actually updated
	if updated {
		if err := s.Options.BusService.BroadcastPauseResume(ctx, aud, pipelineID, pause); err != nil {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
				fmt.Sprintf("unable to broadcast pause/resume: %s", err)), nil
		}

		statusMessage = fmt.Sprintf("pipeline '%s' for audience '%s' %sd", pipelineID, util.AudienceToStr(aud), action)
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: statusMessage,
	}, nil
}

func (s *ExternalServer) PausePipeline(ctx context.Context, req *protos.PausePipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.PausePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	return s.setPausePipeline(ctx, req.Audience, req.PipelineId, true)
}

func (s *ExternalServer) ResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.ResumePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	return s.setPausePipeline(ctx, req.Audience, req.PipelineId, false)
}

func (s *ExternalServer) CreateNotification(ctx context.Context, req *protos.CreateNotificationRequest) (*protos.StandardResponse, error) {
	if err := validate.CreateNotificationRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	req.Notification.Id = util.Pointer(util.GenerateUUID())

	if err := s.Options.StoreService.CreateNotificationConfig(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Notification config created",
	}, nil
}
func (s *ExternalServer) UpdateNotification(ctx context.Context, req *protos.UpdateNotificationRequest) (*protos.StandardResponse, error) {
	if err := validate.UpdateNotificationRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	if err := s.Options.StoreService.UpdateNotificationConfig(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Notification config update",
	}, nil
}

func (s *ExternalServer) DeleteNotification(ctx context.Context, req *protos.DeleteNotificationRequest) (*protos.StandardResponse, error) {
	if err := validate.DeleteNotificationRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	if err := s.Options.StoreService.DeleteNotificationConfig(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Notification config deleted",
	}, nil
}

func (s *ExternalServer) GetNotifications(ctx context.Context, req *protos.GetNotificationsRequest) (*protos.GetNotificationsResponse, error) {
	cfgs, err := s.Options.StoreService.GetNotificationConfigs(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get notification configs")
	}

	for _, cfg := range cfgs {
		stripSensitiveFields(cfg)
	}

	return &protos.GetNotificationsResponse{Notifications: cfgs}, nil
}

func (s *ExternalServer) GetNotification(ctx context.Context, req *protos.GetNotificationRequest) (*protos.GetNotificationResponse, error) {
	if err := validate.GetNotificationRequest(req); err != nil {
		return nil, errors.Wrap(err, "invalid request")
	}

	cfg, err := s.Options.StoreService.GetNotificationConfig(ctx, req)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get notification config")
	}

	stripSensitiveFields(cfg)

	return &protos.GetNotificationResponse{Notification: cfg}, nil
}

// stripSensitiveFields blacks out sensitive fields in notification configs, before returning data to the frontend
func stripSensitiveFields(cfg *protos.NotificationConfig) {
	switch cfg.Type {
	case protos.NotificationType_NOTIFICATION_TYPE_EMAIL:
		switch cfg.GetEmail().Type {
		case protos.NotificationEmail_TYPE_SMTP:
			smtp := cfg.GetEmail().GetSmtp()
			smtp.Password = ""
		case protos.NotificationEmail_TYPE_SES:
			ses := cfg.GetEmail().GetSes()
			ses.SesSecretAccessKey = ""
		}
	case protos.NotificationType_NOTIFICATION_TYPE_PAGERDUTY:
		pd := cfg.GetPagerduty()
		pd.Token = ""
	case protos.NotificationType_NOTIFICATION_TYPE_SLACK:
		slack := cfg.GetSlack()
		slack.BotToken = ""
	}
}

func (s *ExternalServer) AttachNotification(ctx context.Context, _ *protos.AttachNotificationRequest) (*protos.StandardResponse, error) {
	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_GENERIC_ERROR,
		Message: "Endpoint is deprecated, do not use",
	}, nil
}

func (s *ExternalServer) DetachNotification(ctx context.Context, _ *protos.DetachNotificationRequest) (*protos.StandardResponse, error) {
	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_GENERIC_ERROR,
		Message: "Endpoint is deprecated, do not use",
	}, nil
}

// DeleteAudience will delete an audience. It will error if the audience has a
// pipeline attached to it. To get around the error, you can set the "force"
// bool in the request to true. This will delete the audience and emit a
// SetPipelines command set to [] for any connected SDKs.
func (s *ExternalServer) DeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) (*protos.StandardResponse, error) {
	if err := validate.DeleteAudienceRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	// Determine if the audience is attached to any pipelines
	pipelineConfigs, err := s.Options.StoreService.GetPipelineConfigsByAudience(ctx, req.Audience)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			fmt.Sprintf("unable to fetch config by audience: %s", err.Error())), nil
	}

	if len(pipelineConfigs.Configs) > 0 && !req.GetForce() {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
			fmt.Sprintf("audience '%s' has '%d' attached pipelines, specify force to remove", util.AudienceToStr(req.Audience),
				len(pipelineConfigs.Configs))), nil
	}

	// Either there are 0 attached pipelineConfigs or force is not set - either way
	// we can delete and broadcast - the broadcast handler will know to send a
	// SetPipelines cmd set to [] for connected SDKs.

	if err := s.Options.StoreService.DeleteAudience(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			fmt.Sprintf("unable to delete audience from store: %s", err.Error())), nil
	}

	// Broadcast delete to other nodes so that they can emit a SetPipelines cmd
	// set to [] and so that nodes emit a *protos.GetAll update for UI.
	if err := s.Options.BusService.BroadcastDeleteAudience(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("Audience deleted (force status '%t')", req.GetForce()),
	}, nil
}

// DeleteService is basically DeleteAudience - the only difference is that
// DeleteService will (potentially) delete *multiple* audiences (instead of one).
func (s *ExternalServer) DeleteService(ctx context.Context, req *protos.DeleteServiceRequest) (*protos.StandardResponse, error) {
	if err := validate.DeleteServiceRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	// Find all audiences for the service
	audiences, err := s.Options.StoreService.GetAudiencesByService(ctx, req.ServiceName)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			fmt.Sprintf("unable to get pipeline configs by audience: %s", err.Error())), nil
	}

	if len(audiences) == 0 {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_OK, fmt.Sprintf("Service '%s' deleted (has no audiences)", req.ServiceName)), nil
	}

	var numDeleted int

	// Determine if the audience is attached to any pipelines
	for _, audience := range audiences {
		pipelineConfigs, err := s.Options.StoreService.GetPipelineConfigsByAudience(ctx, audience)
		if err != nil {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
				fmt.Sprintf("unable to delete audience '%s' during service delete: %s", util.AudienceToStr(audience), err.Error())), nil
		}

		if len(pipelineConfigs.Configs) > 0 && !req.GetForce() {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
				fmt.Sprintf("audience '%s' has '%d' attached pipelines, specify force to remove", util.AudienceToStr(audience), len(pipelineConfigs.Configs))), nil
		}

		// Either there are 0 attached pipelines or force is set - either way
		// we can update store and broadcast - the broadcast handler will know
		// to send empty SetPipelines commands to connected SDKs.

		if err := s.Options.StoreService.DeleteAudience(ctx, &protos.DeleteAudienceRequest{
			Audience: audience,
		}); err != nil {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
				fmt.Sprintf("unable to delete audience '%s' during service delete: %s", util.AudienceToStr(audience), err.Error())), nil
		}

		// Broadcast delete to other nodes so that they can emit a SetPipelines cmd + update UI
		if err := s.Options.BusService.BroadcastDeleteAudience(ctx, &protos.DeleteAudienceRequest{
			Audience: audience,
		}); err != nil {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
		}

		numDeleted += 1
	}

	return &protos.StandardResponse{
		Id:   util.CtxRequestId(ctx),
		Code: protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("Service and '%d' audiences deleted (force '%t')",
			numDeleted, req.GetForce()),
	}, nil
}

func (s *ExternalServer) Tail(req *protos.TailRequest, server protos.External_TailServer) error {
	s.log.Debug("external.Tail(): received tail request")

	// Each tail request gets its own unique ID so that we can receive messages over
	// a unique channel from RedisBackend
	req.Audience.ServiceName = strings.ToLower(req.Audience.GetServiceName())
	req.Audience.OperationName = strings.ToLower(req.Audience.GetOperationName())
	req.Audience.ComponentName = strings.ToLower(req.Audience.GetComponentName())

	if err := validate.StartTailRequest(req); err != nil {
		return errors.Wrap(err, "invalid tail request")
	}

	// Get channel for receiving TailResponse messages that get shipped over RedisBackend.
	// This should exist before TailRequest command is sent to the SDKs so that we are ready to receive
	// messages from RedisBackend
	sdkReceiveChan := s.Options.PubSubService.Listen(req.Id, util.CtxRequestId(server.Context()))

	s.log.Info("external.Tail(): broadcasting tail request")

	// Need to broadcast tail request because an SDK might be connected to a
	// different server instance. The broadcast handler that receives this message
	// is responsible for telling connected SDK to start tailing!
	if err := s.Options.BusService.BroadcastTailRequest(context.Background(), req); err != nil {
		return errors.Wrap(err, "unable to broadcast tail request")
	}

	// When the connection to the endpoint is closed, emit a STOP event which will be broadcast
	// to all server instances and their connected clients so that they can stop tailing.
	//
	// handlers.handleTailCommand() will close the intra-server golang channel preventing
	// any more messages from being sent to the client. Any unread messages still in the redis
	// pubsub topic "streamdal_events:tail:{$tail_request_id}" will be discarded.
	defer func() {
		req.Type = protos.TailRequestType_TAIL_REQUEST_TYPE_STOP
		if err := s.Options.BusService.BroadcastTailRequest(context.Background(), req); err != nil {
			s.log.Error(errors.Wrap(err, "unable to broadcast stop tail request"))
		}
	}()

	tailTicker := time.NewTicker(time.Second)
	defer tailTicker.Stop()

	keepaliveTicker := time.NewTicker(streamKeepaliveInterval)
	defer keepaliveTicker.Stop()

	// Create a TTL'd entry for the request and keep it alive for the duration
	// of this request.
	activeTailKey, err := s.Options.StoreService.AddActiveTailRequest(server.Context(), req)
	if err != nil {
		return errors.Wrap(err, "unable to store tail request")
	}

	// Best effort: delete the active tail request key when client disconnects.
	// If this does not work - the key will TTL out after RedisActiveTailTTL.
	defer func() {
		// Background context here since server context will be cancelled on exit
		if _, err := s.Options.RedisBackend.Del(context.Background(), activeTailKey).Result(); err != nil {
			s.log.Errorf("DEFER: unable to delete active tail request key '%s': %s", activeTailKey, err)
		}
	}()

	for {
		select {
		case <-server.Context().Done():
			s.log.Debug("frontend closed tail stream")
			return nil
		case <-s.Options.ShutdownContext.Done():
			s.log.Debug("server shutting down, exiting tail stream")
			return nil
		case msg, isOpen := <-sdkReceiveChan:
			// Just in case there is a race between stop emitted from another server and the channel read
			if !isOpen {
				s.log.Errorf("BUG: tried to read from closed channel '%s', tail is already closed", req.Id)
				return nil
			}

			tr, ok := msg.(*protos.TailResponse)
			if !ok {
				s.log.Errorf("unknown message received from connected SDK session: %v", msg)
				continue
			}

			// Send tail response to client
			if err := server.Send(tr); err != nil {
				return errors.Wrap(err, "unable to send tail stream response")
			}
		case <-tailTicker.C:
			// Keep the tail request key alive while this req is open
			if _, err := s.Options.RedisBackend.Expire(server.Context(), activeTailKey, store.RedisActiveTailTTL).Result(); err != nil {
				s.log.Errorf("unable to refresh active tail request for key '%s': %s", activeTailKey, err)
			}
		case <-keepaliveTicker.C:
			if err := server.Send(&protos.TailResponse{
				XKeepalive: util.Pointer(true),
			}); err != nil {
				s.log.Errorf("Tail(): error sending keepalive message: %s", err)
			}
		}

	}
}

func (s *ExternalServer) PauseTail(ctx context.Context, req *protos.PauseTailRequest) (*protos.StandardResponse, error) {
	if err := validate.PauseTailRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	tailReq, err := s.Options.StoreService.PauseTailRequest(ctx, req)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	tailReq.Type = protos.TailRequestType_TAIL_REQUEST_TYPE_PAUSE

	if err := s.Options.BusService.BroadcastTailRequest(ctx, tailReq); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_OK, "tail paused"), nil
}

func (s *ExternalServer) ResumeTail(ctx context.Context, req *protos.ResumeTailRequest) (*protos.StandardResponse, error) {
	if err := validate.ResumeTailRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	// Get original tail request
	tailReq, err := s.Options.StoreService.ResumeTailRequest(ctx, req)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	tailReq.Type = protos.TailRequestType_TAIL_REQUEST_TYPE_RESUME

	if err := s.Options.BusService.BroadcastTailRequest(ctx, tailReq); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_OK, "tail resumed"), nil
}

func (s *ExternalServer) GetMetrics(_ *protos.GetMetricsRequest, server protos.External_GetMetricsServer) error {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	// Technically, GetMetrics() does not need a Keepalive since it will send
	// metrics every 1s, even if there are no new metrics. However, to keep
	// things uniform, we send keepalive msgs for all streaming endpoints.
	keepaliveTicker := time.NewTicker(streamKeepaliveInterval)
	defer keepaliveTicker.Stop()

	for {
		select {
		case <-server.Context().Done():
			return nil
		case <-ticker.C:
			sliceCounters, err := s.Options.MetricsService.FetchCounters(server.Context())
			if err != nil {
				s.log.Errorf("error getting counters: %s", err)
				continue
			}

			counters := make(map[string]*protos.Metric)

			for _, c := range sliceCounters {
				counters[util.CounterName(c.Name, c.Labels)] = c
			}

			if err := server.SendMsg(&protos.GetMetricsResponse{Metrics: counters}); err != nil {
				s.log.Errorf("error sending metrics: %s", err)
			}
		case <-keepaliveTicker.C:
			if err := server.Send(&protos.GetMetricsResponse{
				XKeepalive: util.Pointer(true),
			}); err != nil {
				s.log.Errorf("GetMetrics(): error sending keepalive message: %s", err)
			}
		}
	}
}

func (s *ExternalServer) GetAudienceRates(_ *protos.GetAudienceRatesRequest, server protos.External_GetAudienceRatesServer) error {
	ticker := time.NewTicker(audienceRateInterval)
	defer ticker.Stop()

	keepaliveTicker := time.NewTicker(streamKeepaliveInterval)
	defer keepaliveTicker.Stop()

	for {
		select {
		case <-server.Context().Done():
			// User has exited the page
			return nil
		case <-ticker.C:
			rates := s.Options.MetricsService.GetAllRateCounters(server.Context())

			resp := &protos.GetAudienceRatesResponse{
				Rates: make(map[string]*protos.AudienceRate),
			}

			for audStr, counter := range rates {
				row := &protos.AudienceRate{
					Bytes:     float64(counter.Bytes.Rate()) / 10,
					Processed: float64(counter.Processed.Rate()) / 10,
				}

				resp.Rates[audStr] = row
			}

			if err := server.Send(resp); err != nil {
				s.log.Errorf("error sending audience rates: %s", err)
			}
		case <-keepaliveTicker.C:
			if err := server.Send(&protos.GetAudienceRatesResponse{
				XKeepalive: util.Pointer(true),
			}); err != nil {
				s.log.Errorf("GetAudienceRates(): error sending keepalive message: %s", err)
			}
		}
	}
}

func (s *ExternalServer) GetSchema(ctx context.Context, req *protos.GetSchemaRequest) (*protos.GetSchemaResponse, error) {
	if err := validate.GetSchemaRequest(req); err != nil {
		return nil, errors.Wrap(err, "invalid get schema request")
	}

	schema, err := s.Options.StoreService.GetSchema(ctx, req.Audience)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get schema")
	}

	return &protos.GetSchemaResponse{
		Schema: schema,
	}, nil
}

func (s *ExternalServer) AppRegistrationStatus(_ context.Context, req *protos.AppRegistrationStatusRequest) (*protos.AppRegistrationStatusResponse, error) {
	u, err := url.Parse(types.UibffEndpoint + "/v1/registration")
	if err != nil {
		return nil, errors.Wrap(err, "unable to parse url")
	}

	params := url.Values{}
	params.Add("email", req.Email)
	u.RawQuery = params.Encode()

	resp, err := http.DefaultClient.Get(u.String())
	if err != nil {
		return nil, errors.Wrap(err, "unable to make request")
	}

	defer resp.Body.Close()

	// Decode response from jsonpb into proto message
	status := &protos.AppRegistrationStatusResponse{}

	if err := jsonpb.Unmarshal(resp.Body, status); err != nil {
		return nil, errors.Wrap(err, "unable to unmarshal response")
	}

	return status, nil
}

func (s *ExternalServer) AppRegister(ctx context.Context, req *protos.AppRegistrationRequest) (*protos.StandardResponse, error) {
	clusterID, err := s.Options.StoreService.GetInstallID(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get streamdal ID")
	}

	req.ClusterId = clusterID

	return s.uibffPostRequest("/v1/app/register/create", req)
}

func (s *ExternalServer) AppVerifyRegistration(_ context.Context, req *protos.AppVerifyRegistrationRequest) (*protos.StandardResponse, error) {
	return s.uibffPostRequest("/v1/app/register/verify", req)
}

func (s *ExternalServer) AppRegisterReject(ctx context.Context, req *protos.AppRegisterRejectRequest) (*protos.StandardResponse, error) {
	clusterID, err := s.Options.StoreService.GetInstallID(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get streamdal ID")
	}

	req.ClusterId = clusterID

	return s.uibffPostRequest("/v1/app/register/reject", req)
}

func (s *ExternalServer) uibffPostRequest(endpoint string, m proto.Message) (*protos.StandardResponse, error) {
	u, err := url.Parse(types.UibffEndpoint + endpoint)
	if err != nil {
		return nil, errors.Wrapf(err, "unable to parse url '%s'", types.UibffEndpoint+endpoint)
	}

	marshaler := jsonpb.Marshaler{}
	data, err := marshaler.MarshalToString(m)
	if err != nil {
		return nil, errors.Wrap(err, "unable to marshal request")
	}

	res, err := http.DefaultClient.Post(u.String(), "application/json", bytes.NewBuffer([]byte(data)))
	if err != nil {
		return nil, errors.Wrap(err, "unable to make request")
	}

	if res.StatusCode != http.StatusOK {
		return nil, errors.Errorf("non-OK status code: %d", res.StatusCode)
	}

	// Decode response from jsonpb into proto message
	resp := &protos.StandardResponse{}
	if err := jsonpb.Unmarshal(res.Body, resp); err != nil {
		return nil, errors.Wrap(err, "unable to unmarshal response")
	}

	return resp, nil
}

func (s *ExternalServer) Test(_ context.Context, req *protos.TestRequest) (*protos.TestResponse, error) {
	if req.Input == "" {
		req.Input = "no input provided"
	}

	return &protos.TestResponse{
		Output: "Pong: " + req.Input,
	}, nil
}

func demoResponse(ctx context.Context) (*protos.StandardResponse, error) {
	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Demo mode, request ignored",
	}, nil
}
