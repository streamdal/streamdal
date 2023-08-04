package wasm

import (
	"os"

	"github.com/pkg/errors"
)

type Mapping struct {
	Filename string
	FuncName string
	Contents []byte // Filled out by Load
}

var (
	Config = map[string]Mapping{
		"detective": {
			Filename: "detective_0_0_1.wasm",
			FuncName: "f",
		},
		"transform": {
			Filename: "transform_0_0_1.wasm",
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

	// TODO: Testing

	return &Mapping{
		Filename: mapping.Filename,
		FuncName: mapping.FuncName,
		Contents: data,
	}, nil
}
