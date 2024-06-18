package streamdal

import (
	"os"
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

// Allow specifying the directory where the WASM files are located
// so that these tests can be reused in for CI during PRs for libs/wasm/*
// This is necessary since some problems are not visible when running rust
// code directly, but are when running via WASM
var WasmDir = os.Getenv("WASM_DIR")

func TestStreamdalGoSDK(t *testing.T) {
	RegisterFailHandler(Fail)

	BeforeSuite(func() {
		if WasmDir == "" {
			WasmDir = "test-assets/wasm"
		}
	})

	RunSpecs(t, "StreamdalGoSDK Suite")
}
