package snitch

import (
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestSnitchGoClient(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "SnitchGoClient Suite")
}
