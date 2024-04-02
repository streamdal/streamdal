package wasm

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"time"

	"github.com/gofrs/uuid"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/redis/go-redis/v9"

	"github.com/streamdal/streamdal/apps/server/services/encryption"
	"github.com/streamdal/streamdal/apps/server/services/store"
	"github.com/streamdal/streamdal/apps/server/services/telemetry"
)

var _ = Describe("Wasm", func() {
	// TODO: Write tests
	FContext("New()", func() {
		var (
			storeService *store.Store
			wasmDir      = "../../assets/wasm"
		)

		BeforeEach(func() {
			// Redis backend
			redisClient := redis.NewClient(&redis.Options{
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
		})

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
			// Reminder: should've preloaded everything in config
		})
	})

	// TODO: Write tests
	Context("GetNumPreloaded()", func() {
		It("should return the number of preloaded wasm files", func() {

		})
	})

	// TODO: Write tests
	Context("GetWasmStats()", func() {
		It("should return error if unable to get all wasm from store", func() {

		})

		It("should return stats about wasm modules in the store", func() {

		})
	})

	// TODO: Write tests
	Context("PopulateWASMFields()", func() {
		It("should populate wasm fields in all steps in a pipeline", func() {
			// Reminder: Check that wasmId, wasmBytes and wasmFunction is set
		})

		It("should error if unable to fetch wasm from store", func() {

		})

		It("should error if a pipeline step is unknown", func() {

		})
	})

	// TODO: Write tests
	Context("GenerateSchemaInferencePipeline()", func() {
		It("should create a pipeline with schema inference as first step", func() {
			// Reminder: PopulateWASMFields should be called
		})
	})

	// TODO: Write tests
	Context("InjectSchemaInferenceForSetPipelinesCommands()", func() {
		It("should inject schema inference step into all commands", func() {

		})

		It("should return number of times an injection was made", func() {

		})
	})

	// TODO: Write tests
	Context("InjectSchemaInferenceForPipelines()", func() {
		It("should inject schema inference step into all pipelines", func() {
			// Reminder: check that schema inference is first step
		})
	})

	// TODO: Write tests
	Context("preloadAll()", func() {
		It("should preload all bundled wasm modules", func() {

		})
	})

	// TODO: Write tests
	Context("preload()", func() {
		It("should preload a single wasm module", func() {

		})
	})

	Context("DeterminativeUUID()", func() {
		var (
			wasmFile = "../../assets/wasm/detective.wasm"
			modifier = "test"
		)

		It("should generate a deterministic UUID for a wasm file", func() {
			fileData, err := os.ReadFile(wasmFile)
			Expect(err).ToNot(HaveOccurred())

			hash := sha256.Sum256(fileData)

			id, err := uuid.FromBytes(hash[16:])
			Expect(err).ToNot(HaveOccurred())

			// Load multiple times, id should be the same every time
			for i := 0; i < 10; i++ {
				fileData, err = os.ReadFile(wasmFile)
				Expect(err).ToNot(HaveOccurred())

				hash = sha256.Sum256(fileData)

				id, err = uuid.FromBytes(hash[16:])
				Expect(err).ToNot(HaveOccurred())

				generatedUUID := DeterminativeUUID(fileData)
				Expect(generatedUUID).To(Equal(id.String()))
			}
		})

		It("has a consistent result using a modifier", func() {
			fileData, err := os.ReadFile(wasmFile)
			Expect(err).ToNot(HaveOccurred())

			firstUUID := DeterminativeUUID(fileData, modifier)

			// Load multiple times, id should be the same every time
			for i := 0; i < 10; i++ {
				fileData, err = os.ReadFile(wasmFile)
				Expect(err).ToNot(HaveOccurred())

				generatedUUID := DeterminativeUUID(fileData, modifier)
				Expect(generatedUUID).To(Equal(firstUUID))
			}
		})

		It("modifier usage should change result", func() {
			fileData, err := os.ReadFile(wasmFile)
			Expect(err).ToNot(HaveOccurred())

			uuidWithoutModifier := DeterminativeUUID(fileData)
			uuidWithModifier := DeterminativeUUID(fileData, modifier)

			Expect(uuidWithoutModifier).ToNot(BeEmpty())
			Expect(uuidWithModifier).ToNot(BeEmpty())
			Expect(uuidWithoutModifier).ToNot(Equal(uuidWithModifier))
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
