# frozen_string_literal: true
require 'base64'
require 'httparty'
require 'logger'
require 'securerandom'
require 'wasmtime'
require 'sp_sdk_pb'
require 'sp_common_pb'
require 'sp_info_pb'
require 'sp_internal_pb'
require 'sp_internal_services_pb'
require 'sp_pipeline_pb'
require 'sp_wsm_pb'
require 'steps/sp_steps_httprequest_pb'
require 'steps/sp_steps_kv_pb'
require 'timeout'
require 'google/protobuf'
require_relative 'audiences'
require_relative 'hostfunc'
require_relative 'kv'
require_relative 'metrics'
require_relative 'schema'
require_relative 'tail'
require_relative 'validation'

DEFAULT_GRPC_RECONNECT_INTERVAL = 5 # 5 seconds
DEFAULT_PIPELINE_TIMEOUT = 1 / 10 # 100 milliseconds
DEFAULT_STEP_TIMEOUT = 1 / 100 # 10 milliseconds
DEFAULT_GRPC_TIMEOUT = 5 # 5 seconds
DEFAULT_HEARTBEAT_INTERVAL = 1 # 1 second
MAX_PAYLOAD_SIZE = 1024 * 1024 # 1 megabyte

module Streamdal
  OPERATION_TYPE_PRODUCER = 2
  OPERATION_TYPE_CONSUMER = 1
  CLIENT_TYPE_SDK = 1
  CLIENT_TYPE_SHIM = 2

  # Data class to hold instantiated wasm functions
  class WasmFunction
    ##
    # Instance of an initialized wasm module and associated memory store

    attr_accessor :instance, :store

    def initialize
      @instance = nil
      @store = nil
    end

  end

  ##
  # Data class to store/pass audiences

  Audience = Struct.new(:operation_type, :operation_name, :component_name) do
    def to_proto(service_name)
      Streamdal::Protos::Audience.new(
        operation_type: Streamdal::Protos::OperationType.lookup(operation_type.to_i),
        operation_name: operation_name,
        component_name: component_name,
        service_name: service_name,
      )
    end
  end

  class Client

    ##
    # Streamdal SDK Client
    #
    # There is only one public method: process(data, audience)
    include Audiences
    include Validation
    include Schemas

    # Aliases to keep lines short
    CounterEntry = Streamdal::Metrics::CounterEntry
    Metrics = Streamdal::Metrics

    def initialize(cfg)
      _validate_cfg(cfg)

      @cfg = cfg
      @log = cfg[:log]
      @functions = {}
      @session_id = SecureRandom.uuid
      @pipelines = {}
      @audiences = {}
      @schemas = {}
      @tails = {}
      @paused_tails = {}
      @metrics = Metrics.new(cfg)
      @workers = []
      @exit = false
      @kv = Streamdal::KeyValue.new
      @hostfunc = Streamdal::HostFunc.new(@kv)

      # # Connect to Streamdal External gRPC API
      @stub = Streamdal::Protos::Internal::Stub.new(@cfg[:streamdal_url], :this_channel_is_insecure)

      _pull_initial_pipelines

      @workers << Thread.new { _heartbeat }
      @workers << Thread.new { _register }
    end

    def shutdown
      # Set exit flag so workers exit
      @exit = true

      # Let loops exit
      sleep(1)

      # Exit any remaining threads
      @workers.each do |w|
        w.exit if w.running?
      end
    end

    def process(data, audience)
      raise 'data is required' if data.empty?

      raise 'audience is required' if audience.nil?

      resp = Streamdal::Protos::SDKResponse.new
      resp.status = :EXEC_STATUS_TRUE
      resp.pipeline_status = Google::Protobuf::RepeatedField.new(:message, Streamdal::Protos::PipelineStatus, [])
      resp.data = data

      aud = audience.to_proto(@cfg[:service_name])

      labels = {
        "service": @cfg[:service_name],
        "operation_type": aud.operation_type,
        "operation": aud.operation_name,
        "component": aud.component_name,
        "pipeline_name": '',
        "pipeline_id": '',
      }

      # TODO: metrics
      bytes_processed = Metrics::COUNTER_CONSUME_BYTES
      errors_counter = Metrics::COUNTER_CONSUME_ERRORS
      total_counter = Metrics::COUNTER_CONSUME_PROCESSED
      rate_processed = Metrics::COUNTER_CONSUME_PROCESSED_RATE

      if aud.operation_type == OPERATION_TYPE_PRODUCER
        bytes_processed = Metrics::COUNTER_PRODUCE_BYTES
        errors_counter = Metrics::COUNTER_PRODUCE_ERRORS
        total_counter = Metrics::COUNTER_PRODUCE_PROCESSED
        rate_processed = Metrics::COUNTER_PRODUCE_PROCESSED_RATE
      end

      payload_size = data.length

      if payload_size > MAX_PAYLOAD_SIZE
        # TODO: add metrics
        resp.status = :EXEC_STATUS_ERROR
        resp.error = 'payload size exceeds maximum allowed size'
        resp
      end

      # Needed for send_tail()
      original_data = data

      pipelines = _get_pipelines(aud)
      if pipelines.empty?
        _send_tail(aud, '', original_data, original_data)
        return resp
      end

      @metrics.incr(CounterEntry.new(bytes_processed, aud, labels, data.length))
      @metrics.incr(CounterEntry.new(rate_processed, aud, labels, 1))

      # Used for passing data between steps
      isr = nil

      Timeout::timeout(@cfg[:pipeline_timeout]) do
        pipelines.each do |pipeline|
          pipeline_status = Streamdal::Protos::PipelineStatus.new
          pipeline_status.id = pipeline.id
          pipeline_status.name = pipeline.name
          pipeline_status.step_status = Google::Protobuf::RepeatedField.new(:message, Streamdal::Protos::StepStatus, [])

          @log.debug "Running pipeline: '#{pipeline.name}'"

          labels[:pipeline_id] = pipeline.id
          labels[:pipeline_name] = pipeline.name

          @metrics.incr(CounterEntry.new(total_counter, aud, labels, 1))
          @metrics.incr(CounterEntry.new(bytes_processed, aud, labels, data.length))

          pipeline.steps.each do |step|
            step_status = Streamdal::Protos::StepStatus.new
            step_status.name = step.name
            step_status.status = :EXEC_STATUS_TRUE

            begin
              wasm_resp = _call_wasm(step, data, isr)
            rescue => e
              @log.error "Error running step '#{step.name}': #{e}"
              step_status.status = :EXEC_STATUS_ERROR
              step_status.error = e.to_s
              pipeline_status.step_status.push(step_status)
              break
            end

            @log.debug "Running step '#{step.name}' in dry-run mode" if @cfg[:dry_run]

            resp.data = wasm_resp.output_payload if wasm_resp.output_payload.length.positive?

            _handle_schema(aud, step, wasm_resp)

            isr = wasm_resp.inter_step_result

            case wasm_resp.exit_code
            when :WASM_EXIT_CODE_FALSE
              cond = step.on_false
              cond_type = :CONDITION_TYPE_ON_FALSE
              exec_status = :EXEC_STATUS_FALSE
            when :WASM_EXIT_CODE_ERROR
              cond = step.on_error
              cond_type = :CONDITION_TYPE_ON_ERROR
              exec_status = :EXEC_STATUS_ERROR
              isr = nil

              # errors_counter, 1, labels, aud
              @metrics.incr(CounterEntry.new(errors_counter, aud, labels, 1))
            else
              cond = step.on_true
              exec_status = :EXEC_STATUS_TRUE
              cond_type = :CONDITION_TYPE_ON_TRUE
            end

            _notify_condition(pipeline, step, aud, cond, resp.data, cond_type)

            if @cfg[:dry_run]
              @log.debug("Step '#{step.name}' completed with status: #{exec_status}, continuing to next step")
              next
            end

            # Whether we are aborting early, aborting current, or continuing, we need to set the step status
            step_status.status = exec_status
            step_status.status_message = "Step returned: #{wasm_resp.exit_msg}"

            # Pull metadata from step into SDKResponse
            unless cond.nil?
              resp.metadata = cond.metadata

              case cond.abort
              when :ABORT_CONDITION_ABORT_CURRENT
                step_status.status = exec_status
                step_status.status_message = "Step returned: #{wasm_resp.exit_msg}"
                pipeline_status.step_status.push(step_status)
                resp.pipeline_status.push(pipeline_status)
                # Continue outer pipeline loop, there might be additional pipelines
                break
              when :ABORT_CONDITION_ABORT_ALL
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
        end # pipelines.each
      end # timeout

      _send_tail(aud, '', original_data, resp.data)

      if @cfg[:dry_run]
        @log.debug 'Dry-run, setting response data to original data'
        resp.data = original_data
      end

      resp
    end

    private

    def _validate_cfg(cfg)
      raise 'streamdal_url is required' if cfg[:streamdal_url].nil? || cfg[:streamdal_url].empty?

      raise 'streamdal_token is required' if cfg[:streamdal_token].nil? || cfg[:streamdal_token].empty?

      raise 'service_name is required' if cfg[:service_name].nil? || cfg[:streamdal_token].empty?

      if cfg[:log].nil? || cfg[:streamdal_token].empty?
        logger = Logger.new($stdout)
        logger.level = Logger::ERROR
        cfg[:log] = logger
      end

      cfg[:pipeline_timeout] = DEFAULT_PIPELINE_TIMEOUT if cfg[:pipeline_timeout].nil?

      cfg[:step_timeout] = DEFAULT_STEP_TIMEOUT if cfg[:step_timeout].nil?
    end

    def _handle_command(cmd)
      case cmd.command.to_s
      when 'kv'
        _handle_kv(cmd)
      when 'tail'
        _handle_tail_request(cmd)
      when 'set_pipelines'
        _set_pipelines(cmd)
      when 'keep_alive'
        # Do nothing
      else
        @log.error "unknown command type #{cmd.command}"
      end
    end

    def _handle_kv(cmd)
      begin
        validate_kv_command(cmd)
      rescue => e
        @log.error "KV command validation failed: #{e}"
        return nil
      end

      cmd.kv.instructions.each do |inst|
        validate_kv_instruction(inst)

        case inst.action
        when :KV_ACTION_CREATE
          @kv.set(inst.key, inst.value)
        when :KV_ACTION_UPDATE
          @kv.set(inst.key, inst.value)
        when :KV_ACTION_DELETE
          @kv.delete(inst.key)
        when :KV_ACTION_DELETE_ALL
          @kv.purge
        else
          @log.error "Unknown KV action: '#{inst.action}'"
        end
      end
    end

    def _set_pipelines(cmd)
      raise 'cmd is required' if cmd.nil?

      cmd.set_pipelines.pipelines.each_with_index { |p, pIdx|
        p.steps.each_with_index { |step, idx|
          if step._wasm_bytes == ''
            if cmd.set_pipelines.wasm_modules.has_key?(step._wasm_id)
              step._wasm_bytes = cmd.set_pipelines.wasm_modules[step._wasm_id].bytes
              cmd.set_pipelines.pipelines[pIdx].steps[idx] = step
            else
              @log.error "WASM module not found for step: #{step._wasm_id}"
            end
          end
        }

        aud_str = aud_to_str(cmd.audience)
        @pipelines.key?(aud_str) ? @pipelines[aud_str].push(p) : @pipelines[aud_str] = [p]
      }
    end

    def _pull_initial_pipelines
      req = Streamdal::Protos::GetSetPipelinesCommandsByServiceRequest.new
      req.service_name = @cfg[:service_name]

      resp = @stub.get_set_pipelines_commands_by_service(req, metadata: _metadata)

      @log.debug "Received '#{resp.set_pipeline_commands.length}' initial pipelines"

      resp.set_pipeline_commands.each do |cmd|
        cmd.set_pipelines.wasm_modules = resp.wasm_modules
        _set_pipelines(cmd)
      end
    end

    def _get_function(step)
      # We cache functions so we can eliminate the wasm bytes from steps to save on memory
      # And also to avoid re-initializing the same function multiple times
      return @functions[step._wasm_id] if @functions.key?(step._wasm_id)

      engine = Wasmtime::Engine.new
      mod = Wasmtime::Module.new(engine, step._wasm_bytes)
      linker = Wasmtime::Linker.new(engine, wasi: true)

      linker.func_new('env', 'httpRequest', %i[i32 i32], [:i64]) do |caller, ptr, len|
        @hostfunc.http_request(caller, ptr, len)
      end

      linker.func_new('env', 'kvExists', %i[i32 i32], [:i64]) do |caller, ptr, len|
        @hostfunc.kv_exists(caller, ptr, len)
      end

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

    def _call_wasm(step, data, isr)
      raise 'step is required' if step.nil?

      raise 'data is required' if data.nil?

      isr = Streamdal::Protos::InterStepResult.new if isr.nil?

      req = Streamdal::Protos::WASMRequest.new
      req.step = step.clone
      req.input_payload = data
      req.inter_step_result = isr

      begin
        Timeout::timeout(@cfg[:step_timeout]) do
          wasm_resp = _exec_wasm(req)
          return Streamdal::Protos::WASMResponse.decode(wasm_resp)
        end
      rescue => e
        resp = Streamdal::Protos::WASMResponse.new
        resp.exit_code = :WASM_EXIT_CODE_ERROR
        resp.exit_msg = "Failed to execute WASM: #{e}"
        resp.output_payload = ''
        resp
      end
    end

    def _gen_register_request
      req = Streamdal::Protos::RegisterRequest.new
      req.service_name = @cfg[:service_name]
      req.session_id = @session_id
      req.dry_run = @cfg[:dry_run] || false
      req.client_info = _gen_client_info

      req
    end

    def _gen_client_info
      arch, os = RUBY_PLATFORM.split(/-/)

      ci = Streamdal::Protos::ClientInfo.new
      ci.client_type = :CLIENT_TYPE_SDK
      ci.library_name = 'ruby-sdk'
      ci.library_version = '0.0.1'
      ci.language = 'ruby'
      ci.arch = arch
      ci.os = os

      ci
    end

    # Returns metadata for gRPC requests to the internal gRPC API
    def _metadata
      { 'auth-token' => @cfg[:streamdal_token].to_s }
    end

    def _register
      @log.info('register started')

      # Register with Streamdal External gRPC API
      resps = @stub.register(_gen_register_request, metadata: _metadata)
      resps.each do |r|
        break if @exit

        _handle_command(r)
      end

      @log.info('register exited')
    end

    def _exec_wasm(req)
      wasm_func = _get_function(req.step)

      # Empty out _wasm_bytes, we don't need it anymore
      # TODO: does this actually update the original object?
      req.step._wasm_bytes = ''

      data = req.to_proto

      memory = wasm_func.instance.export('memory').to_memory
      alloc = wasm_func.instance.export('alloc').to_func
      dealloc = wasm_func.instance.export('dealloc').to_func
      f = wasm_func.instance.export('f').to_func

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

      _add_audience(aud)

      return @pipelines[aud_str] if @pipelines.key?(aud_str)

      []
    end

    def _heartbeat
      until @exit
        req = Streamdal::Protos::HeartbeatRequest.new
        req.session_id = @session_id
        req.audiences = Google::Protobuf::RepeatedField.new(:message, Streamdal::Protos::Audience, [])

        @audiences.each_value do |aud|
          req.audiences.push(aud)
        end

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

      case cmd.tail.request.type
      when :TAIL_REQUEST_TYPE_START
        _start_tail(cmd)
      when :TAIL_REQUEST_TYPE_STOP
        _stop_tail(cmd)
      when :TAIL_REQUEST_TYPE_PAUSE
        _pause_tail(cmd)
      when :TAIL_REQUEST_TYPE_RESUME
        _resume_tail(cmd)
      else
        raise "unknown tail request type: '#{cmd.tail.request.type.inspect}'"
      end
    end

    def _get_active_tails_for_audience(aud)
      aud_str = aud_to_str(aud)
      return @tails[aud_str].values if @tails.key?(aud_str)

      []
    end

    def _send_tail(aud, pipeline_id, original_data, new_data)
      tails = _get_active_tails_for_audience(aud)
      return nil if tails.empty?

      tails.each do |tail|
        req = Streamdal::Protos::TailResponse.new
        req.type = :TAIL_RESPONSE_TYPE_PAYLOAD
        req.audience = aud
        req.pipeline_id = pipeline_id
        req.session_id = @session_id
        req.timestamp_ns = Time.now.to_i
        req.original_data = original_data
        req.new_data = new_data
        req.tail_request_id = tail.request.id
        tail.queue.push(req)
      end
    end

    def _notify_condition(pipeline, step, aud, cond, data, cond_type)
      return nil if cond.nil?

      return nil if cond.notification.nil?

      @log.debug 'Notifying'

      return nil if @cfg[:dry_run]

      @metrics.incr(CounterEntry.new(Metrics::COUNTER_NOTIFY, aud, {
        "service": @cfg[:service_name],
        "component_name": aud.component_name,
        "pipeline_name": pipeline.name,
        "pipeline_id": pipeline.id,
        "operation_name": aud.operation_name,
      }, 1))

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
      validate_tail_request(cmd)

      req = cmd.tail.request
      @log.debug "Starting tail '#{req.id}'"

      aud_str = aud_to_str(cmd.tail.request.audience)

      # Do we already have a tail for this audience
      if @tails.key?(aud_str) && @tails[aud_str].key?(req.id)
        @log.error "Tail '#{req.id}' already exists, skipping TailCommand"
        return
      end

      @log.debug "Tailing audience: #{aud_str}"

      t = Streamdal::Tail.new(
        req,
        @cfg[:streamdal_url],
        @cfg[:streamdal_token],
        @cfg[:log],
        @metrics
      )

      t.start_tail_workers

      _set_active_tail(t)
    end

    def _set_active_tail(tail)
      key = aud_to_str(tail.request.audience)

      @tails[key] = {} unless @tails.key?(key)

      @tails[key][tail.request.id] = tail
    end

    def _set_paused_tail(tail)
      key = aud_to_str(tail.request.aud)

      @paused_tails[key] = {} unless @paused_tails.key?(key)

      @paused_tails[key][tail.request.id] = tail
    end

    def _stop_tail(cmd)
      @log.debug "Stopping tail '#{cmd.tail.request.id}'"
      key = aud_to_str(cmd.tail.request.audience)

      if @tails.key?(key) && @tails[key].key?(cmd.tail.request.id)
        @tails[key][cmd.tail.request.id].stop_tail

        # Remove from active tails
        @tails[key].delete(cmd.tail.request.id)

        @tails.delete(key) if @tails[key].empty?
      end

      return unless @paused_tails.key?(key) && @paused_tails[key].key?(cmd.tail.request.id)

      @paused_tails[key].delete(cmd.tail.request.id)

      @paused_tails.delete(key) if @paused_tails[key].empty?
    end

    def _stop_all_tails
      # TODO: does this modify the instances variables or copy them?
      _stop_tails(@tails)
      _stop_tails(@paused_tails)
    end

    def _stop_tails(tails = {})
      # Helper method for _stop_all_tails
      tails.each do |aud, aud_tails|
        aud_tails.each do |t|
          t.stop_tail
          tails[aud].delete(tail.request.id)

          tails.delete(aud) if tails[aud].empty?
        end
      end
    end

    def _pause_tail(cmd)
      t = _remove_active_tail(cmd.tail.request.audience, cmd.tail.request.tail.id)
      t.stop_tail

      _set_paused_tail(t)

      @log.debug "Paused tail '#{cmd.tail.request.tail.id}'"
    end

    def _resume_tail(cmd)
      t = _remove_paused_tail(cmd.tail.request.audience, cmd.tail.request.tail.id)
      if t.nil?
        @log.error "Tail '#{cmd.tail.request.tail.id}' not found in paused tails"
        return nil
      end

      t.start_tail_workers

      _set_active_tail(t)

      @log.debug "Resumed tail '#{cmd.tail.request.tail.id}'"
    end

    def _remove_active_tail(aud, tail_id)
      key = aud_to_str(aud)

      return unless @tails.key?(key) && @tails[key].key?(tail_id)

      t = @tails[key][tail_id]
      t.stop_tail

      @tails[key].delete(tail_id)

      @tails.delete(key) if @tails[key].empty?

      t
    end

    def _remove_paused_tail(aud, tail_id)
      key = aud_to_str(aud)

      return unless @paused_tails.key?(key) && @paused_tails[key].key?(tail_id)

      t = @paused_tails[key][tail_id]

      @paused_tails[key].delete(tail_id)

      @paused_tails.delete(key) if @paused_tails[key].empty?

      t
    end
  end
end
