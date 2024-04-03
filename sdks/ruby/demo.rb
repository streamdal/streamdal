require "./lib/streamdal"

a = Streamdal::Client.new({ service_name: "demo-ruby", streamdal_token: "1234", streamdal_url: "localhost:8082" })
# a.tmp

audience = Streamdal::Audience.new
audience.component_name = "kafka"
audience.operation_name = "consume"
audience.operation_type = Streamdal::OPERATION_TYPE_CONSUMER

resp = a.process('{"email": "mark@streamdal.com"}', audience)
puts "Response: "
puts "-----------------------------------"
puts resp.inspect.gsub(/\\n/, "\n")
puts "-----------------------------------"

puts "done demo"

sleep(10)