package store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/store/types"
	"github.com/streamdal/snitch-server/util"
)

/*

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Storage strategy is defined here:

https://www.notion.so/streamdal/Snitch-Server-Storage-Spec-417bfa71f04b481082373ad18cbdb0e9

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

`store` is a service that handles storage and retrieval of data such as service
registrations and service commands.

`store` is backed by a `natty.INatty` instance, which is a wrapper for NATS.

All reads, writes and deletes are performed via NATS -- snitch-server does NOT
store any persistent state in memory!
*/

var (
	ErrPipelineNotFound = errors.New("pipeline not found")
	ErrConfigNotFound   = errors.New("config not found")
)

type IStore interface {
	AddRegistration(ctx context.Context, req *protos.RegisterRequest) error
	DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error
	AddHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error
	GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error)
	GetPipeline(ctx context.Context, pipelineID string) (*protos.Pipeline, error)
	GetConfig(ctx context.Context) (map[*protos.Audience][]string, error) // v: pipeline_id
	GetLive(ctx context.Context) ([]*types.LiveEntry, error)
	GetPaused(ctx context.Context) (map[string]*types.PausedEntry, error)
	CreatePipeline(ctx context.Context, pipeline *protos.Pipeline) error
	AddAudience(ctx context.Context, req *protos.NewAudienceRequest) error
	DeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) error
	DeletePipeline(ctx context.Context, pipelineID string) error
	UpdatePipeline(ctx context.Context, pipeline *protos.Pipeline) error
	AttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) error
	DetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) error
	PausePipeline(ctx context.Context, req *protos.PausePipelineRequest) error
	ResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) error
	IsPaused(ctx context.Context, audience *protos.Audience, pipelineID string) (bool, error)
	GetConfigByAudience(ctx context.Context, audience *protos.Audience) (string, error)
	GetAudiences(ctx context.Context) ([]*protos.Audience, error)

	IsPipelineAttached(ctx context.Context, audience *protos.Audience, pipelineID string) (bool, error)

	GetNotificationConfig(ctx context.Context, req *protos.GetNotificationRequest) (*protos.NotificationConfig, error)
	GetNotificationConfigs(ctx context.Context) (map[string]*protos.NotificationConfig, error)
	GetNotificationConfigsByPipeline(ctx context.Context, pipelineID string) ([]*protos.NotificationConfig, error)
	CreateNotificationConfig(ctx context.Context, req *protos.CreateNotificationRequest) error
	UpdateNotificationConfig(ctx context.Context, req *protos.UpdateNotificationRequest) error
	DeleteNotificationConfig(ctx context.Context, req *protos.DeleteNotificationRequest) error
	AttachNotificationConfig(ctx context.Context, req *protos.AttachNotificationRequest) error
	DetachNotificationConfig(ctx context.Context, req *protos.DetachNotificationRequest) error

	GetAttachCommandsByService(ctx context.Context, serviceName string) ([]*protos.Command, error)
}

type Options struct {
	NATSBackend natty.INatty
	ShutdownCtx context.Context
	NodeName    string
	SessionTTL  time.Duration
}

type Store struct {
	options *Options
	log     *logrus.Entry
}

func New(opts *Options) (*Store, error) {
	if err := opts.validate(); err != nil {
		return nil, errors.Wrap(err, "error validating options")
	}

	return &Store{
		options: opts,
		log:     logrus.WithField("pkg", "store"),
	}, nil
}

func (s *Store) AddRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	llog := s.log.WithField("method", "AddRegistration")
	llog.Debug("received request to add registration")

	registrationKey := NATSLiveKey(req.SessionId, s.options.NodeName, "register")

	// Populate these so we can save them in K/V; needed for GetAll()
	req.ClientInfo.XSessionId = &req.SessionId
	req.ClientInfo.XServiceName = &req.ServiceName
	req.ClientInfo.XNodeName = &s.options.NodeName

	clientInfoBytes, err := proto.Marshal(req.ClientInfo)
	if err != nil {
		return errors.Wrap(err, "error marshalling client info")
	}

	s.log.Debugf("attempting to save registration under key '%s'", registrationKey)

	// Add registration in snitch_live bucket
	if err := s.options.NATSBackend.Put(
		ctx,
		NATSLiveBucket,
		registrationKey,
		clientInfoBytes,
		s.options.SessionTTL,
	); err != nil {
		return errors.Wrap(err, "error adding registration to K/V")
	}

	// Save audience(s) if they are present in Register request
	if req.Audiences != nil && len(req.Audiences) > 0 {
		for _, audience := range req.Audiences {
			llog.Debugf("adding audience '%s' for session '%s'", audience, req.SessionId)

			if err := s.AddAudience(ctx, &protos.NewAudienceRequest{
				SessionId: req.SessionId,
				Audience:  audience,
			}); err != nil {
				return errors.Wrap(err, "error adding audience")
			}
		}
	}

	return nil
}

func (s *Store) DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error {
	llog := s.log.WithField("method", "DeleteRegistration")
	llog.Debug("received request to delete registration")

	// Remove all keys referencing the same session_id
	entries, err := s.GetLive(ctx)
	if err != nil {
		return errors.Wrap(err, "error fetching live entries")
	}

	for _, e := range entries {
		if e.SessionID != req.SessionId {
			continue
		}

		// Same session id - remove the key
		if err := s.options.NATSBackend.Delete(ctx, NATSLiveBucket, e.Key); err != nil {
			s.log.Errorf("unable to remove key '%s' from K/V", e.Key)
		}
	}

	return nil
}

// AddHeartbeat updates the TTL for registration and all audiences in snitch_live bucket
func (s *Store) AddHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error {
	//llog := s.log.WithField("method", "AddHeartbeat")
	//llog.Debug("received request to add heartbeat")

	keys, err := s.options.NATSBackend.Keys(ctx, NATSLiveBucket)
	if err != nil {
		return errors.Wrap(err, "error fetching keys from K/V")
	}

	for _, k := range keys {
		if !strings.HasPrefix(k, req.SessionId) {
			continue
		}

		// Key has session_id prefix, refresh it
		//llog.Debugf("attempting to refresh key '%s'", k)

		if err := s.options.NATSBackend.Refresh(ctx, NATSLiveBucket, k); err != nil {
			return errors.Wrap(err, "error refreshing key")
		}
	}

	return nil
}

func (s *Store) GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error) {
	llog := s.log.WithField("method", "GetPipelines")
	llog.Debug("received request to get pipelines")

	pipelineIds, err := s.options.NATSBackend.Keys(ctx, NATSPipelineBucket)
	if err != nil {
		if err == nats.ErrBucketNotFound {
			return make(map[string]*protos.Pipeline), nil
		}

		return nil, errors.Wrap(err, "error fetching pipeline keys from NATS")
	}

	// k == pipelineId
	pipelines := make(map[string]*protos.Pipeline)

	for _, pipelineId := range pipelineIds {
		pipelineData, err := s.options.NATSBackend.Get(ctx, NATSPipelineBucket, pipelineId)
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching pipeline '%s' from NATS", pipelineId)
		}

		pipeline := &protos.Pipeline{}

		if err := proto.Unmarshal(pipelineData, pipeline); err != nil {
			return nil, errors.Wrapf(err, "error unmarshaling pipeline '%s'", pipelineId)
		}

		pipelines[pipelineId] = pipeline
	}

	return pipelines, nil
}

func (s *Store) GetPipeline(ctx context.Context, pipelineId string) (*protos.Pipeline, error) {
	llog := s.log.WithField("method", "GetPipeline")
	llog.Debug("received request to get pipeline")

	pipelineData, err := s.options.NATSBackend.Get(ctx, NATSPipelineBucket, pipelineId)
	if err != nil {
		if err == nats.ErrKeyNotFound {
			return nil, ErrPipelineNotFound
		}

		return nil, errors.Wrap(err, "error fetching pipeline from NATS")
	}

	pipeline := &protos.Pipeline{}

	if err := proto.Unmarshal(pipelineData, pipeline); err != nil {
		return nil, errors.Wrap(err, "error deserializing pipeline")
	}

	return pipeline, nil
}

func (s *Store) CreatePipeline(ctx context.Context, pipeline *protos.Pipeline) error {
	llog := s.log.WithField("method", "CreatePipeline")
	llog.Debug("received request to create pipeline")

	// Save to K/V
	pipelineData, err := proto.Marshal(pipeline)
	if err != nil {
		return errors.Wrap(err, "error serializing pipeline to protobuf")
	}

	if err := s.options.NATSBackend.Put(ctx, NATSPipelineBucket, NATSPipelineKey(pipeline.Id), pipelineData); err != nil {
		return errors.Wrap(err, "error saving pipeline to NATS")
	}

	return nil
}

func (s *Store) DeletePipeline(ctx context.Context, pipelineId string) error {
	llog := s.log.WithField("method", "DeletePipeline")
	llog.Debug("received request to delete pipeline")

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, pipelineId); err != nil {
		return errors.Wrap(err, "error fetching pipeline")
	}

	if err := s.options.NATSBackend.Delete(ctx, NATSPipelineBucket, NATSPipelineKey(pipelineId)); err != nil {
		return errors.Wrap(err, "error deleting pipeline from NATS")
	}

	return nil
}

func (s *Store) UpdatePipeline(ctx context.Context, pipeline *protos.Pipeline) error {
	llog := s.log.WithField("method", "UpdatePipeline")
	llog.Debug("received request to update pipeline")

	// Save to K/V
	pipelineData, err := proto.Marshal(pipeline)
	if err != nil {
		return errors.Wrap(err, "error serializing pipeline to protobuf")
	}

	if err := s.options.NATSBackend.Put(ctx, NATSPipelineBucket, NATSPipelineKey(pipeline.Id), pipelineData); err != nil {
		return errors.Wrap(err, "error saving pipeline to NATS")
	}

	return nil
}

func (s *Store) AttachPipeline(ctx context.Context, req *protos.AttachPipelineRequest) error {
	llog := s.log.WithField("method", "AttachPipeline")
	llog.Debug("received request to attach pipeline")

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, req.PipelineId); err != nil {
		return errors.Wrap(err, "error fetching pipeline")
	}

	// Store attachment in NATS
	natsKey := NATSConfigKey(req.Audience, req.PipelineId)

	if err := s.options.NATSBackend.Put(ctx, NATSConfigBucket, natsKey, []byte(``)); err != nil {
		return errors.Wrap(err, "error saving pipeline attachment to NATS")
	}

	return nil
}

func (s *Store) DetachPipeline(ctx context.Context, req *protos.DetachPipelineRequest) error {
	llog := s.log.WithField("method", "DetachPipeline")
	llog.Debug("received request to detach pipeline")

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, req.PipelineId); err != nil {
		if err == ErrPipelineNotFound {
			llog.Debugf("pipeline '%s' not found - nothing to do", req.PipelineId)
			return nil
		}

		return errors.Wrap(err, "error fetching pipeline")
	}

	// Delete audience association
	if err := s.options.NATSBackend.Delete(
		ctx,
		NATSConfigBucket,
		NATSConfigKey(req.Audience, req.PipelineId),
	); err != nil {
		return errors.Wrap(err, "error deleting pipeline attachment from NATS")
	}

	// Delete from paused
	if err := s.options.NATSBackend.Delete(
		ctx,
		NATSPausedBucket,
		NATSPausedKey(util.AudienceToStr(req.Audience), req.PipelineId),
	); err != nil {
		if !errors.Is(err, nats.ErrKeyNotFound) {
			return errors.Wrap(err, "error deleting pipeline pause state")
		}
	}

	return nil
}

func (s *Store) PausePipeline(ctx context.Context, req *protos.PausePipelineRequest) error {
	llog := s.log.WithField("method", "PausePipeline")
	llog.Debug("received request to pause pipeline")

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, req.PipelineId); err != nil {
		return errors.Wrap(err, "error fetching pipeline")
	}

	paused, err := s.IsPaused(ctx, req.Audience, req.PipelineId)
	if err != nil {
		return errors.Wrap(err, "error checking if pipeline is paused")
	}

	if paused {
		llog.Debugf("pipeline '%s' already paused; nothing to do", req.PipelineId)
		return nil
	}

	llog.Debugf("pipeline '%s' not paused; setting pause state now", req.PipelineId)

	if err := s.options.NATSBackend.Put(
		ctx,
		NATSPausedBucket,
		NATSPausedKey(util.AudienceToStr(req.Audience), req.PipelineId),
		nil,
	); err != nil {
		return errors.Wrap(err, "error saving pipeline pause state")
	}

	return nil
}

// IsPaused returns if pipeline is paused and if it exists
func (s *Store) IsPaused(ctx context.Context, audience *protos.Audience, pipelineID string) (bool, error) {
	llog := s.log.WithField("method", "IsPaused")
	llog.Debug("received request to check if pipeline is paused")

	if _, err := s.options.NATSBackend.Get(ctx,
		NATSPausedBucket,
		NATSPausedKey(util.AudienceToStr(audience), pipelineID),
	); err != nil {
		if err == nats.ErrKeyNotFound {
			return false, nil
		}

		return false, errors.Wrap(err, "error fetching pipeline pause state")
	}

	return true, nil
}

func (s *Store) ResumePipeline(ctx context.Context, req *protos.ResumePipelineRequest) error {
	llog := s.log.WithField("method", "ResumePipeline")
	llog.Debug("received request to resume pipeline")

	paused, err := s.IsPaused(ctx, req.Audience, req.PipelineId)
	if err != nil {
		return errors.Wrap(err, "error checking if pipeline is paused")
	}

	if !paused {
		llog.Debugf("pipeline '%s' not paused; nothing to do", req.PipelineId)
		return nil
	}

	llog.Debugf("pipeline '%s' paused; removing pause state now", req.PipelineId)
	if err := s.options.NATSBackend.Delete(
		ctx,
		NATSPausedBucket,
		NATSPausedKey(util.AudienceToStr(req.Audience), req.PipelineId),
	); err != nil {
		return errors.Wrap(err, "error deleting pipeline pause state")
	}

	return nil
}

func (s *Store) AddAudience(ctx context.Context, req *protos.NewAudienceRequest) error {
	llog := s.log.WithField("method", "AddAudience")
	llog.Debug("received request to add audience")

	// Add it to the live bucket
	if err := s.options.NATSBackend.Put(
		ctx,
		NATSLiveBucket,
		NATSLiveKey(req.SessionId, s.options.NodeName, util.AudienceToStr(req.Audience)),
		nil,
		s.options.SessionTTL,
	); err != nil {
		return errors.Wrap(err, "error saving audience to NATS")
	}

	// And add it to more permanent storage (that doesn't care about the session id)
	if err := s.options.NATSBackend.Put(
		ctx,
		NATSAudienceBucket,
		NATSAudienceKey(util.AudienceToStr(req.Audience)),
		nil,
	); err != nil {
		return errors.Wrap(err, "error saving audience to NATS")
	}

	return nil
}

func (s *Store) DeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) error {
	var force bool
	llog := s.log.WithField("method", "DeleteAudience")
	llog.Debug("received request to delete audience")

	// Check if there are configs
	configs, err := s.GetConfig(ctx)
	if err != nil {
		s.log.Error(err)
		return s.deleteAudienceKey(ctx, req.Audience)
	}

	// If we have configs and we're not forcing, we can't delete
	pipelines, ok := configs[req.Audience]
	if ok && !force {
		return fmt.Errorf("audience is in use by pipeline '%s', cannot delete", pipelines)
	}

	return s.deleteAudienceKey(ctx, req.Audience)
}

func (s *Store) deleteAudienceKey(ctx context.Context, aud *protos.Audience) error {
	// Delete audience from bucket
	audStr := util.AudienceToStr(aud)
	if err := s.options.NATSBackend.Delete(
		ctx,
		NATSAudienceBucket,
		NATSAudienceKey(audStr),
	); err != nil {
		if err == nats.ErrBucketNotFound {
			return nil
		}

		if err == nats.ErrKeyNotFound {
			s.log.Debugf("audience '%s' not found; nothing to do", audStr)
			return nil
		}
		return errors.Wrap(err, "error deleting audience from NATS")
	}

	return nil
}

func (s *Store) GetConfig(ctx context.Context) (map[*protos.Audience][]string, error) {
	cfgs := make(map[*protos.Audience][]string)

	audienceKeys, err := s.options.NATSBackend.Keys(ctx, NATSConfigBucket)
	if err != nil {
		// No bucket == no configs
		if err == nats.ErrBucketNotFound {
			return cfgs, nil
		}

		return nil, errors.Wrap(err, "error fetching config keys from NATS")
	}

	for _, aud := range audienceKeys {
		audience, pipelineID := util.ParseConfigKey(aud)
		if audience == nil {
			return nil, fmt.Errorf("invalid config key '%s'", aud)
		}

		if cfgs[audience] == nil {
			cfgs[audience] = make([]string, 0)
		}

		cfgs[audience] = append(cfgs[audience], pipelineID)
	}

	return cfgs, nil
}

func (s *Store) GetLive(ctx context.Context) ([]*types.LiveEntry, error) {
	live := make([]*types.LiveEntry, 0)

	// Fetch all live keys from NATS
	keys, err := s.options.NATSBackend.Keys(ctx, NATSLiveBucket)
	if err != nil {
		// No bucket == no live entries yet
		if err == nats.ErrBucketNotFound {
			return live, nil
		}

		return nil, errors.Wrap(err, "error fetching live keys from NATS")
	}

	// key is of the format:
	//
	// <sessionID>/<nodeName>/<<service>/<operation_type>/<operation_name>/<component_name>>
	// OR
	// <sessionID>/<nodeName>/register

	for _, key := range keys {
		parts := strings.SplitN(key, "/", 3)

		if len(parts) != 3 {
			return nil, errors.Errorf("invalid live key '%s'", key)
		}

		sessionID := parts[0]
		nodeName := parts[1]
		maybeAud := parts[2]

		entry := &types.LiveEntry{
			Key:       key,
			SessionID: sessionID,
			NodeName:  nodeName,
		}

		if maybeAud == "register" {
			entry.Register = true

			registerData, err := s.options.NATSBackend.Get(ctx, NATSLiveBucket, key)
			if err != nil {
				return nil, errors.Wrapf(err, "error fetching register data for live key '%s'", key)
			}

			clientInfo := &protos.ClientInfo{}
			if err := proto.Unmarshal(registerData, clientInfo); err != nil {
				return nil, errors.Wrapf(err, "error unmarshaling register data for live key '%s'", key)
			}

			entry.Value = clientInfo
		} else {
			aud := util.AudienceFromStr(maybeAud)
			if aud == nil {
				return nil, errors.Errorf("invalid live key '%s'", key)
			}

			entry.Audience = aud
		}

		live = append(live, entry)
	}

	return live, nil
}

func (s *Store) GetConfigByAudience(ctx context.Context, audience *protos.Audience) (string, error) {
	audStr := util.AudienceToStr(audience)

	pipelineID, err := s.options.NATSBackend.Get(ctx, NATSConfigBucket, audStr)
	if err != nil {
		if err == nats.ErrKeyNotFound {
			return "", ErrConfigNotFound
		}

		return "", errors.Wrapf(err, "error fetching config for audience '%s'", audStr)
	}

	return string(pipelineID), nil
}

func (s *Store) GetAttachCommandsByService(ctx context.Context, serviceName string) ([]*protos.Command, error) {
	cmds := make([]*protos.Command, 0)

	keys, err := s.options.NATSBackend.Keys(ctx, NATSConfigBucket)
	if err != nil {
		if err == nats.ErrBucketNotFound {
			return cmds, nil
		}

		return nil, errors.Wrap(err, "error fetching config keys from NATS")
	}

	for _, key := range keys {
		aud, pipelineID := util.ParseConfigKey(key)
		if aud.ServiceName != serviceName {
			continue
		}

		pipeline, err := s.GetPipeline(ctx, pipelineID)
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching pipeline '%s'", pipelineID)
		}

		cmds = append(cmds, &protos.Command{
			Audience: aud,
			Command: &protos.Command_AttachPipeline{
				AttachPipeline: &protos.AttachPipelineCommand{
					Pipeline: pipeline,
				},
			},
		})
	}

	return cmds, nil
}

func (s *Store) GetNotificationConfig(ctx context.Context, req *protos.GetNotificationRequest) (*protos.NotificationConfig, error) {
	data, err := s.options.NATSBackend.Get(ctx, NATSNotificationConfigBucket, req.NotificationId)
	if err != nil {
		return nil, errors.Wrapf(err, "error fetching notification config '%s' from NATS", req.NotificationId)
	}

	cfg := &protos.NotificationConfig{}
	if err := proto.Unmarshal(data, cfg); err != nil {
		return nil, errors.Wrapf(err, "error unmarshaling notification config '%s'", req.NotificationId)
	}

	return cfg, nil
}

func (s *Store) GetNotificationConfigs(ctx context.Context) (map[string]*protos.NotificationConfig, error) {
	notificationConfigs := make(map[string]*protos.NotificationConfig)

	keys, err := s.options.NATSBackend.Keys(ctx, NATSNotificationConfigBucket)
	if err != nil {
		if err == nats.ErrBucketNotFound {
			return notificationConfigs, nil
		}

		return nil, errors.Wrap(err, "error fetching notification config keys from NATS")
	}

	for _, key := range keys {
		data, err := s.options.NATSBackend.Get(ctx, NATSNotificationConfigBucket, key)
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching notification config '%s' from NATS", key)
		}

		notificationConfig := &protos.NotificationConfig{}
		if err := proto.Unmarshal(data, notificationConfig); err != nil {
			return nil, errors.Wrapf(err, "error unmarshaling notification config '%s'", key)
		}

		notificationConfigs[key] = notificationConfig
	}

	return notificationConfigs, nil
}

func (s *Store) CreateNotificationConfig(ctx context.Context, req *protos.CreateNotificationRequest) error {
	data, err := proto.Marshal(req.Notification)
	if err != nil {
		return errors.Wrap(err, "error marshaling notification config")
	}

	key := NATSNotificationConfigKey(*req.Notification.Id)
	if err := s.options.NATSBackend.Put(ctx, NATSNotificationConfigBucket, key, data, 0); err != nil {
		return errors.Wrap(err, "error saving notification config to NATS")
	}

	return nil
}

func (s *Store) UpdateNotificationConfig(ctx context.Context, req *protos.UpdateNotificationRequest) error {
	data, err := proto.Marshal(req.Notification)
	if err != nil {
		return errors.Wrap(err, "error marshaling notification config")
	}

	key := NATSNotificationConfigKey(*req.Notification.Id)
	if err := s.options.NATSBackend.Put(ctx, NATSNotificationConfigBucket, key, data, 0); err != nil {
		return errors.Wrap(err, "error saving notification config to NATS")
	}

	return nil
}

func (s *Store) DeleteNotificationConfig(ctx context.Context, req *protos.DeleteNotificationRequest) error {
	key := NATSNotificationConfigKey(req.NotificationId)
	if err := s.options.NATSBackend.Delete(ctx, NATSNotificationConfigBucket, key); err != nil {
		return errors.Wrap(err, "error deleting notification config from NATS")
	}

	// Delete all associations
	keys, err := s.options.NATSBackend.Keys(ctx, NATSNotificationAssocBucket)
	if err != nil {
		if errors.Is(err, nats.ErrBucketNotFound) {
			return nil
		}
		return errors.Wrap(err, "error fetching notification assoc keys from NATS")
	}

	for _, key := range keys {
		if !strings.HasSuffix(key, "/"+req.NotificationId) {
			continue
		}

		if err := s.options.NATSBackend.Delete(ctx, NATSNotificationAssocBucket, key); err != nil {
			return errors.Wrap(err, "error deleting notification association from NATS")
		}
	}

	return nil
}

func (s *Store) AttachNotificationConfig(ctx context.Context, req *protos.AttachNotificationRequest) error {
	key := NATSNotificationAssocKey(req.PipelineId, req.NotificationId)
	if err := s.options.NATSBackend.Put(ctx, NATSNotificationAssocBucket, key, nil, 0); err != nil {
		return errors.Wrap(err, "error saving notification association to NATS")
	}

	return nil
}

func (s *Store) DetachNotificationConfig(ctx context.Context, req *protos.DetachNotificationRequest) error {
	key := NATSNotificationAssocKey(req.PipelineId, req.NotificationId)
	if err := s.options.NATSBackend.Delete(ctx, NATSNotificationAssocBucket, key); err != nil {
		return errors.Wrap(err, "error deleting notification association from NATS")
	}

	return nil
}

func (s *Store) GetNotificationConfigsByPipeline(ctx context.Context, pipelineID string) ([]*protos.NotificationConfig, error) {
	cfgs := make([]*protos.NotificationConfig, 0)

	// Fetch all notify config keys from NATS
	keys, err := s.options.NATSBackend.Keys(ctx, NATSNotificationAssocBucket)
	if err != nil {
		if err == nats.ErrBucketNotFound {
			return cfgs, nil
		}
		return nil, errors.Wrap(err, "error fetching notify config keys from NATS")
	}

	for _, key := range keys {
		if !strings.HasPrefix(key, pipelineID+"/") {
			continue
		}

		parts := strings.Split(key, "/")
		if len(parts) != 2 {
			return nil, errors.Errorf("invalid notify config key '%s'", key)
		}

		configID := parts[1]

		// Fetch key so we get the notify config
		data, err := s.options.NATSBackend.Get(ctx, NATSNotificationConfigBucket, configID)
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching notify config key '%s' from NATS", configID)
		}

		notifyConfig := &protos.NotificationConfig{}
		if err := proto.Unmarshal(data, notifyConfig); err != nil {
			return nil, errors.Wrapf(err, "error unmarshalling notify config for key '%s'", configID)
		}

		cfgs = append(cfgs, notifyConfig)
	}

	return cfgs, nil
}

func (o *Options) validate() error {
	if o == nil {
		return errors.New("options cannot be nil")
	}

	if o.NodeName == "" {
		return errors.New("node name cannot be empty")
	}

	if o.NATSBackend == nil {
		return errors.New("NATS backend cannot be nil")
	}

	if o.ShutdownCtx == nil {
		return errors.New("shutdown context cannot be nil")
	}

	if o.SessionTTL < time.Second || o.SessionTTL > time.Minute {
		return errors.New("session TTL must be between 1 second and 1 minute")
	}

	return nil
}

func (s *Store) GetAudiences(ctx context.Context) ([]*protos.Audience, error) {
	audiences := make([]*protos.Audience, 0)

	keys, err := s.options.NATSBackend.Keys(ctx, NATSAudienceBucket)
	if err != nil {
		if err == nats.ErrBucketNotFound {
			return audiences, nil
		}

		return nil, errors.Wrap(err, "error fetching audience keys from NATS")
	}

	for _, key := range keys {
		aud := util.AudienceFromStr(key)
		if aud == nil {
			return nil, errors.Errorf("invalid audience key '%s'", key)
		}

		audiences = append(audiences, aud)
	}

	return audiences, nil
}

func (s *Store) GetPaused(ctx context.Context) (map[string]*types.PausedEntry, error) {
	keys, err := s.options.NATSBackend.Keys(ctx, NATSPausedBucket)
	if err != nil {
		if err == nats.ErrBucketNotFound {
			return make(map[string]*types.PausedEntry), nil
		}

		return nil, errors.Wrap(err, "error fetching paused keys from NATS")
	}

	paused := make(map[string]*types.PausedEntry)

	for _, key := range keys {
		entry := &types.PausedEntry{
			Key:        key,
			Audience:   nil,
			PipelineID: "",
		}

		parts := strings.SplitN(key, "/", 2)
		if len(parts) != 2 {
			return nil, errors.Errorf("invalid paused key '%s' (incorrect number of parts '%d')", key, len(parts))
		}

		pipelineID := parts[0]
		audStr := parts[1]

		aud := util.AudienceFromStr(audStr)
		if aud == nil {
			return nil, errors.Errorf("invalid paused key '%s' (unable to convert audience str '%s' to *Audience)", key, audStr)
		}

		entry.Audience = aud
		entry.PipelineID = pipelineID

		paused[pipelineID] = entry
	}

	return paused, nil
}

func (s *Store) IsPipelineAttached(ctx context.Context, audience *protos.Audience, pipelineID string) (bool, error) {
	key := NATSConfigKey(audience, pipelineID)

	if _, err := s.options.NATSBackend.Get(ctx, NATSConfigBucket, key); err != nil {
		if err == nats.ErrKeyNotFound {
			return false, nil
		}

		return false, errors.Wrap(err, "error fetching pipeline attachment from NATS")
	}

	return true, nil
}
