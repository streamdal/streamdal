package httpapi

import (
	"net/http"

	"github.com/sirupsen/logrus"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"google.golang.org/protobuf/encoding/protojson"
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

	data, err := protojson.Marshal(resp.Config)
	if err != nil {
		Write(rw, http.StatusInternalServerError, "unable to marshal config: %s", err)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	if _, err := rw.Write(data); err != nil {
		logrus.Errorf("unable to write resp in getConfigHandler: %s", err)
		return
	}
}
