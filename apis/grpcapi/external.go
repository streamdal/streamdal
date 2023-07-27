package grpcapi

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/store"
	"github.com/streamdal/snitch-server/util"
	"github.com/streamdal/snitch-server/validate"
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
	if err := validate.CreatePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	// Create ID for pipeline
	req.Pipeline.Id = util.GenerateUUID()

	// We DO NOT need to broadcast this because the pipeline is brand new and not in use (yet)
	if err := s.Deps.StoreService.CreatePipeline(ctx, req.Pipeline); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("pipeline '%s' created", req.Pipeline.Id),
	}, nil
}

func (s *ExternalServer) UpdatePipeline(ctx context.Context, req *protos.UpdatePipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.UpdatePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	// Is this a known pipeline?
	if _, err := s.Deps.StoreService.GetPipeline(ctx, req.Pipeline.Id); err != nil {
		if err == store.ErrPipelineNotFound {
			return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_NOT_FOUND, err.Error()), nil
		}

		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	// Pipeline exists, we need to broadcast the update because the pipeline
	// MIGHT be actively used and if it was updated, the active pipeline needs
	// to be updated as well

	if err := s.Deps.BusService.BroadcastUpdatePipeline(ctx, req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_INTERNAL_SERVER_ERROR, err.Error()), nil
	}

	return &protos.StandardResponse{
		Id:      util.CtxRequestId(ctx),
		Code:    protos.ResponseCode_RESPONSE_CODE_OK,
		Message: fmt.Sprintf("pipeline '%s' updated", req.Pipeline.Id),
	}, nil
}

func (s *ExternalServer) DeletePipeline(ctx context.Context, req *protos.DeletePipelineRequest) (*protos.StandardResponse, error) {
	if err := validate.DeletePipelineRequest(req); err != nil {
		return util.StandardResponse(ctx, protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST, err.Error()), nil
	}

	// TODO: Does this ID exist?

	// We DO need to broadcast this because the pipeline MIGHT be actively used
	// and now needs to be stopped and deleted.

	// TODO: Broadcast pipeline delete command

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
