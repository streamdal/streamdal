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

class Metric(_message.Message):
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

class StandardResponse(_message.Message):
    __slots__ = ["code", "id", "message"]
    CODE_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    code: ResponseCode
    id: str
    message: str
    def __init__(self, id: _Optional[str] = ..., code: _Optional[_Union[ResponseCode, str]] = ..., message: _Optional[str] = ...) -> None: ...

class ResponseCode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class OperationType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
