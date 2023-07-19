package bus

import (
	"context"
	"fmt"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/util"
	"github.com/streamdal/snitch-server/validate"
)

const (
	StreamName    = "snitch_events"
	StreamSubject = "broadcast"
	FullSubject   = StreamName + "." + StreamSubject

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
	if err := natsBackend.CreateStream(ctx, StreamName, []string{FullSubject}); err != nil {
		return errors.Wrap(err, "error creating stream")
	}

	// Won't error if consumer already exists
	if err := natsBackend.CreateConsumer(ctx, StreamName, nodeName, FullSubject); err != nil {
		return errors.Wrap(err, "error creating consumer")
	}

	return nil
}

// RunConsumer is used for consuming message from the snitch NATS stream and
// executing a message handler.
func (b *Bus) RunConsumer() error {
	for {
		err := b.NATS.Consume(b.ctx, &natty.ConsumerConfig{
			Subject:      FullSubject,
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

	// Generate a bus event
	busMessage := &protos.BusEvent{
		RequestId: util.GenerateUUID(),
		Source:    b.nodeName,
		Event:     &protos.BusEvent_RegisterRequest{RegisterRequest: req},
		XMetadata: nil, // original metadata is inside the register request
	}

	data, err := proto.Marshal(busMessage)
	if err != nil {
		return errors.Wrap(err, "error marshaling bus message")
	}

	b.NATS.Publish(ctx, FullSubject, data)

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

// handler every time a new message is received on the NATS broadcast stream.
// This method is responsible for decoding the message and executing the
// appropriate msg handler.
func (b *Bus) handler(ctx context.Context, msg *nats.Msg) error {
	llog := b.log.WithField("method", "handler")
	llog.Debug("received message")

	if err := msg.AckSync(); err != nil {
		llog.Errorf("unable to ack message: %s", err)
	}

	busEvent := &protos.BusEvent{}

	if err := proto.Unmarshal(msg.Data, busEvent); err != nil {
		return errors.Wrap(err, "error unmarshalling bus event")
	}

	if err := validate.BusEvent(busEvent); err != nil {
		return errors.Wrap(err, "validation error")
	}

	llog = llog.WithFields(logrus.Fields{
		"request_id": busEvent.RequestId,
		"source":     busEvent.Source,
	})

	var err error

	switch t := busEvent.Event.(type) {
	case *protos.BusEvent_RegisterRequest:
		err = b.handleRegisterRequestBusEvent(ctx, busEvent.GetRegisterRequest())
	case *protos.BusEvent_CommandResponse:
		err = b.handleCommandResponseBusEvent(ctx, busEvent.GetCommandResponse())
	default:
		return fmt.Errorf("unable to handle bus event: unknown event type '%v'", t)
	}

	if err != nil {
		return errors.Wrap(err, "error handling bus event")
	}

	return nil
}

// TODO: Implement
func (b *Bus) handleRegisterRequestBusEvent(ctx context.Context, req *protos.RegisterRequest) error {
	b.log.Debugf("handling register request bus event: %v", req)
	if err := validate.RegisterRequest(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}

// TODO: Implement
func (b *Bus) handleCommandResponseBusEvent(ctx context.Context, req *protos.CommandResponse) error {
	b.log.Debugf("handling comand response bus event: %v", req)

	if err := validate.CommandResponse(req); err != nil {
		return errors.Wrap(err, "validation error")
	}

	return nil
}
