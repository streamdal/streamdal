# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: sp_info.proto

require 'google/protobuf'

require 'sp_common_pb'
require 'sp_pipeline_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("sp_info.proto", :syntax => :proto3) do
    add_message "protos.LiveInfo" do
      repeated :audiences, :message, 1, "protos.Audience"
      optional :client, :message, 2, "protos.ClientInfo"
    end
    add_message "protos.PipelineInfo" do
      repeated :audiences, :message, 1, "protos.Audience"
      optional :pipeline, :message, 2, "protos.Pipeline"
    end
    add_message "protos.ClientInfo" do
      optional :client_type, :enum, 1, "protos.ClientType"
      optional :library_name, :string, 2
      optional :library_version, :string, 3
      optional :language, :string, 4
      optional :arch, :string, 5
      optional :os, :string, 6
      proto3_optional :_session_id, :string, 7
      proto3_optional :_service_name, :string, 8
      proto3_optional :_node_name, :string, 9
    end
    add_enum "protos.ClientType" do
      value :CLIENT_TYPE_UNSET, 0
      value :CLIENT_TYPE_SDK, 1
      value :CLIENT_TYPE_SHIM, 2
    end
  end
end

module Streamdal
  module Protos
    LiveInfo = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.LiveInfo").msgclass
    PipelineInfo = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.PipelineInfo").msgclass
    ClientInfo = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.ClientInfo").msgclass
    ClientType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.ClientType").enummodule
  end
end
