package notify_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestNotify(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Notify Suite")
}
