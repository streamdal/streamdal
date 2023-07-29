package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/util"
)

func (b *Bus) BroadcastRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	return b.broadcast(ctx, "register", &protos.BusEvent{Event: &protos.BusEvent_RegisterRequest{RegisterRequest: req}})
}

func (b *Bus) BroadcastDeregistration(ctx context.Context, req *protos.DeregisterRequest) error {
	return b.broadcast(ctx, "deregistration", &protos.BusEvent{Event: &protos.BusEvent_DeregisterRequest{DeregisterRequest: req}})
}

func (b *Bus) BroadcastCreatePipeline(ctx context.Context, req *protos.CreatePipelineRequest) error {
	return b.broadcast(ctx, "create_pipeline", &protos.BusEvent{Event: &protos.BusEvent_CreatePipelineRequest{CreatePipelineRequest: req}})
}

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

func (b *Bus) BroadcastHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error {
	return b.broadcast(ctx, "heartbeat", &protos.BusEvent{Event: &protos.BusEvent_HeartbeatRequest{HeartbeatRequest: req}})
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
