// Package server is a wrapper for the Client gRPC API.
// It provides a simple interface to interact with and mock.
package server

import (
	"context"
	"time"

	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-go-client/types"
)

//go:generate go run github.com/maxbrunsfeld/counterfeiter/v6 . IServerClient
type IServerClient interface {
	// GetAttachCommandsByService is called in New() in order to get all AttachCommands in a synchronous manner
	// before we allow the client to start processing.
	GetAttachCommandsByService(ctx context.Context, service string) (*protos.GetAttachCommandsByServiceResponse, error)

	// GetTailStream returns a gRPC client stream used to send TailResponses to the snitch server
	GetTailStream(ctx context.Context) (protos.Internal_SendTailClient, error)

	// HeartBeat sends a heartbeat to the snitch server
	HeartBeat(ctx context.Context, sessionID string) error

	// NewAudience announces a new audience to the snitch server
	NewAudience(ctx context.Context, aud *protos.Audience, sessionID string) error

	// Notify calls to snitch server to trigger the configured notification rules for the specified step
	Notify(ctx context.Context, pipeline *protos.Pipeline, step *protos.PipelineStep, aud *protos.Audience) error

	// Register registers a new client with the snitch server.
	// This is ran in a goroutine and constantly listens for commands from the snitch server
	// such as AttachPipeline, DetachPipeline, etc
	Register(ctx context.Context, req *protos.RegisterRequest) (protos.Internal_RegisterClient, error)

	// SendMetrics ships counter(s) to the snitch server
	SendMetrics(ctx context.Context, counter *types.CounterEntry) error

	// SendSchema sends a schema to the snitch server
	SendSchema(ctx context.Context, aud *protos.Audience, jsonSchema []byte) error
}

const (
	maxGRPCMessageRecvSize = 10 * 1024 * 1024 // 10MB
	dialTimeout            = time.Second * 5
)

type Client struct {
	Token  string
	Conn   *grpc.ClientConn
	Server protos.InternalClient
}

// New dials a snitch GRPC server and returns IServerClient
func New(snitchAddress, snitchToken string) (*Client, error) {
	dialCtx, dialCancel := context.WithTimeout(context.Background(), dialTimeout)
	defer dialCancel()

	opts := make([]grpc.DialOption, 0)
	opts = append(opts,
		grpc.WithDefaultCallOptions(grpc.MaxCallRecvMsgSize(maxGRPCMessageRecvSize)),
		grpc.WithInsecure(),
	)

	conn, err := grpc.DialContext(dialCtx, snitchAddress, opts...)
	if err != nil {
		return nil, errors.Wrap(err, "could not dial GRPC server: %s")
	}

	return &Client{
		Conn:   conn,
		Server: protos.NewInternalClient(conn),
		Token:  snitchToken,
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

	req := &protos.MetricsRequest{
		Metrics: []*protos.Metric{
			{
				Name:     string(counter.Name),
				Audience: counter.Audience,
				Value:    float64(counter.Value),
				Labels:   labels,
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

func (c *Client) GetAttachCommandsByService(ctx context.Context, service string) (*protos.GetAttachCommandsByServiceResponse, error) {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	resp, err := c.Server.GetAttachCommandsByService(ctx, &protos.GetAttachCommandsByServiceRequest{ServiceName: service})
	if err != nil {
		return nil, errors.Wrap(err, "unable to get attach commands by service")
	}

	return resp, nil
}

func (c *Client) GetTailStream(ctx context.Context) (protos.Internal_SendTailClient, error) {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	srv, err := c.Server.SendTail(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to talk to snitch server")
	}

	return srv, nil
}

func (c *Client) SendSchema(ctx context.Context, aud *protos.Audience, jsonSchema []byte) error {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs("auth-token", c.Token))

	req := &protos.SendSchemaRequest{
		Audience: aud,
		Schema: &protos.Schema{
			JsonSchema: jsonSchema,
		},
	}

	_, err := c.Server.SendSchema(ctx, req)
	if err != nil {
		return errors.Wrap(err, "unable to send schema")
	}

	return nil
}
