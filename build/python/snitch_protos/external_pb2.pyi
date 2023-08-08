import common_pb2 as _common_pb2
import info_pb2 as _info_pb2
import notify_pb2 as _notify_pb2
import pipeline_pb2 as _pipeline_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AttachNotificationRequest(_message.Message):
    __slots__ = ["notification_id", "pipeline_id"]
    NOTIFICATION_ID_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    notification_id: str
    pipeline_id: str
    def __init__(self, notification_id: _Optional[str] = ..., pipeline_id: _Optional[str] = ...) -> None: ...

class AttachPipelineRequest(_message.Message):
    __slots__ = ["audience", "pipeline_id"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    audience: _common_pb2.Audience
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ..., audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ...) -> None: ...

class CreateNotificationRequest(_message.Message):
    __slots__ = ["notification"]
    NOTIFICATION_FIELD_NUMBER: _ClassVar[int]
    notification: _notify_pb2.NotificationConfig
    def __init__(self, notification: _Optional[_Union[_notify_pb2.NotificationConfig, _Mapping]] = ...) -> None: ...

class CreatePipelineRequest(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...

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

class DetachPipelineRequest(_message.Message):
    __slots__ = ["audience", "pipeline_id"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    audience: _common_pb2.Audience
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ..., audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ...) -> None: ...

class GetNotificationRequest(_message.Message):
    __slots__ = ["notification_id"]
    NOTIFICATION_ID_FIELD_NUMBER: _ClassVar[int]
    notification_id: str
    def __init__(self, notification_id: _Optional[str] = ...) -> None: ...

class GetNotificationResponse(_message.Message):
    __slots__ = ["notification"]
    NOTIFICATION_FIELD_NUMBER: _ClassVar[int]
    notification: _notify_pb2.NotificationConfig
    def __init__(self, notification: _Optional[_Union[_notify_pb2.NotificationConfig, _Mapping]] = ...) -> None: ...

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
        value: _notify_pb2.NotificationConfig
        def __init__(self, key: _Optional[str] = ..., value: _Optional[_Union[_notify_pb2.NotificationConfig, _Mapping]] = ...) -> None: ...
    NOTIFICATIONS_FIELD_NUMBER: _ClassVar[int]
    notifications: _containers.MessageMap[str, _notify_pb2.NotificationConfig]
    def __init__(self, notifications: _Optional[_Mapping[str, _notify_pb2.NotificationConfig]] = ...) -> None: ...

class GetPipelineRequest(_message.Message):
    __slots__ = ["pipeline_id"]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ...) -> None: ...

class GetPipelineResponse(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...

class GetPipelinesRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetPipelinesResponse(_message.Message):
    __slots__ = ["pipelines"]
    PIPELINES_FIELD_NUMBER: _ClassVar[int]
    pipelines: _containers.RepeatedCompositeFieldContainer[_pipeline_pb2.Pipeline]
    def __init__(self, pipelines: _Optional[_Iterable[_Union[_pipeline_pb2.Pipeline, _Mapping]]] = ...) -> None: ...

class GetServiceMapRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class GetServiceMapResponse(_message.Message):
    __slots__ = ["service_map"]
    class ServiceMapEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: _info_pb2.ServiceInfo
        def __init__(self, key: _Optional[str] = ..., value: _Optional[_Union[_info_pb2.ServiceInfo, _Mapping]] = ...) -> None: ...
    SERVICE_MAP_FIELD_NUMBER: _ClassVar[int]
    service_map: _containers.MessageMap[str, _info_pb2.ServiceInfo]
    def __init__(self, service_map: _Optional[_Mapping[str, _info_pb2.ServiceInfo]] = ...) -> None: ...

class PausePipelineRequest(_message.Message):
    __slots__ = ["audience", "pipeline_id"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    audience: _common_pb2.Audience
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ..., audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ...) -> None: ...

class ResumePipelineRequest(_message.Message):
    __slots__ = ["audience", "pipeline_id"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    audience: _common_pb2.Audience
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ..., audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ...) -> None: ...

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
    notification: _notify_pb2.NotificationConfig
    def __init__(self, notification: _Optional[_Union[_notify_pb2.NotificationConfig, _Mapping]] = ...) -> None: ...

class UpdatePipelineRequest(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...
