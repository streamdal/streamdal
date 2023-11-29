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

	"github.com/streamdal/protos/build/go/protos"

	"github.com/streamdal/server/services/store"
	"github.com/streamdal/server/types"
	"github.com/streamdal/server/util"
	"github.com/streamdal/server/validate"
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

	liveInfo, err := s.getAllLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get live info")
	}

	audiences, err := s.Options.StoreService.GetAudiences(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get audiences")
	}

	pipelines, err := s.getAllPipelines(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipelines")
	}

	configs, err := s.Options.StoreService.GetConfig(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get config")
	}

	configStrAudience := util.ConvertConfigStrAudience(configs)

	return &protos.GetAllResponse{
		Live:                   liveInfo,
		Audiences:              audiences,
		Pipelines:              pipelines,
		Config:                 configStrAudience,
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

func (s *ExternalServer) getAllPipelines(ctx context.Context) (map[string]*protos.PipelineInfo, error) {
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
			Paused:    make([]*protos.Audience, 0),
		}
	}

	// Get audience <-> pipeline mappings
	pipelineConfig, err := s.Options.StoreService.GetConfig(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipeline config")
	}

	// Update pipeline info with info about attached pipelines
	for aud, pipelineIDs := range pipelineConfig {
		for _, pipelineID := range pipelineIDs {
			if _, ok := gen[pipelineID]; ok {
				gen[pipelineID].Audiences = append(gen[pipelineID].Audiences, aud)
			}
		}
	}

	// Update pipeline info with state info
	pausedPipelines, err := s.Options.StoreService.GetPaused(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get paused pipelines")
	}

	for _, p := range pausedPipelines {
		if _, ok := gen[p.PipelineID]; ok {
			gen[p.PipelineID].Paused = append(gen[p.PipelineID].Paused, p.Audience)
		}
	}

	return gen, nil
}

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

	return &protos.GetPipelineResponse{
		Pipeline: pipeline,
	}, nil
}

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

	// Pipeline exists - broadcast it as there might be servers that have
	// a client that has an active registration using this pipeline (and it should
	// get updated)
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

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Pipeline exists, delete it
	if err := s.Options.StoreService.DeletePipeline(ctx, req.PipelineId); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
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

func (s *ExternalServer) AttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.AttachPipelineRequest(req); err != nil {
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

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	if err := s.Options.StoreService.AttachPipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Send telemetry
	_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumPipelines, 1, 1.0, []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"status", "attached"},
	}...)
	_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumPipelines, -1, 1.0, []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"status", "detached"},
	}...)

	// Pipeline exists, broadcast attach
	if err := s.Options.BusService.BroadcastAttachPipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("pipeline '%s' attached", req.PipelineId),
	}, nil
}

// Helper for determining what session ID's are using a pipeline ID
func (s *ExternalServer) getSessionIDsByPipelineID(ctx context.Context, pipelineID string) ([]string, error) {
	usage, err := s.Options.StoreService.GetPipelineUsage(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipeline usage in getPipelineUsageByPipelineID")
	}

	sessionIDs := make([]string, 0)

	for _, u := range usage {
		if u.PipelineId != pipelineID {
			continue
		}

		sessionIDs = append(sessionIDs, u.SessionId)
	}

	return sessionIDs, nil
}

func (s *ExternalServer) DetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.DetachPipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	// Does this pipeline exist?
	if _, err := s.Options.StoreService.GetPipeline(ctx, req.PipelineId); err != nil {
		if err == store.ErrPipelineNotFound {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_NOT_FOUND, err.Error()), nil
		}

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// What session ID's are using this pipeline ID?
	sessionIDs, err := s.getSessionIDsByPipelineID(ctx, req.PipelineId)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	s.log.Debugf("detach gRPC handler: found '%d' session ids", len(sessionIDs))

	// Inject session_id's into request
	req.XSessionIds = make([]string, 0)

	for _, sessionID := range sessionIDs {
		req.XSessionIds = append(req.XSessionIds, sessionID)
	}

	s.log.Debugf("injected request contains '%d' session ids", len(req.XSessionIds))

	// Broadcast detach to everyone
	if err := s.Options.BusService.BroadcastDetachPipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// We are able to immediately remove the config entry because the broadcast
	// handlers are not performing a Store lookup.
	if err := s.Options.StoreService.DetachPipeline(ctx, req); err != nil {
		s.log.Error(errors.Wrap(err, "unable to detach pipeline"))
	}

	// Send telemetry
	telTags := []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"status", "attached"},
	}
	_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageNumPipelines, 1, 1.0, telTags...)

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("pipeline '%s' detached", req.PipelineId),
	}, nil
}

func (s *ExternalServer) PausePipeline(ctx context.Context, req *protos.PausePipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.PausePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	// Does this pipeline exist?
	if _, err := s.Options.StoreService.GetPipeline(ctx, req.PipelineId); err != nil {
		if err == store.ErrPipelineNotFound {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_NOT_FOUND, err.Error()), nil
		}

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Can attempt to pause; PausePipeline() will noop if pipeline is already paused
	if err := s.Options.StoreService.PausePipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	if err := s.Options.BusService.BroadcastPausePipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("pipeline '%s' paused", req.PipelineId),
	}, nil
}

func (s *ExternalServer) ResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.ResumePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	// Does this pipeline exist?
	if _, err := s.Options.StoreService.GetPipeline(ctx, req.PipelineId); err != nil {
		if err == store.ErrPipelineNotFound {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_NOT_FOUND, err.Error()), nil
		}

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Can attempt to resume; ResumePipeline() will noop if pipeline is already running
	if err := s.Options.StoreService.ResumePipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Pipeline exists, broadcast resume
	if err := s.Options.BusService.BroadcastResumePipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("pipeline '%s' deleted", req.PipelineId),
	}, nil
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

func (s *ExternalServer) AttachNotification(ctx context.Context, req *protos.AttachNotificationRequest) (*protos.StandardResponse, error) {
	if err := validate.AttachNotificationRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	if err := s.Options.StoreService.AttachNotificationConfig(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Notification config attached",
	}, nil
}

func (s *ExternalServer) DetachNotification(ctx context.Context, req *protos.DetachNotificationRequest) (*protos.StandardResponse, error) {
	if err := validate.DetachNotificationRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	if err := s.Options.StoreService.DetachNotificationConfig(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Notification config detached",
	}, nil
}

func (s *ExternalServer) DeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) (*protos.StandardResponse, error) {
	if err := validate.DeleteAudienceRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	if s.Options.DemoMode {
		return demoResponse(ctx)
	}

	// Determine if the audience is attached to any pipelines
	attached, err := s.Options.StoreService.GetConfigByAudience(ctx, req.Audience)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	s.log.Debugf("request contents: %+v", req)

	// Force delete - detach audiences from pipelines
	if req.GetForce() {
		s.log.Debug("force delete requested")
		resp := s.forceDeleteAudience(ctx, attached, req.Audience)
		if resp != nil {
			return resp, nil
		}
	}

	if err := s.Options.StoreService.DeleteAudience(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Broadcast delete to other nodes so that they can emit an event for GetAllStream()
	if err := s.Options.BusService.BroadcastDeleteAudience(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Audience deleted",
	}, nil
}

func (s *ExternalServer) forceDeleteAudience(ctx context.Context, attached []string, audience *protos.Audience) *protos.StandardResponse {
	for _, pipelineID := range attached {
		s.log.Debugf("request to force delete audience '%s'; attempting to detach pipeline '%s'",
			util.AudienceToStr(audience), pipelineID)

		resp, err := s.DetachPipeline(ctx, &protos.DetachPipelineRequest{
			PipelineId: pipelineID,
			Audience:   audience,
		})

		// DetachPipeline can return both an error and a resp - need to check both
		if err != nil {
			return util.StandardResponse(
				ctx,
				protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
				fmt.Sprintf("received err during force detach for pipeline '%s', audience '%s': %s", pipelineID,
					util.AudienceToStr(audience), err),
			)
		}

		if resp != nil && resp.Code != protos.ResponseCode_RESPONSE_CODE_OK {
			return util.StandardResponse(
				ctx,
				protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
				fmt.Sprintf("received non-OK response during force detach for pipeline '%s', audience '%s': %s", pipelineID,
					util.AudienceToStr(audience), resp.Message),
			)
		}

		s.log.Debugf("successfully force detached pipeline '%s' from audience '%s'", pipelineID, util.AudienceToStr(audience))
	}

	return nil
}

func (s *ExternalServer) DeleteService(ctx context.Context, req *protos.DeleteServiceRequest) (*protos.StandardResponse, error) {
	if err := validate.DeleteServiceRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	// find all audiences for the service
	audiences, err := s.Options.StoreService.GetAudiencesByService(ctx, req.ServiceName)
	if err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Determine if the audience is attached to any pipelines
	for _, audience := range audiences {
		attached, err := s.Options.StoreService.GetConfigByAudience(ctx, audience)
		if err != nil {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
		}

		// If we're not forcing, and there are attached pipelines, return an error
		if !req.GetForce() {
			if len(attached) > 0 {
				return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, fmt.Sprintf("service '%s' still has attached pipelines, specify force to remove", req.ServiceName)), nil
			}
		}

		// We're forcing, so detach all pipelines
		s.log.Debug("force delete requested")
		resp := s.forceDeleteAudience(ctx, attached, audience)
		if resp != nil {
			return resp, nil
		}

		deleteReq := &protos.DeleteAudienceRequest{
			Audience: audience,
			Force:    util.Pointer(true),
		}

		if err := s.Options.StoreService.DeleteAudience(ctx, deleteReq); err != nil {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
		}

		// Broadcast delete to other nodes so that they can emit an event for GetAllStream()
		if err := s.Options.BusService.BroadcastDeleteAudience(ctx, deleteReq); err != nil {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
		}
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Service and audiences deleted",
	}, nil
}

func (s *ExternalServer) Tail(req *protos.TailRequest, server protos.External_TailServer) error {
	s.log.Debug("external.Tail(): received tail request")

	// Each tail request gets its own unique ID so that we can receive messages over
	// a unique channel from RedisBackend
	req.XId = util.Pointer(util.GenerateUUID())
	req.Audience.ServiceName = strings.ToLower(req.Audience.GetServiceName())
	req.Audience.OperationName = strings.ToLower(req.Audience.GetOperationName())
	req.Audience.ComponentName = strings.ToLower(req.Audience.GetComponentName())

	if err := validate.StartTailRequest(req); err != nil {
		return errors.Wrap(err, "invalid tail request")
	}

	// Get channel for receiving TailResponse messages that get shipped over RedisBackend.
	// This should exist before TailRequest command is sent to the SDKs so that we are ready to receive
	// messages from RedisBackend
	sdkReceiveChan := s.Options.PubSubService.Listen(req.GetXId(), util.CtxRequestId(server.Context()))

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
		if _, err := s.Options.RedisBackend.Del(server.Context(), activeTailKey).Result(); err != nil {
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
				s.log.Errorf("BUG: tried to read from closed channel '%s', tail is already closed", req.GetXId())
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
