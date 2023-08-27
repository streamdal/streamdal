package snitch

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/golang/protobuf/proto"
	"github.com/pkg/errors"
	"github.com/tetratelabs/wazero"
	"github.com/tetratelabs/wazero/api"
	"github.com/tetratelabs/wazero/imports/wasi_snapshot_preview1"

	"github.com/streamdal/snitch-protos/build/go/protos"
	"github.com/streamdal/snitch-protos/build/go/protos/steps"
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

	fi, err := createFunction(step)
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

func createFunction(step *protos.PipelineStep) (*function, error) {
	inst, err := createWASMInstance(step.GetXWasmBytes())
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

func createWASMInstance(wasmBytes []byte) (api.Module, error) {
	if len(wasmBytes) == 0 {
		return nil, errors.New("wasm data is empty")
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
	_, err := r.NewHostModuleBuilder("env").
		NewFunctionBuilder().
		WithFunc(httpRequest).
		Export("httpRequest").
		Instantiate(ctx)

	mod, err := r.InstantiateWithConfig(ctx, wasmBytes, cfg)
	if err != nil {
		return nil, errors.Wrap(err, "failed to instantiate wasm module")
	}

	return mod, nil
}

// httpRequest is function that is exported to and called from the Rust WASM module
func httpRequest(_ context.Context, module api.Module, ptr, length int32) int32 {
	// Read memory starting from ptr
	data, ok := module.Memory().Read(uint32(ptr), uint32(length))
	if !ok {
		return httpResponse(module, http.StatusInternalServerError, "unable to read memory", nil)
	}

	request := &steps.HttpRequest{}
	if err := proto.Unmarshal(data, request); err != nil {
		return httpResponse(module, 500, string(data), nil)
	}

	httpReq, err := http.NewRequest(methodFromProto(request.Method), request.Url, bytes.NewReader(request.Body))
	if err != nil {
		return httpResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return httpResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	defer resp.Body.Close()

	if resp.StatusCode > 299 {
		return httpResponse(module, resp.StatusCode, resp.Status, nil)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return httpResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	// Get all headers from the response
	headers := make(map[string]string)
	for k, v := range resp.Header {
		headers[k] = strings.Join(v, ", ")
	}

	return httpResponse(module, resp.StatusCode, string(body), headers)
}

func httpResponse(module api.Module, code int, body string, headers map[string]string) int32 {
	if headers == nil {
		headers = make(map[string]string)
	}

	resp := &steps.HttpResponse{
		Code:    int32(code),
		Body:    []byte(body),
		Headers: headers,
	}

	out, err := proto.Marshal(resp)
	if err != nil {
		panic("can't marshal")
	}

	// Apply terminator to end of response
	out = append(out, 166, 166, 166)

	alloc := module.ExportedFunction("alloc")

	allocRes, err := alloc.Call(context.Background(), uint64(len(out)))
	if err != nil {
		panic(fmt.Sprintf("failed to allocate memory for http response: %s", err.Error()))
	}

	ok := module.Memory().Write(uint32(allocRes[0]), out)
	if !ok {
		panic("unable to write host function results to memory")
	}

	return int32(allocRes[0])
}

func methodFromProto(m steps.HttpRequestMethod) string {
	switch m {
	case steps.HttpRequestMethod_HTTP_REQUEST_METHOD_POST:
		return http.MethodPost
	case steps.HttpRequestMethod_HTTP_REQUEST_METHOD_PUT:
		return http.MethodPut
	case steps.HttpRequestMethod_HTTP_REQUEST_METHOD_DELETE:
		return http.MethodDelete
	default:
		return http.MethodGet
	}
}
