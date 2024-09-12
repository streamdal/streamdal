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

        req = protos.WasmRequest().parse(data)

        try:
            req_body = self.get_request_body_for_mode(req)
        except ValueError as e:
            return self.http_request_response(caller, 400, str(e).encode("utf-8"), {})

        resp = self.__http_request_perform(req.step.http_request.request, req_body)

        headers = {}
        for k, v in resp.headers.items():
            headers[k] = v

        return self.http_request_response(caller, resp.status_code, resp.text.encode("utf-8"), headers)

    def __http_request_perform(
            self, req: protos.steps.HttpRequest, body: bytes
    ) -> requests.Response:
        if req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_GET:
            response = requests.get(req.url)
        elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_POST:
            response = requests.post(req.url, json=body)
        elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_PUT:
            response = requests.put(req.url, json=body)
        elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_DELETE:
            response = requests.delete(req.url)
        elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_PATCH:
            response = requests.patch(req.url, json=body)
        elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_HEAD:
            response = requests.head(req.url)
        elif req.method == protos.steps.HttpRequestMethod.HTTP_REQUEST_METHOD_OPTIONS:
            response = requests.options(req.url)
        else:
            raise ValueError(f"Invalid HTTP method provided: '{req.method}'")

        return response

    def http_request_response(self, caller: Caller, code, body, headers) -> int:
        res = protos.steps.HttpResponse(
            code=code,
            body=body,
            headers=headers,
        )

        return self.write_to_memory(caller, res)

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

        return self.write_to_memory(caller, resp)

    def get_request_body_for_mode(self, req: protos.WasmRequest):
        mode = req.step.http_request.request.body_mode
        if mode == protos.steps.HttpRequestBodyMode.HTTP_REQUEST_BODY_MODE_STATIC:
            return req.step.http_request.request.body
        elif mode == protos.steps.HttpRequestBodyMode.HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT:
            if req.inter_step_result is None:
                raise ValueError("Inter step result not provided")

            detective_res = req.inter_step_result.detective_result

            if detective_res is None:
                raise ValueError("Detective result not provided")

            # Wipe values to prevent PII from being passed
            for step_res in detective_res.matches:
                step_res.value = ""

            return req.inter_step_result.SerializeToString()
        else:
            raise ValueError(f"Invalid HTTP request mode provided: '{mode}'")

    def write_to_memory(self, caller: Caller, res) -> int:
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
