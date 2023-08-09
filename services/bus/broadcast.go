package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/util"
)

func (b *Bus) BroadcastUpdatePipeline(ctx context.Context, req *protos.UpdatePipelineRequest) error {
	return b.broadcast(ctx, "update_pipeline", &protos.BusEvent{Event: &protos.BusEvent_UpdatePipelineRequest{UpdatePipelineRequest: req}})
}

func (b *Bus) BroadcastDeletePipeline(ctx context.Context, req *protos.DeletePipelineRequest) error {
	return b.broadcast(ctx, "delete_pipeline", &protos.BusEvent{Event: &protos.BusEvent_DeletePipelineRequest{DeletePipelineRequest: req}})
}

func (b *Bus) BroadcastAttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) error {
	return b.broadcast(ctx, "attach_pipeline", &protos.BusEvent{Event: &protos.BusEvent_AttachPipelineRequest{AttachPipelineRequest: req}})
}

func (b *Bus) BroadcastDetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) error {
	return b.broadcast(ctx, "detach_pipeline", &protos.BusEvent{Event: &protos.BusEvent_DetachPipelineRequest{DetachPipelineRequest: req}})
}

func (b *Bus) BroadcastPausePipeline(ctx context.Context, req *protos.PausePipelineRequest) error {
	return b.broadcast(ctx, "pause_pipeline", &protos.BusEvent{Event: &protos.BusEvent_PausePipelineRequest{PausePipelineRequest: req}})
}

func (b *Bus) BroadcastResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) error {
	return b.broadcast(ctx, "resume_pipeline", &protos.BusEvent{Event: &protos.BusEvent_ResumePipelineRequest{ResumePipelineRequest: req}})
}

func (b *Bus) BroadcastMetrics(ctx context.Context, req *protos.MetricsRequest) error {
	return b.broadcast(ctx, "metrics", &protos.BusEvent{Event: &protos.BusEvent_MetricsRequest{MetricsRequest: req}})
}

// TODO: Use generics
func (b *Bus) broadcast(ctx context.Context, eventType string, event *protos.BusEvent) error {
	// Need to translate metadata from ctx -> metadata in event

	event.XMetadata = util.CtxMetadata(ctx)
	event.Source = b.options.NodeName

	b.log.Debugf("broadcasting event '%v' metadata: '%+v", eventType, event.XMetadata)

	data, err := proto.Marshal(event)
	if err != nil {
		return errors.Wrap(err, "error marshaling bus message")
	}

	b.options.NATS.Publish(ctx, FullSubject, data)

	return nil
}
