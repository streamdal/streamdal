require 'rspec'
require 'sp_wsm_pb'
require 'steps/sp_steps_inferschema_pb'
require 'sp_pipeline_pb'
require 'sp_common_pb'
require 'streamdal'
require_relative 'spec_helper'
require_relative 'schema'
require_relative 'audiences'

module Streamdal
  class TestObj
    include Schema
    include Audiences

    @schemas
    @stub

    attr_accessor :stub

    def initialize
      @schemas = {}
      @stub = RSpec::Mocks::Double.new("stub", { send_schema: nil })
    end

    def _metadata
      {}
    end
  end
end

RSpec.describe "Streamdal::Schema" do
  before(:each) do
    @test_obj = Streamdal::TestObj.new

    public_aud = Streamdal::Audience.new(1, "consume", "kafka")
    @aud = public_aud.to_proto("test-svc")
    expect(@test_obj.aud_to_str(@aud)).to eq("test-svc.kafka.OPERATION_TYPE_CONSUMER.consume")
  end

  it "should set and get a schema" do
    @test_obj._set_schema(@aud, "{}")

    got_schema = @test_obj._get_schema(@aud)
    expect(got_schema).to eq("{}")
  end
  it "should handle schema" do
    wasm_resp = Streamdal::Protos::WASMResponse.new
    wasm_resp.exit_code = :WASM_EXIT_CODE_TRUE
    wasm_resp.output_step = "{}"

    @test_obj._handle_schema(@aud, Streamdal::Protos::PipelineStep.new(infer_schema: Streamdal::Protos::InferSchemaStep.new), wasm_resp)

    got_schema = @test_obj._get_schema(@aud)
    expect(got_schema).to eq("{}")
    # sleep(1)
    expect(@test_obj.stub).to have_received(:send_schema).with(Streamdal::Protos::SendSchemaRequest.new(audience: @aud, schema: Streamdal::Protos::Schema.new(json_schema: "{}")), metadata: @test_obj._metadata)
  end
end