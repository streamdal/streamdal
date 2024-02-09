package streamdal

import (
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestStreamdalGoSDK(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "StreamdalGoSDK Suite")
}
