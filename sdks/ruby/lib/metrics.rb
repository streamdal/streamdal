module Streamdal

  CounterEntry = Struct.new(:name, :aud, :labels, :value)

  MetricsConfig = Struct.new(:stub, :auth_token, :log) do
    def validate
      if stub.nil?
        raise ArgumentError, "stub is nil"
      end

      if auth_token.nil?
        raise ArgumentError, "auth_token is nil"
      end

      if log.nil?
        raise ArgumentError, "log is nil"
      end
    end
  end

  class Counter
    attr_accessor :last_updated

    def initialize(name, aud, labels = {}, value = 0.0)
      @name = name
      @aud = aud
      @labels = labels
      @value = value
      @last_updated = Time::now
      @value_mutex = Mutex.new
    end

    def incr(val)
      @value_mutex.synchronize do
        @value += val
        @last_updated = Time::now
      end
    end

    def reset
      @value_mutex.synchronize do
        @value = 0.0
      end
    end

    def val
      @value_mutex.synchronize do
        @value
      end
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

    WORKER_POOL_SIZE = 3
    DEFAULT_COUNTER_REAPER_INTERVAL = 10
    DEFAULT_COUNTER_TTL = 10

    def initialize(cfg)
      if cfg.nil?
        raise ArgumentError, "cfg is nil"
      end

      cfg.validate

      @cfg = cfg
      @counters = {}
      @counters_mtx = Mutex.new
      @exit = false
      @incr_queue = Queue.new
    end

    def shutdown
      @exit = true

      # TODO: join threads
    end

    def self.composite_id(counter_name, labels = {})
      "#{counter_name}-#{labels.values.join("-")}".freeze
    end

    def get_counter(ce)

      k = composite_id(ce.name, ce.labels)

      @counters_mtx.synchronize do
        if @counters.key?(k)
          @counters[k]
        end
      end

      # No counter exists, create a new one and return it
      new_counter(ce)
    end

    def new_counter(ce)
      c = Counter.new(ce.name, ce.aud, ce.labels, ce.value)

      @counters_mtx.synchronize do
        @counters[composite_id(ce)] = c
      end

      c
    end

    def incr(ce)
      c = get_counter(ce)

      if c.nil?
        new_counter(ce)
        nil
      end

      @incr_queue.push(ce)
    end

    def remove_counter(name)
      @counters_mtx.synchronize do
        @counters.delete(name)
      end
    end

    private

    def _shutdown
      nil
    end

    def _publish_metrics(ce)
      metric = Streamdal::Protos::Metric.new
      metric.name = ce.name
      metric.labels = ce.labels
      metric.value = ce.value
      metric.audience = ce.aud

      req = Streamdal::Protos::MetricsRequest.new
      req.metrics = [metric]

      @cfg.stub.metrics(req, metadata: _metadata)
    end

    def _run_publisher
      nil
    end

    def _run_publisher_worker
      nil
    end

    def _run_reaper
      @logger.debug("Starting reaper")

      unless @exit
        # Sleep on startup and then and between each loop run
        sleep(DEFAULT_COUNTER_REAPER_INTERVAL)

        # Get all counters
        # Loop over each counter, get the value,
        #   if value > 0, continue
        #   if now() - last_updated > 10 seconds, remove counter
        # Grab copy of counters
        @counters_mtx.lock
        new_counters = @counters.dup
        @counters_mtx.unlock

        new_counters.each do |name, counter|
          if counter.val > 0
            next
          end

          if Time::now - counter.last_updated > DEFAULT_COUNTER_TTL
            remove_counter(name)
          end
        end
      end

      @logger.debug("Exiting reaper")
    end

    def _run_incrementer_worker
      @logger.debug("Starting incrementer worker")

      until @exit
        ce = @incr_queue.pop
        c = get_counter(ce.name)
        c.incr(ce.value)
      end
    end
  end
end