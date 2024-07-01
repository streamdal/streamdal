package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	"github.com/streamdal/streamdal/apps/server/services/store"
	stypes "github.com/streamdal/streamdal/apps/server/services/store/types"
	"github.com/streamdal/streamdal/apps/server/types"
	"github.com/streamdal/streamdal/apps/server/util"
	"github.com/streamdal/streamdal/apps/server/validate"
)

func (b *Bus) handleUpdatePipelineRequest(ctx context.Context, req *protos.UpdatePipelineRequest) error {
	llog := b.log.WithField("method", "handleUpdatePipelineRequest")
	llog.Debugf("handling update pipeline request bus event: %v", req.Pipeline.Name)

	if err := validate.UpdatePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Inform the UI that changes have occurred
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via update pipeline broadcast handler")

	// Get all ACTIVE/LIVE audiences that use this pipeline ID
	usage, err := b.options.Store.GetActivePipelineUsage(ctx, req.Pipeline.Id)
	if err != nil {
		return errors.Wrap(err, "error getting active pipeline usage")
	}

	if len(usage) == 0 {
		llog.Debugf("pipeline id '%s' is not in use on node '%s'- skipping",
			req.Pipeline.Id, b.options.NodeName)
		return nil
	}

	// Get pipeline config for each audience
	for _, u := range usage {
		pipelines, err := b.options.Store.GetPipelinesByAudience(ctx, u.Audience)
		if err != nil {
			return errors.Wrapf(err, "error getting pipeline config by audience '%s'",
				util.AudienceToStr(u.Audience))
		}

		// Send SetPipelines command for session ID
		if _, err := b.sendSetPipelinesCommand(ctx, u.Audience, pipelines, u.SessionId); err != nil {
			llog.Errorf("unable to send SetPipelines command: %v", err)
			return errors.Wrap(err, "error sending SetPipelines command")
		}

		llog.Debugf("sent SetPipeline command to session '%s' for audience '%s'",
			u.SessionId, util.AudienceToStr(u.Audience))
	}

	llog.Debugf("sent SetPipelines commands to '%d' active session(s) for pipeline id '%s'",
		len(usage), req.Pipeline.Id)

	return nil
}

// Filter out audiences that are not live AND are not on this node
func (b *Bus) filterLiveAudiences(ctx context.Context, audiences []*protos.Audience) ([]*stypes.LiveEntry, error) {
	llog := b.log.WithField("method", "filterLiveAudiences")

	llog.Debugf("filtering live audiences")

	// Get all live audiences
	liveEntries, err := b.options.Store.GetLive(ctx)
	if err != nil {
		llog.Errorf("error getting live audiences: %v", err)
		return nil, errors.Wrap(err, "error getting live audiences")
	}

	// Go through live entries and remove audiences that are not on this node
	// and are not part of the req audiences
	filtered := make([]*stypes.LiveEntry, 0)

	for _, le := range liveEntries {
		if le.NodeName != b.options.NodeName {
			continue
		}

		if util.AudienceInList(le.Audience, audiences) {
			filtered = append(filtered, le)
		}
	}

	return filtered, nil
}

// This is mostly a copy of handleUpdatePipelineRequest (just with diff validation)
func (b *Bus) handleDeletePipelineRequest(ctx context.Context, req *protos.DeletePipelineRequest) error {
	llog := b.log.WithField("method", "handleDeletePipelineRequest")
	llog.Debugf("handling attach pipeline request bus event: %v", req)

	// Inform the UI that changes have occurred
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via delete pipeline broadcast handler")

	if err := validate.DeletePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	if len(req.XAudiences) == 0 {
		llog.Debugf("no audiences found for pipeline id '%s' - skipping", req.PipelineId)
		return nil
	}

	liveEntries, err := b.filterLiveAudiences(ctx, req.XAudiences)
	if err != nil {
		llog.Errorf("error filtering live audiences: %v", err)
		return errors.Wrap(err, "error filtering live audiences")
	}

	if len(liveEntries) == 0 {
		llog.Debugf("no active audiences found for pipeline id '%s' - skipping", req.PipelineId)
		return nil
	}

	for _, le := range liveEntries {
		pipelines, err := b.options.Store.GetPipelinesByAudience(ctx, le.Audience)
		if err != nil {
			return errors.Wrapf(err, "error getting pipeline config by audience '%s'",
				util.AudienceToStr(le.Audience))
		}

		// Send SetPipelines command for session ID
		if _, err := b.sendSetPipelinesCommand(ctx, le.Audience, pipelines, le.SessionID); err != nil {
			llog.Debugf("error sending SetPipelines command: %v", err)
			return errors.Wrap(err, "error sending SetPipelines command")
		}

		llog.Debugf("sent SetPipeline command to session '%s' for audience '%s'",
			le.SessionID, util.AudienceToStr(le.Audience))
	}

	llog.Debugf("sent SetPipelines commands to '%d' active session(s) for pipeline id '%s'",
		len(liveEntries), req.PipelineId)

	return nil
}

// Send a SetPipelines command with empty pipelines to all sessions that have
// the audience specified in request.
func (b *Bus) handleDeleteAudienceRequest(ctx context.Context, req *protos.DeleteAudienceRequest) error {
	llog := b.log.WithField("method", "handleDeleteAudienceRequest")
	llog.Debugf("handling delete audience request bus event: %v", req)

	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via delete audience broadcast handler")

	// Get session IDs for audience on this node
	sessionIDs, err := b.options.Store.GetSessionIDsByAudience(ctx, req.Audience, b.options.NodeName)
	if err != nil {
		return errors.Wrapf(err, "error getting session ids by audience '%s' from store", req.Audience)
	}

	// Send empty SetPipelines command to each session
	if _, err := b.sendSetPipelinesCommand(ctx, req.Audience, make([]*protos.Pipeline, 0), sessionIDs...); err != nil {
		llog.Errorf("unable to send SetPipelines command: %v", err)
		return errors.Wrap(err, "error sending SetPipelines command")
	}

	if _, err := b.sendDeleteAudienceCommand(ctx, req.Audience, sessionIDs); err != nil {
		llog.Errorf("unable to send DeleteAudiences command: %v", err)
		return errors.Wrap(err, "error sending DeleteAudiences command")
	}

	return nil
}

func (b *Bus) sendDeleteAudienceCommand(_ context.Context, aud *protos.Audience, sessionIDs []string) (int, error) {
	llog := b.log.WithFields(logrus.Fields{
		"method": "sendDeleteAudienceCommand",
	})

	var sent int

	cmd := &protos.Command{
		Audience: aud,
		Command: &protos.Command_Delete{
			Delete: &protos.DeleteAudiencesCommand{
				Audience: []*protos.Audience{aud},
			},
		},
	}

	for _, sessionID := range sessionIDs {
		ch := b.options.Cmd.GetChannel(sessionID)
		if ch == nil {
			llog.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", sessionID)
			continue
		}

		llog.Debugf("sending DeleteAudiences command to session id '%s' on node '%s'", sessionID, b.options.NodeName)

		ch <- cmd

		sent += 1
	}

	return sent, nil
}

// Checks if the SetPipelines request is for an audience that has an active
// registration on this node. If it does, we will inject schema inference +
// send a SetPipelines cmd to the SDK.
func (b *Bus) handleSetPipelinesRequest(ctx context.Context, req *protos.SetPipelinesRequest) error {
	llog := b.log.WithField("method", "handleSetPipelinesRequest")
	llog.Debugf("handling attach pipeline request bus event: %v", req)

	if err := validate.SetPipelinesRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Inform the UI that changes have occurred
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via set pipelines broadcast handler")

	pipelines := make([]*protos.Pipeline, 0)

	// We are building the pipeline config from the request but could be also
	// doing it by just fetching the pipeline config from the store. But it could
	// be done either way. Using the values specified in the request _seems_
	// more "correct" but it's not actually necessary.
	for _, id := range req.PipelineIds {
		pipeline, err := b.options.Store.GetPipeline(ctx, id)
		if err != nil {
			if errors.Is(err, store.ErrPipelineNotFound) {
				llog.Debugf("pipeline id '%s' not found - skipping", id)
				return nil
			}

			llog.Errorf("error getting pipeline '%s' from store: %v", id, err)
			return errors.Wrapf(err, "error getting pipeline '%s' from store", id)
		}

		pipelines = append(pipelines, pipeline)
	}

	sessionIDs, err := b.options.Store.GetSessionIDsByAudience(ctx, req.Audience, b.options.NodeName)
	if err != nil {
		llog.Errorf("error getting session ids by audience '%s' from store: %v", req.Audience, err)
		return errors.Wrapf(err, "error getting session ids by audience '%s' from store", req.Audience)
	}

	if len(sessionIDs) == 0 {
		llog.Debugf("no active sessions found for audience '%s' on node '%s' - skipping", req.Audience, b.options.NodeName)
		return nil
	}

	llog.Debugf("found '%d' active session(s) for audience '%s' on node '%s'", len(sessionIDs), req.Audience, b.options.NodeName)

	// OK we have an active/live audience on this node - send SetPipelines cmd to it
	numSent, err := b.sendSetPipelinesCommand(ctx, req.Audience, pipelines, sessionIDs...)
	if err != nil {
		llog.Debugf("error sending SetPipelines command: %v", err)
		return errors.Wrap(err, "error sending SetPipelines command")
	}

	llog.Debugf("sent SetPipelines command to '%d' active session(s) for audience '%s'", numSent, req.Audience)

	return nil
}

// Helper for generating pipelines for Pause and Resume pipeline requests.
// Will skip paused pipelines.
func (b *Bus) generatePipelinesForPauseResume(ctx context.Context, aud *protos.Audience) ([]*protos.Pipeline, error) {
	llog := b.log.WithField("method", "generatePipelinesForPauseResume")

	pipelines, err := b.options.Store.GetPipelinesByAudience(ctx, aud)
	if err != nil {
		llog.Errorf("error getting config by audience '%s' from store: %v", aud, err)
		return nil, errors.Wrapf(err, "unable to get config for audience '%s'", util.AudienceToStr(aud))
	}

	activePipelines := make([]*protos.Pipeline, 0)

	// Only include non-paused pipelines
	for _, p := range pipelines {
		if !p.GetXPaused() {
			activePipelines = append(activePipelines, p)
		}
	}

	return activePipelines, nil
}

// Emits a SetPipelines command that OMITS any paused pipelines.
func (b *Bus) handlePausePipelineRequest(ctx context.Context, req *protos.PausePipelineRequest) error {
	llog := b.log.WithField("method", "handlePausePipelineRequest")
	b.log.Debugf("handling pause pipeline request bus event: %v", req)

	// Inform the UI that changes have occurred
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via pause pipeline broadcast handler")

	if err := validate.PausePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Find all audiences + session ID's that use this pipeline ID
	usage, err := b.options.Store.GetActivePipelineUsage(ctx, req.PipelineId)
	if err != nil {
		llog.Errorf("error getting active pipeline usage for pipeline id '%s': %v", req.PipelineId, err)
		return errors.Wrapf(err, "error getting active pipeline usage for pipeline id '%s'", req.PipelineId)
	}

	// For each audience, generate pipeline config that EXCLUDE paused pipeline
	// and send the updated SetPipelines command to each session ID
	for _, u := range usage {
		pipelines, err := b.generatePipelinesForPauseResume(ctx, u.Audience)
		if err != nil {
			llog.Errorf("error generating pipelines for pause: %v", err)
			return errors.Wrap(err, "error generating pipelines for pause")
		}

		llog.Debugf("sending SetPipelines command to session id '%s' for audience '%s'",
			u.SessionId, util.AudienceToStr(u.Audience))

		if _, err := b.sendSetPipelinesCommand(ctx, u.Audience, pipelines, u.SessionId); err != nil {
			llog.Errorf("unable to send SetPipelines command: %v", err)
			return errors.Wrap(err, "error sending SetPipelines command")
		}
	}

	return nil
}

// Same as handlePausePipelineRequest but for resuming a pipeline.
func (b *Bus) handleResumePipelineRequest(ctx context.Context, req *protos.ResumePipelineRequest) error {
	llog := b.log.WithField("method", "handleResumePipelineRequest")
	llog.Debugf("handling resume pipeline request bus event: %v", req)

	if err := validate.ResumePipelineRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	// Inform the UI that changes have occurred
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via resume pipeline broadcast handler")

	// Find all audiences + session ID's that use this pipeline ID
	usage, err := b.options.Store.GetActivePipelineUsage(ctx, req.PipelineId)
	if err != nil {
		llog.Errorf("error getting active pipeline usage for pipeline id '%s': %v", req.PipelineId, err)
		return errors.Wrapf(err, "error getting active pipeline usage for pipeline id '%s'", req.PipelineId)
	}

	// For each audience, generate pipeline config that paused pipeline
	// and send the updated SetPipelines command to each session ID
	for _, u := range usage {
		pipelines, err := b.generatePipelinesForPauseResume(ctx, u.Audience)
		if err != nil {
			llog.Errorf("error generating pipelines for pause: %v", err)
			return errors.Wrap(err, "error generating pipelines for pause")
		}

		llog.Debugf("sending SetPipelines command to session id '%s' for audience '%s'",
			u.SessionId, util.AudienceToStr(u.Audience))

		if _, err := b.sendSetPipelinesCommand(ctx, u.Audience, pipelines, u.SessionId); err != nil {
			llog.Errorf("unable to send SetPipelines command: %v", err)
			return errors.Wrap(err, "error sending SetPipelines command")
		}
	}

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
	sessionIDs, err := b.options.Store.GetSessionIDs(ctx, b.options.NodeName)
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
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via register broadcast handler")
	return nil
}

func (b *Bus) handleDeregisterRequest(_ context.Context, req *protos.DeregisterRequest) error {
	b.log.Debugf("handling delete register request bus event: %v", req)
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via deregister broadcast handler")
	return nil
}

// Send empty SetPipelines command to all session IDs that have the new audience
func (b *Bus) handleNewAudienceRequest(ctx context.Context, req *protos.NewAudienceRequest) error {
	llog := b.log.WithFields(logrus.Fields{
		"method": "handleNewAudienceRequest",
	})

	if err := validate.NewAudienceRequest(req); err != nil {
		llog.Errorf("validation error for new audience request: %v", err)
		return errors.Wrap(err, "validation error")
	}

	// Inform the UI that changes have occurred
	b.options.PubSub.Publish(types.PubSubChangesTopic, "changes detected via new audience broadcast handler")

	// Determine pipeline configuration for audience
	existingPipelines, err := b.options.Store.GetPipelineConfigsByAudience(ctx, req.Audience)
	if err != nil {
		llog.Errorf("error getting config by audience: %v", err)
		return errors.Wrap(err, "error getting config by audience")
	}

	// If this is an existing audience with a pipeline config - nothing to do
	if len(existingPipelines.Configs) > 0 {
		llog.Debugf("audience '%s' already has pipeline configuration - nothing to do", util.AudienceToStr(req.Audience))
		return nil
	}

	// No point in doing anything about this session id if it's not on our node

	// Ensure that this session id is on this node
	exists, err := b.options.Store.SessionIDExistsOnNode(ctx, req.SessionId, b.options.NodeName)
	if err != nil {
		llog.Errorf("error checking if session id '%s' exists on node '%s': %v", req.SessionId, b.options.NodeName, err)
		return errors.Wrapf(err, "error checking if session id '%s' exists on node '%s'", req.SessionId, b.options.NodeName)
	}

	if !exists {
		llog.Debugf("session id '%s' not found on node '%s' - nothing to do in handleNewAudienceRequest()", req.SessionId, b.options.NodeName)
		return nil
	}

	// Session ID is on node - send SetPipelines command
	if _, err := b.sendSetPipelinesCommand(ctx, req.Audience, make([]*protos.Pipeline, 0), req.SessionId); err != nil {
		llog.Errorf("unable to send SetPipelines command: %v", err)
		return errors.Wrap(err, "error sending SetPipelines command")
	}

	llog.Debugf("sent SetPipelineCommands for session id '%s'", req.SessionId)

	return nil
}

// Wrapper for sending SetPipelines command to a list of session IDs; injects
// schema inference pipeline into the list of provided pipelines. Returns
// number of SetPipelines commands that were sent.
func (b *Bus) sendSetPipelinesCommand(
	ctx context.Context,
	aud *protos.Audience,
	pipelines []*protos.Pipeline,
	sessionIDs ...string,
) (int, error) {
	llog := b.log.WithFields(logrus.Fields{
		"method": "sendSetPipelinesCommand",
	})

	// Inject schema inference pipeline
	updatedPipelines, err := b.options.WasmService.InjectSchemaInferenceForPipelines(ctx, pipelines)
	if err != nil {
		llog.Errorf("error injecting schema inference pipeline: %s", err)
		return 0, errors.Wrap(err, "error injecting schema inference pipeline")
	}

	var sent int

	cmd := &protos.Command{
		Audience: aud,
		Command: &protos.Command_SetPipelines{
			SetPipelines: &protos.SetPipelinesCommand{
				Pipelines: updatedPipelines,
			},
		},
	}

	cmd.GetSetPipelines().WasmModules = util.GenerateWasmMapping(cmd)

	for _, sessionID := range sessionIDs {
		ch := b.options.Cmd.GetChannel(sessionID)
		if ch == nil {
			llog.Errorf("expected cmd channel to exist for session id '%s' but none found - skipping", sessionID)
			continue
		}

		llog.Debugf("sending SetPipelines command to session id '%s' on node '%s'", sessionID, b.options.NodeName)

		// TODO: Need to investigate and determine if this could panic as a
		// result an SDK disconnecting and having the channel get closed. If so,
		// need to implement a more reliable way to push the command.
		ch <- cmd

		sent += 1
	}

	return sent, nil
}

func (b *Bus) handleTailCommand(ctx context.Context, req *protos.TailRequest) error {
	b.log.Debugf("handling tail request bus event: %v", req)

	switch req.Type {
	case protos.TailRequestType_TAIL_REQUEST_TYPE_START:
		return b.handleTailRequestStart(ctx, req)
	case protos.TailRequestType_TAIL_REQUEST_TYPE_STOP:
		return b.handleTailRequestStop(ctx, req)
	case protos.TailRequestType_TAIL_REQUEST_TYPE_PAUSE:
		return b.handleTailRequestPause(ctx, req)
	case protos.TailRequestType_TAIL_REQUEST_TYPE_RESUME:
		return b.handleTailRequestResume(ctx, req)
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
	if ok := b.options.PubSub.CloseTopic(req.Id); ok {
		b.log.Debugf("closed pubsub topic '%s'", req.Id)
	} else {
		b.log.Debugf("no pubsub topic '%s' found to close", req.Id)
	}

	return b.sendTailCommand(ctx, req)
}

func (b *Bus) handleTailRequestPause(ctx context.Context, req *protos.TailRequest) error {
	b.log.Debugf("handling tail pause command")
	if err := validate.StartTailRequest(req); err != nil {
		return errors.Wrap(err, "invalid tail request")
	}

	return b.sendTailCommand(ctx, req)
}

func (b *Bus) handleTailRequestResume(ctx context.Context, req *protos.TailRequest) error {
	b.log.Debugf("handling tail resume command")
	if err := validate.StartTailRequest(req); err != nil {
		return errors.Wrap(err, "invalid tail request")
	}

	return b.sendTailCommand(ctx, req)
}

func (b *Bus) sendTailCommand(_ context.Context, req *protos.TailRequest) error {
	// Find registered clients
	// There may be multiple instances connected to the same server instance with
	// the same pipeline ID and audience
	// This needs to be it's own context since the parent context will be canceled on shutdown and
	// thus we won't be able to read from redis in order to send out stop commands
	llog := b.log.WithFields(logrus.Fields{
		"method":          "sendTailCommand",
		"tail_request_id": req.Id,
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
		// that will come in via internal gRPC API and then get shipped over RedisBackend for each server instance
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

	b.options.PubSub.Publish(req.TailRequestId, req)

	return nil
}
