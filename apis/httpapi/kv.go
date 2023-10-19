package httpapi

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/julienschmidt/httprouter"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/streamdal/protos/build/go/protos"

	"github.com/streamdal/server/validate"
)

func (a *HTTPAPI) getUsageKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	usage, err := a.Options.KVService.GetUsage(r.Context())
	if err != nil {
		Write(rw, http.StatusInternalServerError, "unable to fetch kv usage: %v", err)
		return
	}

	WriteJSON(rw, usage, http.StatusOK)
}

// Returns []*protos.KVObject as JSON
func (a *HTTPAPI) getAllKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	kvs, err := a.Options.KVService.GetAll(r.Context())
	if err != nil {
		Write(rw, http.StatusInternalServerError, "unable to fetch all kv objects: %v", err)
		return
	}

	WriteJSON(rw, kvs, http.StatusOK)
}

// Returns *protos.KVObject as JSON
func (a *HTTPAPI) getKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	key := strings.TrimPrefix(r.URL.Path, "/api/v1/kv/")

	// instead of doing this: params := httprouter.ParamsFromContext(r.Context())
	// because tests might not have a router started

	if key == "" {
		// Get the key from the path
		Write(rw, http.StatusInternalServerError, "bug? got a request for fetching a KV but key is empty")
		return
	}

	object, err := a.Options.KVService.Get(r.Context(), key)
	if err != nil {
		statusCode := http.StatusInternalServerError
		statusMsg := fmt.Sprintf("unable to fetch kv object '%s': %s", key, err)

		if err == redis.Nil {
			statusCode = http.StatusNotFound
			statusMsg = fmt.Sprintf("kv object '%s' not found", key)
		}

		Write(rw, statusCode, statusMsg)
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
		Write(rw, http.StatusBadRequest, "unable to read request body: %v", err)
		return
	}

	defer r.Body.Close()

	// Unmarshal input into pb's
	createHTTPRequest := &protos.KVCreateHTTPRequest{}

	if err := protojson.Unmarshal(body, createHTTPRequest); err != nil {
		Write(rw, http.StatusBadRequest, "unable to unmarshal request body: %v", err)
		return
	}

	// Validate the input
	if err := validate.KVCreateHTTPRequest(createHTTPRequest); err != nil {
		Write(rw, http.StatusBadRequest, "invalid request body: %v", err)
		return
	}

	// Attempt to create in KV service
	//
	// TODO: This should be updated to pass this data to the KV service via a chan;
	// this should be good enough for now though.
	if err := a.Options.KVService.Create(r.Context(), createHTTPRequest.Kvs, createHTTPRequest.Overwrite); err != nil {
		Write(rw, http.StatusInternalServerError, "unable to complete create KV request: %v", err)
		return
	}

	// Broadcast KV changes to other server nodes (reminder: we do this
	// so that the nodes can inform their connected SDKs of the change and the
	// SDKs can update their local KV state)
	// TODO: create broadcast handlers for emitting commands on KV updates
	if err := a.Options.BusService.BroadcastKVCreate(r.Context(), createHTTPRequest.Kvs, createHTTPRequest.Overwrite); err != nil {
		Write(rw, http.StatusInternalServerError, "unable to broadcast kv command: %v", err)
		return
	}

	WriteJSON(rw, createHTTPRequest.Kvs, http.StatusOK)
}

// Update one or more KV objects; returns (updated) []*protos.KVObject as JSON
func (a *HTTPAPI) updateKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		Write(rw, http.StatusBadRequest, "unable to read request body: %v", err)
		return
	}

	defer r.Body.Close()

	// Unmarshal input into pb's
	updateHTTPRequest := &protos.KVUpdateHTTPRequest{}

	if err := protojson.Unmarshal(body, updateHTTPRequest); err != nil {
		Write(rw, http.StatusBadRequest, "unable to unmarshal request body: %v", err)
		return
	}

	// Validate the input
	if err := validate.KVUpdateHTTPRequest(updateHTTPRequest); err != nil {
		Write(rw, http.StatusBadRequest, "invalid request body: %v", err)
		return
	}

	updateList := make([]*protos.KVObject, 0)

	for _, kv := range updateHTTPRequest.Kvs {
		// Exist check + we need existing to get created_at TS
		existing, err := a.Options.KVService.Get(r.Context(), kv.Key)
		if err != nil {
			Write(rw, http.StatusInternalServerError, "unable to fetch existing kv object '%s': %v", kv.Key, err)
			return
		}

		// Overwrite requested object's timestamps
		kv.CreatedAtUnixTsNanoUtc = existing.CreatedAtUnixTsNanoUtc
		kv.UpdatedAtUnixTsNanoUtc = time.Now().UTC().UnixNano()

		// Attempt to update in KV service
		updated, err := a.Options.KVService.Update(r.Context(), kv)
		if err != nil {
			Write(rw, http.StatusInternalServerError, "unable to complete update request: %v", err)
			return
		}

		// Add to update list
		updateList = append(updateList, updated)
	}

	// Broadcast KV changes to other server nodes (reminder: we do this
	// so that the nodes can inform their connected SDKs of the change and the
	// SDKs can update their local KV state)
	if err := a.Options.BusService.BroadcastKVUpdate(r.Context(), updateList); err != nil {
		Write(rw, http.StatusInternalServerError, "unable to broadcast update kv command: %v", err)
		return
	}

	WriteJSON(rw, updateList, http.StatusOK)
}

// Returns *ResponseJSON; status code 200 - ok; 400 - bad input; 404 - not found; 500 - internal server error
func (a *HTTPAPI) deleteKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	// Get the key
	params := httprouter.ParamsFromContext(r.Context())
	key := params.ByName("key")

	if key == "" {
		Write(rw, http.StatusInternalServerError, "bug? matched delete route for key but key is empty")
		return
	}

	// Does this kv exist?
	if _, err := a.Options.KVService.Get(r.Context(), key); err != nil {
		if strings.Contains(err.Error(), redis.Nil.Error()) {
			Write(rw, http.StatusNotFound, "kv with key '%s' not found", key)
			return
		}

		Write(rw, http.StatusInternalServerError, "unable to fetch existing kv object: %s", err)
		return
	}

	// Key exists; attempt to delete in KV
	if err := a.Options.KVService.Delete(r.Context(), key); err != nil {
		Write(rw, http.StatusInternalServerError, "unable to complete delete request: %s", err)
		return
	}

	// Broadcast KV changes to other server nodes (reminder: we do this
	// so that the nodes can inform their connected SDKs of the change and the
	// SDKs can update their local KV state)
	if err := a.Options.BusService.BroadcastKVDelete(r.Context(), key); err != nil {
		Write(rw, http.StatusInternalServerError, "unable to broadcast delete kv command: %s", err)
		return
	}

	Write(rw, http.StatusOK, "kv deleted")
}

// Returns *ResponseJSON; status code 200 - ok; 500 - internal server error
// "Message" indicates how many KV objects were deleted.
//
// THIS IS AN EXTREMELY DANGEROUS ENDPOINT.
func (a *HTTPAPI) deleteAllKVHandler(rw http.ResponseWriter, r *http.Request) {
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	yes := r.URL.Query().Get("yes")

	if yes != "please" {
		Write(rw, http.StatusBadRequest, "please pass ?yes=please to confirm you want to delete all kv objects")
		return
	}

	// Delete all kv objects
	if err := a.Options.KVService.DeleteAll(r.Context()); err != nil {
		Write(rw, http.StatusInternalServerError, "unable to complete delete all request: %s", err)
		return
	}

	// Broadcast the delete all change
	if err := a.Options.BusService.BroadcastKVDeleteAll(r.Context()); err != nil {
		Write(rw, http.StatusInternalServerError, "unable to broadcast delete all kv command: %s", err)
		return
	}

	Write(rw, http.StatusOK, "deletion request issued; please wait a few seconds for the change to propagate")
}
