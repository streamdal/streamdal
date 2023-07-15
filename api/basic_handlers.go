package api

import (
	"encoding/json"
	"net/http"
)

func (a *API) healthCheckHandler(wr http.ResponseWriter, r *http.Request) {
	status := http.StatusOK
	body := "ok"

	if a.Deps.Health.Failed() {
		status = http.StatusInternalServerError
		body = "failed"
	}

	wr.WriteHeader(status)
	wr.Write([]byte(body))
}

func (a *API) versionHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")
	rw.WriteHeader(http.StatusOK)

	response := &ResponseJSON{Status: http.StatusOK, Message: "batchcorp/snitch-server " + a.Version}

	if err := json.NewEncoder(rw).Encode(response); err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
	}
}
