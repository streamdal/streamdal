package httpapi

import (
	"net/http"
)

func (a *HTTPAPI) healthCheckHandler(wr http.ResponseWriter, r *http.Request) {
	status := http.StatusOK
	body := "ok"

	if a.Options.Health.Failed() {
		status = http.StatusInternalServerError
		body = "failed"
	}

	wr.WriteHeader(status)
	if _, err := wr.Write([]byte(body)); err != nil {
		a.log.Errorf("unable to write respons in healthCheckHandler: %s", err)
	}
}

func (a *HTTPAPI) versionHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "text/plain; charset=UTF-8")
	rw.WriteHeader(http.StatusOK)

	if _, err := rw.Write([]byte(a.Options.Version)); err != nil {
		a.log.Errorf("unable to write response in versionHandler: %s", err)
	}
}
