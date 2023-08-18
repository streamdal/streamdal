package httpapi

import (
	"fmt"
	"io"
	"net/http"
	"time"

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

	// Broadcast KV changes to other snitch-server nodes (reminder: we do this
	// so that the nodes can inform their connected SDKs of the change and the
	// SDKs can update their local KV state)
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
	updateHTTPRequest := &protos.KVUpdateHTTPRequest{}

	if err := protojson.Unmarshal(body, updateHTTPRequest); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusBadRequest,
			Message: fmt.Sprintf("unable to unmarshal request body: %s", err.Error()),
		}, http.StatusBadRequest)

		return
	}

	// Validate the input
	if err := validate.KVUpdateHTTPRequest(updateHTTPRequest); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusBadRequest,
			Message: fmt.Sprintf("invalid request body: %s", err.Error()),
		}, http.StatusBadRequest)

		return
	}

	// Fetch existing object
	existing, err := a.Options.KVService.Get(r.Context(), updateHTTPRequest.Kv.Key)
	if err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to fetch existing kv object: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	// Validate existing - just in case
	if err := validate.KVObject(existing, true); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("bug? invalid existing kv object (existing object should pass validation!): %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	// Overwrite requested object's timestamps
	updateHTTPRequest.Kv.CreatedAtUnixTsNanoUtc = existing.CreatedAtUnixTsNanoUtc

	// Add updated timestamp
	updateHTTPRequest.Kv.UpdatedAtUnixTsNanoUtc = time.Now().UTC().UnixNano()

	// Attempt to update in KV service
	updated, err := a.Options.KVService.Update(r.Context(), updateHTTPRequest.Kv)
	if err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to complete update request: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	// Broadcast KV changes to other snitch-server nodes (reminder: we do this
	// so that the nodes can inform their connected SDKs of the change and the
	// SDKs can update their local KV state)
	if err := a.Options.BusService.BroadcastKVUpdate(r.Context(), updateHTTPRequest); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to broadcast update kv command: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	WriteJSON(rw, updated, http.StatusOK)
}

// Returns *ResponseJSON; status code 200 - ok; 400 - bad input; 404 - not found; 500 - internal server error
func (a *HTTPAPI) deleteKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	// Get the key
	params := httprouter.ParamsFromContext(r.Context())
	key := params.ByName("key")

	if key == "" {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: "bug? got a request for fetching a KV but kv is emtpty",
		}, http.StatusInternalServerError)
		return
	}

	// Does this kv exist?
	if _, err := a.Options.KVService.Get(r.Context(), key); err != nil {
		if err == nats.ErrKeyNotFound {
			WriteJSON(rw, &ResponseJSON{
				Status:  http.StatusNotFound,
				Message: fmt.Sprintf("kv with key %s not found", key),
			}, http.StatusNotFound)

			return
		}

		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to fetch existing kv object: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	// Key exists; attempt to delete in KV
	if err := a.Options.KVService.Delete(r.Context(), key); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to complete delete request: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	// Broadcast KV changes to other snitch-server nodes (reminder: we do this
	// so that the nodes can inform their connected SDKs of the change and the
	// SDKs can update their local KV state)
	if err := a.Options.BusService.BroadcastKVDelete(r.Context(), key); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to broadcast delete kv command: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	WriteJSON(rw, &ResponseJSON{
		Status:  http.StatusOK,
		Message: "kv deleted",
	}, http.StatusOK)
}

// Returns *ResponseJSON; status code 200 - ok; 500 - internal server error
// "Message" indicates how many KV objects were deleted.
//
// THIS IS AN EXTREMELY DANGEROUS ENDPOINT.
func (a *HTTPAPI) deleteAllKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	yes := r.URL.Query().Get("yes")

	if yes != "please" {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusBadRequest,
			Message: "please pass ?yes=please to confirm you want to delete all kv objects",
		}, http.StatusBadRequest)

		return
	}

	// Delete all kv objects
	if err := a.Options.KVService.DeleteAll(r.Context()); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to complete delete all request: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	// Broadcast the delete all change
	if err := a.Options.BusService.BroadcastKVDeleteAll(r.Context()); err != nil {
		WriteJSON(rw, &ResponseJSON{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("unable to broadcast delete all kv command: %s", err.Error()),
		}, http.StatusInternalServerError)

		return
	}

	WriteJSON(rw, &ResponseJSON{
		Status:  http.StatusOK,
		Message: "deletion request issued; please wait a few seconds for the change to propagate",
	}, http.StatusOK)
}
