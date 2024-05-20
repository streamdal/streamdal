package store

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"

	telTypes "github.com/streamdal/streamdal/apps/server/types"

	"github.com/cactus/go-statsd-client/v5/statsd"

	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	"github.com/streamdal/streamdal/apps/server/services/encryption"
	"github.com/streamdal/streamdal/apps/server/services/store/types"
	"github.com/streamdal/streamdal/apps/server/util"
	"github.com/streamdal/streamdal/apps/server/validate"
)

/*

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Storage strategy is defined here:

https://www.notion.so/streamdal/server-Storage-Spec-417bfa71f04b481082373ad18cbdb0e9

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

`store` is a service that handles storage and retrieval of data such as service
registrations and service commands.

`store` is backed by a `natty.INatty` instance, which is a wrapper for RedisBackend.

All reads, writes and deletes are performed via RedisBackend -- server does NOT
store any persistent state in memory!
*/

var (
	ErrPipelineNotFound = errors.New("pipeline not found")
	ErrConfigNotFound   = errors.New("config not found")
	ErrMustExist        = errors.New("object does not exist and MustExist is set")
	ErrNoOverwrite      = errors.New("object exists and NoOverwrite is set")
)

const (
	// RedisKeyWatchPrefix is the key under which redis publishes key events.
	// The format is  __keyspace@{$database_number}__
	// We're always defaulting to db 0, so we can use this prefix to watch for key changes
	// See https://redis.io/docs/manual/keyspace-notifications/
	RedisKeyWatchPrefix = "__keyspace@0__:"

	// InstallIDKey is a unique ID for this streamdal server cluster
	// Each cluster will get a unique UUID. This is used to track the number of
	// installs for telemetry and is completely random for anonymization purposes.
	InstallIDKey = "streamdal_install_id"

	RedisCreationDateKey = "streamdal_settings:creation_date"
)

type IStore interface {
	AddRegistration(ctx context.Context, req *protos.RegisterRequest) error
	DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error
	RecordRegistration(ctx context.Context, req *protos.RegisterRequest) error
	SeenRegistration(ctx context.Context, req *protos.RegisterRequest) bool
	GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error)
	GetPipeline(ctx context.Context, pipelineID string) (*protos.Pipeline, error)
	GetAudienceMappings(ctx context.Context) (map[*protos.Audience]*protos.PipelineConfigs, error)
	GetPipelineConfigsByAudience(ctx context.Context, aud *protos.Audience) (*protos.PipelineConfigs, error)
	GetLive(ctx context.Context) ([]*types.LiveEntry, error)
	CreatePipeline(ctx context.Context, pipeline *protos.Pipeline) error
	AddAudience(ctx context.Context, req *protos.NewAudienceRequest) error

	// CreateAudience creates a new audience in the store. This method differs
	// from AddAudience() in that it does not create any live entry.
	CreateAudience(ctx context.Context, aud *protos.Audience) error
	DeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) error
	DeletePipeline(ctx context.Context, pipelineID string) error
	UpdatePipeline(ctx context.Context, pipeline *protos.Pipeline) error
	SetPauseResume(ctx context.Context, audience *protos.Audience, pipelineID string, pause bool) (bool, error)
	GetAudiences(ctx context.Context) ([]*protos.Audience, error)
	GetNotificationConfig(ctx context.Context, req *protos.GetNotificationRequest) (*protos.NotificationConfig, error)
	GetNotificationConfigs(ctx context.Context) (map[string]*protos.NotificationConfig, error)
	CreateNotificationConfig(ctx context.Context, req *protos.CreateNotificationRequest) error
	UpdateNotificationConfig(ctx context.Context, req *protos.UpdateNotificationRequest) error
	DeleteNotificationConfig(ctx context.Context, req *protos.DeleteNotificationRequest) error
	GetPipelineUsage(ctx context.Context) ([]*PipelineUsage, error)
	GetActivePipelineUsage(ctx context.Context, pipelineID string) ([]*PipelineUsage, error)
	GetActiveTailCommandsByService(ctx context.Context, serviceName string) ([]*protos.Command, error)
	AddActiveTailRequest(ctx context.Context, req *protos.TailRequest) (string, error) // Returns key that tail req is stored under

	// GetAudiencesBySessionID returns all audiences for a given session id
	// This is needed to inject an inferschema pipeline for each announced audience
	// to the session via a goroutine in internal.Register()
	GetAudiencesBySessionID(ctx context.Context, sessionID string) ([]*protos.Audience, error)

	GetAudiencesByService(ctx context.Context, serviceName string) ([]*protos.Audience, error)

	// WatchKeys will watch for key changes for given key pattern; every time key
	// is updated, it will send a message on the return channel.
	// WatchKeys launches a dedicated goroutine for the watch - it can be stopped
	// via the provided context.
	WatchKeys(quitCtx context.Context, key string) chan struct{}

	AddSchema(ctx context.Context, req *protos.SendSchemaRequest) error

	GetSchema(ctx context.Context, aud *protos.Audience) (*protos.Schema, error)

	// GetInstallID returns the unique ID for this server cluster.
	// If an ID has not been set yet, a new one is generated and returned
	GetInstallID(ctx context.Context) (string, error)

	// GetCreationDate returns the creation date of this server cluster. This is used
	// for sending server_timestamp_created_seconds metric to telemetry
	GetCreationDate(ctx context.Context) (int64, error)

	// SetCreationDate sets the creation date of this server cluster
	SetCreationDate(ctx context.Context, ts int64) error

	// IsPipelineAttachedAny returns if pipeline is attached to any audience. Used for telemetry tags
	IsPipelineAttachedAny(ctx context.Context, pipelineID string) bool

	// PauseTailRequest pauses a tail request by its ID
	PauseTailRequest(ctx context.Context, req *protos.PauseTailRequest) (*protos.TailRequest, error)

	// ResumeTailRequest resumes a tail request by its ID
	ResumeTailRequest(ctx context.Context, req *protos.ResumeTailRequest) (*protos.TailRequest, error)

	// GetTailRequestById returns a TailRequest by its ID
	GetTailRequestById(ctx context.Context, tailID string) (*protos.TailRequest, error)

	// SetPipelines saves pipelines as SetPipelinesConfig json to $audience key in store
	SetPipelines(ctx context.Context, req *protos.SetPipelinesRequest) error

	// GetSetPipelinesCommandsByService returns a slice of SetPipelines commands for a given service
	GetSetPipelinesCommandsByService(ctx context.Context, serviceName string) ([]*protos.Command, error)

	// GetSessionIDs returns a slice of ALL known session ids;
	// accepts an optional "node name" to filter by.
	GetSessionIDs(ctx context.Context, nodeName ...string) ([]string, error)

	// GetSessionIDsByAudience returns a slice of session IDs for a given audience;
	// accepts an optional "node name" to filter by.
	GetSessionIDsByAudience(ctx context.Context, aud *protos.Audience, nodeName ...string) ([]string, error)

	// GetSessionIDsByPipelineID returns a slice of session IDs that use a pipeline ID
	GetSessionIDsByPipelineID(ctx context.Context, pipelineID string) ([]string, error)

	// GetPipelinesByAudience will fetch pipeline configs and then use the ID to
	// fetch the actual pipeline from store + update the paused state.
	GetPipelinesByAudience(ctx context.Context, aud *protos.Audience) ([]*protos.Pipeline, error)

	// DeletePipelineConfig deletes a pipeline config for all audiences that use
	// given pipeline ID; it will return a list of audiences that the pipeline id
	// was used by.
	DeletePipelineConfig(ctx context.Context, pipelineID string) ([]*protos.Audience, error)

	// GetAudiencesByPipelineID returns a slice of audiences that use a pipeline ID
	GetAudiencesByPipelineID(ctx context.Context, pipelineID string) ([]*protos.Audience, error)

	// BEGIN Wasm-related methods
	GetAllWasm(ctx context.Context) ([]*shared.WasmModule, error)
	GetWasm(ctx context.Context, name, id string) (*shared.WasmModule, error)
	GetWasmByID(ctx context.Context, id string) (*shared.WasmModule, error)
	GetWasmByName(ctx context.Context, name string) (*shared.WasmModule, error)
	SetWasm(ctx context.Context, id, name string, wasm *shared.WasmModule) error
	SetWasmByName(ctx context.Context, name string, wasm *shared.WasmModule) error
	SetWasmByID(ctx context.Context, id string, wasm *shared.WasmModule) error
	DeleteWasm(ctx context.Context, id, name string) error
	DeleteWasmByID(ctx context.Context, id string) error
	DeleteWasmByName(ctx context.Context, name string) error
	// END Wasm-related methods

	// GetPipelinesByWasmID returns a slice of pipelines that use a given Wasm ID
	GetPipelinesByWasmID(ctx context.Context, wasmID string) ([]*protos.Pipeline, error)

	// SessionIDExistsOnNode checks given session ID and node name against live
	// entries in Redis and returns true if found. This is used by
	SessionIDExistsOnNode(ctx context.Context, sessionID, node string) (bool, error)
}

// Option contains settings that can influence read, write or delete operations.
//
// NOTE: Redis transactions do NOT function like "traditional" txns as there is
// no concept of a "rollback" or "commit". Txns in redis are essentially
// grouped commands that are executed atomically. Due to this, Options currently
// does not support TXNs and there is a _small_ potential for races.
//
// See: https://redis.io/docs/interact/transactions/
// See: https://redis.com/blog/you-dont-need-transaction-rollbacks-in-redis/
type Option struct {
	// When set, the store will NOT overwrite an existing object. Applies to write().
	NoOverwrite bool

	// When set, the store will ensure that the object exists before performing
	// the operation. Applies to write() and delete(). NOTE: MustExist
	// and MustNotExist are mutually exclusive.
	MustExist bool

	// Optional TTL to set on the key. Applies to write().
	TTL time.Duration
}

// Generic read method; will use optional transaction if provided (will only use
// the first transaction provided).
func (s *Store) read(ctx context.Context, key string, option ...*Option) ([]byte, error) {
	if key == "" {
		return nil, errors.New("key is required")
	}

	data, err := s.options.RedisBackend.Get(ctx, key).Bytes()
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (s *Store) write(ctx context.Context, key string, value []byte, option ...*Option) error {
	if key == "" {
		return errors.New("key is required")
	}

	var (
		exists bool
		ttl    time.Duration
	)

	// If MustExist is set, check if the object exists
	if len(option) > 0 && option[0] != nil {
		if option[0].MustExist {
			_, err := s.read(ctx, key, option[0])
			if err != nil {
				if err == redis.Nil {
					return ErrMustExist
				}

				return errors.Wrap(err, "unable to read object from redis")
			}

			// Object exists
			exists = true
		}

		if option[0].NoOverwrite && exists {
			return ErrNoOverwrite
		}

		if option[0].TTL > 0 {
			ttl = option[0].TTL
		}
	}

	// Safe toi write object
	if err := s.options.RedisBackend.Set(ctx, key, value, ttl).Err(); err != nil {
		return errors.Wrap(err, "unable to write object to redis")
	}

	return nil
}

func (s *Store) delete(ctx context.Context, key string, option ...*Option) error {
	if key == "" {
		return errors.New("key is required")
	}

	if len(option) > 0 && option[0] != nil {
		// If MustExist is specified, first read object to make sure it exists
		if option[0].MustExist {
			_, err := s.read(ctx, key, option[0])
			if err != nil {
				if err == redis.Nil {
					return ErrMustExist
				}

				return errors.Wrap(err, "unable to read object from redis for delete operation with MustExist option")
			}
		}
	}

	// Can safely delete
	if err := s.options.RedisBackend.Del(ctx, key).Err(); err != nil {
		return errors.Wrap(err, "unable to delete object from redis")
	}

	return nil
}

func (s *Store) DeletePipelineConfig(ctx context.Context, pipelineID string) ([]*protos.Audience, error) {
	llog := s.log.WithField("method", "DeletePipelineConfigsByPipelineID")
	llog.Debug("received request to delete pipeline configs by pipeline ID")

	// Fetch all pipeline configs
	pipelineConfigs, err := s.GetAudienceMappings(ctx)
	if err != nil {
		llog.Errorf("unable to fetch pipeline configs: %s", err)
		return nil, errors.Wrap(err, "error fetching pipeline configs")
	}

	newPipelineConfigs := make(map[*protos.Audience]*protos.PipelineConfigs)
	audiences := make([]*protos.Audience, 0)

	// Build a new pipeline config for each audience that uses the pipeline ID,
	// skipping over pipeline ID that we want to delete
	for aud, configs := range pipelineConfigs {
		for _, cfg := range configs.Configs {
			if cfg.Id == pipelineID {
				continue
			}

			if _, ok := newPipelineConfigs[aud]; !ok {
				newPipelineConfigs[aud] = &protos.PipelineConfigs{
					Configs: make([]*protos.PipelineConfig, 0),
				}
			}

			newPipelineConfigs[aud].Configs = append(newPipelineConfigs[aud].Configs, cfg)
			audiences = append(audiences, aud)
		}
	}

	// Save the new pipeline configs
	if err := s.savePipelineConfigs(ctx, newPipelineConfigs); err != nil {
		llog.Errorf("unable to save new pipeline configs: %s", err)
		return nil, errors.Wrap(err, "error saving new pipeline configs")
	}

	return audiences, nil
}

func (s *Store) savePipelineConfigs(ctx context.Context, pipelineConfigs map[*protos.Audience]*protos.PipelineConfigs) error {
	llog := s.log.WithField("method", "savePipelineConfigs")
	llog.Debug("received request to save pipeline configs")

	for aud, cfgs := range pipelineConfigs {
		data, err := proto.Marshal(cfgs)
		if err != nil {
			return errors.Wrap(err, "error encoding pipeline configs")
		}

		if err := s.options.RedisBackend.Set(ctx, RedisAudienceKey(util.AudienceToStr(aud)), data, 0).Err(); err != nil {
			return errors.Wrapf(err, "error saving pipeline to store in key '%s'", RedisAudienceKey(util.AudienceToStr(aud)))
		}
	}

	return nil
}

func (s *Store) GetSessionIDsByPipelineID(ctx context.Context, pipelineID string) ([]string, error) {
	llog := s.log.WithField("method", "GetSessionIDsByPipelineID")
	llog.Debug("received request to get session IDs by pipeline ID")

	// Get live usage
	usage, err := s.GetActivePipelineUsage(ctx, pipelineID)
	if err != nil {
		llog.Errorf("unable to fetch active pipeline usage: %s", err)
		return nil, errors.Wrap(err, "error fetching active pipeline usage")
	}

	sessionIDs := make([]string, 0)

	for _, u := range usage {
		if u.PipelineId == pipelineID {
			sessionIDs = append(sessionIDs, u.SessionId)
		}
	}

	return sessionIDs, nil
}

func (s *Store) GetAudiencesByPipelineID(ctx context.Context, pipelineID string) ([]*protos.Audience, error) {
	llog := s.log.WithField("method", "GetAudiencesByPipelineID")
	llog.Debug("received request to get audiences by pipeline ID")

	// Get all pipeline configs
	pipelineConfigs, err := s.GetAudienceMappings(ctx)
	if err != nil {
		llog.Errorf("unable to fetch pipeline configs: %s", err)
		return nil, errors.Wrap(err, "error fetching pipeline configs")
	}

	audiences := make([]*protos.Audience, 0)

	for aud, cfg := range pipelineConfigs {
		for _, pc := range cfg.Configs {
			if pc.Id == pipelineID {
				audiences = append(audiences, aud)
			}
		}
	}

	return audiences, nil
}

func (s *Store) SessionIDExistsOnNode(ctx context.Context, sessionID, node string) (bool, error) {
	llog := s.log.WithField("method", "GetSessionIDsByAudience")
	llog.Debug("received request to get session IDs by audience")

	if sessionID == "" {
		return false, errors.New("session ID is required")
	}

	if node == "" {
		return false, errors.New("node name is required")
	}

	liveEntries, err := s.GetLive(ctx)
	if err != nil {
		llog.Errorf("unable to fetch live entries: %s", err)
		return false, errors.Wrap(err, "error fetching live entries")
	}

	for _, l := range liveEntries {
		if l.SessionID == sessionID && l.NodeName == node {
			return true, nil
		}
	}

	return false, nil
}

func (s *Store) GetSessionIDsByAudience(ctx context.Context, aud *protos.Audience, nodeName ...string) ([]string, error) {
	llog := s.log.WithField("method", "GetSessionIDsByAudience")
	llog.Debug("received request to get session IDs by audience")

	if err := validate.Audience(aud); err != nil {
		llog.Errorf("invalid audience: %s", err)
		return nil, errors.Wrap(err, "error validating audience")
	}

	liveEntries, err := s.GetLive(ctx)
	if err != nil {
		llog.Errorf("unable to fetch live entries: %s", err)
		return nil, errors.Wrap(err, "error fetching live entries")
	}

	sessionIDs := make([]string, 0)

	for _, e := range liveEntries {
		if len(nodeName) > 0 && e.NodeName != nodeName[0] {
			continue
		}

		// Either same node or node was not specified
		if util.AudienceEquals(aud, e.Audience) {
			sessionIDs = append(sessionIDs, e.SessionID)
			continue
		}
	}

	return sessionIDs, nil
}

type Options struct {
	Encryption   encryption.IEncryption
	RedisBackend *redis.Client
	ShutdownCtx  context.Context
	NodeName     string
	SessionTTL   time.Duration
	Telemetry    statsd.Statter
	InstallID    string
}

type Store struct {
	options *Options
	log     *logrus.Entry
}

func New(opts *Options) (*Store, error) {
	if err := opts.validate(); err != nil {
		return nil, errors.Wrap(err, "error validating options")
	}

	// https://redis.io/docs/manual/keyspace-notifications/
	// Set redis to publish "set" events, we need this for heartbeat detection
	opts.RedisBackend.ConfigSet(opts.ShutdownCtx, "notify-keyspace-events", "KEAs")

	return &Store{
		options: opts,
		log:     logrus.WithField("pkg", "store"),
	}, nil
}

func (s *Store) AddRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	llog := s.log.WithField("method", "AddRegistration")
	llog.Debug("received request to add registration")

	registrationKey := RedisLiveKey(req.SessionId, s.options.NodeName, "register")

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

func (s *Store) SeenRegistration(ctx context.Context, req *protos.RegisterRequest) bool {
	registrationKey := RedisLiveKey(req.SessionId, s.options.NodeName, "register")

	return s.options.RedisBackend.Exists(ctx, registrationKey).Val() == 1
}

func (s *Store) RecordRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	registrationKey := RedisTelemetryRegistrationKey(
		req.ServiceName,
		req.ClientInfo.Os,
		req.ClientInfo.LibraryName,
		req.ClientInfo.Arch,
	)

	req.ClientInfo.XSessionId = &req.SessionId
	req.ClientInfo.XServiceName = &req.ServiceName
	req.ClientInfo.XNodeName = &s.options.NodeName

	clientInfoBytes, err := proto.Marshal(req.ClientInfo)
	if err != nil {
		return errors.Wrap(err, "error marshalling client info")
	}

	status := s.options.RedisBackend.Set(ctx, registrationKey, clientInfoBytes, s.options.SessionTTL)
	if err := status.Err(); err != nil {
		return errors.Wrap(err, "error record permanent registration to K/V")
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
		if err := s.options.RedisBackend.Del(ctx, e.Key).Err(); err != nil {
			s.log.Errorf("unable to remove key '%s' from K/V", e.Key)
		}
	}

	return nil
}

func (s *Store) GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error) {
	llog := s.log.WithField("method", "GetPipelines")
	llog.Debug("received request to get pipelines")

	keys, err := s.options.RedisBackend.Keys(ctx, RedisPipelinePrefix+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching pipeline keys from store")
	}

	// k == pipelineId
	pipelines := make(map[string]*protos.Pipeline)

	for _, key := range keys {
		pipelineData, err := s.options.RedisBackend.Get(ctx, key).Result()
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching pipeline '%s' from store", key)
		}

		pipeline := &protos.Pipeline{}

		if err := proto.Unmarshal([]byte(pipelineData), pipeline); err != nil {
			return nil, errors.Wrapf(err, "error unmarshaling pipeline '%s'", key)
		}

		pipelines[pipeline.Id] = pipeline
	}

	return pipelines, nil
}

func (s *Store) GetPipeline(ctx context.Context, pipelineId string) (*protos.Pipeline, error) {
	llog := s.log.WithField("method", "GetPipeline")
	llog.Debug("received request to get pipeline")

	pipelineData, err := s.options.RedisBackend.Get(ctx, RedisPipelineKey(pipelineId)).Result()
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

func (s *Store) SetPipelines(ctx context.Context, req *protos.SetPipelinesRequest) error {
	llog := s.log.WithField("method", "SetPipelines")
	llog.Debugf("received request to save pipelines for audience '%s'", util.AudienceToStr(req.Audience))

	// Validate req
	if err := validate.SetPipelinesRequest(req); err != nil {
		return errors.Wrap(err, "error validating request in store.SetPipelines()")
	}

	llog.Debugf("Requested to save audience '%s' with CreatedBy: '%s'", util.AudienceToStr(req.Audience), req.GetXCreatedBy())

	pipelineConfigs := &protos.PipelineConfigs{
		Configs:    make([]*protos.PipelineConfig, 0),
		XCreatedBy: req.XCreatedBy,
	}

	// Convert pipelines to pipeline config entries
	for _, id := range req.PipelineIds {
		cfg := &protos.PipelineConfig{
			Id:                 id,
			Paused:             false,
			CreatedAtUnixTsUtc: time.Now().UTC().Unix(),
		}

		pipelineConfigs.Configs = append(pipelineConfigs.Configs, cfg)
	}

	// !!!!!!!!!!!!!!!!!!!!!!!!! IMPORTANT !!!!!!!!!!!!!!!!!!!!!!!!!! //
	// 																  //
	// An empty protobuf var will be marshalled to nil. This is why   //
	// we set XIsEmpty to true - to ensure that non-nil protobuf is   //
	//                          saved!		       					  //
	//																  //
	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

	if len(pipelineConfigs.Configs) == 0 {
		pipelineConfigs.XIsEmpty = proto.Bool(true)
	}

	data, err := proto.Marshal(pipelineConfigs)
	if err != nil {
		return errors.Wrap(err, "error encoding pipeline configs")
	}

	// Save to K/V
	key := RedisAudienceKey(util.AudienceToStr(req.Audience))

	if err := s.options.RedisBackend.Set(ctx, key, data, 0).Err(); err != nil {
		return errors.Wrapf(err, "error saving pipeline to store in key '%s'", key)
	}

	return nil
}

func (s *Store) CreatePipeline(ctx context.Context, pipeline *protos.Pipeline) error {
	llog := s.log.WithField("method", "CreatePipeline")
	llog.Debug("received request to create pipeline")

	applyPipelineDefaults(pipeline)

	// Save to K/V
	pipelineData, err := proto.Marshal(pipeline)
	if err != nil {
		return errors.Wrap(err, "error serializing pipeline to protobuf")
	}

	if err := s.options.RedisBackend.Set(ctx, RedisPipelineKey(pipeline.Id), pipelineData, 0).Err(); err != nil {
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

	if err := s.options.RedisBackend.Del(ctx, RedisPipelineKey(pipelineId)).Err(); err != nil {
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

	if err := s.options.RedisBackend.Set(ctx, RedisPipelineKey(pipeline.Id), pipelineData, 0).Err(); err != nil {
		return errors.Wrap(err, "error saving pipeline to store")
	}

	return nil
}

// SetPauseResume sets pipeline pause status
func (s *Store) SetPauseResume(ctx context.Context, audience *protos.Audience, pipelineID string, paused bool) (bool, error) {
	llog := s.log.WithField("method", "setPause")
	llog.Debug("received request to set pause")

	// Does this pipeline exist?
	if _, err := s.GetPipeline(ctx, pipelineID); err != nil {
		return false, errors.Wrap(err, "error fetching pipeline")
	}

	// Fetch pipeline config for this audience
	key := RedisAudienceKey(util.AudienceToStr(audience))

	pipelineConfigsData, err := s.options.RedisBackend.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return false, ErrConfigNotFound
		}

		return false, errors.Wrapf(err, "error fetching pipeline config under key '%s'", key)
	}

	pipelineConfigs := &protos.PipelineConfigs{}

	if err := proto.Unmarshal([]byte(pipelineConfigsData), pipelineConfigs); err != nil {
		return false, errors.Wrap(err, "error unmarshalling pipeline config")
	}

	var updated bool

	for i, cfg := range pipelineConfigs.Configs {
		if cfg.Id == pipelineID {
			updated = true
			pipelineConfigs.Configs[i].Paused = paused
		}
	}

	// If configs were updated, we need to save them back to K/V (broadcasting change should occur on the caller)
	if updated {
		data, err := proto.Marshal(pipelineConfigs)
		if err != nil {
			return false, errors.Wrap(err, "error serializing pipeline configs")
		}

		if err := s.options.RedisBackend.Set(ctx, RedisAudienceKey(util.AudienceToStr(audience)), data, 0).Err(); err != nil {
			return false, errors.Wrap(err, "error saving updated pipelines to store")
		}
	}

	return updated, nil
}

func (s *Store) sendAudienceTelemetry(ctx context.Context, aud *protos.Audience, val int64) {
	if aud == nil {
		return
	}

	// Unique services
	serviceKeys := s.options.RedisBackend.Keys(ctx, RedisAudiencePrefix+":"+aud.ServiceName+":*").Val()
	if len(serviceKeys) == 0 {
		// Completely new audience, send telemetry
		_ = s.options.Telemetry.GaugeDelta(telTypes.GaugeUsageNumServices, val, 1.0, statsd.Tag{"install_id", s.options.InstallID})
	}

	dataSourceKeys := s.options.RedisBackend.Keys(ctx, RedisAudiencePrefix+"*:*:*:"+aud.ComponentName+":*").Val()
	if len(dataSourceKeys) == 0 {
		// Completely new data source, send telemetry
		_ = s.options.Telemetry.GaugeDelta(telTypes.GaugeUsageNumDataSources, val, 1.0, statsd.Tag{"install_id", s.options.InstallID})
	}

	audExists := s.options.RedisBackend.Exists(ctx, RedisTelemetryAudience(aud)).Val() == 1

	if audExists && val < 0 || !audExists && val > 0 {
		if aud.OperationType == protos.OperationType_OPERATION_TYPE_PRODUCER {
			_ = s.options.Telemetry.GaugeDelta(telTypes.GaugeUsageNumProducers, val, 1.0, statsd.Tag{"install_id", s.options.InstallID})
		} else if aud.OperationType == protos.OperationType_OPERATION_TYPE_CONSUMER {
			_ = s.options.Telemetry.GaugeDelta(telTypes.GaugeUsageNumConsumers, val, 1.0, statsd.Tag{"install_id", s.options.InstallID})
		}
	}
}

func (s *Store) AddAudience(ctx context.Context, req *protos.NewAudienceRequest) error {
	if req == nil {
		return errors.New("request cannot be nil")
	}

	// Add live key (or update and reset TTL)
	if err := s.options.RedisBackend.Set(
		ctx,
		RedisLiveKey(req.SessionId, s.options.NodeName, util.AudienceToStr(req.Audience)),
		[]byte(``),
		s.options.SessionTTL,
	).Err(); err != nil {
		return errors.Wrap(err, "error saving audience to store")
	}

	// Create empty pipeline configs that will be saved to K/V under streamdal_audience:$audStr
	pipelineConfigs := &protos.PipelineConfigs{
		Configs:  make([]*protos.PipelineConfig, 0),
		XIsEmpty: proto.Bool(true),
	}

	data, err := proto.Marshal(pipelineConfigs)
	if err != nil {
		return errors.Wrap(err, "error serializing pipeline configs")
	}

	if err := s.options.RedisBackend.SetArgs(
		ctx,
		RedisAudienceKey(util.AudienceToStr(req.Audience)),
		data,
		redis.SetArgs{
			Mode: "NX",
		},
	).Err(); err != nil {
		if errors.Is(err, redis.Nil) {
			// Key already exists, nothing to do
			return nil
		}

		return errors.Wrap(err, "error saving audience to store")
	}

	s.log.Debugf("successfully setnx for aud '%s'", util.AudienceToStr(req.Audience))

	s.sendAudienceTelemetry(ctx, req.Audience, 1)

	return nil
}

func (s *Store) CreateAudience(ctx context.Context, aud *protos.Audience) error {
	pipelineConfigs := &protos.PipelineConfigs{}
	data, err := proto.Marshal(pipelineConfigs)
	if err != nil {
		return errors.Wrap(err, "error marshaling pipeline config")
	}

	if err := s.options.RedisBackend.SetArgs(
		ctx,
		RedisAudienceKey(util.AudienceToStr(aud)),
		data,
		redis.SetArgs{
			Mode: "NX",
		},
	).Err(); err != nil {
		if errors.Is(err, redis.Nil) {
			// Key already exists, nothing to do
			return nil
		}

		return errors.Wrap(err, "error saving audience to store")
	}

	// BEGIN CreatedBy hack
	if aud.GetXCreatedBy() != "" {
		s.log.Debugf("detected created_by for audience '%s' set to '%s' - saving to store",
			util.AudienceToStr(aud), aud.GetXCreatedBy())

		createdByKey := RedisAudienceCreatedByKey(util.AudienceToStr(aud), aud.GetXCreatedBy())

		if err := s.options.RedisBackend.Set(ctx, createdByKey, nil, 0).Err(); err != nil {
			return fmt.Errorf("error saving created_by audience '%s' to store: %s", createdByKey, err)
		}
	}
	// END CreatedBy hack

	s.sendAudienceTelemetry(ctx, aud, 1)

	return nil
}

func (s *Store) DeleteAudience(ctx context.Context, req *protos.DeleteAudienceRequest) error {
	llog := s.log.WithField("method", "DeleteAudience")
	llog.Debug("received request to delete audience")

	// Check if there are any pipelineConfigs audiences
	pipelineConfigs, err := s.GetPipelineConfigsByAudience(ctx, req.Audience)
	if err != nil {
		return errors.Wrapf(err, "error fetching configs for audience '%s'", util.AudienceToStr(req.Audience))
	}

	if len(pipelineConfigs.Configs) > 0 && !req.GetForce() {
		err = fmt.Errorf("audience '%s' has one or more pipelineConfigs pipelines - cannot delete", util.AudienceToStr(req.Audience))

		return err
	}

	// We can delete - either force is specified or there are no pipelineConfigs pipelines
	audStr := util.AudienceToStr(req.Audience)

	if err := s.options.RedisBackend.Del(ctx, RedisAudienceKey(audStr)).Err(); err != nil {
		return errors.Wrap(err, "error deleting audience from store")
	}

	// BEGIN CreatedBy hack -- do not leave any dangling created_by keys when an audience is deleted
	createdByKeys, err := s.options.RedisBackend.Keys(ctx, RedisAudienceCreatedByKey(audStr, "*")).Result()
	if err != nil {
		return errors.Wrap(err, "error fetching created_by keys")
	}

	for _, key := range createdByKeys {
		s.log.Debugf("deleting created by key '%s'", key)

		if err := s.options.RedisBackend.Del(ctx, key).Err(); err != nil {
			return errors.Wrapf(err, "error deleting created_by key '%s'", key)
		}
	}
	// END CreatedBy hack

	// Send Analytics
	s.sendAudienceTelemetry(ctx, req.Audience, -1)

	return nil
}

// GetAudienceMappings returns all audience -> *protos.PipelineConfigs assignments
func (s *Store) GetAudienceMappings(ctx context.Context) (map[*protos.Audience]*protos.PipelineConfigs, error) {
	cfgs := make(map[*protos.Audience]*protos.PipelineConfigs)

	audienceKeys, err := s.options.RedisBackend.Keys(ctx, RedisAudiencePrefix+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching config keys from store")
	}

	if len(audienceKeys) == 0 {
		return cfgs, nil
	}

	for _, audStrFull := range audienceKeys {
		// Get rid of prefix
		audStrWithoutPrefix := strings.TrimPrefix(audStrFull, RedisAudiencePrefix+":")

		// Good audience?
		aud := util.AudienceFromStr(audStrWithoutPrefix)
		if aud == nil {
			return nil, fmt.Errorf("unable to convert '%s' to audience", audStrWithoutPrefix)
		}

		// Fetch SetPipelinesConfig for each audience
		data, err := s.options.RedisBackend.Get(ctx, audStrFull).Result()
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching config '%s' from store", audStrFull)
		}

		pipelineConfigs := &protos.PipelineConfigs{}

		if err := proto.Unmarshal([]byte(data), pipelineConfigs); err != nil {
			return nil, errors.Wrapf(err, "error unmarshaling pipeline configs for audience '%s'", audStrFull)
		}

		if len(pipelineConfigs.Configs) == 0 {
			// s.log.Debugf("empty config for audience '%s' - nothing to do", audStrFull)
			continue
		}

		cfgs[aud] = pipelineConfigs
	}

	return cfgs, nil
}

func (s *Store) GetPipelinesByAudience(ctx context.Context, aud *protos.Audience) ([]*protos.Pipeline, error) {
	audStr := util.AudienceToStr(aud)
	if audStr == "" {
		return nil, fmt.Errorf("GetPipelineConfigsByAudience: failed to convert audience to str (audience: %+v)", aud)
	}

	pipelineConfigs, err := s.GetPipelineConfigsByAudience(ctx, aud)
	if err != nil {
		return nil, errors.Wrap(err, "error fetching pipeline configs by audience")
	}

	pipelines := make([]*protos.Pipeline, 0)

	for _, config := range pipelineConfigs.Configs {
		// Fetch pipeline
		pipeline, err := s.GetPipeline(ctx, config.Id)
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching pipeline '%s'", config.Id)
		}

		// Set paused status
		pipeline.XPaused = proto.Bool(config.Paused)

		pipelines = append(pipelines, pipeline)
	}

	return pipelines, nil
}

// GetPipelineConfigsByAudience returns *protos.PipelineConfigs for a given audience
// TODO: Need tests
func (s *Store) GetPipelineConfigsByAudience(ctx context.Context, aud *protos.Audience) (*protos.PipelineConfigs, error) {
	audStr := util.AudienceToStr(aud)
	if audStr == "" {
		return nil, fmt.Errorf("GetPipelineConfigsByAudience: failed to convert audience to str (audience: %+v)", aud)
	}

	pipelineConfigs := &protos.PipelineConfigs{
		Configs: make([]*protos.PipelineConfig, 0),
	}

	// Fetch all configs, return only single audience
	pipelineConfigsData, err := s.options.RedisBackend.Get(ctx, fmt.Sprintf(RedisAudienceKeyFormat, audStr)).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return pipelineConfigs, nil
		}

		return nil, errors.Wrapf(err, "GetPipelineConfigsByAudience: error fetching config '%s' from store", audStr)
	}

	// Unmarshal config, generate pipeline
	if err := proto.Unmarshal([]byte(pipelineConfigsData), pipelineConfigs); err != nil {
		return nil, errors.Wrapf(err, "GetPipelineConfigsByAudience: error unmarshaling pipelines config for audience '%s'", audStr)
	}

	return pipelineConfigs, nil
}

func (s *Store) GetLive(ctx context.Context) ([]*types.LiveEntry, error) {
	live := make([]*types.LiveEntry, 0)

	// Fetch all live keys from store
	keys, err := s.options.RedisBackend.Keys(ctx, RedisLivePrefix+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching live keys from store")
	}

	// key is of the format:
	//
	// <sessionID>:<nodeName>:<<service>:<operation_type>:<operation_name>:<component_name>>
	// OR
	// <sessionID>:<nodeName>:register

	for _, key := range keys {
		parts := strings.SplitN(strings.TrimPrefix(key, RedisLivePrefix+":"), ":", 3)

		if len(parts) != 3 {
			return nil, errors.Errorf("invalid live key '%s', parts: %d", key, len(parts))
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

func (s *Store) GetSetPipelinesCommandsByService(ctx context.Context, serviceName string) ([]*protos.Command, error) {
	llog := s.log.WithField("method", "GetSetPipelinesCommandsByService")
	llog.Debug("received request to get set pipelines commands by service")

	cmds := make([]*protos.Command, 0)

	allConfigs, err := s.GetAudienceMappings(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error fetching all configs")
	}

	for aud, perAudiencePipelines := range allConfigs {
		if aud.ServiceName != serviceName {
			continue
		}

		pipelines := make([]*protos.Pipeline, 0)

		// Build pipeline list using settings from config
		for _, p := range perAudiencePipelines.Configs {
			if p.GetPaused() {
				continue
			}

			pipeline, err := s.GetPipeline(ctx, p.Id)
			if err != nil {
				return nil, errors.Wrapf(err, "error fetching pipeline '%s'", p.Id)
			}

			pipelines = append(pipelines, pipeline)
		}

		cmds = append(cmds, &protos.Command{
			Audience: aud,
			Command: &protos.Command_SetPipelines{
				SetPipelines: &protos.SetPipelinesCommand{
					Pipelines: pipelines,
				},
			},
		})
	}

	llog.Debugf("returning %d commands for service '%s'", len(cmds), serviceName)

	return cmds, nil
}

func (s *Store) GetNotificationConfig(ctx context.Context, req *protos.GetNotificationRequest) (*protos.NotificationConfig, error) {
	data, err := s.options.RedisBackend.Get(ctx, RedisNotificationConfigKey(req.NotificationId)).Result()
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

	keys, err := s.options.RedisBackend.Keys(ctx, RedisNotificationConfigPrefix+":*").Result()
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

		notificationConfigs[notificationConfig.GetId()] = notificationConfig
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

	key := RedisNotificationConfigKey(*req.Notification.Id)
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

	key := RedisNotificationConfigKey(*req.Notification.Id)
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
	configKey := RedisNotificationConfigKey(req.NotificationId)
	if err := s.options.RedisBackend.Del(ctx, configKey).Err(); err != nil {
		return errors.Wrap(err, "error deleting notification config from store")
	}

	// Delete all associations with pipelines
	keys, err := s.options.RedisBackend.Keys(ctx, RedisNotificationAssocPrefix+":*").Result()
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

	if o.InstallID == "" {
		return errors.New("install ID cannot be empty")
	}

	return nil
}

func (s *Store) GetAudiences(ctx context.Context) ([]*protos.Audience, error) {
	audiences := make([]*protos.Audience, 0)

	keys, err := s.options.RedisBackend.Keys(ctx, RedisAudiencePrefix+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching audience keys from store")
	}

	for _, key := range keys {
		key = strings.TrimPrefix(key, RedisAudiencePrefix+":")
		aud := util.AudienceFromStr(key)
		if aud == nil {
			return nil, errors.Errorf("invalid audience key '%s'", key)
		}

		audiences = append(audiences, aud)
	}

	// BEGIN XCreatedBy hack -- used for injecting XCreatedBy into the returned audiences (used by k8s operator)
	createdByKeys, err := s.options.RedisBackend.Keys(ctx, RedisAudienceCreatedByPrefix+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching audience created_by keys from store")
	}

	for _, key := range createdByKeys {
		segments := strings.Split(key, ":")
		// Ex: streamdal_audience_created_by:$serviceName:$operationType:$operationName:$componentName:$createdBy
		if len(segments) != 6 {
			return nil, errors.Errorf("invalid audience created_by key '%s' (expected '6' segments, got '%d')",
				key, len(segments))
		}

		aud := util.AudienceFromStr(strings.Join(segments[1:5], ":"))
		if aud == nil {
			return nil, errors.Errorf("invalid audience key '%s'", key)
		}

		createdBy := segments[5]

		for _, a := range audiences {
			if util.AudienceEquals(a, aud) {
				a.XCreatedBy = proto.String(createdBy)
			}
		}
	}

	// END XCreatedBy hack

	return audiences, nil
}

func (s *Store) GetAudiencesByService(ctx context.Context, serviceName string) ([]*protos.Audience, error) {
	audiences := make([]*protos.Audience, 0)

	keys, err := s.options.RedisBackend.Keys(ctx, RedisAudiencePrefix+":"+serviceName+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching audience keys from store")
	}

	for _, key := range keys {
		key = strings.TrimPrefix(key, RedisAudiencePrefix+":")
		aud := util.AudienceFromStr(key)
		if aud == nil {
			return nil, errors.Errorf("invalid audience key '%s'", key)
		}

		audiences = append(audiences, aud)
	}

	return audiences, nil
}

func (s *Store) IsPipelineAttachedAny(ctx context.Context, pipelineID string) bool {
	llog := s.log.WithField("method", "IsPipelineAttachedAny")

	if pipelineID == "" {
		s.log.Errorf("bug? Passed an empty pipelineID to IsPipelineAttachedAny()")
		return false
	}

	// Get all configs
	cfgs, err := s.GetAudienceMappings(ctx)
	if err != nil {
		llog.Errorf("error getting all configs: %s", err)
		return false
	}

	// Loop through all configs, if pipelineID is found anywhere, return true
	for aud, pipelineConfigs := range cfgs {
		for _, pipeline := range pipelineConfigs.Configs {
			if pipeline.Id == pipelineID {
				llog.Debugf("pipeline '%s' is attached to audience '%s'", pipelineID, util.AudienceToStr(aud))
				return true
			}
		}
	}

	return false
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
	usage := make([]*PipelineUsage, 0)

	// Get config for all usage & audiences
	cfgs, err := s.GetAudienceMappings(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting configs")
	}

	// No cfgs == no usage
	if len(cfgs) == 0 {
		return usage, nil
	}

	// Get live clients
	live, err := s.GetLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting live audiences")
	}

	// Build list of all used usage
	for aud, pipelines := range cfgs {
		for _, p := range pipelines.Configs {
			pu := &PipelineUsage{
				PipelineId: p.Id,
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

			usage = append(usage, pu)
		}
	}

	return usage, nil
}

// GetSessionIDs will return ALL live session IDs; optionally filter by node name
func (s *Store) GetSessionIDs(ctx context.Context, nodeName ...string) ([]string, error) {
	entries, err := s.GetLive(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error getting live entries")
	}

	sessionIDs := make([]string, 0)

	for _, e := range entries {
		if len(nodeName) > 0 && e.NodeName != nodeName[0] {
			continue
		}

		sessionIDs = append(sessionIDs, e.SessionID)
	}

	return sessionIDs, nil
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

// WatchKeys will watch for key changes for given key pattern; every time key
// is updated, it will send a message on the return channel.
func (s *Store) WatchKeys(quitCtx context.Context, key string) chan struct{} {
	s.log.Infof("launching dedicated WatchKeys goroutine for key '%s'", key)

	ps := s.options.RedisBackend.PSubscribe(s.options.ShutdownCtx, RedisKeyWatchPrefix+key)

	// OK to buffer since the contents are so small
	keyChan := make(chan struct{}, 100_000)

	go func() {
		defer func() {
			if err := ps.Unsubscribe(s.options.ShutdownCtx, RedisKeyWatchPrefix+key); err != nil {
				s.log.Errorf("error unsubscribing from key '%s': %s", key, err)
			}
		}()

		for {
			select {
			case <-s.options.ShutdownCtx.Done():
				s.log.Debug("shutdown detected - exiting WatchKeys()")
				return
			case <-ps.Channel():
				keyChan <- struct{}{}
			case <-quitCtx.Done():
				s.log.Debug("quit detected - exiting WatchKeys()")
				return
			}
		}
	}()

	s.log.Infof("dedicated WatchKeys goroutine for key '%s' exiting", key)

	return keyChan
}

func (s *Store) GetSchema(ctx context.Context, aud *protos.Audience) (*protos.Schema, error) {
	audStr := util.AudienceToStr(aud)

	data, err := s.options.RedisBackend.Get(ctx, RedisSchemaKey(audStr)).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			// No schema yet, generate empty one
			return &protos.Schema{
				XVersion:   0,
				JsonSchema: []byte(`{"$schema":"http://json-schema.org/draft-07/schema#","properties":{},"required":[],"type":"object"}`),
			}, nil
		}
		return nil, errors.Wrapf(err, "error fetching schema for audience '%s'", audStr)
	}

	schema := &protos.Schema{}
	if err := proto.Unmarshal([]byte(data), schema); err != nil {
		return nil, errors.Wrapf(err, "error unmarshaling schema for audience '%s'", audStr)
	}

	return schema, nil
}

func (s *Store) AddSchema(ctx context.Context, req *protos.SendSchemaRequest) error {
	// Save to K/V
	schemaData, err := proto.Marshal(req.Schema)
	if err != nil {
		return errors.Wrap(err, "error serializing schema to protobuf")
	}

	key := RedisSchemaKey(util.AudienceToStr(req.Audience))
	if err := s.options.RedisBackend.Set(ctx, key, schemaData, 0).Err(); err != nil {
		return errors.Wrap(err, "error saving schema to store")
	}

	return nil
}

func (s *Store) GetAudiencesBySessionID(ctx context.Context, sessionID string) ([]*protos.Audience, error) {
	// Get audiences by session ID
	prefix := RedisLivePrefix + ":" + sessionID
	keys, err := s.options.RedisBackend.Keys(ctx, prefix+":*").Result()
	if err != nil {
		return nil, errors.Wrap(err, "error fetching live keys from store")
	}

	// Looking for format: <sessionID>:<nodeName>:<<service>:<operation_type>:<operation_name>:<component_name>>
	// Ignoring format: <sessionID>:<nodeName>:register

	live := make([]*protos.Audience, 0)
	for _, key := range keys {
		// Trim <sessionID>:<nodeName>: from key
		// Remaining key should just be <service>:<operation_type>:<operation_name>:<component_name>
		audStr := strings.TrimPrefix(key, prefix+":"+s.options.NodeName+":")
		parts := strings.Split(audStr, ":")
		if len(parts) != 4 {
			// This is a :registerKey, ignore these, we only want audiences
			continue
		}

		aud := util.AudienceFromStr(audStr)
		if aud == nil {
			return nil, errors.Errorf("invalid live key '%s'", key)
		}

		live = append(live, aud)
	}

	return live, nil
}

func (s *Store) GetInstallID(ctx context.Context) (string, error) {
	// Check cache first
	if s.options.InstallID != "" {
		return s.options.InstallID, nil
	}

	v, err := s.options.RedisBackend.Get(ctx, InstallIDKey).Result()
	if errors.Is(err, redis.Nil) {
		id, setErr := s.setStreamdalID(ctx)
		if setErr != nil {
			return "", setErr
		}
		return id, nil
	} else if err != nil {
		return "", errors.Wrap(err, "unable to query cluster ID")
	}

	return v, nil
}

func (s *Store) setStreamdalID(ctx context.Context) (string, error) {
	id, err := s.options.RedisBackend.Get(ctx, InstallIDKey).Result()
	if errors.Is(err, redis.Nil) {
		// Create new ID
		id := util.GenerateUUID()

		s.options.InstallID = id

		err := s.options.RedisBackend.Set(ctx, InstallIDKey, id, 0).Err()
		if err != nil {
			return "", errors.Wrap(err, "unable to set cluster ID")
		}

		s.log.Debugf("Set cluster ID '%s'", id)
		return id, nil
	} else if err != nil {
		return "", errors.Wrap(err, "unable to query cluster ID")
	}

	// Streamdal cluster ID already set
	return id, nil
}

func (s *Store) GetActiveTailCommandsByService(ctx context.Context, serviceName string) ([]*protos.Command, error) {
	tailCommands := make([]*protos.Command, 0)

	activeTailKeys, err := s.options.RedisBackend.Keys(ctx, RedisActiveTailPrefix+":"+serviceName+":*").Result()
	// No keys in redis
	if errors.Is(err, redis.Nil) {
		s.log.Debug("resume: no active tails found")
		return tailCommands, nil
	} else if err != nil {
		s.log.Errorf("resume: error fetching active tail keys from store: %s", err)
		return nil, errors.Wrap(err, "error fetching active tail keys from store")
	}

	s.log.Debugf("resume: found '%d' active tails", len(activeTailKeys))

	// Each key is an active tail - fetch each + decode
	for _, key := range activeTailKeys {
		encodedTailReq, err := s.options.RedisBackend.Get(ctx, key).Result()
		if err != nil {
			return nil, errors.Wrapf(err, "error fetching key '%s' from store", key)
		}

		// Attempt to decode
		tailRequest := &protos.TailRequest{}

		if err := proto.Unmarshal([]byte(encodedTailReq), tailRequest); err != nil {
			return nil, errors.Wrap(err, "error unmarshaling tail request")
		}

		if err := validate.StartTailRequest(tailRequest); err != nil {
			return nil, errors.Wrap(err, "error validating tail request")
		}

		// We shouldn't normally hit this - if we do, it's a bug - it means that
		// we are storing a tail command that is not actually a start command.
		if tailRequest.Type != protos.TailRequestType_TAIL_REQUEST_TYPE_START {
			s.log.Warningf("bug? active tail command for key '%s' should contain a start request type but contains '%s'",
				serviceName, tailRequest.Type.String())

			continue
		}

		tailCommands = append(tailCommands, &protos.Command{
			Audience: tailRequest.Audience,
			Command: &protos.Command_Tail{
				Tail: &protos.TailCommand{
					Request: tailRequest,
				},
			},
		})
	}

	return tailCommands, nil
}

func (s *Store) AddActiveTailRequest(ctx context.Context, req *protos.TailRequest) (string, error) {
	encodedReq, err := proto.Marshal(req)
	if err != nil {
		return "", errors.Wrap(err, "unable to marshal tail request")
	}

	tailKey := RedisActiveTailKey(req.Id)

	if err := s.options.RedisBackend.Set(ctx, tailKey, encodedReq, RedisActiveTailTTL).Err(); err != nil {
		return "", errors.Wrap(err, "unable to save tail request")
	}

	return tailKey, nil
}

func (s *Store) GetTailRequestById(ctx context.Context, tailID string) (*protos.TailRequest, error) {
	encodedReq, err := s.options.RedisBackend.Get(ctx, RedisActiveTailKey(tailID)).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, errors.Errorf("no tail request found for tail ID '%s'", tailID)
		}
		return nil, errors.Wrapf(err, "error fetching tail request '%s' from store", tailID)
	}

	// Attempt to decode
	tailRequest := &protos.TailRequest{}

	if err := proto.Unmarshal([]byte(encodedReq), tailRequest); err != nil {
		return nil, errors.Wrap(err, "error unmarshaling tail request")
	}

	return tailRequest, nil
}

func (s *Store) GetPausedTailRequestById(ctx context.Context, tailID string) (*protos.TailRequest, error) {
	encodedReq, err := s.options.RedisBackend.Get(ctx, RedisPausedTailKey(tailID)).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, errors.Errorf("no tail request found for tail ID '%s'", tailID)
		}
		return nil, errors.Wrapf(err, "error fetching tail request '%s' from store", tailID)
	}

	// Attempt to decode
	tailRequest := &protos.TailRequest{}

	if err := proto.Unmarshal([]byte(encodedReq), tailRequest); err != nil {
		return nil, errors.Wrap(err, "error unmarshaling tail request")
	}

	return tailRequest, nil
}

func (s *Store) PauseTailRequest(ctx context.Context, req *protos.PauseTailRequest) (*protos.TailRequest, error) {
	// Fetch tail request
	tailRequest, err := s.GetTailRequestById(ctx, req.TailId)
	if err != nil {
		return nil, errors.Wrap(err, "error fetching tail request")
	}

	// Delete tail request from active
	if err := s.options.RedisBackend.Del(ctx, RedisActiveTailKey(tailRequest.Id)).Err(); err != nil {
		return nil, errors.Wrap(err, "error deleting tail request")
	}

	data, err := proto.Marshal(tailRequest)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling tail request")
	}

	// Save to paused
	if err := s.options.RedisBackend.Set(ctx, RedisPausedTailKey(tailRequest.Id), data, 0).Err(); err != nil {
		return nil, errors.Wrap(err, "error saving paused tail request")
	}

	return tailRequest, nil
}

func (s *Store) ResumeTailRequest(ctx context.Context, req *protos.ResumeTailRequest) (*protos.TailRequest, error) {
	// Fetch tail request
	tailRequest, err := s.GetPausedTailRequestById(ctx, req.TailId)
	if err != nil {
		return nil, errors.Wrap(err, "error fetching tail request")
	}

	// Delete tail request from paused
	if err := s.options.RedisBackend.Del(ctx, RedisPausedTailKey(tailRequest.Id)).Err(); err != nil {
		return nil, errors.Wrap(err, "error deleting tail request")
	}

	// Save to active
	if _, err := s.AddActiveTailRequest(ctx, tailRequest); err != nil {
		return nil, errors.Wrap(err, "error saving active tail request")
	}

	return tailRequest, nil
}

func applyPipelineDefaults(pipeline *protos.Pipeline) {
	// Loop over steps and ensure negate is set for detective steps if it's nil
	// Rust will panic if it's not set
	for _, step := range pipeline.Steps {
		if d := step.GetDetective(); d != nil {
			if d.Negate == nil {
				d.Negate = proto.Bool(false)
			}
		}
	}
}

func (s *Store) GetCreationDate(ctx context.Context) (int64, error) {
	created := s.options.RedisBackend.Get(ctx, RedisCreationDateKey).Val()
	if created == "" {
		return 0, nil
	}

	createdTS, err := strconv.ParseInt(created, 10, 64)
	if err != nil {
		return 0, errors.Wrap(err, "unable to convert creation date to int")
	}

	return createdTS, nil
}

func (s *Store) SetCreationDate(ctx context.Context, ts int64) error {
	if err := s.options.RedisBackend.Set(ctx, RedisCreationDateKey, ts, 0).Err(); err != nil {
		return errors.Wrap(err, "unable to set creation date in store")
	}

	return nil
}

func (s *Store) GetPipelinesByWasmID(ctx context.Context, wasmID string) ([]*protos.Pipeline, error) {
	pipelines, err := s.GetPipelines(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "error fetching all pipelines in GetPipelinesByWasmID")
	}

	pipelinesWithWasmID := make([]*protos.Pipeline, 0)

	for _, p := range pipelines {
		for _, step := range p.Steps {
			if step.GetXWasmId() == wasmID {
				pipelinesWithWasmID = append(pipelinesWithWasmID, p)
			}
		}
	}

	return pipelinesWithWasmID, nil
}
