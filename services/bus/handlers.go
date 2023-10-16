package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/store"
	"github.com/streamdal/snitch-server/types"
	"github.com/streamdal/snitch-server/util"
	"github.com/streamdal/snitch-server/validate"
)

// Pipeline was updated - check if this service has an active registration that
// uses this pipeline id. If it does, we need to have the client "reload" the
// pipeline. We can do this by sending a "SetPipeline" cmd to the client.
func (b *Bus) handleUpdatePipelineRequest(ctx context.Context, req *protos.UpdatePipelineRequest) error {
	b.log.Debugf("handling update pipeline request bus event: %v", req.Pipeline.Name)

	if err := validate.UpdatePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Determine active pipeline usage
	usage, err := b.options.Store.GetActivePipelineUsage(ctx, req.Pipeline.Id)
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
	usage, err := b.options.Store.GetActivePipelineUsage(ctx, req.PipelineId)
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

// Pipeline was detached from an audience - request will contain session ID's
// that use this pipeline. The session ID's are filled out by the external gRPC
// handler. This is done for Delete and Detach requests so that we can avoid
// having to perform a store lookup in the broadcast handlers.
// If this node doesn't have an active session for the provided session id, then
// it won't have a channel for it and it'll move on to the next session id.
func (b *Bus) handleDetachPipelineRequest(_ context.Context, req *protos.DetachPipelineRequest) error {
	llog := b.log.WithField("method", "handleDetachPipelineRequest")

	llog.Debugf("handling detach pipeline request bus event: %v", req)

	if err := validate.DetachPipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	llog.Debugf("found '%d' session ID's in request", len(req.XSessionIds))

	detached := 0

	// Check if this node has a channel for the session id (ie. has a connected
	// client with given session id) - if yes, send a detach cmd
	for _, sessionID := range req.XSessionIds {
		ch := b.options.Cmd.GetChannel(sessionID)
		if ch == nil {
			llog.Debugf("no channel for session id '%s' on node '%s' - nothing to do", sessionID, b.options.NodeName)
			continue
		}

		llog.Debugf("found channel for session id '%s' on node '%s' - sending detach cmd", sessionID, b.options.NodeName)

		ch <- &protos.Command{
			Audience: req.Audience,
			Command: &protos.Command_DetachPipeline{
				DetachPipeline: &protos.DetachPipelineCommand{
					PipelineId: req.PipelineId,
				},
			},
		}

		detached += 1
	}

	if detached != 0 {
		llog.Debugf("sent detach pipeline command to '%d' active session(s) for pipeline id '%s'", detached, req.PipelineId)
	}

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
	usage, err := b.options.Store.GetActivePipelineUsage(ctx, req.PipelineId)
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
	usage, err := b.options.Store.GetActivePipelineUsage(ctx, req.PipelineId)
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
	//b.log.Debugf("handling metrics request bus event: %v", req)

	if err := validate.MetricsRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if err := b.options.Metrics.HandleMetricsRequest(ctx, req); err != nil {
		return errors.Wrap(err, "error handling metrics request")
	}

	//b.log.Debug("handled metrics request bus event")

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

func (b *Bus) handleRegisterRequest(_ context.Context, req *protos.RegisterRequest) error {
	b.log.Debugf("handling register request bus event: %v", req)
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via register handler")
	return nil
}

func (b *Bus) handleDeleteAudienceRequest(_ context.Context, req *protos.DeleteAudienceRequest) error {
	b.log.Debugf("handling delete audience request bus event: %v", req)
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via delete audience handler")
	return nil
}

func (b *Bus) handleDeregisterRequest(_ context.Context, req *protos.DeregisterRequest) error {
	b.log.Debugf("handling delete register request bus event: %v", req)
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via deregister handler")
	return nil
}

func (b *Bus) handleNewAudienceRequest(_ context.Context, req *protos.NewAudienceRequest) error {
	b.log.Debugf("handling new audience request bus event: %v", req)
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via new audience handler")
	return nil
}

func (b *Bus) handleTailCommand(ctx context.Context, req *protos.TailRequest) error {
	b.log.Debugf("handling tail request bus event: %v", req)

	switch req.Type {
	case protos.TailRequestType_TAIL_REQUEST_TYPE_START:
		return b.handleTailRequestStart(ctx, req)
	case protos.TailRequestType_TAIL_REQUEST_TYPE_STOP:
		return b.handleTailRequestStop(ctx, req)
	default:
		b.log.Debugf("unknown tail command type: %v", req.Type)
	}

	return nil
}

func (b *Bus) handleTailRequestStart(ctx context.Context, req *protos.TailRequest) error {
	b.log.Debugf("handling tail start command")
	if err := validate.StartTailRequest(req); err != nil {
		return errors.Wrap(err, "invalid tail request")
	}

	return b.sendTailCommand(ctx, req)
}

func (b *Bus) handleTailRequestStop(ctx context.Context, req *protos.TailRequest) error {
	b.log.Debugf("handling tail stop command")
	if err := validate.StopTailRequest(req); err != nil {
		return errors.Wrap(err, "invalid tail request")
	}

	// Close any pubsub channel
	if ok := b.options.PubSub.CloseTopic(req.GetXId()); ok {
		b.log.Debugf("closed pubsub topic '%s'", req.GetXId())
	} else {
		b.log.Debugf("no pubsub topic '%s' found to close", req.GetXId())
	}

	return b.sendTailCommand(ctx, req)
}

func (b *Bus) sendTailCommand(_ context.Context, req *protos.TailRequest) error {
	// Find registered clients
	// There may be multiple instances connected to the same snitch server instance with
	// the same pipeline ID and audience
	// This needs to be it's own context since the parent context will be canceled on shutdown and
	// thus we won't be able to read from redis in order to send out stop commands
	llog := b.log.WithFields(logrus.Fields{
		"method":          "sendTailCommand",
		"tail_request_id": req.GetXId(),
		"audience":        req.Audience,
		"audience_str":    util.AudienceToStr(req.Audience),
	})

	llog.Debug("before get live")

	live, err := b.options.Store.GetLive(context.Background())
	if err != nil {
		llog.Errorf("unable to get live SDK connections: %v", err)
		return errors.Wrap(err, "unable to get live SDK connections")
	}

	llog.Debugf("after get live; num live elements: %d", len(live))

	for _, l := range live {
		// Check if the audience matches
		if !util.AudienceEquals(l.Audience, req.Audience) {
			llog.Debugf("audience '%s' does not match '%s'", util.AudienceToStr(l.Audience), util.AudienceToStr(req.Audience))
			continue
		}

		llog.Debugf("audience '%s' matches '%s'", util.AudienceToStr(l.Audience), util.AudienceToStr(req.Audience))

		// Session isn't talking to this node
		if l.NodeName != b.options.NodeName {
			llog.Debugf("live connection is not on the same node (our node: '%s', connection node '%s')", b.options.NodeName, l.NodeName)
			continue
		}

		llog.Debugf("live connection is on the same node (our node: '%s', connection node '%s')", b.options.NodeName, l.NodeName)

		// Get channel for the connected client. This allows us to send commands
		// to a client that is connected via the Register() method
		sdkCommandChan, isNewChan := b.options.Cmd.AddChannel(l.SessionID)
		if isNewChan {
			b.log.Debugf("new channel created for session id '%s'", l.SessionID)
		} else {
			b.log.Debugf("channel already exists for session id '%s'", l.SessionID)
		}

		// Send TailCommand to connected client
		// This causes the client to call SendTail() on it's end, which initiates a stream of TailResponse messages
		// that will come in via internal gRPC API and then get shipped over RedisBackend for each snitch server instance
		// to possibly receive and then further send to the front end
		llog.Debugf("sending tail command to session id '%s'", l.SessionID)

		sdkCommandChan <- &protos.Command{
			Audience: req.Audience,
			Command: &protos.Command_Tail{
				Tail: &protos.TailCommand{
					Request: req,
				},
			},
		}
	}

	return nil
}

func (b *Bus) handleTailResponse(_ context.Context, req *protos.TailResponse) error {
	llog := b.log.WithFields(logrus.Fields{
		"session_id":      req.SessionId,
		"tail_request_id": req.TailRequestId,
		"method":          "handleTailResponse",
	})

	llog.Debug("handling tail response bus event")

	// Check if there is a pubsub topic.
	// If not, we're not the instance that the frontend is connected to and can ignore the event.
	if !b.options.PubSub.HaveTopic(req.TailRequestId) {
		llog.Debug("no pubsub topic - skipping")
		return nil
	}

	llog.Debug("before publish to pubsub topic '%s'", req.TailRequestId)

	b.options.PubSub.Publish(req.TailRequestId, req)

	llog.Debug("after publish to pubsub topic '%s'", req.TailRequestId)

	return nil
}
