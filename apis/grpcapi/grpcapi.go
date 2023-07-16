package grpcapi

import (
	"context"
	"fmt"
	"net"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/streamdal/snitch-server/deps"
)

const (
	GRPCAuthMetadataKey = "authorization"
)

var (
	GRPCMissingAuthError = errors.New("missing auth token")
	GRPCInvalidAuthError = errors.New("invalid auth token")
)

type GRPCAPI struct {
	Deps *deps.Dependencies
	log  *logrus.Entry
}

func New(d *deps.Dependencies) *GRPCAPI {
	return &GRPCAPI{
		Deps: d,
		log:  logrus.WithField("pkg", "grpcapi"),
	}
}

func (g *GRPCAPI) Run() error {
	llog := g.log.WithField("method", "Run")

	lis, err := net.Listen("tcp", g.Deps.Config.GRPCAPIListenAddress)
	if err != nil {
		return errors.Wrapf(err, "unable to listen on %s", g.Deps.Config.GRPCAPIListenAddress)
	}

	opts := []grpc.ServerOption{
		grpc.UnaryInterceptor(g.AuthServerUnaryInterceptor()),
	}

	grpcServer := grpc.NewServer(opts...)

	protos.RegisterInternalServer(grpcServer, g.newInternalServer())
	protos.RegisterExternalServer(grpcServer, g.newExternalServer())

	llog.Infof("GRPCAPI server listening on %v", g.Deps.Config.GRPCAPIListenAddress)

	// TODO: Implement listening to ctx
	return grpcServer.Serve(lis)
}

// AuthServerUnaryInterceptor is a GRPC interceptor (middleware) that checks
// for a valid auth token
func (g *GRPCAPI) AuthServerUnaryInterceptor() grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, fmt.Errorf("couldn't parse incoming context metadata")
		}

		auth := md.Get(GRPCAuthMetadataKey)
		if len(auth) == 0 {
			return nil, GRPCMissingAuthError
		}

		if auth[0] != g.Deps.Config.AuthToken {
			return nil, GRPCInvalidAuthError
		}

		return handler(ctx, req)
	}
}
