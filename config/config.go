package config

import (
	"github.com/alecthomas/kong"
	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"
)

const (
	EnvFile         = ".env"
	EnvConfigPrefix = "SNITCH_CLI"
)

type Config struct {
	Version           kong.VersionFlag `help:"Show version and exit" short:"v" env:"-"`
	Debug             bool             `help:"Enable debug logging" short:"d" default:"false"`
	AuthToken         string           `help:"Authentication token" required:"true" short:"t"`
	SnitchServerURL   string           `help:"Snitch server URL (gRPC)" default:"localhost:9090"`
	EnableFileLogging bool             `help:"Enable file logging" default:"false"`
	LogFile           string           `help:"Log file" default:"./snitch-cli.log"`

	KongContext *kong.Context `kong:"-"`
}

func New(version string) *Config {
	if err := godotenv.Load(EnvFile); err != nil {
		log.Debug("unable to load dotenv file", "err", err.Error(), "filename", EnvFile)
	}

	cfg := &Config{}
	cfg.KongContext = kong.Parse(cfg,
		kong.Name("snitch-cli"),
		kong.Description("Snitch CLI (beta)"),
		kong.DefaultEnvars(EnvConfigPrefix),
		kong.Vars{
			"version": version,
		},
	)

	return cfg
}

func (c *Config) GetVersion() string {
	if ver, ok := c.KongContext.Model.Vars()["version"]; ok {
		return ver
	}

	return "unknown"
}
