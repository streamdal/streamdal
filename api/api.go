package api

import (
	"context"
	"time"

	"github.com/charmbracelet/log"
	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"

	"github.com/streamdal/snitch-cli/util"
)

const (
	AuthTokenMetadata = "auth-token"
)

type Options struct {
	Address        string
	AuthToken      string
	ConnectTimeout time.Duration
	DisableTLS     bool
}

type API struct {
	conn    *grpc.ClientConn
	client  protos.ExternalClient
	options *Options
	log     *log.Logger
}

func New(opts *Options) (*API, error) {
	if err := validateOptions(opts); err != nil {
		return nil, errors.Wrap(err, "unable to validate api options")
	}

	// Attempt to connect
	connectCtx, _ := context.WithTimeout(context.Background(), opts.ConnectTimeout)

	conn, err := connect(opts, connectCtx)
	if err != nil {
		return nil, errors.Wrap(err, "unable to connect to gRPC server")
	}

	return &API{
		conn:    conn,
		client:  protos.NewExternalClient(conn),
		options: opts,
		log:     log.With("pkg", "api"),
	}, nil
}

func connect(opts *Options, connectCtx context.Context) (*grpc.ClientConn, error) {
	dialOptions := make([]grpc.DialOption, 0)

	if opts.DisableTLS {
		dialOptions = append(dialOptions, grpc.WithTransportCredentials(insecure.NewCredentials()))
	}

	conn, err := grpc.DialContext(connectCtx, opts.Address, dialOptions...)
	if err != nil {
		return nil, errors.Wrap(err, "unable to dial gRPC server")
	}

	return conn, nil
}

// Test performs a test connect to the gRPC API. We use this method to verify
// that we are able to talk to the gRPC server.
func (a *API) Test(ctx context.Context) error {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs(AuthTokenMetadata, a.options.AuthToken))

	if _, err := a.client.Test(ctx, &protos.TestRequest{}); err != nil {
		return errors.Wrap(err, "unable to complete test request")
	}

	return nil
}

// GetAllLiveAudiences returns all live audiences -- clients that are actively
// connected to the snitch server and have announced one or more audiences)
func (a *API) GetAllLiveAudiences(ctx context.Context) ([]*protos.Audience, error) {
	ctx = metadata.NewOutgoingContext(ctx, metadata.Pairs(AuthTokenMetadata, a.options.AuthToken))

	getAllResp, err := a.client.GetAll(ctx, &protos.GetAllRequest{})
	if err != nil {
		return nil, errors.Wrap(err, "unable to complete get all request")
	}

	if err := validateGetAllResp(getAllResp); err != nil {
		return nil, errors.Wrap(err, "invalid get all response")
	}

	liveAudiences := make([]*protos.Audience, 0)

	for _, live := range getAllResp.Live {
		for _, aud := range live.Audiences {
			if !util.ContainsAudience(aud, liveAudiences) {
				liveAudiences = append(liveAudiences, aud)
			}
		}
	}

	return liveAudiences, nil
}

func validateGetAllResp(resp *protos.GetAllResponse) error {
	if resp == nil {
		return errors.New("get all response cannot be nil")
	}

	// No need to check .Live for nil, as the default will be empty

	return nil
}

func validateOptions(opts *Options) error {
	if opts == nil {
		return errors.New("options cannot be nil")
	}

	if opts.Address == "" {
		return errors.New("address cannot be empty")
	}

	if opts.AuthToken == "" {
		return errors.New("auth token cannot be empty")
	}

	if opts.ConnectTimeout < time.Second {
		return errors.New("connect timeout must be at least 1 second")
	}

	return nil
}
