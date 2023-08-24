package main

import (
	"fmt"
	"os"
	"regexp"
	"strings"

	"github.com/alecthomas/kong"
)

var (
	ValidNameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
)

type Config struct {
	Register struct {
		OperationType     int64    `kong:"help='Audience component name (1 = Consumer, 2 = Producer)',enum='1,2',default='1'"`
		OperationName     string   `kong:"help='Audience operation name',required,default='demo-operation'"`
		ComponentName     string   `kong:"help='Audience component name',required,default='demo-component'"`
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
	// Replace spaces with underscores
	cfg.Register.OperationName = strings.Replace(cfg.Register.OperationName, " ", "_", -1)
	cfg.Register.ComponentName = strings.Replace(cfg.Register.ComponentName, " ", "_", -1)

	// Are either valid?
	if !ValidNameRegex.MatchString(cfg.Register.OperationName) {
		return fmt.Errorf("invalid operation name (re: /^[a-zA-Z0-9_-]+$/): %s", cfg.Register.OperationName)
	}

	if !ValidNameRegex.MatchString(cfg.Register.ComponentName) {
		return fmt.Errorf("invalid component name (re: /^[a-zA-Z0-9_-]+$/): %s", cfg.Register.ComponentName)
	}

	//// If input tye is file - ensure file was actually provided
	//if cfg.Register.ConsumerInputType == "file" && cfg.Register.ConsumerInputFile == nil {
	//	return fmt.Errorf("consumer input type is 'file' but no file was provided")
	//}

	return nil
}
