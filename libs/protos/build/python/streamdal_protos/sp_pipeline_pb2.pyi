import sp_notify_pb2 as _sp_notify_pb2
from steps import sp_steps_custom_pb2 as _sp_steps_custom_pb2
from steps import sp_steps_decode_pb2 as _sp_steps_decode_pb2
from steps import sp_steps_detective_pb2 as _sp_steps_detective_pb2
from steps import sp_steps_encode_pb2 as _sp_steps_encode_pb2
from steps import sp_steps_httprequest_pb2 as _sp_steps_httprequest_pb2
from steps import sp_steps_inferschema_pb2 as _sp_steps_inferschema_pb2
from steps import sp_steps_kv_pb2 as _sp_steps_kv_pb2
from steps import sp_steps_schema_validation_pb2 as _sp_steps_schema_validation_pb2
from steps import sp_steps_transform_pb2 as _sp_steps_transform_pb2
from steps import sp_steps_valid_json_pb2 as _sp_steps_valid_json_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

ABORT_CONDITION_ABORT_ALL: AbortCondition
ABORT_CONDITION_ABORT_CURRENT: AbortCondition
ABORT_CONDITION_UNSET: AbortCondition
DESCRIPTOR: _descriptor.FileDescriptor

class Pipeline(_message.Message):
    __slots__ = ["_notification_configs", "id", "name", "steps"]
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    STEPS_FIELD_NUMBER: _ClassVar[int]
    _NOTIFICATION_CONFIGS_FIELD_NUMBER: _ClassVar[int]
    _notification_configs: _containers.RepeatedCompositeFieldContainer[_sp_notify_pb2.NotificationConfig]
    id: str
    name: str
    steps: _containers.RepeatedCompositeFieldContainer[PipelineStep]
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., steps: _Optional[_Iterable[_Union[PipelineStep, _Mapping]]] = ..., _notification_configs: _Optional[_Iterable[_Union[_sp_notify_pb2.NotificationConfig, _Mapping]]] = ...) -> None: ...

class PipelineStep(_message.Message):
    __slots__ = ["_wasm_bytes", "_wasm_function", "_wasm_id", "custom", "decode", "detective", "encode", "http_request", "infer_schema", "kv", "name", "on_error", "on_failure", "on_success", "schema_validation", "transform", "valid_json"]
    CUSTOM_FIELD_NUMBER: _ClassVar[int]
    DECODE_FIELD_NUMBER: _ClassVar[int]
    DETECTIVE_FIELD_NUMBER: _ClassVar[int]
    ENCODE_FIELD_NUMBER: _ClassVar[int]
    HTTP_REQUEST_FIELD_NUMBER: _ClassVar[int]
    INFER_SCHEMA_FIELD_NUMBER: _ClassVar[int]
    KV_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    ON_ERROR_FIELD_NUMBER: _ClassVar[int]
    ON_FAILURE_FIELD_NUMBER: _ClassVar[int]
    ON_SUCCESS_FIELD_NUMBER: _ClassVar[int]
    SCHEMA_VALIDATION_FIELD_NUMBER: _ClassVar[int]
    TRANSFORM_FIELD_NUMBER: _ClassVar[int]
    VALID_JSON_FIELD_NUMBER: _ClassVar[int]
    _WASM_BYTES_FIELD_NUMBER: _ClassVar[int]
    _WASM_FUNCTION_FIELD_NUMBER: _ClassVar[int]
    _WASM_ID_FIELD_NUMBER: _ClassVar[int]
    _wasm_bytes: bytes
    _wasm_function: str
    _wasm_id: str
    custom: _sp_steps_custom_pb2.CustomStep
    decode: _sp_steps_decode_pb2.DecodeStep
    detective: _sp_steps_detective_pb2.DetectiveStep
    encode: _sp_steps_encode_pb2.EncodeStep
    http_request: _sp_steps_httprequest_pb2.HttpRequestStep
    infer_schema: _sp_steps_inferschema_pb2.InferSchemaStep
    kv: _sp_steps_kv_pb2.KVStep
    name: str
    on_error: PipelineStepConditions
    on_failure: PipelineStepConditions
    on_success: PipelineStepConditions
    schema_validation: _sp_steps_schema_validation_pb2.SchemaValidationStep
    transform: _sp_steps_transform_pb2.TransformStep
    valid_json: _sp_steps_valid_json_pb2.ValidJSONStep
    def __init__(self, name: _Optional[str] = ..., on_success: _Optional[_Union[PipelineStepConditions, _Mapping]] = ..., on_failure: _Optional[_Union[PipelineStepConditions, _Mapping]] = ..., on_error: _Optional[_Union[PipelineStepConditions, _Mapping]] = ..., detective: _Optional[_Union[_sp_steps_detective_pb2.DetectiveStep, _Mapping]] = ..., transform: _Optional[_Union[_sp_steps_transform_pb2.TransformStep, _Mapping]] = ..., encode: _Optional[_Union[_sp_steps_encode_pb2.EncodeStep, _Mapping]] = ..., decode: _Optional[_Union[_sp_steps_decode_pb2.DecodeStep, _Mapping]] = ..., custom: _Optional[_Union[_sp_steps_custom_pb2.CustomStep, _Mapping]] = ..., http_request: _Optional[_Union[_sp_steps_httprequest_pb2.HttpRequestStep, _Mapping]] = ..., kv: _Optional[_Union[_sp_steps_kv_pb2.KVStep, _Mapping]] = ..., infer_schema: _Optional[_Union[_sp_steps_inferschema_pb2.InferSchemaStep, _Mapping]] = ..., valid_json: _Optional[_Union[_sp_steps_valid_json_pb2.ValidJSONStep, _Mapping]] = ..., schema_validation: _Optional[_Union[_sp_steps_schema_validation_pb2.SchemaValidationStep, _Mapping]] = ..., _wasm_id: _Optional[str] = ..., _wasm_bytes: _Optional[bytes] = ..., _wasm_function: _Optional[str] = ...) -> None: ...

class PipelineStepConditions(_message.Message):
    __slots__ = ["abort", "metadata", "notify"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    ABORT_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    NOTIFY_FIELD_NUMBER: _ClassVar[int]
    abort: AbortCondition
    metadata: _containers.ScalarMap[str, str]
    notify: bool
    def __init__(self, abort: _Optional[_Union[AbortCondition, str]] = ..., notify: bool = ..., metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class AbortCondition(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
