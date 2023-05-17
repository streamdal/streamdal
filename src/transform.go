package main

import (
	"reflect"
	"runtime"
	"unsafe"

	"github.com/pkg/errors"

	"github.com/buger/jsonparser"
	"github.com/streamdal/detective-wasm/common"
)

// Tiny-go needs a main function to compile`
func main() {}

//export f
func f(ptr int32, length int32) int32 {

	data := make([]byte, 0, length)

	// Use a for loop to read each byte and append result into data
	for i := 0; i < int(length); i++ {
		// Convert the pointer to a byte pointer and dereference it to get the byte value
		bytePtr := (*byte)(unsafe.Pointer(uintptr(ptr) + uintptr(i)))
		byteVal := *bytePtr

		data = append(data, byteVal)
	}

	req := &common.TransformRequest{}

	if err := req.UnmarshalJSON(data); err != nil {
		err = errors.Wrap(err, "unable to unmarshal json")
		return common.ReturnTransformResponse(data, err)
	}

	modified, err := jsonparser.Set(req.Data, []byte(req.Value), req.Path)
	if err != nil {
		err = errors.Wrap(err, "failed to run jsonparser.Set")
		return common.ReturnTransformResponse(data, err)
	}

	return common.ReturnTransformResponse(modified, nil)
}

// potential terminator: \xa6\xa6\xa6 / (166, 166, 166) / ¦¦¦

// Copied from suborbital
//
//export alloc
func alloc(size int32) uintptr {
	arr := make([]byte, size)

	header := (*reflect.SliceHeader)(unsafe.Pointer(&arr))

	runtime.KeepAlive(arr)

	return uintptr(header.Data)
}

// Copied from suborbital
//
//export dealloc
func dealloc(pointer uintptr, size int32) {
	var arr []byte

	header := (*reflect.SliceHeader)(unsafe.Pointer(&arr))
	header.Data = pointer
	header.Len = uintptr(size)
	header.Cap = uintptr(size) // differ from standard Go, where they are both int

	arr = nil // I think this is sufficient to mark the slice for garbage collection
}
