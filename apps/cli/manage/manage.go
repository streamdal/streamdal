package manage

import (
	"fmt"

	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/charmbracelet/log"
	"github.com/pkg/errors"

	"github.com/streamdal/streamdal/apps/cli/config"
	"github.com/streamdal/streamdal/apps/cli/validate"
)

type Manage struct {
	cfg    *config.Config
	logger *log.Logger
	t      statsd.Statter
}

func New(cfg *config.Config, logger *log.Logger, t statsd.Statter) (*Manage, error) {
	if err := validateParams(cfg, logger, t); err != nil {
		return nil, errors.Wrap(err, "unable to complete validation")
	}

	// TODO: Try to talk to server

	return &Manage{
		cfg:    cfg,
		logger: logger,
		t:      t,
	}, nil
}

func (m *Manage) CreatePipeline(cfg *config.Config) error {
	if err := validate.ManageCreatePipeline(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage create pipeline params")
	}

	return nil
}

func (m *Manage) GetPipeline(cfg *config.Config) error {
	if err := validate.ManageGetPipeline(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage get pipeline params")
	}

	fmt.Println("Getting pipeline")

	return nil
}

func (m *Manage) DeletePipeline(cfg *config.Config) error {
	if err := validate.ManageDeletePipeline(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage delete pipeline params")
	}

	fmt.Println("Deleting pipeline")

	return nil
}

func (m *Manage) CreateWasm(cfg *config.Config) error {
	if err := validate.ManageCreateWasm(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage create wasm params")
	}

	fmt.Println("Creating Wasm module")

	return nil
}

func (m *Manage) GetWasm(cfg *config.Config) error {
	if err := validate.ManageGetWasm(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage get wasm params")
	}

	fmt.Println("Getting Wasm module")

	return nil
}

func (m *Manage) DeleteWasm(cfg *config.Config) error {
	if err := validate.ManageDeleteWasm(cfg); err != nil {
		return errors.Wrap(err, "unable to validate manage delete wasm params")
	}

	fmt.Println("Deleting Wasm module")

	return nil
}

func validateParams(cfg *config.Config, logger *log.Logger, t statsd.Statter) error {
	if cfg == nil {
		return errors.New("config cannot be nil")
	}

	if logger == nil {
		return errors.New("logger cannot be nil")
	}

	if t == nil {
		return errors.New("telemetry cannot be nil")
	}

	return nil
}
