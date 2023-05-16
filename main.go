package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/wasmerio/wasmer-go/wasmer"

	"github.com/streamdal/detective-wasm/common"
)

/*

This is the "best" working example (using wasmer).

This example uses alloc() and dealloc() which is the proper way to manage mem
in WASM (and avoids potentially corrupting Go runtime's mem).

This example also has a fully working bench.

The bench perf can be *definitely* improved, especially when it comes to copying
and clearing mem.

Less if/else statements (and relying on implicit panics) would also lower the
number of CPU instructions.

Some other potential improvements: set a max size for input (1MB?), grow memory
only when needed.


*/

func main() {
	inst, store, err := setup("src/string_contains.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	f, err := inst.Exports.GetFunction("f")
	if err != nil {
		panic("unable to get func: " + err.Error())
	}

	alloc, err := inst.Exports.GetFunction("alloc")
	if err != nil {
		panic("unable to get alloc func: " + err.Error())
	}

	dealloc, err := inst.Exports.GetFunction("dealloc")
	if err != nil {
		panic("unable to get dealloc func: " + err.Error())
	}

	// TODO: expose allocate & deallocate

	jsonData, err := os.ReadFile("json-examples/large.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	request := &common.Request{
		Path: "firstname",
		Data: jsonData,
		Args: map[string]string{
			"test": "hello",
		},
	}

	req, err := request.MarshalJSON()
	if err != nil {
		panic("unable to generate request: " + err.Error())
	}

	response, err := performRun(inst, store, f, alloc, dealloc, req)
	if err != nil {
		panic("error during performRun: " + err.Error())
	}

	fmt.Printf("Valid: %t\n", response.Valid)
}

func performRun(inst *wasmer.Instance, store *wasmer.Store, f wasmer.NativeFunction, alloc wasmer.NativeFunction, dealloc wasmer.NativeFunction, request []byte) (*common.Response, error) {

	ptr, err := alloc(len(request))
	if err != nil {
		panic("unable to allocate memory: " + err.Error())
	}

	ptrVal, ok := ptr.(int32)
	if !ok {
		panic("unable to convert ptr to int32")
	}

	mem, err := writeMemory(inst, request, ptrVal)
	if err != nil {
		panic("unable to write memory: " + err.Error())
	}

	result, err := f(ptrVal, len(request))
	if err != nil {
		// Clear mem on error
		if _, err := dealloc(ptrVal, int32(len(request))); err != nil {
			panic("unable to deallocate memory: " + err.Error())
		}
		panic("error during func call: " + err.Error())
	}

	// Dealloc request memory
	if _, err := dealloc(ptrVal, int32(len(request))); err != nil {
		panic("unable to deallocate memory: " + err.Error())
	}

	// Read memory starting from result ptr
	returnData, err := ReadMemory(mem.Data(), result, -1)
	if err != nil {
		panic("error during ReadMemory: " + err.Error())
	}

	resp := &common.Response{}

	if err := resp.UnmarshalJSON(returnData); err != nil {
		panic("error during tinyjson.Unmarshal: " + err.Error())
	}

	rlen := int32(len(returnData))
	//fmt.Printf("result ptr: %d\n", result)
	//fmt.Printf("return data: %s\n", returnData)
	// panic is here
	if _, err := dealloc(result, rlen); err != nil {
		panic("error during dealloc: " + err.Error())
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

func setup(file string) (*wasmer.Instance, *wasmer.Store, error) {
	wasmBytes, err := os.ReadFile(file)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read wasm file: %w", err)
	}

	store := wasmer.NewStore(wasmer.NewEngine())

	// Compiles the module
	module, err := wasmer.NewModule(store, wasmBytes)
	if err != nil {
		panic(fmt.Sprintln("failed to compile module:", err))
	}

	wasiEnv, err := wasmer.NewWasiStateBuilder("wasi-program").
		// Choose according to your actual situation
		// Argument("--foo").
		// Environment("ABC", "DEF").
		// MapDirectory("./", ".").
		Finalize()
	if err != nil {
		panic(fmt.Sprintln("failed to generate wasi env:", err))
	}

	importObject, err := wasiEnv.GenerateImportObject(store, module)
	if err != nil {
		panic(fmt.Sprintln("failed to generate import object:", err))
	}

	// Instantiates the module
	instance, err := wasmer.NewInstance(module, importObject)
	if err != nil {
		panic(fmt.Sprintln("failed to instantiate module:", err))
	}

	return instance, store, nil

	//engine := wasmtime.NewEngine()
	//
	//// Compiles the module
	//mod, err := wasmtime.NewModule(engine, wasmBytes)
	//if err != nil {
	//	return nil, nil, fmt.Errorf("unable to compile module: %w", err)
	//}
	//
	//linker := wasmtime.NewLinker(engine)
	//
	//if err := linker.DefineWasi(); err != nil {
	//	return nil, nil, fmt.Errorf("unable to define wasi: %w", err)
	//}
	//
	//store := wasmtime.NewStore(engine)
	//
	//wasiConfig := wasmtime.NewWasiConfig()
	//
	//store.SetWasi(wasiConfig)
	//
	//inst, err := linker.Instantiate(store, mod)
	//if err != nil {
	//	return nil, nil, fmt.Errorf("unable to instantiate module: %w", err)
	//}
	//
	//mem := inst.GetExport(store, "memory").Memory()
	//if _, err := mem.Grow(store, 5); err != nil {
	//	panic("unable to grow memory: " + err.Error())
	//}
	//
	//return inst, store, nil
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
		//fmt.Println("Byte num: ", v)
		//fmt.Println("Byte str:", string(v))

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
