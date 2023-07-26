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
    __slots__ = ["arch", "client_type", "language", "library_name", "library_version", "os"]
    ARCH_FIELD_NUMBER: _ClassVar[int]
    CLIENT_TYPE_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    LIBRARY_NAME_FIELD_NUMBER: _ClassVar[int]
    LIBRARY_VERSION_FIELD_NUMBER: _ClassVar[int]
    OS_FIELD_NUMBER: _ClassVar[int]
    arch: str
    client_type: ClientType
    language: str
    library_name: str
    library_version: str
    os: str
    def __init__(self, client_type: _Optional[_Union[ClientType, str]] = ..., library_name: _Optional[str] = ..., library_version: _Optional[str] = ..., language: _Optional[str] = ..., arch: _Optional[str] = ..., os: _Optional[str] = ...) -> None: ...

class ConsumerInfo(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class PipelineInfo(_message.Message):
    __slots__ = ["audience", "pipeline"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    audience: _common_pb2.Audience
    pipeline: _pipeline_pb2.Pipeline
    def __init__(self, audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ..., pipeline: _Optional[_Union[_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...

class ProducerInfo(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class ServiceInfo(_message.Message):
    __slots__ = ["clients", "consumers", "description", "name", "pipelines", "producers"]
    CLIENTS_FIELD_NUMBER: _ClassVar[int]
    CONSUMERS_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    PIPELINES_FIELD_NUMBER: _ClassVar[int]
    PRODUCERS_FIELD_NUMBER: _ClassVar[int]
    clients: _containers.RepeatedCompositeFieldContainer[ClientInfo]
    consumers: _containers.RepeatedCompositeFieldContainer[ConsumerInfo]
    description: str
    name: str
    pipelines: _containers.RepeatedCompositeFieldContainer[PipelineInfo]
    producers: _containers.RepeatedCompositeFieldContainer[ProducerInfo]
    def __init__(self, name: _Optional[str] = ..., description: _Optional[str] = ..., pipelines: _Optional[_Iterable[_Union[PipelineInfo, _Mapping]]] = ..., consumers: _Optional[_Iterable[_Union[ConsumerInfo, _Mapping]]] = ..., producers: _Optional[_Iterable[_Union[ProducerInfo, _Mapping]]] = ..., clients: _Optional[_Iterable[_Union[ClientInfo, _Mapping]]] = ...) -> None: ...

class ClientType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
