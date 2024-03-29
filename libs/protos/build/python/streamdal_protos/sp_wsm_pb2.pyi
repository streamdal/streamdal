import sp_pipeline_pb2 as _sp_pipeline_pb2
from steps import sp_steps_detective_pb2 as _sp_steps_detective_pb2
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
WASM_EXIT_CODE_ERROR: WASMExitCode
WASM_EXIT_CODE_FALSE: WASMExitCode
WASM_EXIT_CODE_TRUE: WASMExitCode
WASM_EXIT_CODE_UNSET: WASMExitCode

class InterStepResult(_message.Message):
    __slots__ = ["detective_result"]
    DETECTIVE_RESULT_FIELD_NUMBER: _ClassVar[int]
    detective_result: _sp_steps_detective_pb2.DetectiveStepResult
    def __init__(self, detective_result: _Optional[_Union[_sp_steps_detective_pb2.DetectiveStepResult, _Mapping]] = ...) -> None: ...

class WASMRequest(_message.Message):
    __slots__ = ["input_payload", "input_step", "inter_step_result", "step"]
    INPUT_PAYLOAD_FIELD_NUMBER: _ClassVar[int]
    INPUT_STEP_FIELD_NUMBER: _ClassVar[int]
    INTER_STEP_RESULT_FIELD_NUMBER: _ClassVar[int]
    STEP_FIELD_NUMBER: _ClassVar[int]
    input_payload: bytes
    input_step: bytes
    inter_step_result: InterStepResult
    step: _sp_pipeline_pb2.PipelineStep
    def __init__(self, step: _Optional[_Union[_sp_pipeline_pb2.PipelineStep, _Mapping]] = ..., input_payload: _Optional[bytes] = ..., input_step: _Optional[bytes] = ..., inter_step_result: _Optional[_Union[InterStepResult, _Mapping]] = ...) -> None: ...

class WASMResponse(_message.Message):
    __slots__ = ["exit_code", "exit_msg", "inter_step_result", "output_payload", "output_step"]
    EXIT_CODE_FIELD_NUMBER: _ClassVar[int]
    EXIT_MSG_FIELD_NUMBER: _ClassVar[int]
    INTER_STEP_RESULT_FIELD_NUMBER: _ClassVar[int]
    OUTPUT_PAYLOAD_FIELD_NUMBER: _ClassVar[int]
    OUTPUT_STEP_FIELD_NUMBER: _ClassVar[int]
    exit_code: WASMExitCode
    exit_msg: str
    inter_step_result: InterStepResult
    output_payload: bytes
    output_step: bytes
    def __init__(self, output_payload: _Optional[bytes] = ..., exit_code: _Optional[_Union[WASMExitCode, str]] = ..., exit_msg: _Optional[str] = ..., output_step: _Optional[bytes] = ..., inter_step_result: _Optional[_Union[InterStepResult, _Mapping]] = ...) -> None: ...

class Wasm(_message.Message):
    __slots__ = ["_created_at_unix_ts_ns_utc", "_updated_at_unix_ts_ns_utc", "description", "id", "name", "url", "version", "wasm_bytes"]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    URL_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    WASM_BYTES_FIELD_NUMBER: _ClassVar[int]
    _CREATED_AT_UNIX_TS_NS_UTC_FIELD_NUMBER: _ClassVar[int]
    _UPDATED_AT_UNIX_TS_NS_UTC_FIELD_NUMBER: _ClassVar[int]
    _created_at_unix_ts_ns_utc: int
    _updated_at_unix_ts_ns_utc: int
    description: str
    id: str
    name: str
    url: str
    version: str
    wasm_bytes: str
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., wasm_bytes: _Optional[str] = ..., description: _Optional[str] = ..., version: _Optional[str] = ..., url: _Optional[str] = ..., _created_at_unix_ts_ns_utc: _Optional[int] = ..., _updated_at_unix_ts_ns_utc: _Optional[int] = ...) -> None: ...

class WASMExitCode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
