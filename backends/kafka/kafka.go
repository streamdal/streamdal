package kafka

import (
	"context"
	"crypto/tls"
	"fmt"
	"sync"
	"time"

	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
	skafka "github.com/segmentio/kafka-go"
	"github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

const (
	DefaultBatchSize      = 10
	DefaultQueueCapacity  = 100
	DefaultConnectTimeout = 10 * time.Second
	DefaultMaxBytes       = 1048576 // 1MB
)

type IKafka interface {
	NewPublisher(id, topic string) *Publisher
	GetWriterByTopic(topic string) *skafka.Writer
	Publish(ctx context.Context, topic string, value []byte) error
	PublishWithRetry(ctx context.Context, topic string, value []byte, numRetries int) error
}

type Kafka struct {
	Dialer         *skafka.Dialer
	PublisherMap   map[string]*Publisher
	PublisherMutex *sync.RWMutex
	Options        *Options
	Context        context.Context
	log            *logrus.Entry
}

type Publisher struct {
	ID     string
	Writer *skafka.Writer
	log    *logrus.Entry
	Kafka  *Kafka
}

type Options struct {
	Topic         string
	Brokers       []string
	Timeout       time.Duration
	BatchSize     int
	UseTLS        bool
	QueueCapacity int
}

func New(opts *Options, ctx context.Context) (*Kafka, error) {
	if err := validateOptions(opts); err != nil {
		return nil, errors.Wrap(err, "invalid options")
	}

	if ctx == nil {
		ctx = context.Background()
	}

	dialer := &skafka.Dialer{
		Timeout: opts.Timeout,
	}

	if opts.UseTLS {
		dialer.TLS = &tls.Config{
			InsecureSkipVerify: true,
		}
	}

	if _, err := dialer.DialContext(ctx, "tcp", opts.Brokers[0]); err != nil {
		return nil, fmt.Errorf("unable to create initial connection to broken '%s': %s",
			opts.Brokers[0], err)
	}

	return &Kafka{
		Dialer:         dialer,
		PublisherMutex: &sync.RWMutex{},
		PublisherMap:   make(map[string]*Publisher),
		Options:        opts,
		Context:        ctx,
		log:            logrus.WithField("pkg", "kafka"),
	}, nil
}

func validateOptions(opts *Options) error {
	if len(opts.Brokers) == 0 {
		return errors.New("brokers cannot be empty")
	}

	if opts.Topic == "" {
		return errors.New("topic cannot be empty")
	}

	if opts.Timeout == 0 {
		opts.Timeout = DefaultConnectTimeout
	}

	if opts.BatchSize <= 0 {
		opts.BatchSize = DefaultBatchSize
	}

	if opts.QueueCapacity <= 0 {
		opts.QueueCapacity = DefaultQueueCapacity
	}

	return nil
}

func (k *Kafka) NewPublisher(id, topic string) *Publisher {
	return &Publisher{
		ID: id,
		Writer: skafka.NewWriter(skafka.WriterConfig{
			Brokers:      k.Options.Brokers,
			Topic:        topic,
			Dialer:       k.Dialer,
			BatchSize:    k.Options.BatchSize,
			BatchBytes:   DefaultMaxBytes,
			Balancer:     &skafka.Hash{},
			WriteTimeout: DefaultConnectTimeout,
		}),
		Kafka: k,
		log:   k.log.WithField("id", id),
	}
}

func (k *Kafka) GetWriterByTopic(topic string) *skafka.Writer {
	k.PublisherMutex.Lock()
	defer k.PublisherMutex.Unlock()

	p, ok := k.PublisherMap[topic]
	if !ok {
		p = k.NewPublisher(uuid.NewV4().String(), topic)
		k.PublisherMap[topic] = p
	}

	return p.Writer
}

// PublishWithRetry is a wrapper for Publish that also includes retries. This
// is useful for
func (k *Kafka) PublishWithRetry(ctx context.Context, topic string, value []byte, numRetries int) error {
	var err error

	for i := 0; i < numRetries; i++ {
		if i != 0 {
			k.log.Debugf("publish retry #%d for topic '%s'", i, topic)
		}

		err = k.Publish(ctx, topic, value)
		if err != nil {
			k.log.Errorf("unable to complete publish for topic %s [retry %d/%d]: %s",
				topic, i, numRetries, err)
			time.Sleep(5 * time.Second)
			continue
		}

		// Publish succeeded
		k.log.Debugf("publish for topic '%s' succeeded on try #%d", topic, i)

		return nil
	}

	return fmt.Errorf("unable to complete publish for topic '%s' [reached max retries (%d)]: %s",
		topic, numRetries, err)
}

// Publish is used for publishing a single message to a destination topic.
// Each topic gets their own dedicated *skafka.Writer - Publish() will either
// use an existing one in cache or generate a new one on the fly.
func (k *Kafka) Publish(ctx context.Context, topic string, value []byte) error {
	span, ctx := tracer.StartSpanFromContext(ctx, "Publish")
	defer span.Finish()

	if err := k.GetWriterByTopic(topic).WriteMessages(ctx, skafka.Message{
		Value: value,
	}); err != nil {
		span.SetTag("error", err)
		return errors.Wrap(err, "unable to publish message(s)")
	}

	return nil
}
