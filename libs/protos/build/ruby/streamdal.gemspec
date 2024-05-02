Gem::Specification.new do |s|
  s.name = "streamdal-protos"
  s.version = "0.1.52"
  s.summary = "Streamdal SDK Protocol Buffers"
  s.authors = ["Mark Gregan"]
  s.email = "mark@streamdal.com"
  s.files = Dir.glob("lib/**/*.rb")
  s.homepage = "https://docs.streamdal.com"
  s.license = "Apache-2.0"

  s.add_runtime_dependency "grpc", "~> 1.32"
  s.add_runtime_dependency "google-protobuf", "~> 3.15"
end
