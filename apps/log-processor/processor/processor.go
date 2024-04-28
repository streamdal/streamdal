package processor

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"sync"
	"time"

	"github.com/charmbracelet/log"
	"github.com/pkg/errors"
	streamdal "github.com/streamdal/streamdal/sdks/go"

	"github.com/streamdal/streamdal/apps/log-processor/config"
	"github.com/streamdal/streamdal/apps/log-processor/metrics"
)

const (

	// operationName is used to identify the operation in Streamdal
	operationName = "logstash-process"

	// componentName is used to identify the component in Streamdal
	componentName = "Logstash"

	// maxRetryDelay is the maximum delay between retries to establish a
	// connection to Logstash. This delay will increase with each retry, up to
	// this maximum value.
	maxRetryDelay = 30 * time.Second

	// maxSendRetries is the maximum number of retries a sender will attempt
	// before giving up and moving on to the next message.
	maxSendRetries = 3
)

var (
	// sendTimeout is the amount of time senders will try sending data to
	// logstash before fetching a new connection and retrying.
	sendTimeout = 5 * time.Second
)

// Processor is responsible for processing log messages and forwarding them to Logstash
type Processor struct {
	log             *log.Logger
	config          *config.Config
	processCh       chan []byte           // written to by listeners, read by processors
	sendCh          chan *LogstashMessage // written to by processors, read by senders
	conns           map[int]net.Conn      // used by senders
	connsMutex      *sync.RWMutex         // used by senders
	wg              *sync.WaitGroup       // used by all workers
	streamdalClient streamdal.IStreamdal  // used by processors
	shutdownContext context.Context       // used by all goroutines
	cancelFunc      context.CancelFunc    // used by main() and Close()
	metrics         *metrics.Metrics      // used for prometheus instrumentation
}

// LogstashMessage is a struct that represents a log entry shipped from Logstash
type LogstashMessage struct {
	Version   string `json:"@version"`
	Path      string `json:"path"`
	Timestamp string `json:"@timestamp"`
	Message   string `json:"message"`
	Host      string `json:"host"`
	Type      string `json:"type,omitempty"`
}

func New(shutdownCtx context.Context, cancelFunc context.CancelFunc, cfg *config.Config) (*Processor, error) {
	if shutdownCtx == nil {
		return nil, errors.New("shutdown context cannot be nil")
	}

	if cfg == nil {
		return nil, errors.New("config cannot be nil")
	}

	p := &Processor{
		log:             log.With("pkg", "processor"),
		config:          cfg,
		wg:              &sync.WaitGroup{},
		metrics:         metrics.New(),
		processCh:       make(chan []byte, cfg.ProcessBufferSize),
		sendCh:          make(chan *LogstashMessage, cfg.SendBufferSize),
		conns:           make(map[int]net.Conn),
		connsMutex:      &sync.RWMutex{},
		shutdownContext: shutdownCtx,
		cancelFunc:      cancelFunc,
	}

	// Setup Streamdal client
	streamdalClient, err := streamdal.New(&streamdal.Config{
		ServerURL:   cfg.StreamdalServerAddress,
		ServerToken: cfg.StreamdalServerToken,
		ServiceName: cfg.StreamdalServiceName,
		ShutdownCtx: shutdownCtx,
	})
	if err != nil {
		return nil, errors.Wrap(err, "unable to create Streamdal client")
	}

	p.streamdalClient = streamdalClient

	p.log.Debugf("Starting listener on '%s'", cfg.LogstashListenAddr)

	// Start listeners
	if err := p.startListeners(); err != nil {
		return nil, errors.Wrap(err, "failed to start listener")
	}

	p.log.Debugf("Starting '%d' processors", cfg.NumProcessors)

	// Start processors
	if err := p.startProcessors(); err != nil {
		return nil, errors.Wrap(err, "failed to start processors")
	}

	p.log.Debugf("Starting '%d' senders", cfg.NumSenders)

	// Start senders
	if err := p.startSenders(); err != nil {
		return nil, errors.Wrap(err, "failed to start senders")
	}

	return p, nil
}

func (p *Processor) Close() error {
	p.log.Debug("Close() called, shutting down")

	p.cancelFunc()

	// Wait for goroutines to shutdown with timeout
	doneCh := make(chan struct{})
	timeout := 5 * time.Second
	timeoutCh := time.After(timeout)

	go func() {
		p.wg.Wait()
		doneCh <- struct{}{}
	}()

	select {
	case <-doneCh:
		p.log.Debug("All goroutines have shutdown gracefully")
		return nil
	case <-timeoutCh:
		p.log.Warnf("Timeout ('%s') occurred while waiting for goroutines to shutdown", timeout)
		return fmt.Errorf("timeout ('%s') occurred while waiting for goroutines to shutdown", timeout)
	}
}

func (p *Processor) startProcessors() error {
	llog := p.log.With("method", "startProcessors")

	errCh := make(chan error, p.config.NumProcessors)

	for i := 0; i < p.config.NumProcessors; i++ {
		p.wg.Add(1)

		go func() {
			p.metrics.ProcessorGoroutines.Inc()
			defer p.metrics.ProcessorGoroutines.Dec()
			defer p.wg.Done()

			if err := p.runProcessor(i); err != nil {
				llog.Errorf("Failed running processor: %v", err)
				errCh <- errors.Wrap(err, "failed running processor")
			}
		}()
	}

	// Listen for errors for 1 second
	timeAfterCh := time.After(time.Second)

	select {
	case <-timeAfterCh:
		return nil
	case err := <-errCh:
		return errors.Wrap(err, "error during processor startup")
	}
}

func (p *Processor) runProcessor(workerID int) error {
	llog := p.log.With("method", "runProcessor", "worker_id", workerID)

MAIN:
	for {
		select {
		case <-p.shutdownContext.Done():
			llog.Debug("Detected shutdown")
			break MAIN
		case data := <-p.processCh:
			if err := p.processorHandler(workerID, data); err != nil {
				llog.Errorf("Error handling data: %v", err)
			}
		}
	}

	llog.Debug("Exiting")

	return nil
}

func (p *Processor) processorHandler(workerID int, data []byte) error {
	llog := p.log.With("method", "processorHandler", "worker_id", workerID)

	llog.Debugf("Received data: %s", data)

	// Try to unmarshal data
	logstashMessage := &LogstashMessage{}

	if err := json.Unmarshal(data, logstashMessage); err != nil {
		return errors.Wrap(err, "failed to unmarshal data")
	}

	llog.Debugf("Unmarshalled message: %s", string(logstashMessage.Message))

	// Process .Message via Streamdal
	resp := p.streamdalClient.Process(p.shutdownContext, &streamdal.ProcessRequest{
		OperationType: streamdal.OperationTypeConsumer,
		OperationName: operationName,
		ComponentName: componentName,
		Data:          []byte(logstashMessage.Message),
	})

	if resp.Metadata["log_drop"] == "true" {
		llog.Debugf("Log message was skipped due to 'log_drop' metadata (message: %s)", logstashMessage.Message)
		return nil
	}

	logstashMessage.Message = string(resp.Data)

	p.sendCh <- logstashMessage

	llog.Debugf("Processed message: %s", string(logstashMessage.Message))

	return nil
}
