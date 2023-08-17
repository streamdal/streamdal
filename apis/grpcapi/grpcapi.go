package grpcapi

import (
	"context"
	"net"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/reflection"
	_ "google.golang.org/grpc/reflection"

	"github.com/streamdal/snitch-server/deps"
	"github.com/streamdal/snitch-server/util"
)

const (
	GRPCAuthMetadataKey      = "auth-token"
	GRPCRequestIDMetadataKey = "request-id"
)

var (
	GRPCMissingAuthError     = errors.New("missing auth token")
	GRPCInvalidAuthError     = errors.New("invalid auth token")
	GRPCServerShutdownError  = errors.New("server shutting down")
	GRPCMissingMetadataError = errors.New("missing metadata; misconfigured grpc client?")
)

type GRPCAPI struct {
	Deps *deps.Dependencies
	log  *logrus.Entry
}

func New(d *deps.Dependencies) (*GRPCAPI, error) {
	if err := validateOptions(d); err != nil {
		return nil, errors.Wrap(err, "could not validate dependencies")
	}

	return &GRPCAPI{
		Deps: d,
		log:  logrus.WithField("pkg", "grpcapi"),
	}, nil
}

func (g *GRPCAPI) Run() error {
	llog := g.log.WithField("method", "Run")

	lis, err := net.Listen("tcp", g.Deps.Config.GRPCAPIListenAddress)
	if err != nil {
		return errors.Wrapf(err, "unable to listen on %s", g.Deps.Config.GRPCAPIListenAddress)
	}

	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			g.AuthServerUnaryInterceptor,
			g.RequestIDServerUnaryInterceptor,
		),
		grpc.ChainStreamInterceptor(
			g.AuthServerStreamInterceptor,
			g.RequestIDServerStreamInterceptor,
		),
	)

	protos.RegisterInternalServer(grpcServer, g.newInternalServer())
	protos.RegisterExternalServer(grpcServer, g.newExternalServer())

	reflection.Register(grpcServer)

	// Watch for cancellation
	go func() {
		<-g.Deps.ShutdownContext.Done()
		llog.Debug("context cancellation detected")

		grpcServer.Stop()
	}()

	llog.Infof("GRPCAPI server listening on %v", g.Deps.Config.GRPCAPIListenAddress)

	return grpcServer.Serve(lis)
}

// AuthServerUnaryInterceptor is a GRPC interceptor (middleware) that checks
// for a valid auth token
func (g *GRPCAPI) AuthServerUnaryInterceptor(ctx context.Context, req interface{}, _ *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	if err := g.validateAuth(ctx); err != nil {
		return nil, err
	}

	return handler(ctx, req)
}

func (g *GRPCAPI) AuthServerStreamInterceptor(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	if err := g.validateAuth(stream.Context()); err != nil {
		return err
	}

	return handler(srv, stream)
}

// Have to do this so we can modify context
type serverStream struct {
	grpc.ServerStream
	ctx context.Context
}

func (s *serverStream) Context() context.Context {
	return s.ctx
}

func (g *GRPCAPI) RequestIDServerStreamInterceptor(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	outgoingCtx, err := g.setRequestID(stream.Context())
	if err != nil {
		return err
	}

	return handler(srv, &serverStream{stream, outgoingCtx})
}

func (g *GRPCAPI) validateAuth(ctx context.Context) error {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return GRPCMissingMetadataError
	}

	auth := md.Get(GRPCAuthMetadataKey)
	if len(auth) == 0 {
		return GRPCMissingAuthError
	}

	if auth[0] != g.Deps.Config.AuthToken {
		return GRPCInvalidAuthError
	}

	return nil
}

// RequestIDServerUnaryInterceptor will set a request ID if one is not already set
func (g *GRPCAPI) RequestIDServerUnaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	outgoingCtx, err := g.setRequestID(ctx)
	if err != nil {
		return nil, err
	}

	return handler(outgoingCtx, req)
}

func (g *GRPCAPI) setRequestID(ctx context.Context) (context.Context, error) {
	existingMD, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, GRPCMissingMetadataError
	}

	values := existingMD.Get(GRPCRequestIDMetadataKey)

	// Request ID not set - set a new one
	if len(values) == 0 {
		existingMD.Append(GRPCRequestIDMetadataKey, util.GenerateUUID())
		ctx = metadata.NewIncomingContext(ctx, existingMD)
	}

	return ctx, nil
}

func validateOptions(d *deps.Dependencies) error {
	if d == nil {
		return errors.New("dependencies cannot be nil")
	}

	if d.Config == nil {
		return errors.New("deps.Config cannot be nil")
	}

	if d.Config.GRPCAPIListenAddress == "" {
		return errors.New("deps.Config.GRPCAPIListenAddress cannot be empty")
	}

	return nil
}
