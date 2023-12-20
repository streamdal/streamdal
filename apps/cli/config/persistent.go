package config

import (
	"encoding/json"
	"io"
	"os"
	"path"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

const (
	// configDir is the name of the directory where the config file will be stored under the user's homedir
	configDir = ".streamdal"

	// configFileName is the name of the config file
	configFileName = "cli_config.json"
)

type configFile struct {
	InstallID string `json:"install_id"`
}

// GetInstallID returns the unique node ID for this running instance of streamdal server
func (c *Config) GetInstallID() string {
	// Check if we already have an install ID stored in ~/.streamdal/cli_config.json
	id := c.getCurrentInstallID()
	if id != "" {
		return id
	}

	// Generate a new UUID
	id = uuid.New().String()

	// Save to config file
	if err := saveInstallID(id); err != nil {
		log.Error(err)
	}

	return id
}

// getCurrentInstallID returns the node ID from either the CLI flag, or an existing config file
// If neither are available, or an error occurs, an empty string will be returned.
// The parent method will generate a fresh ID
func (c *Config) getCurrentInstallID() string {
	// Specified via a flag
	if c.InstallID != "" {
		// Try and parse
		_, err := uuid.Parse(c.InstallID)
		if err != nil {
			// Invalid UUID,  generate a fresh one
			return ""
		}
		return c.InstallID
	}

	// Not specified via a flag, try to load from config file
	if exists(configFileName) {
		// Read config file and unmarshal contents into configFile struct
		data, err := getConfigFile(configFileName)
		if err != nil {
			log.Error(err)
			return ""
		}

		cfg := &configFile{}
		if err := json.Unmarshal(data, cfg); err != nil {
			log.Error(err)
			return ""
		}

		return cfg.InstallID
	}

	return ""

}

func saveInstallID(installID string) error {
	configDir, err := getConfigDir()
	if err != nil {
		return errors.Wrap(err, "unable to locate config directory")
	}
	configPath := path.Join(configDir, configFileName)

	cfg := &configFile{
		InstallID: installID,
	}

	data, err := json.Marshal(cfg)
	if err != nil {
		return errors.Wrap(err, "unable to marshal config file")
	}

	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return errors.Wrap(err, "unable to write config file")
	}

	return nil
}

func getConfigFile(fileName string) ([]byte, error) {
	configDir, err := getConfigDir()
	if err != nil {
		return nil, errors.Wrap(err, "unable to locate config directory")
	}
	configPath := path.Join(configDir, fileName)

	file, err := os.Open(configPath)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open config file")
	}
	defer file.Close()

	fileContents, err := io.ReadAll(file)
	if err != nil {
		return nil, errors.Wrap(err, "unable to read config file")
	}

	return fileContents, nil
}

// Exists determines if a config file exists yet
func exists(fileName string) bool {
	configDir, err := getConfigDir()
	if err != nil {
		return false
	}
	configPath := path.Join(configDir, fileName)

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return false
	}

	return true
}

// getConfigDir returns a directory where the batch configuration will be stored
func getConfigDir() (string, error) {
	// Get user's home directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", errors.Wrap(err, "unable to locate user's home directory")
	}

	return path.Join(homeDir, configDir), nil
}
