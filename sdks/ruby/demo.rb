require "./lib/streamdal"

a = Streamdal::Client.new({ service_name: "demo-ruby" })
a.tmp

puts "done"