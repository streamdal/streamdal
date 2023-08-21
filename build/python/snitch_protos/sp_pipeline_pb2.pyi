from steps import sp_steps_custom_pb2 as _sp_steps_custom_pb2
from steps import sp_steps_decode_pb2 as _sp_steps_decode_pb2
from steps import sp_steps_detective_pb2 as _sp_steps_detective_pb2
from steps import sp_steps_encode_pb2 as _sp_steps_encode_pb2
from steps import sp_steps_transform_pb2 as _sp_steps_transform_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
PIPELINE_STEP_CONDITION_ABORT: PipelineStepCondition
PIPELINE_STEP_CONDITION_NOTIFY: PipelineStepCondition
PIPELINE_STEP_CONDITION_UNSET: PipelineStepCondition

class Pipeline(_message.Message):
    __slots__ = ["id", "name", "steps"]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    STEPS_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    steps: _containers.RepeatedCompositeFieldContainer[PipelineStep]
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., steps: _Optional[_Iterable[_Union[PipelineStep, _Mapping]]] = ...) -> None: ...

class PipelineStep(_message.Message):
    __slots__ = ["_wasm_bytes", "_wasm_function", "_wasm_id", "custom", "decode", "detective", "encode", "name", "on_failure", "on_success", "transform"]
    CUSTOM_FIELD_NUMBER: _ClassVar[int]
    DECODE_FIELD_NUMBER: _ClassVar[int]
    DETECTIVE_FIELD_NUMBER: _ClassVar[int]
    ENCODE_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    ON_FAILURE_FIELD_NUMBER: _ClassVar[int]
    ON_SUCCESS_FIELD_NUMBER: _ClassVar[int]
    TRANSFORM_FIELD_NUMBER: _ClassVar[int]
    _WASM_BYTES_FIELD_NUMBER: _ClassVar[int]
    _WASM_FUNCTION_FIELD_NUMBER: _ClassVar[int]
    _WASM_ID_FIELD_NUMBER: _ClassVar[int]
    _wasm_bytes: bytes
    _wasm_function: str
    _wasm_id: str
    custom: _sp_steps_custom_pb2.CustomStep
    decode: _sp_steps_decode_pb2.DecodeStep
    detective: _sp_steps_detective_pb2.DetectiveStep
    encode: _sp_steps_encode_pb2.EncodeStep
    name: str
    on_failure: _containers.RepeatedScalarFieldContainer[PipelineStepCondition]
    on_success: _containers.RepeatedScalarFieldContainer[PipelineStepCondition]
    transform: _sp_steps_transform_pb2.TransformStep
    def __init__(self, name: _Optional[str] = ..., on_success: _Optional[_Iterable[_Union[PipelineStepCondition, str]]] = ..., on_failure: _Optional[_Iterable[_Union[PipelineStepCondition, str]]] = ..., detective: _Optional[_Union[_sp_steps_detective_pb2.DetectiveStep, _Mapping]] = ..., transform: _Optional[_Union[_sp_steps_transform_pb2.TransformStep, _Mapping]] = ..., encode: _Optional[_Union[_sp_steps_encode_pb2.EncodeStep, _Mapping]] = ..., decode: _Optional[_Union[_sp_steps_decode_pb2.DecodeStep, _Mapping]] = ..., custom: _Optional[_Union[_sp_steps_custom_pb2.CustomStep, _Mapping]] = ..., _wasm_id: _Optional[str] = ..., _wasm_bytes: _Optional[bytes] = ..., _wasm_function: _Optional[str] = ...) -> None: ...

class PipelineStepCondition(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
