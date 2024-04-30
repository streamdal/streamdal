require_relative "./lib/streamdal"

cfg = Streamdal::Config.new
cfg.streamdal_url = "localhost:8082"
cfg.streamdal_token = "1234"
cfg.service_name = "demo"

client = Streamdal::Client.new(cfg)
# a.tmp

audience = Streamdal::Audience.new
audience.component_name = "kafka"
audience.operation_name = "consume"
audience.operation_type = Streamdal::OPERATION_TYPE_CONSUMER

while true
  resp = client.process('{"email": "mark@streamdal.com"}', audience)
  puts "Response: "
  puts "-----------------------------------"
  puts resp.inspect.gsub(/\\n/, "\n")
  puts "-----------------------------------"

  puts "done demo"

  sleep(3)
end

client.shutdown