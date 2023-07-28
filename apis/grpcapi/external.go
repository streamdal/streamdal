package grpcapi

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"github.com/streamdal/snitch-protos/build/go/protos/steps"
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
	// This is a dummy return just to avoid a panic
	return &protos.GetServiceMapResponse{
		ServiceMap: map[string]*protos.ServiceInfo{
			"Test Service Name": {
				Name:        "Test Service Name",
				Description: "This is a test service",
				Pipelines: []*protos.PipelineInfo{
					&protos.PipelineInfo{
						Audience: &protos.Audience{
							ServiceName:   "Test Service Name",
							ComponentName: "kafka",
							OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
						},
						Pipeline: &protos.Pipeline{
							Id:   "1234-1234-123456",
							Name: "Best pipeline",
							Steps: []*protos.PipelineStep{
								&protos.PipelineStep{
									Name:      "Best step",
									OnSuccess: nil, // unset, notify, nil == continue
									OnFailure: []protos.PipelineStepCondition{
										protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT,
									},
									Step: &protos.PipelineStep_Detective{
										Detective: &steps.DetectiveStep{
											Path:   "object.field",
											Args:   nil,
											Negate: false,
											Type:   steps.DetectiveType_DETECTIVE_TYPE_IPV4_ADDRESS,
										},
									},
								},
							},
						},
					},
				},
				Consumers: nil,
				Producers: nil,
				Clients:   nil,
			},
		},
	}, nil
}

func (s *ExternalServer) GetPipelines(context.Context, *protos.GetPipelinesRequest) (*protos.GetPipelinesResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) GetPipeline(context.Context, *protos.GetPipelineRequest) (*protos.GetPipelineResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) CreatePipeline(context.Context, *protos.CreatePipelineRequest) (*protos.StandardResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) UpdatePipeline(context.Context, *protos.UpdatePipelineRequest) (*protos.StandardResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) DeletePipeline(context.Context, *protos.DeletePipelineRequest) (*protos.StandardResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) AttachPipeline(context.Context, *protos.AttachPipelineRequest) (*protos.StandardResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) DetachPipeline(context.Context, *protos.DetachPipelineRequest) (*protos.StandardResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) PausePipeline(context.Context, *protos.PausePipelineRequest) (*protos.StandardResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) ResumePipeline(context.Context, *protos.ResumePipelineRequest) (*protos.StandardResponse, error) {
	return nil, errors.New("not implemented")
}

func (s *ExternalServer) Test(ctx context.Context, req *protos.TestRequest) (*protos.TestResponse, error) {
	return &protos.TestResponse{
		Output: "Pong: " + req.Input,
	}, nil
}
