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

	"github.com/streamdal/snitch-server/services/store"
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
	BroadcastDeregistration(ctx context.Context, req *protos.DeregisterRequest) error
}

type Bus struct {
	options *Options
	log     *logrus.Entry
}

type Options struct {
	Store       store.IStore
	NATS        natty.INatty
	NodeName    string
	ShutdownCtx context.Context
}

func New(opts *Options) (*Bus, error) {
	if err := opts.validate(); err != nil {
		return nil, errors.Wrap(err, "error validating params")
	}

	if err := prepareNATS(opts); err != nil {
		return nil, errors.Wrap(err, "error creating consumer")
	}

	return &Bus{
		options: opts,
		log:     logrus.WithField("pkg", "bus"),
	}, nil
}

func prepareNATS(opts *Options) error {
	// Won't error if stream already exists
	if err := opts.NATS.CreateStream(opts.ShutdownCtx, StreamName, []string{FullSubject}); err != nil {
		return errors.Wrap(err, "error creating stream")
	}

	// Won't error if consumer already exists
	if err := opts.NATS.CreateConsumer(opts.ShutdownCtx, StreamName, opts.NodeName, FullSubject); err != nil {
		return errors.Wrap(err, "error creating consumer")
	}

	return nil
}

func (o *Options) validate() error {
	if o.ShutdownCtx == nil {
		return errors.New("context must be provided")
	}

	if o.NodeName == "" {
		return errors.New("node name must be provided")
	}

	if o.NATS == nil {
		return errors.New("nats backend must be provided")
	}

	if o.Store == nil {
		return errors.New("store service must be provided")
	}

	return nil
}

// RunConsumer is used for consuming message from the snitch NATS stream and
// executing a message handler.
func (b *Bus) RunConsumer() error {
	fmt.Printf("options: %+v\n", b.options)

	for {
		err := b.options.NATS.Consume(b.options.ShutdownCtx, &natty.ConsumerConfig{
			Subject:      FullSubject,
			StreamName:   StreamName,
			ConsumerName: b.options.NodeName,
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

// handler every time a new message is received on the NATS broadcast stream.
// This method is responsible for decoding the message and executing the
// appropriate msg handler.
func (b *Bus) handler(shutdownCtx context.Context, msg *nats.Msg) error {
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
		err = b.handleRegisterRequestBusEvent(shutdownCtx, busEvent.GetRegisterRequest())
	case *protos.BusEvent_CommandResponse:
		err = b.handleCommandResponseBusEvent(shutdownCtx, busEvent.GetCommandResponse())
	default:
		return fmt.Errorf("unable to handle bus event: unknown event type '%v'", t)
	}

	if err != nil {
		return errors.Wrap(err, "error handling bus event")
	}

	return nil
}
