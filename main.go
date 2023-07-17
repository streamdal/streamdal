package main

import (
	"os"

	"github.com/alecthomas/kingpin/v2"
	"github.com/joho/godotenv"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/ssh/terminal"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	"github.com/streamdal/snitch-server/apis/grpcapi"
	"github.com/streamdal/snitch-server/apis/httpapi"
	"github.com/streamdal/snitch-server/config"
	"github.com/streamdal/snitch-server/deps"
)

var (
	version = "No version specified"

	envFile = kingpin.Flag("envfile", "Local Env file to read at startup").Short('e').Default(".env").String()
	debug   = kingpin.Flag("debug", "Enable debug output").Short('d').Bool()
)

func init() {
	// Parse CLI stuff
	kingpin.Version(version)
	kingpin.CommandLine.HelpFlag.Short('h')
	kingpin.CommandLine.VersionFlag.Short('v')
	kingpin.Parse()
}

func main() {
	// Start DataDog tracer
	if os.Getenv("DD_ENV") != "" {
		tracer.Start(tracer.WithAnalytics(true))
		defer tracer.Stop()
	}

	if *debug {
		logrus.SetLevel(logrus.DebugLevel)
	}

	// JSON formatter for log output if not running in a TTY
	// because loggers likes JSON but humans like colors
	if !terminal.IsTerminal(int(os.Stderr.Fd())) {
		logrus.SetFormatter(&logrus.JSONFormatter{})
	}

	log := logrus.WithField("method", "main")
	log.WithField("filename", *envFile).Debug("Loading env file")

	if err := godotenv.Load(*envFile); err != nil {
		log.WithFields(logrus.Fields{"filename": *envFile, "err": err.Error()}).Warn("Unable to load dotenv file")
	}

	cfg := config.New()
	if err := cfg.LoadEnvVars(); err != nil {
		log.WithError(err).Fatal("could not instantiate configuration")
	}

	d, err := deps.New(version, cfg)
	if err != nil {
		log.WithError(err).Fatal("could not setup dependencies")
	}

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
		if err := d.MessagingService.RunConsumer(); err != nil {
			errChan <- errors.Wrap(err, "error during NATS consumer run")
		}
	}()

	return <-errChan
}
