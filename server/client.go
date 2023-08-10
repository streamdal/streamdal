// Package server is a wrapper for the Client gRPC API.
// It provides a simple interface to interact with and mock.
package server

import (
	"context"
	"time"

	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/streamdal/snitch-go-client/types"
	"github.com/streamdal/snitch-protos/build/go/protos"
)

//go:generate go run github.com/maxbrunsfeld/counterfeiter/v6 . IServerClient
type IServerClient interface {
	HeartBeat(ctx context.Context, sessionID string) error

	// Notify sends a command to the snitch server which triggers the configured notification
	// rules for the specified pipeline
	Notify(ctx context.Context, pipeline *protos.Pipeline, step *protos.PipelineStep, aud *protos.Audience) error

	// SendMetrics sends counter(s) to the snitch server
	SendMetrics(ctx context.Context, counter *types.CounterEntry) error

	// Register registers a new client with the server
	Register(ctx context.Context, req *protos.RegisterRequest) (protos.Internal_RegisterClient, error)

	// NewAudience signals a new audience to the snitch server
	NewAudience(ctx context.Context, aud *protos.Audience, sessionID string) error

	GetAttachCommandsByService(ctx context.Context, service string) ([]*protos.Command, error)
}

const (
	dialTimeout = time.Second * 5
)

type Client struct {
	Token  string
	Conn   *grpc.ClientConn
	Server protos.InternalClient
}

// New dials a plumber GRPC server and returns IServerClient
func New(plumberAddress, plumberToken string) (*Client, error) {
	dialCtx, dialCancel := context.WithTimeout(context.Background(), dialTimeout)
	defer dialCancel()

	conn, err := grpc.DialContext(dialCtx, plumberAddress, grpc.WithInsecure())
	if err != nil {
		return nil, errors.Wrap(err, "Could not dial GRPC server: %s")
	}

	return &Client{
		Conn:   conn,
		Server: protos.NewInternalClient(conn),
		Token:  plumberToken,
	}, nil
}

func (c *Client) Notify(ctx context.Context, pipeline *protos.Pipeline, step *protos.PipelineStep, aud *protos.Audience) error {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	req := &protos.NotifyRequest{
		PipelineId:          pipeline.Id,
		Audience:            aud,
		StepName:            step.Name,
		OccurredAtUnixTsUtc: time.Now().UTC().Unix(),
	}

	if _, err := c.Server.Notify(ctx, req); err != nil {
		return errors.Wrap(err, "unable to send rule notification")
	}

	return nil
}

func (c *Client) SendMetrics(ctx context.Context, counter *types.CounterEntry) error {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	labels := make(map[string]string)
	for k, v := range counter.Labels {
		labels[k] = v
	}

	// Only pass these labels if set.
	// Prometheus is not able to handle variable labels.
	if counter.RuleID != "" {
		labels["rule_id"] = counter.RuleID
		labels["ruleset_id"] = counter.RuleSetID
	}

	labels["type"] = string(counter.Type)

	req := &protos.MetricsRequest{
		Metrics: []*protos.Metrics{
			{
				Name:   string(counter.Name),
				Value:  float64(counter.Value),
				Labels: labels,
			},
		},
	}

	if _, err := c.Server.Metrics(ctx, req); err != nil {
		return errors.Wrap(err, "unable to send metrics")
	}

	return nil
}

func (c *Client) Register(ctx context.Context, req *protos.RegisterRequest) (protos.Internal_RegisterClient, error) {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	return c.Server.Register(ctx, req)
}

func (c *Client) NewAudience(ctx context.Context, aud *protos.Audience, sessionID string) error {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	_, err := c.Server.NewAudience(ctx, &protos.NewAudienceRequest{
		Audience:  aud,
		SessionId: sessionID,
	})
	return err
}

func (c *Client) HeartBeat(ctx context.Context, sessionID string) error {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	_, err := c.Server.Heartbeat(ctx, &protos.HeartbeatRequest{SessionId: sessionID})
	return err
}

func (c *Client) GetAttachCommandsByService(ctx context.Context, service string) ([]*protos.Command, error) {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	resp, err := c.Server.GetAttachCommandsByService(ctx, &protos.GetAttachCommandsByServiceRequest{ServiceName: service})
	if err != nil {
		return nil, errors.Wrap(err, "unable to get attach commands by service")
	}

	return resp.Commands, nil
}
