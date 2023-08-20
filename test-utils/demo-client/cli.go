package main

import (
	"fmt"
	"os"
	"regexp"

	"github.com/alecthomas/kong"
)

var (
	ValidAudienceRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+$`)
)

type Config struct {
	Register struct {
		ConsumerAudience  []string `kong:"help='One or more consumer audiences (expected format: $consumer_name/$component)'"`
		ConsumerInputType string   `kong:"help='Consumer input type', enum='none,file',default='none'"`
		ConsumerInputFile *os.File `kong:"help='Path to file to use as consumer input'"`
		ProducerAudience  []string `kong:"help='Producer audience'"`
	} `kong:"cmd='register',help='Run client in register mode',xor='register,another'"`

	// Example of a second command
	Another struct {
		ConsumerAudience []string `kong:"help='Consumer audience'"`
	} `kong:"cmd='another',help='Run client in another mode',xor='register,another'"`

	ServiceName   string `kong:"help='Service name',required"`
	SnitchAddress string `kong:"help='Snitch server address',default='localhost:9090'"`
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
	// Validate audiences
	for _, aud := range cfg.Register.ConsumerAudience {
		if !ValidAudienceRegex.MatchString(aud) {
			return fmt.Errorf("invalid consumer audience: %s", aud)
		}
	}

	// If input type is file - ensure file was actually provided
	if cfg.Register.ConsumerInputType == "file" && cfg.Register.ConsumerInputFile == nil {
		return fmt.Errorf("consumer input type is 'file' but no file was provided")
	}

	return nil
}
