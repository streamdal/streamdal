# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: sp_common.proto

require 'google/protobuf'

require 'shared/sp_shared_pb'
require 'sp_notify_pb'
require 'sp_pipeline_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("sp_common.proto", :syntax => :proto3) do
    add_message "protos.StandardResponse" do
      optional :id, :string, 1
      optional :code, :enum, 2, "protos.ResponseCode"
      optional :message, :string, 3
    end
    add_message "protos.Audience" do
      optional :service_name, :string, 1
      optional :component_name, :string, 2
      optional :operation_type, :enum, 3, "protos.OperationType"
      optional :operation_name, :string, 4
      proto3_optional :_created_by, :string, 1000
    end
    add_message "protos.Metric" do
      optional :name, :string, 1
      map :labels, :string, :string, 2
      optional :value, :double, 3
      optional :audience, :message, 4, "protos.Audience"
    end
    add_message "protos.TailRequest" do
      optional :type, :enum, 1, "protos.TailRequestType"
      optional :id, :string, 2
      optional :audience, :message, 3, "protos.Audience"
      proto3_optional :pipeline_id, :string, 4
      optional :sample_options, :message, 5, "protos.SampleOptions"
      map :_metadata, :string, :string, 1000
    end
    add_message "protos.TailResponse" do
      optional :type, :enum, 1, "protos.TailResponseType"
      optional :tail_request_id, :string, 2
      optional :audience, :message, 3, "protos.Audience"
      optional :pipeline_id, :string, 4
      optional :session_id, :string, 5
      optional :timestamp_ns, :int64, 6
      optional :original_data, :bytes, 7
      optional :new_data, :bytes, 8
      map :_metadata, :string, :string, 1000
      proto3_optional :_keepalive, :bool, 1001
    end
    add_message "protos.AudienceRate" do
      optional :bytes, :double, 1
      optional :processed, :double, 2
    end
    add_message "protos.Schema" do
      optional :json_schema, :bytes, 1
      optional :_version, :int32, 100
      map :_metadata, :string, :string, 1000
    end
    add_message "protos.SampleOptions" do
      optional :sample_rate, :uint32, 1
      optional :sample_interval_seconds, :uint32, 2
    end
    add_message "protos.Config" do
      repeated :audiences, :message, 1, "protos.Audience"
      repeated :pipelines, :message, 2, "protos.Pipeline"
      repeated :notifications, :message, 3, "protos.NotificationConfig"
      repeated :wasm_modules, :message, 4, "protos.shared.WasmModule"
      map :audience_mappings, :string, :message, 5, "protos.PipelineConfigs"
    end
    add_enum "protos.ResponseCode" do
      value :RESPONSE_CODE_UNSET, 0
      value :RESPONSE_CODE_OK, 1
      value :RESPONSE_CODE_BAD_REQUEST, 2
      value :RESPONSE_CODE_NOT_FOUND, 3
      value :RESPONSE_CODE_INTERNAL_SERVER_ERROR, 4
      value :RESPONSE_CODE_GENERIC_ERROR, 5
    end
    add_enum "protos.OperationType" do
      value :OPERATION_TYPE_UNSET, 0
      value :OPERATION_TYPE_CONSUMER, 1
      value :OPERATION_TYPE_PRODUCER, 2
    end
    add_enum "protos.TailResponseType" do
      value :TAIL_RESPONSE_TYPE_UNSET, 0
      value :TAIL_RESPONSE_TYPE_PAYLOAD, 1
      value :TAIL_RESPONSE_TYPE_ERROR, 2
    end
    add_enum "protos.TailRequestType" do
      value :TAIL_REQUEST_TYPE_UNSET, 0
      value :TAIL_REQUEST_TYPE_START, 1
      value :TAIL_REQUEST_TYPE_STOP, 2
      value :TAIL_REQUEST_TYPE_PAUSE, 3
      value :TAIL_REQUEST_TYPE_RESUME, 4
    end
  end
end

module Streamdal
  module Protos
    StandardResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.StandardResponse").msgclass
    Audience = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.Audience").msgclass
    Metric = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.Metric").msgclass
    TailRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.TailRequest").msgclass
    TailResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.TailResponse").msgclass
    AudienceRate = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.AudienceRate").msgclass
    Schema = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.Schema").msgclass
    SampleOptions = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.SampleOptions").msgclass
    Config = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.Config").msgclass
    ResponseCode = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.ResponseCode").enummodule
    OperationType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.OperationType").enummodule
    TailResponseType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.TailResponseType").enummodule
    TailRequestType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.TailRequestType").enummodule
  end
end
