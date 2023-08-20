package main

import (
	"fmt"
	"os"

	"github.com/pkg/errors"
)

func main() {
	cfg, err := ParseArgs()
	if err != nil {
		fmt.Println("ERROR: ", err)
		os.Exit(1)
	}

	switch cfg.Ctx.Command() {
	case "register":
		err = runRegister(cfg)
	case "another":
		err = runAnother(cfg)
	}

	if err != nil {
		fmt.Println("ERROR: ", err)
		os.Exit(1)
	}
}

func runAnother(cfg *Config) error {
	return errors.New("not implemented")
}
