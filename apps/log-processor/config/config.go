package config

import (
	"time"

	"github.com/alecthomas/kong"
	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"
	"github.com/pkg/errors"
)

const (
	Version         = "0.0.0"
	EnvFile         = ".env"
	EnvConfigPrefix = "STREAMDAL_LOG_PROCESSOR"
)

type Config struct {
	Version                   kong.VersionFlag `help:"Show version and exit" short:"v" env:"-"`
	ListenAddr                string           `kong:"default=':6000',help='The address to listen on for TCP requests; address that Logstash will connect to.'"`
	LogstashAddr              string           `kong:"default=':6001',help='The address of the logstash server to forward logs to.'"`
	LogstashReconnectInterval time.Duration    `kong:"default='60s',help='The interval to wait before reconnecting to logstash.'"`
	StreamdalServerAddress    string           `kong:"default=':8082',help='Streamdal server grpc address'"`
	StreamdalServerToken      string           `kong:"default='1234',help='The token to use to authenticate with the streamdal server'"`
	StreamdalServiceName      string           `kong:"default='log-processor',help='The name of the service to use when registering with streamdal'"`
	NumSenders                int              `kong:"default='1',help='The number of concurrent senders to use when sending logs to logstash.'"`
	NumProcessors             int              `kong:"default='1',help='The number of concurrent processors to use when processing logs.'"`
	FilePathAware             bool             `kong:"default='false',help='Enables or disables file path awareness in the log processor.'"`
	ProcessBufferSize         int              `kong:"default='100',help='The size of the process buffer.'"`
	SendBufferSize            int              `kong:"default='100',help='The size of the send buffer.'"`
	Debug                     bool             `kong:"default='false',help='Enable debug logging.'"`

	KongContext *kong.Context `kong:"-"`
}

func New(version string) *Config {
	if err := godotenv.Load(EnvFile); err != nil {
		log.Debug("unable to load dotenv file", "err", err.Error(), "filename", EnvFile)
	}

	cfg := &Config{}
	cfg.KongContext = kong.Parse(cfg,
		kong.Name("log-processor"),
		kong.Description("Streamdal log processor integration for Logstash"),
		kong.DefaultEnvars(EnvConfigPrefix),
		kong.ConfigureHelp(kong.HelpOptions{
			Compact:             true,
			NoExpandSubcommands: true,
		}),
		kong.Vars{
			"version": version,
		},
	)

	return cfg
}

func (c *Config) Validate() error {
	if c == nil {
		return errors.New("Config cannot be nil")
	}

	if c.LogstashAddr == "" {
		return errors.New("LogStashAddr cannot be empty")
	}

	if c.ListenAddr == "" {
		return errors.New("ListenAddr cannot be empty")
	}

	if c.StreamdalServerAddress == "" {
		return errors.New("StreamdalServerAddress cannot be empty")
	}

	if c.StreamdalServerToken == "" {
		return errors.New("StreamdalServerToken cannot be empty")
	}

	if c.StreamdalServiceName == "" {
		return errors.New("StreamdalServiceName cannot be empty")
	}

	// TODO: Validate address format

	return nil
}
