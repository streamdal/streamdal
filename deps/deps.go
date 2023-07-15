package deps

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"time"

	"github.com/InVisionApp/go-health/v2"
	gllogrus "github.com/InVisionApp/go-logger/shims/logrus"
	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/streamdal/natty"

	"github.com/streamdal/snitch-server/backends/cache"
	"github.com/streamdal/snitch-server/config"
)

const (
	DefaultHealthCheckIntervalSecs = 1
)

type customCheck struct{}

type Dependencies struct {
	Version string
	Config  *config.Config

	// Backends
	CacheBackend cache.ICache
	NATSBackend  natty.INatty

	// Services
	// ConsumerService consumer.IConsumer
	Health         health.IHealth
	DefaultContext context.Context
}

func New(version string, cfg *config.Config) (*Dependencies, error) {
	gohealth := health.New()
	gohealth.Logger = gllogrus.New(nil)

	if cfg == nil {
		return nil, errors.New("config cannot be nil")
	}

	d := &Dependencies{
		Version:        version,
		Config:         cfg,
		Health:         gohealth,
		DefaultContext: context.Background(),
	}

	if err := d.setupHealthChecks(); err != nil {
		return nil, errors.Wrap(err, "unable to setup health check(s)")
	}

	if err := d.Health.Start(); err != nil {
		return nil, errors.Wrap(err, "unable to start health runner")
	}

	if err := d.setupBackends(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to setup backends")
	}

	if err := d.setupServices(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to setup services")
	}

	return d, nil
}

func (d *Dependencies) setupHealthChecks() error {
	cc := &customCheck{}

	err := d.Health.AddChecks([]*health.Config{
		{
			Name:     "health-check",
			Checker:  cc,
			Interval: time.Duration(DefaultHealthCheckIntervalSecs) * time.Second,
			Fatal:    true,
		},
	})

	if err != nil {
		return err
	}

	return nil
}

func (d *Dependencies) setupBackends(cfg *config.Config) error {
	// CacheBackend k/v store
	cb, err := cache.New()
	if err != nil {
		return errors.Wrap(err, "unable to create new cache instance")
	}

	d.CacheBackend = cb

	// NATS backend
	n, err := natty.New(&natty.Config{
		NatsURL:           cfg.NATSURL,
		UseTLS:            cfg.NATSUseTLS,
		TLSCACertFile:     cfg.NATSTLSCaFile,
		TLSClientCertFile: cfg.NATSTLSCertFile,
		TLSClientKeyFile:  cfg.NATSTLSKeyFile,
	})

	if err != nil {
		return errors.Wrap(err, "unable to create new nats backend")
	}

	d.NATSBackend = n

	return nil
}

func (d *Dependencies) setupServices(cfg *config.Config) error {
	return nil
}

func createTLSConfig(caCert, clientCert, clientKey string) (*tls.Config, error) {
	cert, err := tls.X509KeyPair([]byte(clientCert), []byte(clientKey))
	if err != nil {
		return nil, errors.Wrap(err, "unable to load cert + key")
	}

	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM([]byte(caCert))

	return &tls.Config{
		Certificates: []tls.Certificate{cert},
		RootCAs:      caCertPool,
	}, nil
}

// Satisfy the go-health.ICheckable interface
func (c *customCheck) Status() (interface{}, error) {
	if false {
		return nil, errors.New("something major just broke")
	}

	// You can return additional information pertaining to the check as long
	// as it can be JSON marshalled
	return map[string]int{}, nil
}

func (d *Dependencies) PreCreateBuckets(ctx context.Context, cfg *config.Config) error {
	buckets := map[string]time.Duration{
		//BucketNameHere:      0,
	}

	for bucketName, ttl := range buckets {
		if err := d.NATSBackend.CreateBucket(ctx, bucketName, ttl, cfg.NATSNumBucketReplicas); err != nil {
			if err == nats.ErrStreamNameAlreadyInUse {
				continue
			}

			return fmt.Errorf("unable to create bucket '%s': %s", bucketName, err)
		}
	}

	return nil
}
