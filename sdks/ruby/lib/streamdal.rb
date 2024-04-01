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
require_relative 'metrics'

DEFAULT_GRPC_RECONNECT_INTERVAL = 5 # 5 seconds
DEFAULT_PIPELINE_TIMEOUT = 1 / 10 # 100 milliseconds
DEFAULT_STEP_TIMEOUT = 1 / 100 # 10 milliseconds
DEFAULT_GRPC_TIMEOUT = 5 # 5 seconds
DEFAULT_HEARTBEAT_INTERVAL = 1 # 1 second
MAX_PAYLOAD_SIZE = 1024 * 1024 # 1 megabyte

module Streamdal

  OPERATION_TYPE_PRODUCER = "producer"
  OPERATION_TYPE_CONSUMER = "consumer"

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
      @metrics = Streamdal::Metrics.new

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

    def process(req)
      if req.nil? || req.length == 0
        raise "invalid process request is required"
      end

      resp = Streamda::Protos::SdkResponse.new
      resp.data = req[:data]
      resp.status = Streamdal::Protos::ExecStatus::EXEC_STATUS_TRUE
      resp.pipeline_status = []

      aud = Streamdal::Protos::Audience.new
      aud.operation_type = req[:operation_type]
      aud.operation_name = req[:operation_name]
      aud.component_name = req[:component_name]
      aud.service_name = @cfg[:service_name]
      _add_audience(aud)

      labels = {
        "service": @cfg[:service_name],
        "operation_type": req[:operation_type],
        "operation": req[:operation_name],
        "component": req[:component_name],
        "pipeline_name": "",
        "pipeline_id": "",
      }

      # TODO: metrics
      bytes_counter = Streamdal::Metrics::COUNTER_CONSUME_BYTES
      errors_counter = Streamdal::Metrics::COUNTER_CONSUME_ERRORS
      total_counter = Streamdal::Metrics::COUNTER_CONSUME_PROCESSED
      rate_bytes = Streamdal::Metrics::COUNTER_CONSUME_BYTES_RATE
      rate_processed = Streamdal::Metrics::COUNTER_CONSUME_PROCESSED_RATE

      if req[:operation_type] == OPERATION_TYPE_PRODUCER
        bytes_counter = Streamdal::Metrics::COUNTER_PRODUCE_BYTES
        errors_counter = Streamdal::Metrics::COUNTER_PRODUCE_ERRORS
        total_counter = Streamdal::Metrics::COUNTER_PRODUCE_PROCESSED
        rate_bytes = Streamdal::Metrics::COUNTER_PRODUCE_BYTES_RATE
        rate_processed = Streamdal::Metrics::COUNTER_PRODUCE_PROCESSED_RATE
      end

      payload_size = req[:data].length

      if payload_size > MAX_PAYLOAD_SIZE
        # TODO: add metrics
        resp.status = Streamdal::Protos::ExecStatus::EXEC_STATUS_ERROR
        resp.error = "payload size exceeds maximum allowed size"
        resp
      end

      # Needed for send_tail()
      original_data = req[:data]

      pipelines = _get_pipelines(aud)
      if pipelines.length == 0
        _send_tail(aud, "", original_data, original_data)
        resp
      end

      @metrics.incr(rate_bytes, 1, {}, aud)
      @metrics.incr(rate_processed, 1, {}, aud)

      # Used for passing data between steps
      isr = nil

      pipelines.each do |pipeline|
        pipeline_status = Streamdal::Protos::PipelineStatus.new
        pipeline_status.id = pipeline.id
        pipeline_status.name = pipeline.name
        pipeline_status.step_status = []

        @logger.debug "Running pipeline: '#{pipeline.name}'"

        labels[:pipeline_id] = pipeline.id
        labels[:pipeline_name] = pipeline.name

        @metrics.incr(total_counter, 1, {}, aud)
        @metrics.incr(bytes_counter, 1, {}, aud)

        pipeline.steps.each do |step|
          step_status = Streamdal::Protos::StepStatus.new
          step_status.name = step.name
          step_status.status = Streamdal::Protos::ExecStatus::EXEC_STATUS_TRUE

          begin
            wasm_resp = call_wasm(step, req[:data], isr)
          rescue => e
            @logger.error "Error running step '#{step.name}': #{e}"
            step_status.status = Streamdal::Protos::ExecStatus::EXEC_STATUS_ERROR
            step_status.error = e.to_s
            pipeline_status.step_status.push(step_status)
            break
          end

          if @cfg[:dry_run]
            @logger.debug "Running step '#{step.name}' in dry-run mode"
          end

          if wasm_resp.output_payload.length > 0
            resp.data = wasm_resp.output_payload
          end

          _handle_schema(aud, step, wasm_resp)

          isr = wasm_resp.inter_step_result

          case wasm_resp.exit_code
          when Streamdal::Protos::WASMResponse::WASMExitCode::WASM_EXIT_CODE_FALSE
            cond = step.on_false
            cond_type = Streamdal::Protos::NotifyRequestConditionType::CONDITION_TYPE_ON_FALSE
            exec_status = Streamdal::Protos::ExecStatus::EXEC_STATUS_FALSE
          when Streamdal::Protos::WASMResponse::WASMExitCode::WASM_EXIT_CODE_ERROR
            cond = step.on_error
            cond_type = Streamdal::Protos::NotifyRequestConditionType::CONDITION_TYPE_ON_ERROR
            exec_status = Streamdal::Protos::ExecStatus::EXEC_STATUS_ERROR
            isr = nil

            @metrics.incr(errors_counter, 1, labels, aud)
          else
            cond = step.on_true
            exec_status = Streamdal::Protos::ExecStatus::EXEC_STATUS_TRUE
            cond_type = Streamdal::Protos::NotifyRequestConditionType::CONDITION_TYPE_ON_TRUE
          end

          _notify_condition(pipeline, step, aud, cond, resp.data, cond_type)

          if @cfg[:dry_run]
            @logger.debug("Step '#{step.name}' completed with status: #{exec_status}, continuing to next step")
            next
          end

          # Whether we are aborting early, aborting current, or continuing, we need to set the step status
          step_status.status = exec_status
          step_status.status_message = "Step returned: #{wasm_resp.exit_msg}"

          # Pull metadata from step into SDKResponse
          unless cond.nil?
            resp.metadata = cond.metadata

            case cond.abort
            when Streamdal::Protos::AbortCondition::ABORT_CONDITION_ABORT_CURRENT
              step_status.status = exec_status
              step_status.status_message = "Step returned: #{wasm_resp.exit_msg}"
              pipeline_status.step_status.push(step_status)
              resp.pipeline_status.push(pipeline_status)
              # Continue outer pipeline loop, there might be additional pipelines
              break
            when Streamdal::Protos::AbortCondition::ABORT_CONDITION_ABORT_ALL
              # Set step status and push to pipeline status
              step_status.status = exec_status
              step_status.status_message = "Step returned: #{wasm_resp.exit_msg}"
              pipeline_status.step_status.push(step_status)
              resp.pipeline_status.push(pipeline_status)

              # Since we're returning early here, also need to set the response status
              resp.status = exec_status
              resp.status_message = "Step returned: #{wasm_resp.exit_msg}"

              _send_tail(aud, pipeline.id, original_data, resp.data)
              return resp
            else
              # Do nothing
            end
          end

          # Append step status to the current pipeline status' array
          pipeline_status.step_status.push(step_status)
        end

        # Append pipeline status to the response
        resp.pipeline_status.push(pipeline_status)
      end

      _send_tail(aud, "", original_data, resp.data)

      if @cfg[:dry_run]
        @logger.debug "Dry-run, setting response data to original data"
        resp.data = original_data
      end

      resp
    end

    def _notify_condition(pipeline, step, aud, cond, data, cond_type)
      if cond.nil?
        nil
      end

      if cond.notify.nil?
        nil
      end

      @logger.debug "Notifying"

      if @cfg[:dry_run]
        nil
      end

      @metrics.incr(Streamdal::Metrics::COUNTER_NOTIFY, 1, {
        "service": @cfg[:service_name],
        "component_name": aud.component_name,
        "pipeline_name": pipeline.name,
        "pipeline_id": pipeline.id,
        "operation_name": aud.operation_name,
      }, aud)

      req = Streamdal::Protos::NotifyRequest.new
      req.audience = aud
      req.pipeline_id = pipeline.id
      req.step = step
      req.payload = data
      req.condition_type = cond_type
      req.occurred_at_unix_ts_utc = Time.now.to_i

      Thread.new do
        @stub.notify(req, metadata: _metadata)
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