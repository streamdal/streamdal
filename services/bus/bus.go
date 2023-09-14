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
	FullSubject = "snitch_events:broadcast"
)

type IBus interface {
	RunConsumer() error
	BroadcastRegister(ctx context.Context, req *protos.RegisterRequest) error
	BroadcastDeregister(ctx context.Context, req *protos.DeregisterRequest) error
	BroadcastDeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) error
	BroadcastUpdatePipeline(ctx context.Context, req *protos.UpdatePipelineRequest) error
	BroadcastDeletePipeline(ctx context.Context, req *protos.DeletePipelineRequest) error
	BroadcastAttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) error
	BroadcastDetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) error
	BroadcastPausePipeline(ctx context.Context, req *protos.PausePipelineRequest) error
	BroadcastResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) error
	BroadcastMetrics(ctx context.Context, req *protos.MetricsRequest) error
	BroadcastKVCreate(ctx context.Context, kvs []*protos.KVObject, overwrite bool) error
	BroadcastKVUpdate(ctx context.Context, kvs []*protos.KVObject) error
	BroadcastKVDelete(ctx context.Context, key string) error
	BroadcastKVDeleteAll(ctx context.Context) error
	BroadcastNewAudience(ctx context.Context, req *protos.NewAudienceRequest) error
	BroadcastTailRequest(ctx context.Context, req *protos.TailRequest) error
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

	if err := prepareNATS(opts); err != nil {
		return nil, errors.Wrap(err, "error creating consumer")
	}

	return &Bus{
		options: opts,
		log:     logrus.WithField("pkg", "bus"),
	}, nil
}

func prepareNATS(opts *Options) error {
	return nil
	//// Won't error if stream already exists
	//if err := opts.NATS.CreateStream(opts.ShutdownCtx, StreamName, []string{FullSubject}); err != nil {
	//	return errors.Wrap(err, "error creating stream")
	//}
	//
	//// Won't error if consumer already exists
	//if err := opts.NATS.CreateConsumer(opts.ShutdownCtx, StreamName, opts.NodeName, FullSubject); err != nil {
	//	return errors.Wrap(err, "error creating consumer")
	//}
	//
	//return nil
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

// RunConsumer is used for consuming message from the snitch RedisBackend stream and
// executing a message handler.
func (b *Bus) RunConsumer() error {
	ps := b.options.RedisBackend.Subscribe(b.options.ShutdownCtx, FullSubject)

MAIN:
	for {
		// Hack since natty.Consume() should return err (but doesn't right now)
		select {
		case <-b.options.ShutdownCtx.Done():
			b.log.Debug("context cancellation detected")
			break MAIN
		default:
			// NOOP
		}

		msg, err := ps.ReceiveMessage(b.options.ShutdownCtx)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				b.log.Debug("context cancellation detected")
				break MAIN
			}

			b.log.WithError(err).Error("error consuming messages")
			continue
		}

		b.handler(b.options.ShutdownCtx, msg)
	}

	b.log.Debug("pubsub consumer exiting")

	return ps.Unsubscribe(context.Background())
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
