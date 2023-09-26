package bus

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/cmd"
	"github.com/streamdal/snitch-server/services/metrics"
	"github.com/streamdal/snitch-server/services/pubsub"
	"github.com/streamdal/snitch-server/services/store"
	"github.com/streamdal/snitch-server/validate"
)

/*

Broadcast handlers should not have to write to storage - it should already
handled before the broadcast occurred. Instead, the broadcast handler should
perform business logic that should be performed by ALL cluster nodes.

Example: If an UpdatePipeline comes in, the handler should determine if the
current node has an active session that uses this pipeline - if it does, it
should send commands to the client (via the register cmd channel).

*/

const (
	// FullSubject is for non-tail/peek RedisBackend pubsub messages
	FullSubject = "snitch_events:broadcast"

	// TailSubjectPrefix is the prefix for the RedisBackend wildcard pubsub topic for tail/peek responses
	TailSubjectPrefix = "snitch_events:tail"
)

type IBus interface {
	// RunConsumer runs a redis consumer that listens for messages on the snitch broadcast topic
	RunConsumer() error

	// RunTailConsumer is used for consuming message from the snitch RedisBackend wildcard pubsub topic
	// This method is different from RunConsumer() because we must call PSubscribe() and PUnsubscribe()
	// instead of Subscribe() and Unsubscribe() respectively.
	// See: https://redis.io/commands/psubscribe
	RunTailConsumer() error

	// BroadcastRegister broadcasts a RegisterRequest to all nodes in the cluster
	BroadcastRegister(ctx context.Context, req *protos.RegisterRequest) error

	// BroadcastDeregister broadcasts a DeregisterRequest to all nodes in the cluster
	BroadcastDeregister(ctx context.Context, req *protos.DeregisterRequest) error

	// BroadcastDeleteAudience broadcasts a DeleteAudienceRequest to all nodes in the cluster
	BroadcastDeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) error

	// BroadcastUpdatePipeline broadcasts a UpdatePipelineRequest to all nodes in the cluster
	BroadcastUpdatePipeline(ctx context.Context, req *protos.UpdatePipelineRequest) error

	// BroadcastDeletePipeline broadcasts a DeletePipelineRequest to all nodes in the cluster
	BroadcastDeletePipeline(ctx context.Context, req *protos.DeletePipelineRequest) error

	// BroadcastAttachPipeline broadcasts a AttachPipelineRequest to all nodes in the cluster
	BroadcastAttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) error

	// BroadcastDetachPipeline broadcasts a DetachPipelineRequest to all nodes in the cluster
	BroadcastDetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) error

	// BroadcastPausePipeline broadcasts a PausePipelineRequest to all nodes in the cluster
	BroadcastPausePipeline(ctx context.Context, req *protos.PausePipelineRequest) error

	// BroadcastResumePipeline broadcasts a ResumePipelineRequest to all nodes in the cluster
	BroadcastResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) error

	// BroadcastMetrics broadcasts a MetricsRequest to all nodes in the cluster
	BroadcastMetrics(ctx context.Context, req *protos.MetricsRequest) error

	// BroadcastKVCreate broadcasts a KVRequest to all nodes in the cluster
	BroadcastKVCreate(ctx context.Context, kvs []*protos.KVObject, overwrite bool) error

	// BroadcastKVUpdate broadcasts a KVRequest to all nodes in the cluster
	BroadcastKVUpdate(ctx context.Context, kvs []*protos.KVObject) error

	// BroadcastKVDelete broadcasts a KVRequest to all nodes in the cluster
	BroadcastKVDelete(ctx context.Context, key string) error

	// BroadcastKVDeleteAll broadcasts a KVRequest to all nodes in the cluster
	BroadcastKVDeleteAll(ctx context.Context) error

	// BroadcastNewAudience broadcasts a NewAudienceRequest to all nodes in the cluster
	BroadcastNewAudience(ctx context.Context, req *protos.NewAudienceRequest) error

	// BroadcastTailRequest broadcasts a TailRequest to all nodes in the cluster
	BroadcastTailRequest(ctx context.Context, req *protos.TailRequest) error

	// BroadcastTailResponse broadcasts a TailResponse to all nodes in the cluster
	BroadcastTailResponse(ctx context.Context, resp *protos.TailResponse) error
}

type Bus struct {
	options *Options
	log     *logrus.Entry
}

type Options struct {
	Store        store.IStore
	RedisBackend *redis.Client
	Metrics      metrics.IMetrics
	Cmd          cmd.ICmd
	NodeName     string
	WASMDir      string
	ShutdownCtx  context.Context
	PubSub       pubsub.IPubSub
}

func New(opts *Options) (*Bus, error) {
	if err := opts.validate(); err != nil {
		return nil, errors.Wrap(err, "error validating params")
	}

	return &Bus{
		options: opts,
		log:     logrus.WithField("pkg", "bus"),
	}, nil
}

func (o *Options) validate() error {
	if o.ShutdownCtx == nil {
		return errors.New("context must be provided")
	}

	if o.NodeName == "" {
		return errors.New("node name must be provided")
	}

	if o.RedisBackend == nil {
		return errors.New("redis backend must be provided")
	}

	if o.Store == nil {
		return errors.New("store service must be provided")
	}

	if o.Cmd == nil {
		return errors.New("cmd service must be provided")
	}

	if o.WASMDir == "" {
		return errors.New("wasm dir must be provided")
	}

	if o.Metrics == nil {
		return errors.New("metrics service must be provided")
	}

	if o.PubSub == nil {
		return errors.New("pubsub must be provided")
	}

	return nil
}

// RunConsumer is used for consuming message from the snitch broadcast stream
// and executing a message handler. It automatically recovers from Redis
// connection errors.
func (b *Bus) RunConsumer() error {
	llog := b.log.WithField("method", "RunConsumer")
	llog.Debug("starting dedicated consumer for channel '%s'", FullSubject)

	// Subscribe automatically reconnects on error
	ps := b.options.RedisBackend.Subscribe(b.options.ShutdownCtx, FullSubject)

MAIN:
	for {
		select {
		case <-b.options.ShutdownCtx.Done():
			llog.Debug("context cancellation detected")
			break MAIN
		case msg := <-ps.Channel():
			llog.Debugf("received message on channel '%s'", msg.Channel)

			if err := b.handler(b.options.ShutdownCtx, msg); err != nil {
				llog.WithError(err).Errorf("error handling broadcast message on channel '%s'", msg.Channel)
				continue
			}
		}
	}

	llog.Debugf("pubsub consumer for topic '%s' exiting", FullSubject)

	return ps.Unsubscribe(context.Background())
}

// RunTailConsumer is a dedicated consumer that listens for tail messages on a
// channel with a * pattern. It automatically recovers from connection errors.
func (b *Bus) RunTailConsumer() error {
	llog := b.log.WithField("method", "RunTailConsumer")

	channel := TailSubjectPrefix + ":*"

	llog.Debug("starting dedicated consumer on channel '%s'", channel)

	ps := b.options.RedisBackend.PSubscribe(b.options.ShutdownCtx, channel)

MAIN:
	for {
		// redis.ReceiveMessage() does not expect context cancellation, so we have to
		// check for it manually and use redis.ReceiveTimeout()
		select {
		case <-b.options.ShutdownCtx.Done():
			llog.Debug("context cancellation detected")
			break MAIN
		case msg := <-ps.Channel():
			if err := b.handler(b.options.ShutdownCtx, msg); err != nil {
				llog.WithError(err).Error("error handling tail message on channel '%s'", msg.Channel)
				continue
			}
		}
	}

	llog.Debugf("pubsub consumer for channel '%s' exiting", channel)

	return ps.PUnsubscribe(context.Background())
}

// handler every time a new message is received on the RedisBackend broadcast stream.
// This method is responsible for decoding the message and executing the
// appropriate msg handler.
func (b *Bus) handler(shutdownCtx context.Context, msg *redis.Message) error {
	llog := b.log.WithField("method", "handler")
	llog.Debug("received new broadcast message")

	busEvent := &protos.BusEvent{}

	if err := proto.Unmarshal([]byte(msg.Payload), busEvent); err != nil {
		return errors.Wrap(err, "error unmarshalling bus event")
	}

	if err := validate.BusEvent(busEvent); err != nil {
		return errors.Wrap(err, "validation error")
	}

	llog = llog.WithFields(logrus.Fields{
		"metadata": busEvent.XMetadata,
		"source":   busEvent.Source,
	})

	llog.Debug("received message successfully unmarshalled and validated; passing to handler")

	var err error

	switch t := busEvent.Event.(type) {
	case *protos.BusEvent_RegisterRequest:
		err = b.handleRegisterRequest(shutdownCtx, busEvent.GetRegisterRequest())
	case *protos.BusEvent_DeregisterRequest:
		err = b.handleDeregisterRequest(shutdownCtx, busEvent.GetDeregisterRequest())
	case *protos.BusEvent_NewAudienceRequest:
		err = b.handleNewAudienceRequest(shutdownCtx, busEvent.GetNewAudienceRequest())
	case *protos.BusEvent_DeleteAudienceRequest:
		err = b.handleDeleteAudienceRequest(shutdownCtx, busEvent.GetDeleteAudienceRequest())
	case *protos.BusEvent_UpdatePipelineRequest:
		err = b.handleUpdatePipelineRequest(shutdownCtx, busEvent.GetUpdatePipelineRequest())
	case *protos.BusEvent_DeletePipelineRequest:
		err = b.handleDeletePipelineRequest(shutdownCtx, busEvent.GetDeletePipelineRequest())
	case *protos.BusEvent_AttachPipelineRequest:
		err = b.handleAttachPipelineRequest(shutdownCtx, busEvent.GetAttachPipelineRequest())
	case *protos.BusEvent_DetachPipelineRequest:
		err = b.handleDetachPipelineRequest(shutdownCtx, busEvent.GetDetachPipelineRequest())
	case *protos.BusEvent_PausePipelineRequest:
		err = b.handlePausePipelineRequest(shutdownCtx, busEvent.GetPausePipelineRequest())
	case *protos.BusEvent_ResumePipelineRequest:
		err = b.handleResumePipelineRequest(shutdownCtx, busEvent.GetResumePipelineRequest())
	case *protos.BusEvent_MetricsRequest:
		err = b.handleMetricsRequest(shutdownCtx, busEvent.GetMetricsRequest())
	case *protos.BusEvent_KvRequest:
		err = b.handleKVRequest(shutdownCtx, busEvent.GetKvRequest())
	case *protos.BusEvent_TailRequest:
		err = b.handleTailCommand(shutdownCtx, busEvent.GetTailRequest())
	case *protos.BusEvent_TailResponse:
		err = b.handleTailResponse(shutdownCtx, busEvent.GetTailResponse())
	default:
		err = fmt.Errorf("unable to handle bus event: unknown event type '%v'", t)
	}

	if err != nil {
		b.log.Error(err)
		return errors.Wrap(err, "error handling bus event")
	}

	return nil
}
