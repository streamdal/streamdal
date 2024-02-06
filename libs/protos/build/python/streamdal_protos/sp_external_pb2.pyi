import sp_common_pb2 as _sp_common_pb2
import sp_info_pb2 as _sp_info_pb2
import sp_notify_pb2 as _sp_notify_pb2
import sp_pipeline_pb2 as _sp_pipeline_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AppRegisterRejectRequest(_message.Message):
    __slots__ = ["cluster_id"]
    CLUSTER_ID_FIELD_NUMBER: _ClassVar[int]
    cluster_id: str
    def __init__(self, cluster_id: _Optional[str] = ...) -> None: ...

class AppRegistrationRequest(_message.Message):
    __slots__ = ["_code", "cluster_id", "email"]
    CLUSTER_ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    _CODE_FIELD_NUMBER: _ClassVar[int]
    _code: str
    cluster_id: str
    email: str
    def __init__(self, email: _Optional[str] = ..., cluster_id: _Optional[str] = ..., _code: _Optional[str] = ...) -> None: ...

class AppRegistrationStatusRequest(_message.Message):
    __slots__ = ["email"]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    email: str
    def __init__(self, email: _Optional[str] = ...) -> None: ...

class AppRegistrationStatusResponse(_message.Message):
    __slots__ = ["status"]
    class Status(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    STATUS_DONE: AppRegistrationStatusResponse.Status
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STATUS_SUBMIT: AppRegistrationStatusResponse.Status
    STATUS_UNSET: AppRegistrationStatusResponse.Status
    STATUS_VERIFY: AppRegistrationStatusResponse.Status
    status: AppRegistrationStatusResponse.Status
    def __init__(self, status: _Optional[_Union[AppRegistrationStatusResponse.Status, str]] = ...) -> None: ...

class AppVerifyRegistrationRequest(_message.Message):
    __slots__ = ["code", "email"]
    CODE_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    code: str
    email: str
    def __init__(self, email: _Optional[str] = ..., code: _Optional[str] = ...) -> None: ...

class AttachNotificationRequest(_message.Message):
    __slots__ = ["notification_id", "pipeline_id"]
    NOTIFICATION_ID_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    notification_id: str
    pipeline_id: str
    def __init__(self, notification_id: _Optional[str] = ..., pipeline_id: _Optional[str] = ...) -> None: ...

class CreateNotificationRequest(_message.Message):
    __slots__ = ["notification"]
    NOTIFICATION_FIELD_NUMBER: _ClassVar[int]
    notification: _sp_notify_pb2.NotificationConfig
    def __init__(self, notification: _Optional[_Union[_sp_notify_pb2.NotificationConfig, _Mapping]] = ...) -> None: ...

class CreatePipelineRequest(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _sp_pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_sp_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...

class CreatePipelineResponse(_message.Message):
    __slots__ = ["message", "pipeline_id"]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    message: str
    pipeline_id: str
    def __init__(self, message: _Optional[str] = ..., pipeline_id: _Optional[str] = ...) -> None: ...

class DeleteAudienceRequest(_message.Message):
    __slots__ = ["audience", "force"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    FORCE_FIELD_NUMBER: _ClassVar[int]
    audience: _sp_common_pb2.Audience
    force: bool
    def __init__(self, audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ..., force: bool = ...) -> None: ...

class DeleteNotificationRequest(_message.Message):
    __slots__ = ["notification_id"]
    NOTIFICATION_ID_FIELD_NUMBER: _ClassVar[int]
    notification_id: str
    def __init__(self, notification_id: _Optional[str] = ...) -> None: ...

class DeletePipelineRequest(_message.Message):
    __slots__ = ["pipeline_id"]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ...) -> None: ...

class DeleteServiceRequest(_message.Message):
    __slots__ = ["force", "service_name"]
    FORCE_FIELD_NUMBER: _ClassVar[int]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    force: bool
    service_name: str
    def __init__(self, service_name: _Optional[str] = ..., force: bool = ...) -> None: ...

class DetachNotificationRequest(_message.Message):
    __slots__ = ["notification_id", "pipeline_id"]
    NOTIFICATION_ID_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    notification_id: str
    pipeline_id: str
    def __init__(self, notification_id: _Optional[str] = ..., pipeline_id: _Optional[str] = ...) -> None: ...

class GetAllRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetAllResponse(_message.Message):
    __slots__ = ["_keepalive", "audiences", "config", "generated_at_unix_ts_ns_utc", "live", "pipelines"]
    class ConfigEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: GetAllResponsePipelines
        def __init__(self, key: _Optional[str] = ..., value: _Optional[_Union[GetAllResponsePipelines, _Mapping]] = ...) -> None: ...
    class PipelinesEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: _sp_info_pb2.PipelineInfo
        def __init__(self, key: _Optional[str] = ..., value: _Optional[_Union[_sp_info_pb2.PipelineInfo, _Mapping]] = ...) -> None: ...
    AUDIENCES_FIELD_NUMBER: _ClassVar[int]
    CONFIG_FIELD_NUMBER: _ClassVar[int]
    GENERATED_AT_UNIX_TS_NS_UTC_FIELD_NUMBER: _ClassVar[int]
    LIVE_FIELD_NUMBER: _ClassVar[int]
    PIPELINES_FIELD_NUMBER: _ClassVar[int]
    _KEEPALIVE_FIELD_NUMBER: _ClassVar[int]
    _keepalive: bool
    audiences: _containers.RepeatedCompositeFieldContainer[_sp_common_pb2.Audience]
    config: _containers.MessageMap[str, GetAllResponsePipelines]
    generated_at_unix_ts_ns_utc: int
    live: _containers.RepeatedCompositeFieldContainer[_sp_info_pb2.LiveInfo]
    pipelines: _containers.MessageMap[str, _sp_info_pb2.PipelineInfo]
    def __init__(self, live: _Optional[_Iterable[_Union[_sp_info_pb2.LiveInfo, _Mapping]]] = ..., audiences: _Optional[_Iterable[_Union[_sp_common_pb2.Audience, _Mapping]]] = ..., pipelines: _Optional[_Mapping[str, _sp_info_pb2.PipelineInfo]] = ..., config: _Optional[_Mapping[str, GetAllResponsePipelines]] = ..., generated_at_unix_ts_ns_utc: _Optional[int] = ..., _keepalive: bool = ...) -> None: ...

class GetAllResponsePipelines(_message.Message):
    __slots__ = ["configs"]
    CONFIGS_FIELD_NUMBER: _ClassVar[int]
    configs: _containers.RepeatedCompositeFieldContainer[_sp_pipeline_pb2.PipelineConfig]
    def __init__(self, configs: _Optional[_Iterable[_Union[_sp_pipeline_pb2.PipelineConfig, _Mapping]]] = ...) -> None: ...

class GetAudienceRatesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetAudienceRatesResponse(_message.Message):
    __slots__ = ["_keepalive", "rates"]
    class RatesEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: _sp_common_pb2.AudienceRate
        def __init__(self, key: _Optional[str] = ..., value: _Optional[_Union[_sp_common_pb2.AudienceRate, _Mapping]] = ...) -> None: ...
    RATES_FIELD_NUMBER: _ClassVar[int]
    _KEEPALIVE_FIELD_NUMBER: _ClassVar[int]
    _keepalive: bool
    rates: _containers.MessageMap[str, _sp_common_pb2.AudienceRate]
    def __init__(self, rates: _Optional[_Mapping[str, _sp_common_pb2.AudienceRate]] = ..., _keepalive: bool = ...) -> None: ...

class GetMetricsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetMetricsResponse(_message.Message):
    __slots__ = ["_keepalive", "metrics"]
    class MetricsEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: _sp_common_pb2.Metric
        def __init__(self, key: _Optional[str] = ..., value: _Optional[_Union[_sp_common_pb2.Metric, _Mapping]] = ...) -> None: ...
    METRICS_FIELD_NUMBER: _ClassVar[int]
    _KEEPALIVE_FIELD_NUMBER: _ClassVar[int]
    _keepalive: bool
    metrics: _containers.MessageMap[str, _sp_common_pb2.Metric]
    def __init__(self, metrics: _Optional[_Mapping[str, _sp_common_pb2.Metric]] = ..., _keepalive: bool = ...) -> None: ...

class GetNotificationRequest(_message.Message):
    __slots__ = ["notification_id"]
    NOTIFICATION_ID_FIELD_NUMBER: _ClassVar[int]
    notification_id: str
    def __init__(self, notification_id: _Optional[str] = ...) -> None: ...

class GetNotificationResponse(_message.Message):
    __slots__ = ["notification"]
    NOTIFICATION_FIELD_NUMBER: _ClassVar[int]
    notification: _sp_notify_pb2.NotificationConfig
    def __init__(self, notification: _Optional[_Union[_sp_notify_pb2.NotificationConfig, _Mapping]] = ...) -> None: ...

class GetNotificationsRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetNotificationsResponse(_message.Message):
    __slots__ = ["notifications"]
    class NotificationsEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: _sp_notify_pb2.NotificationConfig
        def __init__(self, key: _Optional[str] = ..., value: _Optional[_Union[_sp_notify_pb2.NotificationConfig, _Mapping]] = ...) -> None: ...
    NOTIFICATIONS_FIELD_NUMBER: _ClassVar[int]
    notifications: _containers.MessageMap[str, _sp_notify_pb2.NotificationConfig]
    def __init__(self, notifications: _Optional[_Mapping[str, _sp_notify_pb2.NotificationConfig]] = ...) -> None: ...

class GetPipelineRequest(_message.Message):
    __slots__ = ["pipeline_id"]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ...) -> None: ...

class GetPipelineResponse(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _sp_pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_sp_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...

class GetPipelinesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetPipelinesResponse(_message.Message):
    __slots__ = ["pipelines"]
    PIPELINES_FIELD_NUMBER: _ClassVar[int]
    pipelines: _containers.RepeatedCompositeFieldContainer[_sp_pipeline_pb2.Pipeline]
    def __init__(self, pipelines: _Optional[_Iterable[_Union[_sp_pipeline_pb2.Pipeline, _Mapping]]] = ...) -> None: ...

class GetSchemaRequest(_message.Message):
    __slots__ = ["audience"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    audience: _sp_common_pb2.Audience
    def __init__(self, audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ...) -> None: ...

class GetSchemaResponse(_message.Message):
    __slots__ = ["schema"]
    SCHEMA_FIELD_NUMBER: _ClassVar[int]
    schema: _sp_common_pb2.Schema
    def __init__(self, schema: _Optional[_Union[_sp_common_pb2.Schema, _Mapping]] = ...) -> None: ...

class PausePipelineRequest(_message.Message):
    __slots__ = ["audience", "pipeline_id"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    audience: _sp_common_pb2.Audience
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ..., audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ...) -> None: ...

class PauseTailRequest(_message.Message):
    __slots__ = ["tail_id"]
    TAIL_ID_FIELD_NUMBER: _ClassVar[int]
    tail_id: str
    def __init__(self, tail_id: _Optional[str] = ...) -> None: ...

class ResumePipelineRequest(_message.Message):
    __slots__ = ["audience", "pipeline_id"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    audience: _sp_common_pb2.Audience
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ..., audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ...) -> None: ...

class ResumeTailRequest(_message.Message):
    __slots__ = ["tail_id"]
    TAIL_ID_FIELD_NUMBER: _ClassVar[int]
    tail_id: str
    def __init__(self, tail_id: _Optional[str] = ...) -> None: ...

class SetPipelinesRequest(_message.Message):
    __slots__ = ["audience", "pipeline_ids"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_IDS_FIELD_NUMBER: _ClassVar[int]
    audience: _sp_common_pb2.Audience
    pipeline_ids: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, pipeline_ids: _Optional[_Iterable[str]] = ..., audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ...) -> None: ...

class TestRequest(_message.Message):
    __slots__ = ["input"]
    INPUT_FIELD_NUMBER: _ClassVar[int]
    input: str
    def __init__(self, input: _Optional[str] = ...) -> None: ...

class TestResponse(_message.Message):
    __slots__ = ["output"]
    OUTPUT_FIELD_NUMBER: _ClassVar[int]
    output: str
    def __init__(self, output: _Optional[str] = ...) -> None: ...

class UpdateNotificationRequest(_message.Message):
    __slots__ = ["notification"]
    NOTIFICATION_FIELD_NUMBER: _ClassVar[int]
    notification: _sp_notify_pb2.NotificationConfig
    def __init__(self, notification: _Optional[_Union[_sp_notify_pb2.NotificationConfig, _Mapping]] = ...) -> None: ...

class UpdatePipelineRequest(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _sp_pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_sp_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...
