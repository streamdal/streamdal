package httpapi

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func (a *HTTPAPI) getUsageKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	WriteJSON(rw, &ResponseJSON{
		Status:  http.StatusOK,
		Message: "get kv usage",
	}, http.StatusOK)
}

// Returns []*protos.KVObject as JSON
func (a *HTTPAPI) getAllKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	kvs, err := a.Options.KVService.GetAll(r.Context())
	if err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to fetch all kv objects: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	data, err := json.Marshal(kvs)
	if err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to marshal kv objects to JSON: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	WriteJSON(rw, data, http.StatusOK)
}

// Returns *protos.KVObject as JSON
func (a *HTTPAPI) getKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	WriteJSON(rw, &ResponseJSON{
		Status:  http.StatusOK,
		Message: "get kv handler",
	}, http.StatusOK)
}

// Input []*protos.KVObject as JSON; possible query param "overwrite" bool will
// cause createKVHandler to not error if key already exists.
// Returns created *protos.KVObject as JSON
func (a *HTTPAPI) createKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	WriteJSON(rw, &ResponseJSON{
		Status:  http.StatusOK,
		Message: "create kv handler",
	}, http.StatusOK)
}

// Update a single KV object. Input: *protos.KVObject as JSON
// Returns updated *protos.KVObject as JSON
func (a *HTTPAPI) updateKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	WriteJSON(rw, &ResponseJSON{
		Status:  http.StatusOK,
		Message: "update kv handler",
	}, http.StatusOK)
}

// Returns *ResponseJSON; status code 200 - ok; 400 - bad input; 404 - not found; 500 - internal server error
func (a *HTTPAPI) deleteKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	WriteJSON(rw, &ResponseJSON{
		Status:  http.StatusOK,
		Message: "delete kv handler",
	}, http.StatusOK)
}

// Returns *ResponseJSON; status code 200 - ok; 500 - internal server error
// "Message" indicates how many KV objects were deleted.
func (a *HTTPAPI) deleteAllKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	WriteJSON(rw, &ResponseJSON{
		Status:  http.StatusOK,
		Message: "delete all kv handler",
	}, http.StatusOK)
}
