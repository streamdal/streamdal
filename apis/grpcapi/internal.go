package grpcapi

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
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
	if err := s.validateRegisterRequest(request); err != nil {
		return errors.Wrap(err, "invalid register request")
	}

	if err := s.Deps.StoreService.AddRegistration(server.Context(), request); err != nil {
		return errors.Wrap(err, "unable to save registration")
	}

	// Broadcast registration
	if err := s.Deps.BusService.BroadcastRegistration(server.Context(), request); err != nil {
		return errors.Wrap(err, "unable to broadcast registration")
	}

	var shutdown bool

	// Listen for cmds from external API; forward them to connected clients
MAIN:
	for {
		select {
		case <-server.Context().Done():
			s.log.Debug("register handler detected client disconnect")
			break MAIN
		case <-s.Deps.ShutdownContext.Done():
			s.log.Debug("register handler detected shutdown context cancellation")
			shutdown = true
			break MAIN
		case cmd := <-s.Deps.CommandChannel:
			// Send command to connected client
			if err := server.Send(cmd); err != nil {
				s.log.WithError(err).Error("unable to send command to client")

				// TODO: Retry? Ignore?
				return errors.Wrap(err, "unable to send command to client")
			}

			if err := s.Deps.BusService.BroadcastCommand(server.Context(), cmd); err != nil {
				s.log.WithError(err).Error("unable to broadcast command")
			}
		}
	}

	if shutdown {
		s.log.Debugf("register handler shutting down for req id '%s'", server.Context().Value("id"))

		// Notify client that they need to re-register because of shutdown
		return GRPCServerShutdownError
	}

	// Client has disconnected -> broadcast deregistration
	if err := s.Deps.BusService.BroadcastDeregistration(request); err != nil {
		s.log.WithError(err).Error("unable to broadcast deregistration")
	}

	return nil
}

func (s *InternalServer) validateRegisterRequest(request *protos.RegisterRequest) error {
	// Not sure if this is possible or necessary
	if request == nil {
		return errors.New("request cannot be nil")
	}

	if request.ServiceName == "" {
		return errors.New("service name cannot be empty")
	}

	return nil
}

func (s *InternalServer) Heartbeat(ctx context.Context, request *protos.HeartbeatRequest) (*protos.StandardResponse, error) {
	//TODO implement me
	s.log.Info("got a hit for heartbeat!")

	return &protos.StandardResponse{
		Id:      "123",
		Code:    0,
		Message: "test test",
	}, nil
}

func (s *InternalServer) Notify(ctx context.Context, request *protos.NotifyRequest) (*protos.StandardResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *InternalServer) Metrics(ctx context.Context, request *protos.MetricsRequest) (*protos.StandardResponse, error) {
	//TODO implement me
	panic("implement me")
}
