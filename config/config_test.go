package config

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Config", func() {

	var (
		cfg *Config
	)

	BeforeEach(func() {
		cfg = New()
	})

	Describe("New", func() {
		Context("when instantiating a new config", func() {
			It("should return new config", func() {
				Expect(cfg).ToNot(BeNil())
			})
		})
	})
})
