package api

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/charmbracelet/log"
	"github.com/pkg/errors"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/streamdal/streamdal/apps/log-processor/config"
)

type API struct {
	config          *config.Config
	version         string
	srv             *http.Server
	log             *log.Logger
	shutdownContext context.Context
}

func New(version string, shutdownCtx context.Context, cfg *config.Config) (*API, error) {
	if err := validate(shutdownCtx, cfg); err != nil {
		return nil, errors.Wrap(err, "failed to validate configuration")
	}

	mux := http.NewServeMux()

	a := &API{
		version:         version,
		config:          cfg,
		shutdownContext: shutdownCtx,
		log:             log.With("pkg", "api"),
	}

	// Routes
	mux.HandleFunc("/version", a.versionHandler)
	mux.Handle("/metrics", promhttp.Handler())

	// Create HTTP server
	a.srv = &http.Server{
		Addr:    cfg.APIListenAddress,
		Handler: mux,
	}

	return a, nil
}

func validate(shutdownCtx context.Context, cfg *config.Config) error {
	if shutdownCtx == nil {
		return errors.New("shutdown context cannot be nil")
	}

	if cfg == nil {
		return errors.New("config cannot be nil")
	}

	return nil
}

func (a *API) Start() error {
	llog := a.log.With("method", "Run")

	// Goroutine that watches shutdown context and attempts to gracefully
	// shutdown HTTP server.
	go func() {
		slog := llog.With("goroutine", "shutdownWatcher")
		slog.Debug("Starting")

		<-a.shutdownContext.Done()

		slog.Debug("Detected shutdown signal, telling API to gracefully shutdown")
		ctxWithTimeout, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := a.srv.Shutdown(ctxWithTimeout); err != nil {
			slog.Errorf("unable to complete graceful shutdown: %s", err)
		} else {
			slog.Debug("Graceful shutdown succeeded")
		}
	}()

	// Goroutine for listening and serving API
	go func() {
		lslog := llog.With("goroutine", "ListenAndServe")
		lslog.Debug("Starting")

		// This will block until shutdown context is triggered
		if err := a.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			lslog.Errorf("Error during ListenAndServe(): %s", err)
		}

		lslog.Debug("Exiting")
	}()

	return nil
}

func (a *API) versionHandler(w http.ResponseWriter, r *http.Request) {
	if _, err := fmt.Fprintf(w, `{"version": "%s"}'`, a.version); err != nil {
		a.log.Errorf("Unable to handle version request: %s", err)
	}
}
