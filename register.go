package snitch

import (
	"context"
	"errors"
	"io"
	"runtime"
	"time"

	"github.com/relistan/go-director"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

func (s *Snitch) register(looper director.Looper) {
	req := &protos.RegisterRequest{
		ServiceName: s.ServiceName,
		SessionId:   s.sessionID,
		ClientInfo: &protos.ClientInfo{
			ClientType:     protos.ClientType(s.ClientType),
			LibraryName:    "snitch-go-client",
			LibraryVersion: "0.0.1", // TODO: inject via build tag
			Language:       "go",
			Arch:           runtime.GOARCH,
			Os:             runtime.GOOS,
		},
		Audiences: nil, // TODO
		DryRun:    s.DryRun,
	}

	var stream protos.Internal_RegisterClient
	var err error
	var quit bool

	srv, err := s.ServerClient.Register(context.Background(), req)
	if err != nil {
		panic("Failed to register with snitch server: " + err.Error())
	}

	looper.Loop(func() error {
		if quit {
			time.Sleep(time.Millisecond * 100)
			return nil
		}

		if stream == nil {
			newStream, err := s.ServerClient.Register(context.Background(), req)
			if err != nil {
				if errors.Is(err, context.Canceled) {
					s.Logger.Debug("context cancelled during connect")
					quit = true
					looper.Quit()
					return nil
				}
			}

			stream = newStream
		}

		// Blocks until something is received
		cmd, err := srv.Recv()
		if err != nil {
			if err.Error() == "rpc error: code = Canceled desc = context canceled" {
				s.Logger.Errorf("context cancelled during recv: %s", err)
				quit = true
				looper.Quit()
				return nil
			}

			if errors.Is(err, io.EOF) {
				// Nicer reconnect messages
				s.Logger.Warnf("dProxy server is unavailable, retrying in %s...", ReconnectSleep.String())
				time.Sleep(ReconnectSleep)
				return nil
			} else {
				s.Logger.Warnf("Error receiving message, retrying in %s: %s", ReconnectSleep.String(), err)
			}

			return nil

		}

		if cmd.GetKeepAlive() != nil {
			s.Logger.Debug("Received keep alive")
			return nil
		}

		if cmd.Audience.ServiceName != s.ServiceName {
			s.Logger.Debugf("Received command for different service name: %s, ignoring command", cmd.Audience.ServiceName)
			return nil
		}

		if attach := cmd.GetAttachPipeline(); attach != nil {
			if err := s.attachPipeline(context.Background(), cmd); err != nil {
				s.Logger.Errorf("Failed to attach pipeline: %s", err)
				return nil
			}
		} else if detach := cmd.GetDetachPipeline(); detach != nil {
			if err := s.detachPipeline(context.Background(), cmd); err != nil {
				s.Logger.Errorf("Failed to detach pipeline: %s", err)
				return nil
			}
		} else if pause := cmd.GetPausePipeline(); pause != nil {
			if err := s.pausePipeline(context.Background(), cmd); err != nil {
				s.Logger.Errorf("Failed to pause pipeline: %s", err)
				return nil
			}
		} else if resume := cmd.GetResumePipeline(); resume != nil {
			if err := s.resumePipeline(context.Background(), cmd); err != nil {
				s.Logger.Errorf("Failed to resume pipeline: %s", err)
				return nil
			}
		}

		return nil
	})
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

	s.Logger.Debugf("Attached pipeline %s", cmd.GetAttachPipeline().Pipeline.Id)

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

	s.Logger.Debugf("Detached pipeline %s", cmd.GetDetachPipeline().PipelineId)

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

	return nil
}
