package grpcapi

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"

	"github.com/streamdal/server/types"
	"github.com/streamdal/server/util"
	"github.com/streamdal/server/validate"
)

const (
	MaxKVCommandSizeBytes = 64 * 1024 // 64KB
)

// InternalServer implements the internal GRPC API interface
type InternalServer struct {
	GRPCAPI
	// Must be implemented in order to satisfy the protos InternalServer interface
	protos.UnimplementedInternalServer
}

func (g *GRPCAPI) newInternalServer() *InternalServer {
	return &InternalServer{
		GRPCAPI: *g,
	}
}

// sendActiveTails is executed during Register() and will send all active tails
// to the client (so that SDK can "resume" any in-progress tails)
func (s *InternalServer) sendActiveTails(ctx context.Context, cmdCh chan *protos.Command, req *protos.RegisterRequest) {
	tailCommands, err := s.Options.StoreService.GetActiveTailCommandsByService(ctx, req.ServiceName)
	if err != nil {
		s.log.Errorf("unable to fetch active tail commands by service '%s': %s", req.ServiceName, err.Error())
	}

	s.log.Debugf("resume: sending '%d' active tails for register session id '%s'", len(tailCommands), req.SessionId)

	for _, cmd := range tailCommands {
		s.sendToClient(cmdCh, cmd)
	}
}

func (s *InternalServer) sendKVs(ctx context.Context, cmdCh chan *protos.Command, sessionID string) {
	llog := s.log.WithFields(logrus.Fields{
		"method":     "sendKVs",
		"session_id": sessionID,
	})

	llog.Debug("starting initial KV sync")

	kvCommands, err := s.generateInitialKVCommands(ctx)
	if err != nil {
		llog.Errorf("unable to generate initial kv commands: %v", err)
		return
	}

	llog.Debugf("generated '%d' kv commands", len(kvCommands))

	for _, cmd := range kvCommands {
		llog.Debugf("sending '%d' KV instructions", len(cmd.Instructions))

		s.sendToClient(cmdCh, &protos.Command{Command: &protos.Command_Kv{Kv: cmd}})
	}

	llog.Debug("finished initial KV sync")
}

func (s *InternalServer) sendToClient(ch chan *protos.Command, cmd *protos.Command) {
	defer func() {
		if r := recover(); r != nil {
			s.log.Debug("BUG: tried to write to closed Register() channel")
		}
	}()

	ch <- cmd
}

// TODO: This probably needs to be updated to "generate" the inferschema pipeline cmds
// so that they can be used in GetAttachPipeline
//func (s *InternalServer) sendInferSchemaPipelines(ctx context.Context, cmdCh chan *protos.Command, sessionID string) {
//	// Get all audiences for this session
//	audiences, err := s.Options.StoreService.GetAudiencesBySessionID(ctx, sessionID)
//	if err != nil {
//		s.log.Errorf("unable to get audiences by session id '%s': %v", sessionID, err)
//		return
//	}
//
//	for _, aud := range audiences {
//		// Create a new pipeline whose only step is an inferschema step
//		attachCmd := util.GenInferSchemaPipeline(aud)
//
//		// Inject WASM data
//		if err := util.PopulateWASMFields(attachCmd.GetAttachPipeline().Pipeline, s.Options.Config.WASMDir); err != nil {
//			s.log.Errorf("unable to populate WASM fields for inferschema: %v", err)
//			return
//		}
//
//		s.sendToClient(cmdCh, attachCmd)
//	}
//}

func (s *InternalServer) Register(request *protos.RegisterRequest, server protos.Internal_RegisterServer) error {
	// validate request
	if err := validate.RegisterRequest(request); err != nil {
		return errors.Wrap(err, "invalid register request")
	}

	llog := s.log.WithFields(logrus.Fields{
		"service_name": request.ServiceName,
		"session_id":   request.SessionId,
	})

	// Send telemetry
	telTags := []statsd.Tag{
		{"install_id", s.Options.InstallID},
		{"os", request.ClientInfo.Os},
		{"sdk", request.ClientInfo.LibraryName},
		{"arch", request.ClientInfo.Arch},
		{"version", request.ClientInfo.LibraryVersion},
	}

	// Store registration
	if err := s.Options.StoreService.AddRegistration(server.Context(), request); err != nil {
		return errors.Wrap(err, "unable to save registration")
	}

	// Store permanent registration for analytics
	if ok := s.Options.StoreService.SeenRegistration(server.Context(), request); !ok {
		// Save in redis so we send only once
		if err := s.Options.StoreService.RecordRegistration(server.Context(), request); err != nil {
			llog.Errorf("unable to record registration: %s", err.Error())
		}

		// Send telemetry
		_ = s.Options.Telemetry.Inc(types.GaugeUsageRegistrationsTotal, 1, 1.0, telTags...)
	}

	// Create a new command channel
	ch, newCh := s.Options.CmdService.AddChannel(request.SessionId)

	if newCh {
		llog.Debugf("new channel created for session id '%s'", request.SessionId)
	} else {
		llog.Debugf("channel already exists for session id '%s'", request.SessionId)
	}

	var shutdown bool

	// Send a keepalive every tick
	ticker := time.NewTicker(1 * time.Second)

	// Broadcast registration to all nodes which will trigger handlers to push
	// an update to GetAllStream() chan (so UI knows that a change has occurred)
	if err := s.Options.BusService.BroadcastRegister(server.Context(), request); err != nil {
		return errors.Wrap(err, "unable to broadcast register")
	}

	// NOTE: We cannot send AttachPipelines in here because Register() is an
	// async operation in the SDKs - if we did it here, there is a chance that a
	// .Process() call might process some messages WITHOUT any pipelines attached.
	//
	// Because of this, all the SDKs ASK for attached pipelines in the
	// *constructor* (rather than inside of Register()).

	// Send all KVs to client
	go s.sendKVs(server.Context(), ch, request.SessionId)

	// Send all active tails. We are passing request here because we need access
	// to the ServiceName (so we can get all active tails for that service)
	go s.sendActiveTails(server.Context(), ch, request)

	// WARNING: As of 01-25-2024, infer schema pipeline is sent via GetAttachCommandsByService

	// TODO: need to figure out GaugeUsageRegistrationsTotal
	// TODO: we need to hash the tags and store in redis/memory

	_ = s.Options.Telemetry.GaugeDelta(types.GaugeUsageRegistrationsActive, 1, 1.0, telTags...)
	defer s.Options.Telemetry.GaugeDelta(types.GaugeUsageRegistrationsActive, -1, 1.0, telTags...)

	// Listen for cmds from external API; forward them to connected clients
MAIN:
	for {
		select {
		case <-server.Context().Done():
			llog.Debug("register handler detected client disconnect")
			break MAIN
		case <-s.Options.ShutdownContext.Done():
			llog.Debug("register handler detected shutdown context cancellation")
			shutdown = true
			break MAIN
		case <-ticker.C:
			if err := server.Send(&protos.Command{
				Command: &protos.Command_KeepAlive{
					KeepAlive: &protos.KeepAliveCommand{},
				},
			}); err != nil {
				// TODO: If unable to send heartbeat to client X times, stop request/exit loop
				llog.WithError(err).Errorf("unable to send heartbeat for session id '%s'", request.SessionId)
				continue
			}
		case cmd := <-ch:
			if cmd == nil {
				llog.Warning("received nil cmd on cmd channel; ignoring")
				continue
			}

			llog.Debugf("received cmd on cmd channel; sending cmd to client session id '%s'", request.SessionId)

			// Send cmd to connected client
			if err := server.Send(cmd); err != nil {
				s.log.WithError(err).Error("unable to send cmd to client")

				// TODO: Retry? Ignore?
				return errors.Wrap(err, "unable to send cmd to client")
			}

			llog.Debug("sent cmd to client")
		}
	}

	if shutdown {
		llog.Debugf("register handler shutting down for req id '%s'", server.Context().Value("id"))

		// Notify client that they need to re-register because of shutdown
		return GRPCServerShutdownError
	}

	llog.Debug("client has disconnected; de-registering")

	// Remove command channel
	if ok := s.Options.CmdService.RemoveChannel(request.SessionId); ok {
		llog.Debug("removed cmd channel")
	} else {
		llog.Debug("no cmd channel found")
	}

	deregisterRequest := &protos.DeregisterRequest{
		ServiceName: request.ServiceName,
		SessionId:   request.SessionId,
	}

	llog.Debug("deleting registration from store")

	// By this point, the server context may be cancelled, so we must not rely on it
	ctx := context.Background()

	if err := s.Options.StoreService.DeleteRegistration(ctx, deregisterRequest); err != nil {
		err = errors.Wrap(err, "unable to delete registration")
		llog.Error(err)
		return err
	}

	llog.Debug("announcing de-registration")

	// Announce de-registration - the UI will still display the audience(s) but
	// they no longer will be live (ie. attached clients will decrease)
	if err := s.Options.BusService.BroadcastDeregister(ctx, deregisterRequest); err != nil {
		llog.Errorf("unable to broadcast deregister event: %s", err)
	}

	return nil
}

func (s *InternalServer) Heartbeat(ctx context.Context, req *protos.HeartbeatRequest) (*protos.StandardResponse, error) {
	if err := validate.HeartbeatRequest(req); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
			Message: fmt.Sprintf("invalid heartbeat req: %s", err.Error()),
		}, nil
	}

	// Refresh register key
	// This method also refreshes audience live keys
	if err := s.Options.StoreService.AddRegistration(ctx, &protos.RegisterRequest{
		ServiceName: req.ServiceName,
		SessionId:   req.SessionId,
		ClientInfo:  req.ClientInfo,
		Audiences:   req.Audiences,
	}); err != nil {
		err = errors.Wrap(err, "unable to save heartbeat")
		s.log.Error(err)

		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			Message: err.Error(),
		}, nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Heartbeat received",
	}, nil
}

func (s *InternalServer) Notify(ctx context.Context, request *protos.NotifyRequest) (*protos.StandardResponse, error) {
	if err := s.Options.NotifyService.Queue(ctx, request); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			Message: fmt.Sprintf("unable to queue notification: %s", err.Error()),
		}, nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Notification queued",
	}, nil
}

func (s *InternalServer) Metrics(ctx context.Context, req *protos.MetricsRequest) (*protos.StandardResponse, error) {
	if err := validate.MetricsRequest(req); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
			Message: fmt.Sprintf("invalid metrics req: %s", err.Error()),
		}, nil
	}

	if err := s.Options.BusService.BroadcastMetrics(ctx, req); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			Message: fmt.Sprintf("unable to handle metrics request: %s", err.Error()),
		}, nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Metrics handled",
	}, nil
}

func (s *InternalServer) NewAudience(ctx context.Context, req *protos.NewAudienceRequest) (*protos.StandardResponse, error) {
	s.log.Debugf("received new audience request for session id '%s'", req.SessionId)

	if err := validate.NewAudienceRequest(req); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
			Message: fmt.Sprintf("invalid new audience req: %s", err.Error()),
		}, nil
	}

	if err := s.Options.StoreService.AddAudience(ctx, req); err != nil {
		s.log.Errorf("unable to save audience: %s", err.Error())

		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			Message: fmt.Sprintf("unable to save audience: %s", err.Error()),
		}, nil
	}

	// Broadcast audience creation so that we can notify UI GetAllStream clients
	if err := s.Options.BusService.BroadcastNewAudience(ctx, req); err != nil {
		s.log.Errorf("unable to broadcast new audience: %s", err.Error())
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Audience created",
	}, nil
}

func (s *InternalServer) getAttachCommandsByService(
	ctx context.Context,
	serviceName string,
) ([]*protos.Command, []*protos.Command, error) {
	if serviceName == "" {
		return nil, nil, errors.New("service name is required")
	}

	attaches, err := s.Options.StoreService.GetAttachCommandsByService(ctx, serviceName)
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to get attach commands by service")
	}

	pausedMap, err := s.Options.StoreService.GetPaused(ctx)
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to get paused pipelines")
	}

	active := make([]*protos.Command, 0)
	paused := make([]*protos.Command, 0)

	for _, a := range attaches {
		if err := validate.AttachPipelineCommand(a.GetAttachPipeline()); err != nil {
			s.log.Warningf("invalid attach pipeline command: %s", err.Error())
			continue
		}

		pausedEntry, ok := pausedMap[a.GetAttachPipeline().Pipeline.Id]
		if !ok {
			// Pipeline ID is not present in map, it is not paused
			active = append(active, a)
			continue
		}

		// Found pipeline id in paused, check if audience matches
		if util.AudienceEquals(pausedEntry.Audience, a.Audience) {
			// This is paused
			paused = append(paused, a)
			continue
		}

		// DS: Why is this needed?
		// Audience dos not match, this is active
		active = append(active, a)
	}

	return active, paused, nil
}

func (s *InternalServer) GetAttachCommandsByService(
	ctx context.Context,
	req *protos.GetAttachCommandsByServiceRequest,
) (*protos.GetAttachCommandsByServiceResponse, error) {
	active, paused, err := s.getAttachCommandsByService(ctx, req.ServiceName)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get attach commands by service")
	}

	// Inject infer schema pipelines before every pipeline with a unique audience
	updatedActive, err := s.updateAttachCommandsWithInfer(active, true)
	if err != nil {
		return nil, errors.Wrap(err, "unable to inject infer schema pipelines for active pipelines")
	}

	// Inject infer schema pipelines before every pipeline with a unique audience
	updatedPaused, err := s.updateAttachCommandsWithInfer(paused, false)
	if err != nil {
		return nil, errors.Wrap(err, "unable to inject infer schema pipelines for paused pipelines")
	}

	return &protos.GetAttachCommandsByServiceResponse{
		Active:      updatedActive,
		Paused:      updatedPaused,
		WasmModules: util.GenerateWasmMapping(append(updatedActive, updatedPaused...)...),
	}, nil
}

func (s *InternalServer) updateAttachCommandsWithInfer(attachPipelineCommands []*protos.Command, isActive bool) ([]*protos.Command, error) {
	if len(attachPipelineCommands) == 0 {
		return nil, errors.New("no commands to inject infer schema pipelines into")
	}

	pipelineCmdStatus := "paused"

	if isActive {
		pipelineCmdStatus = "active"
	}

	llog := s.log.WithFields(logrus.Fields{
		"method":         "updateAttachCommandsWithInfer",
		"pipelineStatus": pipelineCmdStatus,
	})

	updatedCmds := make([]*protos.Command, 0)
	knownAudiences := make(map[string]bool)

	for _, c := range attachPipelineCommands {
		if c.Audience == nil {
			llog.Debug("skipping attach-command with nil audience")
			continue
		}

		attachPipelineCmd := c.GetAttachPipeline()

		if attachPipelineCmd == nil {
			llog.Debug("skipping attach-command with nil attach pipeline cmd")
			continue
		}

		if _, ok := knownAudiences[util.AudienceToStr(c.Audience)]; !ok {
			llog.Warnf("injecting infer schema pipeline for pipeline '%s' with audience '%s'", attachPipelineCmd.Pipeline.Name, util.AudienceToStr(c.Audience))

			// First time seeing audience, inject infer schema attach cmd
			updatedCmds = append(updatedCmds, util.GenInferSchemaPipeline(c.Audience))
			knownAudiences[util.AudienceToStr(c.Audience)] = true
		}

		// Add pipeline to new attach pipeline commands
		llog.Warningf("appending attach pipeline cmd for pipeline '%s' with audience '%s'", attachPipelineCmd.Pipeline.Name, util.AudienceToStr(c.Audience))
		updatedCmds = append(updatedCmds, c)
	}

	llog.Debugf("updateAttachCommandsWithInfer has injected '%d' infer schema pipeline(s) for '%d' pipeline(s) for '%d' unique audiences",
		len(updatedCmds)-len(attachPipelineCommands), len(attachPipelineCommands), len(knownAudiences))

	return updatedCmds, nil
}

func (s *InternalServer) SendTail(srv protos.Internal_SendTailServer) error {
	llog := s.log.WithFields(logrus.Fields{
		"method":     "SendTail",
		"request_id": util.CtxRequestId(srv.Context()),
	})

	// This isn't necessary for go, but other language libraries, such as python
	// require a response to eventually be sent and will throw an exception if
	// one is not received
	defer func() {
		llog.Debug("sending final tail response")

		srv.SendAndClose(&protos.StandardResponse{
			Id:   util.CtxRequestId(srv.Context()),
			Code: protos.ResponseCode_RESPONSE_CODE_OK,
		})
	}()

	for {
		select {
		case <-srv.Context().Done():
			llog.Debug("detected client disconnect")
			return nil
		case <-s.Options.ShutdownContext.Done():
			llog.Debug("server shutting down, exiting stream")
			return nil
		default:
			tailResp, err := srv.Recv()
			if err != nil {
				if strings.Contains(err.Error(), io.EOF.Error()) || strings.Contains(err.Error(), context.Canceled.Error()) {
					llog.Debug("client closed stream")
					return nil
				}

				llog.Error(errors.Wrap(err, "unable to receive tail response"))
				continue
			}

			llog.Debugf("after srv.Recv(), before validation for session id '%s', tail request id '%s'",
				tailResp.SessionId, tailResp.TailRequestId)

			if err := validate.TailResponse(tailResp); err != nil {
				llog.Error(errors.Wrapf(err, "invalid tail response for session id '%s', tail request id '%s'",
					tailResp.SessionId, tailResp.TailRequestId))
				continue
			}

			llog.Debugf("after validation, before BroadcastTailResponse() for session id '%s', tail request id '%s'",
				tailResp.SessionId, tailResp.TailRequestId)

			if err := s.Options.BusService.BroadcastTailResponse(srv.Context(), tailResp); err != nil {
				llog.Error(errors.Wrapf(err, "unable to broadcast tail response for session id '%s', tail request id '%s'",
					tailResp.SessionId, tailResp.TailRequestId))

				continue
			}

			llog.Debugf("after BroadcastTailResponse() for session id '%s', tail request id '%s'",
				tailResp.SessionId, tailResp.TailRequestId)
		}
	}
}

// Will generate a batch of KVCommands that are intended to be sent to SDK
// clients upon registration
func (s *InternalServer) generateInitialKVCommands(ctx context.Context) ([]*protos.KVCommand, error) {
	// Fetch all KVs
	kvs, err := s.Options.KVService.GetAll(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get all KVs")
	}

	cmds := make([]*protos.KVCommand, 0)
	instructions := make([]*protos.KVInstruction, 0)
	size := 0

	// Inject up to 64KB of instructions per KVCommand
	for _, kv := range kvs {
		if size > MaxKVCommandSizeBytes {
			// Copy instructions
			instructionsCopy := make([]*protos.KVInstruction, len(instructions))
			copy(instructionsCopy, instructions)

			// Append a new command w/ instructions
			cmds = append(cmds, &protos.KVCommand{
				Instructions: instructionsCopy,
				Overwrite:    true,
			})

			// Reset instructions
			instructions = make([]*protos.KVInstruction, 0)
			size = 0
		}

		instructions = append(instructions, &protos.KVInstruction{
			Id:                       util.GenerateUUID(),
			Action:                   shared.KVAction_KV_ACTION_CREATE,
			Object:                   kv,
			RequestedAtUnixTsNanoUtc: time.Now().UTC().UnixNano(),
		})

		size += len(kv.Key) + len(kv.Value)
	}

	// Append remainder to cmds
	cmds = append(cmds, &protos.KVCommand{
		Instructions: instructions,
	})

	s.log.Debugf("generateInitialKVCommands has generated '%d' KV commands", len(cmds))

	return cmds, nil
}

func (s *InternalServer) SendSchema(ctx context.Context, req *protos.SendSchemaRequest) (*protos.StandardResponse, error) {
	if err := validate.SendSchemaRequest(req); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
			Message: fmt.Sprintf("invalid request: %s", err.Error()),
		}, nil
	}

	// Get existing schema
	schema, err := s.Options.StoreService.GetSchema(ctx, req.Audience)
	if err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
			Message: errors.Wrap(err, "error getting existing schema").Error(),
		}, nil
	}

	// Bump version and timestamp
	// GetSchema returns an empty schema with version 0 if it doesn't exist yet
	schema.XVersion++
	schema.JsonSchema = req.Schema.JsonSchema
	schema.XMetadata = req.Schema.XMetadata

	if req.Schema.XMetadata == nil {
		req.Schema.XMetadata = make(map[string]string)
	}

	req.Schema.XMetadata["last_updated"] = time.Now().UTC().Format(time.RFC3339)

	if err := s.Options.StoreService.AddSchema(ctx, req); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			Message: fmt.Sprintf("unable to save schema: %s", err.Error()),
		}, nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Schema received",
	}, nil
}
