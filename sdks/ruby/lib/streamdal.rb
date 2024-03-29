# frozen_string_literal: true
require "sp_internal_services_pb"
require "sp_pipeline_pb"
require "sp_wsm_pb"
require "securerandom"
require "wasmtime"
require "google/protobuf"
require "base64"
require 'logger'
require_relative 'audiences'
require_relative 'validation'

DEFAULT_GRPC_RECONNECT_INTERVAL = 5 # 5 seconds
DEFAULT_PIPELINE_TIMEOUT = 1 / 10 # 100 milliseconds
DEFAULT_STEP_TIMEOUT = 1 / 100 # 10 milliseconds
DEFAULT_GRPC_TIMEOUT = 5 # 5 seconds
DEFAULT_HEARTBEAT_INTERVAL = 1 # 1 second
MAX_PAYLOAD_SIZE = 1024 * 1024 # 1 megabyte

module Streamdal
  # Data class to hold instantiated wasm functions
  class WasmFunction

    attr_accessor :instance, :store

    def initialize
      @instance = nil
      @store = nil
    end

  end

  # Data class to store/pass audiences
  class Audience
    @operation_type
    @operation_name
    @component_name
  end

  class Client
    include Audiences
    include Validation

    def initialize(cfg = {})
      @cfg = cfg
      @functions = {}
      @session_id = SecureRandom.uuid
      @pipelines = {}
      @audiences = {}
      @schemas = {}
      @logger = cfg[:logger].nil? ? Logger.new($stdout) : cfg[:logger]
      @tail = {}
      @paused_tails = {}

      # TODO: kv
      # TODO: metrics
      # TODO: host funcs
      # TODO: tails

      # # Connect to Streamdal External gRPC API
      puts @cfg
      @stub = Streamdal::Protos::Internal::Stub.new(@cfg[:streamdal_url], :this_channel_is_insecure)

      _pull_initial_pipelines

      Thread.new do
        _register
      end
    end

    def tmp
      det = Streamdal::Protos::DetectiveStep.new
      det.path = ""
      det.args = Google::Protobuf::RepeatedField.new(:string, [])
      det.type = Streamdal::Protos::DetectiveType::DETECTIVE_TYPE_PII_EMAIL
      det.negate = false

      step = Streamdal::Protos::PipelineStep.new
      step.name = "detective"
      step.detective = det
      step._wasm_function = "f"
      step._wasm_id = SecureRandom.uuid
      step._wasm_bytes = File.read("detective.wasm", mode: "rb")

      req = Streamdal::Protos::WASMRequest.new
      req.step = step

      req.input_payload = "{\"email\": \"mark@streamdal.com\", \"some\": \"val\"}"

      res = _exec_wasm(req)

      # unserialize into WASMResponse protobuf message
      wasm_resp = Streamdal::Protos::WASMResponse.decode(res)

      puts wasm_resp.inspect.gsub(",", "\n")
    end

    def _gen_register_request
      arch, os = RUBY_PLATFORM.split(/-/)

      # Register with Streamdal External gRPC API
      req = Streamdal::Protos::RegisterRequest.new
      req.service_name = "demo-ruby"
      req.session_id = @session_id
      req.dry_run = false
      req.client_info = Streamdal::Protos::ClientInfo.new
      req.client_info.client_type = Streamdal::Protos::ClientType::CLIENT_TYPE_SDK
      req.client_info.library_name = "ruby-sdk"
      req.client_info.library_version = "0.0.1" # TODO: inject via github action
      req.client_info.language = "ruby"
      req.client_info.arch = arch
      req.client_info.os = os
      req
    end

    # Returns metadata for gRPC requests to the internal gRPC API
    def _metadata
      { "auth-token" => @cfg[:streamdal_token].to_s }
    end

    def _register
      req = _gen_register_request

      # Register with Streamdal External gRPC API
      resps = @stub.register(req, metadata: _metadata)
      resps.each do |r|
        _handle_command(r)
      end

      @logger.info("REGISTER EXITED")
    end

    def _handle_command(cmd)
      case cmd.command.to_s
      when "kv"
        _handle_kv(cmd)
      when "tail"
        _handle_tail_request(cmd)
      when "set_pipelines"
        _set_pipelines(cmd)
      when "keep_alive"
        # Do nothing
      else
        @logger.error "unknown command type #{cmd.command}"
      end
    end

    def _handle_kv(cmd)
      begin
        validate_kv_command(cmd)
      rescue => e
        @logger.error "KV command validation failed: #{e}"
        nil
      end

      # TODO: implement
    end

    def _set_pipelines(cmd)
      if cmd.nil?
        raise "cmd is required"
      end

      cmd.set_pipelines.pipelines.each do |p|
        p.steps.each_with_index { |idx, step|
          if step._wasm_bytes == ""
            if cmd.set_pipelines.wasm_modules.key?(step._wasm_id)
              step._wasm_bytes = cmd.set_pipelines.wasm_modules[step._wasm_id]
              cmd.set_pipelines.steps[idx] = step
            else
              @logger.error "WASM module not found for step: #{step._wasm_id}"
            end
          end
        }
      end
    end

    def _pull_initial_pipelines
      req = Streamdal::Protos::GetSetPipelinesCommandsByServiceRequest.new
      req.service_name = @cfg[:service_name]

      resp = @stub.get_set_pipelines_commands_by_service(req, metadata: _metadata)

      resp.set_pipeline_commands.each do |cmd|
        # TODO: comment as to why this is
        cmd.set_pipelines.wasm_modules = resp.wasm_modules
        _set_pipelines(cmd)
      end
    end

    def process(data)
      puts "Processing data: #{data}"
    end

    def call_wasm(step, data, isr)
      if step.nil?
        raise "step is required"
      end

      if data.nil?
        raise "data is required"
      end

      if isr.nil?
        isr = Streamdal::Protos::InterStepResult.new
      end
    end

    def _get_function(step)
      # We cache functions so we can eliminate the wasm bytes from steps to save on memory
      # And also to avoid re-initializing the same function multiple times
      if @functions.key?(step._wasm_id)
        @functions[step._wasm_id]
      end

      engine = Wasmtime::Engine.new
      mod = Wasmtime::Module.new(engine, step._wasm_bytes)
      linker = Wasmtime::Linker.new(engine, wasi: true)

      wasi_ctx = Wasmtime::WasiCtxBuilder.new
                                         .inherit_stdout
                                         .inherit_stderr
                                         .set_argv(ARGV)
                                         .set_env(ENV)
                                         .build

      store = Wasmtime::Store.new(engine, wasi_ctx: wasi_ctx)
      instance = linker.instantiate(store, mod)

      # Store in cache
      func = WasmFunction.new
      func.instance = instance
      func.store = store
      @functions[step._wasm_id] = func

      func
    end

    def _exec_wasm(req)
      wasm_func = _get_function(req.step)

      # Empty out _wasm_bytes, we don't need it anymore
      # TODO: does this actually update the original object?
      req.step._wasm_bytes = ""

      data = req.to_proto

      memory = wasm_func.instance.export("memory").to_memory
      alloc = wasm_func.instance.export("alloc").to_func
      dealloc = wasm_func.instance.export("dealloc").to_func
      f = wasm_func.instance.export("f").to_func

      start_ptr = alloc.call(data.length)

      memory.write(start_ptr, data)

      # Result is a 64bit int where the first 32 bits are the pointer to the result
      # and the last 32 bits are the length of the result. This is due to the fact
      # that we can only return an integer from a wasm function.
      result_ptr = f.call(start_ptr, data.length)
      ptr_true = result_ptr >> 32
      len_true = result_ptr & 0xFFFFFFFF

      res = memory.read(ptr_true, len_true)

      # Dealloc result memory since we already read it
      dealloc.call(ptr_true, res.length)

      res
    end

    def _get_pipelines(aud)
      aud_str = aud_to_str(aud)
      if @pipelines.key?(aud_str)
        @pipelines[aud_str]
      end

      []
    end
    
    def _heartbeat
      # TODO: figure out how to exit cleanly
      while true
        audiences = []
        @audiences.each do |aud|
          audiences.push(aud)
        end

        req = Streamdal::Protos::HeartbeatRequest.new
        req.session_id = @session_id
        req.audiences = audiences
        req.client_info = _gen_client_info
        req.service_name = @cfg[:service_name]

        @stub.heartbeat(req, metadata: _metadata)
        sleep(DEFAULT_HEARTBEAT_INTERVAL)
      end
    end

    ######################################################################################
    # Tail methods
    ######################################################################################
    def _handle_tail_request(cmd)
      validate_tail_request(cmd)

      if cmd.tail.request.type == Streamdal::Protos::TailRequest::TailRequestType::TAIL_REQUEST_TYPE_START
        _start_tail(cmd)
      elsif cmd.tail.request.type == Streamdal::Protos::TailRequest::TailRequestType::TAIL_REQUEST_TYPE_STOP
        _stop_tail(cmd)
      elsif cmd.tail.request.type == Streamdal::Protos::TailRequest::TailRequestType::TAIL_REQUEST_TYPE_PAUSE
        _pause_tail(cmd)
      elsif cmd.tail.request.type == Streamdal::Protos::TailRequest::TailRequestType::TAIL_REQUEST_TYPE_RESUME
        _resume_tail(cmd)
      else
        raise "unknown tail request type"
      end
    end

    def _get_active_tails_for_audience(aud)
      aud_str = aud_to_str(aud)
      if @tail.key?(aud_str)
        @tail[aud_str]
      end

      []
    end

    def _send_tail(aud, pipeline_id, original_data, new_data)
      tails = _get_active_tails_for_audience(aud)
      if tails.length == 0
        nil
      end

      tails.each do |tail|
        req = Streamdal::Protos::TailResponse.new
        req.type = Streamdal::Protos::TailResponseType::TAIL_RESPONSE_TYPE_PAYLOAD
        req.audience = aud
        req.pipeline_id = pipeline_id
        req.session_id = @session_id
        req.timestamp_ns = Time.now.to_i
        req.original_data = original_data
        req.new_data = new_data
        req._metadata = _metadata

        @stub.send_tail(req, metadata: _metadata)
      end
    end

    def _start_tail(cmd)
      #
    end

    def _set_active_tail(tail)
      #
    end

    def _set_paused_tail(tail)
      #
    end

    def _stop_tail(tail)
      #
    end

    def _stop_all_tails
      #
    end

    def _pause_tail(cmd)
      #
    end

    def _resume_tail(cmd)
      #
    end

    def _remove_active_tail(aud, tail_id)
      #
    end

    def _remove_paused_tail(aud, tail_id)
      #
    end
  end
end