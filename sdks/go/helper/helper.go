// Package helper contains WASM-related helper functions and methods.
// This package is separate from `go-sdk` to avoid polluting
// go-sdk's public API.
package helper

import (
	"github.com/bytecodealliance/wasmtime-go/v21"
	"github.com/pkg/errors"
	"google.golang.org/protobuf/proto"
)

// ReadRequestFromMemory is a helper function that reads raw memory starting at
// 'ptr' for 'length' bytes. Once read, it will attempt to unmarshal the data
// into the provided proto.Message.
func ReadRequestFromMemory(caller *wasmtime.Caller, msg proto.Message, ptr, length int32) error {
	if length <= 0 {
		return errors.New("length must be greater than 0")
	}

	if caller == nil {
		return errors.New("caller cannot be nil")
	}

	if msg == nil {
		return errors.New("msg cannot be nil")
	}

	memory := caller.GetExport("memory").Memory()
	if memory == nil {
		return errors.New("unable to get memory")
	}

	memBytes := memory.UnsafeData(caller)
	if length > int32(len(memBytes)) {
		return errors.New("length is greater than memory size")
	}

	data := memBytes[ptr : ptr+length]

	if err := proto.Unmarshal(data, msg); err != nil {
		return errors.Wrap(err, "unable to unmarshal HttpRequest")
	}

	return nil
}

func WriteResponseToMemory(caller *wasmtime.Caller, msg proto.Message) (int64, error) {
	if caller == nil {
		return 0, errors.New("caller cannot be nil")
	}

	if msg == nil {
		return 0, errors.New("msg cannot be nil")
	}

	data, err := proto.Marshal(msg)
	if err != nil {
		return 0, errors.Wrap(err, "unable to marshal response")
	}

	alloc := caller.GetExport("alloc").Func()
	if alloc == nil {
		return 0, errors.New("unable to get alloc func")
	}

	memory := caller.GetExport("memory").Memory()

	ptrLen := int32(len(data))

	// Allocate memory for response
	allocRes, err := alloc.Call(caller, ptrLen)
	if err != nil {
		return 0, errors.Wrap(err, "unable to allocate hostfunc response memory")
	}

	allocRes32 := allocRes.(int32)

	if allocRes32 == 0 {
		return 0, errors.New("alloc returned unexpected number of results")
	}

	// Write memory to allocated space
	// Write memory to wasmtime
	memBytes := memory.UnsafeData(caller)
	if len(memBytes) < int(ptrLen) {
		return 0, errors.New("payload length is greater than memory size")
	}

	copy(memBytes[allocRes32:], data)

	result := (int64(allocRes32) << int64(32)) | int64(len(data))

	return int64(result), nil
}
