import command_pb2 as _command_pb2
import internal_pb2 as _internal_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BusEvent(_message.Message):
    __slots__ = ["_metadata", "command", "deregister_request", "heartbeat_request", "register_request", "source"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    COMMAND_FIELD_NUMBER: _ClassVar[int]
    DEREGISTER_REQUEST_FIELD_NUMBER: _ClassVar[int]
    HEARTBEAT_REQUEST_FIELD_NUMBER: _ClassVar[int]
    REGISTER_REQUEST_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    command: _command_pb2.Command
    deregister_request: _internal_pb2.DeregisterRequest
    heartbeat_request: _internal_pb2.HeartbeatRequest
    register_request: _internal_pb2.RegisterRequest
    source: str
    def __init__(self, source: _Optional[str] = ..., command: _Optional[_Union[_command_pb2.Command, _Mapping]] = ..., register_request: _Optional[_Union[_internal_pb2.RegisterRequest, _Mapping]] = ..., deregister_request: _Optional[_Union[_internal_pb2.DeregisterRequest, _Mapping]] = ..., heartbeat_request: _Optional[_Union[_internal_pb2.HeartbeatRequest, _Mapping]] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...
