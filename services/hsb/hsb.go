// HSBService pkg is responsible for working with inbound messages.
//
// The collectorHandler listens for inbound messages and writes them to the
// HSBChan; the inbound service publishers listen for the messages and in
// turn publish them to HSB. At that point, writers pick up the message(s) and
// write them to long term storage.
//

package hsb

import (
	"context"
	"fmt"

	"github.com/batchcorp/schemas/build/go/events"
	"github.com/golang/protobuf/proto"
	"github.com/pkg/errors"
	"github.com/relistan/go-director"
	"github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	"github.com/batchcorp/go-template/backends/kafka"
)

const (
	DefaultNumPublishers = 10
)

type IHSB interface {
	StartPublishers() error
	Run(id string)
}

type HSB struct {
	*Config

	log *logrus.Entry
}

type Config struct {
	Kafka         kafka.IKafka
	Context       context.Context
	HSBChan       chan *events.Manifest
	Looper        *director.FreeLooper
	NumPublishers int
}

func New(cfg *Config) (*HSB, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, fmt.Errorf("unable to validate input cfg: %s", err)
	}

	// Set defaults
	if cfg.Context == nil {
		cfg.Context = context.Background()
	}

	if cfg.NumPublishers == 0 {
		cfg.NumPublishers = DefaultNumPublishers
	}

	if cfg.Looper == nil {
		cfg.Looper = director.NewFreeLooper(director.FOREVER, make(chan error, 1))
	}

	// Create, and return the worker.
	return &HSB{
		Config: cfg,
		log:    logrus.WithField("pkg", "hsb"),
	}, nil
}

func validateConfig(cfg *Config) error {
	if cfg.HSBChan == nil {
		return errors.New("HSBChan cannot be nil")
	}

	if cfg.Kafka == nil {
		return errors.New("Kafka cannot be nil")
	}

	return nil
}

func (h *HSB) StartPublishers() error {
	h.log.Debugf("Launching '%d' HSB publishers", h.NumPublishers)

	for n := 0; n < h.NumPublishers; n++ {
		go h.Run(fmt.Sprintf("inbound-publisher-%d", n))
	}

	return nil
}

func (h *HSB) Run(id string) {
	llog := h.log.WithField("publisherID", id)

	h.Looper.Loop(func() error {
		select {
		case work := <-h.HSBChan:
			span, ctx := tracer.StartSpanFromContext(context.Background(), "hsb.Run")
			defer span.Finish()

			data, err := proto.Marshal(work)
			if err != nil {
				llog.Errorf("unable to marshal pb message to []byte: %s", err)
				return nil
			}

			if err := h.Kafka.PublishWithRetry(ctx, work.Batch.Collect.XCollectorHsbTopic, data, 3); err != nil {
				llog.Errorf("unable to publish msg: %s", err)
				return nil
			}
		case <-h.Context.Done():
			// We have been asked to stop.
			llog.Info("publisher stopping")
			h.Looper.Quit()
		}
		return nil
	})
}
