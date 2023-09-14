package snitch

import (
	"context"
	"runtime"
	"strings"
	"time"
	"fmt"

	"github.com/pkg/errors"
	"github.com/relistan/go-director"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

func (s *Snitch) register(looper director.Looper) error {
	req := &protos.RegisterRequest{
		ServiceName: s.config.ServiceName,
		SessionId:   s.sessionID,
		ClientInfo: &protos.ClientInfo{
			ClientType:     protos.ClientType(s.config.ClientType),
			LibraryName:    "snitch-go-client",
			LibraryVersion: "0.0.37",
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

		if cmd.GetKeepAlive() != nil {
			s.config.Logger.Debug("Received keep alive")
			return nil
		}

		if cmd.Audience.ServiceName != s.config.ServiceName {
			s.config.Logger.Debugf("Received command for different service name: %s, ignoring command", cmd.Audience.ServiceName)
			return nil
		}

		if attach := cmd.GetAttachPipeline(); attach != nil {
			s.config.Logger.Debugf("Received attach pipeline command: %s", attach.Pipeline.Id)
			if err := s.attachPipeline(context.Background(), cmd); err != nil {
				s.config.Logger.Errorf("Failed to attach pipeline: %s", err)
				return nil
			}
		} else if detach := cmd.GetDetachPipeline(); detach != nil {
			s.config.Logger.Debugf("Received detach pipeline command: %s", detach.PipelineId)
			if err := s.detachPipeline(context.Background(), cmd); err != nil {
				s.config.Logger.Errorf("Failed to detach pipeline: %s", err)
				return nil
			}
		} else if pause := cmd.GetPausePipeline(); pause != nil {
			s.config.Logger.Debugf("Received pause pipeline command: %s", pause.PipelineId)
			if err := s.pausePipeline(context.Background(), cmd); err != nil {
				s.config.Logger.Errorf("Failed to pause pipeline: %s", err)
				return nil
			}
		} else if resume := cmd.GetResumePipeline(); resume != nil {
			s.config.Logger.Debugf("Received resume pipeline command: %s", resume.PipelineId)
			if err := s.resumePipeline(context.Background(), cmd); err != nil {
				s.config.Logger.Errorf("Failed to resume pipeline: %s", err)
				return nil
			}
		} else if tail := cmd.GetTail(); tail != nil {
			switch tail.GetRequest().Type {
			case protos.TailRequestType_TAIL_REQUEST_TYPE_START:
				s.config.Logger.Debugf("Received start tail command for pipeline '%s'", tail.GetRequest().PipelineId)
				if err := s.tailPipeline(context.Background(), cmd); err != nil {
					s.config.Logger.Errorf("Failed to tail pipeline: %s", err)
					return nil
				}
			case protos.TailRequestType_TAIL_REQUEST_TYPE_STOP:
				s.config.Logger.Debugf("Received stop tail command for pipeline '%s'", tail.GetRequest().PipelineId)
				if err := s.stopTailPipeline(context.Background(), cmd); err != nil {
					s.config.Logger.Errorf("Failed to stop tail pipeline: %s", err)
					return nil
				}
			default:
				s.config.Logger.Errorf("Unknown tail command type: %s", tail.GetRequest().Type)
				return nil
			}

		}

		return nil
	})

	return nil
}

// addAudiences is used for RE-adding audiences that may have timed out after
// a server reconnect. The method will re-add all known audiences to snitch-server
// via internal gRPC NewAudience() endpoint. This is a non-blocking method.
func (s *Snitch) addAudiences(ctx context.Context) {
	fmt.Println("re-adding audiences!!!")

	s.audiencesMtx.RLock()
	defer s.audiencesMtx.RUnlock()

	for audStr, _ := range s.audiences {
		 aud := strToAud(audStr)

		 if aud == nil {
			 s.config.Logger.Errorf("unexpected strToAud resulted in nil audience (audStr: %s)", audStr)
			 continue
		 }

		// Run as goroutine to avoid blocking processing
		go func() {
			if err := s.serverClient.NewAudience(ctx, aud, s.sessionID); err != nil {
				s.config.Logger.Errorf("failed to add audience: %s", err)
			}
		}()
	}
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
