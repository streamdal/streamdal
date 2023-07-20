package bus

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/validate"
)

// TODO: Implement
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

func (b *Bus) handleCommandResponseBusEvent(ctx context.Context, req *protos.CommandResponse) error {
	b.log.Debugf("handling comand response bus event: %v", req)

	if err := validate.CommandResponse(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	var err error

	switch req.Command.(type) {
	case *protos.CommandResponse_SetPipeline:
		err = b.handleSetPipelineCommandResponse(ctx, req.GetSetPipeline())
	case *protos.CommandResponse_DeletePipeline:
		err = b.handleDeletePipelineCommandResponse(ctx, req.GetDeletePipeline())
	case *protos.CommandResponse_PausePipeline:
		err = b.handlePausePipelineCommandResponse(ctx, req.GetPausePipeline())
	case *protos.CommandResponse_UnpausePipeline:
		err = b.handleUnpausePipelineCommandResponse(ctx, req.GetUnpausePipeline())
	default:
		return fmt.Errorf("unknown command type '%v'", req.Command)
	}

	if err != nil {
		return errors.Wrap(err, "error handling command response")
	}

	return nil
}

func (b *Bus) handleSetPipelineCommandResponse(ctx context.Context, req *protos.SetPipelineCommand) error {
	if err := validate.SetPipelineCommand(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}

func (b *Bus) handleDeletePipelineCommandResponse(ctx context.Context, req *protos.DeletePipelineCommand) error {
	if err := validate.DeletePipelineCommand(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}

func (b *Bus) handlePausePipelineCommandResponse(ctx context.Context, req *protos.PausePipelineCommand) error {
	if err := validate.PausePipelineCommand(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}

func (b *Bus) handleUnpausePipelineCommandResponse(ctx context.Context, req *protos.UnpausePipelineCommand) error {
	if err := validate.UnpausePipelineCommand(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}
