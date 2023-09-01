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

	// Perform operation

	// Return response

	return 0
}

// HostFuncHTTPRequest is function that is exported to and called from a Rust WASM module
func HostFuncHTTPRequest(_ context.Context, module api.Module, ptr, length int32) int32 {
	request := &steps.HttpRequest{}

	if err := ReadRequestFromMemory(module, request, ptr, length); err != nil {
		return writeHTTPResponse(module, http.StatusInternalServerError, "unable to read HTTP request params: "+err.Error(), nil)
	}

	httpReq, err := http.NewRequest(methodFromProto(request.Method), request.Url, bytes.NewReader(request.Body))
	if err != nil {
		err = errors.Wrap(err, "unable to create http request")
		return writeHTTPResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		err = errors.Wrap(err, "unable to perform http request")
		return writeHTTPResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return writeHTTPResponse(module, http.StatusInternalServerError, err.Error(), nil)
	}

	if resp.StatusCode > 299 {
		return writeHTTPResponse(module, resp.StatusCode, string(body), nil)
	}

	// Get all headers from the response
	headers := make(map[string]string)
	for k, v := range resp.Header {
		headers[k] = strings.Join(v, ", ")
	}

	return writeHTTPResponse(module, resp.StatusCode, string(body), headers)
}

// writeHTTPResponse is a helper for HostFuncHTTPRequest()
func writeHTTPResponse(module api.Module, code int, body string, headers map[string]string) int32 {
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
