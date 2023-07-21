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

We need to store `CommandResponse.SetPipeline` commands. We need this in order
to be able to send pipelines to newly connected SDKs.

* NATS:
	* We store these commands as serialized protobuf in the `pipelines` bucket
	* The 'key' is the `id` that can be found in `CommandResponse.SetPipeline`
	* The value is the serialized protobuf of `CommandResponse.SetPipeline`
* Cache:
	* Commands are stored in key "pipeline:$id" where $id is the `id` in
	  `SetPipeline` protobuf.
	* Value is deserialized protobuf of `CommandResponse.SetPipeline`

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
	CachePipelinePrefix     = "pipeline"
	CacheHeartbeatPrefix    = "heartbeat"
	CacheHeartbeatEntryTTL  = time.Minute

	NATSRegistrationsBucket = "snitch_registrations"
	NATSHeartbeatBucket     = "snitch_heartbeats"
	NATSHeartbeatBucketTTL  = time.Minute
)

type IStore interface {
	AddRegistration(ctx context.Context, req *protos.RegisterRequest) error
	DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error
	AddHeartbeat(ctx context.Context, req *protos.HeartbeatRequest) error
	// AddPipeline
	// DeletePipeline
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

	if err := s.NATSBackend.Put(ctx, NATSRegistrationsBucket, req.ServiceName, data); err != nil {
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
	if err := s.NATSBackend.Delete(ctx, NATSRegistrationsBucket, req.ServiceName); err != nil {
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
