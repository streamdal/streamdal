package httpapi

import (
	"encoding/json"
	"net/http"

	"github.com/sirupsen/logrus"
	"gopkg.in/DataDog/dd-trace-go.v1/contrib/julienschmidt/httprouter"

	"github.com/batchcorp/snitch-server/deps"
)

var (
	log *logrus.Entry
)

func init() {
	log = logrus.WithField("pkg", "api")
}

type HTTPAPI struct {
	Deps *deps.Dependencies
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
	}
}

func (a *HTTPAPI) Run() error {
	llog := log.WithField("method", "Run")

	router := httprouter.New()

	router.HandlerFunc("GET", "/health-check", a.healthCheckHandler)
	router.HandlerFunc("GET", "/version", a.versionHandler)

	llog.Infof("HTTPAPI server running on %v", a.Deps.Config.HTTPAPIListenAddress)

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
