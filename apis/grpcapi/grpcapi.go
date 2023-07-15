package grpcapi

import (
	"net"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/grpc"

	"github.com/batchcorp/snitch-server/deps"
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

	var opts []grpc.ServerOption

	grpcServer := grpc.NewServer(opts...)

	protos.RegisterInternalServer(grpcServer, g.newInternalServer())
	protos.RegisterExternalServer(grpcServer, g.newExternalServer())

	llog.Infof("GRPCAPI server listening on %v", g.Deps.Config.GRPCAPIListenAddress)

	return grpcServer.Serve(lis)
}
