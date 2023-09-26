package wasm

import (
	"crypto/sha256"
	"os"

	"github.com/gofrs/uuid"

	"github.com/pkg/errors"
)

type Mapping struct {
	ID       string
	Filename string
	FuncName string
	Contents []byte // Filled out by Load
}

var (
	Config = map[string]Mapping{
		"detective": {
			Filename: "detective_0_0_5.wasm",
			FuncName: "f",
		},
		"transform": {
			Filename: "transform_0_0_5.wasm",
			FuncName: "f",
		},
		"httprequest": {
			Filename: "httprequest_0_0_5.wasm",
			FuncName: "f",
		},
		"kv": {
			Filename: "kv_0_0_5.wasm",
			FuncName: "f",
		},
		"inferschema": {
			Filename: "inferschema_0_0_5.wasm",
			FuncName: "f",
		},
	}
)

// Load loads a WASM file from disk; you can pass an optional prefix
func Load(name string, prefix ...string) (*Mapping, error) {
	mapping, ok := Config[name]
	if !ok {
		return nil, errors.Errorf("wasm mapping '%s' not found", name)
	}

	fullPath := mapping.Filename

	if len(prefix) > 0 {
		fullPath = prefix[0] + "/" + fullPath
	}

	// Attempt to read data
	data, err := os.ReadFile(fullPath)
	if err != nil {
		return nil, errors.Wrapf(err, "unable to read wasm file '%s'", fullPath)
	}

	// Generate ID
	wasmID := determinativeUUID(data)
	if wasmID == "" {
		return nil, errors.Errorf("unable to generate UUID for wasm file '%s'", fullPath)
	}

	return &Mapping{
		ID:       wasmID,
		Filename: mapping.Filename,
		FuncName: mapping.FuncName,
		Contents: data,
	}, nil
}

func determinativeUUID(data []byte) string {
	hash := sha256.Sum256(data)

	id, err := uuid.FromBytes(hash[16:])
	if err != nil {
		return ""
	}

	return id.String()
}
