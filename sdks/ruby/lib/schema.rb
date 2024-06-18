# frozen_string_literal: true

include Streamdal::Protos

module Schemas
  def _set_schema(aud, schema)
    s = Streamdal::Protos::Schema.new
    s.json_schema = schema
    @schemas[aud_to_str(aud)] = s
  end

  def _get_schema(aud)
    return @schemas[aud_to_str(aud)].json_schema if @schemas.key?(aud_to_str(aud))

    ''
  end

  def _handle_schema(aud, step, wasm_resp)
    # Only handle schema steps
    return nil if step.infer_schema.nil?

    # Only successful schema inferences
    return nil if wasm_resp.exit_code != :WASM_EXIT_CODE_TRUE

    # If existing schema matches, do nothing
    existing_schema = _get_schema(aud)
    return nil if existing_schema == wasm_resp.output_step

    _set_schema(aud, wasm_resp.output_step)

    req = Streamdal::Protos::SendSchemaRequest.new
    req.audience = aud
    req.schema = Streamdal::Protos::Schema.new
    req.schema.json_schema = wasm_resp.output_step

    # Run in thread so we don't block on gRPC call
    Thread.new do
      @stub.send_schema(req, metadata: _metadata)
    end
  end
end
