package kv

import (
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestKv(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Kv Suite")
}
