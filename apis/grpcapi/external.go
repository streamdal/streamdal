package grpcapi

import (
	"context"

	"github.com/streamdal/snitch-protos/build/go/protos"
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

func (s *ExternalServer) GetServiceMap(context.Context, *protos.GetServiceMapRequest) (*protos.GetServiceMapResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) GetPipelines(context.Context, *protos.GetPipelinesRequest) (*protos.GetPipelinesResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) GetPipeline(context.Context, *protos.GetPipelineRequest) (*protos.GetPipelineResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) CreatePipeline(context.Context, *protos.CreatePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) UpdatePipeline(context.Context, *protos.UpdatePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) DeletePipeline(context.Context, *protos.DeletePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) AttachPipeline(context.Context, *protos.AttachPipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) DetachPipeline(context.Context, *protos.DetachPipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) PausePipeline(context.Context, *protos.PausePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) ResumePipeline(context.Context, *protos.ResumePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) Test(ctx context.Context, req *protos.TestRequest) (*protos.TestResponse, error) {
	return &protos.TestResponse{
		Output: "Pong: " + req.Input,
	}, nil
}
