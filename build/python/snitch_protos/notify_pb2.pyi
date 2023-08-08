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
    __slots__ = ["email", "id", "name", "pagerduty", "slack", "type"]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    PAGERDUTY_FIELD_NUMBER: _ClassVar[int]
    SLACK_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    email: NotificationEmail
    id: str
    name: str
    pagerduty: NotificationPagerDuty
    slack: NotificationSlack
    type: NotificationType
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., type: _Optional[_Union[NotificationType, str]] = ..., slack: _Optional[_Union[NotificationSlack, _Mapping]] = ..., email: _Optional[_Union[NotificationEmail, _Mapping]] = ..., pagerduty: _Optional[_Union[NotificationPagerDuty, _Mapping]] = ...) -> None: ...

class NotificationEmail(_message.Message):
    __slots__ = ["from_address", "recipients", "ses", "smtp", "type"]
    class Type(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    FROM_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    RECIPIENTS_FIELD_NUMBER: _ClassVar[int]
    SES_FIELD_NUMBER: _ClassVar[int]
    SMTP_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    TYPE_SES: NotificationEmail.Type
    TYPE_SMTP: NotificationEmail.Type
    TYPE_UNSET: NotificationEmail.Type
    from_address: str
    recipients: _containers.RepeatedScalarFieldContainer[str]
    ses: NotificationEmailSES
    smtp: NotificationEmailSMTP
    type: NotificationEmail.Type
    def __init__(self, type: _Optional[_Union[NotificationEmail.Type, str]] = ..., recipients: _Optional[_Iterable[str]] = ..., from_address: _Optional[str] = ..., smtp: _Optional[_Union[NotificationEmailSMTP, _Mapping]] = ..., ses: _Optional[_Union[NotificationEmailSES, _Mapping]] = ...) -> None: ...

class NotificationEmailSES(_message.Message):
    __slots__ = ["ses_access_key_id", "ses_region", "ses_secret_access_key"]
    SES_ACCESS_KEY_ID_FIELD_NUMBER: _ClassVar[int]
    SES_REGION_FIELD_NUMBER: _ClassVar[int]
    SES_SECRET_ACCESS_KEY_FIELD_NUMBER: _ClassVar[int]
    ses_access_key_id: str
    ses_region: str
    ses_secret_access_key: str
    def __init__(self, ses_region: _Optional[str] = ..., ses_access_key_id: _Optional[str] = ..., ses_secret_access_key: _Optional[str] = ...) -> None: ...

class NotificationEmailSMTP(_message.Message):
    __slots__ = ["smtp_host", "smtp_password", "smtp_port", "smtp_user", "use_tls"]
    SMTP_HOST_FIELD_NUMBER: _ClassVar[int]
    SMTP_PASSWORD_FIELD_NUMBER: _ClassVar[int]
    SMTP_PORT_FIELD_NUMBER: _ClassVar[int]
    SMTP_USER_FIELD_NUMBER: _ClassVar[int]
    USE_TLS_FIELD_NUMBER: _ClassVar[int]
    smtp_host: str
    smtp_password: str
    smtp_port: int
    smtp_user: str
    use_tls: bool
    def __init__(self, smtp_host: _Optional[str] = ..., smtp_port: _Optional[int] = ..., smtp_user: _Optional[str] = ..., smtp_password: _Optional[str] = ..., use_tls: bool = ...) -> None: ...

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
