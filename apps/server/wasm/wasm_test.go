package wasm

import (
	"crypto/sha256"
	"os"
	"testing"

	"github.com/gofrs/uuid"
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
	fileData, err := os.ReadFile("../assets/wasm/detective.wasm")
	if err != nil {
		t.Errorf("unable to read file: %s", err)
	}

	hash := sha256.Sum256(fileData)
	id, err := uuid.FromBytes(hash[16:])
	if err != nil {
		t.Errorf("unable to create UUID from hash: %s", err)
	}

	generatedUUID := determinativeUUID(fileData)
	if generatedUUID != id.String() {
		t.Errorf("incorrect UUID: expected '%s' to equal '%s'", generatedUUID, id.String())
	}
}
