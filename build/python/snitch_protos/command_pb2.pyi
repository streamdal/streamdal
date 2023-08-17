import common_pb2 as _common_pb2
import pipeline_pb2 as _pipeline_pb2
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

class AttachPipelineCommand(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...

class Command(_message.Message):
    __slots__ = ["attach_pipeline", "audience", "detach_pipeline", "keep_alive", "kv", "pause_pipeline", "resume_pipeline"]
    ATTACH_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    DETACH_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    KEEP_ALIVE_FIELD_NUMBER: _ClassVar[int]
    KV_FIELD_NUMBER: _ClassVar[int]
    PAUSE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    RESUME_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    attach_pipeline: AttachPipelineCommand
    audience: _common_pb2.Audience
    detach_pipeline: DetachPipelineCommand
    keep_alive: KeepAliveCommand
    kv: KVCommand
    pause_pipeline: PausePipelineCommand
    resume_pipeline: ResumePipelineCommand
    def __init__(self, audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ..., attach_pipeline: _Optional[_Union[AttachPipelineCommand, _Mapping]] = ..., detach_pipeline: _Optional[_Union[DetachPipelineCommand, _Mapping]] = ..., pause_pipeline: _Optional[_Union[PausePipelineCommand, _Mapping]] = ..., resume_pipeline: _Optional[_Union[ResumePipelineCommand, _Mapping]] = ..., keep_alive: _Optional[_Union[KeepAliveCommand, _Mapping]] = ..., kv: _Optional[_Union[KVCommand, _Mapping]] = ...) -> None: ...

class DetachPipelineCommand(_message.Message):
    __slots__ = ["pipeline_id"]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ...) -> None: ...

class KVCommand(_message.Message):
    __slots__ = ["instructions"]
    INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    instructions: _containers.RepeatedCompositeFieldContainer[KVInstruction]
    def __init__(self, instructions: _Optional[_Iterable[_Union[KVInstruction, _Mapping]]] = ...) -> None: ...

class KVInstruction(_message.Message):
    __slots__ = ["action", "id", "key", "requested_at_unix_ts_nano_utc", "value"]
    ACTION_FIELD_NUMBER: _ClassVar[int]
    ID_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    REQUESTED_AT_UNIX_TS_NANO_UTC_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    action: KVAction
    id: str
    key: str
    requested_at_unix_ts_nano_utc: int
    value: bytes
    def __init__(self, id: _Optional[str] = ..., action: _Optional[_Union[KVAction, str]] = ..., key: _Optional[str] = ..., value: _Optional[bytes] = ..., requested_at_unix_ts_nano_utc: _Optional[int] = ...) -> None: ...

class KeepAliveCommand(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class PausePipelineCommand(_message.Message):
    __slots__ = ["pipeline_id"]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ...) -> None: ...

class ResumePipelineCommand(_message.Message):
    __slots__ = ["pipeline_id"]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ...) -> None: ...

class KVAction(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
