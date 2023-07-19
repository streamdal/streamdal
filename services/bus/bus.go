package bus

import (
	"context"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"
)

const (
	StreamName    = "snitch"
	StreamSubject = "events"

	BroadcastSourceMetadataKey = "broadcast_src"
)

type IBus interface {
	RunConsumer() error
	BroadcastRegistration(ctx context.Context, req *protos.RegisterRequest) error
	BroadcastCommand(ctx context.Context, cmd *protos.CommandResponse) error
	BroadcastDeregistration(req *protos.RegisterRequest) error
}

type Bus struct {
	NATS     natty.INatty
	nodeName string
	ctx      context.Context
	log      *logrus.Entry
}

func New(ctx context.Context, natsBackend natty.INatty, nodeName string) (*Bus, error) {
	if nodeName == "" {
		return nil, errors.New("node name must be provided")
	}

	if err := prepareNATS(ctx, natsBackend, nodeName); err != nil {
		return nil, errors.Wrap(err, "error creating consumer")
	}

	return &Bus{
		NATS:     natsBackend,
		nodeName: nodeName,
		ctx:      ctx,
		log:      logrus.WithField("pkg", "bus"),
	}, nil
}

func prepareNATS(ctx context.Context, natsBackend natty.INatty, nodeName string) error {
	// Won't error if stream already exists
	if err := natsBackend.CreateStream(ctx, StreamName, []string{StreamSubject}); err != nil {
		return errors.Wrap(err, "error creating stream")
	}

	// Won't error if consumer already exists
	if err := natsBackend.CreateConsumer(ctx, StreamName, nodeName, StreamSubject); err != nil {
		return errors.Wrap(err, "error creating consumer")
	}

	return nil
}

// RunConsumer is used for consuming message from the snitch NATS stream and
// executing a message handler.
func (b *Bus) RunConsumer() error {
	for {
		err := b.NATS.Consume(b.ctx, &natty.ConsumerConfig{
			Subject:      StreamSubject,
			StreamName:   StreamName,
			ConsumerName: b.nodeName,
		}, b.handler)
		if err != nil {
			if err == context.Canceled {
				b.log.Debug("context cancellation detected")
				break
			}

			b.log.WithError(err).Error("error consuming messages")
		}
	}

	b.log.Debug("msg consumer exiting")

	return nil
}

// NOTE: We should only broadcast commands! This ensures that we can always
// unmarshal to check the type of message and route it accordingly in the
// consumer handler!!!! ~DS 07.16.2023
func (b *Bus) BroadcastRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	b.log.Debugf("broadcasting registration: %v", req)
	req.XMetadata[BroadcastSourceMetadataKey] = b.nodeName

	data, err := proto.Marshal(req)
	if err != nil {
		return errors.Wrap(err, "error marshalling request")
	}

	b.NATS.Publish(ctx, StreamSubject, data)

	return nil
}

// TODO: Implement
func (b *Bus) BroadcastCommand(ctx context.Context, cmd *protos.CommandResponse) error {
	b.log.Debugf("broadcasting command: %v", cmd)
	return nil
}

// TODO: Implement
func (b *Bus) BroadcastDeregistration(req *protos.RegisterRequest) error {
	b.log.Debugf("broadcasting deregistration: %v", req)
	return nil
}

// handler is the handler that is used for deciding what to do with a message
// consumed from the snitch NATS stream. In other words, when something is
// broadcast across the snitch stream - this handler will be executed;
// *nats.Bus.Data will contain the protos.ResponseCommand payload.
// TODO: Implement
func (b *Bus) handler(ctx context.Context, msg *nats.Msg) error {
	b.log.WithField("msg", string(msg.Data)).Info("Received message")

	return nil
}
