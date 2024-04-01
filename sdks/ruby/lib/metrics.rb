module Streamdal
  class Counter
    def initialize(name, aud, labels = {}, value = 0.0)
      @name = name
      @aud = aud
      @labels = labels
      @value = value
    end

    def incr(val)
      @value += val
    end

    def reset
      @value = 0.0
    end

    def val
      @value
    end
  end

  class Metrics

    COUNTER_CONSUME_BYTES = "counter_consume_bytes"
    COUNTER_CONSUME_PROCESSED = "counter_consume_processed"
    COUNTER_CONSUME_ERRORS = "counter_consume_errors"
    COUNTER_PRODUCE_BYTES = "counter_produce_bytes"
    COUNTER_PRODUCE_PROCESSED = "counter_produce_processed"
    COUNTER_PRODUCE_ERRORS = "counter_produce_errors"
    COUNTER_NOTIFY = "counter_notify"
    COUNTER_DROPPED_TAIL_MESSAGES = "counter_dropped_tail_messages"
    COUNTER_CONSUME_BYTES_RATE = "counter_consume_bytes_rate"
    COUNTER_PRODUCE_BYTES_RATE = "counter_produce_bytes_rate"
    COUNTER_CONSUME_PROCESSED_RATE = "counter_consume_processed_rate"
    COUNTER_PRODUCE_PROCESSED_RATE = "counter_produce_processed_rate"

    def initialize(cfg)
      _validate_config(cfg)
      @cfg = cfg
      @counters = {}
    end

    def self.composite_id(counter_name, labels = {})
      "#{counter_name}-#{labels.values.join("-")}"
    end

    def get_counter(name, labels = {})
      k = composite_id(name, labels)
      
      if @counters.key?(k)
        return @counters[k]
      end

      nil
    end

    def new_counter(name, aud, labels = {}, value = 0.0)
      c = Counter.new(name, aud, labels, value)
      @counters[composite_id(name, labels)] = c
      c
    end

    def incr(name, value, labels, aud)
      nil
    end

    private

    def _shutdown
      nil
    end

    def _publish_metrics
      nil
    end

    def _run_publisher
      nil
    end

    def _run_publisher_worker
      nil
    end

    def remove_counter
      nil
    end

    def _run_reaper
      nil
    end

    def _run_incrementer_worker
      nil
    end

    def _validate_config(cfg)
      if cfg.nil?
        raise ArgumentError, "cfg is nil"
      end

      if cfg[:stub].nil?
        raise ArgumentError, "stub is nil"
      end

      if cfg[:auth_token].nil?
        raise ArgumentError, "auth_token is nil"
      end

      if cfg[:log].nil?
        raise ArgumentError, "log is nil"
      end
    end
  end
end