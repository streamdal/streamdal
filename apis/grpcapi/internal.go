package grpcapi

import (
	"context"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

// InternalServer implements the internal GRPC API interface
type InternalServer struct {
	GRPCAPI
	// Must be implemented in order to satisfy the protos InternalServer interface
	protos.UnimplementedInternalServer
}

func (g *GRPCAPI) newInternalServer() *InternalServer {
	return &InternalServer{}
}

func (s *InternalServer) Register(request *protos.RegisterRequest, server protos.Internal_RegisterServer) error {
	// Get inbound request

	//TODO implement me
	panic("implement me")
}

func (s *InternalServer) Heartbeat(ctx context.Context, request *protos.HeartbeatRequest) (*protos.StandardResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *InternalServer) Notify(ctx context.Context, request *protos.NotifyRequest) (*protos.StandardResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *InternalServer) Metrics(ctx context.Context, request *protos.MetricsRequest) (*protos.StandardResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *InternalServer) mustEmbedUnimplementedInternalServer() {
	//TODO implement me
	panic("implement me")
}
