package dataqual

import (
	"context"
	"github.com/pkg/errors"
	"github.com/wasmerio/wasmer-go/wasmer"
)

type function struct {
	Inst    *wasmer.Instance
	f       wasmer.NativeFunction
	alloc   wasmer.NativeFunction
	dealloc wasmer.NativeFunction
}

func (f *function) Exec(req []byte) ([]byte, error) {
	ptr, err := f.alloc(len(req))
	if err != nil {
		return nil, errors.Wrap(err, "unable to allocate memory")
	}

	ptrVal, ok := ptr.(int32)
	if !ok {
		return nil, errors.Wrap(err, "unable to convert ptr to int32")
	}

	mem, err := writeMemory(f.Inst, req, ptrVal)
	if err != nil {
		return nil, errors.Wrap(err, "unable to write memory")
	}

	result, err := f.f(ptrVal, len(req))
	if err != nil {
		// Clear mem on error
		if _, err := f.dealloc(ptrVal, int32(len(req))); err != nil {
			return nil, errors.Wrap(err, "unable to deallocate memory")
		}
		return nil, errors.Wrap(err, "error during func call")
	}

	// Dealloc request memory
	if _, err := f.dealloc(ptrVal, int32(len(req))); err != nil {
		return nil, errors.Wrap(err, "unable to deallocate memory")
	}

	// Read memory starting from result ptr
	returnData, err := readMemory(mem.Data(), result, -1)
	if err != nil {
		return nil, errors.Wrap(err, "error during readMemory")
	}

	return returnData, nil
}

func (d *DataQual) setFunctionCache(m Module, f *function) {
	d.functionsMtx.Lock()
	defer d.functionsMtx.Unlock()

	d.functions[m] = f
}

func (d *DataQual) getFunction(m Module) (*function, error) {
	// check cache
	fc, ok := d.getFunctionFromCache(m)
	if ok {
		return fc, nil
	}

	wasmData, err := d.plumber.GetWasmFile(context.Background(), string(m)+".wasm")
	if err != nil {
		return nil, err
	}

	fi, err := createFunction(wasmData)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create function")
	}

	// Cache function
	d.setFunctionCache(m, fi)

	return fi, nil
}

func (d *DataQual) getFunctionFromCache(rt Module) (*function, bool) {
	d.functionsMtx.RLock()
	defer d.functionsMtx.RUnlock()

	f, ok := d.functions[rt]
	return f, ok
}

func createFunction(wasmBytes []byte) (*function, error) {
	inst, err := createWASMInstance(wasmBytes)
	if err != nil {
		return nil, errors.Wrap(err, "failed to instantiate WASM module")
	}

	// This is the actual function we'll be executing
	f, err := inst.Exports.GetFunction("f")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get func")
	}

	// alloc allows us to pre-allocate memory in order to pass data to the WASM module
	alloc, err := inst.Exports.GetFunction("alloc")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get alloc func")
	}

	// dealloc allows us to free memory passed to the wasm module after we're done with it
	dealloc, err := inst.Exports.GetFunction("dealloc")
	if err != nil {
		return nil, errors.Wrap(err, "unable to get dealloc func")
	}

	return &function{
		Inst:    inst,
		f:       f,
		alloc:   alloc,
		dealloc: dealloc,
	}, nil
}
