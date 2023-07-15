package messaging

import (
	"context"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"
)

const (
	StreamName    = "snitch"
	StreamSubject = "events"
)

type Msg struct {
	NATS natty.INatty
	ctx  context.Context
	log  *logrus.Entry
}

func New(ctx context.Context, natsBackend natty.INatty) (*Msg, error) {
	if err := prepareNATS(ctx, natsBackend); err != nil {
		return nil, errors.Wrap(err, "error creating consumer")
	}

	return &Msg{
		NATS: natsBackend,
		ctx:  ctx,
		log:  logrus.WithField("pkg", "messaging"),
	}, nil
}

// TODO: Figure out node name -- needed for consumer bits
func prepareNATS(ctx context.Context, natsBackend natty.INatty) error {
	// Won't error if stream already exists
	if err := natsBackend.CreateStream(ctx, StreamName, []string{StreamSubject}); err != nil {
		return errors.Wrap(err, "error creating stream")
	}

	// Won't error if consumer already exists
	if err := natsBackend.CreateConsumer(ctx, StreamName, "foo", StreamSubject); err != nil {
		return errors.Wrap(err, "error creating consumer")
	}

	return nil
}

func (m *Msg) Run() error {
	for {
		err := m.NATS.Consume(m.ctx, &natty.ConsumerConfig{
			Subject:      StreamSubject,
			StreamName:   StreamName,
			ConsumerName: "foo", // TODO: generate a unique consumer name
		}, m.handler)
		if err != nil {
			if err == context.Canceled {
				m.log.Debug("context cancellation detected")
				break
			}

			m.log.WithError(err).Error("error consuming messages")
		}
	}

	m.log.Debug("msg consumer exiting")

	return nil
}

func (m *Msg) handler(ctx context.Context, msg *nats.Msg) error {
	m.log.WithField("msg", string(msg.Data)).Info("Received message")
	return nil
}
