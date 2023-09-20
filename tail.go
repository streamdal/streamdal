package snitch

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/relistan/go-director"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-go-client/logger"
	"github.com/streamdal/snitch-go-client/metrics"
	"github.com/streamdal/snitch-go-client/server"
	"github.com/streamdal/snitch-go-client/types"
	"github.com/streamdal/snitch-go-client/validate"
)

const (
	// NumTailWorkers is the number of tail workers to start for each tail request
	// The workers are responsible for reading from the tail channel and streaming
	// TailResponse messages to the snitch server
	NumTailWorkers = 2

	// MinTailResponseIntervalMS is how often we send a TailResponse to the snitch server
	// If this rate is exceeded, we will drop messages rather than flooding the server
	// This is an int to avoid a .Milliseconds() call
	MinTailResponseIntervalMS = 10
)

type Tail struct {
	Request    *protos.Command
	CancelFunc context.CancelFunc

	outboundCh   chan *protos.TailResponse
	snitchServer server.IServerClient
	metrics      metrics.IMetrics
	cancelCtx    context.Context
	lastMsg      time.Time
	log          logger.Logger
}

func (s *Snitch) sendTail(aud *protos.Audience, pipelineID string, originalData []byte, postPipelineData []byte) {
	tails := s.getTail(aud, pipelineID)
	if len(tails) == 0 {
		return
	}

	for _, tail := range tails {
		tr := &protos.TailResponse{
			Type:          protos.TailResponseType_TAIL_RESPONSE_TYPE_PAYLOAD,
			TailRequestId: tail.Request.GetTail().Request.Id,
			Audience:      aud,
			PipelineId:    pipelineID,
			SessionId:     s.sessionID,
			TimestampNs:   time.Now().UTC().UnixNano(),
			OriginalData:  originalData,
			NewData:       postPipelineData,
		}

		tail.ShipResponse(tr)
	}
}

func (t *Tail) ShipResponse(tr *protos.TailResponse) {
	// If we're sending too fast, drop the message
	if time.Since(t.lastMsg).Milliseconds() < MinTailResponseIntervalMS {
		_ = t.metrics.Incr(context.Background(), &types.CounterEntry{
			Name:   types.DroppedTailMessages,
			Labels: map[string]string{},
			Value:  1})

		t.log.Warnf("Dropping tail response for %s, too fast", tr.PipelineId)
		return
	}

	t.outboundCh <- tr
	t.lastMsg = time.Now()
}

func (t *Tail) startWorkers() error {
	for i := 0; i < NumTailWorkers; i++ {
		// Start SDK -> Server streaming gRPC connection
		stream, err := t.snitchServer.GetTailStream(t.cancelCtx)
		if err != nil {
			return errors.Wrap(err, "error starting tail worker")
		}

		looper := director.NewFreeLooper(director.FOREVER, make(chan error, 1))

		go t.startWorker(looper, stream)
	}

	return nil
}

func (t *Tail) startWorker(looper director.Looper, stream protos.Internal_SendTailClient) {
	if stream == nil {
		t.log.Error("stream is nil, unable to start tail worker")
		return
	}

	// Always cancel the context regardless of how we exit so
	// that getTail() can remove the tail from the map
	defer t.CancelFunc()

	var quit bool

	looper.Loop(func() error {
		if quit {
			time.Sleep(time.Millisecond * 50)
			return nil
		}

		select {
		case <-t.cancelCtx.Done():
			t.log.Debug("tail worker cancelled")
			quit = true
			looper.Quit()
			return nil
		case <-stream.Context().Done():
			t.log.Debug("tail worker context terminated")
			quit = true
			looper.Quit()
			return nil
		case resp := <-t.outboundCh:
			if err := stream.Send(resp); err != nil {
				if strings.Contains(err.Error(), io.EOF.Error()) {
					t.log.Debug("tail worker received EOF, exiting")
					return nil
				}
				if strings.Contains(err.Error(), "connection refused") {
					// Snitch server went away, log, sleep, and wait for reconnect
					t.log.Warn("failed to send tail response, snitch server went away, waiting for reconnect")
					time.Sleep(ReconnectSleep)
					return nil
				}
				t.log.Errorf("error sending tail: %s", err)
			}
		}
		return nil
	})
}

func (s *Snitch) tailPipeline(_ context.Context, cmd *protos.Command) error {
	if err := validate.TailRequestStartCommand(cmd); err != nil {
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
		Request:      cmd,
		outboundCh:   make(chan *protos.TailResponse, 100),
		cancelCtx:    ctx,
		CancelFunc:   cancel,
		snitchServer: s.serverClient,
		metrics:      s.metrics,
		log:          s.config.Logger,
		lastMsg:      time.Now(),
	}

	if err := t.startWorkers(); err != nil {
		return errors.Wrap(err, "unable to tail pipeline")
	}

	s.setTailing(t)

	return nil
}

func (s *Snitch) stopTailPipeline(_ context.Context, cmd *protos.Command) error {
	if err := validate.TailRequestStopCommand(cmd); err != nil {
		return errors.Wrap(err, "invalid tail request stop command")
	}

	aud := cmd.GetTail().Request.Audience
	pipelineID := cmd.GetTail().Request.PipelineId
	tailID := cmd.GetTail().Request.Id

	tails := s.getTail(aud, pipelineID)
	if len(tails) == 0 {
		s.config.Logger.Debugf("Received stop tail command for unknown tail: %s", tailID)
		return nil
	}

	tail, ok := tails[tailID]
	if !ok {
		s.config.Logger.Debugf("Received stop tail command for unknown tail: %s", tailID)
		return nil
	}

	// Cancel workers
	tail.CancelFunc()

	s.removeTail(aud, pipelineID, tailID)

	return nil
}

func (s *Snitch) getTail(aud *protos.Audience, pipelineID string) map[string]*Tail {
	s.tailsMtx.RLock()
	tails, ok := s.tails[tailKey(aud, pipelineID)]
	s.tailsMtx.RUnlock()

	if ok {
		// We don't know when a tail is cancelled so we need to check the context
		//if tail.cancelCtx.Err() == context.Canceled {
		//	s.removeTail(id)
		//	return nil
		//}

		return tails
	}

	return nil
}
func (s *Snitch) removeTail(aud *protos.Audience, pipelineID, tailID string) {
	s.tailsMtx.Lock()
	defer s.tailsMtx.Unlock()

	if _, ok := s.tails[tailKey(aud, pipelineID)]; !ok {
		return
	}

	delete(s.tails[tailKey(aud, pipelineID)], tailID)

	if len(s.tails[tailKey(aud, pipelineID)]) == 0 {
		delete(s.tails, tailKey(aud, pipelineID))
	}
}

func (s *Snitch) setTailing(tail *Tail) {
	s.tailsMtx.Lock()
	defer s.tailsMtx.Unlock()

	tr := tail.Request.GetTail().Request

	if _, ok := s.tails[tailKey(tr.Audience, tr.PipelineId)]; !ok {
		s.tails[tailKey(tr.Audience, tr.PipelineId)] = make(map[string]*Tail)
	}

	s.tails[tailKey(tr.Audience, tr.PipelineId)][tr.Id] = tail
}

func tailKey(aud *protos.Audience, pipelineID string) string {
	return fmt.Sprintf("%s-%s", audToStr(aud), pipelineID)
}
