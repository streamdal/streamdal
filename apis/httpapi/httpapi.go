package httpapi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/InVisionApp/go-health/v2"
	"github.com/pkg/errors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/contrib/julienschmidt/httprouter"

	"github.com/streamdal/snitch-server/services/bus"
	"github.com/streamdal/snitch-server/services/kv"
)

type Options struct {
	KVService            kv.IKV
	HTTPAPIListenAddress string
	Version              string
	ShutdownContext      context.Context
	Health               health.IHealth
	BusService           bus.IBus
}
type HTTPAPI struct {
	Options *Options
	log     *logrus.Entry
}

type ResponseJSON struct {
	Message string            `json:"message"`
	Values  map[string]string `json:"values,omitempty"`
}

func New(o *Options) (*HTTPAPI, error) {
	if err := validateOptions(o); err != nil {
		return nil, errors.Wrap(err, "could not validate dependencies")
	}

	return &HTTPAPI{
		Options: o,
		log:     logrus.WithField("pkg", "httpapi"),
	}, nil
}

func (a *HTTPAPI) Run() error {
	llog := a.log.WithField("method", "Run")

	router := httprouter.New()

	server := &http.Server{
		Addr: a.Options.HTTPAPIListenAddress,
	}

	// KV-related handlers
	router.HandlerFunc("GET", "/api/v1/kv/usage", a.getUsageKVHandler)
	router.HandlerFunc("GET", "/api/v1/kv", a.getAllKVHandler)
	router.HandlerFunc("GET", "/api/v1/kv/:key", a.getKVHandler)
	router.HandlerFunc("POST", "/api/v1/kv", a.createKVHandler)
	router.HandlerFunc("PUT", "/api/v1/kv/:key", a.updateKVHandler)
	router.HandlerFunc("DELETE", "/api/v1/kv/:key", a.deleteKVHandler)
	router.HandlerFunc("DELETE", "/api/v1/kv", a.deleteAllKVHandler)

	router.HandlerFunc("GET", "/health-check", a.healthCheckHandler)
	router.HandlerFunc("GET", "/version", a.versionHandler)
	router.Handler("GET", "/metrics", promhttp.Handler())

	llog.Infof("HTTPAPI server running on '%v'", a.Options.HTTPAPIListenAddress)

	// Graceful shutdown
	go func() {
		<-a.Options.ShutdownContext.Done()
		llog.Debug("context cancellation detected")
		server.Close()
	}()

	return http.ListenAndServe(a.Options.HTTPAPIListenAddress, router)
}

func WriteJSON(rw http.ResponseWriter, payload interface{}, status int) {
	data, err := json.Marshal(payload)
	if err != nil {
		logrus.Errorf("unable to marshal JSON during WriteJSON "+
			"(payload: '%s'; status: '%d'): %s", payload, status, err)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(status)

	if _, err := rw.Write(data); err != nil {
		logrus.Errorf("unable to write resp in WriteJSON: %s", err)
		return
	}
}

// Write is a helper for writing ResponseJSON to response writer
func Write(rw http.ResponseWriter, status int, message string, args ...interface{}) {
	WriteJSON(rw, ResponseJSON{
		Message: fmt.Sprintf(message, args...),
	}, status)
}

func validateOptions(o *Options) error {
	if o == nil {
		return errors.New("options cannot be nil")
	}

	if o.KVService == nil {
		return errors.New("kv service cannot be nil")
	}

	if o.Version == "" {
		return errors.New("version cannot be empty")
	}

	if o.HTTPAPIListenAddress == "" {
		return errors.New("http api listen address cannot be empty")
	}

	if o.ShutdownContext == nil {
		return errors.New("shutdown context cannot be nil")
	}

	if o.Health == nil {
		return errors.New("health cannot be nil")
	}

	if o.BusService == nil {
		return errors.New("bus service cannot be nil")
	}

	return nil
}
