package httpapi

import (
	"net/http"

	"github.com/sirupsen/logrus"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	"github.com/streamdal/streamdal/apps/server/util"
)

func (a *HTTPAPI) getConfigHandler(rw http.ResponseWriter, r *http.Request) {
	resp, err := a.Options.ExternalServer.GetConfig(r.Context(), &protos.GetConfigRequest{})
	if err != nil {
		Write(rw, http.StatusInternalServerError, "unable to get config: %s", err)
		return
	}

	if resp.Config == nil {
		Write(rw, http.StatusInternalServerError, "config is nil")
		return
	}

	cleaned, err := util.CleanConfig(resp)
	if err != nil {
		Write(rw, http.StatusInternalServerError, "unable to clean config response: %s", err)
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	if _, err := rw.Write(cleaned); err != nil {
		logrus.Errorf("unable to write resp in getConfigHandler: %s", err)
		return
	}
}
