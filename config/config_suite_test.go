package config

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/sirupsen/logrus"
)

func TestConfigSuite(t *testing.T) {
	// reduce the noise when testing
	logrus.SetLevel(logrus.FatalLevel)

	RegisterFailHandler(Fail)
	RunSpecs(t, "Config Suite")
}
