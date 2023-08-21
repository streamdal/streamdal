from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class HttpRequest(_message.Message):
    __slots__ = ["body", "headers", "method", "url"]
    class Method(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    class HeadersEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    BODY_FIELD_NUMBER: _ClassVar[int]
    HEADERS_FIELD_NUMBER: _ClassVar[int]
    METHOD_DELETE: HttpRequest.Method
    METHOD_FIELD_NUMBER: _ClassVar[int]
    METHOD_GET: HttpRequest.Method
    METHOD_POST: HttpRequest.Method
    METHOD_PUT: HttpRequest.Method
    METHOD_UNSET: HttpRequest.Method
    URL_FIELD_NUMBER: _ClassVar[int]
    body: bytes
    headers: _containers.ScalarMap[str, str]
    method: HttpRequest.Method
    url: str
    def __init__(self, method: _Optional[_Union[HttpRequest.Method, str]] = ..., url: _Optional[str] = ..., body: _Optional[bytes] = ..., headers: _Optional[_Mapping[str, str]] = ...) -> None: ...

class HttpResponse(_message.Message):
    __slots__ = ["body", "code", "headers"]
    class HeadersEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    BODY_FIELD_NUMBER: _ClassVar[int]
    CODE_FIELD_NUMBER: _ClassVar[int]
    HEADERS_FIELD_NUMBER: _ClassVar[int]
    body: bytes
    code: int
    headers: _containers.ScalarMap[str, str]
    def __init__(self, code: _Optional[int] = ..., body: _Optional[bytes] = ..., headers: _Optional[_Mapping[str, str]] = ...) -> None: ...
