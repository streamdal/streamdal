package main

import (
	"fmt"
	"os"

	"github.com/alecthomas/kong"
)

type Config struct {
	Register struct {
		OperationType     int64    `kong:"help='Audience component name (1 = Consumer, 2 = Producer)',enum='1,2',default='1'"`
		OperationName     string   `kong:"help='Audience operation name',required,default='demo-operation'"`
		ComponentName     string   `kong:"help='Audience component name',required,default='demo-component'"`
		NumInstances      int      `kong:"help='Number of instances of SDK to register',required,default='1'"`
		ReconnectRandom   bool     `kong:"help='Randomly disconnects and reconnects to server (useful for testing concurrency in server)',default='false'"`
		ReconnectInterval int      `kong:"help='Seconds between reconnects (rand(0..ReconnectInterval) if ReconnectRandom is true)',default='0'"`
		ConsumerInputType string   `kong:"help='Consumer input type', enum='none,file',default='none'"`
		ConsumerInputFile *os.File `kong:"help='Path to file to use as consumer input'"`
	} `kong:"cmd='register',help='Run client in register mode',xor='register,another'"`

	// Example of a second command
	//Another struct {
	//	ConsumerAudience []string `kong:"help='Consumer audience'"`
	//} `kong:"cmd='another',help='Run client in another mode',xor='register,another'"`

	ServiceName   string `kong:"help='Service name',required,default='demo-client'"`
	SnitchAddress string `kong:"help='Snitch server address',default='localhost:9090',required"`
	SnitchToken   string `kong:"help='Snitch server token',default='1234',required"`
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
		kong.Description("A demo client for snitch"),
		kong.UsageOnError(),
		kong.ConfigureHelp(kong.HelpOptions{
			Compact: true,
			Summary: true,
		}))

	var err error

	switch cfg.Ctx.Command() {
	case "register":
		err = validateRegisterArgs(cfg)
	default:
		err = fmt.Errorf("unknown command: %s", cfg.Ctx.Command())
	}

	if err != nil {
		return nil, err
	}

	return cfg, nil
}

func validateRegisterArgs(cfg *Config) error {
	//// If input tye is file - ensure file was actually provided
	//if cfg.Register.ConsumerInputType == "file" && cfg.Register.ConsumerInputFile == nil {
	//	return fmt.Errorf("consumer input type is 'file' but no file was provided")
	//}

	return nil
}
