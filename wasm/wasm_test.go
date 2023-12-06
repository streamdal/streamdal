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
	fileData, err := os.ReadFile("../assets/wasm/detective_0_0_12.wasm")
	if err != nil {
		t.Errorf("unable to read file: %s", err)
	}

	uuid := determinativeUUID(fileData)
	if uuid != "e64869d6-b909-2a7e-fe4f-d6c0d3191bbd" {
		t.Errorf("incorrect UUID: %s", uuid)
	}
}
