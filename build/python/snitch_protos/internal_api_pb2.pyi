import common_pb2 as _common_pb2
import pipeline_pb2 as _pipeline_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
OPERATION_TYPE_CONSUMER: OperationType
OPERATION_TYPE_PRODUCER: OperationType
OPERATION_TYPE_UNSET: OperationType
SNITCH_COMMAND_TYPE_DELETE_PIPELINE: CommandType
SNITCH_COMMAND_TYPE_KEEPALIVE: CommandType
SNITCH_COMMAND_TYPE_PAUSE_PIPELINE: CommandType
SNITCH_COMMAND_TYPE_SET_PIPELINE: CommandType
SNITCH_COMMAND_TYPE_UNPAUSE_PIPELINE: CommandType
SNITCH_COMMAND_TYPE_UNSET: CommandType

class Audience(_message.Message):
    __slots__ = ["component_name", "operation_type", "service_name"]
    COMPONENT_NAME_FIELD_NUMBER: _ClassVar[int]
    OPERATION_TYPE_FIELD_NUMBER: _ClassVar[int]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    component_name: str
    operation_type: OperationType
    service_name: str
    def __init__(self, service_name: _Optional[str] = ..., component_name: _Optional[str] = ..., operation_type: _Optional[_Union[OperationType, str]] = ...) -> None: ...

class CommandResponse(_message.Message):
    __slots__ = ["_metadata", "audience", "delete_pipeline", "pause_pipeline", "set_pipeline", "type", "unpause_pipeline"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    DELETE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    PAUSE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    SET_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    UNPAUSE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    audience: Audience
    delete_pipeline: _pipeline_pb2.DeletePipelineCommand
    pause_pipeline: _pipeline_pb2.PausePipelineCommand
    set_pipeline: _pipeline_pb2.SetPipelineCommand
    type: CommandType
    unpause_pipeline: _pipeline_pb2.UnpausePipelineCommand
    def __init__(self, type: _Optional[_Union[CommandType, str]] = ..., audience: _Optional[_Union[Audience, _Mapping]] = ..., set_pipeline: _Optional[_Union[_pipeline_pb2.SetPipelineCommand, _Mapping]] = ..., delete_pipeline: _Optional[_Union[_pipeline_pb2.DeletePipelineCommand, _Mapping]] = ..., pause_pipeline: _Optional[_Union[_pipeline_pb2.PausePipelineCommand, _Mapping]] = ..., unpause_pipeline: _Optional[_Union[_pipeline_pb2.UnpausePipelineCommand, _Mapping]] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class HeartbeatRequest(_message.Message):
    __slots__ = ["audience", "last_activity_unix_timestamp_utc"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    LAST_ACTIVITY_UNIX_TIMESTAMP_UTC_FIELD_NUMBER: _ClassVar[int]
    audience: Audience
    last_activity_unix_timestamp_utc: int
    def __init__(self, audience: _Optional[_Union[Audience, _Mapping]] = ..., last_activity_unix_timestamp_utc: _Optional[int] = ...) -> None: ...

class MetricsRequest(_message.Message):
    __slots__ = ["audience", "rule_id", "rule_name"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    RULE_ID_FIELD_NUMBER: _ClassVar[int]
    RULE_NAME_FIELD_NUMBER: _ClassVar[int]
    audience: Audience
    rule_id: str
    rule_name: str
    def __init__(self, rule_id: _Optional[str] = ..., rule_name: _Optional[str] = ..., audience: _Optional[_Union[Audience, _Mapping]] = ...) -> None: ...

class NotifyRequest(_message.Message):
    __slots__ = ["audience", "occurred_at_unix_ts_utc", "rule_id", "rule_name"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    OCCURRED_AT_UNIX_TS_UTC_FIELD_NUMBER: _ClassVar[int]
    RULE_ID_FIELD_NUMBER: _ClassVar[int]
    RULE_NAME_FIELD_NUMBER: _ClassVar[int]
    audience: Audience
    occurred_at_unix_ts_utc: int
    rule_id: str
    rule_name: str
    def __init__(self, rule_id: _Optional[str] = ..., rule_name: _Optional[str] = ..., audience: _Optional[_Union[Audience, _Mapping]] = ..., occurred_at_unix_ts_utc: _Optional[int] = ...) -> None: ...

class RegisterRequest(_message.Message):
    __slots__ = ["_metadata", "dry_run", "service_name"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    DRY_RUN_FIELD_NUMBER: _ClassVar[int]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    dry_run: bool
    service_name: str
    def __init__(self, service_name: _Optional[str] = ..., dry_run: bool = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class CommandType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class OperationType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
