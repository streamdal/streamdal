package validate

import (
	"github.com/pkg/errors"
	"github.com/streamdal/streamdal/apps/server/validate"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"

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

func StreamdalProtosConfig(cfg *protos.Config) error {
	if cfg == nil {
		return errors.New("Config cannot be nil")
	}

	if err := Audiences(cfg.Audiences); err != nil {
		return errors.Wrap(err, "Config.Audiences")
	}

	if err := Notifications(cfg.Notifications); err != nil {
		return errors.Wrap(err, "Config.Notifications")
	}

	if err := WasmModules(cfg.WasmModules); err != nil {
		return errors.Wrap(err, "Config.WasmModules")
	}

	if err := Pipelines(cfg.Pipelines); err != nil {
		return errors.Wrap(err, "Config.Pipelines")
	}

	return nil
}

func Audiences(audiences []*protos.Audience) error {
	for _, a := range audiences {
		if err := validate.Audience(a); err != nil {
			return err
		}
	}

	return nil
}

func Notifications(notifications []*protos.NotificationConfig) error {
	for _, n := range notifications {
		if err := Notification(n); err != nil {
			return err
		}
	}

	return nil
}

func Notification(notification *protos.NotificationConfig) error {
	if notification == nil {
		return errors.New("NotificationConfig cannot be nil")
	}

	// TODO: Add validations; also - reminder: ID's MUST be enforced!!!

	return nil
}

func WasmModules(modules []*shared.WasmModule) error {
	// TODO: Punting on wasm module support until later (need to figure out what
	// to do about bytes VS id)
	return nil
}

func Pipelines(pipelines []*protos.Pipeline) error {
	for _, p := range pipelines {
		if err := validate.Pipeline(p, true); err != nil {
			return errors.Wrap(err, "Pipeline")
		}
	}

	return nil
}
