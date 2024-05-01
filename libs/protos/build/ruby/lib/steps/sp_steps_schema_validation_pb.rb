# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: steps/sp_steps_schema_validation.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("steps/sp_steps_schema_validation.proto", :syntax => :proto3) do
    add_message "protos.steps.SchemaValidationStep" do
      optional :type, :enum, 1, "protos.steps.SchemaValidationType"
      optional :condition, :enum, 2, "protos.steps.SchemaValidationCondition"
      oneof :options do
        optional :json_schema, :message, 101, "protos.steps.SchemaValidationJSONSchema"
      end
    end
    add_message "protos.steps.SchemaValidationJSONSchema" do
      optional :json_schema, :bytes, 1
      optional :draft, :enum, 2, "protos.steps.JSONSchemaDraft"
    end
    add_enum "protos.steps.SchemaValidationType" do
      value :SCHEMA_VALIDATION_TYPE_UNKNOWN, 0
      value :SCHEMA_VALIDATION_TYPE_JSONSCHEMA, 1
    end
    add_enum "protos.steps.SchemaValidationCondition" do
      value :SCHEMA_VALIDATION_CONDITION_UNKNOWN, 0
      value :SCHEMA_VALIDATION_CONDITION_MATCH, 1
      value :SCHEMA_VALIDATION_CONDITION_NOT_MATCH, 2
    end
    add_enum "protos.steps.JSONSchemaDraft" do
      value :JSONSCHEMA_DRAFT_UNKNOWN, 0
      value :JSONSCHEMA_DRAFT_04, 1
      value :JSONSCHEMA_DRAFT_06, 2
      value :JSONSCHEMA_DRAFT_07, 3
    end
  end
end

module Streamdal
  module Protos
    SchemaValidationStep = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.steps.SchemaValidationStep").msgclass
    SchemaValidationJSONSchema = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.steps.SchemaValidationJSONSchema").msgclass
    SchemaValidationType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.steps.SchemaValidationType").enummodule
    SchemaValidationCondition = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.steps.SchemaValidationCondition").enummodule
    JSONSchemaDraft = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("protos.steps.JSONSchemaDraft").enummodule
  end
end
