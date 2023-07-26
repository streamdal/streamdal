import pipeline_pb2 as _pipeline_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
WASM_EXIT_CODE_FAILURE: WasmExitCode
WASM_EXIT_CODE_INTERNAL_ERROR: WasmExitCode
WASM_EXIT_CODE_SUCCESS: WasmExitCode
WASM_EXIT_CODE_UNSET: WasmExitCode

class WASMRequest(_message.Message):
    __slots__ = ["input", "step"]
    INPUT_FIELD_NUMBER: _ClassVar[int]
    STEP_FIELD_NUMBER: _ClassVar[int]
    input: bytes
    step: _pipeline_pb2.PipelineStep
    def __init__(self, step: _Optional[_Union[_pipeline_pb2.PipelineStep, _Mapping]] = ..., input: _Optional[bytes] = ...) -> None: ...

class WASMResponse(_message.Message):
    __slots__ = ["exit_code", "exit_msg", "output"]
    EXIT_CODE_FIELD_NUMBER: _ClassVar[int]
    EXIT_MSG_FIELD_NUMBER: _ClassVar[int]
    OUTPUT_FIELD_NUMBER: _ClassVar[int]
    exit_code: WasmExitCode
    exit_msg: str
    output: bytes
    def __init__(self, output: _Optional[bytes] = ..., exit_code: _Optional[_Union[WasmExitCode, str]] = ..., exit_msg: _Optional[str] = ...) -> None: ...

class WasmExitCode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
