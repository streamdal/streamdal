package grpcapi

import (
	"context"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/redis/go-redis/v9"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"

	"github.com/streamdal/streamdal/apps/server/services/store"
	"github.com/streamdal/streamdal/apps/server/util"
)

// These tests expect the gRPC server and redis to be running. The server is
// launched automatically via init() in external_test. Redis should be started
// outside the test.
//
// NOTE: We are using 5s TTLs for register and live* keys in Redis. If they are
// any lower, they might not get cleaned up in time by Redis and this will cause
// tests to fail.
var _ = Describe("Internal gRPC API", func() {
	var (
		internalClientErr error
		internalClient    protos.InternalClient
	)

	BeforeEach(func() {
		internalClient, internalClientErr = newInternalClient()
		Expect(internalClientErr).ToNot(HaveOccurred())
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
		// Testing a streaming RPC is not great - the test is flakey because of
		// the sleeps but should get the job done for now. ~DS 08/2023
		//
		// This tests the following:
		// - Registering a new SDK client works
		// - Registering a new SDK client creates register & live* keys in Redis
		// - When registration is cancelled, register & live* keys are auto-deleted
		It("should register a new internal client", func() {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			registerRequest := newRegisterRequest()

			go func() {
				resp, err := internalClient.Register(ctxWithGoodAuth, registerRequest)
				Expect(err).ToNot(HaveOccurred())
				Expect(resp).ToNot(BeNil())

				// TODO: Test that server sends periodic keepalives

				// Run until context is cancelled
				<-ctx.Done()

				// Close the stream
				Expect(resp.CloseSend()).ToNot(HaveOccurred())
			}()

			// Wait a little bit for register to go through + create KVs + send keepalive
			time.Sleep(time.Second)

			// Verify that register K/V is created
			data, err := redisClient.Get(context.Background(), store.RedisRegisterKey(registerRequest.SessionId, TestNodeName)).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeEmpty())

			// Verify that audience K/V's are created
			for _, aud := range registerRequest.Audiences {
				_, err := redisClient.Get(ctx, store.RedisLiveKey(
					registerRequest.SessionId,
					TestNodeName,
					util.AudienceToStr(aud),
				)).Result()

				Expect(err).ToNot(HaveOccurred())
			}

			// Tell register to quit -> live* keys should be removed
			cancel()

			// Allow for the TTL to hit (because Register is not running and auto-refreshing)
			time.Sleep(7 * time.Second)

			data, err = redisClient.Get(context.Background(), store.RedisRegisterKey(registerRequest.SessionId, TestNodeName)).Result()
			Expect(err).To(HaveOccurred())
			Expect(err).To(Equal(redis.Nil))
			Expect(data).To(BeEmpty())

			// Audience keys should disappear as well
			for _, aud := range registerRequest.Audiences {
				data, err := redisClient.Get(context.Background(), store.RedisLiveKey(
					registerRequest.SessionId,
					TestNodeName,
					util.AudienceToStr(aud),
				)).Result()

				Expect(err).To(HaveOccurred())
				Expect(err).To(Equal(redis.Nil))
				Expect(data).To(BeEmpty())
			}
		})

		It("should error with no session ID", func() {
			registerRequest := newRegisterRequest()
			registerRequest.SessionId = ""

			// Since Register() is a streaming method, it won't error until we try to recv
			resp, err := internalClient.Register(ctxWithGoodAuth, registerRequest)
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())

			cmd, err := resp.Recv()
			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("field 'SessionId' cannot be empty"))
			Expect(cmd).To(BeNil())
		})

		It("registering with an audience should create a new audience", func() {

		})

		// TODO: Cases to test:
		// 1. Registering without filled out fields should error
		// 2. Registering with an audience should create a new audience (is this a thing in the protos?)
	})

	Describe("NewAudience", func() {
		It("should create a new audience in store", func() {
			sessionID := util.GenerateUUID()
			audience := &protos.Audience{
				ServiceName:   "test-service",
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "main",
			}

			Expect(sessionID).ToNot(BeEmpty())

			resp, err := internalClient.NewAudience(ctxWithGoodAuth, &protos.NewAudienceRequest{
				SessionId: sessionID,
				Audience:  audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("Audience created"))
			Expect(resp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			liveKeys, err := redisClient.Keys(context.Background(), store.RedisLivePrefix+":*").Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(liveKeys).ToNot(BeEmpty())

			// TODO: Verify that K/V is created with `streamdal_live` prefix
			liveData, err := redisClient.Get(
				context.Background(),
				store.RedisLiveKey(sessionID, TestNodeName, util.AudienceToStr(audience)),
			).Result()

			Expect(err).ToNot(HaveOccurred())
			Expect(liveData).ToNot(BeNil())

			// Verify key has a TTL
			ttl, err := redisClient.TTL(context.Background(), store.RedisLiveKey(sessionID, TestNodeName, util.AudienceToStr(audience))).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(ttl).To(BeNumerically(">", 0))

			// Verify that entry is created with `streamdal_audience` prefix
			audienceData, err := redisClient.Get(
				context.Background(),
				store.RedisAudienceKey(util.AudienceToStr(audience)),
			).Result()

			Expect(err).ToNot(HaveOccurred())
			Expect(audienceData).ToNot(BeNil())
		})

		It("should error with no session ID", func() {

		})

		It("should error with no audience", func() {

		})

		It("should no-op when adding an audience with session id that already exists", func() {

		})

		It("should create a new audience LIVE key when using pre-existing audience but new session ID", func() {

		})

		It("should cause a broadcast to occur", func() {
			// The broadcast handler SHOULD see the broadcast message and emit
			// a SetPipelinesCommand to the SDK that contains an injected schema
			// inference pipeline.
		})
	})

	Describe("Metrics", func() {
	})

	Describe("Notify", func() {
	})

	Describe("GetSetPipelinesCommandsByService", func() {
		It("returns a list of pipeline commands", func() {

		})

		It("injects schema inference pipeline into the list of pipeline commands", func() {

		})

		It("returns an error if the service name is empty", func() {

		})

		It("receives empty SetPipelines when service is not known", func() {

		})
	})
})

func newRegisterRequest() *protos.RegisterRequest {
	serviceName := "test-service-" + util.GenerateUUID()

	return &protos.RegisterRequest{
		ServiceName: serviceName,
		SessionId:   "test-session-" + util.GenerateUUID(),
		ClientInfo: &protos.ClientInfo{
			ClientType:     protos.ClientType_CLIENT_TYPE_SDK,
			LibraryName:    "foo-lib",
			LibraryVersion: "1.2.3",
			Language:       "php",
			Arch:           "i386",
			Os:             "knoppix",
		},
		Audiences: []*protos.Audience{
			{
				ServiceName:   serviceName,
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "main",
			},
			{
				ServiceName:   serviceName,
				ComponentName: "rabbitmq",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "main",
			},
		},
		DryRun: false,
	}
}
