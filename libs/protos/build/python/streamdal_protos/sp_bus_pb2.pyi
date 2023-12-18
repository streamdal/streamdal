import sp_common_pb2 as _sp_common_pb2
import sp_external_pb2 as _sp_external_pb2
import sp_internal_pb2 as _sp_internal_pb2
import sp_kv_pb2 as _sp_kv_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class BusEvent(_message.Message):
    __slots__ = ["_metadata", "attach_pipeline_request", "create_pipeline_request", "delete_audience_request", "delete_pipeline_request", "deregister_request", "detach_pipeline_request", "kv_request", "metrics_request", "new_audience_request", "pause_pipeline_request", "register_request", "resume_pipeline_request", "source", "tail_request", "tail_response", "update_pipeline_request"]
    class MetadataEntry(_message.Message):
        __slots__ = ["key", "value"]
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    ATTACH_PIPELINE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    CREATE_PIPELINE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    DELETE_AUDIENCE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    DELETE_PIPELINE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    DEREGISTER_REQUEST_FIELD_NUMBER: _ClassVar[int]
    DETACH_PIPELINE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    KV_REQUEST_FIELD_NUMBER: _ClassVar[int]
    METRICS_REQUEST_FIELD_NUMBER: _ClassVar[int]
    NEW_AUDIENCE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    PAUSE_PIPELINE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    REGISTER_REQUEST_FIELD_NUMBER: _ClassVar[int]
    RESUME_PIPELINE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    TAIL_REQUEST_FIELD_NUMBER: _ClassVar[int]
    TAIL_RESPONSE_FIELD_NUMBER: _ClassVar[int]
    UPDATE_PIPELINE_REQUEST_FIELD_NUMBER: _ClassVar[int]
    _METADATA_FIELD_NUMBER: _ClassVar[int]
    _metadata: _containers.ScalarMap[str, str]
    attach_pipeline_request: _sp_external_pb2.AttachPipelineRequest
    create_pipeline_request: _sp_external_pb2.CreatePipelineRequest
    delete_audience_request: _sp_external_pb2.DeleteAudienceRequest
    delete_pipeline_request: _sp_external_pb2.DeletePipelineRequest
    deregister_request: _sp_internal_pb2.DeregisterRequest
    detach_pipeline_request: _sp_external_pb2.DetachPipelineRequest
    kv_request: _sp_kv_pb2.KVRequest
    metrics_request: _sp_internal_pb2.MetricsRequest
    new_audience_request: _sp_internal_pb2.NewAudienceRequest
    pause_pipeline_request: _sp_external_pb2.PausePipelineRequest
    register_request: _sp_internal_pb2.RegisterRequest
    resume_pipeline_request: _sp_external_pb2.ResumePipelineRequest
    source: str
    tail_request: _sp_common_pb2.TailRequest
    tail_response: _sp_common_pb2.TailResponse
    update_pipeline_request: _sp_external_pb2.UpdatePipelineRequest
    def __init__(self, source: _Optional[str] = ..., register_request: _Optional[_Union[_sp_internal_pb2.RegisterRequest, _Mapping]] = ..., deregister_request: _Optional[_Union[_sp_internal_pb2.DeregisterRequest, _Mapping]] = ..., create_pipeline_request: _Optional[_Union[_sp_external_pb2.CreatePipelineRequest, _Mapping]] = ..., delete_pipeline_request: _Optional[_Union[_sp_external_pb2.DeletePipelineRequest, _Mapping]] = ..., update_pipeline_request: _Optional[_Union[_sp_external_pb2.UpdatePipelineRequest, _Mapping]] = ..., attach_pipeline_request: _Optional[_Union[_sp_external_pb2.AttachPipelineRequest, _Mapping]] = ..., detach_pipeline_request: _Optional[_Union[_sp_external_pb2.DetachPipelineRequest, _Mapping]] = ..., pause_pipeline_request: _Optional[_Union[_sp_external_pb2.PausePipelineRequest, _Mapping]] = ..., resume_pipeline_request: _Optional[_Union[_sp_external_pb2.ResumePipelineRequest, _Mapping]] = ..., metrics_request: _Optional[_Union[_sp_internal_pb2.MetricsRequest, _Mapping]] = ..., kv_request: _Optional[_Union[_sp_kv_pb2.KVRequest, _Mapping]] = ..., delete_audience_request: _Optional[_Union[_sp_external_pb2.DeleteAudienceRequest, _Mapping]] = ..., new_audience_request: _Optional[_Union[_sp_internal_pb2.NewAudienceRequest, _Mapping]] = ..., tail_request: _Optional[_Union[_sp_common_pb2.TailRequest, _Mapping]] = ..., tail_response: _Optional[_Union[_sp_common_pb2.TailResponse, _Mapping]] = ..., _metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...
