package bus

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/validate"
)

func (b *Bus) handleRegisterRequestBusEvent(ctx context.Context, req *protos.RegisterRequest) error {
	b.log.Debugf("handling register request bus event: %v", req)

	if err := validate.RegisterRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Store.AddRegistration(ctx, req); err != nil {
		return errors.Wrap(err, "error saving registration")
	}

	return nil
}

func (b *Bus) handleHeartbeatRequestBusEvent(ctx context.Context, req *protos.HeartbeatRequest) error {
	b.log.Debugf("handling heartbeat request bus event: %v", req)

	if err := validate.HeartbeatRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Store.AddHeartbeat(ctx, req); err != nil {
		return errors.Wrap(err, "error saving heartbeat")
	}

	return nil
}

func (b *Bus) handleDeregisterRequestBusEvent(ctx context.Context, req *protos.DeregisterRequest) error {
	b.log.Debugf("handling delete register request bus event: %v", req)

	if err := validate.DeregisterRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Store.DeleteRegistration(ctx, req); err != nil {
		return errors.Wrap(err, "unable to delete registration")
	}

	return nil
}

func (b *Bus) handleCommandBusEvent(ctx context.Context, req *protos.Command) error {
	b.log.Debugf("handling comand response bus event: %v", req)

	if err := validate.Command(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	var err error

	switch req.Command.(type) {
	case *protos.Command_SetPipeline:
		err = b.handleSetPipelineCommand(ctx, req.GetSetPipeline())
	case *protos.Command_DeletePipeline:
		err = b.handleDeletePipelineCommand(ctx, req.GetDeletePipeline())
	case *protos.Command_PausePipeline:
		err = b.handlePausePipelineCommand(ctx, req.GetPausePipeline())
	case *protos.Command_UnpausePipeline:
		err = b.handleUnpausePipelineCommand(ctx, req.GetUnpausePipeline())
	default:
		return fmt.Errorf("unknown command type '%v'", req.Command)
	}

	if err != nil {
		return errors.Wrap(err, "error handling command response")
	}

	return nil
}

func (b *Bus) handleSetPipelineCommand(ctx context.Context, req *protos.SetPipelineCommand) error {
	if err := validate.SetPipelineCommand(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}

func (b *Bus) handleDeletePipelineCommand(ctx context.Context, req *protos.DeletePipelineCommand) error {
	if err := validate.DeletePipelineCommand(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}

func (b *Bus) handlePausePipelineCommand(ctx context.Context, req *protos.PausePipelineCommand) error {
	if err := validate.PausePipelineCommand(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}

func (b *Bus) handleUnpausePipelineCommand(ctx context.Context, req *protos.UnpausePipelineCommand) error {
	if err := validate.UnpausePipelineCommand(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}
