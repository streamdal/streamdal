package notify

import (
	"bytes"
	"context"
	"crypto/tls"
	"embed"
	"fmt"
	"html/template"
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
	gomail "gopkg.in/mail.v2"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/store"
)

var (
	ErrMissingStorageService = errors.New("StorageService cannot be nil")
	ErrMissingShutdownCtx    = errors.New("ShutdownCtx cannot be nil")
)

const (
	EmailSubject = "Streamdal Snitch Alert"
)

//go:embed templates/*
var templates embed.FS

type INotifier interface {
	Queue(ctx context.Context, event *protos.NotifyRequest) error
}

type Config struct {
	StorageService store.IStore
	ShutdownCtx    context.Context
}

type Notify struct {
	*Config
	log       *logrus.Entry
	eventChan chan *Notification
}

type Notification struct {
	Req      *protos.NotifyRequest
	Pipeline *protos.Pipeline
	Aud      *protos.Audience
	Configs  []*protos.NotificationConfig
}

func New(cfg *Config) (*Notify, error) {
	if err := validateConfig(cfg); err != nil {
		return nil, errors.Wrap(err, "invalid config")
	}

	n := &Notify{
		Config:    cfg,
		log:       logrus.WithField("pkg", "notify"),
		eventChan: make(chan *Notification, 1000),
	}

	go n.runWorker(director.NewFreeLooper(director.FOREVER, make(chan error, 1)))

	return n, nil
}

func validateConfig(cfg *Config) error {
	if cfg.StorageService == nil {
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
			// TODO: Do something
			_ = event

			for _, cfg := range event.Configs {
				if err := n.handle(context.Background(), event, cfg); err != nil {
					n.log.WithError(err).Error("unable to handle notification")
				}
			}
		}

		return nil
	})
}

func (n *Notify) Queue(ctx context.Context, req *protos.NotifyRequest) error {
	// Look up pipeline
	pipeline, err := n.StorageService.GetPipeline(ctx, req.PipelineId)
	if err != nil {
		return errors.Wrap(err, "pipeline not found")
	}

	configs, err := n.StorageService.GetNotifyConfigsByPipeline(ctx, req.PipelineId)
	if err != nil {
		return errors.Wrap(err, "notify config not found")
	}

	n.eventChan <- &Notification{
		Req:      req,
		Pipeline: pipeline,
		Aud:      req.Audience,
		Configs:  configs,
	}

	return nil
}

func (n *Notify) handle(ctx context.Context, event *Notification, cfg *protos.NotificationConfig) error {
	switch cfg.GetType() {
	case protos.NotificationType_NOTIFICATION_TYPE_EMAIL:
		return n.handleEmail(ctx, event, cfg.GetEmail())
	case protos.NotificationType_NOTIFICATION_TYPE_SLACK:
		return n.handleSlack(ctx, event, cfg.GetSlack())
	case protos.NotificationType_NOTIFICATION_TYPE_PAGERDUTY:
		return n.handlePagerDuty(ctx, event, cfg.GetPagerduty())
	default:
		return errors.Errorf("unknown notify type: %s", cfg.Type)
	}
}

func (n *Notify) handleEmail(ctx context.Context, event *Notification, cfg *protos.NotificationEmail) error {
	switch cfg.GetType() {
	case protos.NotificationEmail_TYPE_SMTP:
		return n.handleEmailSMTP(ctx, event, cfg)
	case protos.NotificationEmail_TYPE_SES:
		return n.handleEmailSES(ctx, event, cfg)
	default:
		return errors.Errorf("unknown email type: %s", cfg.Type)
	}
}

func (n *Notify) handleEmailSMTP(ctx context.Context, event *Notification, emailCfg *protos.NotificationEmail) error {
	body, err := n.getEmailBody(ctx, event, "notification")
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

func (n *Notify) handleEmailSES(ctx context.Context, event *Notification, emailCfg *protos.NotificationEmail) error {
	body, err := n.getEmailBody(ctx, event, "notification")
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
	input.SetConfigurationSetName("snitch-log")

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

func (n *Notify) handleSlack(ctx context.Context, event *Notification, cfg *protos.NotificationSlack) error {
	api := slack.New(cfg.BotToken)

	headerBlock := slack.NewHeaderBlock(slack.NewTextBlockObject(slack.PlainTextType, "Streamdal Snitch Alert", false, false))

	sectionBlock := slack.NewSectionBlock(nil, []*slack.TextBlockObject{
		slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Pipeline ID*: \n%s\n", event.Pipeline.Id), false, false),
		slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("Pipeline Name*: \n%s\n", event.Pipeline.Name), false, false),
		slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("Step Name*: \n%s\n", event.Req.StepName), false, false),
	}, nil)

	// Divider before buttons
	divBlock := slack.NewDividerBlock()

	_, _, err := api.PostMessage(
		cfg.Channel,
		slack.MsgOptionBlocks(headerBlock, divBlock, sectionBlock),
		slack.MsgOptionAsUser(true),
	)
	if err != nil {
		return errors.Wrap(err, "unable to send slack alert")
	}

	return nil
}

func (n *Notify) handlePagerDuty(ctx context.Context, event *Notification, cfg *protos.NotificationPagerDuty) error {
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
		Title:       "Streamdal Snitch Alert",
		Urgency:     urgency,
		IncidentKey: event.Pipeline.Id,
		Body: &pagerduty.APIDetails{
			Type: "incident_body",
			Details: fmt.Sprintf(
				"Pipeline ID: %s\nPipeline Name: %s\nStep Name: %s",
				event.Pipeline.Id,
				event.Pipeline.Name,
				event.Req.StepName,
			),
		},
	}

	if _, err := pdClient.CreateIncidentWithContext(ctx, cfg.Email, incidentOptions); err != nil {
		return errors.Wrap(err, "unable to send pagerduty alert")
	}

	return nil
}

func (n *Notify) getEmailBody(ctx context.Context, event *Notification, templateName string) (string, error) {
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

	data := map[string]string{
		"pipeline_name": event.Pipeline.Name,
		"step_name":     event.Req.StepName,
	}

	if err := tmpl.Execute(&body, data); err != nil {
		return "", errors.Wrapf(err, "unable to execute template '%s'", templateName)
	}

	return body.String(), nil
}
