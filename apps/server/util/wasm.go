package util

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/pkg/errors"
)

func PrecompileWasm(wasmData []byte) (map[string][]byte, error) {
	// Print first 20 bytes of wasmData
	fmt.Printf("wasmData: %v\n", string(wasmData[:20]))

	println("PRECOMPILE CALLED")
	// Create temp directory and write wasm data to it
	f, err := os.CreateTemp("", fmt.Sprintf("wasm-%d", time.Now().UnixNano()))
	if _, err = f.Write(wasmData); err != nil {
		return nil, errors.Wrap(err, "unable to create temporary wasm file")
	}
	f.Close()

	// Create temp dir for wazero
	d, err := os.MkdirTemp("", "wazero")
	if err != nil {
		return nil, errors.Wrap(err, "unable to create temporary directory")
	}

	println("f.Name(): ", f.Name())
	println("tmp dir", d)

	// Exec wazero binary compile
	// TODO: figure out where this binary should be for docker
	//println("executing wazero", "/opt/homebrew/bin/wazero", "compile", "-cachedir", d, f.Name())
	output, err := exec.Command("/bin/wazero", "compile", "-cachedir", d, f.Name()).CombinedOutput()
	if err != nil {
		return nil, errors.Wrapf(err, "unable to pre-compile wasm file '%s': '%s'", f.Name(), string(output))
	}

	// TODO: do we even need output?
	_ = output

	// Find compiled data somewhere inside temp dir
	matches, err := filepath.Glob(filepath.Join(d, "**/*"))
	if err != nil {
		return nil, errors.Wrap(err, "unable to find compiled wasm directory")
	}

	precompiled := map[string][]byte{}

	for _, match := range matches {
		data, err := os.ReadFile(match)
		if err != nil {
			return nil, errors.Wrap(err, "unable to read compiled wasm")
		}

		// match is this format ./wazero-1.7.2-arm64-darwin/f075f2716ee05741e581b6e3baaf4bdfc636282384c3083e73e2e74736e04d30
		// Need to parse out the directory name and the file name
		fp := filepath.Dir(match)
		precompiled[fp] = data

		return precompiled, nil
	}

	return nil, errors.New("unable to find compiled wasm file")
}
