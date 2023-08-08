from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
NOTIFICATION_TYPE_EMAIL: NotificationType
NOTIFICATION_TYPE_PAGERDUTY: NotificationType
NOTIFICATION_TYPE_SLACK: NotificationType
NOTIFICATION_TYPE_UNSET: NotificationType

class NotificationConfig(_message.Message):
    __slots__ = ["email", "id", "name", "pagerduty", "pipeline_id", "slack", "type"]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    PAGERDUTY_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    SLACK_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    email: NotificationEmail
    id: str
    name: str
    pagerduty: NotificationPagerDuty
    pipeline_id: str
    slack: NotificationSlack
    type: NotificationType
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., type: _Optional[_Union[NotificationType, str]] = ..., pipeline_id: _Optional[str] = ..., slack: _Optional[_Union[NotificationSlack, _Mapping]] = ..., email: _Optional[_Union[NotificationEmail, _Mapping]] = ..., pagerduty: _Optional[_Union[NotificationPagerDuty, _Mapping]] = ...) -> None: ...

class NotificationEmail(_message.Message):
    __slots__ = ["recipients"]
    RECIPIENTS_FIELD_NUMBER: _ClassVar[int]
    recipients: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, recipients: _Optional[_Iterable[str]] = ...) -> None: ...

class NotificationPagerDuty(_message.Message):
    __slots__ = ["email", "service_id", "token", "urgency"]
    class Urgency(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    SERVICE_ID_FIELD_NUMBER: _ClassVar[int]
    TOKEN_FIELD_NUMBER: _ClassVar[int]
    URGENCY_FIELD_NUMBER: _ClassVar[int]
    URGENCY_HIGH: NotificationPagerDuty.Urgency
    URGENCY_LOW: NotificationPagerDuty.Urgency
    URGENCY_UNSET: NotificationPagerDuty.Urgency
    email: str
    service_id: str
    token: str
    urgency: NotificationPagerDuty.Urgency
    def __init__(self, token: _Optional[str] = ..., email: _Optional[str] = ..., service_id: _Optional[str] = ..., urgency: _Optional[_Union[NotificationPagerDuty.Urgency, str]] = ...) -> None: ...

class NotificationSlack(_message.Message):
    __slots__ = ["bot_token", "channel"]
    BOT_TOKEN_FIELD_NUMBER: _ClassVar[int]
    CHANNEL_FIELD_NUMBER: _ClassVar[int]
    bot_token: str
    channel: str
    def __init__(self, bot_token: _Optional[str] = ..., channel: _Optional[str] = ...) -> None: ...

class NotificationType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
