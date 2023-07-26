import common_pb2 as _common_pb2
import pipeline_pb2 as _pipeline_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Command(_message.Message):
    __slots__ = ["audience", "delete_pipeline", "keep_alive", "pause_pipeline", "set_pipeline", "unpause_pipeline"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    DELETE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    KEEP_ALIVE_FIELD_NUMBER: _ClassVar[int]
    PAUSE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    SET_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    UNPAUSE_PIPELINE_FIELD_NUMBER: _ClassVar[int]
    audience: _common_pb2.Audience
    delete_pipeline: DeletePipelineCommand
    keep_alive: KeepAliveCommand
    pause_pipeline: PausePipelineCommand
    set_pipeline: SetPipelineCommand
    unpause_pipeline: UnpausePipelineCommand
    def __init__(self, audience: _Optional[_Union[_common_pb2.Audience, _Mapping]] = ..., set_pipeline: _Optional[_Union[SetPipelineCommand, _Mapping]] = ..., delete_pipeline: _Optional[_Union[DeletePipelineCommand, _Mapping]] = ..., pause_pipeline: _Optional[_Union[PausePipelineCommand, _Mapping]] = ..., unpause_pipeline: _Optional[_Union[UnpausePipelineCommand, _Mapping]] = ..., keep_alive: _Optional[_Union[KeepAliveCommand, _Mapping]] = ...) -> None: ...

class DeletePipelineCommand(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class KeepAliveCommand(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class PausePipelineCommand(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...

class SetPipelineCommand(_message.Message):
    __slots__ = ["pipeline"]
    PIPELINE_FIELD_NUMBER: _ClassVar[int]
    pipeline: _pipeline_pb2.Pipeline
    def __init__(self, pipeline: _Optional[_Union[_pipeline_pb2.Pipeline, _Mapping]] = ...) -> None: ...

class UnpausePipelineCommand(_message.Message):
    __slots__ = ["id"]
    ID_FIELD_NUMBER: _ClassVar[int]
    id: str
    def __init__(self, id: _Optional[str] = ...) -> None: ...
