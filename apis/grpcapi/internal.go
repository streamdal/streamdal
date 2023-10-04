package grpcapi

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/snitch-protos/build/go/protos"
	"github.com/streamdal/snitch-protos/build/go/protos/shared"

	"github.com/streamdal/snitch-server/util"
	"github.com/streamdal/snitch-server/validate"
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

func (s *InternalServer) sendInferSchemaPipelines(ctx context.Context, cmdCh chan *protos.Command, sessionID string) {
	// Get all audiences for this session
	audiences, err := s.Options.StoreService.GetAudiencesBySessionID(ctx, sessionID)
	if err != nil {
		s.log.Errorf("unable to get audiences by session id '%s': %v", sessionID, err)
		return
	}

	for _, aud := range audiences {
		// Create a new pipeline whose only step is an inferschema step
		attachCmd := util.GenInferSchemaPipeline(aud)

		// Inject WASM data
		if err := util.PopulateWASMFields(attachCmd.GetAttachPipeline().Pipeline, s.Options.Config.WASMDir); err != nil {
			s.log.Errorf("unable to populate WASM fields for inferschema: %v", err)
			return
		}

		cmdCh <- attachCmd
	}
}

func (s *InternalServer) Register(request *protos.RegisterRequest, server protos.Internal_RegisterServer) error {
	// validate request
	if err := validate.RegisterRequest(request); err != nil {
		return errors.Wrap(err, "invalid register request")
	}

	llog := s.log.WithFields(logrus.Fields{
		"service_name": request.ServiceName,
		"session_id":   request.SessionId,
	})

	// Store registration
	if err := s.Options.StoreService.AddRegistration(server.Context(), request); err != nil {
		return errors.Wrap(err, "unable to save registration")
	}

	// Create a new command channel
	ch, newCh := s.Options.CmdService.AddChannel(request.SessionId)

	if newCh {
		llog.Debugf("new channel created for session id '%s'", request.SessionId)
	} else {
		llog.Debugf("channel already exists for session id '%s'", request.SessionId)
	}

	var (
		shutdown bool
	)

	// Send a keepalive every tick
	ticker := time.NewTicker(1 * time.Second)

	// Broadcast registration to all nodes which will trigger handlers to push
	// an update to GetAllStream() chan (so UI knows that a change has occurred)
	if err := s.Options.BusService.BroadcastRegister(server.Context(), request); err != nil {
		return errors.Wrap(err, "unable to broadcast register")
	}

	// Send all KVs to client
	go func() {
		llog.Debug("starting initial KV sync")

		kvCommands, err := s.generateInitialKVCommands(server.Context())
		if err != nil {
			llog.Errorf("unable to generate initial kv commands: %v", err)
			return
		}

		llog.Debugf("generated '%d' kv commands", len(kvCommands))

		for _, cmd := range kvCommands {
			llog.Debugf("sending '%d' KV instructions", len(cmd.Instructions))

			ch <- &protos.Command{
				Command: &protos.Command_Kv{
					Kv: cmd,
				},
			}
		}

		llog.Debug("finished initial KV sync")
	}()

	// Send ephemeral schema inference pipeline for each announced audience
	go s.sendInferSchemaPipelines(server.Context(), ch, request.SessionId)

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
			//llog.Debug("sending heartbeat")

			if err := server.Send(&protos.Command{
				Command: &protos.Command_KeepAlive{
					KeepAlive: &protos.KeepAliveCommand{},
				},
			}); err != nil {
				// TODO: If unable to send heartbeat to client X times, stop request/exit loop
				llog.WithError(err).Errorf("unable to send heartbeat for session id '%s'", request.SessionId)
				continue
			}

			// Save heartbeat every tick; this will update all live:* keys
			if err := s.Options.StoreService.AddHeartbeat(server.Context(), &protos.HeartbeatRequest{
				SessionId: request.SessionId,
			}); err != nil {
				s.log.Errorf("unable to save heartbeat: %s", err.Error())
				// TODO: What do we do if we're unable to save heartbeat X times? Stop request/exit loop?
			}
		case cmd := <-ch:
			if cmd == nil {
				llog.Warning("received nil cmd on cmd channel; ignoring")
				continue
			}
			llog.Debug("received cmd on cmd channel")

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

	llog.Debugf("client with session id '%s' has disconnected; de-registering", request.SessionId)

	// Remove command channel
	if ok := s.Options.CmdService.RemoveChannel(request.SessionId); ok {
		llog.Debugf("removed channel for session id '%s'", request.SessionId)
	} else {
		llog.Debugf("no channel found for session id '%s'", request.SessionId)
	}

	deregisterRequest := &protos.DeregisterRequest{
		ServiceName: request.ServiceName,
		SessionId:   request.SessionId,
	}

	if err := s.Options.StoreService.DeleteRegistration(server.Context(), deregisterRequest); err != nil {
		return errors.Wrap(err, "unable to delete registration")
	}

	// TODO: Announce de-registration - the UI will still display the audience(s) but
	// they no longer will be live (ie. attached clients will decrease)
	if err := s.Options.BusService.BroadcastDeregister(server.Context(), deregisterRequest); err != nil {
		llog.Errorf("unable to broadcast deregister event for session id '%s': %v", deregisterRequest.SessionId, err)
	}

	return nil
}

// Heartbeat ... as of 09/26/23, clients are not required to send heartbeats -
// heartbeats are handled entirely server-side. This handler remains here for
// backwards compatibility.
func (s *InternalServer) Heartbeat(ctx context.Context, req *protos.HeartbeatRequest) (*protos.StandardResponse, error) {
	if err := validate.HeartbeatRequest(req); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
			Message: fmt.Sprintf("invalid heartbeat req: %s", err.Error()),
		}, nil
	}

	//if err := s.Options.StoreService.AddHeartbeat(ctx, req); err != nil {
	//	s.log.Errorf("unable to save heartbeat: %s", err.Error())
	//
	//	return &protos.StandardResponse{
	//		Id:      util.CtxRequestId(ctx),
	//		Code:    protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
	//		Message: fmt.Sprintf("unable to save heartbeat: %s", err.Error()),
	//	}, nil
	//}

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

	// Send AttachCommand to client with ephemeral inferschema pipeline
	cmdCh, isNewCh := s.Options.CmdService.AddChannel(req.SessionId)
	if isNewCh {
		s.log.Debugf("new channel created for session id '%s'", req.SessionId)
	} else {
		s.log.Debugf("channel already exists for session id '%s'", req.SessionId)
	}

	// This is context.Background() because it's ran as a gouroutine and the request
	// context may be finished by the time it eventually runs
	go s.sendInferSchemaPipelines(context.Background(), cmdCh, req.SessionId)

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

func (s *InternalServer) GetAttachCommandsByService(
	ctx context.Context,
	req *protos.GetAttachCommandsByServiceRequest,
) (*protos.GetAttachCommandsByServiceResponse, error) {
	attaches, err := s.Options.StoreService.GetAttachCommandsByService(ctx, req.ServiceName)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get attach commands by service")
	}

	pausedMap, err := s.Options.StoreService.GetPaused(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get paused pipelines")
	}

	active := make([]*protos.Command, 0)
	paused := make([]*protos.Command, 0)
	wasmModules := make(map[string]*protos.WasmModule)

	for _, a := range attaches {
		// Inject WASM data into it's own map and zero out the bytes in the steps
		// This is to prevent the WASM data from being duplicated in the response
		for _, step := range a.GetAttachPipeline().Pipeline.Steps {
			if _, ok := wasmModules[step.GetXWasmId()]; !ok {
				wasmModules[step.GetXWasmId()] = &protos.WasmModule{
					Id:       step.GetXWasmId(),
					Bytes:    step.GetXWasmBytes(),
					Function: step.GetXWasmFunction(),
				}
			}

			// Always wipe bytes. SDK Client will handle lookup
			step.XWasmBytes = nil
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

		// Audience dos not match, this is active
		active = append(active, a)
	}

	return &protos.GetAttachCommandsByServiceResponse{
		Active:      active,
		Paused:      paused,
		WasmModules: wasmModules,
	}, nil
}

func (s *InternalServer) SendTail(srv protos.Internal_SendTailServer) error {
	// This isn't necessary for go, but other langauge libraries, such as python
	// require a response to eventually be sent and will throw an exception if
	// one is not received
	defer srv.SendAndClose(&protos.StandardResponse{
		Id:   util.CtxRequestId(srv.Context()),
		Code: protos.ResponseCode_RESPONSE_CODE_OK,
	})

	for {
		select {
		case <-srv.Context().Done():
			s.log.Debug("send tail handler detected client disconnect")
			return nil
		case <-s.Options.ShutdownContext.Done():
			s.log.Debug("server shutting down, exiting SendTail() stream")
			return nil
		default:
			tailResp, err := srv.Recv()
			if err != nil {
				if strings.Contains(err.Error(), io.EOF.Error()) || strings.Contains(err.Error(), context.Canceled.Error()) {
					s.log.Debug("client closed tail stream")
					return nil
				}

				s.log.Error(errors.Wrap(err, "unable to receive tail response"))
				continue
			}

			if err := validate.TailResponse(tailResp); err != nil {
				s.log.Error(errors.Wrap(err, "invalid tail response"))
				continue
			}

			if err := s.Options.BusService.BroadcastTailResponse(srv.Context(), tailResp); err != nil {
				s.log.Error(errors.Wrap(err, "unable to broadcast tail response"))
				continue
			}

			s.log.Debugf("publishing tail response for session id '%s'", tailResp.SessionId)
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
