package config

import (
	"time"

	"github.com/alecthomas/kong"
	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"
	"github.com/pkg/errors"
)

const (
	EnvFile         = ".env"
	EnvConfigPrefix = "STREAMDAL_LOG_PROCESSOR"
)

type Config struct {
	Version                   kong.VersionFlag `help:"Show version and exit" short:"v" env:"-"`
	APIListenAddress          string           `kong:"default=':9100',help='API listen address (serves health, metrics, version).'"`
	LogstashAddr              string           `kong:"default=':6001',help='Address of the logstash server to forward logs to.'"`
	LogstashListenAddr        string           `kong:"default=':6000',help='Address to listen on for TCP requests (from Logstash).'"`
	LogstashReconnectInterval time.Duration    `kong:"default='60s',help='The interval to wait before reconnecting to logstash.'"`
	StreamdalServerAddress    string           `kong:"default=':8082',help='Streamdal server grpc API address'"`
	StreamdalServerToken      string           `kong:"default='1234',help='Token used for authenticating with Streamdal server'"`
	StreamdalServiceName      string           `kong:"default='log-processor',help='Name of the service to use when registering with streamdal'"`
	NumSenders                int              `kong:"default='1',help='Number of concurrent senders to use when sending logs to logstash.'"`
	NumProcessors             int              `kong:"default='1',help='Number of concurrent processors to use when processing logs.'"`
	FilePathAware             bool             `kong:"default='false',help='Enables or disables file path awareness in the log processor.'"`
	ProcessBufferSize         int              `kong:"default='100',help='Size of the process buffer.'"`
	SendBufferSize            int              `kong:"default='100',help='Size of the send buffer.'"`
	Debug                     bool             `kong:"default='false',help='Enable debug logging.'"`
	LogLevel                  string           `kong:"default='INFO',help='Log level to use.',enum='DEBUG,INFO,WARN,ERROR,FATAL,PANIC,TRACE'"`

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

	if c.LogstashListenAddr == "" {
		return errors.New("LogstashListenAddr cannot be empty")
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
