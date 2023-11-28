package config

// TODO: probably don't need this file anymore

//type configFile struct {
//	NodeID string `json:"node_id"`
//}
//
//// GetNodeID returns the unique node ID for this running instance of streamdal server
//func (c *Config) GetNodeID() string {
//	nodeID := c.getCurrentNodeID()
//	if nodeID != "" {
//		return nodeID
//	}
//
//	// Generate a new UUID
//	nodeID = uuid.New().String()
//
//	// Save to config file
//	if err := saveNodeID(nodeID); err != nil {
//		logrus.Error(err)
//	}
//
//	return nodeID
//}
//
//// getCurrentNodeID returns the node ID from either the CLI flag, or an existing config file
//// If neither are available, or an error occurs, an empty string will be returned.
//// The parent method will generate a fresh ID
//func (c *Config) getCurrentNodeID() string {
//	// Specified via a flag
//	if c.NodeID != "" {
//		// Try and parse
//		_, err := uuid.Parse(c.NodeID)
//		if err != nil {
//			// Invalid UUID,  generate a fresh one
//			return ""
//		}
//		return c.NodeID
//	}
//
//	// Not specified via a flag, try to load from config file
//	if exists(ConfigFileName) {
//		// Read config file and unmarshal contents into configFile struct
//		data, err := getConfigFile(ConfigFileName)
//		if err != nil {
//			logrus.Error(err)
//			return ""
//		}
//
//		cfg := &configFile{}
//		if err := json.Unmarshal(data, cfg); err != nil {
//			logrus.Error(err)
//			return ""
//		}
//
//		return cfg.NodeID
//	}
//
//	return ""
//
//}
//
//func saveNodeID(nodeID string) error {
//	configDir, err := getConfigDir()
//	if err != nil {
//		return errors.Wrap(err, "unable to locate config directory")
//	}
//	configPath := path.Join(configDir, ConfigFileName)
//
//	cfg := &configFile{
//		NodeID: nodeID,
//	}
//
//	data, err := json.Marshal(cfg)
//	if err != nil {
//		return errors.Wrap(err, "unable to marshal config file")
//	}
//
//	if err := os.WriteFile(configPath, data, 0644); err != nil {
//		return errors.Wrap(err, "unable to write config file")
//	}
//
//	return nil
//}
//
//func getConfigFile(fileName string) ([]byte, error) {
//	configDir, err := getConfigDir()
//	if err != nil {
//		return nil, errors.Wrap(err, "unable to locate config directory")
//	}
//	configPath := path.Join(configDir, fileName)
//
//	file, err := os.Open(configPath)
//	if err != nil {
//		return nil, errors.Wrap(err, "unable to open config file")
//	}
//	defer file.Close()
//
//	fileContents, err := io.ReadAll(file)
//	if err != nil {
//		return nil, errors.Wrap(err, "unable to read config file")
//	}
//
//	return fileContents, nil
//}
//
//// Exists determines if a config file exists yet
//func exists(fileName string) bool {
//	configDir, err := getConfigDir()
//	if err != nil {
//		return false
//	}
//	configPath := path.Join(configDir, fileName)
//
//	if _, err := os.Stat(configPath); os.IsNotExist(err) {
//		return false
//	}
//
//	return true
//}
//
//// getConfigDir returns a directory where the batch configuration will be stored
//func getConfigDir() (string, error) {
//	// Get user's home directory
//	homeDir, err := os.UserHomeDir()
//	if err != nil {
//		return "", errors.Wrap(err, "unable to locate user's home directory")
//	}
//
//	return path.Join(homeDir, ConfigDir), nil
//}
