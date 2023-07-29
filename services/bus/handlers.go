package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/validate"
)

func (b *Bus) handleRegisterRequest(ctx context.Context, req *protos.RegisterRequest) error {
	b.log.Debugf("handling register request bus event: %v", req)

	if err := validate.RegisterRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Store.AddRegistration(ctx, req); err != nil {
		return errors.Wrap(err, "error saving registration")
	}

	return nil
}

func (b *Bus) handleDeregisterRequest(ctx context.Context, req *protos.DeregisterRequest) error {
	b.log.Debugf("handling delete register request bus event: %v", req)

	if err := validate.DeregisterRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Store.DeleteRegistration(ctx, req); err != nil {
		return errors.Wrap(err, "unable to delete registration")
	}

	return nil
}

func (b *Bus) handleCreatePipelineRequest(ctx context.Context, req *protos.CreatePipelineRequest) error {
	return nil
}

func (b *Bus) handleDeletePipelineRequest(ctx context.Context, req *protos.DeletePipelineRequest) error {
	return nil
}

func (b *Bus) handleUpdatePipelineRequest(ctx context.Context, req *protos.UpdatePipelineRequest) error {
	return nil
}

func (b *Bus) handleAttachPipelineRequest(ctx context.Context, req *protos.AttachPipelineRequest) error {
	return nil
}

func (b *Bus) handleDetachPipelineRequest(ctx context.Context, req *protos.DetachPipelineRequest) error {
	return nil
}

func (b *Bus) handlePausePipelineRequest(ctx context.Context, req *protos.PausePipelineRequest) error {
	return nil
}

func (b *Bus) handleResumePipelineRequest(ctx context.Context, req *protos.ResumePipelineRequest) error {
	return nil
}

func (b *Bus) handleHeartbeatRequest(ctx context.Context, req *protos.HeartbeatRequest) error {
	b.log.Debugf("handling heartbeat request bus event: %v", req)

	if err := validate.HeartbeatRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Store.AddHeartbeat(ctx, req); err != nil {
		return errors.Wrap(err, "error saving heartbeat")
	}

	return nil
}
