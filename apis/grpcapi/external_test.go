package grpcapi

import (
	"context"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/pkg/errors"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/streamdal/snitch-server/config"
	"github.com/streamdal/snitch-server/deps"
)

const (
	GRPCAPIAddress = ":19090"
	HTTPAPIAddress = ":19091"
	AuthToken      = "1234"
)

var (
	ctxWithNoAuth   = context.Background()
	ctxWithBadAuth  = metadata.NewOutgoingContext(context.Background(), metadata.New(map[string]string{"auth-token": "incorrect"}))
	ctxWithGoodAuth = metadata.NewOutgoingContext(context.Background(), metadata.New(map[string]string{"auth-token": AuthToken}))
)

func init() {
	go runServer()
	time.Sleep(time.Second)
}

type AuthTest struct {
	Name               string
	Func               func() error
	ShouldError        bool
	ErrorShouldContain string
}

var _ = Describe("External gRPC API", func() {
	var (
		err            error
		externalClient protos.ExternalClient
	)

	BeforeEach(func() {
		externalClient, err = newExternalClient()
		Expect(err).ToNot(HaveOccurred())
		Expect(externalClient).ToNot(BeNil())
	})

	Describe("Auth", func() {
		It("auth should be enforced", func() {
			authTests := []AuthTest{
				{
					Name: "External.Test without auth",
					Func: func() error {
						_, err := externalClient.Test(ctxWithNoAuth, &protos.TestRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.Test with bad auth",
					Func: func() error {
						_, err := externalClient.Test(ctxWithBadAuth, &protos.TestRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "invalid auth token",
				},
				{
					Name: "External.Test with good auth",
					Func: func() error {
						_, err := externalClient.Test(ctxWithGoodAuth, &protos.TestRequest{})
						return err
					},
					ShouldError: false,
				},
				// Don't think we need to test every auth mutation from this point;
				// test that auth is enabled on every endpoint
				{
					Name: "External.GetPipeline without auth",
					Func: func() error {
						_, err := externalClient.GetPipeline(ctxWithNoAuth, &protos.GetPipelineRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.GetPipelines without auth",
					Func: func() error {
						_, err := externalClient.GetPipelines(ctxWithNoAuth, &protos.GetPipelinesRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.CreatePipeline without auth",
					Func: func() error {
						_, err := externalClient.CreatePipeline(ctxWithNoAuth, &protos.CreatePipelineRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.DeletePipeline without auth",
					Func: func() error {
						_, err := externalClient.DeletePipeline(ctxWithNoAuth, &protos.DeletePipelineRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.UpdatePipeline without auth",
					Func: func() error {
						_, err := externalClient.UpdatePipeline(ctxWithNoAuth, &protos.UpdatePipelineRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.AttachPipeline without auth",
					Func: func() error {
						_, err := externalClient.AttachPipeline(ctxWithNoAuth, &protos.AttachPipelineRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.DetachPipeline without auth",
					Func: func() error {
						_, err := externalClient.DetachPipeline(ctxWithNoAuth, &protos.DetachPipelineRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.GetServiceMap without auth",
					Func: func() error {
						_, err := externalClient.GetServiceMap(ctxWithNoAuth, &protos.GetServiceMapRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
			}

			for _, a := range authTests {
				err := a.Func()
				if a.ShouldError {
					Expect(err).To(HaveOccurred(), a.Name)
					Expect(err.Error()).To(ContainSubstring(a.ErrorShouldContain), a.Name)
				} else {
					Expect(err).ToNot(HaveOccurred(), a.Name)
				}
			}
		})
	})

	Describe("Test", func() {
		It("should return pong", func() {
			resp, err := externalClient.Test(ctxWithGoodAuth, &protos.TestRequest{Input: "foo"})
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Output).To(Equal("Pong: foo"))
		})
	})

	Describe("CreatePipeline", func() {
	})

	Describe("GetPipeline", func() {
	})

	Describe("GetPipelines", func() {
	})

	Describe("UpdatePipeline", func() {
	})

	Describe("DeletePipeline", func() {
	})

	Describe("AttachPipeline", func() {
	})

	Describe("DetachPipeline", func() {
	})

	Describe("PausePipeline", func() {
	})

	Describe("ResumePipeline", func() {
	})
})

var _ = Describe("Internal gRPC API", func() {
	var (
		err            error
		internalClient protos.InternalClient
	)

	BeforeEach(func() {
		internalClient, err = newInternalClient()
		Expect(err).ToNot(HaveOccurred())
		Expect(internalClient).ToNot(BeNil())
	})

	FDescribe("Auth", func() {
		It("auth should be enforced", func() {
			authTests := []AuthTest{
				{
					Name: "Internal.Heartbeat without auth",
					Func: func() error {
						_, err := internalClient.Heartbeat(ctxWithNoAuth, &protos.HeartbeatRequest{SessionId: "foo"})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "Internal.Heartbeat with bad auth",
					Func: func() error {
						_, err := internalClient.Heartbeat(ctxWithBadAuth, &protos.HeartbeatRequest{SessionId: "foo"})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "invalid auth token",
				},
				{
					Name: "Internal.Heartbeat with good auth",
					Func: func() error {
						_, err := internalClient.Heartbeat(ctxWithGoodAuth, &protos.HeartbeatRequest{SessionId: "foo"})
						return err
					},
					ShouldError: false,
				},
				// Not testing every auth case anymore, just testing base auth
				// for each gRPC method

				{
					Name: "Internal.Register without auth",
					Func: func() error {
						// Register() is a streaming RPC so we need to test it differently
						registerClient, err := internalClient.Register(ctxWithNoAuth, &protos.RegisterRequest{})
						Expect(err).ToNot(HaveOccurred())

						// Auth error won't happen until we try to recv
						_, err = registerClient.Recv()

						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "Internal.NewAudience without auth",
					Func: func() error {
						_, err := internalClient.NewAudience(ctxWithNoAuth, &protos.NewAudienceRequest{})
						return err
					},
					ShouldError: true,
				},
				{
					Name: "Internal.Notify without auth",
					Func: func() error {
						_, err := internalClient.Notify(ctxWithNoAuth, &protos.NotifyRequest{})
						return err
					},
					ShouldError: true,
				},
				{
					Name: "Internal.Metrics without auth",
					Func: func() error {
						_, err := internalClient.Metrics(ctxWithNoAuth, &protos.MetricsRequest{})
						return err
					},
					ShouldError: true,
				},
			}

			for _, a := range authTests {
				err := a.Func()
				if a.ShouldError {
					Expect(err).To(HaveOccurred(), a.Name)
					Expect(err.Error()).To(ContainSubstring(a.ErrorShouldContain), a.Name)
				} else {
					Expect(err).ToNot(HaveOccurred(), a.Name)
				}
			}
		})
	})

	Describe("Register", func() {
		It("should register a new externalClient", func() {
		})

		It("should error with no session ID", func() {

		})

		It("should remove session keys from K/V on deregister", func() {

		})

		It("keys should disappear without heartbeat", func() {

		})
	})

	Describe("Heartbeat", func() {
		It("heartbeat should update all session keys in live bucket", func() {

		})

		It("keys should disappear without heartbeat", func() {

		})
	})

	Describe("NewAudience", func() {
		It("should create a new audience in live bucket", func() {

		})

		It("audience should disappear without heartbeat", func() {

		})

		It("audience should remain if heartbeat is received", func() {

		})
	})

	Describe("Metrics", func() {
	})

	Describe("Notify", func() {
	})
})

func runServer() {
	d, err := deps.New("", &config.Config{
		Debug:                true,
		NodeName:             "test",
		AuthToken:            AuthToken,
		HTTPAPIListenAddress: HTTPAPIAddress,
		GRPCAPIListenAddress: GRPCAPIAddress,
		NATSURL:              []string{"localhost:4222"},
		NATSUseTLS:           false,
		NATSTLSSkipVerify:    true,
	})

	if err != nil {
		panic("error creating deps: " + err.Error())
	}

	if err := New(d).Run(); err != nil {
		panic("error running grpcapi: " + err.Error())
	}
}

func newExternalClient() (protos.ExternalClient, error) {
	conn, err := grpc.Dial(GRPCAPIAddress, grpc.WithInsecure())
	if err != nil {
		return nil, errors.Wrap(err, "can not connect with server")
	}

	return protos.NewExternalClient(conn), nil
}

func newInternalClient() (protos.InternalClient, error) {
	conn, err := grpc.Dial(GRPCAPIAddress, grpc.WithInsecure())
	if err != nil {
		return nil, errors.Wrap(err, "can not connect with server")
	}

	return protos.NewInternalClient(conn), nil
}
