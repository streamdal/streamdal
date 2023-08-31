package snitch

import (
	"context"
	"fmt"

	"github.com/pkg/errors"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-go-client/logger"
	"github.com/streamdal/snitch-go-client/server"
	"github.com/streamdal/snitch-go-client/validation"
)

const NumTailWorkers = 2

type Tail struct {
	request      *protos.Command
	Ch           chan *protos.TailResponse
	snitchServer server.IServerClient
	cancelCtx    context.Context
	CancelFunc   context.CancelFunc
	log          logger.Logger
}

func (t *Tail) startWorkers() error {
	for i := 0; i < NumTailWorkers; i++ {
		// Start SDK -> Server streaming gRPC connection
		stream, err := t.snitchServer.GetTailStream(t.cancelCtx)
		if err != nil {
			return errors.Wrap(err, "error starting tail worker")
		}

		go t.startWorker(stream)
	}

	return nil
}

func (t *Tail) startWorker(stream protos.Internal_SendTailClient) {
	if stream == nil {
		t.log.Error("stream is nil, unable to start tail worker")
		return
	}

	for {
		select {
		case <-t.cancelCtx.Done():
			t.log.Debug("tail worker cancelled")
			return
		case resp := <-t.Ch:
			if err := stream.Send(resp); err != nil {
				t.log.Errorf("error sending tail: %s", err)
			}
		}
	}
}

func (s *Snitch) tailPipeline(_ context.Context, cmd *protos.Command) error {
	if err := validation.ValidateTailCommand(cmd); err != nil {
		return errors.Wrap(err, "invalid tail command")
	}

	// Check if we have this audience
	pipelines, ok := s.pipelines[audToStr(cmd.Audience)]
	if !ok {
		s.config.Logger.Debugf("Received tail command for unknown audience: %s", audToStr(cmd.Audience))
		return nil
	}

	// Check if we have this pipeline
	if _, ok := pipelines[cmd.GetTail().Request.PipelineId]; !ok {
		s.config.Logger.Debugf("Received tail command for unknown pipeline: %s", cmd.GetTail().Request.PipelineId)
		return nil
	}

	s.config.Logger.Debugf("Tailing audience %s", cmd.GetTail().Request.PipelineId)

	ctx, cancel := context.WithCancel(s.config.ShutdownCtx)

	// Start workers
	t := &Tail{
		request:      cmd,
		Ch:           make(chan *protos.TailResponse, 100),
		cancelCtx:    ctx,
		CancelFunc:   cancel,
		snitchServer: s.serverClient,
		log:          s.config.Logger,
	}

	if err := t.startWorkers(); err != nil {
		return errors.Wrap(err, "unable to tail pipeline")
	}

	s.setTailing(cmd.Audience, cmd.GetTail().Request.PipelineId, t)

	return nil
}

func (s *Snitch) getTail(aud *protos.Audience, pipelineID string) *Tail {
	s.tailsMtx.RLock()
	defer s.tailsMtx.RUnlock()

	tail, ok := s.tails[tailKey(aud, pipelineID)]
	if ok {
		return tail
	}

	return nil
}

func (s *Snitch) setTailing(aud *protos.Audience, pipelineID string, tail *Tail) {
	s.tailsMtx.Lock()
	defer s.tailsMtx.Unlock()

	s.tails[tailKey(aud, pipelineID)] = tail
}

func tailKey(aud *protos.Audience, pipelineID string) string {
	return fmt.Sprintf("%s-%s", audToStr(aud), pipelineID)
}
