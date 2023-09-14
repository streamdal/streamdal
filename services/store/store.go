package store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/encryption"
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

`store` is backed by a `natty.INatty` instance, which is a wrapper for RedisBackend.

All reads, writes and deletes are performed via RedisBackend -- snitch-server does NOT
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
	GetPipelineUsage(ctx context.Context) ([]*PipelineUsage, error)
	GetActivePipelineUsage(ctx context.Context, pipelineID string) ([]*PipelineUsage, error)
}

type Options struct {
	Encryption   encryption.IEncryption
	RedisBackend *redis.Client
	ShutdownCtx  context.Context
	NodeName     string
	SessionTTL   time.Duration
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

	status := s.options.RedisBackend.Set(ctx, registrationKey, clientInfoBytes, s.options.SessionTTL)
	if err := status.Err(); err != nil {
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
		// TODO: e.Key needs to be new redis key
		if err := s.options.RedisBackend.Del(ctx, e.Key).Err(); err != nil {
			s.log.Errorf("unable to remove key '%s' from K/V", e.Key)
		}
	}

	return nil
}

// AddHeartbeat updates the TTL for registration and all audiences in snitch_live bucket
func (s *Store) AddHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error {
	//llog := s.log.WithField("method", "AddHeartbeat")
	//llog.Debug("received request to add heartbeat")

	keys, err := s.options.RedisBackend.Keys(ctx, NATSLiveBucket+":*").Result()
	if err != nil {
		return errors.Wrap(err, "error fetching keys from K/V")
	}

	for _, k := range keys {
		if !strings.HasPrefix(k, req.SessionId) {
			continue
		}

		// Key has session_id prefix, refresh it
		//llog.Debugf("attempting to refresh key '%s'", k)

		if err := s.options.RedisBackend.ExpireXX(ctx, k, s.options.SessionTTL).Err(); err != nil {
			return errors.Wrap(err, "error refreshing key")
		}
	}

	return nil
}

func (s *Store) GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error) {
	llog := s.log.WithField("method", "GetPipelines")
	llog.Debug("received request to get pipelines")

	pipelineIds, err := s.options.RedisBackend.Keys(ctx, NATSPipelineBucket+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching pipeline keys from store")
	}

	// k == pipelineId
	pipelines := make(map[string]*protos.Pipeline)

	for _, pipelineId := range pipelineIds {
		pipelineData, err := s.options.RedisBackend.Get(ctx, pipelineId).Result()
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching pipeline '%s' from store", pipelineId)
		}

		pipeline := &protos.Pipeline{}

		if err := proto.Unmarshal([]byte(pipelineData), pipeline); err != nil {
			return nil, errors.Wrapf(err, "error unmarshaling pipeline '%s'", pipelineId)
		}

		pipelines[pipelineId] = pipeline
	}

	return pipelines, nil
}

func (s *Store) GetPipeline(ctx context.Context, pipelineId string) (*protos.Pipeline, error) {
	llog := s.log.WithField("method", "GetPipeline")
	llog.Debug("received request to get pipeline")

	pipelineData, err := s.options.RedisBackend.Get(ctx, NATSPipelineKey(pipelineId)).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, ErrPipelineNotFound
		}

		return nil, errors.Wrap(err, "error fetching pipeline from store")
	}

	pipeline := &protos.Pipeline{}

	if err := proto.Unmarshal([]byte(pipelineData), pipeline); err != nil {
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

	if err := s.options.RedisBackend.Set(ctx, NATSPipelineKey(pipeline.Id), pipelineData, 0).Err(); err != nil {
		return errors.Wrap(err, "error saving pipeline to store")
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

	if err := s.options.RedisBackend.Del(ctx, NATSPipelineKey(pipelineId)).Err(); err != nil {
		return errors.Wrap(err, "error deleting pipeline from store")
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

	if err := s.options.RedisBackend.Set(ctx, NATSPipelineKey(pipeline.Id), pipelineData, 0).Err(); err != nil {
		return errors.Wrap(err, "error saving pipeline to store")
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

	// Store attachment in RedisBackend
	natsKey := NATSConfigKey(req.Audience, req.PipelineId)

	if err := s.options.RedisBackend.Set(ctx, natsKey, []byte(``), 0).Err(); err != nil {
		return errors.Wrap(err, "error saving pipeline attachment to store")
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
	if err := s.options.RedisBackend.Del(ctx, NATSConfigKey(req.Audience, req.PipelineId)).Err(); err != nil {
		return errors.Wrap(err, "error deleting pipeline attachment from store")
	}

	// Delete from paused
	if err := s.options.RedisBackend.Del(ctx, NATSPausedKey(util.AudienceToStr(req.Audience), req.PipelineId)).Err(); err != nil {
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

	if err := s.options.RedisBackend.Set(
		ctx,
		NATSPausedKey(util.AudienceToStr(req.Audience), req.PipelineId),
		[]byte(``),
		0,
	).Err(); err != nil {
		return errors.Wrap(err, "error saving pipeline pause state")
	}

	return nil
}

// IsPaused returns if pipeline is paused and if it exists
func (s *Store) IsPaused(ctx context.Context, audience *protos.Audience, pipelineID string) (bool, error) {
	llog := s.log.WithField("method", "IsPaused")
	llog.Debug("received request to check if pipeline is paused")

	if err := s.options.RedisBackend.Get(ctx, NATSPausedKey(util.AudienceToStr(audience), pipelineID)).Err(); err != nil {
		if err == redis.Nil {
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
	if err := s.options.RedisBackend.Del(
		ctx,
		NATSPausedKey(util.AudienceToStr(req.Audience), req.PipelineId),
	).Err(); err != nil {
		return errors.Wrap(err, "error deleting pipeline pause state")
	}

	return nil
}

func (s *Store) AddAudience(ctx context.Context, req *protos.NewAudienceRequest) error {
	llog := s.log.WithField("method", "AddAudience")
	llog.Debug("received request to add audience")

	// Add it to the live bucket
	if err := s.options.RedisBackend.Set(
		ctx,
		NATSLiveKey(req.SessionId, s.options.NodeName, util.AudienceToStr(req.Audience)),
		nil,
		s.options.SessionTTL,
	).Err(); err != nil {
		return errors.Wrap(err, "error saving audience to store")
	}

	// And add it to more permanent storage (that doesn't care about the session id)
	if err := s.options.RedisBackend.Set(
		ctx,
		NATSAudienceKey(util.AudienceToStr(req.Audience)),
		[]byte(``),
		0,
	).Err(); err != nil {
		return errors.Wrap(err, "error saving audience to store")
	}

	return nil
}

func (s *Store) DeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) error {
	llog := s.log.WithField("method", "DeleteAudience")
	llog.Debug("received request to delete audience")

	// Check if there are configs
	configs, err := s.GetConfig(ctx)
	if err != nil {
		s.log.Error(err)
		return s.deleteAudienceKey(ctx, req.Audience)
	}

	// If we have configs and we're not forcing, we can't delete
	for aud, pipelines := range configs {
		if util.AudienceEquals(aud, req.Audience) {
			return fmt.Errorf("cannot delete audience, it is in use by pipeline(s) %s", strings.Join(pipelines, ", "))
		}
	}

	pipelines, ok := configs[req.Audience]
	if ok {
		return fmt.Errorf("audience is in use by pipeline '%s', cannot delete", pipelines)
	}

	return s.deleteAudienceKey(ctx, req.Audience)
}

func (s *Store) deleteAudienceKey(ctx context.Context, aud *protos.Audience) error {
	// Delete audience from bucket
	audStr := util.AudienceToStr(aud)
	if err := s.options.RedisBackend.Del(ctx, NATSAudienceKey(audStr)).Err(); err != nil {
		return errors.Wrap(err, "error deleting audience from store")
	}

	return nil
}

func (s *Store) GetConfig(ctx context.Context) (map[*protos.Audience][]string, error) {
	cfgs := make(map[*protos.Audience][]string)

	audienceKeys, err := s.options.RedisBackend.Keys(ctx, NATSConfigBucket+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching config keys from store")
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

	// Fetch all live keys from store
	keys, err := s.options.RedisBackend.Keys(ctx, NATSLiveBucket+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching live keys from store")
	}

	// key is of the format:
	//
	// <sessionID>:<nodeName>:<<service>:<operation_type>:<operation_name>:<component_name>>
	// OR
	// <sessionID>:<nodeName>:register

	for _, key := range keys {
		parts := strings.SplitN(strings.TrimPrefix(NATSLiveBucket+":", key), ":", 3)

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

			registerData, err := s.options.RedisBackend.Get(ctx, key).Result()
			if err != nil {
				return nil, errors.Wrapf(err, "error fetching register data for live key '%s'", key)
			}

			clientInfo := &protos.ClientInfo{}
			if err := proto.Unmarshal([]byte(registerData), clientInfo); err != nil {
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

func (s *Store) GetAttachCommandsByService(ctx context.Context, serviceName string) ([]*protos.Command, error) {
	cmds := make([]*protos.Command, 0)

	keys, err := s.options.RedisBackend.Keys(ctx, NATSConfigBucket+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching config keys from store")
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
	data, err := s.options.RedisBackend.Get(ctx, NATSNotificationConfigKey(req.NotificationId)).Result()
	if err != nil {
		return nil, errors.Wrapf(err, "error fetching notification config '%s' from store", req.NotificationId)
	}

	// Decrypt data
	decrypted, err := s.options.Encryption.Decrypt([]byte(data))
	if err != nil {
		return nil, errors.Wrapf(err, "error decrypting notification config '%s'", req.NotificationId)
	}

	cfg := &protos.NotificationConfig{}
	if err := proto.Unmarshal(decrypted, cfg); err != nil {
		return nil, errors.Wrapf(err, "error unmarshaling notification config '%s'", req.NotificationId)
	}

	return cfg, nil
}

func (s *Store) GetNotificationConfigs(ctx context.Context) (map[string]*protos.NotificationConfig, error) {
	notificationConfigs := make(map[string]*protos.NotificationConfig)

	keys, err := s.options.RedisBackend.Keys(ctx, NATSNotificationConfigBucket+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching notification config keys from store")
	}

	for _, key := range keys {
		data, err := s.options.RedisBackend.Get(ctx, key).Result()
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching notification config '%s' from store", key)
		}

		// Decrypt data
		decrypted, err := s.options.Encryption.Decrypt([]byte(data))
		if err != nil {
			return nil, errors.Wrapf(err, "error decrypting notification config '%s'", key)
		}

		notificationConfig := &protos.NotificationConfig{}
		if err := proto.Unmarshal(decrypted, notificationConfig); err != nil {
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

	// Encrypt data
	data, err = s.options.Encryption.Encrypt(data)
	if err != nil {
		return errors.Wrap(err, "error encrypting notification config")
	}

	key := NATSNotificationConfigKey(*req.Notification.Id)
	if err := s.options.RedisBackend.Set(ctx, key, data, 0).Err(); err != nil {
		return errors.Wrap(err, "error saving notification config to store")
	}

	return nil
}
func (s *Store) UpdateNotificationConfig(ctx context.Context, req *protos.UpdateNotificationRequest) error {
	if err := s.fillSensitiveFields(ctx, req); err != nil {
		return errors.Wrap(err, "error filling sensitive fields")
	}

	data, err := proto.Marshal(req.Notification)
	if err != nil {
		return errors.Wrap(err, "error marshaling notification config")
	}

	// Encrypt data
	data, err = s.options.Encryption.Encrypt(data)
	if err != nil {
		return errors.Wrap(err, "error encrypting notification config")
	}

	key := NATSNotificationConfigKey(*req.Notification.Id)
	if err := s.options.RedisBackend.Set(ctx, key, data, 0).Err(); err != nil {
		return errors.Wrap(err, "error saving notification config to store")
	}

	return nil
}

// fillSensitiveFields fills in any sensitive fields that were not provided in the request, assuming
// that the notification type has not changed.
func (s *Store) fillSensitiveFields(ctx context.Context, req *protos.UpdateNotificationRequest) error {
	existing, err := s.GetNotificationConfig(ctx, &protos.GetNotificationRequest{NotificationId: *req.Notification.Id})
	if err != nil {
		return errors.Wrap(err, "error fetching existing notification config")
	}

	// If the notification type changed, we don't need to fill in any sensitive fields, the user will have done that
	if req.Notification.Type != existing.Type {
		return nil
	}

	switch req.Notification.Type {
	case protos.NotificationType_NOTIFICATION_TYPE_EMAIL:
		email := req.Notification.GetEmail()
		switch email.Type {
		case protos.NotificationEmail_TYPE_SMTP:
			smtp := email.GetSmtp()
			if smtp.Password == "" {
				smtp.Password = existing.GetEmail().GetSmtp().GetPassword()
			}
		case protos.NotificationEmail_TYPE_SES:
			ses := email.GetSes()
			if ses.SesSecretAccessKey == "" {
				ses.SesSecretAccessKey = existing.GetEmail().GetSes().SesSecretAccessKey
			}
		}
	case protos.NotificationType_NOTIFICATION_TYPE_PAGERDUTY:
		pd := req.Notification.GetPagerduty()
		if pd.Token == "" {
			pd.Token = existing.GetPagerduty().Token
		}
	case protos.NotificationType_NOTIFICATION_TYPE_SLACK:
		slack := req.Notification.GetSlack()
		if slack.BotToken == "" {
			slack.BotToken = existing.GetSlack().BotToken
		}
	}

	return nil
}

func (s *Store) DeleteNotificationConfig(ctx context.Context, req *protos.DeleteNotificationRequest) error {
	configKey := NATSNotificationConfigKey(req.NotificationId)
	if err := s.options.RedisBackend.Del(ctx, configKey).Err(); err != nil {
		return errors.Wrap(err, "error deleting notification config from store")
	}

	// Delete all associations with pipelines
	keys, err := s.options.RedisBackend.Keys(ctx, NATSNotificationAssocBucket+":*").Result()
	if err != nil {
		return errors.Wrap(err, "error fetching notification assoc keys from store")
	}

	for _, key := range keys {
		if !strings.HasSuffix(key, ":"+req.NotificationId) {
			continue
		}

		if err := s.options.RedisBackend.Del(ctx, key).Err(); err != nil {
			return errors.Wrap(err, "error deleting notification association from store")
		}
	}

	return nil
}

func (s *Store) AttachNotificationConfig(ctx context.Context, req *protos.AttachNotificationRequest) error {
	key := NATSNotificationAssocKey(req.PipelineId, req.NotificationId)
	if err := s.options.RedisBackend.Set(ctx, key, []byte(``), 0).Err(); err != nil {
		return errors.Wrap(err, "error saving notification association to store")
	}

	return nil
}

func (s *Store) DetachNotificationConfig(ctx context.Context, req *protos.DetachNotificationRequest) error {
	key := NATSNotificationAssocKey(req.PipelineId, req.NotificationId)
	if err := s.options.RedisBackend.Del(ctx, key).Err(); err != nil {
		return errors.Wrap(err, "error deleting notification association from store")
	}

	return nil
}

func (s *Store) GetNotificationConfigsByPipeline(ctx context.Context, pipelineID string) ([]*protos.NotificationConfig, error) {
	cfgs := make([]*protos.NotificationConfig, 0)

	// Fetch all notify config keys from store
	keys, err := s.options.RedisBackend.Keys(ctx, NATSNotificationAssocBucket).Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching notify config keys from store")
	}

	for _, key := range keys {
		if !strings.HasPrefix(key, pipelineID+":") {
			continue
		}

		parts := strings.Split(strings.Trim(NATSNotificationAssocBucket+":", key), ":")
		if len(parts) != 2 {
			return nil, errors.Errorf("invalid notify config key '%s'", key)
		}

		configID := parts[1]

		// Fetch key so we get the notify config
		data, err := s.options.RedisBackend.Get(ctx, NATSNotificationConfigKey(configID)).Result()
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching notify config key '%s' from store", configID)
		}

		decrypted, err := s.options.Encryption.Decrypt([]byte(data))
		if err != nil {
			return nil, errors.Wrapf(err, "error decrypting notification config '%s'", configID)
		}

		notifyConfig := &protos.NotificationConfig{}
		if err := proto.Unmarshal(decrypted, notifyConfig); err != nil {
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

	if o.RedisBackend == nil {
		return errors.New("RedisBackend backend cannot be nil")
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

	keys, err := s.options.RedisBackend.Keys(ctx, NATSAudienceBucket+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching audience keys from store")
	}

	for _, key := range keys {
		key = strings.TrimPrefix(NATSAudienceBucket+":", key)
		aud := util.AudienceFromStr(key)
		if aud == nil {
			return nil, errors.Errorf("invalid audience key '%s'", key)
		}

		audiences = append(audiences, aud)
	}

	return audiences, nil
}

func (s *Store) GetPaused(ctx context.Context) (map[string]*types.PausedEntry, error) {
	keys, err := s.options.RedisBackend.Keys(ctx, NATSPausedBucket).Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching paused keys from store")
	}

	paused := make(map[string]*types.PausedEntry)

	for _, key := range keys {
		entry := &types.PausedEntry{
			Key:        key,
			Audience:   nil,
			PipelineID: "",
		}

		parts := strings.SplitN(strings.Trim(NATSPausedBucket+":", key), ":", 2)
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

	if err := s.options.RedisBackend.Get(ctx, key).Err(); err != nil {
		if err == redis.Nil {
			return false, nil
		}

		return false, errors.Wrap(err, "error fetching pipeline attachment from store")
	}

	return true, nil
}

type PipelineUsage struct {
	PipelineId string
	Active     bool
	NodeName   string
	SessionId  string
	Audience   *protos.Audience
}

// GetPipelineUsage gets usage across the entire cluster
func (s *Store) GetPipelineUsage(ctx context.Context) ([]*PipelineUsage, error) {
	pipelines := make([]*PipelineUsage, 0)

	// Get config for all pipelines & audiences
	cfgs, err := s.GetConfig(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting configs")
	}

	// No cfgs == no pipelines
	if len(cfgs) == 0 {
		return pipelines, nil
	}

	// Get live clients
	live, err := s.GetLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting live audiences")
	}

	// Build list of all used pipelines
	for aud, pipelineIDs := range cfgs {
		for _, pid := range pipelineIDs {
			pu := &PipelineUsage{
				PipelineId: pid,
				Audience:   aud,
			}

			// Check if this pipeline is "active"
			for _, l := range live {
				if util.AudienceEquals(l.Audience, aud) {
					pu.Active = true
					pu.NodeName = l.NodeName
					pu.SessionId = l.SessionID
				}
			}

			pipelines = append(pipelines, pu)
		}
	}

	return pipelines, nil
}

// GetActivePipelineUsage gets *ACTIVE* pipeline usage on the CURRENT node
// NOTE: This method is a helper for GetPipelineUsage().
func (s *Store) GetActivePipelineUsage(ctx context.Context, pipelineID string) ([]*PipelineUsage, error) {
	usage, err := s.GetPipelineUsage(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting pipeline usage")
	}

	active := make([]*PipelineUsage, 0)

	for _, u := range usage {
		if !u.Active {
			continue
		}

		if u.NodeName != s.options.NodeName {
			continue
		}

		if u.PipelineId != pipelineID {
			continue
		}

		active = append(active, u)
	}

	return active, nil
}
