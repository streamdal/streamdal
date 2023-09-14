package grpcapi

import (
	"context"
	"fmt"
	"strings"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/redis/go-redis/v9"

	"github.com/streamdal/snitch-protos/build/go/protos"

	"github.com/streamdal/snitch-server/services/store"
	"github.com/streamdal/snitch-server/util"
)

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
		It("should register a new externalClient", func() {
			ctx, cancel := context.WithCancel(context.Background())
			heartbeatCtx, heartbeatCancel := context.WithCancel(context.Background())
			defer heartbeatCancel()
			defer cancel()

			registerRequest := newRegisterRequest()

			go func() {
				resp, err := internalClient.Register(ctxWithGoodAuth, registerRequest)
				Expect(err).ToNot(HaveOccurred())
				Expect(resp).ToNot(BeNil())

				// Launch a heartbeat goroutine
				go func() {
					for {
						select {
						case <-heartbeatCtx.Done():
							break
						default:
							resp, err := internalClient.Heartbeat(ctxWithGoodAuth, &protos.HeartbeatRequest{SessionId: registerRequest.SessionId})
							Expect(err).ToNot(HaveOccurred())
							Expect(resp).ToNot(BeNil())

							time.Sleep(200 * time.Millisecond)
						}
					}
				}()

				// Run until context is cancelled
				<-ctx.Done()

				// Close the stream
				Expect(resp.CloseSend()).ToNot(HaveOccurred())
			}()

			// Wait a little bit for register to go through
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

			cancel()

			time.Sleep(2 * time.Second)

			// Registration should still exist (because of heartbeat)
			data, err = redisClient.Get(context.Background(), store.RedisRegisterKey(registerRequest.SessionId, TestNodeName)).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeEmpty())

			// Stop the heartbeat; registration should be removed
			heartbeatCancel()

			time.Sleep(2 * time.Second)

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

		It("should disconnect client without heartbeat", func() {
			registerCtx, registerCancel := context.WithCancel(ctxWithGoodAuth)
			heartbeatCtx, heartbeatCancel := context.WithCancel(ctxWithGoodAuth)
			registerExitCh := make(chan struct{}, 1)
			registerRequest := newRegisterRequest()

			defer registerCancel() // JIC

			startRegister(registerCtx, internalClient, registerRequest, registerExitCh)
			startHeartbeat(heartbeatCtx, internalClient, registerRequest.SessionId)

			// Wait for everything to startup
			time.Sleep(time.Second)

			// Verify that K/V is created
			data, err := redisClient.Get(context.Background(), store.RedisRegisterKey(registerRequest.SessionId, TestNodeName)).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeEmpty())

			// Stop heartbeat
			heartbeatCancel()

			// Wait for RedisBackend to TTL the key
			time.Sleep(4 * time.Second)

			// K/V should be gone
			data, err = redisClient.Get(context.Background(), store.RedisRegisterKey(registerRequest.SessionId, TestNodeName)).Result()
			Expect(err).To(HaveOccurred())
			Expect(data).To(BeEmpty())

			// Register goroutine should've exited as well
			Eventually(registerExitCh).Should(Receive())
		})
	})

	Describe("Heartbeat", func() {
		It("heartbeat should update all session keys in live bucket", func() {
			registerCtx, registerCancel := context.WithCancel(ctxWithGoodAuth)
			heartbeatCtx, heartbeatCancel := context.WithCancel(ctxWithGoodAuth)
			registerExitCh := make(chan struct{}, 1)
			registerRequest := newRegisterRequest()

			defer registerCancel()
			defer heartbeatCancel()

			startRegister(registerCtx, internalClient, registerRequest, registerExitCh)
			startHeartbeat(heartbeatCtx, internalClient, registerRequest.SessionId)

			// Wait for everything to startup
			time.Sleep(time.Second)

			// Verify that K/V is created
			data, err := redisClient.Get(context.Background(), store.RedisRegisterKey(registerRequest.SessionId, TestNodeName)).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeEmpty())

			// Wait another TTL cycle - heartbeat should've kept key alive
			time.Sleep(2 * time.Second)

			data, err = redisClient.Get(context.Background(), store.RedisRegisterKey(registerRequest.SessionId, TestNodeName)).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeEmpty())
		})

		It("keys should disappear without heartbeat", func() {
			// Tested in Register()
		})
	})

	Describe("NewAudience", func() {
		It("should create a new audience in live bucket", func() {
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

			// Verify that K/V is created in `snitch_live` bucket
			liveData, err := redisClient.Get(
				context.Background(),
				store.RedisLiveKey(sessionID, TestNodeName, util.AudienceToStr(audience)),
			).Result()

			Expect(err).ToNot(HaveOccurred())
			Expect(liveData).ToNot(BeNil())

			// Verify that entry is created in `snitch_audience` bucket
			audienceData, err := redisClient.Get(
				context.Background(),
				store.RedisAudienceKey(util.AudienceToStr(audience)),
			).Result()

			Expect(err).ToNot(HaveOccurred())
			Expect(audienceData).ToNot(BeNil())
		})

		It("audience depends on heartbeat", func() {
			sessionID := util.GenerateUUID()
			audience := &protos.Audience{
				ServiceName:   "test-service",
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "main",
			}

			Expect(sessionID).ToNot(BeEmpty())

			// Launch heartbeat
			cancelCtx, cancel := context.WithCancel(ctxWithGoodAuth)

			startHeartbeat(cancelCtx, internalClient, sessionID)

			resp, err := internalClient.NewAudience(ctxWithGoodAuth, &protos.NewAudienceRequest{
				SessionId: sessionID,
				Audience:  audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())

			time.Sleep(2 * time.Second)

			// Audience is still in live bucket
			_, err = redisClient.Get(
				context.Background(),
				store.RedisLiveKey(sessionID, TestNodeName, util.AudienceToStr(audience)),
			).Result()

			Expect(err).ToNot(HaveOccurred())

			// Audience is still in audience bucket
			audienceData, err := redisClient.Get(
				context.Background(),
				store.RedisAudienceKey(util.AudienceToStr(audience)),
			).Result()

			Expect(err).ToNot(HaveOccurred())
			Expect(audienceData).ToNot(BeNil())

			// Stop heartbeat
			cancel()

			time.Sleep(2 * time.Second)

			// Audience should no longer be in live bucket
			_, err = redisClient.Get(
				context.Background(),
				store.RedisLiveKey(sessionID, TestNodeName, util.AudienceToStr(audience)),
			).Result()

			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("redis: nil"))
		})
	})

	Describe("Metrics", func() {
	})

	Describe("Notify", func() {
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

func startRegister(ctx context.Context, client protos.InternalClient, req *protos.RegisterRequest, registerExit chan struct{}) {
	go func() {
		defer GinkgoRecover()

		resp, err := client.Register(ctx, req)

		Expect(err).ToNot(HaveOccurred())
		Expect(resp).ToNot(BeNil())

	MAIN:
		for {
			select {
			case <-ctx.Done():
				fmt.Println("startRegister: context done")
				break MAIN
			default:
				// Continue
			}

			// Try to recv; only fail test if error is not EOF or context cancelled
			//
			// NOTE: The ctx might've gotten cancelled mid-flight so we need to
			// check for that err condition
			_, recvErr := resp.Recv()
			if recvErr != nil {
				if strings.Contains(recvErr.Error(), "EOF") {
					fmt.Println("startRegister: EOF")
					break MAIN
				} else if strings.Contains(recvErr.Error(), "context canceled") {
					fmt.Println("startRegister: context canceled")
					break MAIN
				} else {
					fmt.Println("startRegister: recv unexpected error: ", recvErr)
					Expect(recvErr).ToNot(HaveOccurred())
				}
			}
		}

		fmt.Println("startRegister: exiting")
		registerExit <- struct{}{}
	}()
}

// Send heartbeat every 200ms
func startHeartbeat(ctx context.Context, client protos.InternalClient, sessionID string) {
	go func() {
		defer GinkgoRecover()

	MAIN:
		for {
			select {
			case <-ctx.Done():
				fmt.Println("startHeartbeat: context done")
				break MAIN
			default:
				// Continue
			}

			// NOTE: The ctx might've gotten cancelled mid-flight so we need to
			// check for that err condition
			resp, err := client.Heartbeat(ctx, &protos.HeartbeatRequest{SessionId: sessionID})
			if err != nil {
				if strings.Contains(err.Error(), "context canceled") {
					break MAIN
				}

				Expect(err).ToNot(HaveOccurred())
				Expect(resp).ToNot(BeNil())
			}

			time.Sleep(200 * time.Millisecond)
		}

		fmt.Println("startHeartbeat: exiting")
	}()
}
