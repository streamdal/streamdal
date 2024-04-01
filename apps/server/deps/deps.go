package deps

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/InVisionApp/go-health/v2"
	gllogrus "github.com/InVisionApp/go-logger/shims/logrus"
	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/streamdal/apps/server/backends/cache"
	"github.com/streamdal/streamdal/apps/server/config"
	"github.com/streamdal/streamdal/apps/server/services/bus"
	"github.com/streamdal/streamdal/apps/server/services/cmd"
	"github.com/streamdal/streamdal/apps/server/services/encryption"
	"github.com/streamdal/streamdal/apps/server/services/kv"
	"github.com/streamdal/streamdal/apps/server/services/metrics"
	"github.com/streamdal/streamdal/apps/server/services/notify"
	"github.com/streamdal/streamdal/apps/server/services/pubsub"
	"github.com/streamdal/streamdal/apps/server/services/store"
	"github.com/streamdal/streamdal/apps/server/services/telemetry"
	"github.com/streamdal/streamdal/apps/server/services/wasm"
	"github.com/streamdal/streamdal/apps/server/types"
	"github.com/streamdal/streamdal/apps/server/util"
)

const (
	DefaultHealthCheckIntervalSecs = 1
	defaultHTTPListenAddress       = "http://localhost:8081"
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
	Telemetry         statsd.Statter
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

	installID, err := d.getInstallID(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to get install ID")
	}
	cfg.InstallID = installID
	cfg.NodeID = util.GenerateNodeID(installID, cfg.NodeName)

	if err := d.setupServices(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to setup services")
	}

	return d, nil
}

func (d *Dependencies) validateWASM() error {
	// Lame... means that tests need to have TEST=true env var set
	if os.Getenv("TEST") != "" {
		os.Chdir("../..")
	}

	for name, mapping := range wasm.Options {
		if mapping.Filename == "" {
			return errors.Errorf("wasm.Options[%s].Filename cannot be empty", name)
		}

		if mapping.FuncName == "" {
			return errors.Errorf("wasm.Options[%s].FuncName cannot be empty", name)
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
	if !d.Config.TelemetryDisable {
		t, err := statsd.NewClientWithConfig(&statsd.ClientConfig{
			Address:       cfg.TelemetryAddress,
			Prefix:        "streamdal",
			UseBuffered:   true,
			FlushInterval: time.Second,
			TagFormat:     statsd.InfixSemicolon,
		})
		if err != nil {
			return errors.Wrap(err, "unable to create new statsd client")
		}
		d.Telemetry = t
	} else {
		d.Telemetry = &telemetry.DummyTelemetry{}
	}

	if cfg.AesKey == "" {
		d.EncryptionService = encryption.NewPlainText()
	} else {
		e, err := encryption.New(cfg.AesKey)
		if err != nil {
			return errors.Wrap(err, "unable to create new encryption service")
		}
		d.EncryptionService = e
	}

	c, err := cmd.New()
	if err != nil {
		return errors.Wrap(err, "unable to create new command service")
	}

	d.CmdService = c

	metricsService, err := metrics.New(&metrics.Config{
		RedisBackend:  d.RedisBackend,
		ShutdownCtx:   d.ShutdownContext,
		PrometheusURL: parseHTTPListenAddress(cfg.HTTPAPIListenAddress),
		Telemetry:     d.Telemetry,
		InstallID:     cfg.InstallID,
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
		Telemetry:    d.Telemetry,
		Encryption:   d.EncryptionService,
		InstallID:    cfg.InstallID,
	})
	if err != nil {
		return errors.Wrap(err, "unable to create new store service")
	}

	d.StoreService = storeService

	d.PubSubService = pubsub.New()

	busService, err := bus.New(&bus.Options{
		Store:               storeService,
		RedisBackend:        d.RedisBackend,
		Cmd:                 d.CmdService,
		NodeName:            d.Config.NodeName,
		ShutdownCtx:         d.ShutdownContext,
		WASMDir:             d.Config.WASMDir,
		Metrics:             d.MetricsService,
		PubSub:              d.PubSubService,
		NumTailWorkers:      cfg.NumTailWorkers,
		NumBroadcastWorkers: cfg.NumBroadcastWorkers,
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

// sendCreatedTelemetry sends a gauge indicating when the cluster was first started
// This will only be sent once and
func (d *Dependencies) sendCreatedTelemetry() {
	createdTS, err := d.StoreService.GetCreationDate(d.ShutdownContext)
	if err != nil {
		logrus.Errorf("unable to get creation date: %s", err)
		return
	}

	if createdTS > 0 {
		// Value is already set and sent to telemetry
		return
	}

	createdTS = time.Now().UTC().Unix()

	tags := []statsd.Tag{
		{"install_id", d.Config.InstallID},
		{"node_id", d.Config.NodeID},
	}

	// Set in redis
	if err := d.StoreService.SetCreationDate(d.ShutdownContext, createdTS); err != nil {
		logrus.Errorf("unable to set creation date: %s", err)
	}

	if err := d.Telemetry.Gauge(types.GaugeServerCreated, createdTS, 1.0, tags...); err != nil {
		logrus.Errorf("unable to send created gauge: %s", err)
	}
}

// RunUptimeTelemetry sends a gauge metric to the telemetry backend every minute
func (d *Dependencies) RunUptimeTelemetry() {
	// Init telemetry
	d.sendCreatedTelemetry()

	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	tags := []statsd.Tag{
		{"install_id", d.Config.InstallID},
		{"node_id", d.Config.NodeID},
	}

	// Send started telemetry
	if err := d.Telemetry.Gauge(types.GaugeServerStart, time.Now().Unix(), 1.0, tags...); err != nil {
		logrus.Errorf("unable to send started gauge: %s", err)
	}

	// Reset uptime counter
	// TODO: does this actually work?
	if err := d.Telemetry.SetInt(types.GaugeServerUptime, 0, 1.0, tags...); err != nil {
		logrus.Errorf("unable to reset uptime gauge: %s", err)
	}

	for {
		select {
		case <-ticker.C:
			// No error checking here since we don't want to spam logs every minute if telemetry is unreachable

			// Use delta since we only need to send the difference
			_ = d.Telemetry.GaugeDelta(types.GaugeServerUptime, 60, 1.0, tags...)

			// Timestamp of last ping
			_ = d.Telemetry.Gauge(types.GaugeTimestampPing, time.Now().Unix(), 1.0, tags...)

		case <-d.ShutdownContext.Done():
			return
		}
	}
}

func (d *Dependencies) getInstallID(ctx context.Context) (string, error) {
	v := d.RedisBackend.Get(ctx, store.InstallIDKey).Val()

	if v == "" {
		id, setErr := d.setStreamdalID(ctx)
		if setErr != nil {
			return "", setErr
		}

		return id, nil
	}

	return v, nil
}

func (d *Dependencies) setStreamdalID(ctx context.Context) (string, error) {
	id, err := d.RedisBackend.Get(ctx, store.InstallIDKey).Result()
	if errors.Is(err, redis.Nil) {
		// Create new ID
		newID := util.GenerateUUID()

		d.Config.InstallID = newID

		err := d.RedisBackend.Set(ctx, store.InstallIDKey, newID, 0).Err()
		if err != nil {
			return "", errors.Wrap(err, "unable to set cluster ID")
		}

		logrus.Debugf("Set cluster ID '%s'", newID)
		return newID, nil
	} else if err != nil {
		return "", errors.Wrap(err, "unable to query cluster ID")
	}

	// Streamdal cluster ID already set
	return id, nil
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

func parseHTTPListenAddress(addr string) string {
	parts := strings.Split(addr, ":")
	if len(parts) != 2 {
		return defaultHTTPListenAddress
	}

	if parts[0] == "" {
		parts[0] = "localhost"
	}

	return fmt.Sprintf("http://%s:%s", parts[0], parts[1])
}
