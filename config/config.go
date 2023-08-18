package config

import (
	"time"

	"github.com/alecthomas/kong"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

const (
	EnvFile         = ".env"
	EnvConfigPrefix = "SNITCH_SERVER"
)

type Config struct {
	Version               kong.VersionFlag `help:"Show version and exit" short:"v" env:"-"`
	Debug                 bool             `help:"Enable debug logging" short:"d" default:"false"`
	NodeName              string           `help:"Name for this node" required:"true" help:"Node name (must be unique in cluster)" short:"n"`
	AuthToken             string           `help:"Authentication token" required:"true" short:"t"`
	HTTPAPIListenAddress  string           `help:"HTTP API listen address" default:":8080"`
	GRPCAPIListenAddress  string           `help:"gRPC API listen address" default:":9090"`
	NATSURL               []string         `help:"Address for NATS cluster used by snitch-server" default:"localhost:4222"`
	NATSUseTLS            bool             `help:"Whether to use TLS for NATS" default:"false"`
	NATSTLSSkipVerify     bool             `help:"Whether to skip TLS verification" default:"false"`
	NATSTLSCertFile       string           `help:"TLS cert file"`
	NATSTLSKeyFile        string           `help:"TLS key file"`
	NATSTLSCaFile         string           `help:"TLS ca file"`
	NATSNumBucketReplicas int              `help:"Number of replicas NATS K/V buckets should use" default:"1"`
	HealthFreqSec         int              `help:"How often to perform health checks on dependencies" default:"60"`
	SessionTTL            time.Duration    `help:"TTL for session keys in NATS live K/V bucket" default:"5s"`
	WASMDir               string           `help:"Directory where WASM files are stored" default:"./assets/wasm"`
	Seed                  bool             `help:"Seed NATS with initial data" default:"false"`

	KongContext *kong.Context `kong:"-"`
}

func New(version string) *Config {
	logrus.WithField("filename", EnvFile).Debug("loading env file")

	if err := godotenv.Load(EnvFile); err != nil {
		logrus.WithFields(logrus.Fields{
			"filename": EnvFile,
			"err":      err.Error(),
		}).Debug("unable to load dotenv file")
	}

	cfg := &Config{}
	cfg.KongContext = kong.Parse(cfg,
		kong.Name("snitch-server"),
		kong.Description("Server component in the snitch ecosystem"),
		kong.DefaultEnvars(EnvConfigPrefix),
		kong.Vars{
			"version": version,
		},
	)

	if cfg.SessionTTL < time.Second || cfg.SessionTTL > time.Minute {
		logrus.WithField("ttl", cfg.SessionTTL).Fatal("invalid SessionTTL; value must be between 1s and 1m")
	}

	return cfg
}

func (c *Config) GetVersion() string {
	if ver, ok := c.KongContext.Model.Vars()["version"]; ok {
		return ver
	}

	// If we ever get here, something with CLI/env var parsing is wrong
	return "unknown"
}
