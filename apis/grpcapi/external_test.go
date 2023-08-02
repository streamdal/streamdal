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
	GRPCAPIAddress = ":19090"
	HTTPAPIAddress = ":19091"
	AuthToken      = "1234"
	NATSAddress    = "localhost:4222"
)

var (
	natsClient natty.INatty

	testPipelines   = make([]string, 0)
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

var _ = AfterSuite(func() {
	// Remove created pipelines
	for _, p := range testPipelines {
		err := natsClient.Delete(context.Background(), store.NATSPipelineBucket, p)
		if err != nil {
			fmt.Printf("CLEANUP ERROR: unable to remove pipeline '%s' from NATS: %s\n", p, err.Error())
		}
	}

	// Remove attachments
})

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

			data, err := natsClient.Get(context.Background(), store.NATSConfigBucket, expectedPipelineID)
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeNil())

			testPipelines = append(testPipelines, expectedPipelineID)

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

			// Fetch the pipeline
			getResp, err := externalClient.GetPipeline(ctxWithGoodAuth, &protos.GetPipelineRequest{
				PipelineId: createdPipelineID + "foo",
			})

			Expect(err).ToNot(HaveOccurred())
			Expect(getResp).ToNot(BeNil())
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

			// Create 5 pipelines
			for i := 0; i < 5; i++ {
				createResp, err := externalClient.CreatePipeline(ctxWithGoodAuth, &protos.CreatePipelineRequest{
					Pipeline: newPipeline(),
				})

				Expect(err).ToNot(HaveOccurred())
				Expect(createResp).ToNot(BeNil())

				pipelineID := getPipelineIDFromMessage(createResp.Message)
				Expect(pipelineID).ToNot(BeEmpty())

				testPipelines = append(testPipelines, pipelineID)
			}

			// Fetch all pipelines
			getResp, err := externalClient.GetPipelines(ctxWithGoodAuth, &protos.GetPipelinesRequest{})
			Expect(err).ToNot(HaveOccurred())
			Expect(getResp).ToNot(BeNil())

			Expect(len(getResp.Pipelines)).To(Equal(5))
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

	FDescribe("AttachPipeline", func() {
		It("should attach a pipeline to an audience", func() {
			audience := &protos.Audience{
				ServiceName:   "secret-service",
				ComponentName: "sqlite",
				OperationType: protos.OperationType_OPERATION_TYPE_CONSUMER,
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

			configKey := util.AudienceToStr(audience)
			fmt.Println("Attempting to fetch key:", configKey)

			// Should have an entry in snitch_config
			storedPipelineID, err := natsClient.Get(context.Background(), store.NATSConfigBucket, configKey)
			Expect(err).ToNot(HaveOccurred())
			Expect(storedPipelineID).ToNot(BeNil())
			Expect(string(storedPipelineID)).To(Equal(createdPipelineID))
		})
	})

	Describe("DetachPipeline", func() {
		It("should detach a pipeline from an audience", func() {

		})
	})

	Describe("PausePipeline", func() {
		It("should pause the pipeline", func() {

		})
	})

	Describe("ResumePipeline", func() {
		It("should resume the pipeline", func() {

		})
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
