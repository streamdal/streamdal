package wasm

import (
	"context"
	"os"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/redis/go-redis/v9"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/apps/server/services/encryption"
	"github.com/streamdal/streamdal/apps/server/services/store"
	"github.com/streamdal/streamdal/apps/server/services/telemetry"
	"github.com/streamdal/streamdal/apps/server/util"
)

var _ = Describe("Wasm", func() {
	var (
		storeService *store.Store
		redisClient  *redis.Client
		wasmDir      = "../../assets/wasm"
	)

	BeforeEach(func() {
		// Redis backend
		redisClient = redis.NewClient(&redis.Options{
			Addr:     "localhost:6379",
			Protocol: 3,
		})

		redisErr := redisClient.ClientInfo(context.Background()).Err()
		Expect(redisErr).ToNot(HaveOccurred())

		var (
			storeErr error
		)

		storeService, storeErr = store.New(&store.Options{
			Encryption:   encryption.NewPlainText(),
			RedisBackend: redisClient,
			ShutdownCtx:  context.Background(),
			NodeName:     "test-node",
			SessionTTL:   5 * time.Second,
			Telemetry:    &telemetry.DummyTelemetry{},
			InstallID:    "test-install-id",
		})

		Expect(storeErr).ToNot(HaveOccurred())
		Expect(storeService).ToNot(BeNil())

		// Delete all steamdal_wasm:* keys
		err := clearWasmKeys(redisClient)
		Expect(err).ToNot(HaveOccurred())
	})

	Context("New()", func() {
		It("should perform param validation", func() {
			// Nil store
			wasm, err := New(context.Background(), nil, "test")
			Expect(err).To(HaveOccurred())
			Expect(err.Error()).To(ContainSubstring("store service is required"))
			Expect(wasm).To(BeNil())
		})

		It("should create context if none is provided", func() {
			// Nil context
			wasm, err := New(nil, storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasm).ToNot(BeNil())
			Expect(wasm.shutdownContext).ToNot(BeNil())
		})

		It("should preload bundled wasm files", func() {
			wasm, err := New(context.Background(), storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasm).ToNot(BeNil())
			Expect(wasm.shutdownContext).ToNot(BeNil())

			for name, module := range config {
				// Check that the wasm was saved to the store
				diskData, err := os.ReadFile(wasmDir + "/" + module.XFilename)
				Expect(err).ToNot(HaveOccurred())
				Expect(diskData).ToNot(BeNil())
				Expect(len(diskData)).ToNot(BeZero())

				expectedID := util.DeterminativeUUID(diskData)
				keyName := store.RedisWasmKey(name, expectedID)

				data, err := redisClient.Get(context.Background(), keyName).Bytes()
				Expect(err).ToNot(HaveOccurred())
				Expect(data).ToNot(BeNil())

				// Check that module can be unmarshalled
				wasmModule := &shared.WasmModule{}

				err = proto.Unmarshal(data, wasmModule)
				Expect(err).ToNot(HaveOccurred())

				// Check that all fields are properly set
				Expect(wasmModule.Id).To(Equal(expectedID))
				Expect(wasmModule.Name).To(Equal(module.Name))
				Expect(wasmModule.Bytes).ToNot(BeNil())
				Expect(wasmModule.Function).To(Equal(module.Function))
				Expect(wasmModule.XFilename).To(Equal(module.XFilename))
				Expect(wasmModule.XBundled).To(BeTrue())
			}
		})
	})

	Context("GetNumPreloaded()", func() {
		It("should return the number of preloaded wasm files", func() {
			wasm, err := New(context.Background(), storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasm).ToNot(BeNil())

			numPreloaded := wasm.GetNumPreloaded()
			Expect(numPreloaded).To(Equal(len(config)))
		})
	})

	Context("GetWasmStats()", func() {
		It("should return stats about wasm modules in the store", func() {
			wasm, err := New(context.Background(), storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasm).ToNot(BeNil())

			stats, err := wasm.GetWasmStats()
			Expect(err).ToNot(HaveOccurred())
			Expect(stats).ToNot(BeNil())

			Expect(stats.NumBundled).To(Equal(len(config)))
			Expect(len(stats.All)).To(Equal(len(config)))
		})
	})

	Context("PopulateWASMFields()", func() {
		It("should populate wasm fields in all steps in a pipeline", func() {
			wasm, err := New(context.Background(), storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasm).ToNot(BeNil())

			// Reminder: Check that wasmId, wasmBytes and wasmFunction is set
			pipeline := &protos.Pipeline{
				Id:   util.GenerateUUID(),
				Name: "Schema inference pipeline for tests",
				Steps: []*protos.PipelineStep{
					{
						Name: "Infer Schema (auto-generated step)",
						Step: &protos.PipelineStep_InferSchema{
							InferSchema: &steps.InferSchemaStep{
								CurrentSchema: make([]byte, 0),
							},
						},
					},
				},
			}

			err = wasm.PopulateWASMFields(context.Background(), pipeline)
			Expect(err).ToNot(HaveOccurred())

			for _, step := range pipeline.Steps {
				Expect(*step.XWasmId).ToNot(BeEmpty())
				Expect(step.XWasmBytes).ToNot(BeNil())
				Expect(*step.XWasmFunction).ToNot(BeEmpty())
			}
		})
	})

	Context("GenerateSchemaInferencePipeline()", func() {
		It("should create a pipeline with schema inference as first step", func() {
			wasm, err := New(context.Background(), storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasm).ToNot(BeNil())

			pipeline, err := wasm.GenerateSchemaInferencePipeline(context.Background())
			Expect(err).ToNot(HaveOccurred())
			Expect(pipeline).ToNot(BeNil())

			Expect(pipeline.Id).ToNot(BeEmpty())
			Expect(pipeline.Name).To(ContainSubstring("Schema Inference"))
			Expect(pipeline.Steps).ToNot(BeEmpty())

			// GenerateSchema*() should've called PopulateWASM*() and set wasm fields
			for _, step := range pipeline.Steps {
				Expect(step.Name).To(ContainSubstring("Infer Schema"))
				Expect(*step.XWasmId).ToNot(BeEmpty())
				Expect(step.XWasmBytes).ToNot(BeNil())
				Expect(*step.XWasmFunction).ToNot(BeEmpty())
			}
		})
	})

	Context("InjectSchemaInferenceForSetPipelinesCommands()", func() {
		It("should inject schema inference step into all commands", func() {
			pipeline := &protos.Pipeline{
				Id:   util.GenerateUUID(),
				Name: "Pipeline 1",
				Steps: []*protos.PipelineStep{
					{
						Name: "Detective has pii 1",
						Step: &protos.PipelineStep_Detective{
							Detective: &steps.DetectiveStep{
								Path: util.Pointer("foo"),
								Type: steps.DetectiveType_DETECTIVE_TYPE_HAS_FIELD,
							},
						},
					},
				},
			}

			cmds := []*protos.Command{
				{
					Audience: nil,
					Command: &protos.Command_SetPipelines{
						SetPipelines: &protos.SetPipelinesCommand{
							Pipelines: []*protos.Pipeline{pipeline},
						},
					},
				},
			}

			wasm, err := New(context.Background(), storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasm).ToNot(BeNil())

			numInjected, err := wasm.InjectSchemaInferenceForSetPipelinesCommands(context.Background(), cmds)
			Expect(err).ToNot(HaveOccurred())
			Expect(numInjected).To(Equal(1))

			// Check that schema inference pipeline was injected
			Expect(len(cmds)).To(Equal(1))
			Expect(len(cmds[0].GetSetPipelines().Pipelines)).To(Equal(2))
			Expect(cmds[0].GetSetPipelines().Pipelines[0].Name).To(ContainSubstring("Schema Inference"))
		})
	})

	Context("InjectSchemaInferenceForPipelines()", func() {
		It("should inject schema inference pipeline into existing set of pipelines", func() {
			wasm, err := New(context.Background(), storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasm).ToNot(BeNil())

			pipeline1 := &protos.Pipeline{
				Id:   util.GenerateUUID(),
				Name: "Pipeline 1",
				Steps: []*protos.PipelineStep{
					{
						Name: "Detective has pii 1",
						Step: &protos.PipelineStep_Detective{
							Detective: &steps.DetectiveStep{
								Path: util.Pointer("foo"),
								Type: steps.DetectiveType_DETECTIVE_TYPE_HAS_FIELD,
							},
						},
					},
				},
			}

			pipeline2 := &protos.Pipeline{
				Id:   util.GenerateUUID(),
				Name: "Pipeline 2",
				Steps: []*protos.PipelineStep{
					{
						Name: "Detective has pii 2",
						Step: &protos.PipelineStep_Detective{
							Detective: &steps.DetectiveStep{
								Path: util.Pointer("bar"),
								Type: steps.DetectiveType_DETECTIVE_TYPE_HAS_FIELD,
							},
						},
					},
				},
			}

			pipelines := []*protos.Pipeline{pipeline1, pipeline2}

			updatedPipelines, err := wasm.InjectSchemaInferenceForPipelines(context.Background(), pipelines)
			Expect(err).ToNot(HaveOccurred())
			Expect(updatedPipelines).ToNot(BeNil())

			// Passed in 2 pipelines, should get 3 back
			Expect(len(updatedPipelines)).To(Equal(len(pipelines) + 1))

			// First pipeline should be schema inference
			Expect(updatedPipelines[0].Name).To(ContainSubstring("Schema Inference"))
			Expect(updatedPipelines[0].Steps).ToNot(BeEmpty())
		})
	})

	Context("preloadAll()", func() {
		It("should preload all bundled wasm modules", func() {
			// clearWasmKeys() should've cleared pre-existing keys so this is a JIC check
			existingKeys, err := redisClient.Keys(context.Background(), store.RedisWasmPrefix+":*").Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(len(existingKeys)).To(BeZero())

			numPreloaded, err := preloadAll(storeService, wasmDir)
			Expect(err).ToNot(HaveOccurred())
			Expect(numPreloaded).To(Equal(len(config)))

			// Verify that all keys exist in the store
			keys, err := redisClient.Keys(context.Background(), store.RedisWasmPrefix+"*").Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(len(keys)).To(Equal(len(config)))
		})
	})

	Context("preload()", func() {
		It("should preload a single wasm module", func() {
			err := preload(context.Background(), storeService, "detective", wasmDir)
			Expect(err).ToNot(HaveOccurred())

			// Verify that wasm got written to store
			fileData, err := os.ReadFile(wasmDir + "/detective.wasm")
			Expect(err).ToNot(HaveOccurred())
			Expect(fileData).ToNot(BeNil())

			expectedID := util.DeterminativeUUID(fileData)
			keyName := store.RedisWasmKey("detective", expectedID)

			data, err := redisClient.Get(context.Background(), keyName).Result()
			Expect(err).ToNot(HaveOccurred())
			Expect(data).ToNot(BeEmpty())

			// Can we unmarshal it?
			module := &shared.WasmModule{}
			err = proto.Unmarshal([]byte(data), module)
			Expect(err).ToNot(HaveOccurred())
			Expect(module.Name).To(Equal("detective"))
			Expect(module.Id).To(Equal(expectedID))
			Expect(len(module.Bytes)).To(Equal(len(fileData)))
		})
	})
})

func clearWasmKeys(redisClient *redis.Client) error {
	keys, err := redisClient.Keys(context.Background(), store.RedisWasmPrefix+"*").Result()
	if err != nil {
		panic("unable to get wasm keys: " + err.Error())
	}

	for _, key := range keys {
		_, err := redisClient.Del(context.Background(), key).Result()
		if err != nil {
			panic("unable to delete wasm key: " + err.Error())
		}
	}

	return nil
}
