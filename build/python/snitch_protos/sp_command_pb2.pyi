import sp_common_pb2 as _sp_common_pb2
import sp_kv_pb2 as _sp_kv_pb2
import sp_pipeline_pb2 as _sp_pipeline_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AttachPipelineCommand(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _sp_pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_sp_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...

class Command(_message.Message):
    __slots__ = ["attach_pipeline", "audience", "detach_pipeline", "keep_alive", "kv", "pause_pipeline", "resume_pipeline", "tail"]
    ATTACH_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    DETACH_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    KEEP_ALIVE_FIELD_NUMBER: _ClassVar[int]
    KV_FIELD_NUMBER: _ClassVar[int]
    PAUSE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    RESUME_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    TAIL_FIELD_NUMBER: _ClassVar[int]
    attach_pipeline: AttachPipelineCommand
    audience: _sp_common_pb2.Audience
    detach_pipeline: DetachPipelineCommand
    keep_alive: KeepAliveCommand
    kv: KVCommand
    pause_pipeline: PausePipelineCommand
    resume_pipeline: ResumePipelineCommand
    tail: TailCommand
    def __init__(self, audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ..., attach_pipeline: _Optional[_Union[AttachPipelineCommand, _Mapping]] = ..., detach_pipeline: _Optional[_Union[DetachPipelineCommand, _Mapping]] = ..., pause_pipeline: _Optional[_Union[PausePipelineCommand, _Mapping]] = ..., resume_pipeline: _Optional[_Union[ResumePipelineCommand, _Mapping]] = ..., keep_alive: _Optional[_Union[KeepAliveCommand, _Mapping]] = ..., kv: _Optional[_Union[KVCommand, _Mapping]] = ..., tail: _Optional[_Union[TailCommand, _Mapping]] = ...) -> None: ...

class DetachPipelineCommand(_message.Message):
    __slots__ = ["pipeline_id"]
    PIPELINE_ID_FIELD_NUMBER: _ClassVar[int]
    pipeline_id: str
    def __init__(self, pipeline_id: _Optional[str] = ...) -> None: ...

class KVCommand(_message.Message):
    __slots__ = ["instructions", "overwrite"]
    INSTRUCTIONS_FIELD_NUMBER: _ClassVar[int]
    OVERWRITE_FIELD_NUMBER: _ClassVar[int]
    instructions: _containers.RepeatedCompositeFieldContainer[_sp_kv_pb2.KVInstruction]
    overwrite: bool
    def __init__(self, instructions: _Optional[_Iterable[_Union[_sp_kv_pb2.KVInstruction, _Mapping]]] = ..., overwrite: bool = ...) -> None: ...

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

class TailCommand(_message.Message):
    __slots__ = ["request"]
    REQUEST_FIELD_NUMBER: _ClassVar[int]
    request: _sp_common_pb2.TailRequest
    def __init__(self, request: _Optional[_Union[_sp_common_pb2.TailRequest, _Mapping]] = ...) -> None: ...
