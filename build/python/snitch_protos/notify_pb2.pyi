from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
NOTIFY_TYPE_EMAIL: NotifyType
NOTIFY_TYPE_PAGERDUTY: NotifyType
NOTIFY_TYPE_SLACK: NotifyType
NOTIFY_TYPE_UNSET: NotifyType

class NotifyConfig(_message.Message):
    __slots__ = ["email", "id", "name", "pagerduty", "pipelines", "slack", "type"]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    PAGERDUTY_FIELD_NUMBER: _ClassVar[int]
    PIPELINES_FIELD_NUMBER: _ClassVar[int]
    SLACK_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    email: NotifyEmail
    id: str
    name: str
    pagerduty: NotifyPagerDuty
    pipelines: _containers.RepeatedScalarFieldContainer[str]
    slack: NotifySlack
    type: NotifyType
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., type: _Optional[_Union[NotifyType, str]] = ..., pipelines: _Optional[_Iterable[str]] = ..., slack: _Optional[_Union[NotifySlack, _Mapping]] = ..., email: _Optional[_Union[NotifyEmail, _Mapping]] = ..., pagerduty: _Optional[_Union[NotifyPagerDuty, _Mapping]] = ...) -> None: ...

class NotifyEmail(_message.Message):
    __slots__ = ["recipients"]
    RECIPIENTS_FIELD_NUMBER: _ClassVar[int]
    recipients: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, recipients: _Optional[_Iterable[str]] = ...) -> None: ...

class NotifyPagerDuty(_message.Message):
    __slots__ = ["email", "service_id", "token", "urgency"]
    class Urgency(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    SERVICE_ID_FIELD_NUMBER: _ClassVar[int]
    TOKEN_FIELD_NUMBER: _ClassVar[int]
    URGENCY_FIELD_NUMBER: _ClassVar[int]
    URGENCY_HIGH: NotifyPagerDuty.Urgency
    URGENCY_LOW: NotifyPagerDuty.Urgency
    URGENCY_UNSET: NotifyPagerDuty.Urgency
    email: str
    service_id: str
    token: str
    urgency: NotifyPagerDuty.Urgency
    def __init__(self, token: _Optional[str] = ..., email: _Optional[str] = ..., service_id: _Optional[str] = ..., urgency: _Optional[_Union[NotifyPagerDuty.Urgency, str]] = ...) -> None: ...

class NotifySlack(_message.Message):
    __slots__ = ["bot_token", "channel"]
    BOT_TOKEN_FIELD_NUMBER: _ClassVar[int]
    CHANNEL_FIELD_NUMBER: _ClassVar[int]
    bot_token: str
    channel: str
    def __init__(self, bot_token: _Optional[str] = ..., channel: _Optional[str] = ...) -> None: ...

class NotifyType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
