package config

import (
	"time"

	"github.com/alecthomas/kong"
	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"
)

const (
	EnvFile         = ".env"
	EnvConfigPrefix = "STREAMDAL_CLI"
)

type Config struct {
	Version           kong.VersionFlag `help:"Show version and exit" short:"v" env:"-"`
	Debug             bool             `help:"Enable debug logging" short:"d" default:"false"`
	Auth              string           `help:"Authentication token" required:"true" short:"a"`
	Server            string           `help:"Streamdal server URL (gRPC)" default:"localhost:8082"`
	ConnectTimeout    time.Duration    `help:"Initial gRPC connection timeout in seconds" default:"5s"`
	DisableTLS        bool             `help:"Disable TLS" default:"false"`
	EnableFileLogging bool             `help:"Enable file logging" default:"false"`
	LogFile           string           `help:"Log file" default:"./streamdal-cli.log"`
	MaxOutputLines    int              `help:"Maximum number of output lines" default:"5000"`

	KongContext *kong.Context `kong:"-"`
}

func New(version string) *Config {
	if err := godotenv.Load(EnvFile); err != nil {
		log.Debug("unable to load dotenv file", "err", err.Error(), "filename", EnvFile)
	}

	cfg := &Config{}
	cfg.KongContext = kong.Parse(cfg,
		kong.Name("streamdal"),
		kong.Description("Streamdal CLI"),
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
