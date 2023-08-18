package grpcapi

import (
	"context"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/store"
	"github.com/streamdal/snitch-server/util"
	"github.com/streamdal/snitch-server/validate"
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

func (s *InternalServer) startHeartbeatWatcher(serverCtx context.Context, sessionId string, noHeartbeatCh chan struct{}) error {
	// Validate inputs
	if serverCtx == nil {
		return errors.New("server context cannot be nil")
	}

	if sessionId == "" {
		return errors.New("session id cannot be empty")
	}

	if noHeartbeatCh == nil {
		return errors.New("heartbeatCh cannot be nil")
	}

	llog := s.log.WithFields(logrus.Fields{
		"method":     "startHeartbeatWatcher",
		"session_id": sessionId,
	})

	lastHeartbeat := time.Now()

	// Start heartbeat watcher
	kw, err := s.Options.NATSBackend.WatchKey(serverCtx, store.NATSLiveBucket, store.NATSRegisterKey(sessionId, s.Options.Config.NodeName))
	if err != nil {
		return errors.Wrapf(err, "unable to setup key watcher for session id '%s'", sessionId)
	}

	go func() {
	MAIN:
		for {
			select {
			case <-serverCtx.Done():
				llog.Debug("heartbeat watcher detected request context cancellation; exiting")
				break MAIN
			case <-s.Options.ShutdownContext.Done():
				llog.Debug("heartbeat watcher detected shutdown context cancellation; exiting")
				break MAIN
			case key := <-kw.Updates():
				// Sometimes we can receive nils - ignore
				if key == nil {
					continue
				}

				switch key.Operation() {
				case nats.KeyValuePut:
					llog.Debug("detected heartbeat")
					lastHeartbeat = time.Now()
				default:
					llog.Debug("received non-put operation on key watcher; ignoring")
				}
			case <-time.After(time.Second):
				// Check if heartbeat is older than session TTL
				if time.Now().Sub(lastHeartbeat) > s.Options.Config.SessionTTL {
					llog.Debugf("no heartbeat received during the last '%v'; sending disconnect cmd and exiting", s.Options.Config.SessionTTL)
					noHeartbeatCh <- struct{}{}
					break MAIN
				}
			}
		}

		llog.Debug("heartbeat watcher exiting")
	}()

	return nil
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

	llog.Debug("beginning register cmd loop")

	var (
		shutdown    bool
		noHeartbeat bool
	)

	// Send a keepalive every tick
	ticker := time.NewTicker(1 * time.Second)

	noHeartbeatCh := make(chan struct{})

	// Launch heartbeat watcher
	if err := s.startHeartbeatWatcher(server.Context(), request.SessionId, noHeartbeatCh); err != nil {
		llog.Errorf("unable to start heartbeat watcher: %v", err)
		return errors.Wrapf(err, "unable to start heartbeat watcher for session id '%s'", request.SessionId)
	}

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
		case <-noHeartbeatCh:
			noHeartbeat = true
			llog.Debug("register handler detected no heartbeat; disconnecting client")
			break MAIN
		case <-ticker.C:
			llog.Debug("sending heartbeat")

			if err := server.Send(&protos.Command{
				Command: &protos.Command_KeepAlive{
					KeepAlive: &protos.KeepAliveCommand{},
				},
			}); err != nil {
				llog.WithError(err).Errorf("unable to send heartbeat for session id '%s'", request.SessionId)
			}
		case cmd := <-ch:
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

	if noHeartbeat {
		llog.Debugf("client with session id '%s' forcefully disconnected (due to no heartbeat); de-registering", request.SessionId)
	} else {
		llog.Debugf("client with session id '%s' has disconnected; de-registering", request.SessionId)
	}

	// Remove command channel
	if ok := s.Options.CmdService.RemoveChannel(request.SessionId); ok {
		llog.Debugf("removed channel for session id '%s'", request.SessionId)
	} else {
		llog.Debugf("no channel found for session id '%s'", request.SessionId)
	}

	if err := s.Options.StoreService.DeleteRegistration(server.Context(), &protos.DeregisterRequest{
		ServiceName: request.ServiceName,
		SessionId:   request.SessionId,
	}); err != nil {
		return errors.Wrap(err, "unable to delete registration")
	}

	return nil
}

func (s *InternalServer) Heartbeat(ctx context.Context, req *protos.HeartbeatRequest) (*protos.StandardResponse, error) {
	s.log.Debugf("received heartbeat request for session id '%s'", req.SessionId)

	if err := validate.HeartbeatRequest(req); err != nil {
		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
			Message: fmt.Sprintf("invalid heartbeat req: %s", err.Error()),
		}, nil
	}

	if err := s.Options.StoreService.AddHeartbeat(ctx, req); err != nil {
		s.log.Errorf("unable to save heartbeat: %s", err.Error())

		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			Message: fmt.Sprintf("unable to save heartbeat: %s", err.Error()),
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

	for _, a := range attaches {
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
		Active: active,
		Paused: paused,
	}, nil
}
