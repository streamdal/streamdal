package store

import (
	"context"

	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/backends/cache"
)

type IStore interface {
	SaveRegistration(ctx context.Context, req *protos.RegisterRequest) error
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

func (s *Store) SaveRegistration(ctx context.Context, req *protos.RegisterRequest) error {
	s.log.Debugf("saving registration: %v", req)
	return nil
}
