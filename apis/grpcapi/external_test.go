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

func init() {
	go runServer()
	time.Sleep(time.Second)
}

var _ = Describe("External gRPC API", func() {
	var (
		err    error
		client protos.ExternalClient

		authMd      = metadata.New(map[string]string{"auth-token": "1234"})
		ctxWithAuth = metadata.NewOutgoingContext(context.Background(), authMd)
	)

	BeforeEach(func() {
		client, err = newClient()
		Expect(err).ToNot(HaveOccurred())
		Expect(client).ToNot(BeNil())
	})

	FDescribe("Test", func() {
		It("should return pong", func() {
			resp, err := client.Test(ctxWithAuth, &protos.TestRequest{Input: "foo"})
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Output).To(Equal("Pong: foo"))
		})

		It("should error without auth token", func() {
			resp, err := client.Test(context.Background(), &protos.TestRequest{Input: "foo"})
			Expect(err).To(HaveOccurred())
			Expect(resp).To(BeNil())
		})

		It("should error with invalid auth token", func() {
			authMd = metadata.New(map[string]string{"auth-token": "incorrect"})
			badCtx := metadata.NewOutgoingContext(context.Background(), authMd)

			resp, err := client.Test(badCtx, &protos.TestRequest{Input: "foo"})
			Expect(err).To(HaveOccurred())
			Expect(resp).To(BeNil())
			Expect(err.Error()).To(ContainSubstring("invalid auth token"))
		})
	})

	Describe("Register", func() {
		It("should register a new client", func() {

		})

		It("should error without auth token", func() {

		})

		It("should error with invalid auth token", func() {

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
})

func runServer() {
	d, err := deps.New("", &config.Config{
		Debug:                true,
		NodeName:             "test",
		AuthToken:            "1234",
		HTTPAPIListenAddress: ":9091",
		GRPCAPIListenAddress: ":9090",
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

func newClient() (protos.ExternalClient, error) {
	conn, err := grpc.Dial(":9090", grpc.WithInsecure())
	if err != nil {
		return nil, errors.Wrap(err, "can not connect with server")
	}

	return protos.NewExternalClient(conn), nil
}
