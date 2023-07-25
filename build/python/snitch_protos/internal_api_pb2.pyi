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

class BusEvent(_message.Message):
    __slots__ = ["_metadata", "command_response", "deregister_request", "heartbeat_request", "register_request", "request_id", "source"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    COMMAND_RESPONSE_FIELD_NUMBER: _ClassVar[int]
    DEREGISTER_REQUEST_FIELD_NUMBER: _ClassVar[int]
    HEARTBEAT_REQUEST_FIELD_NUMBER: _ClassVar[int]
    REGISTER_REQUEST_FIELD_NUMBER: _ClassVar[int]
    REQUEST_ID_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    command_response: CommandResponse
    deregister_request: DeregisterRequest
    heartbeat_request: HeartbeatRequest
    register_request: RegisterRequest
    request_id: str
    source: str
    def __init__(self, request_id: _Optional[str] = ..., source: _Optional[str] = ..., command_response: _Optional[_Union[CommandResponse, _Mapping]] = ..., register_request: _Optional[_Union[RegisterRequest, _Mapping]] = ..., deregister_request: _Optional[_Union[DeregisterRequest, _Mapping]] = ..., heartbeat_request: _Optional[_Union[HeartbeatRequest, _Mapping]] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class CommandResponse(_message.Message):
    __slots__ = ["_metadata", "audience", "delete_pipeline", "pause_pipeline", "set_pipeline", "unpause_pipeline"]
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
    UNPAUSE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    audience: Audience
    delete_pipeline: _pipeline_pb2.DeletePipelineCommand
    pause_pipeline: _pipeline_pb2.PausePipelineCommand
    set_pipeline: _pipeline_pb2.SetPipelineCommand
    unpause_pipeline: _pipeline_pb2.UnpausePipelineCommand
    def __init__(self, audience: _Optional[_Union[Audience, _Mapping]] = ..., set_pipeline: _Optional[_Union[_pipeline_pb2.SetPipelineCommand, _Mapping]] = ..., delete_pipeline: _Optional[_Union[_pipeline_pb2.DeletePipelineCommand, _Mapping]] = ..., pause_pipeline: _Optional[_Union[_pipeline_pb2.PausePipelineCommand, _Mapping]] = ..., unpause_pipeline: _Optional[_Union[_pipeline_pb2.UnpausePipelineCommand, _Mapping]] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class DeregisterRequest(_message.Message):
    __slots__ = ["_metadata", "service_name"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    service_name: str
    def __init__(self, service_name: _Optional[str] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class HeartbeatRequest(_message.Message):
    __slots__ = ["_metadata", "audience", "last_activity_unix_timestamp_utc"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    LAST_ACTIVITY_UNIX_TIMESTAMP_UTC_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    audience: Audience
    last_activity_unix_timestamp_utc: int
    def __init__(self, audience: _Optional[_Union[Audience, _Mapping]] = ..., last_activity_unix_timestamp_utc: _Optional[int] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class MetricsRequest(_message.Message):
    __slots__ = ["_metadata", "audience", "rule_id", "rule_name"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    RULE_ID_FIELD_NUMBER: _ClassVar[int]
    RULE_NAME_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    audience: Audience
    rule_id: str
    rule_name: str
    def __init__(self, rule_id: _Optional[str] = ..., rule_name: _Optional[str] = ..., audience: _Optional[_Union[Audience, _Mapping]] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class NotifyRequest(_message.Message):
    __slots__ = ["_metadata", "audience", "occurred_at_unix_ts_utc", "rule_id", "rule_name"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    OCCURRED_AT_UNIX_TS_UTC_FIELD_NUMBER: _ClassVar[int]
    RULE_ID_FIELD_NUMBER: _ClassVar[int]
    RULE_NAME_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    audience: Audience
    occurred_at_unix_ts_utc: int
    rule_id: str
    rule_name: str
    def __init__(self, rule_id: _Optional[str] = ..., rule_name: _Optional[str] = ..., audience: _Optional[_Union[Audience, _Mapping]] = ..., occurred_at_unix_ts_utc: _Optional[int] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

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
