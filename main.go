package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/ssh/terminal"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	_ "gopkg.in/relistan/rubberneck.v1"

	"github.com/streamdal/snitch-server/apis/grpcapi"
	"github.com/streamdal/snitch-server/apis/httpapi"
	"github.com/streamdal/snitch-server/config"
	"github.com/streamdal/snitch-server/deps"
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

	d, err := deps.New(version, cfg)
	if err != nil {
		log.WithError(err).Fatal("could not setup dependencies")
	}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, syscall.SIGTERM)

	go func() {
		sig := <-c
		logrus.Debugf("Received system call: %+v", sig)
		logrus.Info("Shutting down plumber...")
		d.ShutdownFunc()
	}()

	if err := run(d); err != nil {
		log.WithError(err).Fatal("error during run")
	}
}

func run(d *deps.Dependencies) error {
	errChan := make(chan error, 1)

	// Run gRPC server
	go func() {
		if err := grpcapi.New(d).Run(); err != nil {
			errChan <- errors.Wrap(err, "error during gRPC server run")
		}
	}()

	// Run REST server
	go func() {
		if err := httpapi.New(d).Run(); err != nil {
			errChan <- errors.Wrap(err, "error during REST server run")
		}
	}()

	// Run Messaging service
	go func() {
		if err := d.BusService.RunConsumer(); err != nil {
			errChan <- errors.Wrap(err, "error during NATS consumer run")
		}
	}()

	displayInfo(d)

	return <-errChan
}

func displayInfo(d *deps.Dependencies) {
	logrus.Infof("version: %s", d.Config.GetVersion())
}
