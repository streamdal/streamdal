require 'simplecov'
SimpleCov.start

# This environment variable exists so that we can run WASM tests
# via the CI process for libs/wasm* and not just through the CI
# of the ruby-sdk
WASM_DIR = ENV['WASM_DIR'] || File.join(File.dirname(__FILE__), '..', 'test-assets', 'wasm')

# Load the WebAssembly module
def load_wasm(name)
  File.read(File.join(WASM_DIR, name))
end
