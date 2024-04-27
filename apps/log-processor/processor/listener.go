package processor

import (
	"bufio"
	"net"
	"time"

	"github.com/pkg/errors"
)

func (p *Processor) startListeners() error {
	llog := p.log.With("method", "startListeners")

	errCh := make(chan error, p.config.NumProcessors)

	go func() {
		if err := p.runListener(); err != nil {
			llog.Errorf("Failed running listener: %v", err)
			errCh <- errors.Wrap(err, "failed running listener")
		}
	}()

	// Listen for errors for 1 second
	timeAfterCh := time.After(time.Second)

	select {
	case <-timeAfterCh:
		return nil
	case err := <-errCh:
		return errors.Wrap(err, "error during listener startup")
	}
}

func (p *Processor) setLogstashConn(workerID int, conn net.Conn) {
	p.connsMutex.Lock()
	defer p.connsMutex.Unlock()

	p.conns[workerID] = conn
}

func (p *Processor) runListener() error {
	llog := p.log.With("method", "runListener")

	listener, err := net.Listen("tcp", p.config.ListenAddr)
	if err != nil {
		return errors.Wrapf(err, "failed to listen to listen to '%s'", p.config.ListenAddr)
	}

	defer listener.Close()

	for {
		conn, err := listener.Accept()
		if err != nil {
			if p.shutdownContext.Err() != nil {
				// Error is due to listener getting closed while shutting down
				break
			}

			llog.Errorf("Failed to accept connection: %v", err)
			continue
		}

		go p.handleConnection(conn)
	}

	llog.Debug("Exiting")

	return nil
}

func (p *Processor) handleConnection(conn net.Conn) {
	llog := p.log.With(
		"method", "handleConnection",
		"remote_addr", conn.RemoteAddr().String(),
	)

	llog.Debugf("New incoming connection from '%s'", conn.RemoteAddr().String())

	defer conn.Close()

	scanner := bufio.NewScanner(conn)

	// TODO: Is there some built-in way to do scans with a ctx?
	for scanner.Scan() {
		select {
		case <-p.shutdownContext.Done():
			break
		default:
			// Continue
		}

		line := scanner.Text()
		if line == "" {
			llog.Debug("received empty line; skipping")
			continue
		}

		p.processCh <- []byte(line)
	}

	if err := scanner.Err(); err != nil {
		llog.Errorf("Error reading from %s: %v", conn.RemoteAddr().String(), err)
	}

	llog.Debugf("Exiting connection handler for '%s'", conn.RemoteAddr().String())
}
