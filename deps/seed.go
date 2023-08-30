package deps

import (
	"context"
	"math/rand"

	"github.com/pkg/errors"

	"github.com/streamdal/snitch-protos/build/go/protos"
	"github.com/streamdal/snitch-protos/build/go/protos/steps"

	"github.com/streamdal/snitch-server/util"
)

func (d *Dependencies) Seed(ctx context.Context) error {
	// First make a bunch of pipelines
	pipelineID1 := "83c8c633-005d-4f6c-ad52-1619c0a92cef"
	pipeline1 := &protos.Pipeline{
		Id:   pipelineID1,
		Name: "Test PII Email Pipeline",
		Steps: []*protos.PipelineStep{
			{
				Name: "PII Email Step",
				OnSuccess: []protos.PipelineStepCondition{
					protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_NOTIFY,
				},
				OnFailure: []protos.PipelineStepCondition{
					protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT,
				},
				Step: &protos.PipelineStep_Detective{
					Detective: &steps.DetectiveStep{
						Path: util.StringPtr("object.payload"),
						Type: steps.DetectiveType_DETECTIVE_TYPE_PII_EMAIL,
					},
				},
			},
		},
	}

	if err := util.PopulateWASMFields(pipeline1, d.Config.WASMDir); err != nil {
		return errors.Wrap(err, "unable to populate WASM fields")
	}

	if err := d.StoreService.CreatePipeline(ctx, pipeline1); err != nil {
		return errors.Wrap(err, "unable to create pipeline1")
	}

	pipelineID2 := "db5ae548-73a2-4e2d-9c0b-380d9a67ade2"
	pipeline2 := &protos.Pipeline{
		Id:   pipelineID2,
		Name: "Test String Contains Pipeline",
		Steps: []*protos.PipelineStep{
			{
				Name: "PII Email Step",
				OnSuccess: []protos.PipelineStepCondition{
					protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_NOTIFY,
				},
				OnFailure: []protos.PipelineStepCondition{
					protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT,
				},
				Step: &protos.PipelineStep_Detective{
					Detective: &steps.DetectiveStep{
						Path: util.StringPtr("object.payload"),
						Args: []string{"@gmail.com"},
						Type: steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
					},
				},
			},
		},
	}

	if err := util.PopulateWASMFields(pipeline2, d.Config.WASMDir); err != nil {
		return errors.Wrap(err, "unable to populate WASM fields")
	}

	if err := d.StoreService.CreatePipeline(ctx, pipeline2); err != nil {
		return errors.Wrap(err, "unable to create pipeline2")
	}

	// Then create a bunch of audiences
	aud1 := &protos.NewAudienceRequest{
		Audience: &protos.Audience{
			ComponentName: "kafka",
			OperationName: "some-producer",
			ServiceName:   "snitchtest",
			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
		},
	}

	if err := d.StoreService.AddAudience(ctx, aud1); err != nil {
		return errors.Wrap(err, "unable to create audience1")
	}

	aud2 := &protos.NewAudienceRequest{
		Audience: &protos.Audience{
			ComponentName: "kafka",
			OperationName: "some-consumer",
			ServiceName:   "snitchtest",
			OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
		},
	}

	if err := d.StoreService.AddAudience(ctx, aud1); err != nil {
		return errors.Wrap(err, "unable to create audience1")
	}

	aud3 := &protos.NewAudienceRequest{
		Audience: &protos.Audience{
			ComponentName: "rabbitmq",
			OperationName: "some-rabbit-producer",
			ServiceName:   "snitchtest",
			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
		},
	}

	if err := d.StoreService.AddAudience(ctx, aud3); err != nil {
		return errors.Wrap(err, "unable to create audience1")
	}

	aud4 := &protos.NewAudienceRequest{
		Audience: &protos.Audience{
			ComponentName: "rabbitmq",
			OperationName: "some-rabbit-consumer",
			ServiceName:   "snitchtest",
			OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
		},
	}

	if err := d.StoreService.AddAudience(ctx, aud4); err != nil {
		return errors.Wrap(err, "unable to create audience1")
	}

	// Attach some audiences to some pipelines
	if err := d.StoreService.AttachPipeline(ctx, &protos.AttachPipelineRequest{
		PipelineId: pipelineID1,
		Audience:   aud1.Audience,
	}); err != nil {
		return errors.Wrap(err, "unable to attach pipeline1 to audience1")
	}

	if err := d.StoreService.AttachPipeline(ctx, &protos.AttachPipelineRequest{
		PipelineId: pipelineID1,
		Audience:   aud2.Audience,
	}); err != nil {
		return errors.Wrap(err, "unable to attach pipeline1 to audience2")
	}

	// Finally seed some metrics
	labels1 := map[string]string{
		"component":     "kafka",
		"operation":     "some-producer",
		"service":       "snitchtest",
		"pipeline_id":   pipelineID1,
		"pipeline_name": pipeline1.Name,
	}

	labels2 := map[string]string{
		"component":     "kafka",
		"operation":     "some-consumer",
		"service":       "snitchtest",
		"pipeline_id":   pipelineID1,
		"pipeline_name": pipeline1.Name,
	}

	metrics := &protos.MetricsRequest{
		Metrics: []*protos.Metric{
			{Name: "counter_produce_bytes", Labels: labels1, Value: float64(rand.Int63())},
			{Name: "counter_produce_errors", Labels: labels1, Value: float64(rand.Int63())},
			{Name: "counter_produce_processed", Labels: labels1, Value: float64(rand.Int63())},
			{Name: "counter_consume_bytes", Labels: labels2, Value: float64(rand.Int63())},
			{Name: "counter_consume_errors", Labels: labels2, Value: float64(rand.Int63())},
			{Name: "counter_consume_errors", Labels: labels2, Value: float64(rand.Int63())},
		},
	}

	if err := d.MetricsService.HandleMetricsRequest(ctx, metrics); err != nil {
		return errors.Wrap(err, "unable to seed metrics")
	}

	return nil
}
