package grpcapi

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/snitch-protos/build/go/protos"

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

func (s *InternalServer) Register(request *protos.RegisterRequest, server protos.Internal_RegisterServer) error {
	s.log.Info("Got a hit for register!")

	// Validate request
	if err := validate.RegisterRequest(request); err != nil {
		return errors.Wrap(err, "invalid register request")
	}

	if err := s.Deps.StoreService.AddRegistration(server.Context(), request); err != nil {
		return errors.Wrap(err, "unable to save registration")
	}

	// Broadcast registration
	if err := s.Deps.BusService.BroadcastRegistration(server.Context(), request); err != nil {
		return errors.Wrap(err, "unable to broadcast registration")
	}

	llog := s.log.WithFields(logrus.Fields{
		"service_name": request.ServiceName,
	})

	llog.Debug("beginning register command loop")

	var shutdown bool

	// Listen for cmds from external API; forward them to connected clients
MAIN:
	for {
		select {
		case <-server.Context().Done():
			llog.Debugf("register handler detected client (service: '%v') disconnect", request.ServiceName)
			break MAIN
		case <-s.Deps.ShutdownContext.Done():
			llog.Debug("register handler detected shutdown context cancellation")
			shutdown = true
			break MAIN
		case cmd := <-s.Deps.CommandChannel:
			llog.Debug("received command on command channel")

			// Send command to connected client
			if err := server.Send(cmd); err != nil {
				s.log.WithError(err).Error("unable to send command to client")

				// TODO: Retry? Ignore?
				return errors.Wrap(err, "unable to send command to client")
			}

			if err := s.Deps.BusService.BroadcastCommand(server.Context(), cmd); err != nil {
				llog.WithError(err).Error("unable to broadcast command")
			}
		}
	}

	if shutdown {
		llog.Debugf("register handler shutting down for req id '%s'", server.Context().Value("id"))

		// Notify client that they need to re-register because of shutdown
		return GRPCServerShutdownError
	}

	// Client has disconnected -> broadcast deregistration
	if err := s.Deps.BusService.BroadcastDeregistration(server.Context(), &protos.DeregisterRequest{
		ServiceName: request.ServiceName,
	}); err != nil {
		llog.WithError(err).Error("unable to broadcast deregistration")
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

	if err := s.Deps.BusService.BroadcastHeartbeat(ctx, req); err != nil {
		s.log.Error("unable to broadcast heartbeat for audience '%s': %s", util.AudienceStr(req.Audience), err.Error())

		return &protos.StandardResponse{
			Id:      util.CtxRequestId(ctx),
			Code:    protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR,
			Message: fmt.Sprintf("unable to broadcast heartbeat: %s", err.Error()),
		}, nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: "Heartbeat received",
	}, nil
}

func (s *InternalServer) Notify(ctx context.Context, request *protos.NotifyRequest) (*protos.StandardResponse, error) {
	// TODO: implement me
	panic("implement me")
}

func (s *InternalServer) Metrics(ctx context.Context, request *protos.MetricsRequest) (*protos.StandardResponse, error) {
	// TODO: implement me
	panic("implement me")
}
