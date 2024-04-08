package wasm_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestWasmService(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Wasm Suite")
}
