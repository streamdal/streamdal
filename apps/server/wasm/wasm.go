package wasm

import (
	"crypto/sha256"
	"os"

	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
)

var (
	Config = map[string]*protos.Wasm{
		"detective": {
			Name:     "detective",
			Filename: "detective.wasm",
			Function: "f",
			Bundled:  true,
		},
		"transform": {
			Name:     "transform",
			Filename: ""
			Filename: "transform.wasm",
			FuncName: "f",
		},
		"httprequest": {
			Filename: "httprequest.wasm",
			FuncName: "f",
		},
		"kv": {
			Filename: "kv.wasm",
			FuncName: "f",
		},
		"inferschema": {
			Filename: "inferschema.wasm",
			FuncName: "f",
		},
		"validjson": {
			Filename: "validjson.wasm",
			FuncName: "f",
		},
		"schemavalidation": {
			Filename: "schemavalidation.wasm",
			FuncName: "f",
		},
	}
)

func New()

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

func IsBundled(id ...string) bool {
	if len(id) == 0 {
		return false
	}

}

func determinativeUUID(data []byte) string {
	hash := sha256.Sum256(data)

	id, err := uuid.FromBytes(hash[16:])
	if err != nil {
		return ""
	}

	return id.String()
}
