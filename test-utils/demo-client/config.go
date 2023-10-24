package main

import (
	"fmt"
	"os"

	"github.com/alecthomas/kong"
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
	DataSourceType    string   `kong:"help='Type of data source this client will use', enum='none,file',default='none'"`
	DataSourceFile    *os.File `kong:"help='File that contains sample data - used only when DataSourceType=file'"`

	ServerAddress string `kong:"help='Streamdal server address',default='localhost:9090',required"`
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

	fmt.Println("cfg.Debug: ", cfg.Debug)
	fmt.Println("cfg.ServerToken: ", cfg.ServerToken)

	return cfg, nil
}
