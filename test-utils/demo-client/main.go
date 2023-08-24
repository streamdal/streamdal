package main

import (
	"fmt"
	"os"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func main() {
	cfg, err := ParseArgs()
	if err != nil {
		fmt.Println("ERROR: ", err)
		os.Exit(1)
	}

	if cfg.Debug {
		fmt.Println("Set debug level")
		logrus.SetLevel(logrus.DebugLevel)
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
