import sp_pipeline_pb2 as _sp_pipeline_pb2
from steps import sp_steps_detective_pb2 as _sp_steps_detective_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
WASM_EXIT_CODE_FAILURE: WASMExitCode
WASM_EXIT_CODE_INTERNAL_ERROR: WASMExitCode
WASM_EXIT_CODE_SUCCESS: WASMExitCode
WASM_EXIT_CODE_UNSET: WASMExitCode

class WASMRequest(_message.Message):
    __slots__ = ["detective_result", "input_payload", "input_step", "step"]
    DETECTIVE_RESULT_FIELD_NUMBER: _ClassVar[int]
    INPUT_PAYLOAD_FIELD_NUMBER: _ClassVar[int]
    INPUT_STEP_FIELD_NUMBER: _ClassVar[int]
    STEP_FIELD_NUMBER: _ClassVar[int]
    detective_result: _sp_steps_detective_pb2.DetectiveStepResult
    input_payload: bytes
    input_step: bytes
    step: _sp_pipeline_pb2.PipelineStep
    def __init__(self, step: _Optional[_Union[_sp_pipeline_pb2.PipelineStep, _Mapping]] = ..., input_payload: _Optional[bytes] = ..., input_step: _Optional[bytes] = ..., detective_result: _Optional[_Union[_sp_steps_detective_pb2.DetectiveStepResult, _Mapping]] = ...) -> None: ...

class WASMResponse(_message.Message):
    __slots__ = ["exit_code", "exit_msg", "output_payload", "output_step"]
    EXIT_CODE_FIELD_NUMBER: _ClassVar[int]
    EXIT_MSG_FIELD_NUMBER: _ClassVar[int]
    OUTPUT_PAYLOAD_FIELD_NUMBER: _ClassVar[int]
    OUTPUT_STEP_FIELD_NUMBER: _ClassVar[int]
    exit_code: WASMExitCode
    exit_msg: str
    output_payload: bytes
    output_step: bytes
    def __init__(self, output_payload: _Optional[bytes] = ..., exit_code: _Optional[_Union[WASMExitCode, str]] = ..., exit_msg: _Optional[str] = ..., output_step: _Optional[bytes] = ...) -> None: ...

class WASMExitCode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
