package main

import (
	"os"
	"syscall"

	"github.com/charmbracelet/log"

	"github.com/streamdal/snitch-cli/cmd"
	"github.com/streamdal/snitch-cli/config"
	"github.com/streamdal/snitch-cli/console"
)

func main() {
	// Read CLI args
	cfg := config.New("unset")

	logger := log.Default()

	if cfg.EnableFileLogging {
		f, err := os.OpenFile(cfg.LogFile, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0o644)
		if err != nil {
			log.Fatalf("unable to open log file: %s", err)
		}

		redirectStdErr(f)

		logger.SetOutput(f)
		logger.SetFormatter(log.JSONFormatter)
	} else {
		logger = log.Default()
	}

	if cfg.Debug {
		logger.SetLevel(log.DebugLevel)
	}

	// Initialize console components
	ui, err := console.New(&console.Options{
		Config: cfg,
		Logger: logger,
	})
	if err != nil {
		log.Fatalf("unable to initialize console: %s", err)
	}

	// Initialize cmd which houses business logic
	c, err := cmd.New(&cmd.Options{
		Config:  cfg,
		Console: ui,
		Logger:  logger,
	})
	if err != nil {
		log.Fatalf("unable to initialize cmd: %s", err)
	}

	// Do the dance
	if err := c.Run(); err != nil {
		log.Fatalf("error during cmd run: %s", err)
	}
}

func redirectStdErr(f *os.File) {
	if f == nil {
		panic("file passed to redirectStdErr cannot be nil")
	}

	err := syscall.Dup2(int(f.Fd()), int(os.Stderr.Fd()))
	if err != nil {
		log.Fatalf("Failed to redirect stderr to file '%s': %v", f.Name(), err)
	}
}
