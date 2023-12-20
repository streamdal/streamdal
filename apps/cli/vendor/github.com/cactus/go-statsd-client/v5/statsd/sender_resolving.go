// Copyright (c) 2012-2016 Eli Janssen
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file.

package statsd

import (
	"errors"
	"fmt"
	"net"
	"sync"
	"time"
)

// ResolvingSimpleSender provides a socket send interface that re-resolves and
// reconnects.
type ResolvingSimpleSender struct {
	// underlying connection
	conn net.PacketConn
	// resolved udp address
	addrResolved *net.UDPAddr
	// unresolved addr
	addrUnresolved string
	// interval time
	reresolveInterval time.Duration
	// lifecycle
	mx       sync.RWMutex
	doneChan chan struct{}
	running  bool
}

// Send sends the data to the server endpoint.
func (s *ResolvingSimpleSender) Send(data []byte) (int, error) {
	// Note: use manual unlocking instead of defer unlocking,
	// due to the overhead of defers in this hot code path.
	// https://go-review.googlesource.com/c/go/+/190098
	// removes a lot of the overhead (in go versions >= 1.14),
	// but it is still faster to not use it in some cases
	// (like this one).

	s.mx.RLock()
	if !s.running {
		s.mx.RUnlock()
		return 0, fmt.Errorf("ResolvingSimpleSender is not running")
	}

	// no need for locking here, as the underlying fdNet
	// already serialized writes
	n, err := s.conn.(*net.UDPConn).WriteToUDP(data, s.addrResolved)

	s.mx.RUnlock()

	if err != nil {
		return 0, err
	}
	if n == 0 {
		return n, errors.New("Wrote no bytes")
	}
	return n, nil
}

// Close closes the ResolvingSender and cleans up
func (s *ResolvingSimpleSender) Close() error {
	// lock to guard against ra reconnection modification
	s.mx.Lock()
	defer s.mx.Unlock()

	if !s.running {
		return nil
	}

	s.running = false
	close(s.doneChan)

	err := s.conn.Close()
	return err
}

func (s *ResolvingSimpleSender) Reconnect() {
	// Note: use manual unlocking instead of defer unlocking.
	// This is done here because we use a read lock first,
	// read a value safely, then perform an action that doesn't require
	// locking, then acquire a write lock for safe updating.

	// lock to guard against s.running mutation
	s.mx.RLock()

	if !s.running {
		s.mx.RUnlock()
		return
	}

	// get old addr for comparison, then release lock (asap)
	oldAddr := s.addrResolved.String()

	// done with rlock for now
	s.mx.RUnlock()

	// s.addrUnresolved doesn't change, so no do this under read lock
	addrResolved, err := net.ResolveUDPAddr("udp", s.addrUnresolved)

	if err != nil {
		// no good new address.. so continue with old address
		return
	}

	if oldAddr == addrResolved.String() {
		// got same address.. so continue with old address
		return
	}

	// acquire write lock to both guard against s.running having been mutated in the
	// meantime, as well as for safely setting s.ra
	s.mx.Lock()

	// check running again, just to be sure nothing was terminated in the meantime...
	if s.running {
		s.addrResolved = addrResolved
	}
	s.mx.Unlock()
}

// Start Resolving Simple Sender
// Begins ticker and read loop
func (s *ResolvingSimpleSender) Start() {
	// write lock to start running
	s.mx.Lock()
	defer s.mx.Unlock()

	if s.running {
		return
	}

	s.running = true
	go s.run()
}

func (s *ResolvingSimpleSender) run() {
	ticker := time.NewTicker(s.reresolveInterval)
	defer ticker.Stop()

	for {
		select {
		case <-s.doneChan:
			return
		case <-ticker.C:
			// reconnect locks/checks running, so no need to do it here
			s.Reconnect()
		}
	}
}

// NewResolvingSimpleSender returns a new ResolvingSimpleSender for
// sending to the supplied addresss.
//
// addr is a string of the format "hostname:port", and must be parsable by
// net.ResolveUDPAddr.
func NewResolvingSimpleSender(addr string, interval time.Duration) (Sender, error) {
	conn, err := net.ListenPacket("udp", ":0")
	if err != nil {
		return nil, err
	}

	addrResolved, err := net.ResolveUDPAddr("udp", addr)
	if err != nil {
		conn.Close()
		return nil, err
	}

	sender := &ResolvingSimpleSender{
		conn:              conn,
		addrResolved:      addrResolved,
		addrUnresolved:    addr,
		reresolveInterval: interval,
		doneChan:          make(chan struct{}),
		running:           false,
	}

	sender.Start()
	return sender, nil
}
