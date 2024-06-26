require 'bozos_buckets'

NUM_TAIL_WORKERS = 2
MIN_TAIL_RESPONSE_INTERVAL_MS = 100

module Streamdal
  class Tail
    attr_accessor :queue, :active, :request

    def initialize(request, streamdal_url, auth_token, log, metrics, active = false)
      @request = request
      @streamdal_url = streamdal_url
      @auth_token = auth_token
      @logger = log
      @metrics = metrics
      @active = active
      @last_msg = Time.at(0)
      @queue = Queue.new
      @workers = []

      # Only use rate limiting if sample_options is set
      return if request.sample_options.nil?

      @limiter = BozosBuckets::Bucket.new(
        initial_token_count: request.sample_options.sample_rate,
        refill_rate: request.sample_options.sample_interval_seconds,
        max_token_count: request.sample_options.sample_rate
      )

    end

    def start_tail_workers
      NUM_TAIL_WORKERS.times do |worker_id|
        @workers << Thread.new { start_tail_worker(worker_id + 1) }
      end

      @active = true
    end

    def stop_tail
      @active = false

      sleep(1)

      @workers.each do |worker|
        worker.exit if worker.alive?
      end
    end

    def start_tail_worker(worker_id)
      @logger.debug("Starting tail worker #{worker_id}")

      # Each worker gets it's own gRPC connection
      stub = Streamdal::Protos::Internal::Stub.new(@streamdal_url, :this_channel_is_insecure)

      while @active
        # If the queue is empty, sleep for a bit and loop again
        if @queue.empty?
          sleep(0.1)
          next
        end

        if Time.now - @last_msg < MIN_TAIL_RESPONSE_INTERVAL_MS
          sleep(MIN_TAIL_RESPONSE_INTERVAL_MS)
          @metrics.incr(Metrics::CounterEntry.new(COUNTER_DROPPED_TAIL_MESSAGES, nil, {}, 1))
          @logger.debug("Dropped tail message for '#{@request.id}' due to rate limiting")
          next
        end

        next if stub.nil?

        tail_response = @queue.pop(false)
        @logger.debug("Sending tail request for '#{tail_response.tail_request_id}'")

        begin
          stub.send_tail([tail_response], metadata: { 'auth-token' => @auth_token })
        rescue Error => e
          @logger.error("Error sending tail request: #{e}")
        end
      end

      @logger.debug "Tail worker #{worker_id} exited"
    end

    def should_send
      true if @limiter.nil?

      @limiter.use_tokens(1)
    end
  end
end
