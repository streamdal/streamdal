include Streamdal::Protos

module Schema
  def _set_schema(aud, schema)
    s = Streamdal::Protos::Schema.new
    s.json_schema = schema
    @schemas[aud_to_str(aud)] = s
  end

  def _get_schema(aud)
    if @schemas.key?(aud_to_str(aud))
      return @schemas[aud_to_str(aud)].json_schema
    end

    ""
  end

  def _handle_schema(aud, step, wasm_resp)
    # Only handle schema steps
    if step.infer_schema.nil?
      @loger.debug("Not a schema inference step")
      return nil
    end

    # Only successful schema inferences
    if wasm_resp.exit_code != :WASM_EXIT_CODE_TRUE
      return nil
    end

    # If existing schema matches, do nothing
    existing_schema = _get_schema(aud)
    if existing_schema == wasm_resp.output_step
      return nil
    end

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