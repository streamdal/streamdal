package main

import (
	"fmt"
	"os"
	"os/signal"
	"time"

	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/ssh/terminal"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	_ "gopkg.in/relistan/rubberneck.v1"

	"github.com/streamdal/streamdal/apps/server/apis/grpcapi"
	"github.com/streamdal/streamdal/apps/server/apis/httpapi"
	"github.com/streamdal/streamdal/apps/server/config"
	"github.com/streamdal/streamdal/apps/server/deps"
)

var (
	version = "No version specified"
)

func main() {
	cfg := config.New(version)

	if cfg.Debug {
		logrus.SetLevel(logrus.DebugLevel)
	} else {
		logrus.SetLevel(logrus.InfoLevel)
	}

	// Start DataDog tracer
	if os.Getenv("DD_ENV") != "" {
		tracer.Start(tracer.WithAnalytics(true))
		defer tracer.Stop()
	}

	// JSON formatter for log output if not running in a TTY
	// because loggers likes JSON but humans like colors
	if !terminal.IsTerminal(int(os.Stderr.Fd())) {
		logrus.SetFormatter(&logrus.JSONFormatter{})
	}

	log := logrus.WithField("method", "main")

	d, err := deps.New(cfg)
	if err != nil {
		log.WithError(err).Fatal("could not setup dependencies")
	}

	logrus.Debugf("Install ID: '%s'", d.Config.InstallID)
	logrus.Debugf("Node ID: '%s'", d.Config.NodeID)

	// Clean up telemetry on shutdown
	defer func(Telemetry statsd.Statter) {
		if err := Telemetry.Close(); err != nil {
			logrus.Error(err)
		}
	}(d.Telemetry)

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, os.Kill)

	go func() {
		sig := <-c
		logrus.Debugf("Received system call: %+v", sig)
		logrus.Info("Shutting down Streamdal server...")
		d.ShutdownFunc()
	}()

	if err := run(d); err != nil {
		log.Fatal(err)
	}
}

func run(d *deps.Dependencies) error {
	errChan := make(chan error, 1)

	// Run gRPC server
	go func() {
		api, err := grpcapi.New(&grpcapi.Options{
			Config:          d.Config,
			StoreService:    d.StoreService,
			BusService:      d.BusService,
			ShutdownContext: d.ShutdownContext,
			CmdService:      d.CmdService,
			NotifyService:   d.NotifyService,
			RedisBackend:    d.RedisBackend,
			PubSubService:   d.PubSubService,
			MetricsService:  d.MetricsService,
			KVService:       d.KVService,
			DemoMode:        d.Config.DemoMode,
			Telemetry:       d.Telemetry,
			InstallID:       d.Config.InstallID,
			NodeID:          d.Config.NodeID,
		})
		if err != nil {
			errChan <- errors.Wrap(err, "error during gRPC API setup")
			return
		}

		if err := api.Run(); err != nil {
			errChan <- errors.Wrap(err, "error during gRPC API run")
			return
		}
	}()

	// Run REST server
	go func() {
		api, err := httpapi.New(&httpapi.Options{
			KVService:            d.KVService,
			HTTPAPIListenAddress: d.Config.HTTPAPIListenAddress,
			Version:              d.Config.GetVersion(),
			ShutdownContext:      d.ShutdownContext,
			Health:               d.Health,
			BusService:           d.BusService,
			AuthToken:            d.Config.AuthToken,
		})
		if err != nil {
			errChan <- errors.Wrap(err, "error during HTTP API setup")
			return
		}

		if err := api.Run(); err != nil {
			errChan <- errors.Wrap(err, "error during HTTP API run")
		}
	}()

	// Run Messaging service
	go func() {
		if err := d.BusService.RunBroadcastConsumer(); err != nil {
			errChan <- errors.Wrap(err, "error during RedisBackend consumer run")
		}
	}()

	// Tail/peek consumers are separate from the main consumer to avoid
	// bogging down the main consumer with traffic during an active tail
	go func() {
		if err := d.BusService.RunTailConsumer(); err != nil {
			errChan <- errors.Wrap(err, "error during RedisBackend consumer run")
		}
	}()

	displayInfo(d)

	go d.RunUptimeTelemetry()

	// If shutting down, no need to listen for errCh
	select {
	case err := <-errChan:
		fmt.Println("received an error on errChan in run(): ", err)
		return err
	case <-d.ShutdownContext.Done():
		// Give components a moment to shut down
		time.Sleep(5 * time.Second)
		logrus.Info("Shutting down...")
		return nil
	}
}

func displayInfo(d *deps.Dependencies) {
	logrus.Infof("version: %s", d.Config.GetVersion())
}
