package grpcapi

import (
	"context"
	"fmt"
	"net"
	"strings"

	"github.com/cactus/go-statsd-client/v5/statsd"
	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/reflection"
	_ "google.golang.org/grpc/reflection"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	"github.com/streamdal/streamdal/apps/server/config"
	"github.com/streamdal/streamdal/apps/server/services/bus"
	"github.com/streamdal/streamdal/apps/server/services/cmd"
	"github.com/streamdal/streamdal/apps/server/services/kv"
	"github.com/streamdal/streamdal/apps/server/services/metrics"
	"github.com/streamdal/streamdal/apps/server/services/notify"
	"github.com/streamdal/streamdal/apps/server/services/pubsub"
	"github.com/streamdal/streamdal/apps/server/services/store"
	"github.com/streamdal/streamdal/apps/server/services/wasm"
	"github.com/streamdal/streamdal/apps/server/types"
	"github.com/streamdal/streamdal/apps/server/util"
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
	Options *Options
	log     *logrus.Entry
}

type stackTracer interface {
	StackTrace() errors.StackTrace
}

type Options struct {
	Config          *config.Config
	MetricsService  metrics.IMetrics
	StoreService    store.IStore
	BusService      bus.IBus
	ShutdownContext context.Context
	CmdService      cmd.ICmd
	NotifyService   notify.INotifier
	RedisBackend    *redis.Client
	PubSubService   pubsub.IPubSub
	KVService       kv.IKV
	Telemetry       statsd.Statter
	WasmService     wasm.IWasm
	DemoMode        bool
	InstallID       string
	NodeID          string
}

func New(o *Options) (*GRPCAPI, error) {
	if err := validateOptions(o); err != nil {
		return nil, errors.Wrap(err, "could not validate options")
	}

	return &GRPCAPI{
		Options: o,
		log:     logrus.WithField("pkg", "grpcapi"),
	}, nil
}

func (g *GRPCAPI) Run() error {
	llog := g.log.WithField("method", "Run")

	lis, err := net.Listen("tcp", g.Options.Config.GRPCAPIListenAddress)
	if err != nil {
		return errors.Wrapf(err, "unable to listen on %s", g.Options.Config.GRPCAPIListenAddress)
	}

	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			g.TelemetryUnaryInterceptor,
			g.AuthServerUnaryInterceptor,
			g.RequestIDServerUnaryInterceptor,
		),
		grpc.ChainStreamInterceptor(
			g.TelemetryStreamInterceptor,
			g.AuthServerStreamInterceptor,
			g.RequestIDServerStreamInterceptor,
		),
	)

	protos.RegisterInternalServer(grpcServer, g.newInternalServer())
	protos.RegisterExternalServer(grpcServer, g.newExternalServer())

	reflection.Register(grpcServer)

	// Watch for cancellation
	go func() {
		<-g.Options.ShutdownContext.Done()
		llog.Debug("context cancellation detected")

		grpcServer.Stop()
	}()

	llog.Infof("GRPCAPI server listening on %v", g.Options.Config.GRPCAPIListenAddress)

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

func (g *GRPCAPI) AuthServerStreamInterceptor(srv interface{}, stream grpc.ServerStream, _ *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	if err := g.validateAuth(stream.Context()); err != nil {
		return err
	}

	return handler(srv, stream)
}

func (g *GRPCAPI) TelemetryStreamInterceptor(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	// Only want telemetry on external API calls
	if strings.Contains(info.FullMethod, "protos.Internal") {
		return handler(srv, stream)
	}

	tags := []statsd.Tag{
		{"install_id", g.Options.InstallID},
		{"node_id", g.Options.NodeID},
		{"source", "server"},
	}

	methodName := util.GrpcMethodCounterName(info.FullMethod)
	if methodName != "" {
		tags = append(tags, statsd.Tag{"method", methodName})
		if err := g.Options.Telemetry.Inc(methodName, 1, 1.0, tags...); err != nil {
			g.log.WithError(err).Debugf("unable to increment telemetry counter")
		}
	}

	if err := handler(srv, stream); err != nil {
		tags = append(tags, statsd.Tag{"error", err.Error()})

		// Include code location if it's available
		if err, ok := err.(stackTracer); ok {
			stack := err.StackTrace()
			loc := fmt.Sprintf("%s:%d", stack[0], stack[0])
			tags = append(tags, statsd.Tag{"location", loc})
		}

		_ = g.Options.Telemetry.Inc(types.CounterErrorsTotal, 1, 1.0, tags...)
		return err
	}

	return nil
}

func (g *GRPCAPI) TelemetryUnaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	// Only want telemetry on external API calls
	if strings.Contains(info.FullMethod, "protos.Internal") {
		return handler(ctx, req)
	}

	tags := []statsd.Tag{
		{"install_id", g.Options.InstallID},
		{"node_id", g.Options.NodeID},
		{"source", "server"},
	}

	methodName := util.GrpcMethodCounterName(info.FullMethod)
	if methodName != "" {
		tags = append(tags, statsd.Tag{"method", methodName})
		if err := g.Options.Telemetry.Inc(methodName, 1, 1.0, tags...); err != nil {
			g.log.WithError(err).Debugf("unable to increment telemetry counter")
		}
	}

	resp, err := handler(ctx, req)
	if err != nil {
		tags = append(tags, statsd.Tag{"error", err.Error()})

		// Include code location if it's available
		if err, ok := err.(stackTracer); ok {
			stack := err.StackTrace()
			loc := fmt.Sprintf("%s:%d", stack[0], stack[0])
			tags = append(tags, statsd.Tag{"location", loc})
		}

		_ = g.Options.Telemetry.Inc(types.CounterErrorsTotal, 1, 1.0, tags...)
	}

	return resp, err
}

// Have to do this so we can modify context
type serverStream struct {
	grpc.ServerStream
	ctx context.Context
}

func (s *serverStream) Context() context.Context {
	return s.ctx
}

func (g *GRPCAPI) RequestIDServerStreamInterceptor(srv interface{}, stream grpc.ServerStream, _ *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
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

	if auth[0] != g.Options.Config.AuthToken {
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

func validateOptions(o *Options) error {
	if o == nil {
		return errors.New("options cannot be nil")
	}

	if o.Config == nil {
		return errors.New("options.Config cannot be nil")
	}

	if o.Config.GRPCAPIListenAddress == "" {
		return errors.New("options.Config.GRPCAPIListenAddress cannot be empty")
	}

	if o.BusService == nil {
		return errors.New("options.BusService cannot be nil")
	}

	if o.StoreService == nil {
		return errors.New("options.StoreService cannot be nil")
	}

	if o.ShutdownContext == nil {
		return errors.New("options.ShutdownContext cannot be nil")
	}

	if o.CmdService == nil {
		return errors.New("options.CmdService cannot be nil")
	}

	if o.NotifyService == nil {
		return errors.New("options.NotifyService cannot be nil")
	}

	if o.RedisBackend == nil {
		return errors.New("options.RedisBackend cannot be nil")
	}

	if o.PubSubService == nil {
		return errors.New("options.PubSubService cannot be nil")
	}

	if o.MetricsService == nil {
		return errors.New("options.MetricsService cannot be nil")
	}

	if o.KVService == nil {
		return errors.New("options.KVService cannot be nil")
	}

	if o.WasmService == nil {
		return errors.New("options.WasmService cannot be nil")
	}

	return nil
}
