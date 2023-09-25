package deps

import (
	"context"
	"os"
	"time"

	"github.com/InVisionApp/go-health/v2"
	gllogrus "github.com/InVisionApp/go-logger/shims/logrus"
	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"

	"github.com/streamdal/snitch-server/backends/cache"
	"github.com/streamdal/snitch-server/config"
	"github.com/streamdal/snitch-server/services/bus"
	"github.com/streamdal/snitch-server/services/cmd"
	"github.com/streamdal/snitch-server/services/encryption"
	"github.com/streamdal/snitch-server/services/kv"
	"github.com/streamdal/snitch-server/services/metrics"
	"github.com/streamdal/snitch-server/services/notify"
	"github.com/streamdal/snitch-server/services/pubsub"
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
	RedisBackend *redis.Client

	// Services
	BusService        bus.IBus
	NotifyService     notify.INotifier
	MetricsService    metrics.IMetrics
	StoreService      store.IStore
	CmdService        cmd.ICmd
	KVService         kv.IKV
	PubSubService     pubsub.IPubSub
	EncryptionService encryption.IEncryption
	Health            health.IHealth
	ShutdownContext   context.Context
	ShutdownFunc      context.CancelFunc
}

func New(cfg *config.Config) (*Dependencies, error) {
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

	return d, nil
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

	// Redis backend
	// TODO: config
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisURL,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDatabase,
		Protocol: 3,
	})

	if err := client.ClientInfo(d.ShutdownContext).Err(); err != nil {
		return errors.Wrap(err, "unable to connect to redis")
	}

	d.RedisBackend = client

	return nil
}

func (d *Dependencies) setupServices(cfg *config.Config) error {
	encryptionService, err := encryption.New(cfg.AesKey)
	if err != nil {
		return errors.Wrap(err, "unable to create new encryption service")
	}
	d.EncryptionService = encryptionService

	c, err := cmd.New()
	if err != nil {
		return errors.Wrap(err, "unable to create new command service")
	}

	d.CmdService = c

	metricsService, err := metrics.New(&metrics.Config{
		RedisBackend: d.RedisBackend,
		ShutdownCtx:  d.ShutdownContext,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create new metrics service")
	}
	d.MetricsService = metricsService

	storeService, err := store.New(&store.Options{
		RedisBackend: d.RedisBackend,
		ShutdownCtx:  d.ShutdownContext,
		NodeName:     cfg.NodeName,
		SessionTTL:   cfg.SessionTTL,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create new store service")
	}

	d.StoreService = storeService

	d.PubSubService = pubsub.New()

	busService, err := bus.New(&bus.Options{
		Store:        storeService,
		RedisBackend: d.RedisBackend,
		Cmd:          d.CmdService,
		NodeName:     d.Config.NodeName,
		ShutdownCtx:  d.ShutdownContext,
		WASMDir:      d.Config.WASMDir,
		Metrics:      d.MetricsService,
		PubSub:       d.PubSubService,
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
		RedisBackend: d.RedisBackend,
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
