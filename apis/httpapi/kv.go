package httpapi

import (
	"fmt"
	"io"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/nats-io/nats.go"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/streamdal/snitch-server/validate"
)

func (a *HTTPAPI) getUsageKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	usage, err := a.Options.KVService.GetUsage(r.Context())
	if err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to fetch kv usage: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	WriteJSON(rw, usage, http.StatusOK)
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

	WriteJSON(rw, kvs, http.StatusOK)
}

// Returns *protos.KVObject as JSON
func (a *HTTPAPI) getKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	params := httprouter.ParamsFromContext(r.Context())
	key := params.ByName("key")

	if key == "" {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: "bug? got a request for fetching a KV but kv is emtpty",
		}, http.StatusInternalServerError)
		return
	}

	object, err := a.Options.KVService.Get(r.Context(), key)
	if err != nil {
		statusCode := http.StatusInternalServerError
		statusMsg := fmt.Sprintf("unable to fetch kv object '%s': %s", key, err.Error())

		if err == nats.ErrKeyNotFound {
			statusCode = http.StatusNotFound
			statusMsg = fmt.Sprintf("kv object '%s' not found", key)
		}

		WriteJSON(rw, &ResponseJSON{
			Status:  statusCode,
			Message: statusMsg,
		}, statusCode)

		return
	}

	WriteJSON(rw, object, http.StatusOK)
}

type CreateKVRequest struct {
	Overwrite bool               `json:"overwrite"`
	KVS       []*protos.KVObject `json:"kvs"`
}

// Input []*protos.KVObject as JSON; possible query param "overwrite" bool will
// cause createKVHandler to not error if key already exists.
// Returns created *protos.KVObject as JSON
func (a *HTTPAPI) createKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusBadRequest,
			Message: fmt.Sprintf("unable to read request body: %s", err.Error()),
		}, http.StatusBadRequest)

		return
	}

	defer r.Body.Close()

	// Unmarshal input into pb's
	createHTTPRequest := &protos.KVCreateHTTPRequest{}

	if err := protojson.Unmarshal(body, createHTTPRequest); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusBadRequest,
			Message: fmt.Sprintf("unable to unmarshal request body: %s", err.Error()),
		}, http.StatusBadRequest)

		return
	}

	// Validate the input
	if err := validate.KVCreateHTTPRequest(createHTTPRequest); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusBadRequest,
			Message: fmt.Sprintf("invalid request body: %s", err.Error()),
		}, http.StatusBadRequest)

		return
	}

	// Attempt to create in KV service
	//
	// TODO: This should be updated to pass this data to the KV service via a chan;
	// this should be good enough for now though.
	if err := a.Options.KVService.Create(r.Context(), createHTTPRequest.Kvs, createHTTPRequest.Overwrite); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to complete create request: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	// Broadcast the change to other snitch-nodes
	// TODO: create broadcast handlers for emitting commands on KV updates
	if err := a.Options.BusService.BroadcastKVCreate(r.Context(), createHTTPRequest); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to broadcast kv command: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	WriteJSON(rw, createHTTPRequest.Kvs, http.StatusOK)
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
