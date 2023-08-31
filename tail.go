package snitch

import (
	"context"
	"fmt"

	"github.com/pkg/errors"

	"github.com/streamdal/snitch-go-client/validation"
	"github.com/streamdal/snitch-protos/build/go/protos"
)

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

	s.setTailing(cmd.Audience, cmd.GetTail().Request.PipelineId, cmd.GetTail().Request)

	return nil
}

func (s *Snitch) getTail(aud *protos.Audience, pipelineID string) *protos.TailRequest {
	s.tailsMtx.RLock()
	defer s.tailsMtx.RUnlock()

	req, ok := s.tails[tailKey(aud, pipelineID)]
	if ok {
		return req
	}

	return nil
}

func (s *Snitch) setTailing(aud *protos.Audience, pipelineID string, req *protos.TailRequest) {
	s.tailsMtx.Lock()
	defer s.tailsMtx.Unlock()

	s.tails[tailKey(aud, pipelineID)] = req
}

func tailKey(aud *protos.Audience, pipelineID string) string {
	return fmt.Sprintf("%s-%s", audToStr(aud), pipelineID)
}
