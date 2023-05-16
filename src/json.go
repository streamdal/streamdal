package main

import (
	"reflect"
	"runtime"
	"unsafe"

	"github.com/buger/jsonparser"

	"github.com/streamdal/detective-wasm/common"
)

/*


 */

// Tiny-go needs a main function to compile`
func main() {}

//export f
func f(ptr int32, length int32) int32 {
	//fmt.Println("Execution occurred!")

	data := make([]byte, 0, length)

	// Use a for loop to read each byte and append result into data
	for i := 0; i < int(length); i++ {
		// Convert the pointer to a byte pointer and dereference it to get the byte value
		bytePtr := (*byte)(unsafe.Pointer(uintptr(ptr) + uintptr(i)))
		byteVal := *bytePtr

		data = append(data, byteVal)
	}

	req := &common.Request{}

	if err := req.UnmarshalJSON(data); err != nil {
		panic("error during tinyjson.Unmarshal: " + err.Error())
	}

	modified, err := jsonparser.Set(req.Data, []byte(`"Batman"`), req.Path)
	if err != nil {
		panic("error during jsonparser.Set: " + err.Error())
	}

	// write response data
	resp := &common.Response{
		Data:  modified,
		Valid: true,
	}

	// Serialize resp
	returnData, err := resp.MarshalJSON()
	if err != nil {
		panic("error during tinyjson.Marshal: " + err.Error())
	}

	// Add terminator sequence
	returnData = append(returnData, 166, 166, 166)

	return *(*int32)(unsafe.Pointer(&returnData))
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
