import sp_pipeline_pb2 as _sp_pipeline_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
EXEC_STATUS_ERROR: ExecStatus
EXEC_STATUS_FALSE: ExecStatus
EXEC_STATUS_TRUE: ExecStatus
EXEC_STATUS_UNSET: ExecStatus

class Payload(_message.Message):
    __slots__ = ["bytes"]
    BYTES_FIELD_NUMBER: _ClassVar[int]
    bytes: bytes
    def __init__(self, bytes: _Optional[bytes] = ...) -> None: ...

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
    __slots__ = ["data", "metadata", "pipeline_status", "status", "status_message"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    DATA_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_STATUS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STATUS_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    data: Payload
    metadata: _containers.ScalarMap[str, str]
    pipeline_status: _containers.RepeatedCompositeFieldContainer[PipelineStatus]
    status: ExecStatus
    status_message: str
    def __init__(self, data: _Optional[_Union[Payload, _Mapping]] = ..., status: _Optional[_Union[ExecStatus, str]] = ..., status_message: _Optional[str] = ..., pipeline_status: _Optional[_Iterable[_Union[PipelineStatus, _Mapping]]] = ..., metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class StepStatus(_message.Message):
    __slots__ = ["abort_condition", "name", "status", "status_message"]
    ABORT_CONDITION_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STATUS_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    abort_condition: _sp_pipeline_pb2.AbortCondition
    name: str
    status: ExecStatus
    status_message: str
    def __init__(self, name: _Optional[str] = ..., status: _Optional[_Union[ExecStatus, str]] = ..., status_message: _Optional[str] = ..., abort_condition: _Optional[_Union[_sp_pipeline_pb2.AbortCondition, str]] = ...) -> None: ...

class ExecStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
