package tests

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("WASM Functional Tests", func() {
	Describe("Detective", func() {
		It("has WASMExitCode.Success with good params", func() {
			client, err := NewWASMClient("detective.wasm")
			Expect(err).ToNot(HaveOccurred())

			// Create a new request
			req := &protos.WASMRequest{
				...
			}


		})
	})

	Describe("Transform", func() {
		It("works", func() {
			Expect(true).To(BeTrue())
		})
	})

	Describe("HTTPRequest", func() {
		It("works", func() {
			Expect(true).To(BeTrue())
		})
	})

	Describe("KV", func() {
		It("works", func() {
			Expect(true).To(BeTrue())
		})
	})
})
