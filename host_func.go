package snitch

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"strings"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos/steps"
	"github.com/tetratelabs/wazero/api"
)

// HostFuncKVExists is function that is exported to and called from a Rust WASM module
func (s *Snitch) HostFuncKVExists(_ context.Context, module api.Module, ptr, length int32) int32 {
	// Read request
	request := &steps.KVExistsRequest{}

	if err := ReadRequestFromMemory(module, request, ptr, length); err != nil {
		return kvExistsResponse(module, "unable to read KVExistsRequest params: "+err.Error(), false, false)
	}

	if err := validateKVExistsRequest(request); err != nil {
		return kvExistsResponse(module, "unable to validate KVExistsRequest: "+err.Error(), false, false)
	}

	// Perform operation
	exists := s.kv.Exists(request.Key)

	// Return response
	return kvExistsResponse(module, "lookup succeeded", false, exists)
}

// Generates a protobuf response, writes to mem, and returns ptr to mem
func kvExistsResponse(module api.Module, msg string, isError, exists bool) int32 {
	resp := &steps.KVExistsResponse{
		Exists:  exists,
		IsError: isError,
		Message: msg,
	}

	addr, err := WriteResponseToMemory(module, resp)
	if err != nil {
		panic("unable to write KVExistsResponse to memory: " + err.Error())
	}

	return addr
}

func validateKVExistsRequest(request *steps.KVExistsRequest) error {
	if request == nil {
		return errors.New("request cannot be nil")
	}

	if request.Key == "" {
		return errors.New("request.Key cannot be empty")
	}

	if request.Mode != steps.KVExistsMode_KV_EXISTS_MODE_STATIC && request.Mode != steps.KVExistsMode_KV_EXISTS_MODE_DYNAMIC {
		return errors.New("request.Mode must be either KV_EXISTS_MODE_STATIC or KV_EXISTS_MODE_DYNAMIC")
	}

	return nil
}

// HostFuncHTTPRequest is function that is exported to and called from a Rust WASM module
func HostFuncHTTPRequest(_ context.Context, module api.Module, ptr, length int32) int32 {
	request := &steps.HttpRequest{}

	if err := ReadRequestFromMemory(module, request, ptr, length); err != nil {
		return httpRequestResponse(module, http.StatusInternalServerError, "unable to read HTTP request params: "+err.Error(), nil)
	}

	httpReq, err := http.NewRequest(methodFromProto(request.Method), request.Url, bytes.NewReader(request.Body))
	if err != nil {
		err = errors.Wrap(err, "unable to create http request")
		return httpRequestResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		err = errors.Wrap(err, "unable to perform http request")
		return httpRequestResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return httpRequestResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	if resp.StatusCode > 299 {
		return httpRequestResponse(module, resp.StatusCode, string(body), nil)
	}

	// Get all headers from the response
	headers := make(map[string]string)
	for k, v := range resp.Header {
		headers[k] = strings.Join(v, ", ")
	}

	return httpRequestResponse(module, resp.StatusCode, string(body), headers)
}

// httpRequestResponse is a helper for HostFuncHTTPRequest()
func httpRequestResponse(module api.Module, code int, body string, headers map[string]string) int32 {
	if headers == nil {
		headers = make(map[string]string)
	}

	resp := &steps.HttpResponse{
		Code:    int32(code),
		Body:    []byte(body),
		Headers: headers,
	}

	addr, err := WriteResponseToMemory(module, resp)
	if err != nil {
		panic("unable to write HTTP response to memory: " + err.Error())
	}

	return addr
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
