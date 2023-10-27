package telemetry

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"time"

	"github.com/pkg/errors"
	"github.com/relistan/go-director"
	"github.com/sirupsen/logrus"

	"github.com/streamdal/server/types"
)

type ITelemetry interface {
	Emit(ctx context.Context, data map[string]string) error
}

const (
	numTelemetryWorkers = 2

	// serverFlushTimeout is the maximum amount of time to wait before flushing telemetry to Streamdal
	serverFlushTimeout = time.Second * 2

	// serverFlushMaxBatchSize defines how many telemetry events to batch before sending to Streamdal
	serverFlushMaxBatchSize = 100
)

var (
	ErrMissingConfig = errors.New("config cannot be nil")
)

type Config struct {
	ShutdownCtx context.Context
	log         *logrus.Entry
}

type Telemetry struct {
	work chan map[string]string
	*Config
}

func New(cfg *Config) (*Telemetry, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "unable to validate config")
	}

	return &Telemetry{
		Config: cfg,
		work:   make(chan map[string]string, 1000),
	}, nil
}

func validateConfig(cfg *Config) error {
	if cfg == nil {
		return ErrMissingConfig
	}

	if cfg.log == nil {
		cfg.log = logrus.WithField("pkg", "telemetry")
	}

	return nil
}

func (t *Telemetry) startTelemetryWorkers() {
	for i := 0; i < numTelemetryWorkers; i++ {
		go t.startWorker(director.NewTimedLooper(director.FOREVER, time.Millisecond*50, make(chan error, 1)))
	}
}

func (t *Telemetry) startWorker(looper director.Looper) {
	var quit bool

	lastFlush := time.Now().UTC()
	batch := make([]map[string]string, 0)

	looper.Loop(func() error {
		if quit {
			time.Sleep(time.Millisecond * 50)
			return nil
		}

		select {
		case <-t.ShutdownCtx.Done():
			t.log.Info("stopping telemetry worker")
			quit = true
			looper.Quit()
			return nil
		case work := <-t.work:
			batch = append(batch, work)
			t.log.WithField("data", work).Info("received telemetry data")

			if err := t.sendTelemetryBatch(t.ShutdownCtx, batch); err != nil {
				t.log.WithError(err).Error("unable to send telemetry data")
			}
			batch = make([]map[string]string, 0)
			lastFlush = time.Now().UTC()
		default:
			// NOOP
		}

		if len(batch) > serverFlushMaxBatchSize && time.Now().UTC().Sub(lastFlush) > serverFlushTimeout {
			if err := t.sendTelemetryBatch(t.ShutdownCtx, batch); err != nil {
				t.log.WithError(err).Error("unable to send telemetry batch")
			}

			batch = make([]map[string]string, 0)
			lastFlush = time.Now().UTC()
		}

		return nil
	})
}

func (t *Telemetry) sendTelemetryBatch(_ context.Context, data []map[string]string) error {
	u, err := url.Parse(types.UibffEndpoint + "/v1/app/telemetry")
	if err != nil {
		return errors.Wrap(err, "unable to parse url")
	}

	body, err := json.Marshal(data)
	if err != nil {
		t.log.WithError(err).Error("unable to marshal telemetry data")
		return nil
	}

	res, err := http.DefaultClient.Post(u.String(), "application/json", bytes.NewBuffer(body))
	if err != nil {
		return errors.Wrap(err, "unable to make request")
	}

	if res.StatusCode != http.StatusOK {
		return errors.Errorf("non-OK status code: %d", res.StatusCode)
	}

	return nil
}

func (t *Telemetry) Emit(_ context.Context, data map[string]string) error {
	t.work <- data

	return nil
}
