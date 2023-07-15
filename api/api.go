package api

import (
	"encoding/json"
	"net/http"

	"gopkg.in/DataDog/dd-trace-go.v1/contrib/julienschmidt/httprouter"
	"github.com/sirupsen/logrus"

	"github.com/batchcorp/snitch-server/config"
	"github.com/batchcorp/snitch-server/deps"
)

var (
	log *logrus.Entry
)

func init() {
	log = logrus.WithField("pkg", "api")
}

type API struct {
	Config  *config.Config
	Deps    *deps.Dependencies
	Version string
}

type ResponseJSON struct {
	Status  int               `json:"status"`
	Message string            `json:"message"`
	Values  map[string]string `json:"values,omitempty"`
	Errors  string            `json:"errors,omitempty"`
}

func New(cfg *config.Config, d *deps.Dependencies, version string) *API {
	return &API{
		Config:  cfg,
		Deps:    d,
		Version: version,
	}
}

func (a *API) Run() error {
	llog := log.WithField("method", "Run")

	router := httprouter.New()

	router.HandlerFunc("GET", "/health-check", a.healthCheckHandler)
	router.HandlerFunc("GET", "/version", a.versionHandler)

	llog.Infof("API server running on %v", a.Config.ListenAddress)
	return http.ListenAndServe(a.Config.ListenAddress, router)
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

