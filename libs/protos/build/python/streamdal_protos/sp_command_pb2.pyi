from shared import sp_shared_pb2 as _sp_shared_pb2
import sp_common_pb2 as _sp_common_pb2
import sp_kv_pb2 as _sp_kv_pb2
import sp_pipeline_pb2 as _sp_pipeline_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Command(_message.Message):
    __slots__ = ["audience", "keep_alive", "kv", "set_pipelines", "tail"]
    AUDIENCE_FIELD_NUMBER: _ClassVar[int]
    KEEP_ALIVE_FIELD_NUMBER: _ClassVar[int]
    KV_FIELD_NUMBER: _ClassVar[int]
    SET_PIPELINES_FIELD_NUMBER: _ClassVar[int]
    TAIL_FIELD_NUMBER: _ClassVar[int]
    audience: _sp_common_pb2.Audience
    keep_alive: KeepAliveCommand
    kv: KVCommand
    set_pipelines: SetPipelinesCommand
    tail: TailCommand
    def __init__(self, audience: _Optional[_Union[_sp_common_pb2.Audience, _Mapping]] = ..., set_pipelines: _Optional[_Union[SetPipelinesCommand, _Mapping]] = ..., keep_alive: _Optional[_Union[KeepAliveCommand, _Mapping]] = ..., kv: _Optional[_Union[KVCommand, _Mapping]] = ..., tail: _Optional[_Union[TailCommand, _Mapping]] = ...) -> None: ...

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

class SetPipelinesCommand(_message.Message):
    __slots__ = ["pipelines", "wasm_modules"]
    class WasmModulesEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: _sp_shared_pb2.WasmModule
        def __init__(self, key: _Optional[str] = ..., value: _Optional[_Union[_sp_shared_pb2.WasmModule, _Mapping]] = ...) -> None: ...
    PIPELINES_FIELD_NUMBER: _ClassVar[int]
    WASM_MODULES_FIELD_NUMBER: _ClassVar[int]
    pipelines: _containers.RepeatedCompositeFieldContainer[_sp_pipeline_pb2.Pipeline]
    wasm_modules: _containers.MessageMap[str, _sp_shared_pb2.WasmModule]
    def __init__(self, pipelines: _Optional[_Iterable[_Union[_sp_pipeline_pb2.Pipeline, _Mapping]]] = ..., wasm_modules: _Optional[_Mapping[str, _sp_shared_pb2.WasmModule]] = ...) -> None: ...

class TailCommand(_message.Message):
    __slots__ = ["request"]
    REQUEST_FIELD_NUMBER: _ClassVar[int]
    request: _sp_common_pb2.TailRequest
    def __init__(self, request: _Optional[_Union[_sp_common_pb2.TailRequest, _Mapping]] = ...) -> None: ...
