package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/util"
)

func (b *Bus) BroadcastRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	b.log.Debugf("broadcasting registration: %v", req)

	// Generate bus event
	busMessage := &protos.BusEvent{
		RequestId: util.GenerateUUID(),
		Source:    b.options.NodeName,
		Event:     &protos.BusEvent_RegisterRequest{RegisterRequest: req},
		XMetadata: nil, // original metadata is inside the register request
	}

	data, err := proto.Marshal(busMessage)
	if err != nil {
		return errors.Wrap(err, "error marshaling bus message")
	}

	b.options.NATS.Publish(ctx, FullSubject, data)

	return nil
}

// TODO: Implement
func (b *Bus) BroadcastCommand(ctx context.Context, cmd *protos.CommandResponse) error {
	b.log.Debugf("broadcasting command: %v", cmd)
	return nil
}

func (b *Bus) BroadcastDeregistration(ctx context.Context, req *protos.DeregisterRequest) error {
	b.log.Debugf("broadcasting deregistration for service '%s'", req.ServiceName)

	// Generate bus event
	busMessage := &protos.BusEvent{
		RequestId: util.GenerateUUID(),
		Source:    b.options.NodeName,
		Event:     &protos.BusEvent_DeregisterRequest{DeregisterRequest: req},
		XMetadata: nil, // original metadata is inside the register request
	}

	data, err := proto.Marshal(busMessage)
	if err != nil {
		return errors.Wrap(err, "error marshaling bus message")
	}

	b.options.NATS.Publish(ctx, FullSubject, data)

	return nil
}
