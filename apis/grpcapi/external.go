package grpcapi

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/validate"
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

func (s *ExternalServer) GetServiceMap(ctx context.Context, req *protos.GetServiceMapRequest) (*protos.GetServiceMapResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) GetPipelines(ctx context.Context, req *protos.GetPipelinesRequest) (*protos.GetPipelinesResponse, error) {
	if err := validate.GetPipelinesRequest(req); err != nil {
		return nil, errors.Wrap(err, "invalid get pipelines request")
	}

	// Read all keys in "snitch_pipelines"
	pipelines, err := s.Deps.StoreService.GetPipelines(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipelines")
	}

	// convert map to slice
	pipelineSlice := make([]*protos.Pipeline, 0, len(pipelines))
	for _, pipeline := range pipelines {
		pipelineSlice = append(pipelineSlice, pipeline)
	}

	return &protos.GetPipelinesResponse{
		Pipelines: pipelineSlice,
	}, nil
}

func (s *ExternalServer) GetPipeline(ctx context.Context, req *protos.GetPipelineRequest) (*protos.GetPipelineResponse, error) {
	if err := validate.GetPipelineRequest(req); err != nil {
		return nil, errors.Wrap(err, "invalid get pipeline request")
	}

	pipeline, err := s.Deps.StoreService.GetPipeline(ctx, req.PipelineId)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get pipelines")
	}

	return &protos.GetPipelineResponse{
		Pipeline: pipeline,
	}, nil
}

func (s *ExternalServer) CreatePipeline(ctx context.Context, req *protos.CreatePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) UpdatePipeline(ctx context.Context, req *protos.UpdatePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) DeletePipeline(ctx context.Context, req *protos.DeletePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) AttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) DetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) PausePipeline(ctx context.Context, req *protos.PausePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) ResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) (*protos.StandardResponse, error) {
	panic("implement me")
}

func (s *ExternalServer) Test(ctx context.Context, req *protos.TestRequest) (*protos.TestResponse, error) {
	return &protos.TestResponse{
		Output: "Pong: " + req.Input,
	}, nil
}
