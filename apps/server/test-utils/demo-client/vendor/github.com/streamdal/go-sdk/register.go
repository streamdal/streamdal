package streamdal

import (
	"context"
	"fmt"
	"runtime"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/relistan/go-director"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"

	"github.com/streamdal/go-sdk/validate"
)

var (
	ErrPipelineNotPaused = errors.New("pipeline not paused")
	ErrPipelineNotActive = errors.New("pipeline not active or does not exist")
)

func (s *Streamdal) genClientInfo() *protos.ClientInfo {
	return &protos.ClientInfo{
		ClientType:     protos.ClientType(s.config.ClientType),
		LibraryName:    "go-sdk",
		LibraryVersion: "v0.0.84",
		Language:       "go",
		Arch:           runtime.GOARCH,
		Os:             runtime.GOOS,
	}
}

func (s *Streamdal) register(looper director.Looper) error {
	req := &protos.RegisterRequest{
		ServiceName: s.config.ServiceName,
		SessionId:   s.sessionID,
		ClientInfo:  s.genClientInfo(),
		Audiences:   make([]*protos.Audience, 0),
		DryRun:      s.config.DryRun,
	}

	s.audiencesMtx.Lock()
	for _, aud := range s.config.Audiences {
		pAud := aud.toProto(s.config.ServiceName)
		req.Audiences = append(req.Audiences, pAud)
		s.audiences[audToStr(pAud)] = struct{}{}
	}
	s.audiencesMtx.Unlock()

	var (
		stream             protos.Internal_RegisterClient
		err                error
		quit               bool
		initialRegister    = true
		initialRegisterErr error
	)

	// This might not error even if the handler returns an err - need to attempt
	// to perform a recv to verify.
	srv, err := s.serverClient.Register(s.config.ShutdownCtx, req)
	if err != nil {
		return errors.Wrap(err, "unable to complete initial registration with streamdal server")
	}

	stream = srv

	looper.Loop(func() error {
		if quit {
			time.Sleep(time.Millisecond * 100)
			return nil
		}

		// This is here to enable reconnects; no way to hit this case for a
		// "first register attempt" because "stream" won't be nil on initial launch.
		if stream == nil {
			s.config.Logger.Debug("stream is nil, attempting to register")

			if err := s.serverClient.Reconnect(); err != nil {
				s.config.Logger.Errorf("Failed to reconnect with streamdal server: %s, retrying in '%s'", err, ReconnectSleep.String())
				time.Sleep(ReconnectSleep)
				return nil
			}

			s.config.Logger.Debug("successfully reconnected to streamdal server")

			newStream, err := s.serverClient.Register(s.config.ShutdownCtx, req)
			if err != nil {
				if strings.Contains(err.Error(), context.Canceled.Error()) {
					s.config.Logger.Debug("context cancelled during connect")
					quit = true
					looper.Quit()

					return nil
				}

				s.config.Logger.Errorf("Failed to re-register with streamdal server: %s, retrying in '%s'", err, ReconnectSleep.String())
				time.Sleep(ReconnectSleep)

				return nil
			}

			s.config.Logger.Debug("successfully re-registered to streamdal server")

			stream = newStream

			// Re-announce audience (if we had any) - this is needed so that
			// streamdal server repopulates live entry in live:* prefix (which is used
			// for DetachPipeline())
			s.addAudiences(s.config.ShutdownCtx)
		}

		// Blocks until something is received
		cmd, err := stream.Recv()
		if err != nil {
			// This is the first registration attempt and it has failed.
			// Depending on IgnoreStartupError, we may need to stop the loop
			// and tell the caller that we failed to complete registration.
			if initialRegister && !s.config.IgnoreStartupError {
				initialRegisterErr = err
				quit = true
				looper.Quit()

				return nil
			}

			if err.Error() == "rpc error: code = Canceled desc = context canceled" {
				s.config.Logger.Errorf("context cancelled during recv: %s", err)
				quit = true
				looper.Quit()
				return nil
			}

			// Reset stream - cause re-register on error
			stream = nil

			// Nicer reconnect messages
			if strings.Contains(err.Error(), "reading from server: EOF") {
				s.config.Logger.Warnf("streamdal server is unavailable, retrying in %s...", ReconnectSleep.String())
			} else if strings.Contains(err.Error(), "server shutting down") {
				s.config.Logger.Warnf("streamdal server is shutting down, retrying in %s...", ReconnectSleep.String())
			} else {
				s.config.Logger.Warnf("error receiving message, retrying in %s: %s", ReconnectSleep.String(), err)
			}

			time.Sleep(ReconnectSleep)

			return nil
		}

		// Initial registration has succeeded - no longer need to bail out if we
		// encounter any errors
		initialRegister = false

		if err := s.handleCommand(stream.Context(), cmd); err != nil {
			s.config.Logger.Errorf("Failed to handle command: %s", cmd.Command)
			return nil
		}

		return nil
	})

	if initialRegister {
		return errors.Wrap(initialRegisterErr,
			"failed to complete initial registration with streamdal server (and IgnoreStartupError is set to 'false')",
		)
	}

	return nil
}

func (s *Streamdal) handleCommand(ctx context.Context, cmd *protos.Command) error {
	if cmd == nil {
		s.config.Logger.Debug("Received nil command, ignoring")
		return nil
	}

	if cmd.GetKeepAlive() != nil {
		s.config.Logger.Debug("Received keep alive")
		return nil
	}

	if cmd.Audience != nil && cmd.Audience.ServiceName != s.config.ServiceName {
		s.config.Logger.Debugf("Received command for different service name: %s, ignoring command", cmd.Audience.ServiceName)
		return nil
	}

	var err error

	switch cmd.Command.(type) {
	case *protos.Command_Kv:
		s.config.Logger.Debug("Received kv command")
		err = s.handleKVCommand(ctx, cmd.GetKv())
	case *protos.Command_AttachPipeline:
		s.config.Logger.Debug("Received attach pipeline command")
		err = s.attachPipeline(ctx, cmd)
	case *protos.Command_DetachPipeline:
		s.config.Logger.Debug("Received detach pipeline command")
		err = s.detachPipeline(ctx, cmd)
	case *protos.Command_PausePipeline:
		s.config.Logger.Debug("Received pause pipeline command")
		err = s.pausePipeline(ctx, cmd)
	case *protos.Command_ResumePipeline:
		s.config.Logger.Debug("Received resume pipeline command")
		err = s.resumePipeline(ctx, cmd)
	case *protos.Command_Tail:
		s.config.Logger.Debug("Received tail command")
		err = s.handleTailCommand(ctx, cmd)
	default:
		err = fmt.Errorf("unknown command type: %+v", cmd.Command)
	}

	return err
}

func (s *Streamdal) handleTailCommand(_ context.Context, cmd *protos.Command) error {
	tail := cmd.GetTail()

	if tail == nil {
		s.config.Logger.Errorf("Received tail command with nil tail; full cmd: %+v", cmd)
		return nil
	}

	if tail.GetRequest() == nil {
		s.config.Logger.Errorf("Received tail command with nil Request; full cmd: %+v", cmd)
		return nil
	}

	audStr := audToStr(tail.GetRequest().Audience)

	var err error

	switch tail.GetRequest().Type {
	case protos.TailRequestType_TAIL_REQUEST_TYPE_START:
		s.config.Logger.Debugf("Received start tail command for audience '%s'", audStr)
		err = s.startTailHandler(context.Background(), cmd)
	case protos.TailRequestType_TAIL_REQUEST_TYPE_STOP:
		s.config.Logger.Debugf("Received stop tail command for audience '%s'", audStr)
		err = s.stopTailHandler(context.Background(), cmd)
	case protos.TailRequestType_TAIL_REQUEST_TYPE_PAUSE:
		s.config.Logger.Debugf("Received pause tail command for audience '%s'", audStr)
		err = s.pauseTailHandler(context.Background(), cmd)
	case protos.TailRequestType_TAIL_REQUEST_TYPE_RESUME:
		s.config.Logger.Debugf("Received resume tail command for audience '%s'", audStr)
		err = s.resumeTailHandler(context.Background(), cmd)
	default:
		return fmt.Errorf("unknown tail command type: %s", tail.GetRequest().Type)
	}

	return err
}

func (s *Streamdal) handleKVCommand(_ context.Context, kv *protos.KVCommand) error {
	if err := validate.KVCommand(kv); err != nil {
		return errors.Wrap(err, "failed to validate kv command")
	}

	for _, i := range kv.Instructions {
		if err := validate.KVInstruction(i); err != nil {
			s.config.Logger.Debugf("KV instruction '%s' failed validate: %s (skipping)", i.Action, err)
			continue
		}

		switch i.Action {
		case shared.KVAction_KV_ACTION_CREATE, shared.KVAction_KV_ACTION_UPDATE:
			s.config.Logger.Debugf("attempting to perform '%s' KV instruction for key '%s'", i.Action, i.Object.Key)
			s.kv.Set(i.Object.Key, string(i.Object.Value))
		case shared.KVAction_KV_ACTION_DELETE:
			s.config.Logger.Debugf("attempting to perform '%s' KV instruction for key '%s'", i.Action, i.Object.Key)
			s.kv.Delete(i.Object.Key)
		case shared.KVAction_KV_ACTION_DELETE_ALL:
			s.config.Logger.Debugf("attempting to perform '%s' KV instruction", i.Action)
			s.kv.Purge()
		default:
			s.config.Logger.Debugf("invalid KV action '%s' - skipping", i.Action)
			continue
		}
	}

	return nil
}

func (s *Streamdal) attachPipeline(_ context.Context, cmd *protos.Command) error {
	if cmd == nil {
		return ErrEmptyCommand
	}

	s.pipelinesMtx.Lock()
	defer s.pipelinesMtx.Unlock()

	// If first time seeing audience, create pipeline (command) slice
	if _, ok := s.pipelines[audToStr(cmd.Audience)]; !ok {
		s.pipelines[audToStr(cmd.Audience)] = make([]*protos.Command, 0)
	}

	// Only append pipeline if it doesn't already exist
	pipelineIndex := getPipelineIndex(s.pipelines[audToStr(cmd.Audience)], cmd.GetAttachPipeline().Pipeline.Id)

	// Debugging indexes
	//s.config.Logger.Warnf("pipelineIndex is %d for pipeline ID %s\n", pipelineIndex, cmd.GetAttachPipeline().Pipeline.Id)
	//s.config.Logger.Warnf("known pipeline length: %d", len(s.pipelines[audToStr(cmd.Audience)]))
	//
	//for pIndex, p := range s.pipelines[audToStr(cmd.Audience)] {
	//	s.config.Logger.Warnf("pIndex %d for pipeline %s\n", pIndex, p.GetAttachPipeline().Pipeline.Id)
	//}

	if pipelineIndex == -1 {
		// Pipeline does not exist, append it
		s.config.Logger.Debugf("Attached new pipeline %s", cmd.GetAttachPipeline().Pipeline.Id)

		s.pipelines[audToStr(cmd.Audience)] = append(s.pipelines[audToStr(cmd.Audience)], cmd)
	} else {
		// Avoid potential panic
		if pipelineIndex > len(s.pipelines[audToStr(cmd.Audience)])-1 { // len-1 because of 0-indexing
			errMsg := fmt.Errorf("bug? invalid pipeline index: %d", pipelineIndex)
			s.config.Logger.Error(errMsg)
			return errors.New(errMsg.Error())
		}

		// Pipeline already exists, update it
		s.config.Logger.Debugf("Updated attached pipeline %s (index %d)", cmd.GetAttachPipeline().Pipeline.Id, pipelineIndex)

		s.pipelines[audToStr(cmd.Audience)][pipelineIndex] = cmd
	}

	return nil
}

// Looks for pipelineID in pipeline slice and returns index if found, -1 otherwise
func getPipelineIndex(pipelines []*protos.Command, pipelineID string) int {
	for i, p := range pipelines {
		if p.GetAttachPipeline().Pipeline.Id == pipelineID {
			return i
		}
	}

	return -1
}

func (s *Streamdal) detachPipeline(_ context.Context, cmd *protos.Command) error {
	if cmd == nil {
		return ErrEmptyCommand
	}

	s.pipelinesMtx.Lock()
	defer s.pipelinesMtx.Unlock()

	audStr := audToStr(cmd.Audience)

	if _, ok := s.pipelines[audStr]; !ok {
		s.config.Logger.Debugf("Attempted to detach pipeline %s, but no pipelines exist for audience %s", cmd.GetDetachPipeline().PipelineId, audStr)

		return nil
	}

	if index := getPipelineIndex(s.pipelines[audStr], cmd.GetDetachPipeline().PipelineId); index != -1 {
		s.config.Logger.Debugf("Detaching pipeline %s (index %d)", cmd.GetDetachPipeline().PipelineId, index)
		s.pipelines[audStr] = append(s.pipelines[audStr][:index], s.pipelines[audStr][index+1:]...)

		return nil
	}

	s.config.Logger.Debugf("Pipeline '%s' not attached for audience '%s' - nothing to do", cmd.GetDetachPipeline().PipelineId, audStr)

	return nil
}

// TODO: Refactor to pause/unpause
func (s *Streamdal) pausePipeline(_ context.Context, cmd *protos.Command) error {
	return s.pauseResumePipeline(nil, cmd, true)
}

func (s *Streamdal) resumePipeline(_ context.Context, cmd *protos.Command) error {
	return s.pauseResumePipeline(nil, cmd, false)
}

// Helper method that handles pause/unpause logic. Used by pausePipeline and resumePipeline
func (s *Streamdal) pauseResumePipeline(_ context.Context, cmd *protos.Command, pause bool) error {
	if cmd == nil {
		return ErrEmptyCommand
	}

	s.pipelinesMtx.Lock()
	defer s.pipelinesMtx.Unlock()
	s.pipelinesPausedMtx.Lock()
	defer s.pipelinesPausedMtx.Unlock()

	var (
		action string
		src map[string][]*protos.Command
		dst map[string][]*protos.Command
	)

	if pause {
		action = "pause"
		src = s.pipelines
		dst = s.pipelinesPaused
	} else {
		action = "resume"
		src = s.pipelinesPaused
		dst = s.pipelines
	}

	audStr := audToStr(cmd.Audience)

	if _, ok := s.pipelines[audStr]; !ok {
		return ErrPipelineNotActive
	}

	// Is this audience known?
	if _, ok := src[audStr]; !ok {
		s.config.Logger.Debugf("Attempted to %s pipeline %s for audience %s but no such audience known", action, cmd.GetPausePipeline().PipelineId, audStr)
		return ErrPipelineNotActive
	}

	// Audience is known; is pipeline known?
	srcPipelineIndex := getPipelineIndex(src[audStr], cmd.GetPausePipeline().PipelineId)

	if srcPipelineIndex == -1 {
		s.config.Logger.Debugf("Attempted to %s pipeline %s for audience %s but no such pipeline known", action, cmd.GetPausePipeline().PipelineId, audStr)
		return ErrPipelineNotActive
	}

	// Audience and pipeline exist - if dst map does not contain audience, create pipeline slice
	if _, ok := dst[audStr]; !ok {
		dst[audStr] = make([]*protos.Command, 0)
	}

	dstPipelineIndex := getPipelineIndex(s.pipelinesPaused[audStr], cmd.GetPausePipeline().PipelineId)

	if dstPipelineIndex != -1 {
		// Pipeline already paused, nothing to do
		s.config.Logger.Debugf("Attempted to %s pipeline %s for audience %s but pipeline already paused", action, cmd.GetPausePipeline().PipelineId, audStr)
		return nil
	}

	// Pipeline not in dst map, add it
	dst[audStr] = append(dst[audStr], src[audStr][srcPipelineIndex])

	// Remove pipeline from src pipelines map
	src[audStr] = append(src[audStr][:srcPipelineIndex], src[audStr][srcPipelineIndex+1:]...)

	// If src has no pipelines for this audience, remove the audience
	if len(src[audStr]) == 0 {
		s.config.Logger.Debugf("No active pipelines left for audience %s during %s, removing audience", audStr, action)
		delete(src, audStr)
	}

	s.config.Logger.Debugf("Successful %s for pipeline %s for audience %s", action, cmd.GetPausePipeline().PipelineId, audStr)

	return nil
}
