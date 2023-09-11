package snitch

import (
	"context"
	"fmt"
	"io"

	"github.com/pkg/errors"
	"github.com/tetratelabs/wazero"
	"github.com/tetratelabs/wazero/api"
	"github.com/tetratelabs/wazero/imports/wasi_snapshot_preview1"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-protos/build/go/protos"
)

type function struct {
	ID      string
	Inst    api.Module
	entry   api.Function
	alloc   api.Function
	dealloc api.Function
}

func (f *function) Exec(ctx context.Context, req []byte) ([]byte, error) {
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
		return nil, fmt.Errorf("Memory.Write(%d, %d) out of range of memory size %d",
			ptrVal, len(req), f.Inst.Memory().Size())
	}

	result, err := f.entry.Call(ctx, ptrVal, ptrLen)
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
	resBytes, err := f.ReadMemory(resultPtr, -1)

	return resBytes, nil
}

func (s *Snitch) setFunctionCache(wasmID string, f *function) {
	s.functionsMtx.Lock()
	defer s.functionsMtx.Unlock()

	s.functions[wasmID] = f
}

func (s *Snitch) getFunction(_ context.Context, step *protos.PipelineStep) (*function, error) {
	// check cache
	fc, ok := s.getFunctionFromCache(step.GetXWasmId())
	if ok {
		return fc, nil
	}

	fi, err := s.createFunction(step)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create function")
	}

	// Cache function
	s.setFunctionCache(step.GetXWasmId(), fi)

	return fi, nil
}

func (s *Snitch) getFunctionFromCache(wasmID string) (*function, bool) {
	s.functionsMtx.RLock()
	defer s.functionsMtx.RUnlock()

	f, ok := s.functions[wasmID]
	return f, ok
}

func (s *Snitch) createFunction(step *protos.PipelineStep) (*function, error) {
	inst, err := s.createWASMInstance(step.GetXWasmBytes())
	if err != nil {
		return nil, err
	}

	// This is the actual function we'll be executing
	f := inst.ExportedFunction(step.GetXWasmFunction())
	if f == nil {
		return nil, fmt.Errorf("unable to get exported function '%s'", step.GetXWasmFunction())
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
		ID:      step.GetXWasmId(),
		Inst:    inst,
		entry:   f,
		alloc:   alloc,
		dealloc: dealloc,
	}, nil
}

func (s *Snitch) createWASMInstance(wasmBytes []byte) (api.Module, error) {
	if len(wasmBytes) == 0 {
		return nil, errors.New("wasm data is empty")
	}

	hostFuncs := map[string]func(_ context.Context, module api.Module, ptr, length int32) int32{
		"kvExists":    s.HostFuncKVExists,
		"httpRequest": HostFuncHTTPRequest,
	}

	ctx := context.Background()
	r := wazero.NewRuntime(ctx)

	wasi_snapshot_preview1.MustInstantiate(ctx, r)

	cfg := wazero.NewModuleConfig().
		WithStderr(io.Discard).
		WithStdout(io.Discard).
		WithSysNanotime().
		WithSysNanosleep().
		WithSysWalltime().
		WithStartFunctions("") // We don't need _start() to be called for our purposes

	// TODO: module name probably needs to be unique
	for name, fn := range hostFuncs {
		_, err := r.NewHostModuleBuilder("env").
			NewFunctionBuilder().
			WithFunc(fn).
			Export(name).
			Instantiate(ctx)

		if err != nil {
			return nil, errors.Wrapf(err, "failed to instantiate module for fn '%s'", name)
		}
	}

	mod, err := r.InstantiateWithConfig(ctx, wasmBytes, cfg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to instantiate wasm module")
	}

	return mod, nil
}

// ReadRequestFromMemory is a helper function that reads raw memory starting at
// 'ptr' for 'length' bytes. Once read, it will attempt to unmarshal the data
// into the provided proto.Message.
func ReadRequestFromMemory(module api.Module, msg proto.Message, ptr, length int32) error {
	if length <= 0 {
		return errors.New("length must be greater than 0")
	}

	if module == nil {
		return errors.New("module cannot be nil")
	}

	if msg == nil {
		return errors.New("msg cannot be nil")
	}

	data, ok := module.Memory().Read(uint32(ptr), uint32(length))
	if !ok {
		return errors.New("unable to read memory")
	}

	if err := proto.Unmarshal(data, msg); err != nil {
		return errors.Wrap(err, "unable to unmarshal HttpRequest")
	}

	return nil
}

// WriteResponseToMemory is a helper function that marshals provided message to
// module memory, appends terminators and returns the pointer to the start of
// the message.
func WriteResponseToMemory(module api.Module, msg proto.Message) (int32, error) {
	if module == nil {
		return 0, errors.New("module cannot be nil")
	}

	if msg == nil {
		return 0, errors.New("msg cannot be nil")
	}

	data, err := proto.Marshal(msg)
	if err != nil {
		return 0, errors.Wrap(err, "unable to marshal response")
	}

	// Append terminator to end of response
	data = append(data, 166, 166, 166)

	alloc := module.ExportedFunction("alloc")
	if alloc == nil {
		return 0, errors.New("unable to get alloc func")
	}

	// Allocate memory for response
	allocRes, err := alloc.Call(context.Background(), uint64(len(data)))
	if err != nil {
		return 0, errors.Wrap(err, "unable to allocate memory")
	}

	if len(allocRes) < 1 {
		return 0, errors.New("alloc returned unexpected number of results")
	}

	// Write memory to allocated space
	ok := module.Memory().Write(uint32(allocRes[0]), data)
	if !ok {
		return 0, errors.New("unable to write host function results to memory")
	}

	return int32(allocRes[0]), nil
}
