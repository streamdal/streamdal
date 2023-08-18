package wasm

import (
	"os"
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
		mapping, err := Load(tc.name, "../assets/wasm")
		if err == nil && tc.shouldError {
			t.Errorf("Load(%s) should have errored", tc.name)
		}

		if err != nil && !tc.shouldError {
			t.Errorf("Load(%s) should NOT have errored: %s", tc.name, err)
		}

		if !tc.shouldError && mapping == nil {
			t.Errorf("Load(%s) should NOT have returned nil", tc.name)
		}
	}
}

func TestDeterminativeUUID(t *testing.T) {
	fileData, err := os.ReadFile("../assets/wasm/detective_0_0_1.wasm")
	if err != nil {
		t.Errorf("unable to read file: %s", err)
	}

	uuid := determinativeUUID(fileData)
	if uuid != "936ab63d-df15-c06e-c1de-db56c0b97e57" {
		t.Errorf("incorrect UUID: %s", uuid)
	}
}
