from steps import custom_pb2 as _custom_pb2
from steps import decode_pb2 as _decode_pb2
from steps import detective_pb2 as _detective_pb2
from steps import encode_pb2 as _encode_pb2
from steps import transform_pb2 as _transform_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

CONDITION_ABORT: PipelineStepCondition
CONDITION_CONTINUE: PipelineStepCondition
CONDITION_NOTIFY: PipelineStepCondition
CONDITION_UNSET: PipelineStepCondition
DESCRIPTOR: _descriptor.FileDescriptor
WASM_EXIT_CODE_FAILURE: WASMExitCode
WASM_EXIT_CODE_INTERNAL_ERROR: WASMExitCode
WASM_EXIT_CODE_SUCCESS: WASMExitCode
WASM_EXIT_CODE_UNSET: WASMExitCode

class DeletePipelineCommand(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class PausePipelineCommand(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class PipelineStep(_message.Message):
    __slots__ = ["_wasm_bytes", "_wasm_function", "_wasm_id", "conditions", "custom", "decode", "detective", "encode", "id", "name", "transform"]
    CONDITIONS_FIELD_NUMBER: _ClassVar[int]
    CUSTOM_FIELD_NUMBER: _ClassVar[int]
    DECODE_FIELD_NUMBER: _ClassVar[int]
    DETECTIVE_FIELD_NUMBER: _ClassVar[int]
    ENCODE_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    TRANSFORM_FIELD_NUMBER: _ClassVar[int]
    _WASM_BYTES_FIELD_NUMBER: _ClassVar[int]
    _WASM_FUNCTION_FIELD_NUMBER: _ClassVar[int]
    _WASM_ID_FIELD_NUMBER: _ClassVar[int]
    _wasm_bytes: bytes
    _wasm_function: str
    _wasm_id: str
    conditions: _containers.RepeatedScalarFieldContainer[PipelineStepCondition]
    custom: _custom_pb2.CustomStep
    decode: _decode_pb2.DecodeStep
    detective: _detective_pb2.DetectiveStep
    encode: _encode_pb2.EncodeStep
    id: str
    name: str
    transform: _transform_pb2.TransformStep
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., conditions: _Optional[_Iterable[_Union[PipelineStepCondition, str]]] = ..., detective: _Optional[_Union[_detective_pb2.DetectiveStep, _Mapping]] = ..., transform: _Optional[_Union[_transform_pb2.TransformStep, _Mapping]] = ..., encode: _Optional[_Union[_encode_pb2.EncodeStep, _Mapping]] = ..., decode: _Optional[_Union[_decode_pb2.DecodeStep, _Mapping]] = ..., custom: _Optional[_Union[_custom_pb2.CustomStep, _Mapping]] = ..., _wasm_id: _Optional[str] = ..., _wasm_bytes: _Optional[bytes] = ..., _wasm_function: _Optional[str] = ...) -> None: ...

class SetPipelineCommand(_message.Message):
    __slots__ = ["id", "name", "steps"]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    STEPS_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    steps: _containers.RepeatedCompositeFieldContainer[PipelineStep]
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., steps: _Optional[_Iterable[_Union[PipelineStep, _Mapping]]] = ...) -> None: ...

class UnpausePipelineCommand(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class WASMRequest(_message.Message):
    __slots__ = ["input", "step"]
    INPUT_FIELD_NUMBER: _ClassVar[int]
    STEP_FIELD_NUMBER: _ClassVar[int]
    input: bytes
    step: PipelineStep
    def __init__(self, step: _Optional[_Union[PipelineStep, _Mapping]] = ..., input: _Optional[bytes] = ...) -> None: ...

class WASMResponse(_message.Message):
    __slots__ = ["exit_code", "exit_msg", "output"]
    EXIT_CODE_FIELD_NUMBER: _ClassVar[int]
    EXIT_MSG_FIELD_NUMBER: _ClassVar[int]
    OUTPUT_FIELD_NUMBER: _ClassVar[int]
    exit_code: WASMExitCode
    exit_msg: str
    output: bytes
    def __init__(self, output: _Optional[bytes] = ..., exit_code: _Optional[_Union[WASMExitCode, str]] = ..., exit_msg: _Optional[str] = ...) -> None: ...

class WASMExitCode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class PipelineStepCondition(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
