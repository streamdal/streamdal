require "./lib/streamdal"

a = Streamdal::Client.new({ service_name: "demo-ruby", streamdal_token: "1234", streamdal_url: "localhost:8082" })
# a.tmp

puts "done"

sleep(10)