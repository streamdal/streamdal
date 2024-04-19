package validate

import (
	"fmt"
	"regexp"

	"github.com/pkg/errors"
	"github.com/streamdal/streamdal/apps/server/validate"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/util/validation/field"

	crdv1 "github.com/streamdal/streamdal/apps/operator/api/v1"
)

const (
	GroupName = "crd.streamdal.com"
	KindName  = "StreamdalConfig"
)

func StreamdalConfig(cfg *crdv1.StreamdalConfig) error {
	if cfg == nil {
		return invalidError("StreamdalConfig", field.ErrorList{
			field.Required(field.NewPath("StreamdalConfig"), "StreamdalConfig cannot be nil"),
		})
	}

	var errList field.ErrorList

	if cfg.Spec.ServerAddress == "" {
		errList = append(errList, &field.Error{
			Type:   field.ErrorTypeRequired,
			Field:  "StreamdalConfig.Spec.ServerAddress",
			Detail: "Cannot be empty",
		})
	}

	if cfg.Spec.ServerAuth == "" {
		errList = append(errList, &field.Error{
			Type:   field.ErrorTypeRequired,
			Field:  "StreamdalConfig.Spec.ServerAuth",
			Detail: "Cannot be empty",
		})
	}

	matched, err := regexp.MatchString(`^.*:[0-9]+$`, cfg.Spec.ServerAddress)
	if err != nil {
		errList = append(errList, &field.Error{
			Type:   field.ErrorTypeInternal,
			Field:  "StreamdalConfig.Spec.ServerAddress",
			Detail: fmt.Sprintf("Regex validation error: %s", err),
		})
	}

	if err == nil && !matched {
		errList = append(errList, &field.Error{
			Type:   field.ErrorTypeInvalid,
			Field:  "StreamdalConfig.Spec.ServerAddress",
			Detail: "Invalid format - must be in the format 'host:port'",
		})
	}

	return invalidError(cfg.Name, errList)
}

func invalidError(name string, errList field.ErrorList) error {
	if len(errList) == 0 {
		return nil
	}

	return k8serrors.NewInvalid(
		schema.GroupKind{Group: GroupName, Kind: KindName},
		name,
		errList,
	)
}

func WantedConfig(cfg *protos.Config) error {
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

	// TODO: Don't forget to update protos to get Mappings!!!

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

	if notification.GetId() == "" {
		return errors.New("NotificationConfig.Id cannot be empty")
	}

	if notification.Name == "" {
		return errors.New("NotificationConfig.Name cannot be empty")
	}

	var err error

	switch notification.Type {
	case protos.NotificationType_NOTIFICATION_TYPE_EMAIL:
		err = NotificationEmail(notification.GetEmail())
	case protos.NotificationType_NOTIFICATION_TYPE_PAGERDUTY:
		err = NotificationPagerduty(notification.GetPagerduty())
	case protos.NotificationType_NOTIFICATION_TYPE_SLACK:
		err = NotificationSlack(notification.GetSlack())
	default:
		return errors.New("NotificationConfig.Type must be one of EMAIL, PAGERDUTY, or SLACK")
	}

	return err
}

func NotificationEmail(cfg *protos.NotificationEmail) error {
	if cfg == nil {
		return errors.New("NotificationEmail cannot be nil")
	}

	switch cfg.Type {
	case protos.NotificationEmail_TYPE_SMTP:
		if cfg.GetSmtp() == nil {
			return errors.New("NotificationEmail.SMTP cannot be nil")
		}
	case protos.NotificationEmail_TYPE_SES:
		if cfg.GetSes() == nil {
			return errors.New("NotificationEmail.SES cannot be nil")
		}

		if cfg.GetSes().SesRegion == "" {
			return errors.New("NotificationEmail.SES.SesRegion cannot be empty")
		}

		if cfg.GetSes().SesAccessKeyId == "" {
			return errors.New("NotificationEmail.SES.SesAccessKeyId cannot be empty")
		}

		if cfg.GetSes().SesSecretAccessKey == "" {
			return errors.New("NotificationEmail.SES.SesSecretAccessKey cannot be empty")
		}
	default:
		return errors.New("NotificationEmail.Type must be one of SMTP or SES")
	}

	return nil
}

func NotificationSlack(cfg *protos.NotificationSlack) error {
	if cfg == nil {
		return errors.New("NotificationSlack cannot be nil")
	}

	if cfg.BotToken == "" {
		return errors.New("NotificationSlack.BotToken cannot be empty")
	}

	if cfg.Channel == "" {
		return errors.New("NotificationSlack.Channel cannot be empty")
	}

	return nil
}

func NotificationPagerduty(cfg *protos.NotificationPagerDuty) error {
	if cfg == nil {
		return errors.New("NotificationPagerDuty cannot be nil")
	}

	if cfg.Token == "" {
		return errors.New("NotificationPagerDuty.Token cannot be empty")
	}

	if cfg.Email == "" {
		return errors.New("NotificationPagerDuty.Email cannot be empty")
	}

	if cfg.ServiceId == "" {
		return errors.New("NotificationPagerDuty.ServiceId cannot be empty")
	}

	if cfg.Urgency != protos.NotificationPagerDuty_URGENCY_LOW &&
		cfg.Urgency != protos.NotificationPagerDuty_URGENCY_HIGH {

		return errors.New("NotificationPagerDuty.Urgency must be one of LOW or HIGH")
	}

	return nil
}

// TODO: Punting on wasm module support until later (need to figure out what
// to do about bytes VS id)
func WasmModules(modules []*shared.WasmModule) error {
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
