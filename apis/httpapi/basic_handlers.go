package httpapi

import (
	"net/http"
)

func (a *HTTPAPI) healthCheckHandler(wr http.ResponseWriter, r *http.Request) {
	status := http.StatusOK
	body := "ok"

	if a.Deps.Health.Failed() {
		status = http.StatusInternalServerError
		body = "failed"
	}

	wr.WriteHeader(status)
	if _, err := wr.Write([]byte(body)); err != nil {
		a.log.Errorf("unable to write respons in healthCheckHandler: %s", err)
	}
}

func (a *HTTPAPI) versionHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")
	rw.WriteHeader(http.StatusOK)

	response := &ResponseJSON{
		Status:  http.StatusOK,
		Message: "streamdal/snitch-server " + a.Deps.Config.VersionStr,
	}

	WriteJSON(rw, response, http.StatusOK)
}
