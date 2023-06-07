package dataqual

import (
	"context"
	"log"

	"github.com/tetratelabs/wazero/api"

	"github.com/pkg/errors"
)

type function struct {
	Inst    api.Module
	f       api.Function
	alloc   api.Function
	dealloc api.Function
}

func (f *function) Exec(req []byte) ([]byte, error) {
	ctx := context.Background()

	ptrLen := uint64(len(req))

	inputPtr, err := f.alloc.Call(ctx, ptrLen)
	if err != nil {
		return nil, errors.Wrap(err, "unable to allocate memory")
	}

	if len(inputPtr) == 0 {
		return nil, errors.New("unable to allocate memory")
	}

	ptrVal := inputPtr[0]

	if !f.Inst.Memory().Write(uint32(ptrVal), req) {
		// TODO: no panics
		log.Panicf("Memory.Write(%d, %d) out of range of memory size %d",
			ptrVal, len(req), f.Inst.Memory().Size())
	}

	result, err := f.f.Call(ctx, ptrVal, ptrLen)
	if err != nil {
		// Clear mem on error
		if _, err := f.dealloc.Call(ctx, ptrVal, ptrLen); err != nil {
			return nil, errors.Wrap(err, "unable to deallocate memory")
		}
		return nil, errors.Wrap(err, "error during func call")
	}

	resultPtr := uint32(result[0])

	// Dealloc request memory
	if _, err := f.dealloc.Call(ctx, ptrVal, ptrLen); err != nil {
		return nil, errors.Wrap(err, "unable to deallocate memory")
	}

	// Read memory starting from result ptr
	bytes, err := f.ReadMemory(resultPtr, -1)

	return bytes, nil
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
		return nil, err
	}

	// This is the actual function we'll be executing
	f := inst.ExportedFunction("f")
	if f == nil {
		return nil, errors.New("unable to get func")
	}

	// alloc allows us to pre-allocate memory in order to pass data to the WASM module
	alloc := inst.ExportedFunction("alloc")
	if alloc == nil {
		return nil, errors.New("unable to get alloc func")
	}

	// dealloc allows us to free memory passed to the wasm module after we're done with it
	dealloc := inst.ExportedFunction("dealloc")
	if dealloc == nil {
		return nil, errors.New("unable to get dealloc func")
	}

	return &function{
		Inst:    inst,
		f:       f,
		alloc:   alloc,
		dealloc: dealloc,
	}, nil
}
