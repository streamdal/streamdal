package validate

import (
	"regexp"

	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
)

var (
	ErrNilInput          = errors.New("request cannot be nil")
	ValidCharactersRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
)

func RegisterRequest(req *protos.RegisterRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.ServiceName == "" {
		return ErrEmptyField("ServiceName")
	}

	if req.SessionId == "" {
		return ErrEmptyField("SessionId")
	}

	if err := ClientInfo(req.ClientInfo); err != nil {
		return errors.Wrap(err, "invalid client info")
	}

	if !ValidCharactersRegex.MatchString(req.ServiceName) {
		return ErrInvalidCharacters("ServiceName")
	}

	if !ValidCharactersRegex.MatchString(req.SessionId) {
		return ErrInvalidCharacters("SessionId")
	}

	// OK to not have audiences, but if defined, they must contain valid entries
	for _, v := range req.Audiences {
		if err := Audience(v); err != nil {
			return errors.Wrap(err, "invalid audience")
		}
	}

	return nil
}

func ClientInfo(clientInfo *protos.ClientInfo) error {
	if clientInfo == nil {
		return ErrNilInput
	}

	if clientInfo.Arch == "" {
		return ErrEmptyField("ClientInfo.Arch")
	}

	if clientInfo.Os == "" {
		return ErrEmptyField("ClientInfo.Os")
	}

	if clientInfo.Language == "" {
		return ErrEmptyField("ClientInfo.Language")
	}

	if clientInfo.LibraryName == "" {
		return ErrEmptyField("ClientInfo.LibraryName")
	}

	if clientInfo.LibraryVersion == "" {
		return ErrEmptyField("ClientInfo.LibraryVersion")
	}

	return nil
}

func ErrInvalidCharacters(field string) error {
	return errors.Errorf("field '%s' contains invalid characters", field)
}

func HeartbeatRequest(req *protos.HeartbeatRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.SessionId == "" {
		return ErrEmptyField("SessionId")
	}

	if !ValidCharactersRegex.MatchString(req.SessionId) {
		return ErrInvalidCharacters("SessionId")
	}

	return nil
}

func Audience(audience *protos.Audience) error {
	if audience == nil {
		return ErrNilField("Audience")
	}

	if audience.ServiceName == "" {
		return ErrEmptyField("Audience.ServiceName")
	}

	if !ValidCharactersRegex.MatchString(audience.ServiceName) {
		return ErrInvalidCharacters("ServiceName")
	}

	if audience.ComponentName == "" {
		return ErrEmptyField("Audience.ComponentName")
	}

	if !ValidCharactersRegex.MatchString(audience.ComponentName) {
		return ErrInvalidCharacters("ComponentName")
	}

	if audience.OperationType == protos.OperationType_OPERATION_TYPE_UNSET {
		return ErrUnsetEnum("Audience.OperationType")
	}

	if audience.OperationName == "" {
		return ErrEmptyField("Audience.OperationName")
	}

	if !ValidCharactersRegex.MatchString(audience.OperationName) {
		return ErrInvalidCharacters("OperationName")
	}

	return nil
}

func BusEvent(req *protos.BusEvent) error {
	if req == nil {
		return ErrNilInput
	}

	if req.Event == nil {
		return errors.New(".Event cannot be nil")
	}

	return nil
}

func ErrEmptyField(field string) error {
	return errors.Errorf("field '%s' cannot be empty", field)
}

func ErrNilField(field string) error {
	return errors.Errorf("field '%s' cannot be nil", field)
}

func ErrUnsetEnum(field string) error {
	return errors.Errorf("enum '%s' cannot be unset", field)
}

func GetPipelineRequest(req *protos.GetPipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func GetPipelinesRequest(req *protos.GetPipelinesRequest) error {
	if req == nil {
		return ErrNilInput
	}

	return nil
}

func CreatePipelineRequest(req *protos.CreatePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	return Pipeline(req.Pipeline, false)
}

func Pipeline(p *protos.Pipeline, requireId bool) error {
	if p == nil {
		return ErrNilInput
	}

	if requireId && p.Id == "" {
		return ErrEmptyField("Id")
	}

	if p.Name == "" {
		return ErrEmptyField("Name")
	}

	if !ValidCharactersRegex.MatchString(p.Name) {
		return ErrInvalidCharacters("p.Name")
	}

	if len(p.Steps) == 0 {
		return errors.New("must have at least one step in pipeline")
	}

	for _, s := range p.Steps {
		if err := PipelineStep(s); err != nil {
			return errors.Wrap(err, "invalid step")
		}
	}

	return nil
}

func PipelineStep(s *protos.PipelineStep) error {
	if s == nil {
		return ErrNilInput
	}

	if s.GetStep() == nil {
		return errors.New(".Step cannot be nil")
	}

	// OK if OnSuccess and OnFailure are nil/empty; nil/empty == implicit continue

	return nil
}

func UpdatePipelineRequest(req *protos.UpdatePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	return Pipeline(req.Pipeline, true)
}

func DeletePipelineRequest(req *protos.DeletePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func AttachPipelineRequest(req *protos.AttachPipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return Audience(req.Audience)
}

func DetachPipelineRequest(req *protos.DetachPipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return Audience(req.Audience)
}

func PausePipelineRequest(req *protos.PausePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func ResumePipelineRequest(req *protos.ResumePipelineRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func NewAudienceRequest(req *protos.NewAudienceRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.SessionId == "" {
		return ErrEmptyField("SessionId")
	}

	return Audience(req.Audience)
}

func GetAllRequest(req *protos.GetAllRequest) error {
	if req == nil {
		return ErrNilInput
	}

	return nil
}

func CreateNotificationRequest(req *protos.CreateNotificationRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.Notification == nil {
		return errors.New(".Notification cannot be nil")
	}

	if req.Notification.Name == "" {
		return ErrEmptyField("Name")
	}

	if req.Notification.Type == protos.NotificationType_NOTIFICATION_TYPE_UNSET {
		return ErrUnsetEnum("Type")
	}

	switch req.Notification.Type {
	case protos.NotificationType_NOTIFICATION_TYPE_EMAIL:
		if err := validateNotificationEmail(req.Notification.GetEmail()); err != nil {
			return err
		}
	case protos.NotificationType_NOTIFICATION_TYPE_SLACK:
		if err := validateNotificationSlack(req.Notification.GetSlack()); err != nil {
			return err
		}
	case protos.NotificationType_NOTIFICATION_TYPE_PAGERDUTY:
		if err := validateNotificationPagerDuty(req.Notification.GetPagerduty()); err != nil {
			return err
		}
	}

	return nil
}

func UpdateNotificationRequest(req *protos.UpdateNotificationRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.Notification == nil {
		return errors.New(".Notification cannot be nil")
	}

	if req.Notification.Name == "" {
		return ErrEmptyField("Name")
	}

	if req.Notification.Type == protos.NotificationType_NOTIFICATION_TYPE_UNSET {
		return ErrUnsetEnum("Type")
	}

	switch req.Notification.Type {
	case protos.NotificationType_NOTIFICATION_TYPE_EMAIL:
		if err := validateNotificationEmail(req.Notification.GetEmail()); err != nil {
			return err
		}
	case protos.NotificationType_NOTIFICATION_TYPE_SLACK:
		if err := validateNotificationSlack(req.Notification.GetSlack()); err != nil {
			return err
		}
	case protos.NotificationType_NOTIFICATION_TYPE_PAGERDUTY:
		if err := validateNotificationPagerDuty(req.Notification.GetPagerduty()); err != nil {
			return err
		}
	}

	return nil
}

func validateNotificationEmail(email *protos.NotificationEmail) error {
	if email.GetFromAddress() == "" {
		return ErrEmptyField("Email.FromAddress")
	}

	if len(email.GetRecipients()) == 0 {
		return ErrEmptyField("Email.Recipients")
	}

	switch email.GetType() {
	case protos.NotificationEmail_TYPE_SMTP:
		if email.GetSmtp().GetHost() == "" {
			return ErrEmptyField("Email.Smtp.Host")
		}
		if email.GetSmtp().GetPort() == 0 {
			return ErrEmptyField("Email.Smtp.Port")
		}
		if email.GetSmtp().GetUser() == "" {
			return ErrEmptyField("Email.Smtp.User")
		}
		if email.GetSmtp().GetPassword() == "" {
			return ErrEmptyField("Email.Smtp.Password")
		}
	case protos.NotificationEmail_TYPE_SES:
		if email.GetSes().GetSesRegion() == "" {
			return ErrEmptyField("Email.Ses.Region")
		}
		if email.GetSes().GetSesAccessKeyId() == "" {
			return ErrEmptyField("Email.Ses.AccessKeyId")
		}
		if email.GetSes().GetSesSecretAccessKey() == "" {
			return ErrEmptyField("Email.Ses.SecretAccessKey")
		}
	}

	return nil
}

func validateNotificationSlack(slack *protos.NotificationSlack) error {
	if slack.BotToken == "" {
		return ErrEmptyField("Slack.BotToken")
	}
	if slack.Channel == "" {
		return ErrEmptyField("Slack.Channel")
	}

	return nil
}

func validateNotificationPagerDuty(pagerduty *protos.NotificationPagerDuty) error {
	if pagerduty.Token == "" {
		return ErrEmptyField("PagerDuty.Token")
	}

	if pagerduty.ServiceId == "" {
		return ErrEmptyField("PagerDuty.ServiceId")
	}

	if pagerduty.Email == "" {
		return ErrEmptyField("PagerDuty.Email")
	}

	return nil
}

func DeleteNotificationRequest(req *protos.DeleteNotificationRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.NotificationId == "" {
		return ErrEmptyField("NotificationId")
	}

	return nil
}

func AttachNotificationRequest(req *protos.AttachNotificationRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.NotificationId == "" {
		return ErrEmptyField("NotificationId")
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func DetachNotificationRequest(req *protos.DetachNotificationRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.NotificationId == "" {
		return ErrEmptyField("NotificationId")
	}

	if req.PipelineId == "" {
		return ErrEmptyField("PipelineId")
	}

	return nil
}

func GetNotificationRequest(req *protos.GetNotificationRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.NotificationId == "" {
		return ErrEmptyField("NotificationId")
	}

	return nil
}

func MetricsRequest(req *protos.MetricsRequest) error {
	if req == nil {
		return ErrNilInput
	}

	if req.Metrics == nil {
		return ErrNilField("Metrics")
	}

	return nil
}

func KVCreateHTTPRequest(r *protos.KVCreateHTTPRequest) error {
	if r == nil {
		return ErrNilInput
	}

	if len(r.Kvs) == 0 {
		return ErrEmptyField("Kvs")
	}

	for _, kv := range r.Kvs {
		if err := KVObject(kv, false, true); err != nil {
			return errors.Wrapf(err, "KVObject validation failed for key '%s'", kv.Key)
		}
	}

	return nil
}

// KVObject validates a KVObject; checkTimestamps is exposed because in some
// cases we might not have a TS yet (ie. Create KV)
func KVObject(obj *protos.KVObject, checkTimestamps, checkValue bool) error {
	if obj == nil {
		return ErrNilInput
	}

	if obj.Key == "" {
		return ErrEmptyField("Key")
	}

	if checkValue && obj.Value == nil {
		return ErrNilField("Value")
	}

	if checkTimestamps {
		// Should at least have created_at
		if obj.CreatedAtUnixTsNanoUtc == 0 {
			return ErrEmptyField("CreatedAtUnixTsNanoUtc")
		}
	}

	return nil
}

func KVUpdateHTTPRequest(r *protos.KVUpdateHTTPRequest) error {
	if r == nil {
		return ErrNilInput
	}

	for _, kv := range r.Kvs {
		if err := KVObject(kv, false, true); err != nil {
			return errors.Wrapf(err, "KVObject validation failed for key '%s'", kv.Key)
		}
	}

	return nil
}

func KVInstruction(i *protos.KVInstruction) error {
	if i == nil {
		return ErrNilInput
	}

	if i.Action == 0 {
		return errors.New("action must be set")
	}

	checkValue := true

	if i.Action == protos.KVAction_KV_ACTION_DELETE {
		checkValue = false
	}

	// Delete all doesn't contain an object - no need to validate
	if i.Action == protos.KVAction_KV_ACTION_DELETE {
		if err := KVObject(i.Object, false, checkValue); err != nil {
			return errors.Wrapf(err, "KVObject validation failed for kv '%s'", i.Object)
		}
	}

	return nil
}

func KVRequest(r *protos.KVRequest) error {
	if r == nil {
		return ErrNilInput
	}

	for _, v := range r.Instructions {
		if err := KVInstruction(v); err != nil {
			return errors.Wrapf(err, "instruction validation failed for kv '%v'", v.Object)
		}
	}

	return nil
}
