package validate

import (
	"github.com/pkg/errors"

	crdv1 "github.com/streamdal/streamdal/apps/operator/api/v1"
)

func StreamdalConfig(cfg *crdv1.StreamdalConfig) error {
	if cfg == nil {
		return errors.New("StreamdalConfig cannot be nil")
	}

	if cfg.Spec.ServerAddress == "" {
		return errors.New("StreamdalConfig.Spec.ServerAddress cannot be empty")
	}

	if cfg.Spec.ServerAuth == "" {
		return errors.New("StreamdalConfig.Spec.ServerAuth cannot be 0")
	}

	return nil
}
