package bus

import (
	"context"

	"github.com/pkg/errors"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/store"
	"github.com/streamdal/snitch-server/types"
	"github.com/streamdal/snitch-server/util"
	"github.com/streamdal/snitch-server/validate"
)

type PipelineUsage struct {
	PipelineId string
	Active     bool
	NodeName   string
	SessionId  string
	Audience   *protos.Audience
}

// Get pipeline usage across the entire cluster
func (b *Bus) getPipelineUsage(ctx context.Context) ([]*PipelineUsage, error) {
	pipelines := make([]*PipelineUsage, 0)

	// Get config for all pipelines & audiences
	cfgs, err := b.options.Store.GetConfig(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting configs")
	}

	// No cfgs == no pipelines
	if len(cfgs) == 0 {
		return pipelines, nil
	}

	// Get live clients
	live, err := b.options.Store.GetLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting live audiences")
	}

	// Build list of all used pipelines
	for aud, pipelineIDs := range cfgs {
		for _, pid := range pipelineIDs {
			pu := &PipelineUsage{
				PipelineId: pid,
				Audience:   aud,
			}

			// Check if this pipeline is "active"
			for _, l := range live {
				if util.AudienceEquals(l.Audience, aud) {
					pu.Active = true
					pu.NodeName = l.NodeName
					pu.SessionId = l.SessionID
				}
			}

			pipelines = append(pipelines, pu)
		}
	}

	return pipelines, nil
}

// Get active pipelines on this node
func (b *Bus) getActivePipelineUsage(ctx context.Context, pipelineID string) ([]*PipelineUsage, error) {
	usage, err := b.getPipelineUsage(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting pipeline usage")
	}

	active := make([]*PipelineUsage, 0)

	for _, u := range usage {
		if !u.Active {
			continue
		}

		if u.NodeName != b.options.NodeName {
			continue
		}

		if u.PipelineId != pipelineID {
			continue
		}

		active = append(active, u)
	}

	return active, nil
}

// Pipeline was updated - check if this service has an active registration that
// uses this pipeline id. If it does, we need to have the client "reload" the
// pipeline. We can do this by sending a "SetPipeline" cmd to the client.
func (b *Bus) handleUpdatePipelineRequest(ctx context.Context, req *protos.UpdatePipelineRequest) error {
	b.log.Debugf("handling update pipeline request bus event: %v", req)

	if err := validate.UpdatePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Determine active pipeline usage
	usage, err := b.getActivePipelineUsage(ctx, req.Pipeline.Id)
	if err != nil {
		return errors.Wrap(err, "error getting pipeline usage")
	}

	if len(usage) == 0 {
		b.log.Debugf("no active pipeline usage found for pipeline id '%s' on node '%s' - skipping", req.Pipeline.Id, b.options.NodeName)
		return nil
	}

	for _, u := range usage {
		cmdCh := b.options.Cmd.GetChannel(u.SessionId)

		if cmdCh == nil {
			b.log.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", u.SessionId)
			continue
		}

		// Populate WASM fields
		if err := util.PopulateWASMFields(req.Pipeline, b.options.WASMDir); err != nil {
			return errors.Wrap(err, "error populating wasm fields")
		}

		b.log.Debugf("sending detach cmd to client '%s' for pipeline '%s'", u.SessionId, u.PipelineId)

		// Send DetachPipeline cmd to client
		cmdCh <- &protos.Command{
			Audience: u.Audience,
			Command: &protos.Command_DetachPipeline{
				DetachPipeline: &protos.DetachPipelineCommand{
					PipelineId: u.PipelineId,
				},
			},
		}

		b.log.Debugf("sending attach cmd to client '%s' for pipeline '%s'", u.SessionId, u.PipelineId)

		// Send AttachPipeline cmd to client
		cmdCh <- &protos.Command{
			Audience: u.Audience,
			Command: &protos.Command_AttachPipeline{
				AttachPipeline: &protos.AttachPipelineCommand{
					Pipeline: req.Pipeline,
				},
			},
		}
	}

	return nil
}

// Pipeline was deleted. We need to determine if we have any active clients
// using that pipeline. If yes, we need to tell them to detach the pipeline.
func (b *Bus) handleDeletePipelineRequest(ctx context.Context, req *protos.DeletePipelineRequest) error {
	b.log.Debugf("handling delete pipeline request bus event: %v", req)

	if err := validate.DeletePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Determine active pipeline usage
	usage, err := b.getActivePipelineUsage(ctx, req.PipelineId)
	if err != nil {
		return errors.Wrap(err, "error getting pipeline usage")
	}

	if len(usage) == 0 {
		b.log.Debugf("no active pipeline usage found for pipeline id '%s' on node '%s' - skipping", req.PipelineId, b.options.NodeName)
		return nil
	}

	b.log.Debugf("found '%d' active pipeline usage(s) for pipeline id '%s' on node '%s'", len(usage), req.PipelineId, b.options.NodeName)

	notified := 0

	// Inform active clients to detach pipeline
	for _, u := range usage {
		ch := b.options.Cmd.GetChannel(u.SessionId)
		if ch == nil {
			b.log.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", u.SessionId)
			continue
		}

		ch <- &protos.Command{
			Audience: u.Audience,
			Command: &protos.Command_DetachPipeline{
				DetachPipeline: &protos.DetachPipelineCommand{
					PipelineId: req.PipelineId,
				},
			},
		}

		notified += 1
	}

	b.log.Debugf("notified '%d' active pipeline usage(s) for pipeline id '%s' on node '%s'", notified, req.PipelineId, b.options.NodeName)

	return nil
}

// Get session id's on this node
func (b *Bus) getSessionIDs(ctx context.Context) ([]string, error) {
	entries, err := b.options.Store.GetLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting live entries")
	}

	sessionIDs := make([]string, 0)

	for _, e := range entries {
		if e.NodeName != b.options.NodeName {
			continue
		}

		sessionIDs = append(sessionIDs, e.SessionID)
	}

	return sessionIDs, nil
}

// Get session id's by audience (and current node)
func (b *Bus) getSessionIDsByAudience(ctx context.Context, audience *protos.Audience) ([]string, error) {
	entries, err := b.options.Store.GetLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting live entries")
	}

	sessionIDs := make([]string, 0)

	for _, e := range entries {
		if !util.AudienceEquals(e.Audience, audience) {
			continue
		}

		if e.NodeName != b.options.NodeName {
			continue
		}

		sessionIDs = append(sessionIDs, e.SessionID)
	}

	return sessionIDs, nil
}

// Pipeline was attached to an audience - check if this service has an active
// registration with the provided audience. If it does, we need to send a
// AttachPipeline cmd to the client.
func (b *Bus) handleAttachPipelineRequest(ctx context.Context, req *protos.AttachPipelineRequest) error {
	b.log.Debugf("handling attach pipeline request bus event: %v", req)

	if err := validate.AttachPipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Is this a valid pipeline id?
	pipeline, err := b.options.Store.GetPipeline(ctx, req.PipelineId)
	if err != nil {
		if err == store.ErrPipelineNotFound {
			b.log.Debugf("pipeline id '%s' not found - skipping", req.PipelineId)
			return nil
		}

		b.log.Errorf("error getting pipeline '%s' from store: %v", req.PipelineId, err)
		return errors.Wrapf(err, "error getting pipeline '%s' from store", req.PipelineId)
	}

	// TODO: commented out by MG 2023-08-16. This prevents broadcast commands from being emitted
	// TODO: not sure this is even needed
	// Is this audience already attached to a pipeline?
	//attachedPipelineID, err := b.options.Store.GetConfigByAudience(ctx, req.Audience)
	//if err != nil {
	//	if err == store.ErrConfigNotFound {
	//		b.log.Debugf("config for audience '%s' not found - nothing to do", req.Audience)
	//		return nil
	//	}
	//
	//	b.log.Errorf("error getting audience '%s' config from store: %v", req.Audience, err)
	//	return errors.Wrapf(err, "error getting audience '%s' config from store", req.Audience)
	//}
	//
	//if attachedPipelineID != "" {
	//	b.log.Debugf("audience '%s' is already attached to pipeline '%s'", req.Audience, attachedPipelineID)
	//	return nil
	//}

	sessionIDs, err := b.getSessionIDsByAudience(ctx, req.Audience)
	if err != nil {
		b.log.Errorf("error getting session ids by audience '%s' from store: %v", req.Audience, err)
		return errors.Wrapf(err, "error getting session ids by audience '%s' from store", req.Audience)
	}

	if len(sessionIDs) == 0 {
		b.log.Debugf("no active sessions found for audience '%s' on node '%s' - skipping", req.Audience, b.options.NodeName)
		return nil
	}

	b.log.Debugf("found '%d' active session(s) for audience '%s' on node '%s'", len(sessionIDs), req.Audience, b.options.NodeName)

	attached := 0

	// OK we have an active audience on this node - let's tell it to attach!
	for _, sessionID := range sessionIDs {
		ch := b.options.Cmd.GetChannel(sessionID)
		if ch == nil {
			b.log.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", sessionID)
			continue
		}

		ch <- &protos.Command{
			Audience: req.Audience,
			Command: &protos.Command_AttachPipeline{
				AttachPipeline: &protos.AttachPipelineCommand{
					Pipeline: pipeline,
				},
			},
		}

		attached += 1
	}

	b.log.Debugf("sent attach pipeline command to '%d' active session(s) for audience '%s'", attached, req.Audience)

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

	// Get active pipelines on this node for this pipeline ID
	usage, err := b.getActivePipelineUsage(ctx, req.PipelineId)
	if err != nil {
		b.log.Errorf("error getting active pipeline usage from store: %v", err)
		return errors.Wrap(err, "error getting active pipeline usage from store")
	}

	if len(usage) == 0 {
		b.log.Debugf("pipeline id '%s' not used on node '%s' - skipping", req.PipelineId, b.options.NodeName)
		return nil
	}

	b.log.Debugf("found '%d' active pipeline usage(s) for pipeline id '%s' on node '%s'", len(usage), req.PipelineId, b.options.NodeName)

	detached := 0

	for _, u := range usage {
		ch := b.options.Cmd.GetChannel(u.SessionId)
		if ch == nil {
			b.log.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", u.SessionId)
			continue
		}

		ch <- &protos.Command{
			Audience: u.Audience,
			Command: &protos.Command_DetachPipeline{
				DetachPipeline: &protos.DetachPipelineCommand{
					PipelineId: req.PipelineId,
				},
			},
		}

		detached += 1
	}

	b.log.Debugf("sent detach pipeline command to '%d' active session(s) for pipeline id '%s'", detached, req.PipelineId)

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

	// Do we have a live audience on this node?
	usage, err := b.getActivePipelineUsage(ctx, req.PipelineId)
	if err != nil {
		b.log.Errorf("error getting active pipeline usage from store: %v", err)
		return errors.Wrap(err, "error getting active pipeline usage from store")
	}

	if len(usage) == 0 {
		b.log.Debugf("pipeline id '%s' not used on node '%s' - skipping", req.PipelineId, b.options.NodeName)
		return nil
	}

	// No point in trying to figure out if pause command was already sent -
	// send it again, the SDK can figure out if it's already paused or not.
	b.log.Debugf("found '%d' active pipeline usage(s) for pipeline id '%s' on node '%s'", len(usage), req.PipelineId, b.options.NodeName)

	paused := 0

	for _, u := range usage {
		ch := b.options.Cmd.GetChannel(u.SessionId)
		if ch == nil {
			b.log.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", u.SessionId)
			continue
		}

		ch <- &protos.Command{
			Audience: u.Audience,
			Command: &protos.Command_PausePipeline{
				PausePipeline: &protos.PausePipelineCommand{
					PipelineId: req.PipelineId,
				},
			},
		}

		paused += 1
	}

	b.log.Debugf("sent pause pipeline command to '%d' active session(s) for pipeline id '%s'", paused, req.PipelineId)

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

	// Do we have a live audience on this node?
	usage, err := b.getActivePipelineUsage(ctx, req.PipelineId)
	if err != nil {
		b.log.Errorf("error getting active pipeline usage from store: %v", err)
		return errors.Wrap(err, "error getting active pipeline usage from store")
	}

	if len(usage) == 0 {
		b.log.Debugf("pipeline id '%s' not used on node '%s' - skipping", req.PipelineId, b.options.NodeName)
		return nil
	}

	// No point in trying to figure out if pause command was already sent -
	// send it again, the SDK can figure out if it's already paused or not.
	b.log.Debugf("found '%d' active pipeline usage(s) for pipeline id '%s' on node '%s'", len(usage), req.PipelineId, b.options.NodeName)

	paused := 0

	for _, u := range usage {
		ch := b.options.Cmd.GetChannel(u.SessionId)
		if ch == nil {
			b.log.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", u.SessionId)
			continue
		}

		ch <- &protos.Command{
			Audience: u.Audience,
			Command: &protos.Command_ResumePipeline{
				ResumePipeline: &protos.ResumePipelineCommand{
					PipelineId: req.PipelineId,
				},
			},
		}

		paused += 1
	}

	b.log.Debugf("sent resume pipeline command to '%d' active session(s) for pipeline id '%s'", paused, req.PipelineId)

	return nil
}

func (b *Bus) handleMetricsRequest(ctx context.Context, req *protos.MetricsRequest) error {
	b.log.Debugf("handling metrics request bus event: %v", req)

	if err := validate.MetricsRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Metrics.HandleMetricsRequest(ctx, req); err != nil {
		return errors.Wrap(err, "error handling metrics request")
	}

	b.log.Debug("handled metrics request bus event")

	return nil
}

func (b *Bus) handleKVRequest(ctx context.Context, req *protos.KVRequest) error {
	b.log.Debugf("handling kv request bus event: %v", req)

	if err := validate.KVRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Get all session ID's on this node
	sessionIDs, err := b.getSessionIDs(ctx)
	if err != nil {
		return errors.Wrap(err, "error getting session ids")
	}

	if len(sessionIDs) == 0 {
		b.log.Debugf("no active sessions on node '%s' - skipping KV handling", b.options.NodeName)
		return nil
	}

	// For each session id, get it's channel and send KV instructions
	for _, sessionID := range sessionIDs {
		ch := b.options.Cmd.GetChannel(sessionID)
		if ch == nil {
			// ch is no longer there - the client probably disconnected; should we error or just skip?
			b.log.Debugf("expected cmd channel to exist for session id '%s' but none found - skipping", sessionID)
			continue
		}

		// Send KV instructions to session
		ch <- &protos.Command{
			Command: &protos.Command_Kv{
				Kv: &protos.KVCommand{
					Instructions: req.Instructions,
				},
			},
		}
	}

	b.log.Debug("handled kv request bus event")

	return nil
}

func (b *Bus) handleRegisterRequest(shutdownCtx context.Context, req *protos.RegisterRequest) error {
	b.log.Debugf("handling delete audience request bus event: %v", req)
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via register handler")
	return nil
}

func (b *Bus) handleDeleteAudienceRequest(shutdownCtx context.Context, req *protos.DeleteAudienceRequest) error {
	b.log.Debugf("handling delete audience request bus event: %v", req)
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via delete audience handler")
	return nil
}

func (b *Bus) handleDeregisterRequest(ctx context.Context, req *protos.DeregisterRequest) error {
	b.log.Debugf("handling delete register request bus event: %v", req)
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via deregister handler")
	return nil
}
