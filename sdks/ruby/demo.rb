require "./lib/streamdal"

a = Streamdal::Client.new({ service_name: "demo-ruby", streamdal_token: "1234" })
a.tmp

puts "done"

sleep(10)