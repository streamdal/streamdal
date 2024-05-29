package streamdal

import (
	"context"
	"fmt"
	"sync"

	"github.com/bytecodealliance/wasmtime-go/v21"
	"github.com/pkg/errors"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

type function struct {
	ID      string
	Inst    *wasmtime.Instance
	entry   *wasmtime.Func
	alloc   *wasmtime.Func
	dealloc *wasmtime.Func
	memory  *wasmtime.Memory
	mtx     *sync.Mutex
	store   *wasmtime.Store
}

func (f *function) Exec(_ context.Context, req []byte) ([]byte, error) {
	ptrLen := int32(len(req))

	inputPtr, err := f.alloc.Call(f.store, ptrLen)
	if err != nil {
		return nil, errors.Wrap(err, "unable to allocate memory")
	}

	inputPtr32, ok := inputPtr.(int32)
	if !ok {
		return nil, errors.New("unable to type-assert alloc() result")
	}

	if inputPtr32 == 0 {
		return nil, errors.New("unable to allocate memory")
	}

	ptrVal := inputPtr32

	// Write memory to wasmtime
	memBytes := f.memory.UnsafeData(f.store)
	if len(memBytes) < int(ptrLen) {
		return nil, errors.New("payload length is greater than memory size")
	}

	copy(memBytes[ptrVal:], req)

	result, err := f.entry.Call(f.store, ptrVal, ptrLen)
	if err != nil {
		// Clear mem on error
		if _, err := f.dealloc.Call(f.store, ptrVal, ptrLen); err != nil {
			return nil, errors.Wrap(err, "unable to deallocate result memory")
		}
		return nil, errors.Wrap(err, "error during func call")
	}

	result64, ok := result.(int64)
	if !ok {
		return nil, errors.New("unable to typecast result")
	}

	resultPtr := uint32(result64 >> 32)
	resultSize := uint32(result64)

	// Dealloc request memory
	if _, err := f.dealloc.Call(f.store, ptrVal, ptrLen); err != nil {
		return nil, errors.Wrap(err, "unable to deallocate request memory")
	}

	// Read memory starting from result ptr
	resBytes, err := f.readMemory(resultPtr, resultSize)
	if err != nil {
		// Dealloc response memory
		if _, err := f.dealloc.Call(f.store, int32(resultPtr), int32(resultSize)); err != nil {
			return nil, errors.Wrap(err, "unable to deallocate result memory")
		}
		return nil, errors.Wrap(err, "unable to read memory")
	}

	// Dealloc result memory
	if _, err := f.dealloc.Call(f.store, int32(resultPtr), int32(resultSize)); err != nil {
		return nil, errors.Wrap(err, "unable to deallocate result memory")
	}

	return resBytes, nil
}

func (s *Streamdal) setFunctionCache(wasmID string, f *function, workerID int) {
	s.functionsMtx.Lock()
	defer s.functionsMtx.Unlock()

	if _, ok := s.functions[workerID]; !ok {
		s.functions[workerID] = make(map[string]*function)
	}

	s.functions[workerID][wasmID] = f
}

func (s *Streamdal) getFunction(_ context.Context, step *protos.PipelineStep, workerID int) (*function, error) {
	// check cache
	fc, ok := s.getFunctionFromCache(step.GetXWasmId(), workerID)
	if ok {
		return fc, nil
	}

	// Function is not in cache - let's create it but make sure that the creation
	// is locked for this specific wasm ID - that way another .Process() call
	// will wait for the create to finish.
	wasmIDMtx := s.getLockForWasmID(step.GetXWasmId())

	wasmIDMtx.Lock()
	defer wasmIDMtx.Unlock()

	fi, err := s.createFunction(step)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create function")
	}

	// Cache function
	s.setFunctionCache(step.GetXWasmId(), fi, workerID)

	return fi, nil
}

func (s *Streamdal) getLockForWasmID(wasmID string) *sync.Mutex {
	s.funcCreateMtx.Lock()
	defer s.funcCreateMtx.Unlock()

	if mtx, ok := s.funcCreate[wasmID]; ok {
		return mtx
	}

	// No existing lock found for wasm ID - create it
	s.funcCreate[wasmID] = &sync.Mutex{}

	return s.funcCreate[wasmID]
}

func (s *Streamdal) getFunctionFromCache(wasmID string, workerID int) (*function, bool) {
	// We need to do this here because there is a possibility that .Process()
	// was called for the first time in parallel and the function has not been
	// created yet. We need a mechanism to wait for the function creation to
	// complete before we perform a cache lookup.
	wasmIDMtx := s.getLockForWasmID(wasmID)

	// If this blocks, it is because createFunction() is in the process of
	// creating a function. Once it is complete, the lock will be released and
	// our cache lookup will succeed.
	wasmIDMtx.Lock()
	wasmIDMtx.Unlock()

	s.functionsMtx.RLock()
	defer s.functionsMtx.RUnlock()

	if _, ok := s.functions[workerID]; !ok {
		return nil, false
	}

	f, ok := s.functions[workerID][wasmID]
	return f, ok
}

func (s *Streamdal) getWasmBytesCache(funcID string) ([]byte, bool) {
	s.wasmCacheMtx.RLock()
	defer s.wasmCacheMtx.RUnlock()

	wb, ok := s.wasmCache[funcID]
	return wb, ok
}

func (s *Streamdal) setWasmBytesCache(funcID string, wb []byte) {
	s.wasmCacheMtx.Lock()
	defer s.wasmCacheMtx.Unlock()

	s.wasmCache[funcID] = wb
}

func (s *Streamdal) createFunction(step *protos.PipelineStep) (*function, error) {
	// We need to cache wasm bytes so that we can instantiate the module
	// When running in async mode, createWASMInstanceWasmtime will be hit multiple times, but we need to wipe the wasmBytes
	// from the pipeline step after the first run, so that we don't hold multiple MB of duplicate data in memory
	wasmBytes, ok := s.getWasmBytesCache(step.GetXWasmId())
	if !ok {
		// Not cached yet, check if it's in the step
		stepWasmBytes := step.GetXWasmBytes()
		if len(stepWasmBytes) == 0 {
			// WASM bytes are not in cache or step, error out
			return nil, errors.New("wasm data is empty")
		}

		// Cache the bytes so we can wipe from the step
		s.setWasmBytesCache(step.GetXWasmId(), stepWasmBytes)
		wasmBytes = stepWasmBytes
	}

	hostFuncs := map[string]func(caller *wasmtime.Caller, ptr, length int32) int64{
		"kvExists":    s.hf.KVExists,
		"httpRequest": s.hf.HTTPRequest,
	}

	config := wasmtime.NewConfig()
	config.SetEpochInterruption(true)
	engine := wasmtime.NewEngineWithConfig(config)

	module, err := wasmtime.NewModule(engine, wasmBytes)
	if err != nil {
		return nil, errors.Wrap(err, "unable to compile WASM module")
	}

	linker := wasmtime.NewLinker(engine)

	if err := linker.DefineWasi(); err != nil {
		return nil, errors.Wrap(err, "unable to define WASI")
	}

	store := wasmtime.NewStore(engine)

	// TODO: this is how wasmtime controls execution timeouts
	// TODO: is it possible to do this in a way that doesn't require a global setting?
	store.SetEpochDeadline(60)

	for name, fn := range hostFuncs {
		if err := linker.DefineFunc(store, "env", name, fn); err != nil {
			return nil, errors.Wrapf(err, "unable to define host function '%s'", name)
		}
	}

	wasiConfig := wasmtime.NewWasiConfig()

	store.SetWasi(wasiConfig)

	inst, err := linker.Instantiate(store, module)
	if err != nil {
		panic("unable to instantiate module" + err.Error())
	}

	// alloc allows us to pre-allocate memory in order to pass data to the WASM module
	alloc := inst.GetExport(store, "alloc").Func()
	if alloc == nil {
		return nil, errors.New("unable to get alloc func")
	}

	// dealloc allows us to free memory passed to the wasm module after we're done with it
	dealloc := inst.GetExport(store, "dealloc").Func()
	if dealloc == nil {
		return nil, errors.New("unable to get dealloc func")
	}

	mem := inst.GetExport(store, "memory").Memory()
	if mem == nil {
		return nil, errors.New("unable to get memory")

	}

	// This is the actual function we'll be executing
	f := inst.GetExport(store, step.GetXWasmFunction()).Func()
	if f == nil {
		return nil, fmt.Errorf("unable to get exported function '%s'", step.GetXWasmFunction())
	}

	if _, err := mem.Grow(store, 1000); err != nil {
		return nil, errors.Wrap(err, "unable to grow memory")
	}

	return &function{
		ID:      step.GetXWasmId(),
		Inst:    inst,
		entry:   f,
		alloc:   alloc,
		dealloc: dealloc,
		memory:  mem,
		store:   store,
		mtx:     &sync.Mutex{},
	}, nil
}

func (f *function) readMemory(ptr, length uint32) ([]byte, error) {
	if length == 0 {
		return nil, errors.New("must read at least 1 byte of memory")
	}
	if ptr < 0 || length < 0 {
		return nil, errors.New("ptr and length must be positive")
	}

	memBytes := f.memory.UnsafeData(f.store)
	if length > uint32(len(memBytes)) {
		return nil, errors.New("length is greater than memory size")
	}

	return memBytes[ptr : ptr+length], nil
}
