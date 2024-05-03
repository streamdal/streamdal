require_relative "../lib/streamdal"
require_relative 'helpers'
require 'terminal-table'

logger = Logger.new(STDOUT)
logger.level = Logger::INFO

cfg = Streamdal::Config.new
cfg.streamdal_url = "localhost:8082"
cfg.streamdal_token = "1234"
cfg.service_name = "demo"
cfg.log = logger

client = Streamdal::Client.new(cfg)

audience = Streamdal::Audience.new
audience.component_name = "kafka"
audience.operation_name = "consume"
audience.operation_type = Streamdal::OPERATION_TYPE_CONSUMER

payload = <<~PAYLOAD
  {
    "version": "1.0",
    "event": {
      "id": "2d7c3cec-1f42-416d-be0b-9f1cb2d1a6e4",
      "type": "purchase",
      "timestamp": "2021-01-01T00:00:00Z",
      "amount": "100.00"
    },
    "customer": {
      "email": "user@streamdal.com",
      "id": "2d7c3cec-1f42-416d-be0b-9f1cb2d1a6e4"
    },
    "config": {
      "aws": {
        "region": "us-west-2",
        "account_id": "123456789012",
        "secret": "secret"
      }
    }
  }
PAYLOAD

while true
  resp = client.process(payload, audience)

  table = Terminal::Table.new do |t|
    t.style = {border: :unicode_thick_edge}
    t << ["Date".bold, Time.now.strftime("%a, %d %b %Y %H:%M:%S %Z")]
    t << ["Last Status".bold, status_to_string(resp.status)]
    t << ["Last Status Message".bold, resp.status_message == "" ? "no status message" : resp.status_message]
    t << ["Metadata (#{resp.metadata.length})".bold, metadata_to_string(resp.metadata)]
    t << ["Num Pipelines".bold, resp.pipeline_status.length]
    t << :separator
    t << ["Before".bold, resp.data == payload ? "After (unchanged)".bold : "After".bold]
    t << :separator
    t.add_row [jsonpp(payload), jsonpp(resp.data)]
  end

  puts table

  sleep(2)
end



client.shutdown
