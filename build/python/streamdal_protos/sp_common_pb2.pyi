from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
OPERATION_TYPE_CONSUMER: OperationType
OPERATION_TYPE_PRODUCER: OperationType
OPERATION_TYPE_UNSET: OperationType
RESPONSE_CODE_BAD_REQUEST: ResponseCode
RESPONSE_CODE_GENERIC_ERROR: ResponseCode
RESPONSE_CODE_INTERNAL_SERVER_ERROR: ResponseCode
RESPONSE_CODE_NOT_FOUND: ResponseCode
RESPONSE_CODE_OK: ResponseCode
RESPONSE_CODE_UNSET: ResponseCode
TAIL_REQUEST_TYPE_PAUSE: TailRequestType
TAIL_REQUEST_TYPE_RESUME: TailRequestType
TAIL_REQUEST_TYPE_START: TailRequestType
TAIL_REQUEST_TYPE_STOP: TailRequestType
TAIL_REQUEST_TYPE_UNSET: TailRequestType
TAIL_RESPONSE_TYPE_ERROR: TailResponseType
TAIL_RESPONSE_TYPE_PAYLOAD: TailResponseType
TAIL_RESPONSE_TYPE_UNSET: TailResponseType

class Audience(_message.Message):
    __slots__ = ["component_name", "operation_name", "operation_type", "service_name"]
    COMPONENT_NAME_FIELD_NUMBER: _ClassVar[int]
    OPERATION_NAME_FIELD_NUMBER: _ClassVar[int]
    OPERATION_TYPE_FIELD_NUMBER: _ClassVar[int]
    SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    component_name: str
    operation_name: str
    operation_type: OperationType
    service_name: str
    def __init__(self, service_name: _Optional[str] = ..., component_name: _Optional[str] = ..., operation_type: _Optional[_Union[OperationType, str]] = ..., operation_name: _Optional[str] = ...) -> None: ...

class AudienceRate(_message.Message):
    __slots__ = ["bytes", "processed"]
    BYTES_FIELD_NUMBER: _ClassVar[int]
    PROCESSED_FIELD_NUMBER: _ClassVar[int]
    bytes: float
    processed: float
    def __init__(self, bytes: _Optional[float] = ..., processed: _Optional[float] = ...) -> None: ...

class Metric(_message.Message):
    __slots__ = ["audience", "labels", "name", "value"]
    class LabelsEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    LABELS_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    audience: Audience
    labels: _containers.ScalarMap[str, str]
    name: str
    value: float
    def __init__(self, name: _Optional[str] = ..., labels: _Optional[_Mapping[str, str]] = ..., value: _Optional[float] = ..., audience: _Optional[_Union[Audience, _Mapping]] = ...) -> None: ...

class Schema(_message.Message):
    __slots__ = ["_metadata", "_version", "json_schema"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    JSON_SCHEMA_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _VERSION_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    _version: int
    json_schema: bytes
    def __init__(self, json_schema: _Optional[bytes] = ..., _version: _Optional[int] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class StandardResponse(_message.Message):
    __slots__ = ["code", "id", "message"]
    CODE_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    code: ResponseCode
    id: str
    message: str
    def __init__(self, id: _Optional[str] = ..., code: _Optional[_Union[ResponseCode, str]] = ..., message: _Optional[str] = ...) -> None: ...

class TailRequest(_message.Message):
    __slots__ = ["_id", "_metadata", "audience", "pipeline_id", "type"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    _ID_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _id: str
    _metadata: _containers.ScalarMap[str, str]
    audience: Audience
    pipeline_id: str
    type: TailRequestType
    def __init__(self, type: _Optional[_Union[TailRequestType, str]] = ..., _id: _Optional[str] = ..., audience: _Optional[_Union[Audience, _Mapping]] = ..., pipeline_id: _Optional[str] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class TailResponse(_message.Message):
    __slots__ = ["_keepalive", "_metadata", "audience", "new_data", "original_data", "pipeline_id", "session_id", "tail_request_id", "timestamp_ns", "type"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    NEW_DATA_FIELD_NUMBER: _ClassVar[int]
    ORIGINAL_DATA_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    TAIL_REQUEST_ID_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_NS_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    _KEEPALIVE_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _keepalive: bool
    _metadata: _containers.ScalarMap[str, str]
    audience: Audience
    new_data: bytes
    original_data: bytes
    pipeline_id: str
    session_id: str
    tail_request_id: str
    timestamp_ns: int
    type: TailResponseType
    def __init__(self, type: _Optional[_Union[TailResponseType, str]] = ..., tail_request_id: _Optional[str] = ..., audience: _Optional[_Union[Audience, _Mapping]] = ..., pipeline_id: _Optional[str] = ..., session_id: _Optional[str] = ..., timestamp_ns: _Optional[int] = ..., original_data: _Optional[bytes] = ..., new_data: _Optional[bytes] = ..., _metadata: _Optional[_Mapping[str, str]] = ..., _keepalive: bool = ...) -> None: ...

class ResponseCode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class OperationType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class TailResponseType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class TailRequestType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
