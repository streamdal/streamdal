package main

import (
	"context"
	"os"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/ssh/terminal"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gopkg.in/alecthomas/kingpin.v2"

	"github.com/batchcorp/snitch-server/api"
	"github.com/batchcorp/snitch-server/config"
	"github.com/batchcorp/snitch-server/deps"
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
	// because Loggly likes JSON but humans like colors
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
		log.WithError(err).Fatal("Could not instantiate configuration")
	}

	d, err := deps.New(cfg)
	if err != nil {
		log.WithError(err).Fatal("Could not setup dependencies")
	}

	if err := d.PreCreateBuckets(context.Background(), cfg); err != nil {
		log.WithError(err).Fatalln("unable to create NATS buckets")
	}

	log = log.WithField("environment", cfg.EnvName)

	// Start isb consumer
	if err := d.ISBService.StartConsumers(); err != nil {
		log.WithError(err).Fatal("Unable to start isb consumers")
	}

	// Start hsb publishers
	if err := d.HSBService.StartPublishers(); err != nil {
		log.WithError(err).Fatal("Unable to start hsb consumers")
	}

	// Start API server
	a := api.New(cfg, d, version)
	log.Fatal(a.Run())
}
