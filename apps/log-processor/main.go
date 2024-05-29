//go:build cgo
// +build cgo

package main

import (
	"context"
	"os"
	"os/signal"

	"github.com/charmbracelet/log"

	"github.com/streamdal/streamdal/apps/log-processor/api"
	"github.com/streamdal/streamdal/apps/log-processor/config"
	"github.com/streamdal/streamdal/apps/log-processor/processor"
)

var (
	// Gets set during build time
	version = "0.0.0"
)

func main() {

	cfg := config.New(version)
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Failed to validate configuration: %v", err)
	}

	logLevel, err := log.ParseLevel(cfg.LogLevel)
	if err != nil {
		log.Fatalf("Failed to parse log level: %v", err)
	}

	if cfg.Debug {
		logLevel = log.DebugLevel
	}

	log.SetLevel(logLevel)

	// Context everyone uses for shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start processor-related components
	p, err := processor.New(ctx, cancel, cfg)
	if err != nil {
		log.Fatalf("Failed to start: %v", err)
	}

	// Create API
	a, err := api.New(version, ctx, cfg)
	if err != nil {
		log.Fatalf("unable to create API: %s", err)
	}

	// Start API
	if err := a.Start(); err != nil {
		log.Fatalf("unable to start API: %s", err)
	}

	log.Info("log-processor started")

	if cfg.Debug {
		printConfig(cfg)
	}

	// Listen for term signal (such as CTRl-C) to shutdown gracefully
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt)
	<-sigCh
	log.Warn("Received an interrupt, shutting down...")
	p.Close()
}

func printConfig(cfg *config.Config) {
	log.Debug("Config:")
	log.Debugf("    APIListenAddress          %s", cfg.APIListenAddress)
	log.Debugf("    LogstashListenAddr        %s", cfg.LogstashListenAddr)
	log.Debugf("    LogstashAddr              %s", cfg.LogstashAddr)
	log.Debugf("    LogstashReconnectInterval %s", cfg.LogstashReconnectInterval)
	log.Debugf("    StreamdalServerAddress    %s", cfg.StreamdalServerAddress)
	log.Debugf("    StreamdalServerToken      %s", cfg.StreamdalServerToken)
	log.Debugf("    StreamdalServiceName      %s", cfg.StreamdalServiceName)
	log.Debugf("    NumSenders                %d", cfg.NumSenders)
	log.Debugf("    NumProcessors             %d", cfg.NumProcessors)
	log.Debugf("    FilePathAware             %t", cfg.FilePathAware)
	log.Debugf("    ProcessBufferSize         %d", cfg.ProcessBufferSize)
	log.Debugf("    SendBufferSize            %d", cfg.SendBufferSize)
	log.Debugf("    Debug                     %t", cfg.Debug)
}
