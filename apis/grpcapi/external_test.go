package grpcapi

import (
	"context"
	"fmt"
	"regexp"
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
		It("should create a pipeline", func() {
			resp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
				Pipeline: newPipeline(),
			})

			// Verify that resp is correct
			Expect(err).ToNot(HaveOccurred())
			Expect(resp).ToNot(BeNil())
			Expect(resp.Message).To(ContainSubstring("created"))
			Expect(resp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// Verify that we wrote pipeline to bucket
			expectedPipelineID := getPipelineIDFromMessage(resp.Message)
			Expect(expectedPipelineID).ToNot(BeEmpty())

			data, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, expectedPipelineID)
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeNil())

			// Verify that data can be unmarshalled into protos.Pipeline
			pipeline := &protos.Pipeline{}
			err = proto.Unmarshal(data, pipeline)
			Expect(err).ToNot(HaveOccurred())
			Expect(pipeline.Id).To(Equal(expectedPipelineID))
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

			createdPipelineID := getPipelineIDFromMessage(createResp.Message)

			// Fetch the pipeline using GetPipeline()
			getResp, err := externalClient.GetPipeline(ctxWithGoodAuth, &protos.GetPipelineRequest{
				PipelineId: createdPipelineID,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(getResp).ToNot(BeNil())

			// Fetch pipeline directly from bucket
			data, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdPipelineID)
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

				pipelineID := getPipelineIDFromMessage(createResp.Message)
				Expect(pipelineID).ToNot(BeEmpty())

				createdPipelineIDs = append(createdPipelineIDs, pipelineID)
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

			createdPipelineID := getPipelineIDFromMessage(createdResp.Message)

			Expect(createdPipelineID).ToNot(BeEmpty())

			// Fetch it from bucket, verify has correct name
			createdPipeline, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdPipelineID)
			Expect(err).ToNot(HaveOccurred())
			Expect(createdPipeline).ToNot(BeNil())

			createdPipelineProto := &protos.Pipeline{}
			err = proto.Unmarshal(createdPipeline, createdPipelineProto)
			Expect(err).ToNot(HaveOccurred())

			Expect(createdPipelineProto.Name).To(Equal(pipeline.Name))
			Expect(createdPipelineProto.Id).To(Equal(createdPipelineID))

			// Update its name
			pipeline.Id = createdPipelineID
			pipeline.Name = "new-name"

			updatedResponse, err := externalClient.UpdatePipeline(ctxWithGoodAuth, &protos.UpdatePipelineRequest{Pipeline: pipeline})
			Expect(err).ToNot(HaveOccurred())
			Expect(updatedResponse).ToNot(BeNil())

			Expect(updatedResponse.Message).To(ContainSubstring("updated"))
			Expect(updatedResponse.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

			// Fetch it from the bucket
			updatedPipelineData, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdPipelineID)

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

			createdPipelineID := getPipelineIDFromMessage(createdResp.Message)
			Expect(createdPipelineID).ToNot(BeEmpty())

			// Get the pipeline
			fetchedPipeline, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdPipelineID)
			Expect(err).ToNot(HaveOccurred())
			Expect(fetchedPipeline).ToNot(BeNil())

			// Delete the pipeline
			err = natsClient.Delete(context.Background(), store.NATSPipelineBucket, createdPipelineID)
			Expect(err).ToNot(HaveOccurred())

			// Get the pipeline again - should fail
			shouldNotExist, err := natsClient.Get(context.Background(), store.NATSPipelineBucket, createdPipelineID)
			Expect(err).To(HaveOccurred())
			Expect(err).To(Equal(nats.ErrKeyNotFound))
			Expect(shouldNotExist).To(BeNil())
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

			createdPipelineID := getPipelineIDFromMessage(createdResp.Message)
			Expect(createdPipelineID).ToNot(BeEmpty())

			// Attach it to an audience
			attachResp, err := externalClient.AttachPipeline(ctxWithGoodAuth, &protos.AttachPipelineRequest{
				PipelineId: createdPipelineID,
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
			Expect(string(storedPipelineID)).To(Equal(createdPipelineID))
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

			createdPipelineID := getPipelineIDFromMessage(createdResp.Message)
			Expect(createdPipelineID).ToNot(BeEmpty())

			// Attach it to an audience
			attachResp, err := externalClient.AttachPipeline(ctxWithGoodAuth, &protos.AttachPipelineRequest{
				PipelineId: createdPipelineID,
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
			Expect(string(storedPipelineID)).To(Equal(createdPipelineID))

			// Now detach it
			detachResp, err := externalClient.DetachPipeline(ctxWithGoodAuth, &protos.DetachPipelineRequest{
				PipelineId: createdPipelineID,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(detachResp).ToNot(BeNil())
			Expect(detachResp.Message).To(ContainSubstring("detached"))
			Expect(detachResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))

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

			createdPipelineID := getPipelineIDFromMessage(createdResp.Message)
			Expect(createdPipelineID).ToNot(BeEmpty())

			// Pause it
			pauseResp, err := externalClient.PausePipeline(ctxWithGoodAuth, &protos.PausePipelineRequest{
				PipelineId: createdPipelineID,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(pauseResp).ToNot(BeNil())
			Expect(pauseResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))
			Expect(pauseResp.Message).To(ContainSubstring("paused"))

			configKey := store.NATSPausedKey(util.AudienceToStr(audience), createdPipelineID)

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

			createdPipelineID := getPipelineIDFromMessage(createdResp.Message)
			Expect(createdPipelineID).ToNot(BeEmpty())

			// Pause it
			pauseResp, err := externalClient.PausePipeline(ctxWithGoodAuth, &protos.PausePipelineRequest{
				PipelineId: createdPipelineID,
				Audience:   audience,
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(pauseResp).ToNot(BeNil())
			Expect(pauseResp.Code).To(Equal(protos.ResponseCode_RESPONSE_CODE_OK))
			Expect(pauseResp.Message).To(ContainSubstring("paused"))

			configKey := store.NATSPausedKey(util.AudienceToStr(audience), createdPipelineID)

			// Should have an entry in snitch_paused
			value, err := natsClient.Get(context.Background(), store.NATSPausedBucket, configKey)
			Expect(err).ToNot(HaveOccurred())
			Expect(value).To(BeEmpty())

			// Resume it
			resumeResp, err := externalClient.ResumePipeline(ctxWithGoodAuth, &protos.ResumePipelineRequest{
				PipelineId: createdPipelineID,
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
		SessionTTL:           time.Second, // Override TTL to improve test speed
		WASMDir:              "./assets/wasm",
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

func newNATSClient() (natty.INatty, error) {
	return natty.New(&natty.Config{
		NatsURL: []string{NATSAddress},
	})
}

// Parse pipelineID from "created '...' pipeline" message
func getPipelineIDFromMessage(msg string) string {
	idRegex := regexp.MustCompile(`^pipeline '(.+)' created$`)
	matches := idRegex.FindStringSubmatch(msg)
	if len(matches) != 2 {
		return ""
	}

	return matches[1]
}

func newPipeline() *protos.Pipeline {
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
						Path:   "object.field",
						Args:   nil,
						Negate: false,
						Type:   steps.DetectiveType_DETECTIVE_TYPE_BOOLEAN_TRUE,
					},
				},
				XWasmId:       "", // TODO: Remember to fill this in
				XWasmBytes:    nil,
				XWasmFunction: "",
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
