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
	Auth              string           `help:"Authentication token used for communicating with server" short:"a" default:"1234"`
	Server            string           `help:"Streamdal server URL (gRPC)" default:"localhost:8082"`
	EnableFileLogging bool             `help:"Enable file logging" default:"false"`
	LogFile           string           `help:"Log file" default:"./streamdal-cli.log"`
	ConnectTimeout    time.Duration    `help:"Initial gRPC connection timeout in seconds" default:"5s"`
	DisableTLS        bool             `help:"Disable TLS" default:"false"`
	TelemetryDisable  bool             `help:"Disable sending usage analytics to Streamdal" default:"false"`
	TelemetryAddress  string           `help:"Address to send telemetry to" default:"telemetry.streamdal.com:8125" hidden:"true"`

	CLI struct {
		MaxOutputLines int `help:"Maximum number of output lines" default:"5000"`
	} `cmd:"cli" help:"Interactive CLI"`

	Manage struct {
		Create struct {
			Pipeline struct {
				JSON string `name:"json" help:"Pipeline JSON file" type:"path" required:"true"`
			} `cmd:"pipeline" help:"Create a new pipeline"`

			Wasm struct {
				File              string `help:"Wasm module file" type:"path" required:"true"`
				Name              string `help:"Wasm module name" required:"true"`
				Function          string `help:"Wasm module entry function name" required:"true"`
				ModuleVersion     string `help:"Wasm module version"`
				ModuleDescription string `help:"Wasm module description"`
				ModuleURL         string `help:"Wasm module URL"`
			} `cmd:"wasm" help:"Create a custom Wasm module"`
		} `cmd:"create" help:"Create resources"`

		Get struct {
			Pipeline struct {
				ID string `help:"Pipeline ID (do not specify to list all)"`
			} `cmd:"pipeline" help:"List pipeline(s)"`

			Wasm struct {
				ID string `help:"Wasm module ID (do not specify to list all)"`
			} `cmd:"wasm" help:"List custom Wasm module(s)"`
		} `cmd:"get" help:"Get resources"`

		Delete struct {
			Pipeline struct {
				ID string `help:"Pipeline ID" required:"true"`
			} `cmd:"pipeline" help:"Delete pipeline(s)"`

			Wasm struct {
				ID string `help:"Wasm module ID" required:"true"`
			} `cmd:"wasm" help:"Delete custom Wasm module(s)"`
		} `cmd:"delete" help:"Delete resources"`
	} `cmd:"manage" help:"Use manage to create, get, or delete resources in Streamdal server"`

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
		kong.ShortUsageOnError(),
		kong.ConfigureHelp(kong.HelpOptions{
			Compact:             true,
			NoExpandSubcommands: true,
		}),
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
