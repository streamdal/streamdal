// Copyright (c) 2012-2016 Eli Janssen
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file.

package statsd

import (
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"time"
)

var bufPool = newBufferPool()

// The StatSender interface wraps all the statsd metric methods
type StatSender interface {
	Inc(string, int64, float32, ...Tag) error
	Dec(string, int64, float32, ...Tag) error
	Gauge(string, int64, float32, ...Tag) error
	GaugeDelta(string, int64, float32, ...Tag) error
	Timing(string, int64, float32, ...Tag) error
	TimingDuration(string, time.Duration, float32, ...Tag) error
	Set(string, string, float32, ...Tag) error
	SetInt(string, int64, float32, ...Tag) error
	Raw(string, string, float32, ...Tag) error
}

// The ExtendedStatSender interface wraps a StatSender and adds some
// methods that may be unsupported by some servers.
type ExtendedStatSender interface {
	StatSender
	GaugeFloat(string, float64, float32, ...Tag) error
	GaugeFloatDelta(string, float64, float32, ...Tag) error
	SetFloat(string, float64, float32, ...Tag) error
}

// The Statter interface defines the behavior of a stat client
type Statter interface {
	StatSender
	NewSubStatter(string) SubStatter
	SetPrefix(string)
	Close() error
}

// The SubStatter interface defines the behavior of a stat child/subclient
type SubStatter interface {
	StatSender
	SetSamplerFunc(SamplerFunc)
	NewSubStatter(string) SubStatter
}

// The SamplerFunc type defines a function that can serve
// as a Client sampler function.
type SamplerFunc func(float32) bool

// DefaultSampler is the default rate sampler function
func DefaultSampler(rate float32) bool {
	if rate < 1 {
		return rand.Float32() < rate
	}
	return true
}

// A Client is a statsd client.
type Client struct {
	// prefix for statsd name
	prefix string
	// packet sender
	sender Sender
	// sampler method
	sampler SamplerFunc
	// tag handler
	tagFormat TagFormat
}

// Close closes the connection and cleans up.
func (s *Client) Close() error {
	if s == nil {
		return nil
	}

	err := s.sender.Close()
	return err
}

// Inc increments a statsd count type.
// stat is a string name for the metric.
// value is the integer value
// rate is the sample rate (0.0 to 1.0)
// tags is a []Tag
func (s *Client) Inc(stat string, value int64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", value, "|c", rate, tags)
}

// Dec decrements a statsd count type.
// stat is a string name for the metric.
// value is the integer value.
// rate is the sample rate (0.0 to 1.0).
func (s *Client) Dec(stat string, value int64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", -value, "|c", rate, tags)
}

// Gauge submits/updates a statsd gauge type.
// stat is a string name for the metric.
// value is the integer value.
// rate is the sample rate (0.0 to 1.0).
func (s *Client) Gauge(stat string, value int64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", value, "|g", rate, tags)
}

// GaugeDelta submits a delta to a statsd gauge.
// stat is the string name for the metric.
// value is the (positive or negative) change.
// rate is the sample rate (0.0 to 1.0).
func (s *Client) GaugeDelta(stat string, value int64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	// if negative, the submit formatter will prefix with a - already
	// so only special case the positive value.
	// don't pull out the prefix here, avoids some tiny amount of stack space by
	// inlining like this. performance
	if value >= 0 {
		return s.submit(stat, "+", value, "|g", rate, tags)
	}
	return s.submit(stat, "", value, "|g", rate, tags)
}

// GaugeFloat submits/updates a float statsd gauge type.
// Note: May not be supported by all servers.
// stat is a string name for the metric.
// value is the float64 value.
// rate is the sample rate (0.0 to 1.0).
func (s *Client) GaugeFloat(stat string, value float64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", value, "|g", rate, tags)
}

// GaugeFloatDelta submits a float delta to a statsd gauge.
// Note: May not be supported by all servers.
// stat is the string name for the metric.
// value is the (positive or negative) change.
// rate is the sample rate (0.0 to 1.0).
func (s *Client) GaugeFloatDelta(stat string, value float64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	// if negative, the submit formatter will prefix with a - already
	// so only special case the positive value
	if value >= 0 {
		return s.submit(stat, "+", value, "|g", rate, tags)
	}
	return s.submit(stat, "", value, "|g", rate, tags)
}

// Timing submits a statsd timing type.
// stat is a string name for the metric.
// delta is the time duration value in milliseconds
// rate is the sample rate (0.0 to 1.0).
func (s *Client) Timing(stat string, delta int64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", delta, "|ms", rate, tags)
}

// TimingDuration submits a statsd timing type.
// stat is a string name for the metric.
// delta is the timing value as time.Duration
// rate is the sample rate (0.0 to 1.0).
func (s *Client) TimingDuration(stat string, delta time.Duration, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	ms := float64(delta) / float64(time.Millisecond)
	return s.submit(stat, "", ms, "|ms", rate, tags)
}

// Set submits a stats set type
// stat is a string name for the metric.
// value is the string value
// rate is the sample rate (0.0 to 1.0).
func (s *Client) Set(stat string, value string, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", value, "|s", rate, tags)
}

// SetInt submits a number as a stats set type.
// stat is a string name for the metric.
// value is the integer value
// rate is the sample rate (0.0 to 1.0).
func (s *Client) SetInt(stat string, value int64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", value, "|s", rate, tags)
}

// SetFloat submits a number as a stats set type.
// Note: May not be supported by all servers.
// stat is a string name for the metric.
// value is the integer value
// rate is the sample rate (0.0 to 1.0).
func (s *Client) SetFloat(stat string, value float64, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", value, "|s", rate, tags)
}

// Raw submits a preformatted value.
// stat is the string name for the metric.
// value is a preformatted "raw" value string.
// rate is the sample rate (0.0 to 1.0).
func (s *Client) Raw(stat string, value string, rate float32, tags ...Tag) error {
	if !s.includeStat(rate) {
		return nil
	}

	return s.submit(stat, "", value, "", rate, tags)
}

// SetSamplerFunc sets a sampler function to something other than the default
// sampler is a function that determines whether the metric is
// to be accepted, or discarded.
// An example use case is for submitted pre-sampled metrics.
func (s *Client) SetSamplerFunc(sampler SamplerFunc) {
	s.sampler = sampler
}

// submit an already sampled raw stat
func (s *Client) submit(stat, vprefix string, value interface{}, suffix string, rate float32, tags []Tag) error {
	skiptags := false
	if len(tags) == 0 {
		skiptags = true
	}

	buf := bufPool.Get()
	defer bufPool.Put(buf)
	// sadly, no way to jam this back into the bytes.Buffer without
	// doing a few allocations... avoiding those is the whole point here...
	// so from here on out just use it as a raw []byte
	data := buf.Bytes()

	if s.prefix != "" {
		data = append(data, s.prefix...)
		data = append(data, '.')
	}

	data = append(data, stat...)

	// infix tags, if present
	if !skiptags && s.tagFormat&AllInfix != 0 {
		data = s.tagFormat.WriteInfix(data, tags)
		// if we did infix already, no suffix also.
		skiptags = true
	}

	data = append(data, ':')

	if vprefix != "" {
		data = append(data, vprefix...)
	}

	switch v := value.(type) {
	case string:
		data = append(data, v...)
	case int64:
		data = strconv.AppendInt(data, v, 10)
	case float64:
		data = strconv.AppendFloat(data, v, 'f', -1, 64)
	default:
		return fmt.Errorf("No matching type format")
	}

	if suffix != "" {
		data = append(data, suffix...)
	}

	if rate < 1 {
		data = append(data, "|@"...)
		data = strconv.AppendFloat(data, float64(rate), 'f', 6, 32)
	}

	// suffix tags if present
	if !skiptags && s.tagFormat&AllSuffix != 0 {
		data = s.tagFormat.WriteSuffix(data, tags)
	}

	_, err := s.sender.Send(data)
	return err
}

// check for nil client, and perform sampling calculation
func (s *Client) includeStat(rate float32) bool {
	if s == nil {
		return false
	}

	// test for nil in case someone builds their own
	// client without calling new (result is nil sampler)
	if s.sampler != nil {
		return s.sampler(rate)
	}
	return DefaultSampler(rate)
}

// SetPrefix sets/updates the statsd client prefix.
// Note: Does not change the prefix of any SubStatters.
func (s *Client) SetPrefix(prefix string) {
	if s == nil {
		return
	}

	s.prefix = prefix
}

// NewSubStatter returns a SubStatter with appended prefix
func (s *Client) NewSubStatter(prefix string) SubStatter {
	var c *Client
	if s != nil {
		c = &Client{
			prefix:    joinPathComp(s.prefix, prefix),
			sender:    s.sender,
			sampler:   s.sampler,
			tagFormat: s.tagFormat,
		}
	}
	return c
}

// joinPathComp is a helper that ensures we combine path components with a dot
// when it's appropriate to do so; prefix is the existing prefix and suffix is
// the new component being added.
//
// It returns the joined prefix.
func joinPathComp(prefix, suffix string) string {
	suffix = strings.TrimLeft(suffix, ".")
	if prefix != "" && suffix != "" {
		return prefix + "." + suffix
	}
	return prefix + suffix
}
