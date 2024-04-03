module Streamdal
  class Counter
    attr_accessor :last_updated

    def initialize(name, aud, labels = {}, value = 0.0)
      @name = name
      @aud = aud
      @labels = labels
      @value = value
      @last_updated = Time::now
      @value_mtx = Mutex.new
    end

    def incr(val)
      @value_mtx.synchronize do
        @value += val
        @last_updated = Time::now
      end
    end

    def reset
      @value_mtx.synchronize do
        @value = 0.0
      end
    end

    def val
      @value_mtx.synchronize do
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
    DEFAULT_COUNTER_PUBLISH_INTERVAL = 1

    CounterEntry = Struct.new(:name, :aud, :labels, :value)

    Config = Struct.new(:streamdal_url, :streamdal_token, :log) do
      def validate
        if streamdal_url.nil? || streamdal_url.empty?
          raise ArgumentError, "streamdal_url is required"
        end

        if streamdal_token.nil? || streamdal_token.empty?
          raise ArgumentError, "streamdal_token is required"
        end
      end
    end

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
      @publish_queue = Queue.new
      @workers = []
      @logger = cfg.log || Logger.new(STDOUT)

      _start
    end

    def shutdown
      # Set exit flag so workers exit
      @exit = true

      # Let loops exit
      sleep(1)

      # Exit any remaining threads
      @workers.each do |w|
        if w.running?
          w.exit
        end
      end
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

    def _start
      WORKER_POOL_SIZE.times do |i|
        @workers << Thread.new { _run_incrementer_worker(i) }
        @workers << Thread.new { _run_publisher_worker(i) }
      end

      @workers << Thread.new { _run_publisher }
      @workers << Thread.new { _run_reaper }
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
      # Background thread that reads values from counters, adds them to the publish queue, and then
      # resets the counter's value back to zero
      unless @exit
        @cfg.log.debug("Starting publisher")

        # Sleep on startup and then and between each loop run
        sleep(DEFAULT_COUNTER_PUBLISH_INTERVAL)

        # Get all counters
        # Loop over each counter, get the value,
        #   if value > 0, continue
        #   if now() - last_updated > 10 seconds, remove counter
        # Grab copy of counters
        @counters_mtx.lock
        new_counters = @counters.dup
        @counters_mtx.unlock

        new_counters.each do |name, counter|
          if counter.val == 0
            next
          end

          ce = CounterEntry.new(counter.name, counter.aud, counter.labels, counter.val)
          counter.reset

          @publish_queue.push(ce)
        end
      end
    end

    def _run_publisher_worker(worker_id)
      @cfg.log.debug("Starting publisher worker '#{worker_id}'")

      until @exit
        ce = @incr_queue.pop
        begin
          _publish_metrics(ce)
        rescue => e
          @cfg.log.error("Failed to publish metrics: #{e}")
        end
      end

      @cfg.log.debug("Exiting publisher worker '#{worker_id}'")
    end

    def _run_reaper
      @cfg.log.debug("Starting reaper")

      until @exit
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
            @cfg.log.debug("Reaping counter '#{name}'")
            remove_counter(name)
          end
        end
      end

      @cfg.log.debug("Exiting reaper")
    end

    def _run_incrementer_worker(worker_id)
      @cfg.log.debug("Starting incrementer worker '#{worker_id}'")

      until @exit
        ce = @incr_queue.pop
        c = get_counter(ce.name)
        c.incr(ce.value)
      end

      @cfg.log.debug("Exiting incrementer worker '#{worker_id}'")
    end
  end
end