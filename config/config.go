package config

import (
	"runtime"
	"time"

	"github.com/alecthomas/kong"
	"github.com/cactus/go-statsd-client/v5/statsd"
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
	TelemetryDisable  bool             `help:"Disable sending usage analytics to Streamdal" default:"false"`
	TelemetryAddress  string           `help:"Address to send telemetry to" default:"telemetry.streamdal.com:8125" hidden:"true"`
	TelemetryPrefix   string           `help:"Prefix to use for telemetry" default:"server" hidden:"true"`

	InstallID   string        `kong:"-"`
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

	// Get/Set installID
	cfg.InstallID = cfg.GetInstallID()

	return cfg
}

func (c *Config) GetVersion() string {
	if ver, ok := c.KongContext.Model.Vars()["version"]; ok {
		return ver
	}

	return "unknown"
}

func (c *Config) GetStatsdTags() []statsd.Tag {
	return []statsd.Tag{
		{"install_id", c.InstallID},
		{"os", runtime.GOOS},
		{"arch", runtime.GOARCH},
		{"version", c.GetVersion()},
	}
}
