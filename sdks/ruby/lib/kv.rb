module Streamdal
  class KeyValue
    def initialize
      @kvs = {}
      @mtx = Mutex.new
    end

    def set(key, value)
      @mtx.synchronize do
        @kvs[key] = value
      end
    end

    def get(key)
      @mtx.synchronize do
        @kvs[key]
      end
    end

    def delete(key)
      @mtx.synchronize do
        @kvs.delete(key)
      end
    end

    def keys
      @mtx.synchronize do
        @kvs.keys
      end
    end

    def items
      @mtx.synchronize do
        @kvs.values
      end
    end

    def exists(key)
      @mtx.synchronize do
        @kvs.key?(key)
      end
    end

    def purge
      @mtx.synchronize do
        num_keys = @kvs.keys.length
        @kvs = {}
        num_keys
      end
    end
  end
end