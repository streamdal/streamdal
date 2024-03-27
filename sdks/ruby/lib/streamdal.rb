# frozen_string_literal: true
require "sp_internal_services_pb"
require "sp_pipeline_pb"
require "sp_wsm_pb"
require "securerandom"
require "wasmtime"
require "google/protobuf"
require "base64"
require 'logger'

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
    def initialize(cfg = {})
      @cfg = cfg
      @functions = {}
      @session_id = SecureRandom.uuid
      @pipelines = {}
      @audiences = {}
      @schemas = {}
      @logger = cfg[:logger].nil? ? Logger.new($stdout) : cfg[:logger]

      # TODO: kv
      # TODO: metrics
      # TODO: host funcs

      # # Connect to Streamdal External gRPC API
      @stub = Streamdal::Protos::Internal::Stub.new('localhost:8082', :this_channel_is_insecure)

      Thread.new do
        _register
      end
    end

    def validate_cfg(cfg)
      # Validate configuration
      if cfg[:service_name] == ""
        raise "service_name is required"
      end

      if cfg[:streamdal_url] == ""
        raise "streamdal_url is required"
      end

      if cfg[:streamdal_token] == ""
        raise "streamdal_token is required"
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

    def _metadata
      puts @cfg.inspect
      { "auth-token" => @cfg[:streamdal_token].to_s }
    end

    def _register
      @logger.info("REGISTER ENTERED")
      req = _gen_register_request

      puts @stub.inspect

      # Register with Streamdal External gRPC API
      resps = @stub.register(req, metadata: _metadata)
      resps.each do |r|
        puts r.inspect.gsub(",", "\n")
      end

      @logger.info("REGISTER EXITED")
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

      result_ptr = f.call(start_ptr, data.length)

      ptr_true = result_ptr >> 32
      len_true = result_ptr & 0xFFFFFFFF

      res = memory.read(ptr_true, len_true)

      # Dealloc result memory since we already read it
      dealloc.call(ptr_true, res.length)

      res
    end
  end
end