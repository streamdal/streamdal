package validate

import (
	"github.com/pkg/errors"

	"github.com/streamdal/streamdal/apps/cli/config"
)

var (
	ErrMissingConfig = errors.New("missing config")
)

func ManageGetPipeline(cfg *config.Config) error {
	if cfg == nil {
		return ErrMissingConfig
	}

	return nil
}

func ManageCreatePipeline(cfg *config.Config) error {
	if cfg == nil {
		return ErrMissingConfig
	}

	if cfg.Manage.Create.Pipeline.JSON == "" {
		return errors.New("missing path to pipeline JSON file")
	}

	return nil
}

func ManageDeletePipeline(cfg *config.Config) error {
	if cfg == nil {
		return ErrMissingConfig
	}

	if cfg.Manage.Delete.Pipeline.ID == "" {
		return errors.New("missing pipeline id")
	}

	return nil
}

func ManageGetWasm(cfg *config.Config) error {
	if cfg == nil {
		return ErrMissingConfig
	}

	return nil
}

func ManageCreateWasm(cfg *config.Config) error {
	if cfg == nil {
		return ErrMissingConfig
	}

	if cfg.Manage.Create.Wasm.File == "" {
		return errors.New("missing path to wasm module file")
	}

	return nil
}

func ManageDeleteWasm(cfg *config.Config) error {
	if cfg == nil {
		return ErrMissingConfig
	}

	if cfg.Manage.Delete.Wasm.ID == "" {
		return errors.New("missing ID of wasm module to delete")
	}

	return nil
}
