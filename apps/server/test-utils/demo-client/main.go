package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	// Attempt to load .env
	_ = godotenv.Load(".env")

	cfg, err := ParseArgs()
	if err != nil {
		fmt.Println("ERROR: ", err)
		os.Exit(1)
	}

	if cfg.Debug {
		logrus.Info("debug mode enabled")
		logrus.SetLevel(logrus.DebugLevel)
	}

	displayConfig(cfg)

	if err := Run(cfg); err != nil {
		fmt.Println("ERROR: ", err)
		os.Exit(1)
	}
}

func displayConfig(cfg *Config) {
	if cfg == nil {
		return
	}

	logrus.Info("demo client settings:")
	logrus.Infof("  server address     : %s", cfg.ServerAddress)
	logrus.Infof("  server token       : %s", cfg.ServerToken)
	logrus.Infof("  service name       : %s", cfg.ServiceName)
	logrus.Infof("  operation type     : %d", cfg.OperationType)
	logrus.Infof("  operation name     : %s", cfg.OperationName)
	logrus.Infof("  component name     : %s", cfg.ComponentName)
	logrus.Infof("  async              : %t", cfg.Async)
	logrus.Infof("  sampling rate      : %d", cfg.SamplingRate)
	logrus.Infof("  num instances      : %d", cfg.NumInstances)
	logrus.Infof("  inject logger      : %t", cfg.InjectLogger)
	logrus.Infof("  reconnect random   : %t", cfg.ReconnectRandom)
	logrus.Infof("  reconnect interval : %d", cfg.ReconnectInterval)
	logrus.Infof("  message rate       : %v", cfg.MessageRate)
	logrus.Infof("  data source type   : %s", cfg.DataSourceType)
	logrus.Infof("  data source file   : %s", cfg.DataSourceFile.Name())
	logrus.Infof("  output level       : %d", cfg.OutputLevel)
	logrus.Infof("  output type        : %s", cfg.OutputType)
	logrus.Infof("  debug              : %t", cfg.Debug)
}
