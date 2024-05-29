package hostfunc

import (
	"fmt"

	"github.com/bytecodealliance/wasmtime-go/v21"
	"github.com/pkg/errors"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"
	"github.com/streamdal/streamdal/sdks/go/helper"
)

// KVExists is function that is exported to and called from a Rust WASM module
func (h *HostFunc) KVExists(caller *wasmtime.Caller, ptr, length int32) int64 {
	// Read request
	request := &steps.KVStep{}

	if err := helper.ReadRequestFromMemory(caller, request, ptr, length); err != nil {
		return kvExistsResponse(caller, "unable to read KVExistsRequest params: "+err.Error(), true, false)
	}

	if err := validateKVStep(request); err != nil {
		return kvExistsResponse(caller, "unable to validate KVExistsRequest: "+err.Error(), true, false)
	}

	// Perform operation
	exists := h.kv.Exists(request.Key)

	msg := fmt.Sprintf("key '%s' does not exist", request.Key)

	if exists {
		msg = fmt.Sprintf("key '%s' exists", request.Key)
	}

	// Return response
	return kvExistsResponse(caller, msg, false, exists)
}

// Generates a protobuf response, writes to mem, and returns ptr to mem
func kvExistsResponse(caller *wasmtime.Caller, msg string, isError, exists bool) int64 {
	var status steps.KVStatus

	if exists {
		status = steps.KVStatus_KV_STATUS_SUCCESS
	} else {
		status = steps.KVStatus_KV_STATUS_FAILURE
	}

	if isError {
		status = steps.KVStatus_KV_STATUS_ERROR
	}

	resp := &steps.KVStepResponse{
		Status:  status,
		Message: msg,
		Value:   nil, // KVExists does not fill value
	}

	addr, err := helper.WriteResponseToMemory(caller, resp)
	if err != nil {
		panic("unable to write KVExistsResponse to memory: " + err.Error())
	}

	return addr
}

func validateKVStep(request *steps.KVStep) error {
	if request == nil {
		return errors.New("request cannot be nil")
	}

	if request.Key == "" {
		return errors.New("request.Key cannot be empty")
	}

	// TODO: Will eventually want to perform KVAction specific validations; good enough for now

	return nil
}
