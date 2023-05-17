package main

import (
	"fmt"
	"os"

	"github.com/pkg/errors"
	"github.com/streamdal/detective-wasm/detective"

	"github.com/streamdal/detective-wasm/common"
	"github.com/wasmerio/wasmer-go/wasmer"
)

func main() {
	match()
	transform()
}

func match() {
	inst, err := setup("src/match.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	jsonData, err := os.ReadFile("json-examples/small.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	request := &common.MatchRequest{
		Path:      "firstname",
		Data:      jsonData,
		Args:      []string{"Rani", "Mark"},
		MatchType: detective.StringContainsAny,
	}

	req, err := request.MarshalJSON()
	if err != nil {
		panic("unable to generate request: " + err.Error())
	}

	response, err := performMatchRun(inst, req)
	if err != nil {
		panic("error during performMatchRun: " + err.Error())
	}

	fmt.Printf("Is Match: %t\n", response.IsMatch)
}

func transform() {
	inst, err := setup("src/transform.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	jsonData, err := os.ReadFile("json-examples/small.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	request := &common.TransformRequest{
		Path:  "firstname",
		Data:  jsonData,
		Value: `"Mark Was Here"`,
	}

	req, err := request.MarshalJSON()
	if err != nil {
		panic("unable to generate request: " + err.Error())
	}

	response, err := performTransformRun(inst, req)
	if err != nil {
		panic("error during performTransformRun: " + err.Error())
	}

	println(string(response.Data))
}

func performTransformRun(inst *wasmer.Instance, request []byte) (*common.TransformResponse, error) {
	f, err := inst.Exports.GetFunction("f")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get func")
	}

	alloc, err := inst.Exports.GetFunction("alloc")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get alloc func")
	}

	dealloc, err := inst.Exports.GetFunction("dealloc")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get dealloc func")
	}

	ptr, err := alloc(len(request))
	if err != nil {
		return nil, errors.Wrap(err, "unable to allocate memory")
	}

	ptrVal, ok := ptr.(int32)
	if !ok {
		return nil, errors.Wrap(err, "unable to convert ptr to int32")
	}

	mem, err := writeMemory(inst, request, ptrVal)
	if err != nil {
		return nil, errors.Wrap(err, "unable to write memory")
	}

	result, err := f(ptrVal, len(request))
	if err != nil {
		// Clear mem on error
		if _, err := dealloc(ptrVal, int32(len(request))); err != nil {
			return nil, errors.Wrap(err, "unable to deallocate memory")
		}
		return nil, errors.Wrap(err, "error during func call")
	}

	// Dealloc request memory
	if _, err := dealloc(ptrVal, int32(len(request))); err != nil {
		return nil, errors.Wrap(err, "unable to deallocate memory")
	}

	// Read memory starting from result ptr
	returnData, err := ReadMemory(mem.Data(), result, -1)
	if err != nil {
		return nil, errors.Wrap(err, "error during ReadMemory")
	}

	resp := &common.TransformResponse{}

	if err := resp.UnmarshalJSON(returnData); err != nil {
		return nil, errors.Wrap(err, "error during tinyjson.Unmarshal")
	}

	rlen := int32(len(returnData))
	//fmt.Printf("result ptr: %d\n", result)
	//fmt.Printf("return data: %#v\n", resp)
	//panic is here
	if _, err := dealloc(result, rlen); err != nil {
		return nil, errors.Wrap(err, "error during dealloc")
	}

	return resp, nil
}

func performMatchRun(inst *wasmer.Instance, request []byte) (*common.MatchResponse, error) {
	f, err := inst.Exports.GetFunction("f")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get func")
	}

	alloc, err := inst.Exports.GetFunction("alloc")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get alloc func")
	}

	dealloc, err := inst.Exports.GetFunction("dealloc")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get dealloc func")
	}

	ptr, err := alloc(len(request))
	if err != nil {
		return nil, errors.Wrap(err, "unable to allocate memory")
	}

	ptrVal, ok := ptr.(int32)
	if !ok {
		panic("unable to convert ptr to int32")
	}

	mem, err := writeMemory(inst, request, ptrVal)
	if err != nil {
		return nil, errors.Wrap(err, "unable to write memory")
	}

	result, err := f(ptrVal, len(request))
	if err != nil {
		// Clear mem on error
		if _, err := dealloc(ptrVal, int32(len(request))); err != nil {
			return nil, errors.Wrap(err, "unable to deallocate memory")
		}
		return nil, errors.Wrap(err, "error during func call")
	}

	// Dealloc request memory
	if _, err := dealloc(ptrVal, int32(len(request))); err != nil {
		return nil, errors.Wrap(err, "unable to deallocate memory")
	}

	// Read memory starting from result ptr
	returnData, err := ReadMemory(mem.Data(), result, -1)
	if err != nil {
		return nil, errors.Wrap(err, "error during ReadMemory")
	}

	resp := &common.MatchResponse{}

	if err := resp.UnmarshalJSON(returnData); err != nil {
		return nil, errors.Wrap(err, "error during tinyjson.Unmarshal")
	}

	rlen := int32(len(returnData))
	//fmt.Printf("result ptr: %d\n", result)
	//fmt.Printf("return data: %#v\n", resp)
	// panic is here
	if _, err := dealloc(result, rlen); err != nil {
		return nil, errors.Wrap(err, "error during dealloc")
	}

	return resp, nil
}

func writeMemory(inst *wasmer.Instance, data []byte, ptr int32) (*wasmer.Memory, error) {
	mem, err := inst.Exports.GetMemory("memory")
	if err != nil {
		return nil, fmt.Errorf("unable to get memory: %w", err)
	}

	copy(mem.Data()[ptr:], data)

	return mem, nil
}

func setup(file string) (*wasmer.Instance, error) {
	wasmBytes, err := os.ReadFile(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read wasm file: %w", err)
	}

	store := wasmer.NewStore(wasmer.NewEngine())

	// Compiles the module
	module, err := wasmer.NewModule(store, wasmBytes)
	if err != nil {
		return nil, errors.Wrap(err, "failed to compile module")
	}

	wasiEnv, err := wasmer.NewWasiStateBuilder("wasi-program").
		// Choose according to your actual situation
		// Argument("--foo").
		// Environment("ABC", "DEF").
		// MapDirectory("./", ".").
		Finalize()
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate wasi env")
	}

	importObject, err := wasiEnv.GenerateImportObject(store, module)
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate import object")
	}

	// Instantiates the module
	instance, err := wasmer.NewInstance(module, importObject)
	if err != nil {
		return nil, errors.Wrap(err, "failed to instantiate module")
	}

	return instance, nil
}

func ReadMemory(memory []byte, ptr interface{}, length int) ([]byte, error) {
	if memory == nil {
		return nil, errors.New("memory cannot be nil")
	}

	// ptr should be an int32
	ptrInt32, ok := ptr.(int32)
	if !ok {
		return nil, fmt.Errorf("ptr should be an int32")
	}

	//fmt.Printf("Got ptr result: %d\n", ptrInt32)

	data := make([]byte, 0)
	nullHits := 0

	for i, v := range memory[ptrInt32:] {
		// Have length, can quit
		if length != -1 {
			if i == length {
				break
			}
		}

		if nullHits == 3 {
			break
		}

		// Don't have a length, have to see if we hit three null terminators (166)
		if v == 166 {
			nullHits++
			continue
		}

		// Got a null terminator, we are done
		//if v == 0 {
		//	break
		//}

		data = append(data, v)
	}

	return data, nil
}
