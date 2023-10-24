package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	// Attempt to load .env
	_ = godotenv.Load(".env")

	cfg, err := ParseArgs()
	if err != nil {
		fmt.Println("ERROR: ", err)
		os.Exit(1)
	}

	if cfg.Debug {
		fmt.Println("We are setting debug mode")
		logrus.SetLevel(logrus.DebugLevel)
	}

	if err := Run(cfg); err != nil {
		fmt.Println("ERROR: ", err)
		os.Exit(1)
	}
}
