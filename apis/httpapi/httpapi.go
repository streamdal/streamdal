package httpapi

import (
	"encoding/json"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/contrib/julienschmidt/httprouter"

	"github.com/streamdal/snitch-server/deps"
)

type HTTPAPI struct {
	Deps *deps.Dependencies
	log  *logrus.Entry
}

type ResponseJSON struct {
	Status  int               `json:"status"`
	Message string            `json:"message"`
	Values  map[string]string `json:"values,omitempty"`
	Errors  string            `json:"errors,omitempty"`
}

func New(d *deps.Dependencies) *HTTPAPI {
	return &HTTPAPI{
		Deps: d,
		log:  logrus.WithField("pkg", "httpapi"),
	}
}

func (a *HTTPAPI) Run() error {
	llog := a.log.WithField("method", "Run")

	router := httprouter.New()

	server := &http.Server{
		Addr: a.Deps.Config.HTTPAPIListenAddress,
	}

	router.HandlerFunc("GET", "/health-check", a.healthCheckHandler)
	router.HandlerFunc("GET", "/version", a.versionHandler)
	router.Handler("GET", "/metrics", promhttp.Handler())

	llog.Infof("HTTPAPI server running on %v", a.Deps.Config.HTTPAPIListenAddress)

	// Graceful shutdown
	go func() {
		<-a.Deps.ShutdownContext.Done()
		llog.Debug("context cancellation detected")
		server.Close()
	}()

	return http.ListenAndServe(a.Deps.Config.HTTPAPIListenAddress, router)
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
