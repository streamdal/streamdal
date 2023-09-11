package tests

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/sirupsen/logrus"
)

func TestGrpcSuite(t *testing.T) {
	logrus.SetLevel(logrus.FatalLevel)

	RegisterFailHandler(Fail)
	RunSpecs(t, "WASM Functional Test Suite")
}
