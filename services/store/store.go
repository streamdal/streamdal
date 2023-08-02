package store

import (
	"context"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/backends/cache"
	"github.com/streamdal/snitch-server/validate"
)

/*

`store` is a service that handles storage and retrieval of data such as service
registrations and service commands.

On READ, it performs lookups by first looking in in-memory cache and if not
present, it will attempt to fetch the data from NATS K/V.

On WRITE, it will write to both in-memory cache and NATS K/V.

On DELETE, it will delete from both in-memory cache and NATS k/V.

### Registrations / Services & Heartbeats

* NATS:
	* We need to have a list of all currently connected/active services
	* We store the service name in the `registrations` bucket
	* The 'key' is the service name
	* The value is serialized protobuf of `RegisterRequest`
	* When a deregistration occurs, we delete the key from `registrations` bucket
* Cache:
	* Registrations are stored in key "registration:$service_name"
	* Value is deserialized protobuf of `RegisterRequest`

### Commands

We need to store `Command.SetPipeline` commands. We need this in order
to be able to send pipelines to newly connected SDKs.

* NATS:
	* We store these commands as serialized protobuf in the `pipelines` bucket
	* The 'key' is the `id` that can be found in `Command.SetPipeline`
	* The value is the serialized protobuf of `Command.SetPipeline`
* Cache:
	* Commands are stored in key "pipeline:$id" where $id is the `id` in
	  `SetPipeline` protobuf.
	* Value is deserialized protobuf of `Command.SetPipeline`

### Heartbeats

We need to store the last heartbeat for each service, consumer and producer.
This data is used to determine if a component is still "alive" and whethes
changes in the UI will take effect.

* NATS:
	* We store the last heartbeat in the `heartbeats` bucket
	* The key is the service name
	* The value is the serialized protobuf of `Heartbeat`
	* `heartbeat` bucket has a 60s TTL (ie. keys are automatically deleted
	  if not written to/refreshed within 60s)
* Cache:
	* Heartbeats are stored under key `heartbeat:$service_name`
	* Value is deserialized protobuf of latest `Heartbeat`
	* `heartbeat:$service_name` keys have a TTL of 60s (ie. keys are
      automatically deleted if not written to/refreshed within 60s)
*/

const (
	CacheRegistrationPrefix = "registration"
	CachePipelinesPrefix    = "pipeline"
	CacheHeartbeatPrefix    = "heartbeat"
	CacheHeartbeatEntryTTL  = time.Minute

	NATSRegistrationBucket = "snitch_registrations"
	NATSHeartbeatBucket    = "snitch_heartbeats"
	NATSPipelinesBucket    = "snitch_pipelines"
	NATSHeartbeatBucketTTL = time.Minute
)

type IStore interface {
	AddRegistration(ctx context.Context, req *protos.RegisterRequest) error
	DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error
	AddHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error
	GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error)
	GetPipeline(ctx context.Context, pipelineId string) (*protos.Pipeline, error)
}

type Store struct {
	NATSBackend  natty.INatty
	CacheBackend cache.ICache
	ShutdownCtx  context.Context
	log          *logrus.Entry
}

func New(shutdownCtx context.Context, cacheBackend cache.ICache, natsBackend natty.INatty) (*Store, error) {
	return &Store{
		ShutdownCtx:  shutdownCtx,
		CacheBackend: cacheBackend,
		NATSBackend:  natsBackend,
		log:          logrus.WithField("pkg", "store"),
	}, nil
}

func (s *Store) AddRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	llog := s.log.WithField("method", "AddRegistration")
	llog.Debug("received request to add registration")

	if err := validate.RegisterRequest(req); err != nil {
		return errors.Wrap(err, "error validating request")
	}

	llog = llog.WithField("service_name", req.ServiceName)

	// Add to cache
	llog.Debug("attempting to write service to cache")
	s.CacheBackend.Set(CacheRegistrationPrefix+":"+req.ServiceName, req)

	// Add to K/V
	llog.Debug("attempting to write service to NATS")

	data, err := proto.Marshal(req)
	if err != nil {
		llog.WithError(err).Error("error marshaling protobuf")
		return errors.Wrap(err, "error marshaling protobuf")
	}

	if err := s.NATSBackend.Put(ctx, NATSRegistrationBucket, req.ServiceName, data); err != nil {
		return errors.Wrap(err, "error writing to K/V")
	}

	return nil
}

func (s *Store) DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error {
	if err := validate.DeregisterRequest(req); err != nil {
		return errors.Wrap(err, "error validating request")
	}

	// Remove from cache
	s.CacheBackend.Remove(CacheRegistrationPrefix + ":" + req.ServiceName)

	// Remove from K/V
	if err := s.NATSBackend.Delete(ctx, NATSRegistrationBucket, req.ServiceName); err != nil {
		return errors.Wrap(err, "error deleting from K/V")
	}

	return nil
}

func (s *Store) AddHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error {
	if err := validate.HeartbeatRequest(req); err != nil {
		return errors.Wrap(err, "error validating request")
	}

	// Set in cache
	s.CacheBackend.Set(CacheHeartbeatPrefix+":"+req.Audience.ServiceName, req, CacheHeartbeatEntryTTL)

	// Set in K/V
	data, err := proto.Marshal(req)
	if err != nil {
		return errors.Wrap(err, "error marshaling protobuf")
	}

	if err := s.NATSBackend.Put(ctx, NATSHeartbeatBucket, req.Audience.ServiceName, data, NATSHeartbeatBucketTTL); err != nil {
		return errors.Wrap(err, "error writing to K/V")
	}

	return nil
}

func (s *Store) GetPipelines(ctx context.Context) (map[string]*protos.Pipeline, error) {
	ids, err := s.NATSBackend.Keys(ctx, NATSPipelinesBucket)
	if err != nil {
		return nil, errors.Wrap(err, "unable to fetch pipeline id's from NATS")
	}

	pipelines := make(map[string]*protos.Pipeline)

	for _, id := range ids {
		// Attempt to fetch each p1 from cache
		p1, ok := s.CacheBackend.Get(CachePipelinesPrefix + ":" + id)
		if ok {
			pipelines[id] = p1.(*protos.Pipeline)
			continue
		}

		// Not in cache, attempt to fetch from NATS
		data, err := s.NATSBackend.Get(ctx, NATSPipelinesBucket, id)
		if err != nil {
			return nil, errors.Wrapf(err, "unable to fetch pipeline '%s' from NATS", id)
		}

		// Pipeline found, try to unmarshal
		p2 := &protos.Pipeline{}

		if err := proto.Unmarshal(data, p2); err != nil {
			return nil, errors.Wrapf(err, "unable to unmarshal pipeline id '%s'", id)
		}

		// Now that we have grabbed it from NATS, put it in cache
		s.CacheBackend.Set(CachePipelinesPrefix+":"+id, p2)

		// And lastly, add to map
		pipelines[id] = p2
	}

	return pipelines, nil
}

func (s *Store) GetPipeline(ctx context.Context, pipelineId string) (*protos.Pipeline, error) {
	panic("implement")
}
