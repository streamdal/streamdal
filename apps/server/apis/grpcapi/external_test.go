package grpcapi

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"strings"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/pkg/errors"
	"github.com/redis/go-redis/v9"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/apps/server/config"
	"github.com/streamdal/streamdal/apps/server/deps"
	"github.com/streamdal/streamdal/apps/server/services/store"
	"github.com/streamdal/streamdal/apps/server/util"
)

const (
	TestNodeName   = "test-node"
	GRPCAPIAddress = ":19090"
	HTTPAPIAddress = ":19091"
	AuthToken      = "1234"
	RedisAddress   = "localhost:6379"
)

var (
	redisClient *redis.Client

	ctxWithNoAuth   = context.Background()
	ctxWithBadAuth  = metadata.NewOutgoingContext(context.Background(), metadata.New(map[string]string{"auth-token": "incorrect"}))
	ctxWithGoodAuth = metadata.NewOutgoingContext(context.Background(), metadata.New(map[string]string{"auth-token": AuthToken}))
)

func init() {
	var err error

	// Setup Redis client
	redisClient, err = newRedisClient()
	if err != nil {
		panic("unable to create new redis client: " + err.Error())
	}

	// Clear buckets
	clearRedis()

	// Start gRPC server
	go runServer()

	time.Sleep(time.Second)
}

type SetPipelinesTest struct {
	Name                          string
	PipelineIDs                   []string
	Audience                      *protos.Audience
	ExpectResponseCode            protos.ResponseCode
	ExpectResponseMessageContains string
	ShouldError                   bool
	ErrorShouldContain            string
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
					Name: "External.SetPipelines without auth",
					Func: func() error {
						_, err := externalClient.SetPipelines(ctxWithNoAuth, &protos.SetPipelinesRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.GetAll without auth",
					Func: func() error {
						_, err := externalClient.GetAll(ctxWithNoAuth, &protos.GetAllRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.PausePipeline without auth",
					Func: func() error {
						_, err := externalClient.PausePipeline(ctxWithNoAuth, &protos.PausePipelineRequest{})
						return err
					},
					ShouldError:        true,
					ErrorShouldContain: "missing auth token",
				},
				{
					Name: "External.ResumePipeline without auth",
					Func: func() error {
						_, err := externalClient.ResumePipeline(ctxWithNoAuth, &protos.ResumePipelineRequest{})
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

			data, err := redisClient.Get(context.Background(), store.RedisPipelineKey(resp.PipelineId)).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeNil())

			// Verify that data can be unmarshalled into protos.Pipeline
			pipeline := &protos.Pipeline{}
			err = proto.Unmarshal([]byte(data), pipeline)
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
			data, err := redisClient.Get(context.Background(), store.RedisPipelineKey(createResp.PipelineId)).Result()
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

			config := make(map[string]string)

			// Attach pipelines to audiences
			for i := 0; i < len(createdPipelineIDs); i++ {
				attachResp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
					PipelineIds: []string{createdPipelineIDs[i]},
					Audience:    util.AudienceFromStr(createdAudienceIDs[i]),
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
			Expect(len(getAllResp.Configs)).To(BeNumerically(">=", len(config)))

			for aud, pipelines := range getAllResp.Configs {
				Expect(config[aud]).To(Equal(pipelines.Configs[0].Id))
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
			createdPipeline, err := redisClient.Get(context.Background(), store.RedisPipelineKey(createdResp.PipelineId)).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(createdPipeline).ToNot(BeNil())

			createdPipelineProto := &protos.Pipeline{}
			err = proto.Unmarshal([]byte(createdPipeline), createdPipelineProto)
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
			updatedPipelineData, err := redisClient.Get(context.Background(), store.RedisPipelineKey(createdResp.PipelineId)).Result()

			Expect(err).ToNot(HaveOccurred())
			Expect(updatedPipelineData).ToNot(BeNil())

			// Verify it has the updated data
			updatedPipelineProto := &protos.Pipeline{}
			err = proto.Unmarshal([]byte(updatedPipelineData), updatedPipelineProto)
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
			fetchedPipeline, err := redisClient.Get(context.Background(), store.RedisPipelineKey(createdResp.PipelineId)).Result()
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
			shouldNotExist, err := redisClient.Get(context.Background(), store.RedisPipelineKey(createdResp.PipelineId)).Result()
			Expect(err).To(HaveOccurred())
			Expect(err).To(Equal(redis.Nil))
			Expect(shouldNotExist).To(BeEmpty())

			// Get pipeline via external API - should fail
			getResp, err := externalClient.GetPipeline(ctxWithGoodAuth, &protos.GetPipelineRequest{
				PipelineId: createdResp.PipelineId,
			})

			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("pipeline not found"))
			Expect(getResp).To(BeNil())
		})
	})

	Describe("SetPipelines", func() {
		It("should set pipelines to an audience", func() {
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

			// SetPipelines for an audience
			attachResp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{createdResp.PipelineId},
				Audience:    audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(attachResp).ToNot(BeNil())
			Expect(attachResp.Message).To(ContainSubstring("successfully set '1' pipelines for audience"))
			Expect(attachResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// Should have an entry in streamdal_audience:$audienceStr
			key := store.RedisAudienceKey(util.AudienceToStr(audience))
			result, err := redisClient.Get(context.Background(), key).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(result).ToNot(BeEmpty())

			// Contents should be properly filled out
			pipelineConfigs := &protos.PipelineConfigs{}
			err = proto.Unmarshal([]byte(result), pipelineConfigs)
			Expect(err).ToNot(HaveOccurred())
			Expect(len(pipelineConfigs.Configs)).To(Equal(1))
			Expect(pipelineConfigs.Configs[0].Id).To(Equal(createdResp.PipelineId))
			Expect(pipelineConfigs.Configs[0].CreatedAtUnixTsUtc).ToNot(BeZero())
			Expect(pipelineConfigs.Configs[0].Paused).To(BeFalse())
		})

		It("SetPipeline basic error cases", func() {
			aud := newAudience("test-service")

			setPipelineTests := []SetPipelinesTest{
				{
					Name:                          "not having an audience in req will return resp with bad request code",
					PipelineIDs:                   []string{},
					Audience:                      nil,
					ExpectResponseCode:            protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST,
					ExpectResponseMessageContains: "field 'Audience' cannot be nil",
					ShouldError:                   false,
				},
				{
					Name:                          "unknown pipeline ID in req will return resp with not found code",
					PipelineIDs:                   []string{"does-not-exist"},
					Audience:                      aud,
					ExpectResponseCode:            protos.ResponseCode_RESPONSE_CODE_NOT_FOUND,
					ExpectResponseMessageContains: "pipeline not found",
					ShouldError:                   false,
				},
			}

			for _, testCase := range setPipelineTests {
				// fmt.Println("Running test case: ", testCase.Name)

				resp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
					PipelineIds: testCase.PipelineIDs,
					Audience:    testCase.Audience,
				})

				if testCase.ShouldError {
					Expect(err).To(HaveOccurred())
					Expect(resp).To(BeNil())
				} else {
					Expect(err).ToNot(HaveOccurred())
					Expect(resp).ToNot(BeNil())
					Expect(resp.Code).To(Equal(testCase.ExpectResponseCode))
					Expect(resp.Message).To(ContainSubstring(testCase.ExpectResponseMessageContains))
				}
			}
		})

		It("SetPipeline with multiple pipeline IDs", func() {
			newPipeline1 := newPipeline()
			newPipeline1.Name = "pipeline-1"
			newPipeline2 := newPipeline()
			newPipeline2.Name = "pipeline-2"

			// Create pipelines
			for _, pipeline := range []*protos.Pipeline{newPipeline1, newPipeline2} {
				createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
					Pipeline: pipeline,
				})

				Expect(err).ToNot(HaveOccurred())
				Expect(createdResp).ToNot(BeNil())
				Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
				Expect(createdResp.PipelineId).ToNot(BeEmpty())

				// Set this so we can use it later
				pipeline.Id = createdResp.PipelineId
			}

			// SetPipelines
			audience := newAudience("test-service")

			setPipelinesResp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{newPipeline1.Id, newPipeline2.Id},
				Audience:    audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(setPipelinesResp).ToNot(BeNil())
			Expect(setPipelinesResp.Message).To(ContainSubstring("successfully set '2' pipelines for audience"))
		})

		It("SetPipeline with empty pipeline IDs works", func() {
			audience := newAudience("test-service")

			setPipelinesResp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{},
				Audience:    audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(setPipelinesResp).ToNot(BeNil())
			Expect(setPipelinesResp.Message).To(ContainSubstring("successfully set '0' pipelines for audience"))

			// Verify it saved to redis as *protos.PipelineConfigs with 0 configs
			key := store.RedisAudienceKey(util.AudienceToStr(audience))
			result, err := redisClient.Get(context.Background(), key).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(result).ToNot(BeEmpty())

			pipelineConfigs := &protos.PipelineConfigs{}

			err = proto.Unmarshal([]byte(result), pipelineConfigs)
			Expect(err).ToNot(HaveOccurred())
			Expect(len(pipelineConfigs.Configs)).To(Equal(0))
		})

		It("SetPipeline with same pipeline ID for different audiences works", func() {
			pipeline := newPipeline()

			// Create pipeline
			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: pipeline,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			pipeline.Id = createdResp.PipelineId

			aud1 := newAudience("test-service-1")
			aud2 := newAudience("test-service-2")

			setResp1, err1 := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{pipeline.Id},
				Audience:    aud1,
			})
			Expect(err1).ToNot(HaveOccurred())
			Expect(setResp1).ToNot(BeNil())
			Expect(setResp1.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			setResp2, err2 := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{pipeline.Id},
				Audience:    aud2,
			})
			Expect(err2).ToNot(HaveOccurred())
			Expect(setResp2).ToNot(BeNil())
			Expect(setResp2.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))
		})

		It("SetPipelines should error if one pipeline ID does not exist", func() {
			pipeline := newPipeline()

			// Create pipeline
			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: pipeline,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			pipeline.Id = createdResp.PipelineId

			// SetPipelines with one invalid pipeline ID
			setPipelinesResp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{pipeline.Id, "does-not-exist"},
				Audience:    newAudience("test-service"),
			})
			Expect(err).ToNot(HaveOccurred())
			Expect(setPipelinesResp).ToNot(BeNil())
			Expect(setPipelinesResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_NOT_FOUND))
			Expect(setPipelinesResp.Message).To(ContainSubstring("pipeline not found"))
		})

		// TODO: Cases to test:
		// 1. external.SetPipeline call causes a broadcast to occur
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

			// Assign it to an audience
			setPipelinesResp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{createdResp.PipelineId},
				Audience:    audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(setPipelinesResp).ToNot(BeNil())
			Expect(setPipelinesResp.Message).To(ContainSubstring("successfully set '1' pipelines for audience"))

			// Pause it
			pauseResp, err := externalClient.PausePipeline(ctxWithGoodAuth, &protos.PausePipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(pauseResp).ToNot(BeNil())
			Expect(pauseResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))
			Expect(pauseResp.Message).To(ContainSubstring("paused"))

			// Paused state should be recorded in config in redis
			key := store.RedisAudienceKey(util.AudienceToStr(audience))
			result, err := redisClient.Get(context.Background(), key).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(result).ToNot(BeEmpty())

			pipelineConfigs := &protos.PipelineConfigs{}

			err = proto.Unmarshal([]byte(result), pipelineConfigs)
			Expect(err).ToNot(HaveOccurred())
			Expect(len(pipelineConfigs.Configs)).To(Equal(1))
			Expect(pipelineConfigs.Configs[0].Paused).To(BeTrue())
		})

		// TODO: Cases to test:
		// 1. Pausing a pipeline that is already paused is a no-op
		// 2. Pausing a pipeline without pipeline ID or audience should error
		// 3. Pausing a pipeline that does not exist should error
		// 4. Pausing a pipeline should cause a broadcast to occur
		//      - Not sure about how to test this (yet)
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

			// Assign it to an audience
			setPipelinesResp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{createdResp.PipelineId},
				Audience:    audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(setPipelinesResp).ToNot(BeNil())
			Expect(setPipelinesResp.Message).To(ContainSubstring("successfully set '1' pipelines for audience"))

			// Pause it
			pauseResp, err := externalClient.PausePipeline(ctxWithGoodAuth, &protos.PausePipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(pauseResp).ToNot(BeNil())
			Expect(pauseResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))
			Expect(pauseResp.Message).To(ContainSubstring("paused"))

			// Verify config in redis is correct
			key := store.RedisAudienceKey(util.AudienceToStr(audience))
			result, err := redisClient.Get(context.Background(), key).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(result).ToNot(BeEmpty())

			pipelineConfigs := &protos.PipelineConfigs{}

			err = proto.Unmarshal([]byte(result), pipelineConfigs)
			Expect(err).ToNot(HaveOccurred())
			Expect(len(pipelineConfigs.Configs)).To(Equal(1))
			Expect(pipelineConfigs.Configs[0].Paused).To(BeTrue())

			// Resume it
			resumeResp, err := externalClient.ResumePipeline(ctxWithGoodAuth, &protos.ResumePipelineRequest{
				PipelineId: createdResp.PipelineId,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(resumeResp).ToNot(BeNil())
			Expect(resumeResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// Verify redis config is correct
			result, err = redisClient.Get(context.Background(), key).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(result).ToNot(BeEmpty())

			pipelineConfigs = &protos.PipelineConfigs{}

			err = proto.Unmarshal([]byte(result), pipelineConfigs)
			Expect(err).ToNot(HaveOccurred())
			Expect(len(pipelineConfigs.Configs)).To(Equal(1))
			Expect(pipelineConfigs.Configs[0].Paused).To(BeFalse())
		})

		// TODO: Cases to test:
		// 1. Resuming a pipeline that is already resumed is a no-op
		// 2. Resuming a pipeline without a pipeline ID results in an error
		// 3. Resuming a pipeline that does not exist results in an error
		// 4. Resuming a pipeline should cause a broadcast to occur
	})

	Describe("DeleteAudience", func() {
		It("should fail if the audience is attached to a pipeline", func() {
			audience := &protos.Audience{
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "consumer-name",
				ServiceName:   "test-service",
			}

			// Create a pipeline
			createdResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(createdResp).ToNot(BeNil())
			Expect(createdResp.Message).To(ContainSubstring("Pipeline created successfully"))
			Expect(createdResp.PipelineId).ToNot(BeEmpty())

			// Assign it to an audience
			setPipelinesResp, err := externalClient.SetPipelines(ctxWithGoodAuth, &protos.SetPipelinesRequest{
				PipelineIds: []string{createdResp.PipelineId},
				Audience:    audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(setPipelinesResp).ToNot(BeNil())
			Expect(setPipelinesResp.Message).To(ContainSubstring("successfully set '1' pipelines for audience"))

			// Try to delete audience
			resp, err := externalClient.DeleteAudience(ctxWithGoodAuth, &protos.DeleteAudienceRequest{
				Audience: audience,
			})
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_BAD_REQUEST))
			Expect(resp.Message).To(ContainSubstring("has '1' attached pipelines, specify force to remove"))

			// Verify key still exists in redis
			audKey := store.RedisAudienceKey(util.AudienceToStr(audience))
			pipelineKey := store.RedisPipelineKey(createdResp.PipelineId)

			result, err := redisClient.Get(context.Background(), store.RedisAudienceKey(util.AudienceToStr(audience))).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(result).ToNot(BeEmpty())

			// Cleanup - remove key from redis
			err = redisClient.Del(context.Background(), audKey).Err()
			Expect(err).ToNot(HaveOccurred())
			err = redisClient.Del(context.Background(), pipelineKey).Err()
			Expect(err).ToNot(HaveOccurred())
		})

		It("should delete the audience", func() {
			audience := &protos.Audience{
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
				OperationName: "consumer-name",
				ServiceName:   "test-service",
			}

			// Put empty *protos.PipelineConfigs in redis
			key := store.RedisAudienceKey(util.AudienceToStr(audience))

			pipelineConfigs := &protos.PipelineConfigs{
				Configs:  make([]*protos.PipelineConfig, 0),
				XIsEmpty: proto.Bool(true),
			}

			data, err := proto.Marshal(pipelineConfigs)
			Expect(err).ToNot(HaveOccurred())

			err = redisClient.Set(context.Background(), key, data, 0).Err()
			Expect(err).ToNot(HaveOccurred())

			// Delete audience
			resp, err := externalClient.DeleteAudience(ctxWithGoodAuth, &protos.DeleteAudienceRequest{
				Audience: audience,
			})
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			//Expect(resp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))
			Expect(resp.Message).To(ContainSubstring("Audience deleted"))

			// Verify key has been deleted from redis
			err = redisClient.Get(context.Background(), key).Err()
			Expect(err).To(HaveOccurred())
			Expect(err).To(Equal(redis.Nil))
		})

		// TODO: Cases to test:
		// 1. Deleting an audience that does not exist should error
		// 2. Deleting an audience that has attached pipeline(s) WITH force should:
		//    - Delete the audience key from redis
		//    - Broadcast a DeleteAudience message
		// 3. Deleting an audience without specifying audience should error
	})

	Context("GetWasm", func() {
		It("happy path: should return info about specific wasm module", func() {
			// Reminder: Should have all fields filled out (createdAt, updatedAt)
			preloadedKeys, err := redisClient.Keys(context.Background(), store.RedisWasmPrefix+":*").Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(preloadedKeys).ToNot(BeEmpty())

			for _, key := range preloadedKeys {
				split := strings.Split(key, ":")
				Expect(len(split)).To(Equal(3))

				id := split[2]

				resp, err := externalClient.GetWasm(ctxWithGoodAuth, &protos.GetWasmRequest{Id: id})
				Expect(err).ToNot(HaveOccurred())
				Expect(resp).ToNot(BeNil())

				// Check fields
				Expect(resp.Wasm).ToNot(BeNil())
				Expect(resp.Wasm.Id).To(Equal(id))
				Expect(resp.Wasm.Bytes).To(BeEmpty()) // gRPC API strips bytes to save on b/w
				Expect(resp.Wasm.GetXCreatedAtUnixTsNsUtc()).ToNot(BeZero())
				Expect(resp.Wasm.XBundled).To(BeTrue())
				Expect(resp.Wasm.Function).ToNot(BeEmpty())
			}
		})

		It("querying unknown wasm module should return error", func() {
			resp, err := externalClient.GetWasm(ctxWithGoodAuth, &protos.GetWasmRequest{Id: "does-not-exist"})
			Expect(err).To(HaveOccurred())
			Expect(resp).To(BeNil())
			Expect(err.Error()).To(ContainSubstring("wasm not found"))
		})
	})

	Context("GetAllWasm", func() {
		It("happy path: should return all wasm modules", func() {
			preloadedKeys, err := redisClient.Keys(context.Background(), store.RedisWasmPrefix+":*").Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(preloadedKeys).ToNot(BeEmpty())

			fetchedModules, err := externalClient.GetAllWasm(ctxWithGoodAuth, &protos.GetAllWasmRequest{})
			Expect(err).ToNot(HaveOccurred())
			Expect(fetchedModules).ToNot(BeNil())
			Expect(len(fetchedModules.Wasm)).To(Equal(len(preloadedKeys)))

			for _, pk := range preloadedKeys {
				split := strings.Split(pk, ":")
				Expect(len(split)).To(Equal(3))

				id := split[2]

				found := false
				for _, module := range fetchedModules.Wasm {
					if module.Id == id {
						found = true
					}
				}

				Expect(found).To(BeTrue(), "module %s not found in response", id)
			}
		})
	})

	// CreateWasm is intended for creating custom Wasm only. The only 2 differences
	// between custom and bundled wasm are:
	//   1. Custom Wasm ID is generated using a "customWasmModifier" (see util.DeterminativeUUID())
	//   2. Custom Wasm is NOT marked as bundled
	Context("CreateWasm", func() {
		It("happy path: should create a new wasm module", func() {
			module := generateWasmModule()
			expectedID := util.DeterminativeUUID(module.Bytes, customWasmModifier)
			// Make sure that fields are overwritten
			module.XBundled = true
			module.Id = "should-not-be-used"

			resp, err := externalClient.CreateWasm(ctxWithGoodAuth, &protos.CreateWasmRequest{Wasm: module})

			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("created"))
			Expect(resp.Id).ToNot(BeEmpty())
			Expect(resp.Id).To(Equal(expectedID))

			// Make sure that we can fetch it
			fetchedResp, err := externalClient.GetWasm(ctxWithGoodAuth, &protos.GetWasmRequest{Id: expectedID})
			Expect(err).ToNot(HaveOccurred())
			Expect(fetchedResp).ToNot(BeNil())
			Expect(fetchedResp.Wasm).ToNot(BeNil())
			Expect(fetchedResp.Wasm.Id).To(Equal(expectedID))
		})

		It("should error if new wasm CUSTOM module already exists", func() {
			seed := "already-created"
			module := generateWasmModule(seed)
			expectedID := util.DeterminativeUUID(module.Bytes, customWasmModifier)

			// Create it
			resp1, err1 := externalClient.CreateWasm(ctxWithGoodAuth, &protos.CreateWasmRequest{Wasm: module})
			Expect(err1).ToNot(HaveOccurred())
			Expect(resp1).ToNot(BeNil())
			Expect(resp1.Message).To(ContainSubstring("created"))
			Expect(resp1.Id).ToNot(BeEmpty())
			Expect(resp1.Id).To(Equal(expectedID))

			// Attempt to create it again
			resp2, err2 := externalClient.CreateWasm(ctxWithGoodAuth, &protos.CreateWasmRequest{Wasm: module})
			Expect(err2).To(HaveOccurred())
			Expect(err2.Error()).To(ContainSubstring("already exists"))
			Expect(resp2).To(BeNil())
		})

		It("should error if wasm module is missing fields", func() {
			moduleWithoutName := generateWasmModule()
			moduleWithoutName.Name = ""

			moduleWithoutBytes := generateWasmModule()
			moduleWithoutBytes.Bytes = nil

			resp1, err1 := externalClient.CreateWasm(ctxWithGoodAuth, &protos.CreateWasmRequest{Wasm: moduleWithoutName})
			Expect(err1).To(HaveOccurred())
			Expect(err1.Error()).To(ContainSubstring("cannot be empty"))
			Expect(resp1).To(BeNil())

			resp2, err2 := externalClient.CreateWasm(ctxWithGoodAuth, &protos.CreateWasmRequest{Wasm: moduleWithoutBytes})
			Expect(err2).To(HaveOccurred())
			Expect(err2.Error()).To(ContainSubstring("cannot be nil"))
			Expect(resp2).To(BeNil())
		})
	})

	Context("UpdateWasm", func() {
		It("happy path: should update a wasm module", func() {
			seed := "update-test-happy-path"
			module := generateWasmModule(seed)
			module.Name = "name-before-update"
			expectedID := util.DeterminativeUUID(module.Bytes, customWasmModifier)
			Expect(module.Id).To(Equal(expectedID))

			// Create it
			resp1, err1 := externalClient.CreateWasm(ctxWithGoodAuth, &protos.CreateWasmRequest{Wasm: module})
			Expect(err1).ToNot(HaveOccurred())
			Expect(resp1).ToNot(BeNil())
			Expect(resp1.Message).To(ContainSubstring("created"))
			Expect(resp1.Id).To(Equal(expectedID))

			// Now update it and try to update
			module.Name = "name-after-update"
			module.Function = "function-after-update"
			module.Description = util.Pointer("description-after-update")
			module.Url = util.Pointer("url-after-update")
			module.Version = util.Pointer("version-after-update")

			resp2, err2 := externalClient.UpdateWasm(ctxWithGoodAuth, &protos.UpdateWasmRequest{
				Wasm: module,
			})

			Expect(err2).ToNot(HaveOccurred())
			Expect(resp2).ToNot(BeNil())
			Expect(resp2.Message).To(ContainSubstring("updated"))

			fetchedResp, err := externalClient.GetWasm(ctxWithGoodAuth, &protos.GetWasmRequest{Id: expectedID})
			Expect(err).ToNot(HaveOccurred())
			Expect(fetchedResp).ToNot(BeNil())
			Expect(fetchedResp.Wasm).ToNot(BeNil())
			Expect(fetchedResp.Wasm.Id).To(Equal(expectedID))
			Expect(fetchedResp.Wasm.Name).To(Equal(module.Name))
			Expect(fetchedResp.Wasm.Function).To(Equal(module.Function))
			Expect(*fetchedResp.Wasm.Url).To(Equal(*module.Url))
			Expect(*fetchedResp.Wasm.Version).To(Equal(*module.Version))
			Expect(*fetchedResp.Wasm.Description).To(Equal(*module.Description))
		})

		It("won't allow updating a wasm module that doesn't exist", func() {
			module := generateWasmModule()
			module.Id = "does-not-exist"

			resp, err := externalClient.UpdateWasm(ctxWithGoodAuth, &protos.UpdateWasmRequest{Wasm: module})

			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("Existing wasm module not found"))
		})

		It("won't allow updating a wasm module that is bundled", func() {
			// Grab existing detective key
			preloadedKeys, err := redisClient.Keys(context.Background(), store.RedisWasmPrefix+":detective:*").Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(len(preloadedKeys)).To(Equal(1))

			split := strings.Split(preloadedKeys[0], ":")
			id := split[2]

			// Generate new module with bundled ID
			module := generateWasmModule()
			module.Id = id

			resp, err := externalClient.UpdateWasm(ctxWithGoodAuth, &protos.UpdateWasmRequest{Wasm: module})
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("cannot update bundled wasm module"))
		})

		It("won't allow updating a wasm module with missing fields", func() {
			module := generateWasmModule()
			module.Id = ""

			resp, err := externalClient.UpdateWasm(ctxWithGoodAuth, &protos.UpdateWasmRequest{Wasm: module})
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("cannot be empty"))
		})
	})

	Context("DeleteWasm", func() {
		It("happy path: should delete a wasm module", func() {
			seed := "delete-test-happy-path"
			module := generateWasmModule(seed)
			expectedID := util.DeterminativeUUID(module.Bytes, customWasmModifier)

			// Create it
			resp1, err1 := externalClient.CreateWasm(ctxWithGoodAuth, &protos.CreateWasmRequest{Wasm: module})
			Expect(err1).ToNot(HaveOccurred())
			Expect(resp1).ToNot(BeNil())

			// Fetch it
			fetchedResp, err := externalClient.GetWasm(ctxWithGoodAuth, &protos.GetWasmRequest{Id: expectedID})
			Expect(err).ToNot(HaveOccurred())
			Expect(fetchedResp).ToNot(BeNil())
			Expect(fetchedResp.Wasm).ToNot(BeNil())
			Expect(fetchedResp.Wasm.Id).To(Equal(expectedID))

			// Delete it
			resp2, err2 := externalClient.DeleteWasm(ctxWithGoodAuth, &protos.DeleteWasmRequest{Ids: []string{expectedID}})
			Expect(err2).ToNot(HaveOccurred())
			Expect(resp2).ToNot(BeNil())

			// Fetching again should return not exists
			fetchedResp2, err := externalClient.GetWasm(ctxWithGoodAuth, &protos.GetWasmRequest{Id: expectedID})
			Expect(err).To(HaveOccurred())
			Expect(fetchedResp2).To(BeNil())
			Expect(err.Error()).To(ContainSubstring("wasm not found"))
		})

		It("returns error if an id does not exist", func() {
			module := generateWasmModule()
			module.Id = "does-not-exist-for-delete-error-test"

			resp, err := externalClient.DeleteWasm(ctxWithGoodAuth, &protos.DeleteWasmRequest{Ids: []string{module.Id}})
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("not found"))
		})

		It("cannot delete bundled wasm", func() {
			// Grab existing detective key
			preloadedKeys, err := redisClient.Keys(context.Background(), store.RedisWasmPrefix+":detective:*").Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(len(preloadedKeys)).To(Equal(1))

			split := strings.Split(preloadedKeys[0], ":")
			id := split[2]

			resp, err := externalClient.DeleteWasm(ctxWithGoodAuth, &protos.DeleteWasmRequest{Ids: []string{id}})
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("cannot delete bundled wasm module"))
		})
	})
})

func genAESKey() string {
	bytes := make([]byte, 32) //generate a random 32 byte key for AES-256
	if _, err := rand.Read(bytes); err != nil {
		panic(err.Error())
	}

	return hex.EncodeToString(bytes)
}

func runServer() {
	d, err := deps.New(&config.Config{
		Debug:                true,
		NodeName:             TestNodeName,
		AuthToken:            AuthToken,
		HTTPAPIListenAddress: HTTPAPIAddress,
		GRPCAPIListenAddress: GRPCAPIAddress,
		RedisURL:             "localhost:6379",
		SessionTTL:           time.Second * 5,
		WASMDir:              "../../assets/wasm",
		AesKey:               genAESKey(),
		TelemetryDisable:     true,
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
		RedisBackend:    d.RedisBackend,
		PubSubService:   d.PubSubService,
		MetricsService:  d.MetricsService,
		KVService:       d.KVService,
		Telemetry:       d.Telemetry,
		WasmService:     d.WasmService,
	})

	if err != nil {
		panic("error creating grpcapi: " + err.Error())
	}

	if err := grpcAPI.Run(); err != nil {
		panic("error running grpcapi: " + err.Error())
	}
}

func newExternalClient() (protos.ExternalClient, error) {
	conn, err := grpc.Dial(GRPCAPIAddress, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, errors.Wrap(err, "can not connect with server")
	}

	return protos.NewExternalClient(conn), nil
}

func newInternalClient() (protos.InternalClient, error) {
	conn, err := grpc.Dial(GRPCAPIAddress, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, errors.Wrap(err, "can not connect with server")
	}

	return protos.NewInternalClient(conn), nil
}

func newRedisClient() (*redis.Client, error) {
	return redis.NewClient(&redis.Options{
		Addr: RedisAddress,
	}), nil
}

func newPipeline() *protos.Pipeline {
	path := "object.field"
	negate := false

	return &protos.Pipeline{
		Name: "Pipeline_Name",
		Steps: []*protos.PipelineStep{
			{
				Name: "test step",
				OnTrue: &protos.PipelineStepConditions{
					Notify: true,
				},
				OnFalse: &protos.PipelineStepConditions{
					Abort: protos.AbortCondition_ABORT_CONDITION_ABORT_CURRENT,
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

func clearRedis() {
	if err := redisClient.FlushAll(context.Background()).Err(); err != nil {
		panic(fmt.Sprintf("error flushing redis: %s", err.Error()))
	}
}

func newAudience(serviceName string) *protos.Audience {
	return &protos.Audience{
		ServiceName:   serviceName,
		ComponentName: "test-component",
		OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
		OperationName: "test-operation",
	}
}

// Gene
func generateWasmModule(seed ...string) *shared.WasmModule {
	data, err := os.ReadFile("../../assets/wasm/transform.wasm")
	Expect(err).ToNot(HaveOccurred())
	Expect(data).ToNot(BeNil())

	// Append some additional bits to the data to make it unique (and generate a different ID)
	if len(seed) > 0 {
		data = append(data, []byte(seed[0])...)
	}

	return &shared.WasmModule{
		Id:                    util.DeterminativeUUID(data, customWasmModifier),
		Bytes:                 data,
		Function:              "f",
		Name:                  "transform",
		XFilename:             "transform.wasm",
		XBundled:              true,
		Description:           util.Pointer("test transform description"),
		Version:               util.Pointer("v0.0.1-transform"),
		Url:                   util.Pointer("https://example.com/transform.wasm"),
		XCreatedAtUnixTsNsUtc: util.Pointer(time.Now().UTC().UnixNano()),
		XUpdatedAtUnixTsNsUtc: nil,
	}
}
