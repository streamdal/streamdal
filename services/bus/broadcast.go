package bus

import (
	"context"
	"fmt"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-protos/build/go/protos"
	"github.com/streamdal/snitch-protos/build/go/protos/shared"

	"github.com/streamdal/snitch-server/util"
)

func (b *Bus) BroadcastUpdatePipeline(ctx context.Context, req *protos.UpdatePipelineRequest) error {
	return b.broadcast(ctx, "update_pipeline", &protos.BusEvent{Event: &protos.BusEvent_UpdatePipelineRequest{UpdatePipelineRequest: req}})
}

func (b *Bus) BroadcastDeletePipeline(ctx context.Context, req *protos.DeletePipelineRequest) error {
	return b.broadcast(ctx, "delete_pipeline", &protos.BusEvent{Event: &protos.BusEvent_DeletePipelineRequest{DeletePipelineRequest: req}})
}

func (b *Bus) BroadcastAttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) error {
	return b.broadcast(ctx, "attach_pipeline", &protos.BusEvent{Event: &protos.BusEvent_AttachPipelineRequest{AttachPipelineRequest: req}})
}

func (b *Bus) BroadcastDetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) error {
	b.log.Debugf("detach broadcastDetachPipeline: has '%d' session ID's", len(req.XSessionIds))
	return b.broadcast(ctx, "detach_pipeline", &protos.BusEvent{Event: &protos.BusEvent_DetachPipelineRequest{DetachPipelineRequest: req}})
}

func (b *Bus) BroadcastPausePipeline(ctx context.Context, req *protos.PausePipelineRequest) error {
	return b.broadcast(ctx, "pause_pipeline", &protos.BusEvent{Event: &protos.BusEvent_PausePipelineRequest{PausePipelineRequest: req}})
}

func (b *Bus) BroadcastResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) error {
	return b.broadcast(ctx, "resume_pipeline", &protos.BusEvent{Event: &protos.BusEvent_ResumePipelineRequest{ResumePipelineRequest: req}})
}

func (b *Bus) BroadcastMetrics(ctx context.Context, req *protos.MetricsRequest) error {
	return b.broadcast(ctx, "metrics", &protos.BusEvent{Event: &protos.BusEvent_MetricsRequest{MetricsRequest: req}})
}

func (b *Bus) BroadcastRegister(ctx context.Context, req *protos.RegisterRequest) error {
	return b.broadcast(ctx, "register", &protos.BusEvent{Event: &protos.BusEvent_RegisterRequest{RegisterRequest: req}})
}

func (b *Bus) BroadcastDeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) error {
	return b.broadcast(ctx, "delete_audience", &protos.BusEvent{Event: &protos.BusEvent_DeleteAudienceRequest{DeleteAudienceRequest: req}})
}

func (b *Bus) BroadcastDeregister(ctx context.Context, req *protos.DeregisterRequest) error {
	return b.broadcast(ctx, "deregister", &protos.BusEvent{Event: &protos.BusEvent_DeregisterRequest{DeregisterRequest: req}})
}

func (b *Bus) BroadcastNewAudience(ctx context.Context, req *protos.NewAudienceRequest) error {
	return b.broadcast(ctx, "new_audience", &protos.BusEvent{Event: &protos.BusEvent_NewAudienceRequest{NewAudienceRequest: req}})
}

// BroadcastKVCreate will transform the req into a generic KVRequest and broadcast
// it to other snitch-server nodes.
func (b *Bus) BroadcastKVCreate(ctx context.Context, kvs []*protos.KVObject, overwrite bool) error {
	kvRequest := util.GenerateKVRequest(shared.KVAction_KV_ACTION_CREATE, kvs, overwrite)

	return b.broadcast(ctx, "kv_create", &protos.BusEvent{
		Event: &protos.BusEvent_KvRequest{
			KvRequest: kvRequest,
		},
	})
}

// BroadcastKVUpdate will transform the req into a generic KVRequest and broadcast
// it to other snitch-server nodes.
func (b *Bus) BroadcastKVUpdate(ctx context.Context, kvs []*protos.KVObject) error {
	kvRequest := util.GenerateKVRequest(shared.KVAction_KV_ACTION_UPDATE, kvs, false)

	return b.broadcast(ctx, "kv_update", &protos.BusEvent{
		Event: &protos.BusEvent_KvRequest{
			KvRequest: kvRequest,
		},
	})
}

func (b *Bus) BroadcastKVDelete(ctx context.Context, key string) error {
	return b.broadcast(ctx, "kv_delete", &protos.BusEvent{
		Event: &protos.BusEvent_KvRequest{
			KvRequest: &protos.KVRequest{
				Instructions: []*protos.KVInstruction{
					{
						Id:                       util.GenerateUUID(),
						Action:                   shared.KVAction_KV_ACTION_DELETE,
						Object:                   &protos.KVObject{Key: key},
						RequestedAtUnixTsNanoUtc: 0,
					},
				},
			},
		},
	})
}

func (b *Bus) BroadcastKVDeleteAll(ctx context.Context) error {
	return b.broadcast(ctx, "kv_delete_all", &protos.BusEvent{
		Event: &protos.BusEvent_KvRequest{
			KvRequest: &protos.KVRequest{
				Instructions: []*protos.KVInstruction{
					{
						Id:                       util.GenerateUUID(),
						Action:                   shared.KVAction_KV_ACTION_DELETE_ALL,
						RequestedAtUnixTsNanoUtc: time.Now().UTC().UnixNano(),
					},
				},
			},
		},
	})
}

func (b *Bus) BroadcastTailRequest(ctx context.Context, req *protos.TailRequest) error {
	return b.broadcast(ctx, "tail", &protos.BusEvent{
		Event: &protos.BusEvent_TailRequest{
			TailRequest: req,
		},
	})
}

func (b *Bus) BroadcastTailResponse(ctx context.Context, resp *protos.TailResponse) error {
	event := &protos.BusEvent{
		Event: &protos.BusEvent_TailResponse{
			TailResponse: resp,
		},
		XMetadata: util.CtxMetadata(ctx),
		Source:    b.options.NodeName,
	}

	llog := b.log.WithFields(logrus.Fields{
		"tail_request_id": resp.TailRequestId,
		"session_id":      resp.SessionId,
		"method":          "BroadcastTailResponse",
	})

	llog.Debug("before marshal")

	data, err := proto.Marshal(event)
	if err != nil {
		return errors.Wrap(err, "error marshaling bus message")
	}

	topic := fmt.Sprintf("%s:%s", TailSubjectPrefix, resp.TailRequestId)

	llog.Debugf("after marshal, before publish to topic '%s'", topic)

	if err := b.options.RedisBackend.Publish(ctx, topic, data).Err(); err != nil {
		return errors.Wrap(err, "error publishing tail response")
	}

	llog.Debugf("after publish to topic '%s'", topic)

	return nil
}

// TODO: Use generics
func (b *Bus) broadcast(ctx context.Context, eventType string, event *protos.BusEvent) error {
	// Need to translate metadata from ctx -> metadata in event

	event.XMetadata = util.CtxMetadata(ctx)
	event.Source = b.options.NodeName

	b.log.Debugf("broadcasting event '%v'", eventType)

	data, err := proto.Marshal(event)
	if err != nil {
		return errors.Wrap(err, "error marshaling bus message")
	}

	b.options.RedisBackend.Publish(ctx, FullSubject, data)

	b.log.Debugf("broadcast for event '%v' complete", eventType)

	return nil
}
