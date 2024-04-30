package processor

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"time"

	"github.com/pkg/errors"
)

func (p *Processor) startSenders() error {
	llog := p.log.With("method", "startSenders")

	// Launch connection manager
	p.wg.Add(1)
	go p.runConnectionManager()

	errCh := make(chan error, p.config.NumSenders)

	for i := 0; i < p.config.NumSenders; i++ {
		p.wg.Add(1)

		go func() {
			p.metrics.SenderGoroutines.Inc()
			defer p.metrics.SenderGoroutines.Dec()
			defer p.wg.Done()

			// Create initial connection to logstash
			conn, err := p.connectLogstash(p.config.LogstashAddr, false)
			if err != nil {
				llog.Errorf("Failed to connect to Logstash for worker id '%d': %v", i, err)
				errCh <- errors.Wrap(err, "failed to connect to Logstash")
				return
			}

			p.setLogstashConn(i, conn)

			if err := p.runSender(i); err != nil {
				llog.Errorf("Failed running sender: %v", err)
				errCh <- errors.Wrap(err, "failed running sender")
			}
		}()
	}

	// Listen for errors for 1 second
	timeAfterCh := time.After(time.Second)

	select {
	case <-timeAfterCh:
		return nil
	case err := <-errCh:
		return errors.Wrap(err, "error during sender startup")
	}
}

func (p *Processor) runSender(workerID int) error {
	llog := p.log.With("method", "runSender", "worker_id", workerID)

MAIN:
	for {
		select {
		case <-p.shutdownContext.Done():
			llog.Debug("Detected shutdown")
			break MAIN
		case data := <-p.sendCh:
			// Clear out type field before sending it to logstash
			data.Type = ""

			dataStr, err := json.Marshal(data)
			if err != nil {
				p.metrics.SenderErrorsTotal.Inc()
				llog.Errorf("Error marshalling data: %v", err)
				continue
			}

			if err := p.sendWithRetry(workerID, dataStr, 0); err != nil {
				p.metrics.SenderErrorsTotal.Inc()
				return errors.Wrap(err, "failed to send with retry")
			}

			p.metrics.SenderProcessedTotal.Inc()
		}
	}

	llog.Debug("Exiting")

	return nil
}

func (p *Processor) sendWithRetry(workerID int, data []byte, retryNum int) error {
	llog := p.log.With("method", "sendWithRetry", "worker_id", workerID)

	if retryNum > 0 {
		if retryNum > maxSendRetries {
			return fmt.Errorf("max send retries reached (%d/%d)", retryNum, maxSendRetries)
		}

		// Increase delay for next retry
		retryDelay := time.Second
		retryDelay = time.Duration(float64(retryDelay) * float64(retryNum))

		// But don't let it exceed maxRetryDelay
		if retryDelay > maxRetryDelay {
			retryDelay = maxRetryDelay
		}

		llog.Warnf("Retrying send for worker id '%d' (retry %d, retryDelay %s)", workerID, retryNum, retryDelay)

		time.Sleep(retryDelay)
	}

	if err := p.send(workerID, data); err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return p.sendWithRetry(workerID, data, retryNum+1)
		}
	}

	return nil
}

func (p *Processor) send(workerID int, data []byte) error {
	llog := p.log.With("method", "send", "worker_id", workerID)

	conn, err := p.getConnection(workerID)
	if err != nil {
		llog.Errorf("Failed to get connection: %v", err)
		return errors.Wrap(err, "failed to get connection")
	}

	// Send with a timeout; if timeout is hit, retry sending indefinitely
	if err := conn.SetWriteDeadline(time.Now().Add(sendTimeout)); err != nil {
		return errors.Wrap(err, "failed to set write deadline")
	}

	// Remove the deadline so next conn use doesn't get affected
	defer func() {
		if err := conn.SetWriteDeadline(time.Time{}); err != nil {
			llog.Errorf("Failed to clear write deadline: %v", err)
		}
	}()

	if _, err := conn.Write(append(data, '\n')); err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			llog.Warnf("Timeout ('%s') occurred while sending log line to Logstash", sendTimeout)
			return err
		}

		return errors.Wrap(err, "failed to send log line to Logstash")
	}

	llog.Debug("Sent log line to Logstash")

	return nil
}

func (p *Processor) getConnection(workerID int) (net.Conn, error) {
	llog := p.log.With("method", "getConnection", "worker_id", workerID)
	llog.Debugf("Getting connection for worker id '%d'", workerID)

	p.connsMutex.RLock()
	defer p.connsMutex.RUnlock()

	conn, ok := p.conns[workerID]
	if !ok {
		return nil, errors.New("worker id not found")
	}

	return conn, nil
}

// runConnectionManager is responsible for managing outbound connections to Logstash.
// It will reconnect to Logstash every ReconnectInterval seconds.
func (p *Processor) runConnectionManager() {
	llog := p.log.With("method", "runConnectionManager")
	llog.Debug("Starting")
	defer p.wg.Done()

MAIN:
	for {
		select {
		case <-p.shutdownContext.Done():
			llog.Debug("Detected shutdown")
			break MAIN
		case <-time.After(p.config.LogstashReconnectInterval):
			// Synchronized sender map access
			p.connsMutex.Lock()

			for id, _ := range p.conns {
				llog.Debugf("Recreating connection to logstash for worker id '%d'", id)

				conn, err := p.connectLogstash(p.config.LogstashAddr, false)
				if err != nil {
					llog.Errorf("Failed to connect to Logstash for worker id '%d': %v", id, err)
					continue
				}

				p.conns[id] = conn

				llog.Debugf("Recreated connection to logstash for worker id '%d'", id)
			}

			p.connsMutex.Unlock()
		}
	}

	llog.Debug("Exiting")
}

func (p *Processor) connectLogstash(logStashAddr string, retry bool) (net.Conn, error) {
	llog := p.log.With("method", "connectLogstash")

	var (
		err        error
		conn       net.Conn
		retryCount int
	)

	retryDelay := 2 * time.Second // Initial delay between retries

	// Attempt to reconnect indefinitely unless noRetry is set
	for {
		var d net.Dialer

		llog.Debugf("Attempting to connect to Logstash at '%s' (attempt %d)", logStashAddr, retryCount)

		conn, err = d.DialContext(p.shutdownContext, "tcp", logStashAddr)
		if err == nil {
			retryCount = 0

			return conn, nil // Connection successful
		}

		if errors.Is(err, context.Canceled) {
			return nil, errors.New("shutdown detected")
		}

		if !retry {
			return nil, errors.Wrap(err, "failed to establish connection to Logstash")
		}

		llog.Errorf("Failed to establish connection to Logstash (attempt %d), retrying in '%s': %v", retryCount, retryDelay, err)

		// Wait before retrying
		time.Sleep(retryDelay)

		// Increase delay for next retry
		retryDelay = time.Duration(float64(retryDelay) * 1.5)

		// But don't let it exceed maxRetryDelay
		if retryDelay > maxRetryDelay {
			retryDelay = maxRetryDelay
		}

		retryCount++
	}
}
