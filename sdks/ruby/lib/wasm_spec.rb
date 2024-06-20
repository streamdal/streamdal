require_relative 'spec_helper'
require 'steps/sp_steps_httprequest_pb'
require 'steps/sp_steps_detective_pb'
require 'steps/sp_steps_transform_pb'
require_relative 'streamdal'

class TestClient < Streamdal::Client

  attr_accessor :kv

  # Ignore rubocop warning
  # rubocop:disable Lint/MissingSuper
  def initialize
    @cfg = {
      step_timeout: 2
    }
    @functions = {}

    logger = Logger.new($stdout)
    logger.level = Logger::ERROR

    @log = logger
    @kv = Streamdal::KeyValue.new
    @hostfunc = Streamdal::HostFunc.new(@kv)
  end
end

RSpec.describe 'WASM' do
  let(:client) { TestClient.new }

  context '_call_wasm' do
    it 'raises an error if step is nil' do
      expect { client.send(:_call_wasm, nil, nil, nil) }.to raise_error('step is required')
    end

    it 'raises an error if data is nil' do
      step = Streamdal::Protos::HttpRequestStep.new
      expect { client.send(:_call_wasm, step, nil, nil) }.to raise_error('data is required')
    end
  end

  context 'detective.wasm' do
    before(:each) do
      wasm_bytes = load_wasm('detective.wasm')

      @step = Streamdal::Protos::PipelineStep.new
      @step.name = 'detective'
      @step._wasm_bytes = wasm_bytes.b
      @step._wasm_id = SecureRandom.uuid
      @step._wasm_function = 'f'
      @step.detective = Streamdal::Protos::DetectiveStep.new
      @step.detective.path = 'object.field'
      @step.detective.args = Google::Protobuf::RepeatedField.new(:string, ['streamdal'])
      @step.detective.negate = false
      @step.detective.type = :DETECTIVE_TYPE_STRING_CONTAINS_ANY
    end

    it 'detects email in JSON payload' do
      data = '{"object":{"field":"streamdal@gmail.com"}}'

      res = client.send(:_call_wasm, @step, data, nil)

      expect(res).not_to be_nil
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_TRUE)
      expect(res.output_payload).to eq(data)

    end

    it 'does not detect email in JSON payload' do
      data = '{"object":{"field":"mark@gmail.com"}}'

      res = client.send(:_call_wasm, @step, data, nil)
      expect(res).not_to be_nil
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_FALSE)
    end
  end

  context 'httprequest.wasm' do
    before(:each) do
      wasm_bytes = load_wasm('httprequest.wasm')

      http_req_step = Streamdal::Protos::HttpRequestStep.new
      http_req_step.request = Streamdal::Protos::HttpRequest.new
      http_req_step.request.url = 'https://www.google.com/404_me'
      http_req_step.request.method = :HTTP_REQUEST_METHOD_GET
      http_req_step.request.body = ''

      @step = Streamdal::Protos::PipelineStep.new
      @step.name = 'http request'
      @step._wasm_bytes = wasm_bytes.b
      @step._wasm_id = SecureRandom.uuid
      @step._wasm_function = 'f'
      @step.http_request = http_req_step
    end

    it 'returns false on 404' do
      res = client.send(:_call_wasm, @step, '', nil)

      expect(res).not_to be_nil
      expect(res.exit_msg).to eq('Request returned non-200 response code: 404')
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_FALSE)
    end
  end

  context 'inferschema.wasm' do
    before(:each) do
      wasm_bytes = load_wasm('inferschema.wasm')

      @step = Streamdal::Protos::PipelineStep.new
      @step.name = 'schema inference'
      @step._wasm_bytes = wasm_bytes.b
      @step._wasm_id = SecureRandom.uuid
      @step._wasm_function = 'f'
      @step.infer_schema = Streamdal::Protos::InferSchemaStep.new
    end

    it 'infers schema' do
      payload = '{"object": {"payload": "test"}}'
      res = client.send(:_call_wasm, @step, payload, nil)

      expected_schema = '{"$schema":"http://json-schema.org/draft-07/schema#","properties":{"object":{"properties":{"payload":{"type":"string"}},"required":["payload"],"type":"object"}},"required":["object"],"type":"object"}'

      expect(res).not_to be_nil
      expect(res.exit_msg).to eq('inferred fresh schema')
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_TRUE)
      expect(res.output_payload).to eq(payload)
      expect(res.output_step).to eq(expected_schema)
    end
  end

  context 'transform.wasm' do
    before(:each) do
      wasm_bytes = load_wasm('transform.wasm')

      @step = Streamdal::Protos::PipelineStep.new
      @step.name = 'transform'
      @step._wasm_bytes = wasm_bytes.b
      @step._wasm_id = SecureRandom.uuid
      @step._wasm_function = 'f'
    end

    it 'deletes a field from a payload' do
      @step.transform = Streamdal::Protos::TransformStep.new
      @step.transform.type = :TRANSFORM_TYPE_DELETE_FIELD
      @step.transform.delete_field_options = Streamdal::Protos::TransformDeleteFieldOptions.new
      @step.transform.delete_field_options.paths = Google::Protobuf::RepeatedField.new(:string, ['object.another'])

      payload = '{"object": {"payload": "old val", "another": "field"}}'
      res = client.send(:_call_wasm, @step, payload, nil)

      expect(res).not_to be_nil
      expect(res.exit_msg).to eq('Successfully transformed payload')
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_TRUE)
      expect(res.output_payload).to eq('{"object": {"payload": "old val"}}')
    end

    it 'replaces a fields value with a new one' do
      @step.transform = Streamdal::Protos::TransformStep.new
      @step.transform.type = :TRANSFORM_TYPE_REPLACE_VALUE
      @step.transform.replace_value_options = Streamdal::Protos::TransformReplaceValueOptions.new
      @step.transform.replace_value_options.path = 'object.payload'
      @step.transform.replace_value_options.value = '"new val"'

      payload = '{"object": {"payload": "old val"}}'
      res = client.send(:_call_wasm, @step, payload, nil)

      expect(res).not_to be_nil
      expect(res.exit_msg).to eq('Successfully transformed payload')
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_TRUE)
      expect(res.output_payload).to eq('{"object": {"payload": "new val"}}')
    end

    it 'truncates the value of a field' do
      @step.transform = Streamdal::Protos::TransformStep.new
      @step.transform.type = :TRANSFORM_TYPE_TRUNCATE_VALUE
      @step.transform.truncate_options = Streamdal::Protos::TransformTruncateOptions.new
      @step.transform.truncate_options.type = :TRANSFORM_TRUNCATE_TYPE_LENGTH
      @step.transform.truncate_options.path = 'object.payload'
      @step.transform.truncate_options.value = 3

      payload = '{"object": {"payload": "old val"}}'
      res = client.send(:_call_wasm, @step, payload, nil)

      expect(res).not_to be_nil
      expect(res.exit_msg).to eq('Successfully transformed payload')
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_TRUE)
      expect(res.output_payload).to eq('{"object": {"payload": "old"}}')
    end

    it 'performs dynamic transformation' do
      # TODO: add this test
    end
  end

  context 'validjson.wasm' do
    before(:each) do
      wasm_bytes = load_wasm('validjson.wasm')

      @step = Streamdal::Protos::PipelineStep.new
      @step.name = 'validate json'
      @step._wasm_bytes = wasm_bytes.b
      @step._wasm_id = SecureRandom.uuid
      @step._wasm_function = 'f'
      @step.valid_json = Streamdal::Protos::ValidJSONStep.new

    end

    it 'validates a valid JSON payload' do

      payload = '{"object": {"payload": "test"}}'
      res = client.send(:_call_wasm, @step, payload, nil)

      expect(res).not_to be_nil
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_TRUE)
      expect(res.output_payload).to eq(payload)
    end

    it 'returns false on invalid JSON payload' do
      payload = '{"object": {"payload": "test"'
      res = client.send(:_call_wasm, @step, payload, nil)

      expect(res).not_to be_nil
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_FALSE)
    end
  end

  context 'kv.wasm' do
    before(:each) do
      wasm_bytes = load_wasm('kv.wasm')

      client.kv.set('test', 'test')

      @step = Streamdal::Protos::PipelineStep.new
      @step.name = 'kv exists'
      @step._wasm_bytes = wasm_bytes.b
      @step._wasm_id = SecureRandom.uuid
      @step._wasm_function = 'f'
      @step.kv = Streamdal::Protos::KVStep.new
      @step.kv.key = 'test'
      @step.kv.mode = :KV_MODE_STATIC
      @step.kv.action = :KV_ACTION_EXISTS
    end

    it 'returns true if a key exists' do
      res = client.send(:_call_wasm, @step, '', nil)

      expect(res).not_to be_nil
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_TRUE)
    end

    it 'returns false when a key doesnt exist' do
      @step.kv.key = 'not_exists'
      res = client.send(:_call_wasm, @step, '', nil)

      expect(res).not_to be_nil
      expect(res.exit_code).to eq(:WASM_EXIT_CODE_FALSE)
    end
  end
end