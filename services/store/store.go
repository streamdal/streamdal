package store

import (
	"context"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"

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

* Registrations / Services & Heartbeats
	* NATS:
		* We need to have a list of all currently connected/active services
		* We store the service name in the `registrations` bucket
		* The 'key' is the service name
		* The value is unused
		* When a deregistration occurs, we delete the key from `registrations` bucket
	* Cache:
		* Registrations are stored in map[string]string under key "registrations"
		* The map key is the service name; the value is unused
* Commands
	* We need to store `CommandResponse.SetPipeline` commands. We need this in
	  order to be able to send pipelines to newly connected SDKs.
	* NATS:
		* We store these commands as serialized protobuf in the `pipelines` bucket
		* The 'key' is the `id` that can be found in `CommandResponse.SetPipeline`
		* The value is the serialized protobuf of `CommandResponse.SetPipeline`
	* Cache:
		* Commands are stored in map[string]protos.CommandResponse under the key
		  "pipelines". The value in the map is _de_serialized protobuf.
* Heartbeats
	* We need to store the last heartbeat for each service, consumer and producer.
	  This data is used to determine if a component is still "alive" and whether
	  changes in the UI will take effect.
	* NATS:
		* We store the last heartbeat in the `heartbeats` bucket
		* The key is the service name
		* The value is the serialized protobuf of `Heartbeat`
	* Cache:
		* We store the last heartbeats under the key called "heartbeats"
		* The value is of type map[string]protos.HeartbeatRequest where the key
		  in the map is the service name and the value is _de_serialized protobuf

*/

type IStore interface {
	AddRegistration(ctx context.Context, req *protos.RegisterRequest) error
	DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error
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
	if err := s.CacheBackend.Set()

	// Add to K/V
	llog.Debug("attemptiong to write service to NATS")

	return nil
}

func (s *Store) DeleteRegistration(ctx context.Context, req *protos.DeregisterRequest) error {
	// Remove from cache

	// Remove from K/V

	return nil
}
