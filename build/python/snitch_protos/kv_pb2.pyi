from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor
KV_ACTION_CREATE: KVAction
KV_ACTION_DELETE: KVAction
KV_ACTION_UNSET: KVAction
KV_ACTION_UPDATE: KVAction

class KVCreateRequest(_message.Message):
    __slots__ = ["kvs", "overwrite"]
    KVS_FIELD_NUMBER: _ClassVar[int]
    OVERWRITE_FIELD_NUMBER: _ClassVar[int]
    kvs: _containers.RepeatedCompositeFieldContainer[KVObject]
    overwrite: bool
    def __init__(self, overwrite: bool = ..., kvs: _Optional[_Iterable[_Union[KVObject, _Mapping]]] = ...) -> None: ...

class KVInstruction(_message.Message):
    __slots__ = ["action", "id", "object", "requested_at_unix_ts_nano_utc"]
    ACTION_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    OBJECT_FIELD_NUMBER: _ClassVar[int]
    REQUESTED_AT_UNIX_TS_NANO_UTC_FIELD_NUMBER: _ClassVar[int]
    action: KVAction
    id: str
    object: KVObject
    requested_at_unix_ts_nano_utc: int
    def __init__(self, id: _Optional[str] = ..., action: _Optional[_Union[KVAction, str]] = ..., object: _Optional[_Union[KVObject, _Mapping]] = ..., requested_at_unix_ts_nano_utc: _Optional[int] = ...) -> None: ...

class KVObject(_message.Message):
    __slots__ = ["created_at_unix_ts_nano_utc", "key", "updated_at_unix_ts_nano_utc", "value"]
    CREATED_AT_UNIX_TS_NANO_UTC_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    UPDATED_AT_UNIX_TS_NANO_UTC_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    created_at_unix_ts_nano_utc: int
    key: str
    updated_at_unix_ts_nano_utc: int
    value: bytes
    def __init__(self, key: _Optional[str] = ..., value: _Optional[bytes] = ..., created_at_unix_ts_nano_utc: _Optional[int] = ..., updated_at_unix_ts_nano_utc: _Optional[int] = ...) -> None: ...

class KVAction(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
