// Copyright (c) 2012-2016 Eli Janssen
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file.

package statsd

import "time"

// Deprecated stuff here...

// NewBufferedClient returns a new BufferedClient
//
// addr is a string of the format "hostname:port", and must be parsable by
// net.ResolveUDPAddr.
//
// prefix is the statsd client prefix. Can be "" if no prefix is desired.
//
// flushInterval is a time.Duration, and specifies the maximum interval for
// packet sending. Note that if you send lots of metrics, you will send more
// often. This is just a maximal threshold.
//
// If flushInterval is 0ms, defaults to 300ms.
//
// flushBytes specifies the maximum udp packet size you wish to send. If adding
// a metric would result in a larger packet than flushBytes, the packet will
// first be send, then the new data will be added to the next packet.
//
// If flushBytes is 0, defaults to 1432 bytes, which is considered safe
// for local traffic. If sending over the public internet, 512 bytes is
// the recommended value.
//
// Deprecated: This interface is "legacy", and it is recommented to migrate to
// using NewClientWithConfig in the future.
func NewBufferedClient(addr, prefix string, flushInterval time.Duration, flushBytes int) (Statter, error) {
	config := &ClientConfig{
		Address:       addr,
		Prefix:        prefix,
		UseBuffered:   true,
		FlushInterval: flushInterval,
		FlushBytes:    flushBytes,
	}
	return NewClientWithConfig(config)
}

// NewClient returns a pointer to a new Client, and an error.
//
// addr is a string of the format "hostname:port", and must be parsable by
// net.ResolveUDPAddr.
//
// prefix is the statsd client prefix. Can be "" if no prefix is desired.
//
// Deprecated: This interface is "legacy", and it is recommented to migrate to
// using NewClientWithConfig in the future.
func NewClient(addr, prefix string) (Statter, error) {
	config := &ClientConfig{
		Address:     addr,
		Prefix:      prefix,
		UseBuffered: false,
	}
	return NewClientWithConfig(config)
}

// Dial is a compatibility alias for NewClient
//
// Deprecated: This interface is "legacy", and it is recommented to migrate to
// using NewClientWithConfig in the future.
var Dial = NewClient

// New is a compatibility alias for NewClient
//
// Deprecated: This interface is "legacy", and it is recommented to migrate to
// using NewClientWithConfig in the future.
var New = NewClient
