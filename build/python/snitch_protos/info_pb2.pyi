import common_pb2 as _common_pb2
import pipeline_pb2 as _pipeline_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

CLIENT_TYPE_SDK: ClientType
CLIENT_TYPE_SHIM: ClientType
CLIENT_TYPE_UNSET: ClientType
DESCRIPTOR: _descriptor.FileDescriptor

class ClientInfo(_message.Message):
    __slots__ = ["_node_name", "_service_name", "_session_id", "arch", "client_type", "language", "library_name", "library_version", "os"]
    ARCH_FIELD_NUMBER: _ClassVar[int]
    CLIENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    LIBRARY_NAME_FIELD_NUMBER: _ClassVar[int]
    LIBRARY_VERSION_FIELD_NUMBER: _ClassVar[int]
    OS_FIELD_NUMBER: _ClassVar[int]
    _NODE_NAME_FIELD_NUMBER: _ClassVar[int]
    _SERVICE_NAME_FIELD_NUMBER: _ClassVar[int]
    _SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    _node_name: str
    _service_name: str
    _session_id: str
    arch: str
    client_type: ClientType
    language: str
    library_name: str
    library_version: str
    os: str
    def __init__(self, client_type: _Optional[_Union[ClientType, str]] = ..., library_name: _Optional[str] = ..., library_version: _Optional[str] = ..., language: _Optional[str] = ..., arch: _Optional[str] = ..., os: _Optional[str] = ..., _session_id: _Optional[str] = ..., _service_name: _Optional[str] = ..., _node_name: _Optional[str] = ...) -> None: ...

class LiveInfo(_message.Message):
    __slots__ = ["audiences", "client"]
    AUDIENCES_FIELD_NUMBER: _ClassVar[int]
    CLIENT_FIELD_NUMBER: _ClassVar[int]
    audiences: _containers.RepeatedCompositeFieldContainer[_common_pb2.Audience]
    client: ClientInfo
    def __init__(self, audiences: _Optional[_Iterable[_Union[_common_pb2.Audience, _Mapping]]] = ..., client: _Optional[_Union[ClientInfo, _Mapping]] = ...) -> None: ...

class PipelineInfo(_message.Message):
    __slots__ = ["audiences", "paused", "pipeline"]
    AUDIENCES_FIELD_NUMBER: _ClassVar[int]
    PAUSED_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    audiences: _containers.RepeatedCompositeFieldContainer[_common_pb2.Audience]
    paused: _containers.RepeatedCompositeFieldContainer[_common_pb2.Audience]
    pipeline: _pipeline_pb2.Pipeline
    def __init__(self, audiences: _Optional[_Iterable[_Union[_common_pb2.Audience, _Mapping]]] = ..., pipeline: _Optional[_Union[_pipeline_pb2.Pipeline, _Mapping]] = ..., paused: _Optional[_Iterable[_Union[_common_pb2.Audience, _Mapping]]] = ...) -> None: ...

class ClientType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
