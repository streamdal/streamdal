package notify

import (
	"bytes"
	"context"
	"crypto/tls"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"strings"
	"time"

	"github.com/PagerDuty/go-pagerduty"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ses"
	"github.com/pkg/errors"
	"github.com/relistan/go-director"
	"github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"github.com/tidwall/gjson"
	gomail "gopkg.in/mail.v2"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	"github.com/streamdal/streamdal/apps/server/services/store"
)

var (
	ErrMissingStorageService = errors.New("Store cannot be nil")
	ErrMissingShutdownCtx    = errors.New("ShutdownCtx cannot be nil")
)

const (
	EmailSubject = "Streamdal Alert"
)

//go:embed templates/*
var templates embed.FS

type INotifier interface {
	Queue(ctx context.Context, event *protos.NotifyRequest)
}

type Config struct {
	Store       store.IStore
	ShutdownCtx context.Context
}

type Notify struct {
	*Config
	log       *logrus.Entry
	eventChan chan *protos.NotifyRequest
}

func New(cfg *Config) (*Notify, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "invalid config")
	}

	n := &Notify{
		Config:    cfg,
		log:       logrus.WithField("pkg", "notify"),
		eventChan: make(chan *protos.NotifyRequest, 1000),
	}

	go n.runWorker(director.NewFreeLooper(director.FOREVER, make(chan error, 1)))

	return n, nil
}

func validateConfig(cfg *Config) error {
	if cfg.Store == nil {
		return ErrMissingStorageService
	}

	if cfg.ShutdownCtx == nil {
		return ErrMissingShutdownCtx
	}

	return nil
}

func (n *Notify) runWorker(looper director.Looper) {
	var quit bool
	looper.Loop(func() error {
		if quit {
			looper.Quit()
			time.Sleep(time.Millisecond * 100)
			return nil
		}

		select {
		case <-n.ShutdownCtx.Done():
			looper.Quit()
			quit = true
			return nil
		case event := <-n.eventChan:
			if err := n.handle(context.Background(), event); err != nil {
				n.log.WithError(err).Error("unable to handle notification")
			}
		}

		return nil
	})
}

func (n *Notify) Queue(_ context.Context, req *protos.NotifyRequest) {
	n.eventChan <- req
}

func (n *Notify) handle(ctx context.Context, event *protos.NotifyRequest) error {
	pipeline, err := n.Store.GetPipeline(ctx, event.PipelineId)
	if err != nil {
		return errors.Wrap(err, "pipeline not found")
	}

	for _, cfgID := range event.Notification.NotificationConfigIds {
		cfg, err := n.Store.GetNotificationConfig(ctx, &protos.GetNotificationRequest{NotificationId: cfgID})
		if err != nil {
			return errors.Wrapf(err, "unknown notification config ID '%s'", cfgID)
		}

		if err := n.handleNotificationConfig(ctx, event, cfg, pipeline); err != nil {
			return errors.Wrapf(err, "unable to handle notification config ID '%s'", cfgID)
		}
	}

	return nil
}

func (n *Notify) handleNotificationConfig(
	ctx context.Context,
	event *protos.NotifyRequest,
	cfg *protos.NotificationConfig,
	pipeline *protos.Pipeline,
) error {
	switch cfg.GetType() {
	case protos.NotificationType_NOTIFICATION_TYPE_EMAIL:
		return n.handleEmail(ctx, event, cfg.GetEmail(), pipeline)
	case protos.NotificationType_NOTIFICATION_TYPE_SLACK:
		return n.handleSlack(ctx, event, cfg.GetSlack(), pipeline)
	case protos.NotificationType_NOTIFICATION_TYPE_PAGERDUTY:
		return n.handlePagerDuty(ctx, event, cfg.GetPagerduty(), pipeline)
	default:
		return errors.Errorf("unknown notify type: %s", cfg.Type)
	}
}

func (n *Notify) handleEmail(
	ctx context.Context,
	event *protos.NotifyRequest,
	cfg *protos.NotificationEmail,
	pipeline *protos.Pipeline,
) error {
	switch cfg.GetType() {
	case protos.NotificationEmail_TYPE_SMTP:
		return n.handleEmailSMTP(ctx, event, cfg, pipeline)
	case protos.NotificationEmail_TYPE_SES:
		return n.handleEmailSES(ctx, event, cfg, pipeline)
	default:
		return errors.Errorf("unknown email type: %s", cfg.Type)
	}
}

func (n *Notify) handleEmailSMTP(
	ctx context.Context,
	event *protos.NotifyRequest,
	emailCfg *protos.NotificationEmail,
	pipeline *protos.Pipeline,
) error {
	body, err := n.getEmailBody(ctx, event, "notification", pipeline)
	if err != nil {
		return errors.Wrap(err, "unable to generate email body")
	}

	smtpCfg := emailCfg.GetSmtp()

	m := gomail.NewMessage()
	m.SetHeader("From", emailCfg.GetFromAddress())
	m.SetHeader("To", emailCfg.GetRecipients()...)
	m.SetHeader("Subject", EmailSubject)
	m.SetBody("text/html", body)
	d := gomail.NewDialer(smtpCfg.GetHost(), int(smtpCfg.GetPort()), smtpCfg.GetUser(), smtpCfg.GetPassword())

	// This is only needed when SSL/TLS certificate is not valid on server.
	// In production this should be set to false.
	if smtpCfg.GetUseTls() {
		d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	}

	// Now send E-Mail
	if err := d.DialAndSend(m); err != nil {
		return errors.Wrap(err, "unable to send notification email")
	}

	return nil
}

func (n *Notify) handleEmailSES(ctx context.Context, event *protos.NotifyRequest, emailCfg *protos.NotificationEmail, pipeline *protos.Pipeline) error {
	body, err := n.getEmailBody(ctx, event, "notification", pipeline)
	if err != nil {
		return errors.Wrap(err, "unable to generate email body")
	}

	sesCfg := emailCfg.GetSes()

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(sesCfg.GetSesRegion()),
		Credentials: credentials.NewStaticCredentials(
			sesCfg.GetSesAccessKeyId(),
			sesCfg.GetSesSecretAccessKey(),
			"", // Don't need session token
		),
	})
	if err != nil {
		return errors.Wrap(err, "unable to create aws session")
	}

	sesClient := ses.New(sess)

	// AWS wants string pointers
	toAddresses := make([]*string, 0)
	for _, address := range emailCfg.GetRecipients() {
		toAddresses = append(toAddresses, aws.String(address))
	}

	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			ToAddresses: toAddresses,
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Html: &ses.Content{
					Charset: aws.String("UTF-8"),
					Data:    aws.String(body),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String("UTF-8"),
				Data:    aws.String(EmailSubject),
			},
		},
		Source: aws.String(emailCfg.GetFromAddress()),
	}

	// Required for logging
	input.SetConfigurationSetName("streamdal-log")

	if _, err := sesClient.SendEmail(input); err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case ses.ErrCodeMessageRejected:
				n.log.Error(ses.ErrCodeMessageRejected, aerr.Error())
				return aerr
			case ses.ErrCodeMailFromDomainNotVerifiedException:
				n.log.Error(ses.ErrCodeMailFromDomainNotVerifiedException, aerr.Error())
				return aerr
			case ses.ErrCodeConfigurationSetDoesNotExistException:
				n.log.Error(ses.ErrCodeConfigurationSetDoesNotExistException, aerr.Error())
				return aerr
			default:
				n.log.Error(aerr.Error())
				return aerr
			}
		} else {
			n.log.Error(err.Error())
			return err
		}
	}
	return nil
}
func (n *Notify) handleSlack(ctx context.Context, event *protos.NotifyRequest, cfg *protos.NotificationSlack, pipeline *protos.Pipeline) error {
	api := slack.New(cfg.BotToken)

	headerBlock := slack.NewHeaderBlock(slack.NewTextBlockObject(slack.PlainTextType, "Streamdal Alert Triggered", false, false))
	divBlock := slack.NewDividerBlock()

	infoBlocks := []*slack.TextBlockObject{
		slack.NewTextBlockObject(slack.MarkdownType, "*Pipeline ID*\n"+pipeline.Id, false, false),
		slack.NewTextBlockObject(slack.MarkdownType, "*Pipeline Name*\n"+pipeline.Name, false, false),
		slack.NewTextBlockObject(slack.MarkdownType, "*Step Name*\n"+event.Step.Name, false, false),
		slack.NewTextBlockObject(slack.MarkdownType, "*Service Name*\n"+event.Audience.ServiceName, false, false),
		slack.NewTextBlockObject(slack.MarkdownType, "*Operation Name*\n"+event.Audience.OperationName, false, false),
		slack.NewTextBlockObject(slack.MarkdownType, "*Operation Type*\n"+operationTypeString(event.Audience.OperationType), false, false),
	}

	optionBlocks := slack.MsgOptionBlocks(headerBlock, divBlock, slack.NewSectionBlock(nil, infoBlocks, nil), divBlock)

	// If we have a payload, include it in the alert
	if len(event.Payload) > 0 {
		// Add payload to info blocks
		payloadText := slack.NewTextBlockObject(slack.MarkdownType, "*Payload*", false, false)
		infoBlocks = append(infoBlocks, payloadText)

		// Payload is preformatted rich text
		payload := slack.NewRichTextSection(slack.NewRichTextSectionTextElement(prettyJSON(event.Payload), &slack.RichTextSectionTextStyle{}))
		payload.Type = slack.RTEPreformatted

		// Option blocks needs to include the rich text payload block
		optionBlocks = slack.MsgOptionBlocks(
			headerBlock,
			divBlock,
			slack.NewSectionBlock(nil, infoBlocks, nil),
			slack.NewRichTextBlock("payload", payload),
			divBlock,
		)
	}

	_, _, err := api.PostMessageContext(
		ctx,
		cfg.Channel,
		slack.MsgOptionText("Streamdal Alert", false),
		optionBlocks,
		slack.MsgOptionAsUser(true),
	)
	if err != nil {
		return errors.Wrap(err, "unable to send slack alert")
	}

	return nil
}

func (n *Notify) handlePagerDuty(ctx context.Context, event *protos.NotifyRequest, cfg *protos.NotificationPagerDuty, pipeline *protos.Pipeline) error {
	urgency := "low"
	if cfg.Urgency == protos.NotificationPagerDuty_URGENCY_HIGH {
		urgency = "high"
	}

	pdClient := pagerduty.NewClient(cfg.Token)

	incidentOptions := &pagerduty.CreateIncidentOptions{
		Service: &pagerduty.APIReference{
			ID:   cfg.ServiceId,
			Type: "service_reference",
		},
		Title:       "Streamdal Alert",
		Urgency:     urgency,
		IncidentKey: pipeline.Id,
		Body: &pagerduty.APIDetails{
			Type: "incident_body",
			Details: fmt.Sprintf(
				"Pipeline ID: %s\nPipeline Name: %s\nStep Name: %s\nService Name: %s\nOperation Name: %s\nOperation Type: %s\nPayload: %s\n",
				pipeline.Id,
				pipeline.Name,
				event.Step.Name,
				event.Audience.ServiceName,
				event.Audience.OperationName,
				operationTypeString(event.Audience.OperationType),
				prettyJSON(event.Payload),
			),
		},
	}

	if _, err := pdClient.CreateIncidentWithContext(ctx, cfg.Email, incidentOptions); err != nil {
		return errors.Wrap(err, "unable to send pagerduty alert")
	}

	return nil
}

func (n *Notify) getEmailBody(
	_ context.Context,
	req *protos.NotifyRequest,
	templateName string,
	pipeline *protos.Pipeline,
) (string, error) {
	if req == nil {
		return "", errors.New("req is nil")
	}

	if templateName == "" {
		return "", errors.New("templateName is empty")
	}

	// Access individual files by their paths.
	contents, err := templates.ReadFile(fmt.Sprintf("templates/%s.html", templateName))
	if err != nil {
		return "", errors.Wrapf(err, "Failed to generate template %s", templateName)
	}

	tmpl, err := template.New(templateName).Parse(string(contents))
	if err != nil {
		return "", errors.Wrapf(err, "unable to parse template '%s'", templateName)
	}

	var body bytes.Buffer

	payload, err := getPayload(req.Payload, req.Notification)
	if err != nil {
		return "", errors.Wrap(err, "unable to get payload")
	}

	data := map[string]string{
		"pipeline_id":    pipeline.Id,
		"pipeline_name":  pipeline.Name,
		"step_name":      req.Step.Name,
		"service_name":   req.Audience.ServiceName,
		"operation_name": req.Audience.OperationName,
		"operation_type": operationTypeString(req.Audience.OperationType),
		"payload_data":   string(payload),
	}

	if err := tmpl.Execute(&body, data); err != nil {
		return "", errors.Wrapf(err, "unable to execute template '%s'", templateName)
	}

	return body.String(), nil
}

func getPayload(payload []byte, cfg *protos.PipelineStepNotification) ([]byte, error) {
	if payload == nil {
		return nil, errors.New("payload is nil")
	}

	switch cfg.PayloadType {
	case protos.PipelineStepNotification_PAYLOAD_TYPE_SELECT_PATHS:
		return extractPayloadPaths(payload, cfg.Paths)
	case protos.PipelineStepNotification_PAYLOAD_TYPE_FULL_PAYLOAD:
		return payload, nil
	default:
		return []byte(``), nil
	}
}

// extractPayloadPaths will extract the requested paths from the payload and return them as a JSON object
// If flatten is true, the result will be flattened to a single level, otherwise keys/values will be
// nested as they were in the original JSON payload
func extractPayloadPaths(payload []byte, paths []string, flatten ...bool) ([]byte, error) {
	if payload == nil {
		return nil, errors.New("payload is nil")
	}

	if len(paths) == 0 {
		return nil, errors.New("paths is empty")
	}

	extracted := make(map[string]interface{})

	for _, path := range paths {
		res := gjson.GetBytes(payload, path)
		if !res.Exists() {
			// Path not found, nothing to do
			continue
		}

		pathElements := strings.Split(path, ".")

		// Flattened result
		if len(flatten) > 0 && flatten[0] == true {
			last := pathElements[len(pathElements)-1]
			extracted[last] = gjson.GetBytes(payload, path).Value()
			continue
		}

		// Nested result
		currentMap := extracted
		for i, pathElement := range pathElements {
			if i == len(pathElements)-1 {
				// Last element, set value
				currentMap[pathElement] = res.Value()
				continue
			}

			// Create sub key if it doesn't exist
			if _, ok := currentMap[pathElement]; !ok {
				currentMap[pathElement] = make(map[string]interface{})
			}

			// Set current map to next level
			currentMap = currentMap[pathElement].(map[string]interface{})
		}

	}

	data, err := json.Marshal(extracted)
	if err != nil {
		return nil, errors.Wrap(err, "unable to marshal extracted data to JSON")
	}

	return data, nil
}
