package hostfunc

import (
	"context"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos/steps"
	"github.com/tetratelabs/wazero/api"

	"github.com/streamdal/snitch-go-client/helper"
)

// KVExists is function that is exported to and called from a Rust WASM module
func (h *HostFunc) KVExists(_ context.Context, module api.Module, ptr, length int32) int32 {
	// Read request
	request := &steps.KVExistsRequest{}

	if err := helper.ReadRequestFromMemory(module, request, ptr, length); err != nil {
		return kvExistsResponse(module, "unable to read KVExistsRequest params: "+err.Error(), false, false)
	}

	if err := validateKVExistsRequest(request); err != nil {
		return kvExistsResponse(module, "unable to validate KVExistsRequest: "+err.Error(), false, false)
	}

	// Perform operation
	exists := h.kv.Exists(request.Key)

	// Return response
	return kvExistsResponse(module, "lookup succeeded", false, exists)
}

// Generates a protobuf response, writes to mem, and returns ptr to mem
func kvExistsResponse(module api.Module, msg string, isError, exists bool) int32 {
	resp := &steps.KVExistsResponse{
		Exists:  exists,
		IsError: isError,
		Message: msg,
	}

	addr, err := helper.WriteResponseToMemory(module, resp)
	if err != nil {
		panic("unable to write KVExistsResponse to memory: " + err.Error())
	}

	return addr
}

func validateKVExistsRequest(request *steps.KVExistsRequest) error {
	if request == nil {
		return errors.New("request cannot be nil")
	}

	if request.Key == "" {
		return errors.New("request.Key cannot be empty")
	}

	if request.Mode != steps.KVExistsMode_KV_EXISTS_MODE_STATIC && request.Mode != steps.KVExistsMode_KV_EXISTS_MODE_DYNAMIC {
		return errors.New("request.Mode must be either KV_EXISTS_MODE_STATIC or KV_EXISTS_MODE_DYNAMIC")
	}

	return nil
}
