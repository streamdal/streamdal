"""
This module contains the host functions that are used by wasm modules
"""

import requests
import streamdal.common as common
import streamdal_protos.protos as protos
import streamdal.kv as kv
from wasmtime import Memory, Caller


class HostFunc:
    kv: kv.KV

    def __init__(self, **kwargs):
        self.kv = kwargs.get("kv")

    def http_request(self, caller: Caller, ptr: int, length: int) -> int:
        """
        http_request is a host function that is used to make HTTP requests from within a wasm module
        """
        memory: Memory = caller.get("memory")

        data = common.read_memory(memory, caller, ptr, length)

        req = protos.steps.HttpRequest().parse(data)

        response = self.__http_request_perform(req)

        headers = {}
        for k, v in response.headers.items():
            headers[k] = v

        res = protos.steps.HttpResponse(
            code=response.status_code,
            body=response.text.encode("utf-8"),
            headers=headers,
        )

        return HostFunc.write_to_memory(caller, res)

    def __http_request_perform(
        self, req: protos.steps.HttpRequest
    ) -> requests.Response:
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

    def kv_exists(self, caller: Caller, ptr: int, length: int) -> int:
        """
        kv_exists is a host function that is used to check if a key exists in the KV store
        """
        memory: Memory = caller.get("memory")

        data = common.read_memory(memory, caller, ptr, length)

        req = protos.steps.KvStep().parse(data)

        # TODO: validate request

        exists = self.kv.exists(req.key)

        msg = f"Key '{req.key}' exists" if exists else f"Key '{req.key}' does not exist"

        return self.kv_exists_response(caller, msg, False, exists)

    def kv_exists_response(
        self, caller: Caller, msg: str, is_error: bool, exists: bool
    ) -> int:
        """
        kv_exists_response is a host function that is used to check if a key exists in the KV store
        """

        if is_error:
            status = protos.steps.KvStatus.KV_STATUS_ERROR
        elif exists:
            status = protos.steps.KvStatus.KV_STATUS_SUCCESS
        else:
            status = protos.steps.KvStatus.KV_STATUS_FAILURE

        resp = protos.steps.KvStepResponse(
            status=status,
            message=msg,
            value=None,  # No value for KVExists
        )

        return HostFunc.write_to_memory(caller, resp)

    @staticmethod
    def write_to_memory(caller: Caller, res) -> int:
        """
        write_to_memory is a host function that is used to write a response to memory
        """
        resp = res.SerializeToString()

        # Allocate memory for response
        alloc = caller.get("alloc")
        resp_ptr = alloc(caller, len(resp) + 64)

        # Write response to memory
        caller.get("memory").write(caller, resp, resp_ptr)

        resp_ptr = resp_ptr << 32 | len(resp)

        return resp_ptr
