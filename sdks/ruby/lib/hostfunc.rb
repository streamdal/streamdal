require 'steps/sp_steps_kv_pb'
require 'sp_wsm_pb'
require 'steps/sp_steps_httprequest_pb'

module Streamdal
  class HostFunc

    ##
    # This class holds methods that are called by wasm modules

    def initialize(kv)
      @kv = kv
    end

    ##
    # kv_exists is a host function that is used to check if a key exists in the KV store
    def kv_exists(caller, ptr, len)

      data = caller.export('memory').to_memory.read(ptr, len)

      # Read request from memory and decode into HttpRequest
      req = Streamdal::Protos::KVStep.decode(data)

      exists = @kv.exists(req.key)

      msg = exists ? "Key '#{req.key}' exists" : "Key #{req.key} does not exist"

      status = exists ? :KV_STATUS_SUCCESS : :KV_STATUS_FAILURE

      wasm_resp = Streamdal::Protos::KVStepResponse.new
      wasm_resp.status = status
      wasm_resp.message = msg

      write_to_memory(caller, wasm_resp)
    end

    ##
    # http_request performs a http request on behalf of a wasm module since WASI cannot talk sockets
    def http_request(caller, ptr, len)
      data = caller.export('memory').to_memory.read(ptr, len)

      # Read request from memory and decode into HttpRequest
      req = Streamdal::Protos::WASMRequest.decode(data)

      begin
        req_body = self._get_request_body_for_mode(req)
      rescue => e
        return self._http_request_response(caller, 400, e.to_s, {})
      end

      # Attempt to make HTTP request
      # On error, return a mock 400 response with the error as the body
      begin
        response = _make_http_request(req.step.http_request.request, req_body)
      rescue => e
        return self._http_request_response(caller, 400, "Unable to execute HTTP request: #{e}", {})
      end

      self._http_request_response(caller, response.code, response.body, response.headers)
    end

    private

    def _http_request_response(caller, code, body, headers)
      wasm_resp = Streamdal::Protos::HttpResponse.new
      wasm_resp.code = code
      wasm_resp.body = body
      wasm_resp.headers = Google::Protobuf::Map.new(:string, :string, {})

      # Headers can have multiple values, but we just want a map[string]string here for simplicity
      # The client can pase by the delimiter ";" if needed.
      headers.each do |k, values|
        wasm_resp.headers[k] = values.is_a?(Array) ? values.join('; ') : values
      end

      # Write the HttpResponse proto message to WASM memory
      # The .wasm module will read/decode this data internally
      write_to_memory(caller, wasm_resp)
    end

    def _get_request_body_for_mode(req)
      http_req = req.step.http_request.request

      case http_req.body_mode
      when :HTTP_REQUEST_BODY_MODE_INTER_STEP_RESULT
        raise 'Inter step result is empty' if req.inter_step_result.nil?

        detective_res = req.inter_step_result.detective_result

        raise 'Detective result is empty' if detective_res.nil?

        # Wipe values to prevent PII from being leaked
        detective_res.matches.each { |step_res|
          step_res.value = ''
        }

        req.inter_step_result.to_json
      when :HTTP_REQUEST_BODY_MODE_STATIC
        http_req.body
      else
        raise 'invalid http request body mode'
      end
    end

    ##
    # Performs an http request
    def _make_http_request(req, body)
      if req.nil?
        raise 'req is required'
      end

      options = {
        headers: { "Content-Type": 'application/json', },
      }

      req.headers.each { |key, value| options.headers[key] = value }

      case req.to_h[:method]
      when :HTTP_REQUEST_METHOD_GET
        return HTTParty.get(req.url)
      when :HTTP_REQUEST_METHOD_POST
        options.body = body
        return HTTParty.post(req.url, options)
      when :HTTP_REQUEST_METHOD_PUT
        options.body = body
        return HTTParty.put(req.url, options)
      when :HTTP_REQUEST_METHOD_DELETE
        return HTTParty.delete(req.url)
      when :HTTP_REQUEST_METHOD_PATCH
        options.body = body
        return HTTParty.patch(req.url, options)
      when :HTTP_REQUEST_METHOD_HEAD
        return HTTParty.head(req.url)
      when :HTTP_REQUEST_METHOD_OPTIONS
        return HTTParty.options(req.url)
      else
        raise ArgumentError, "Invalid http request method: #{req.method}"
      end
    end
  end
end