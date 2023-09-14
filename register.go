package snitch

import (
	"context"
	"fmt"
	"runtime"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/relistan/go-director"
	"github.com/streamdal/snitch-protos/build/go/protos/shared"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-go-client/validate"
)

func (s *Snitch) register(looper director.Looper) error {
	req := &protos.RegisterRequest{
		ServiceName: s.config.ServiceName,
		SessionId:   s.sessionID,
		ClientInfo: &protos.ClientInfo{
			ClientType:     protos.ClientType(s.config.ClientType),
			LibraryName:    "snitch-go-client",
			LibraryVersion: "0.0.40",
			Language:       "go",
			Arch:           runtime.GOARCH,
			Os:             runtime.GOOS,
		},
		Audiences: make([]*protos.Audience, 0),
		DryRun:    s.config.DryRun,
	}

	for _, aud := range s.config.Audiences {
		req.Audiences = append(req.Audiences, aud.ToProto())
	}

	var stream protos.Internal_RegisterClient
	var err error
	var quit bool

	srv, err := s.serverClient.Register(s.config.ShutdownCtx, req)
	if err != nil && !strings.Contains(err.Error(), context.Canceled.Error()) {
		return errors.Wrap(err, "unable to complete initial registration with snitch server")
	}

	stream = srv

	looper.Loop(func() error {
		if quit {
			time.Sleep(time.Millisecond * 100)
			return nil
		}

		if stream == nil {
			s.config.Logger.Debug("stream is nil, attempting to register")

			newStream, err := s.serverClient.Register(s.config.ShutdownCtx, req)
			if err != nil {
				if strings.Contains(err.Error(), context.Canceled.Error()) {
					s.config.Logger.Debug("context cancelled during connect")
					quit = true
					looper.Quit()
					return nil
				}

				s.config.Logger.Errorf("Failed to reconnect with snitch server: %s, retrying in '%s'", err, ReconnectSleep.String())
				time.Sleep(ReconnectSleep)

				return nil
			}

			s.config.Logger.Debug("successfully reconnected to snitch-server")

			stream = newStream

			// Re-announce audience (if we had any) - this is needed so that
			// snitch-server repopulates live entry in snitch_live (which is used
			// for DetachPipeline())
			s.addAudiences(s.config.ShutdownCtx)
		}

		// Blocks until something is received
		cmd, err := stream.Recv()
		if err != nil {
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
				s.config.Logger.Warnf("snitch server is unavailable, retrying in %s...", ReconnectSleep.String())
			} else if strings.Contains(err.Error(), "server shutting down") {
				s.config.Logger.Warnf("snitch server is shutting down, retrying in %s...", ReconnectSleep.String())
			} else {
				s.config.Logger.Warnf("error receiving message, retrying in %s: %s", ReconnectSleep.String(), err)
			}

			time.Sleep(ReconnectSleep)

			return nil
		}

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

		// Reset error just in case
		err = nil

		switch cmd.Command.(type) {
		case *protos.Command_Kv:
			s.config.Logger.Debug("Received kv command")
			err = s.handleKVCommand(context.Background(), cmd.GetKv())
		case *protos.Command_AttachPipeline:
			s.config.Logger.Debug("Received attach pipeline command")
			err = s.attachPipeline(context.Background(), cmd)
		case *protos.Command_DetachPipeline:
			s.config.Logger.Debug("Received detach pipeline command")
			err = s.detachPipeline(context.Background(), cmd)
		case *protos.Command_PausePipeline:
			s.config.Logger.Debug("Received pause pipeline command")
			err = s.pausePipeline(context.Background(), cmd)
		case *protos.Command_ResumePipeline:
			s.config.Logger.Debug("Received resume pipeline command")
			err = s.resumePipeline(context.Background(), cmd)
		case *protos.Command_Tail:
			tail := cmd.GetTail()

			if tail == nil {
				s.config.Logger.Errorf("Received tail command with nil tail; full cmd: %+v", cmd)
				return nil
			}

			if tail.GetRequest() == nil {
				s.config.Logger.Errorf("Received tail command with nil Request; full cmd: %+v", cmd)
				return nil
			}

			switch cmd.GetTail().GetRequest().Type {
			case protos.TailRequestType_TAIL_REQUEST_TYPE_START:
				s.config.Logger.Debugf("Received start tail command for pipeline '%s'", tail.GetRequest().PipelineId)
				err = s.tailPipeline(context.Background(), cmd)
			case protos.TailRequestType_TAIL_REQUEST_TYPE_STOP:
				s.config.Logger.Debugf("Received stop tail command for pipeline '%s'", tail.GetRequest().PipelineId)
				err = s.stopTailPipeline(context.Background(), cmd)
			default:
				s.config.Logger.Errorf("Unknown tail command type: %s", tail.GetRequest().Type)
				return nil
			}
		default:
			err = fmt.Errorf("unknown command type: %+v", cmd.Command)
		}

		if err != nil {
			s.config.Logger.Errorf("Failed to handle command: %s", cmd.Command)
			return nil
		}

		return nil
	})

	return nil
}

func (s *Snitch) handleKVCommand(_ context.Context, kv *protos.KVCommand) error {
	if err := validate.KVCommand(kv); err != nil {
		return errors.Wrap(err, "failed to validate kv command")
	}

	for _, i := range kv.Instructions {
		if err := validate.KVInstruction(i); err != nil {
			s.config.Logger.Debugf("KV instruction '%s' failed validate: %s (skipping)", i.Action, err)
			continue
		}

		s.config.Logger.Debugf("attempting to perform '%s' KV instruction for key '%s'", i.Action, i.Object.Key)

		switch i.Action {
		case shared.KVAction_KV_ACTION_CREATE, shared.KVAction_KV_ACTION_UPDATE:
			s.kv.Set(i.Object.Key, string(i.Object.Value))
		case shared.KVAction_KV_ACTION_DELETE:
			s.kv.Delete(i.Object.Key)
		case shared.KVAction_KV_ACTION_DELETE_ALL:
			s.kv.Purge()
		default:
			s.config.Logger.Debugf("invalid KV action '%s' - skipping", i.Action)
			continue
		}
	}

	return nil
}

func (s *Snitch) attachPipeline(_ context.Context, cmd *protos.Command) error {
	if cmd == nil {
		return ErrEmptyCommand
	}

	s.pipelinesMtx.Lock()
	defer s.pipelinesMtx.Unlock()

	if _, ok := s.pipelines[audToStr(cmd.Audience)]; !ok {
		s.pipelines[audToStr(cmd.Audience)] = make(map[string]*protos.Command)
	}

	s.pipelines[audToStr(cmd.Audience)][cmd.GetAttachPipeline().Pipeline.Id] = cmd

	s.config.Logger.Debugf("Attached pipeline %s", cmd.GetAttachPipeline().Pipeline.Id)

	return nil
}

func (s *Snitch) detachPipeline(_ context.Context, cmd *protos.Command) error {
	if cmd == nil {
		return ErrEmptyCommand
	}

	s.pipelinesMtx.Lock()
	defer s.pipelinesMtx.Unlock()

	if _, ok := s.pipelines[audToStr(cmd.Audience)]; !ok {
		return nil
	}

	delete(s.pipelines[audToStr(cmd.Audience)], cmd.GetDetachPipeline().PipelineId)

	s.config.Logger.Debugf("Detached pipeline %s", cmd.GetDetachPipeline().PipelineId)

	return nil
}

func (s *Snitch) pausePipeline(_ context.Context, cmd *protos.Command) error {
	if cmd == nil {
		return ErrEmptyCommand
	}

	s.pipelinesMtx.Lock()
	defer s.pipelinesMtx.Unlock()
	s.pipelinesPausedMtx.Lock()
	defer s.pipelinesPausedMtx.Unlock()

	if _, ok := s.pipelines[audToStr(cmd.Audience)]; !ok {
		return errors.New("pipeline not active or does not exist")
	}

	pipeline, ok := s.pipelines[audToStr(cmd.Audience)][cmd.GetPausePipeline().PipelineId]
	if !ok {
		return errors.New("pipeline not active or does not exist")
	}

	if _, ok := s.pipelinesPaused[audToStr(cmd.Audience)]; !ok {
		s.pipelinesPaused[audToStr(cmd.Audience)] = make(map[string]*protos.Command)
	}

	s.pipelinesPaused[audToStr(cmd.Audience)][cmd.GetPausePipeline().PipelineId] = pipeline

	delete(s.pipelines[audToStr(cmd.Audience)], cmd.GetPausePipeline().PipelineId)

	return nil
}

func (s *Snitch) resumePipeline(_ context.Context, cmd *protos.Command) error {
	if cmd == nil {
		return ErrEmptyCommand
	}

	s.pipelinesMtx.Lock()
	defer s.pipelinesMtx.Unlock()
	s.pipelinesPausedMtx.Lock()
	defer s.pipelinesPausedMtx.Unlock()

	if _, ok := s.pipelinesPaused[audToStr(cmd.Audience)]; !ok {
		return errors.New("pipeline not paused")
	}

	pipeline, ok := s.pipelinesPaused[audToStr(cmd.Audience)][cmd.GetResumePipeline().PipelineId]
	if !ok {
		return errors.New("pipeline not paused")
	}

	if _, ok := s.pipelines[audToStr(cmd.Audience)]; !ok {
		s.pipelines[audToStr(cmd.Audience)] = make(map[string]*protos.Command)
	}

	s.pipelines[audToStr(cmd.Audience)][cmd.GetResumePipeline().PipelineId] = pipeline

	delete(s.pipelinesPaused[audToStr(cmd.Audience)], cmd.GetResumePipeline().PipelineId)

	return nil
}
