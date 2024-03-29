module Audiences
  def aud_to_str(aud)
    # TODO: move to common package
    "#{aud.service_name}.#{aud.component_name}.#{aud.operation_type}.#{aud.operation_name}"
  end

  def str_to_aud(str)
    # TODO: move to common package
    parts = str.split(".")
    aud = Streamdal::Protos::Audience.new
    aud.service_name = parts[0]
    aud.component_name = parts[1]
    aud.operation_type = parts[2]
    aud.operation_name = parts[3]
    aud
  end

  def _seen_audience(aud)
    @audiences.key?(aud_to_str(aud))
  end

  def _add_audience(aud)
    # Add an audience to the local cache map and send to server
    if _seen_audience(aud)
      return
    end

    @audiences[aud_to_str(aud)] = aud

    req = Streamdal::Protos::NewAudienceRequest.new
    req.session_id = @session_id
    req.audience = aud
    @stub.new_audience(req, metadata: _metadata)
  end

  def _add_audiences
    # This method is used to re-announce audiences after a disconnect

    @audiences.each do |aud|
      req = Streamdal::Protos::NewAudienceRequest.new
      req.session_id = @session_id
      req.audience = aud
      @stub.new_audience(req, metadata: _metadata)
    end
  end
end