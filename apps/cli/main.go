package main

import (
	"os"
	"strings"
	"time"

	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/charmbracelet/log"
	"github.com/pkg/errors"

	"github.com/streamdal/streamdal/apps/cli/cmd"
	"github.com/streamdal/streamdal/apps/cli/config"
	"github.com/streamdal/streamdal/apps/cli/console"
	"github.com/streamdal/streamdal/apps/cli/manage"
	"github.com/streamdal/streamdal/apps/cli/telemetry"
	"github.com/streamdal/streamdal/apps/cli/types"
	"github.com/streamdal/streamdal/apps/cli/util"
)

var (
	VERSION = "unset"
)

func main() {
	// Read CLI args
	cfg := config.New(VERSION)

	logger := log.Default()

	if cfg.EnableFileLogging {
		f, err := os.OpenFile(cfg.LogFile, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0o644)
		if err != nil {
			log.Fatalf("unable to open log file: %s", err)
		}

		util.RedirectStdErr(f)

		logger.SetOutput(f)
		logger.SetFormatter(log.JSONFormatter)
	}

	if cfg.Debug {
		logger.SetLevel(log.DebugLevel)
		logger.SetReportCaller(true)
	}

	var t statsd.Statter
	if !cfg.TelemetryDisable {
		statsdClient, err := statsd.NewClientWithConfig(&statsd.ClientConfig{
			Address:       cfg.TelemetryAddress,
			Prefix:        "streamdal",
			UseBuffered:   true,
			FlushInterval: time.Second,
			TagFormat:     statsd.InfixSemicolon,
		})
		if err != nil {
			log.Errorf("unable to create new statsd client: %s", err)
			t = &telemetry.DummyTelemetry{}
		} else {
			t = statsdClient
		}
	} else {
		t = &telemetry.DummyTelemetry{}
	}

	// Send telemetry
	_ = t.Gauge(types.GaugeArgsNum, int64(len(cfg.KongContext.Args)), 1.0, cfg.GetStatsdTags()...)
	_ = t.Inc(types.CounterExecTotal, 1, 1.0, cfg.GetStatsdTags()...)

	command := cfg.KongContext.Command()

	switch {
	case command == "cli":
		handleCLICommand(cfg, logger, t)
	case strings.HasPrefix(command, "manage"):
		handleManageCommand(cfg, logger, t)
	default:
		util.ReportErrorAndExit(t, cfg, errors.Errorf("unknown command: %s", command))
	}
}

func handleCLICommand(cfg *config.Config, logger *log.Logger, t statsd.Statter) {
	if cfg == nil {
		util.ReportErrorAndExit(t, cfg, errors.New("config cannot be nil"))
	}

	if logger == nil {
		util.ReportErrorAndExit(t, cfg, errors.New("logger cannot be nil"))
	}

	if t == nil {
		util.ReportErrorAndExit(t, cfg, errors.New("telemetry cannot be nil"))
	}

	// Initialize console components
	ui, err := console.New(&console.Options{
		Config: cfg,
		Logger: logger,
	})
	if err != nil {
		util.ReportErrorAndExit(t, cfg, errors.Wrap(err, "unable to initialize console"))
	}

	// Initialize cmd which houses business logic
	c, err := cmd.New(&cmd.Options{
		Config:    cfg,
		Console:   ui,
		Logger:    logger,
		Telemetry: t,
	})
	if err != nil {
		util.ReportErrorAndExit(t, cfg, errors.Wrap(err, "unable to initialize cmd"))
	}

	// Do the dance
	if err := c.Run(); err != nil {
		util.ReportErrorAndExit(t, cfg, errors.Wrap(err, "error during cmd run"))
	}
}

func handleManageCommand(cfg *config.Config, logger *log.Logger, t statsd.Statter) {
	if cfg == nil {
		util.ReportErrorAndExit(t, cfg, errors.New("config cannot be nil"))
	}

	if logger == nil {
		util.ReportErrorAndExit(t, cfg, errors.New("logger cannot be nil"))
	}

	if t == nil {
		util.ReportErrorAndExit(t, cfg, errors.New("telemetry cannot be nil"))
	}

	m, err := manage.New(cfg, logger, t)
	if err != nil {
		util.ReportErrorAndExit(t, cfg, errors.Wrap(err, "unable to initialize manage"))
	}

	switch cfg.KongContext.Command() {
	case "manage create pipeline":
		err = m.CreatePipeline(cfg)
	case "manage create wasm":
		err = m.CreateWasm(cfg)
	case "manage get pipeline":
		err = m.GetPipeline(cfg)
	case "manage get wasm":
		err = m.GetWasm(cfg)
	case "manage delete pipeline":
		err = m.DeletePipeline(cfg)
	case "manage delete wasm":
		err = m.DeleteWasm(cfg)
	case "manage update pipeline":
		err = m.UpdatePipeline(cfg)
	case "manage update wasm":
		err = m.UpdateWasm(cfg)
	default:
		util.ReportErrorAndExit(t, cfg, errors.Errorf("unknown manage command: %s", cfg.KongContext.Command()))
	}

	if err != nil {
		util.ReportErrorAndExit(t, cfg, errors.Wrap(err, "error during manage command"))
	}
}
