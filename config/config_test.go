package config

import (
	"os"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Config", func() {

	var (
		cfg         *Config
		testVersion = "1.0.1"
	)

	BeforeEach(func() {
		// Node name needs to be set
		os.Setenv("SNITCH_SERVER_NODE_NAME", "testName")

		cfg = New(testVersion)
	})

	Describe("New", func() {
		Context("when instantiating a new config", func() {
			It("should return new config", func() {
				Expect(cfg).ToNot(BeNil())
			})
		})
	})
})
