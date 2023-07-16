package config

import (
	"fmt"

	"github.com/kelseyhightower/envconfig"
)

const (
	EnvConfigPrefix = "SNITCH_SERVER"
)

type Config struct {
	HealthFreqSec int    `envconfig:"HEALTH_FREQ_SEC" default:"60"`
	EnvName       string `envconfig:"ENV_NAME" default:"local"`
	ServiceName   string `envconfig:"SERVICE_NAME" default:"snitch-server"`

	AuthToken            string `envconfig:"AUTH_TOKEN" required:"true"`
	HTTPAPIListenAddress string `envconfig:"HTTP_API_LISTEN_ADDRESS" default:":8080"`
	GRPCAPIListenAddress string `envconfig:"GRPC_API_LISTEN_ADDRESS" default:":9090"`

	NATSURL               []string `envconfig:"NATS_URL" default:"localhost:4222"`
	NATSUseTLS            bool     `envconfig:"NATS_USE_TLS" default:"false"`
	NATSTLSSkipVerify     bool     `envconfig:"NATS_TLS_SKIP_VERIFY" default:"false"`
	NATSTLSCertFile       string   `envconfig:"NATS_TLS_CERT_FILE"`
	NATSTLSKeyFile        string   `envconfig:"NATS_TLS_KEY_FILE"`
	NATSTLSCaFile         string   `envconfig:"NATS_TLS_CA_FILE"`
	NATSNumBucketReplicas int      `envconfig:"NATS_NUM_BUCKET_REPLICAS"  default:"1"`
}

func New() *Config {
	return &Config{}
}

func (c *Config) LoadEnvVars() error {
	if err := envconfig.Process(EnvConfigPrefix, c); err != nil {
		return fmt.Errorf("unable to fetch env vars: %s", err)
	}

	return nil
}
