import sp_command_pb2 as _sp_command_pb2
import sp_common_pb2 as _sp_common_pb2
import sp_info_pb2 as _sp_info_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class DeregisterRequest(_message.Message):
    __slots__ = ["service_name", "session_id"]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    service_name: str
    session_id: str
    def __init__(self, service_name: _Optional[str] = ..., session_id: _Optional[str] = ...) -> None: ...

class GetAttachCommandsByServiceRequest(_message.Message):
    __slots__ = ["service_name"]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    service_name: str
    def __init__(self, service_name: _Optional[str] = ...) -> None: ...

class GetAttachCommandsByServiceResponse(_message.Message):
    __slots__ = ["active", "paused"]
    ACTIVE_FIELD_NUMBER: _ClassVar[int]
    PAUSED_FIELD_NUMBER: _ClassVar[int]
    active: _containers.RepeatedCompositeFieldContainer[_sp_command_pb2.Command]
    paused: _containers.RepeatedCompositeFieldContainer[_sp_command_pb2.Command]
    def __init__(self, active: _Optional[_Iterable[_Union[_sp_command_pb2.Command, _Mapping]]] = ..., paused: _Optional[_Iterable[_Union[_sp_command_pb2.Command, _Mapping]]] = ...) -> None: ...

class HeartbeatRequest(_message.Message):
    __slots__ = ["session_id"]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    session_id: str
    def __init__(self, session_id: _Optional[str] = ...) -> None: ...

class MetricsRequest(_message.Message):
    __slots__ = ["metrics"]
    METRICS_FIELD_NUMBER: _ClassVar[int]
    metrics: _containers.RepeatedCompositeFieldContainer[_sp_common_pb2.Metric]
    def __init__(self, metrics: _Optional[_Iterable[_Union[_sp_common_pb2.Metric, _Mapping]]] = ...) -> None: ...

class NewAudienceRequest(_message.Message):
    __slots__ = ["audience", "session_id"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    audience: _sp_common_pb2.Audience
    session_id: str
    def __init__(self, session_id: _Optional[str] = ..., audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ...) -> None: ...

class NotifyRequest(_message.Message):
    __slots__ = ["audience", "occurred_at_unix_ts_utc", "pipeline_id", "step_name"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    OCCURRED_AT_UNIX_TS_UTC_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    STEP_NAME_FIELD_NUMBER: _ClassVar[int]
    audience: _sp_common_pb2.Audience
    occurred_at_unix_ts_utc: int
    pipeline_id: str
    step_name: str
    def __init__(self, pipeline_id: _Optional[str] = ..., step_name: _Optional[str] = ..., audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ..., occurred_at_unix_ts_utc: _Optional[int] = ...) -> None: ...

class RegisterRequest(_message.Message):
    __slots__ = ["audiences", "client_info", "dry_run", "service_name", "session_id"]
    AUDIENCES_FIELD_NUMBER: _ClassVar[int]
    CLIENT_INFO_FIELD_NUMBER: _ClassVar[int]
    DRY_RUN_FIELD_NUMBER: _ClassVar[int]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    audiences: _containers.RepeatedCompositeFieldContainer[_sp_common_pb2.Audience]
    client_info: _sp_info_pb2.ClientInfo
    dry_run: bool
    service_name: str
    session_id: str
    def __init__(self, service_name: _Optional[str] = ..., session_id: _Optional[str] = ..., client_info: _Optional[_Union[_sp_info_pb2.ClientInfo, _Mapping]] = ..., audiences: _Optional[_Iterable[_Union[_sp_common_pb2.Audience, _Mapping]]] = ..., dry_run: bool = ...) -> None: ...

class SendSchemaRequest(_message.Message):
    __slots__ = ["schema"]
    SCHEMA_FIELD_NUMBER: _ClassVar[int]
    schema: _sp_common_pb2.Schema
    def __init__(self, schema: _Optional[_Union[_sp_common_pb2.Schema, _Mapping]] = ...) -> None: ...
