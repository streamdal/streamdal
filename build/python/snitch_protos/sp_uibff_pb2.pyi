from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Registration(_message.Message):
    __slots__ = ["_code", "email"]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    _CODE_FIELD_NUMBER: _ClassVar[int]
    _code: int
    email: str
    def __init__(self, email: _Optional[str] = ..., _code: _Optional[int] = ...) -> None: ...

class RegistrationStatus(_message.Message):
    __slots__ = ["status"]
    class Status(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    STATUS_DONE: RegistrationStatus.Status
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STATUS_SUBMIT: RegistrationStatus.Status
    STATUS_UNSET: RegistrationStatus.Status
    STATUS_VERIFY: RegistrationStatus.Status
    status: RegistrationStatus.Status
    def __init__(self, status: _Optional[_Union[RegistrationStatus.Status, str]] = ...) -> None: ...

class Verify(_message.Message):
    __slots__ = ["code", "email"]
    CODE_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    code: str
    email: str
    def __init__(self, email: _Optional[str] = ..., code: _Optional[str] = ...) -> None: ...
