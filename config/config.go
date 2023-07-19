package config

import (
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

	KongContext *kong.Context `kong:"-"`
	// Need this because we are unable to access kong's vars
	VersionStr string `kong:"-"`
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

	cfg.VersionStr = version

	return cfg
}
