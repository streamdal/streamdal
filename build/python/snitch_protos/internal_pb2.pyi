import command_pb2 as _command_pb2
import common_pb2 as _common_pb2
import info_pb2 as _info_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class DeregisterRequest(_message.Message):
    __slots__ = ["service_name"]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    service_name: str
    def __init__(self, service_name: _Optional[str] = ...) -> None: ...

class HeartbeatRequest(_message.Message):
    __slots__ = ["audience", "last_activity_unix_timestamp_utc"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    LAST_ACTIVITY_UNIX_TIMESTAMP_UTC_FIELD_NUMBER: _ClassVar[int]
    audience: _common_pb2.Audience
    last_activity_unix_timestamp_utc: int
    def __init__(self, audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ..., last_activity_unix_timestamp_utc: _Optional[int] = ...) -> None: ...

class Metrics(_message.Message):
    __slots__ = ["labels", "name", "value"]
    class LabelsEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    LABELS_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    labels: _containers.ScalarMap[str, str]
    name: str
    value: float
    def __init__(self, name: _Optional[str] = ..., labels: _Optional[_Mapping[str, str]] = ..., value: _Optional[float] = ...) -> None: ...

class MetricsRequest(_message.Message):
    __slots__ = ["metrics"]
    METRICS_FIELD_NUMBER: _ClassVar[int]
    metrics: _containers.RepeatedCompositeFieldContainer[Metrics]
    def __init__(self, metrics: _Optional[_Iterable[_Union[Metrics, _Mapping]]] = ...) -> None: ...

class NotifyRequest(_message.Message):
    __slots__ = ["audience", "occurred_at_unix_ts_utc", "pipeline_id", "step_name"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    OCCURRED_AT_UNIX_TS_UTC_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    STEP_NAME_FIELD_NUMBER: _ClassVar[int]
    audience: _common_pb2.Audience
    occurred_at_unix_ts_utc: int
    pipeline_id: str
    step_name: str
    def __init__(self, pipeline_id: _Optional[str] = ..., step_name: _Optional[str] = ..., audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ..., occurred_at_unix_ts_utc: _Optional[int] = ...) -> None: ...

class RegisterRequest(_message.Message):
    __slots__ = ["audiences", "client_info", "dry_run", "service_name"]
    AUDIENCES_FIELD_NUMBER: _ClassVar[int]
    CLIENT_INFO_FIELD_NUMBER: _ClassVar[int]
    DRY_RUN_FIELD_NUMBER: _ClassVar[int]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    audiences: _containers.RepeatedCompositeFieldContainer[_common_pb2.Audience]
    client_info: _info_pb2.ClientInfo
    dry_run: bool
    service_name: str
    def __init__(self, service_name: _Optional[str] = ..., dry_run: bool = ..., client_info: _Optional[_Union[_info_pb2.ClientInfo, _Mapping]] = ..., audiences: _Optional[_Iterable[_Union[_common_pb2.Audience, _Mapping]]] = ...) -> None: ...
