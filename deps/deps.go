package deps

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/InVisionApp/go-health/v2"
	gllogrus "github.com/InVisionApp/go-logger/shims/logrus"
	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/natty"

	"github.com/streamdal/snitch-server/backends/cache"
	"github.com/streamdal/snitch-server/config"
	"github.com/streamdal/snitch-server/services/bus"
	"github.com/streamdal/snitch-server/services/cmd"
	"github.com/streamdal/snitch-server/services/kv"
	"github.com/streamdal/snitch-server/services/metrics"
	"github.com/streamdal/snitch-server/services/notify"
	"github.com/streamdal/snitch-server/services/store"
	"github.com/streamdal/snitch-server/wasm"
)

const (
	DefaultHealthCheckIntervalSecs = 1
)

type customCheck struct{}

type Dependencies struct {
	Config *config.Config

	// Backends
	CacheBackend cache.ICache
	NATSBackend  natty.INatty

	// Services
	BusService      bus.IBus
	NotifyService   notify.INotifier
	MetricsService  metrics.IMetrics
	StoreService    store.IStore
	CmdService      cmd.ICmd
	KVService       kv.IKV
	Health          health.IHealth
	ShutdownContext context.Context
	ShutdownFunc    context.CancelFunc
}

func New(version string, cfg *config.Config) (*Dependencies, error) {
	gohealth := health.New()
	gohealth.Logger = gllogrus.New(nil)

	if cfg == nil {
		return nil, errors.New("config cannot be nil")
	}

	ctx, cancel := context.WithCancel(context.Background())

	d := &Dependencies{
		Config:          cfg,
		Health:          gohealth,
		ShutdownContext: ctx,
		ShutdownFunc:    cancel,
	}

	if err := d.validateWASM(); err != nil {
		return nil, errors.Wrap(err, "unable to validate WASM")
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

	if err := d.preCreateBuckets(); err != nil {
		return nil, errors.Wrap(err, "unable to pre-create buckets in NATS")
	}

	return d, nil
}

func (d *Dependencies) preCreateBuckets() error {
	buckets := map[string]time.Duration{
		store.NATSAudienceBucket:           0,
		store.NATSLiveBucket:               d.Config.SessionTTL,
		store.NATSPipelineBucket:           0,
		store.NATSPausedBucket:             0,
		store.NATSNotificationConfigBucket: 0,
		store.NATSNotificationAssocBucket:  0,
	}

	for bucketName, ttl := range buckets {
		if err := d.NATSBackend.CreateBucket(d.ShutdownContext, bucketName, ttl, d.Config.NATSNumKVReplicas); err != nil {
			if err == nats.ErrStreamNameAlreadyInUse {
				continue
			}

			return fmt.Errorf("unable to pre-create bucket '%s': %s", bucketName, err)
		}
	}

	return nil
}

func (d *Dependencies) validateWASM() error {
	// Lame... means that tests need to be ran through `make test`
	if os.Getenv("TEST") != "" {
		os.Chdir("../..")
	}

	for name, mapping := range wasm.Config {
		if mapping.Filename == "" {
			return errors.Errorf("wasm.Config[%s].Filename cannot be empty", name)
		}

		if mapping.FuncName == "" {
			return errors.Errorf("wasm.Config[%s].FuncName cannot be empty", name)
		}

		// Check if the file exists
		fullPath := d.Config.WASMDir + "/" + mapping.Filename

		if _, err := os.Stat(fullPath); err != nil {
			return errors.Wrapf(err, "unable to stat wasm file '%s'", fullPath)
		}

		// Just in case, try to load it as well
		if _, err := wasm.Load(name, d.Config.WASMDir); err != nil {
			return errors.Wrapf(err, "unable to load wasm file '%s'", name)
		}
	}

	return nil
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
		Logger:            logrus.WithField("pkg", "natty"),
	})

	if err != nil {
		return errors.Wrap(err, "unable to create new store backend")
	}

	d.NATSBackend = n

	return nil
}

func (d *Dependencies) setupServices(cfg *config.Config) error {
	c, err := cmd.New()
	if err != nil {
		return errors.Wrap(err, "unable to create new command service")
	}

	d.CmdService = c

	metricsService, err := metrics.New(&metrics.Config{
		NATSBackend: d.NATSBackend,
		ShutdownCtx: d.ShutdownContext,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create new metrics service")
	}
	d.MetricsService = metricsService

	storeService, err := store.New(&store.Options{
		NATSBackend: d.NATSBackend,
		ShutdownCtx: d.ShutdownContext,
		NodeName:    cfg.NodeName,
		SessionTTL:  cfg.SessionTTL,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create new store service")
	}

	d.StoreService = storeService

	busService, err := bus.New(&bus.Options{
		Store:       storeService,
		NATS:        d.NATSBackend,
		Cmd:         d.CmdService,
		NodeName:    d.Config.NodeName,
		ShutdownCtx: d.ShutdownContext,
		WASMDir:     d.Config.WASMDir,
		Metrics:     d.MetricsService,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create new bus service")
	}

	d.BusService = busService

	notifyService, err := notify.New(&notify.Config{
		Store:       storeService,
		ShutdownCtx: d.ShutdownContext,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create new notify service")
	}

	d.NotifyService = notifyService

	kvService, err := kv.New(&kv.Options{
		NATS:        d.NATSBackend,
		NumReplicas: cfg.NATSNumKVReplicas,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create new kv service")
	}

	d.KVService = kvService

	return nil
}

// Status satisfies the go-health.ICheckable interface
func (c *customCheck) Status() (interface{}, error) {
	if false {
		return nil, errors.New("something major just broke")
	}

	// You can return additional information pertaining to the check as long
	// as it can be JSON marshalled
	return map[string]int{}, nil
}
