package telemetry

import (
	"time"

	"github.com/cactus/go-statsd-client/v5/statsd"
)

type DummyTelemetry struct {
}

func (d *DummyTelemetry) NewSubStatter(s string) statsd.SubStatter {
	return nil
}

func (d *DummyTelemetry) SetPrefix(s string) {
	//
}

func (d *DummyTelemetry) Close() error {
	return nil
}

func (d *DummyTelemetry) Inc(string, int64, float32, ...statsd.Tag) error {
	return nil
}

func (d *DummyTelemetry) Dec(string, int64, float32, ...statsd.Tag) error {
	return nil
}
func (d *DummyTelemetry) Gauge(string, int64, float32, ...statsd.Tag) error {
	return nil
}
func (d *DummyTelemetry) GaugeDelta(string, int64, float32, ...statsd.Tag) error {
	return nil
}
func (d *DummyTelemetry) Timing(string, int64, float32, ...statsd.Tag) error {
	return nil
}
func (d *DummyTelemetry) TimingDuration(string, time.Duration, float32, ...statsd.Tag) error {
	return nil
}
func (d *DummyTelemetry) Set(string, string, float32, ...statsd.Tag) error {
	return nil
}
func (d *DummyTelemetry) SetInt(string, int64, float32, ...statsd.Tag) error {
	return nil
}
func (d *DummyTelemetry) Raw(string, string, float32, ...statsd.Tag) error {
	return nil
}
