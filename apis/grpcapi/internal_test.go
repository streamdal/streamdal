package grpcapi

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/streamdal/snitch-protos/build/go/protos"
)

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

	Describe("Auth", func() {
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
