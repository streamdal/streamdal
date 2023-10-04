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
	Version              kong.VersionFlag `help:"Show version and exit" short:"v" env:"-"`
	Debug                bool             `help:"Enable debug logging" short:"d" default:"false"`
	NodeName             string           `help:"Name for this node" required:"true" help:"Node name (must be unique in cluster)" short:"n"`
	AuthToken            string           `help:"Authentication token" required:"true" short:"t"`
	HTTPAPIListenAddress string           `help:"HTTP API listen address" default:":8080"`
	GRPCAPIListenAddress string           `help:"gRPC API listen address" default:":9090"`
	RedisURL             string           `help:"Address for Redis cluster used by snitch-server" default:"localhost:6379"`
	RedisDatabase        int              `help:"Redis database number to use" default:"0"`
	RedisPassword        string           `help:"Redis password" default:""`
	HealthFreqSec        int              `help:"How often to perform health checks on dependencies" default:"60"`
	SessionTTL           time.Duration    `help:"TTL for session keys in RedisBackend live K/V bucket" default:"5s"`
	WASMDir              string           `help:"Directory where WASM files are stored" default:"./assets/wasm"`
	SeedDummyData        bool             `help:"Seed RedisBackend with dummy data for testing" default:"false"`
	NumTailWorkers       int              `help:"Number of tail workers to run" default:"4"`
	NumBroadcastWorkers  int              `help:"Number of broadcast workers to run" default:"4"`

	// TODO: remove default for release
	AesKey string `help:"AES256 encryption key to encrypt notification configs at rest" default:"D4BEC3EA5794EE0F38B21B9D4EC69F17F295C62618AB7F2C74814190F1F41ACC"`

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
