"""
This module contains the host functions that are used by wasm modules
"""

import requests
import streamdal.common as common
import streamdal_protos.protos as protos
from wasmtime import Memory, Caller


def http_request(caller: Caller, ptr: int, length: int) -> int:
    """
    http_request is a host function that is used to make HTTP requests from within a wasm module
    """
    memory: Memory = caller.get("memory")

    data = common.read_memory(memory, caller, ptr, length)

    req = protos.steps.HttpRequest().parse(data)

    response = __http_request_perform(req)

    headers = {}
    for k, v in response.headers.items():
        headers[k] = v

    res = protos.steps.HttpResponse(
        code=response.status_code,
        body=response.text.encode("utf-8"),
        headers=headers,
    )

    resp = res.SerializeToString()

    # Allocate memory for response
    alloc = caller.get("alloc")
    resp_ptr = alloc(caller, len(resp) + 64)

    # Write response to memory
    memory.write(caller, resp, resp_ptr)

    resp_ptr = resp_ptr << 32 | len(resp)

    return resp_ptr


def __http_request_perform(req: protos.steps.HttpRequest) -> requests.Response:
    if req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_GET:
        response = requests.get(req.url)
    elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_POST:
        response = requests.post(req.url, json=req.body)
    elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_PUT:
        response = requests.put(req.url, json=req.body)
    elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_DELETE:
        response = requests.delete(req.url)
    elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_PATCH:
        response = requests.patch(req.url, json=req.body)
    elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_HEAD:
        response = requests.head(req.url)
    elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_OPTIONS:
        response = requests.options(req.url)
    else:
        raise ValueError(f"Invalid HTTP method provided: '{req.method}'")

    return response
