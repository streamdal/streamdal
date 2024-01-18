import sp_pipeline_pb2 as _sp_pipeline_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class PipelineStatus(_message.Message):
    __slots__ = ["id", "name", "step_status"]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    STEP_STATUS_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    step_status: _containers.RepeatedCompositeFieldContainer[StepStatus]
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., step_status: _Optional[_Iterable[_Union[StepStatus, _Mapping]]] = ...) -> None: ...

class SDKResponse(_message.Message):
    __slots__ = ["data", "error", "error_message", "metadata", "pipeline_status"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    DATA_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_STATUS_FIELD_NUMBER: _ClassVar[int]
    data: bytes
    error: bool
    error_message: str
    metadata: _containers.ScalarMap[str, str]
    pipeline_status: _containers.RepeatedCompositeFieldContainer[PipelineStatus]
    def __init__(self, data: _Optional[bytes] = ..., error: bool = ..., error_message: _Optional[str] = ..., pipeline_status: _Optional[_Iterable[_Union[PipelineStatus, _Mapping]]] = ..., metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class StepStatus(_message.Message):
    __slots__ = ["abort_condition", "error", "error_message", "name"]
    ABORT_CONDITION_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    abort_condition: _sp_pipeline_pb2.AbortCondition
    error: bool
    error_message: str
    name: str
    def __init__(self, name: _Optional[str] = ..., error: bool = ..., error_message: _Optional[str] = ..., abort_condition: _Optional[_Union[_sp_pipeline_pb2.AbortCondition, str]] = ...) -> None: ...
