# TODO: implement token bucket limiter
require "bozos_buckets"

NUM_TAIL_WORKERS = 2
MIN_TAIL_RESPONSE_INTERVAL_MS = 100

module Streamdal
  class Tail
    attr_accessor :queue, :active, :request

    def initialize(request, streamdal_url, auth_token, log, metrics, active = false)
      @request = request
      @streamdal_url = streamdal_url
      @auth_token = auth_token
      @log = log
      @metrics = metrics
      @active = active
      @last_msg = Time::at(0)
      @queue = Queue.new

      # Only use rate limiting if sample_options is set
      unless request.sample_options.nil?
        @limiter = BozosBuckets::Bucket(
          initial_token_count: request.sample_options.sample_rate,
          refill_rate: request.sample_options.sample_interval_seconds,
          max_token_count: request.sample_options.sample_rate
        )
      end
    end

    def start_tail_workers
      NUM_TAIL_WORKERS.times do |worker_id|
        Thread.new do
          start_tail_worker(worker_id + 1)
        end
      end
      @active = true
    end

    def stop_tail
      @logger.debug("Stopping tail for '#{@request.id}'")
      @active = false
      @stub = nil # No close method, garbage collector handles it in ruby
    end
    
    def start_tail_worker(worker_id)
      @logger.debug("Starting tail worker #{worker_id}")

      # Create gRPC connection
      stub = Streamdal::Protos::Internal::Stub.new(@streamdal_url, :this_channel_is_insecure)

      while @active
        # If the queue is empty, sleep for a bit and loop again
        if @queue.empty?
          sleep(0.1)
          next
        end

        if Time::now - @last_msg < MIN_TAIL_RESPONSE_INTERVAL_MS
          sleep(MIN_TAIL_RESPONSE_INTERVAL_MS)

          # TODO: metric for COUNTER_DROPPED_TAIL_MESSAGES
          @logger.debug("Dropped tail message for '#{@request.id}' due to rate limiting")
          next
        end

        unless @stub.nil?
          @logger.debug("Sending tail request for '#{tail_response.tail_request_id}'")
          tail_response = @queue.pop(non_block = false)
          @stub.tail(tail_response, metadata: { "auth-token" => @auth_token })
        end
      end

      @logger.debug "Tail worker #{worker_id} exited"

    end

    def should_send
      if @limiter.nil?
        nil
      end

      @limiter.use_tokens(1)
    end
  end
end