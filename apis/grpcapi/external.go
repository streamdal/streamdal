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
	return &ExternalServer{}
}

func (s *ExternalServer) GetServices(ctx context.Context, req *protos.GetServicesRequest) (*protos.GetServicesResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) GetService(ctx context.Context, req *protos.GetServiceRequest) (*protos.GetServiceResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) GetPipelines(ctx context.Context, request *protos.GetPipelinesRequest) (*protos.GetPipelinesResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) GetPipeline(ctx context.Context, request *protos.GetPipelineRequest) (*protos.GetPipelineResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) SetPipeline(ctx context.Context, reqq *protos.SetPipelineRequest) (*protos.SetPipelineResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) DeletePipeline(ctx context.Context, request *protos.DeletePipelineRequest) (*protos.DeletePipelineResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) GetSteps(ctx context.Context, request *protos.GetStepsRequest) (*protos.GetStepsResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) CreateStep(ctx context.Context, request *protos.CreateStepRequest) (*protos.CreateStepResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) UpdateStep(ctx context.Context, request *protos.UpdateStepRequest) (*protos.UpdateStepResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) DeleteStep(ctx context.Context, request *protos.DeleteStepRequest) (*protos.DeleteStepResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ExternalServer) mustEmbedUnimplementedExternalServer() {
	//TODO implement me
	panic("implement me")
}
