package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/store"
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
	b.log.Debugf("handling create pipeline request bus event: %v", req)

	if err := validate.CreatePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Do we know about this pipeline? If not, create it
	if _, err := b.options.Store.GetPipeline(ctx, req.Pipeline.Id); err != nil {
		if err == store.ErrPipelineNotFound {
			b.log.Debugf("pipeline %s not found, creating", req.Pipeline.Id)

			if err := b.options.Store.CreatePipeline(ctx, req.Pipeline); err != nil {
				return errors.Wrap(err, "error creating pipeline")
			}

			return nil
		}

		return errors.Wrap(err, "error getting pipeline")
	}

	b.log.Debugf("pipeline %s already exists, skipping", req.Pipeline.Id)

	return nil
}

func (b *Bus) handleDeletePipelineRequest(ctx context.Context, req *protos.DeletePipelineRequest) error {
	b.log.Debugf("handling delete pipeline request bus event: %v", req)

	if err := validate.DeletePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Store.DeletePipeline(ctx, req.PipelineId); err != nil {
		b.log.Debugf("error deleting pipeline '%s'", req.PipelineId)

		return errors.Wrap(err, "error deleting pipeline")
	}

	// TODO: Send DeletePipeline commands to clients that use this pipeline

	return nil
}

// Can only update pipeline that already exists
func (b *Bus) handleUpdatePipelineRequest(ctx context.Context, req *protos.UpdatePipelineRequest) error {
	b.log.Debugf("handling update pipeline request bus event: %v", req)

	if err := validate.UpdatePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Error if doesn't exist
	if _, err := b.options.Store.GetPipeline(ctx, req.Pipeline.Id); err != nil {
		if err == store.ErrPipelineNotFound {
			b.log.Debugf("pipeline %s not found, cannot update", req.Pipeline.Id)

			return errors.Wrap(err, "pipeline not found")
		}

		return errors.Wrap(err, "error getting pipeline for update")
	}

	// Pipeline exists - perform update
	if err := b.options.Store.UpdatePipeline(ctx, req.Pipeline); err != nil {
		return errors.Wrap(err, "error updating pipeline")
	}

	// TODO: Send SetPipeline commands to clients that use this pipeline

	return nil
}

func (b *Bus) handleAttachPipelineRequest(ctx context.Context, req *protos.AttachPipelineRequest) error {
	b.log.Debugf("handling attach pipeline request bus event: %v", req)

	if err := validate.AttachPipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// TODO: ALSO - does this audience pertain to any of our clients?

	// Do we know about this pipeline?

	// Save attachment configuration
	if err := b.options.Store.AttachPipeline(ctx, req); err != nil {
		b.log.Debugf("unable to save attachment for pipeline %s: %s", req.PipelineId, err)
		return errors.Wrapf(err, "error saving attachment for pipeline '%s'", req.PipelineId)
	}

	// TODO: Send SetPipeline commands to appropriate clients

	return nil
}

func (b *Bus) handleDetachPipelineRequest(ctx context.Context, req *protos.DetachPipelineRequest) error {
	b.log.Debugf("handling detach pipeline request bus event: %v", req)

	if err := validate.DetachPipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Do we know about this attachment?

	return nil
}

func (b *Bus) handlePausePipelineRequest(ctx context.Context, req *protos.PausePipelineRequest) error {
	b.log.Debugf("handling pause pipeline request bus event: %v", req)

	if err := validate.PausePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// TODO: Does this audience pertain to us?

	// TODO: Maybe send PausePipeline commands to clients that use this pipeline

	return nil
}

func (b *Bus) handleResumePipelineRequest(ctx context.Context, req *protos.ResumePipelineRequest) error {
	b.log.Debugf("handling resume pipeline request bus event: %v", req)

	if err := validate.ResumePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// TODO: Does this audience pertain to us?

	// TODO: Maybe send PausePipeline commands to clients that use this pipeline

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
