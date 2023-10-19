package streamdal

import (
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestStreamdalGoClient(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "StreamdalGoClient Suite")
}
