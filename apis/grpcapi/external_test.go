package grpcapi

import (
	"context"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/pkg/errors"
	"github.com/streamdal/natty"
	"github.com/streamdal/snitch-protos/build/go/protos"
	"github.com/streamdal/snitch-protos/build/go/protos/steps"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/snitch-server/config"
	"github.com/streamdal/snitch-server/deps"
	"github.com/streamdal/snitch-server/services/store"
	"github.com/streamdal/snitch-server/util"
)

const (
	TestNodeName   = "test-node"
	GRPCAPIAddress = ":19090"
	HTTPAPIAddress = ":19091"
	AuthToken      = "1234"
	NATSAddress    = "localhost:4222"
)

var (
	natsClient natty.INatty

	ctxWithNoAuth   = context.Background()
	ctxWithBadAuth  = metadata.NewOutgoingContext(context.Background(), metadata.New(map[string]string{"auth-token": "incorrect"}))
	ctxWithGoodAuth = metadata.NewOutgoingContext(context.Background(), metadata.New(map[string]string{"auth-token": AuthToken}))
)

func init() {
	var err error

	// Setup nats client
	natsClient, err = newNATSClient()
	if err != nil {
		panic("unable to create new nats client: " + err.Error())
	}

	// Clear buckets
	rmBuckets()

	// Start gRPC server
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
		externalClientErr error
		externalClient    protos.ExternalClient
		internalClientErr error
		internalClient    protos.InternalClient
	)

	BeforeEach(func() {
		externalClient, externalClientErr = newExternalClient()
		Expect(externalClientErr).ToNot(HaveOccurred())
		Expect(externalClient).ToNot(BeNil())

		internalClient, internalClientErr = newInternalClient()
		Expect(internalClientErr).ToNot(HaveOccurred())
		Expect(internalClient).ToNot(BeNil())
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
						_, err := externalClient.GetAll(ctxWithNoAuth, &protos.GetAllRequest{})
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
		It("should create a pipeline", func() {
			resp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			// Verify that resp is correct
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(resp.PipelineId).ToNot(BeEmpty())

			data, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, resp.PipelineId)
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeNil())

			// Verify that data can be unmarshalled into protos.Pipeline
			pipeline := &protos.Pipeline{}
			err = proto.Unmarshal(data, pipeline)
			Expect(err).ToNot(HaveOccurred())
			Expect(pipeline.Id).To(Equal(resp.PipelineId))
		})
	})

	Describe("GetPipeline", func() {
		It("should get a pipeline", func() {
			// Create a pipeline
			createResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createResp).ToNot(BeNil())
			Expect(createResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createResp.PipelineId).ToNot(BeEmpty())

			// Fetch the pipeline using GetPipeline()
			getResp, err := externalClient.GetPipeline(ctxWithGoodAuth, &protos.GetPipelineRequest{
				PipelineId: createResp.PipelineId,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(getResp).ToNot(BeNil())

			// Fetch pipeline directly from bucket
			data, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createResp.PipelineId)
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeNil())
		})

		It("should return an error if pipeline does not exist", func() {
			getResp, err := externalClient.GetPipeline(ctxWithGoodAuth, &protos.GetPipelineRequest{
				PipelineId: "does-not-exist",
			})

			Expect(err).To(HaveOccurred())
			Expect(getResp).To(BeNil())
			Expect(err.Error()).To(ContainSubstring("pipeline not found"))
		})
	})

	Describe("GetPipelines", func() {
		It("should get all pipelines", func() {
			createdPipelineIDs := make([]string, 0)

			// Create some pipelines
			for i := 0; i < 5; i++ {
				createResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
					Pipeline: newPipeline(),
				})

				Expect(err).ToNot(HaveOccurred())
				Expect(createResp).ToNot(BeNil())
				Expect(createResp.Message).To(ContainSubstring("Pipeline created successfully"))
				Expect(createResp.PipelineId).ToNot(BeEmpty())

				createdPipelineIDs = append(createdPipelineIDs, createResp.PipelineId)
			}

			// Fetch all pipelines
			getResp, err := externalClient.GetPipelines(ctxWithGoodAuth, &protos.GetPipelinesRequest{})
			Expect(err).ToNot(HaveOccurred())
			Expect(getResp).ToNot(BeNil())

			// Verify that response contains created pipelines
			// (We do this because we can't guarantee that there are no other pipelines in the bucket)
			for _, pipelineID := range createdPipelineIDs {
				found := false

				for _, pipeline := range getResp.Pipelines {
					if pipeline.Id == pipelineID {
						found = true
						break
					}
				}

				Expect(found).To(BeTrue(), "pipeline %s not found in response", pipelineID)
			}
		})
	})

	Describe("GetAll", func() {
		It("returns correct data", func() {
			// Create multiple pipelines
			createdPipelineIDs := make([]string, 0)

			for i := 0; i < 5; i++ {
				createResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
					Pipeline: newPipeline(),
				})

				Expect(err).ToNot(HaveOccurred())
				Expect(createResp).ToNot(BeNil())
				Expect(createResp.Message).To(ContainSubstring("Pipeline created successfully"))
				Expect(createResp.PipelineId).ToNot(BeEmpty())

				createdPipelineIDs = append(createdPipelineIDs, createResp.PipelineId)
			}

			// Create multiple audiences
			createdAudienceIDs := make([]string, 0)

			for i := 0; i < 5; i++ {
				aud := &protos.Audience{
					ServiceName:   "test-service",
					ComponentName: fmt.Sprintf("test-component-%d", i),
					OperationType: 1,
					OperationName: "kafka",
				}

				resp, err := internalClient.NewAudience(ctxWithGoodAuth, &protos.NewAudienceRequest{
					SessionId: "test-session-id",
					Audience:  aud,
				})

				Expect(err).ToNot(HaveOccurred())
				Expect(resp).ToNot(BeNil())

				createdAudienceIDs = append(createdAudienceIDs, util.AudienceToStr(aud))
			}

			config := make(map[string]string, 0)

			// Attach pipelines to audiences
			for i := 0; i < len(createdPipelineIDs); i++ {
				attachResp, err := externalClient.AttachPipeline(ctxWithGoodAuth, &protos.AttachPipelineRequest{
					PipelineId: createdPipelineIDs[i],
					Audience:   util.AudienceFromStr(createdAudienceIDs[i]),
				})

				Expect(err).ToNot(HaveOccurred())
				Expect(attachResp).ToNot(BeNil())

				// Record our desired mapping
				config[createdAudienceIDs[i]] = createdPipelineIDs[i]
			}

			// Finally, perform GetAll() to verify that we get the correct data
			getAllResp, err := externalClient.GetAll(ctxWithGoodAuth, &protos.GetAllRequest{})
			Expect(err).ToNot(HaveOccurred())
			Expect(getAllResp).ToNot(BeNil())

			// We do >= because there may be other pipelines in the bucket but
			// there should be at least len(config)
			Expect(len(getAllResp.Config)).To(BeNumerically(">=", len(config)))

			for aud, pipelineID := range getAllResp.Config {
				Expect(config).To(HaveKeyWithValue(aud, pipelineID))
			}
		})
	})

	Describe("UpdatePipeline", func() {
		It("should update a pipeline", func() {
			// Create a pipeline
			pipeline := newPipeline()
			pipeline.Name = "old-name"

			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: pipeline,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			// Fetch it from bucket, verify has correct name
			createdPipeline, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdResp.PipelineId)
			Expect(err).ToNot(HaveOccurred())
			Expect(createdPipeline).ToNot(BeNil())

			createdPipelineProto := &protos.Pipeline{}
			err = proto.Unmarshal(createdPipeline, createdPipelineProto)
			Expect(err).ToNot(HaveOccurred())

			Expect(createdPipelineProto.Name).To(Equal(pipeline.Name))
			Expect(createdPipelineProto.Id).To(Equal(createdResp.PipelineId))

			// Update its name
			pipeline.Id = createdResp.PipelineId
			pipeline.Name = "new-name"

			updatedResponse, err := externalClient.UpdatePipeline(ctxWithGoodAuth, &protos.UpdatePipelineRequest{Pipeline: pipeline})
			Expect(err).ToNot(HaveOccurred())
			Expect(updatedResponse).ToNot(BeNil())

			Expect(updatedResponse.Message).To(ContainSubstring("updated"))
			Expect(updatedResponse.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// Fetch it from the bucket
			updatedPipelineData, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdResp.PipelineId)

			Expect(err).ToNot(HaveOccurred())
			Expect(updatedPipelineData).ToNot(BeNil())

			// Verify it has the updated data
			updatedPipelineProto := &protos.Pipeline{}
			err = proto.Unmarshal(updatedPipelineData, updatedPipelineProto)
			Expect(err).ToNot(HaveOccurred())

			Expect(updatedPipelineProto.Name).To(Equal(pipeline.Name))
			Expect(updatedPipelineProto.Id).To(Equal(pipeline.Id))

		})
	})

	Describe("DeletePipeline", func() {
		It("deletes a pipeline", func() {
			// Create a pipeline
			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			// Get the pipeline
			fetchedPipeline, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdResp.PipelineId)
			Expect(err).ToNot(HaveOccurred())
			Expect(fetchedPipeline).ToNot(BeNil())

			// Delete the pipeline
			resp, err := externalClient.DeletePipeline(ctxWithGoodAuth, &protos.DeletePipelineRequest{
				PipelineId: createdResp.PipelineId,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("deleted"))

			// Get the pipeline again - should fail
			shouldNotExist, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdResp.PipelineId)
			Expect(err).To(HaveOccurred())
			Expect(err).To(Equal(nats.ErrKeyNotFound))
			Expect(shouldNotExist).To(BeNil())

			// Get pipeline via external API - should fail
			getResp, err := externalClient.GetPipeline(ctxWithGoodAuth, &protos.GetPipelineRequest{
				PipelineId: createdResp.PipelineId,
			})

			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("pipeline not found"))
			Expect(getResp).To(BeNil())
		})
	})

	Describe("AttachPipeline", func() {
		It("should attach a pipeline to an audience", func() {
			audience := &protos.Audience{
				ServiceName:   "secret-service",
				ComponentName: "sqlite",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "consumer-name",
			}

			// Create a pipeline
			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			// Attach it to an audience
			attachResp, err := externalClient.AttachPipeline(ctxWithGoodAuth, &protos.AttachPipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(attachResp).ToNot(BeNil())
			Expect(attachResp.Message).To(ContainSubstring("attached"))
			Expect(attachResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// Should have an entry in snitch_config
			storedPipelineID, err := natsClient.Get(context.Background(), store.NATSConfigBucket, util.AudienceToStr(audience))
			Expect(err).ToNot(HaveOccurred())
			Expect(storedPipelineID).ToNot(BeNil())
			Expect(string(storedPipelineID)).To(Equal(createdResp.PipelineId))
		})
	})

	Describe("DetachPipeline", func() {
		It("should detach a pipeline from an audience", func() {
			audience := &protos.Audience{
				ServiceName:   "secret-service",
				ComponentName: "sqlite",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "consumer-name",
			}

			// Create a pipeline
			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			// Attach it to an audience
			attachResp, err := externalClient.AttachPipeline(ctxWithGoodAuth, &protos.AttachPipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(attachResp).ToNot(BeNil())
			Expect(attachResp.Message).To(ContainSubstring("attached"))
			Expect(attachResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// Key should be in snitch_config
			storedPipelineID, err := natsClient.Get(context.Background(), store.NATSConfigBucket, util.AudienceToStr(audience))
			Expect(err).ToNot(HaveOccurred())
			Expect(storedPipelineID).ToNot(BeNil())
			Expect(string(storedPipelineID)).To(Equal(createdResp.PipelineId))

			// Now detach it
			detachResp, err := externalClient.DetachPipeline(ctxWithGoodAuth, &protos.DetachPipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(detachResp).ToNot(BeNil())
			Expect(detachResp.Message).To(ContainSubstring("detached"))
			Expect(detachResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// There is a 5s sleep before nats key is deleted
			time.Sleep(time.Second * 7)

			// Key should be gone from snitch_config
			shouldBeNil, err := natsClient.Get(context.Background(), store.NATSConfigBucket, util.AudienceToStr(audience))
			Expect(err).To(HaveOccurred())
			Expect(shouldBeNil).To(BeNil())
			Expect(err).To(Equal(nats.ErrKeyNotFound))
		})
	})

	Describe("PausePipeline", func() {
		It("should pause the pipeline", func() {
			// Create pipeline
			audience := &protos.Audience{
				ServiceName:   "secret-service",
				ComponentName: "sqlite",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "consumer-name",
			}

			// Create a pipeline
			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			// Pause it
			pauseResp, err := externalClient.PausePipeline(ctxWithGoodAuth, &protos.PausePipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(pauseResp).ToNot(BeNil())
			Expect(pauseResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))
			Expect(pauseResp.Message).To(ContainSubstring("paused"))

			configKey := store.NATSPausedKey(util.AudienceToStr(audience), createdResp.PipelineId)

			// Should have an entry in snitch_paused
			value, err := natsClient.Get(context.Background(), store.NATSPausedBucket, configKey)
			Expect(err).ToNot(HaveOccurred())
			Expect(value).To(BeEmpty())
		})
	})

	Describe("ResumePipeline", func() {
		It("should resume the pipeline", func() {
			// Create pipeline
			audience := &protos.Audience{
				ServiceName:   "secret-service",
				ComponentName: "sqlite",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "consumer-name",
			}

			// Create a pipeline
			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			// Pause it
			pauseResp, err := externalClient.PausePipeline(ctxWithGoodAuth, &protos.PausePipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(pauseResp).ToNot(BeNil())
			Expect(pauseResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))
			Expect(pauseResp.Message).To(ContainSubstring("paused"))

			configKey := store.NATSPausedKey(util.AudienceToStr(audience), createdResp.PipelineId)

			// Should have an entry in snitch_paused
			value, err := natsClient.Get(context.Background(), store.NATSPausedBucket, configKey)
			Expect(err).ToNot(HaveOccurred())
			Expect(value).To(BeEmpty())

			// Resume it
			resumeResp, err := externalClient.ResumePipeline(ctxWithGoodAuth, &protos.ResumePipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(resumeResp).ToNot(BeNil())
			Expect(resumeResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// Entry should be removed from snitch_paused
			value, err = natsClient.Get(context.Background(), store.NATSPausedBucket, configKey)
			Expect(err).To(HaveOccurred())
			Expect(value).To(BeNil())
			Expect(err).To(Equal(nats.ErrKeyNotFound))
		})
	})
})

func runServer() {
	d, err := deps.New("", &config.Config{
		Debug:                true,
		NodeName:             TestNodeName,
		AuthToken:            AuthToken,
		HTTPAPIListenAddress: HTTPAPIAddress,
		GRPCAPIListenAddress: GRPCAPIAddress,
		NATSURL:              []string{"localhost:4222"},
		NATSTLSSkipVerify:    true,
		NATSNumKVReplicas:    1,
		SessionTTL:           time.Second, // Override TTL to improve test speed
		WASMDir:              "./assets/wasm",
	})

	if err != nil {
		panic("error creating deps: " + err.Error())
	}

	grpcAPI, err := New(&Options{
		Config:          d.Config,
		StoreService:    d.StoreService,
		BusService:      d.BusService,
		ShutdownContext: d.ShutdownContext,
		CmdService:      d.CmdService,
		NotifyService:   d.NotifyService,
		NATSBackend:     d.NATSBackend,
	})

	if err != nil {
		panic("error creating grpcapi: " + err.Error())
	}

	if err := grpcAPI.Run(); err != nil {
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

func newNATSClient() (natty.INatty, error) {
	return natty.New(&natty.Config{
		NatsURL: []string{NATSAddress},
	})
}

func newPipeline() *protos.Pipeline {
	path := "object.field"
	negate := false

	return &protos.Pipeline{
		Name: "Pipeline_Name",
		Steps: []*protos.PipelineStep{
			{
				Name: "test step",
				OnSuccess: []protos.PipelineStepCondition{
					protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_NOTIFY,
				},
				OnFailure: []protos.PipelineStepCondition{
					protos.PipelineStepCondition_PIPELINE_STEP_CONDITION_ABORT,
				},
				Step: &protos.PipelineStep_Detective{
					Detective: &steps.DetectiveStep{
						Path:   &path,
						Args:   nil,
						Negate: &negate,
						Type:   steps.DetectiveType_DETECTIVE_TYPE_BOOLEAN_TRUE,
					},
				},
				XWasmId:       nil,
				XWasmBytes:    nil,
				XWasmFunction: nil,
			},
		},
	}
}

func rmBuckets() {
	buckets := []string{"snitch_live", "snitch_config", "snitch_pipeline", "snitch_paused"}

	for _, b := range buckets {
		if err := natsClient.DeleteBucket(context.Background(), b); err != nil {
			if err != nats.ErrBucketNotFound {
				panic(fmt.Sprintf("error deleting bucket '%s': %s", b, err.Error()))
			}
		}
	}
}
