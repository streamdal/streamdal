package main

import (
	"os"

	"github.com/alecthomas/kong"
	"github.com/pkg/errors"
)

const (
	EnvVarPrefix = "STREAMDAL_CLI"
)

type Config struct {
	ServiceName       string   `kong:"help='Service name',required,default='demo-client'"`
	OperationType     int64    `kong:"help='Audience component name (1 = Consumer, 2 = Producer)',enum='1,2',default='1',required"`
	OperationName     string   `kong:"help='Audience operation name',required,default='demo-operation'"`
	ComponentName     string   `kong:"help='Audience component name',required,default='demo-component'"`
	NumInstances      int      `kong:"help='Number of instances of SDK to register',required,default='1'"`
	ReconnectRandom   bool     `kong:"help='Randomly disconnects and reconnects to server (useful for testing concurrency in server)',default='false'"`
	ReconnectInterval int      `kong:"help='Seconds between reconnects (rand(0..ReconnectInterval) if ReconnectRandom is true)',default='0'"`
	MessageRate       []int    `kong:"help='Messages to send per second (can specify range as X,Y)',required,default='1'"`
	DataSourceType    string   `kong:"help='Type of data source this client will use', enum='none,file',default='none'"`
	DataSourceFile    *os.File `kong:"help='File that contains sample data - used only when DataSourceType=file'"`

	ServerAddress string `kong:"help='Streamdal gRPC server address',default='localhost:8082',required"`
	ServerToken   string `kong:"help='Streamdal server token',default='1234',required"`
	Debug         bool   `kong:"help='Enable debug output',short='d'"`
	Quiet         bool   `kong:"help='Disable showing pre/post output',short='q'"`
	InjectLogger  bool   `kong:"help='Inject logger into SDK',default='false'"`

	// Internal bits
	Ctx *kong.Context `kong:"-"`
}

func ParseArgs() (*Config, error) {
	cfg := &Config{}
	cfg.Ctx = kong.Parse(cfg,
		kong.Name("demo-client"),
		kong.Description("A demo client for streamdal go-sdk and server"),
		kong.UsageOnError(),
		kong.DefaultEnvars(EnvVarPrefix),
		kong.ConfigureHelp(kong.HelpOptions{
			Compact: true,
			Summary: true,
		}))

	if err := validateCLIArgs(cfg); err != nil {
		return nil, errors.Wrap(err, "error validating args")
	}

	return cfg, nil
}

func validateCLIArgs(cfg *Config) error {
	if cfg == nil {
		return errors.New("config cannot be nil")
	}

	if cfg.OperationType != 1 && cfg.OperationType != 2 {
		return errors.New("operation type must be 1 or 2")
	}

	// Rates must be larger than 0
	for _, rate := range cfg.MessageRate {
		if rate < 1 {
			return errors.New("rate cannot be less than 1")
		}
	}

	// If we were given a range, make sure it's in ascending order
	if len(cfg.MessageRate) > 1 && cfg.MessageRate[0] > cfg.MessageRate[1] {
		return errors.New("rate[0] cannot be larger than rate[1]")
	}

	return nil
}
