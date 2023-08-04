package wasm

import (
	"testing"
)

func TestLoad(t *testing.T) {
	type TestCase struct {
		name        string
		shouldError bool
	}

	testCases := []TestCase{
		{
			name:        "detective",
			shouldError: false,
		},
		{
			name:        "transform",
			shouldError: false,
		},
		{
			name:        "does-not-exist",
			shouldError: true,
		},
	}

	for _, tc := range testCases {
		mapping, err := Load(tc.name, "./assets/wasm")
		if err == nil && tc.shouldError {
			t.Errorf("Load(%s) should have errored", tc.name)
		}

		if err != nil && !tc.shouldError {
			t.Errorf("Load(%s) should NOT have errored", tc.name)
		}

		if !tc.shouldError && mapping == nil {
			t.Errorf("Load(%s) should NOT have returned nil", tc.name)
		}
	}
}
