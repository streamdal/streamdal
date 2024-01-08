from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

ABORT_STATUS_ALL: AbortStatus
ABORT_STATUS_CURRENT: AbortStatus
ABORT_STATUS_UNSET: AbortStatus
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
    __slots__ = ["data", "drop_message", "error", "error_message", "pipeline_status"]
    DATA_FIELD_NUMBER: _ClassVar[int]
    DROP_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_STATUS_FIELD_NUMBER: _ClassVar[int]
    data: bytes
    drop_message: bool
    error: bool
    error_message: str
    pipeline_status: _containers.RepeatedCompositeFieldContainer[PipelineStatus]
    def __init__(self, data: _Optional[bytes] = ..., error: bool = ..., error_message: _Optional[str] = ..., pipeline_status: _Optional[_Iterable[_Union[PipelineStatus, _Mapping]]] = ..., drop_message: bool = ...) -> None: ...

class StepStatus(_message.Message):
    __slots__ = ["abort_status", "error", "error_message", "name"]
    ABORT_STATUS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    abort_status: AbortStatus
    error: bool
    error_message: str
    name: str
    def __init__(self, name: _Optional[str] = ..., error: bool = ..., error_message: _Optional[str] = ..., abort_status: _Optional[_Union[AbortStatus, str]] = ...) -> None: ...

class AbortStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
