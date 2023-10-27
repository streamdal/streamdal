package telemetry

import "context"

type DummyTelemetry struct {
}

func (d *DummyTelemetry) Emit(_ context.Context, _ map[string]string) error {
	return nil
}
