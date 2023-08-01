package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/validate"
)

type PipelineUsage struct {
	PipelineId string
	Active     bool
	NodeName   string
	SessionId  string
}

// TODO: Implement
func (b *Bus) getPipelineUsage(ctx context.Context, pipelineId string) ([]*PipelineUsage, error) {
	return nil, nil
}

// Pipeline was updated - check if this service has an active registration that
// uses this pipeline id. If it does, we need to have the client "reload" the
// pipeline. We can do this by sending a "SetPipeline" cmd to the client.
func (b *Bus) handleUpdatePipelineRequest(ctx context.Context, req *protos.UpdatePipelineRequest) error {
	b.log.Debugf("handling update pipeline request bus event: %v", req)

	if err := validate.UpdatePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Determine pipeline usage
	usage, err := b.getPipelineUsage(ctx, req.Pipeline.Id)
	if err != nil {
		return errors.Wrap(err, "error getting pipeline usage")
	}

	active := make([]*PipelineUsage, 0)

	for _, u := range usage {
		// If not active, skip
		if !u.Active {
			continue
		}

		// It is active but maybe not on our node
		if u.NodeName != b.options.NodeName {
			continue
		}

		// Active and it is on our node -> need to inform
		active = append(active, u)
	}

	if len(active) == 0 {
		// No active usage -> no need to inform any clients
		b.log.Debugf("no active usage for updated pipeline '%s' - nothing to do", req.Pipeline.Id)
		return nil
	}

	for _, u := range active {
		// TODO: Need to check if have an active cmd channel for this session id
		if _, ok := b.options.CommandChannel[u.SessionId]; !ok { // This needs mutexes
			b.log.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", u.SessionId)
			continue
		}

		b.log.Debugf("sending detach cmd to client '%s' for pipeline '%s'", u.SessionId, u.PipelineId)

		// Send DetachPipeline cmd to client
		b.options.CommandChannel[u.SessionId] <- &protos.Command{
			Command: &protos.Command_DetachPipeline{
				DetachPipeline: &protos.DetachPipelineCommand{
					PipelineId: u.PipelineId,
				},
			},
		}

		b.log.Debugf("sending attach cmd to client '%s' for pipeline '%s'", u.SessionId, u.PipelineId)

		// Send AttachPipeline cmd to client
		b.options.CommandChannel[u.SessionId] <- &protos.Command{
			Command: &protos.Command_AttachPipeline{
				AttachPipeline: &protos.AttachPipelineCommand{
					Pipeline: req.Pipeline,
				},
			},
		}
	}

	return nil
}

// Pipeline was deleted - check if this service has an active registration that
// uses this pipeline ID. If it does, we need to have the client "unload" the
// pipeline. We can do this by sending the client a "DeletePipeline" cmd.
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

// Pipeline was attached to an audience - check if this service has an active
// registration with the provided audience. If it does, we need to send a
// AttachPipeline cmd to the client.
func (b *Bus) handleAttachPipelineRequest(ctx context.Context, req *protos.AttachPipelineRequest) error {
	b.log.Debugf("handling attach pipeline request bus event: %v", req)

	if err := validate.AttachPipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// TODO: ALSO - does this audience pertain to any of our clients?

	// Do we know about this pipeline?

	// TODO: Send SetPipeline commands to appropriate clients

	return nil
}

// Pipeline was detached from an audience - check if this service has an active
// registration with the provided audience. If it does, we need to send a
// DetachPipeline cmd to the client.
func (b *Bus) handleDetachPipelineRequest(ctx context.Context, req *protos.DetachPipelineRequest) error {
	b.log.Debugf("handling detach pipeline request bus event: %v", req)

	if err := validate.DetachPipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Do we know about this attachment?

	return nil
}

// Pipeline was paused - check if this service has an active registration with
// the provided audience. If it does, we need to send a PausePipeline cmd
// to the client.
func (b *Bus) handlePausePipelineRequest(ctx context.Context, req *protos.PausePipelineRequest) error {
	b.log.Debugf("handling pause pipeline request bus event: %v", req)

	if err := validate.PausePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// TODO: Does this audience pertain to us?

	// TODO: Send PausePipeline commands to clients that use this pipeline

	return nil
}

// Pipeline was resumed - check if this service has an active registration with
// the provided audience. If it does, we need to send a ResumePipeline cmd
// to the client.
func (b *Bus) handleResumePipelineRequest(ctx context.Context, req *protos.ResumePipelineRequest) error {
	b.log.Debugf("handling resume pipeline request bus event: %v", req)

	if err := validate.ResumePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// TODO: Does this audience pertain to us?

	// TODO: Maybe send PausePipeline commands to clients that use this pipeline

	return nil
}
