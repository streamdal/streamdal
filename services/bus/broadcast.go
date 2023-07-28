package bus

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/util"
)

func (b *Bus) BroadcastRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	return b.broadcast(ctx, "register", &protos.BusEvent{Event: &protos.BusEvent_RegisterRequest{RegisterRequest: req}})
}

func (b *Bus) BroadcastCommand(ctx context.Context, req *protos.Command) error {
	return b.broadcast(ctx, "command", &protos.BusEvent{Event: &protos.BusEvent_Command{Command: req}})
}

func (b *Bus) BroadcastHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error {
	return b.broadcast(ctx, "heartbeat", &protos.BusEvent{Event: &protos.BusEvent_HeartbeatRequest{HeartbeatRequest: req}})
}

func (b *Bus) BroadcastDeregistration(ctx context.Context, req *protos.DeregisterRequest) error {
	return b.broadcast(ctx, "deregistration", &protos.BusEvent{Event: &protos.BusEvent_DeregisterRequest{DeregisterRequest: req}})
}

func (b *Bus) broadcast(ctx context.Context, eventType string, event *protos.BusEvent) error {
	// Need to translate metadata from ctx -> metadata in event

	event.XMetadata = util.CtxMetadata(ctx)
	event.Source = b.options.NodeName

	b.log.Debugf("broadcasting event '%v' metadata: '%+v", eventType, event.XMetadata)

	data, err := proto.Marshal(event)
	if err != nil {
		return errors.Wrap(err, "error marshaling bus message")
	}

	b.options.NATS.Publish(ctx, FullSubject, data)

	return nil
}
