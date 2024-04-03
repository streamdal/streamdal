package store

import (
	"context"
	"os"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/redis/go-redis/v9"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/shared"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/apps/server/services/encryption"
	"github.com/streamdal/streamdal/apps/server/services/telemetry"
	"github.com/streamdal/streamdal/apps/server/util"
)

var _ = Describe("Store", func() {
	Describe("Wasm methods", func() {
		var (
			redisClient  *redis.Client
			storeService *Store
			modules      []*shared.WasmModule
		)

		BeforeEach(func() {
			redisClient = redis.NewClient(&redis.Options{
				Addr:     "localhost:6379",
				Protocol: 3,
				DB:       1, // Having these tests write to DB 1 to avoid conflicts with other tests
				// TODO: Delete* operations should use a diff DB as well
			})

			redisErr := redisClient.ClientInfo(context.Background()).Err()
			Expect(redisErr).ToNot(HaveOccurred())

			var storeErr error

			storeService, storeErr = New(&Options{
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

			modules = addSampleWasm(redisClient)
			Expect(modules).ToNot(BeNil())
			Expect(len(modules)).To(Equal(2))
		})

		Context("GetWasm", func() {
			It("should fetch Wasm by name and ID", func() {
				module, err := storeService.GetWasm(context.Background(), modules[0].Name, modules[0].Id)
				Expect(err).ToNot(HaveOccurred())
				Expect(module).ToNot(BeNil())
				Expect(module.Id).To(Equal(modules[0].Id))
				Expect(module.Name).To(Equal(modules[0].Name))
				Expect(module.Bytes).To(Equal(modules[0].Bytes))
				Expect(module.Function).To(Equal(modules[0].Function))
				Expect(module.XFilename).To(Equal(modules[0].XFilename))
				Expect(module.XBundled).To(Equal(modules[0].XBundled))
				Expect(*module.Description).To(Equal(*modules[0].Description))
				Expect(*module.Version).To(Equal(*modules[0].Version))
				Expect(*module.Url).To(Equal(*modules[0].Url))
			})
		})

		Context("GetWasmByID", func() {
			It("should fetch Wasm by ID", func() {
				module, err := storeService.GetWasmByID(context.Background(), modules[0].Id)
				Expect(err).ToNot(HaveOccurred())
				Expect(module).ToNot(BeNil())
				Expect(module.Id).To(Equal(modules[0].Id))
				Expect(module.Name).To(Equal(modules[0].Name))
				Expect(module.Bytes).To(Equal(modules[0].Bytes))
				Expect(module.Function).To(Equal(modules[0].Function))
				Expect(module.XFilename).To(Equal(modules[0].XFilename))
				Expect(module.XBundled).To(Equal(modules[0].XBundled))
				Expect(*module.Description).To(Equal(*modules[0].Description))
				Expect(*module.Version).To(Equal(*modules[0].Version))
				Expect(*module.Url).To(Equal(*modules[0].Url))
			})
		})

		Context("GetWasmByName()", func() {
			It("should fetch Wasm by name", func() {
				module, err := storeService.GetWasmByName(context.Background(), modules[0].Name)
				Expect(err).ToNot(HaveOccurred())
				Expect(module).ToNot(BeNil())
				Expect(module.Id).To(Equal(modules[0].Id))
				Expect(module.Name).To(Equal(modules[0].Name))
				Expect(module.Bytes).To(Equal(modules[0].Bytes))
				Expect(module.Function).To(Equal(modules[0].Function))
				Expect(module.XFilename).To(Equal(modules[0].XFilename))
				Expect(module.XBundled).To(Equal(modules[0].XBundled))
				Expect(*module.Description).To(Equal(*modules[0].Description))
				Expect(*module.Version).To(Equal(*modules[0].Version))
				Expect(*module.Url).To(Equal(*modules[0].Url))
			})
		})

		Context("GetAllWasm()", func() {
			It("should fetch all Wasm", func() {
				fetched, err := storeService.GetAllWasm(context.Background())
				Expect(err).ToNot(HaveOccurred())
				Expect(fetched).ToNot(BeNil())
				Expect(len(fetched)).To(Equal(2))
				Expect(fetched[0].Id).To(Equal(modules[0].Id))
				Expect(fetched[0].Name).To(Equal(modules[0].Name))
				Expect(fetched[0].Bytes).To(Equal(modules[0].Bytes))
				Expect(fetched[0].Function).To(Equal(modules[0].Function))
			})
		})

		Context("SetWasm()", func() {
			It("should store Wasm by name and ID", func() {
				// Existing entry should be there
				keys, err := redisClient.Keys(context.Background(), RedisWasmKey(modules[0].Name, modules[0].Id)).Result()
				Expect(err).ToNot(HaveOccurred())
				Expect(keys).To(HaveLen(1))

				// Delete existing entry
				err = redisClient.Del(context.Background(), RedisWasmKey(modules[0].Name, modules[0].Id)).Err()
				Expect(err).ToNot(HaveOccurred())

				// Existing entry should no longer exist
				keys, err = redisClient.Keys(context.Background(), RedisWasmKey(modules[0].Name, modules[0].Id)).Result()
				Expect(err).ToNot(HaveOccurred())
				Expect(keys).To(HaveLen(0))

				// Add new entry
				err = storeService.SetWasm(context.Background(), modules[0].Name, modules[0].Id, modules[0])
				Expect(err).ToNot(HaveOccurred())

				// New entry should exist
				keys, err = redisClient.Keys(context.Background(), RedisWasmKey(modules[0].Name, modules[0].Id)).Result()
				Expect(err).ToNot(HaveOccurred())
				Expect(keys).To(HaveLen(1))

				// Does the saved data match?
				data, err := redisClient.Get(context.Background(), RedisWasmKey(modules[0].Name, modules[0].Id)).Bytes()
				Expect(err).ToNot(HaveOccurred())
				Expect(data).ToNot(BeNil())

				module := &shared.WasmModule{}
				err = proto.Unmarshal(data, module)
				Expect(err).ToNot(HaveOccurred())
				Expect(module.Id).To(Equal(modules[0].Id))
				Expect(module.Name).To(Equal(modules[0].Name))
				Expect(module.Bytes).To(Equal(modules[0].Bytes))
			})
		})

		// TODO: This should be "OverwriteByID"
		Context("SetWasmByID()", func() {
			It("should store Wasm by ID", func() {

			})
		})

		// TODO: This should be "OverwriteByName"
		Context("SetWasmByName()", func() {
			It("should store Wasm by name", func() {
			})
		})

		Context("DeleteWasm()", func() {
			It("should delete Wasm", func() {
				err := storeService.DeleteWasm(context.Background(), modules[0].Name, modules[0].Id)
				Expect(err).ToNot(HaveOccurred())

				keys, err := redisClient.Keys(context.Background(), RedisWasmKey(modules[0].Name, modules[0].Id)).Result()
				Expect(err).ToNot(HaveOccurred())
				Expect(keys).To(HaveLen(0))
			})
		})

		Context("DeleteWasmByID()", func() {
			It("should delete Wasm by ID", func() {
				err := storeService.DeleteWasmByID(context.Background(), modules[0].Id)
				Expect(err).ToNot(HaveOccurred())

				keys, err := redisClient.Keys(context.Background(), RedisWasmKey("*", modules[0].Id)).Result()
				Expect(err).ToNot(HaveOccurred())
				Expect(keys).To(HaveLen(0))
			})
		})

		Context("DeleteWasmByName()", func() {
			It("should delete Wasm by name", func() {
				err := storeService.DeleteWasmByName(context.Background(), modules[0].Name)
				Expect(err).ToNot(HaveOccurred())

				keys, err := redisClient.Keys(context.Background(), RedisWasmKey(modules[0].Name, "*")).Result()
				Expect(err).ToNot(HaveOccurred())
				Expect(keys).To(HaveLen(0))
			})
		})
	})
})

func addSampleWasm(redisClient *redis.Client) []*shared.WasmModule {
	Expect(redisClient).ToNot(BeNil())

	files := []string{
		"../../assets/wasm/detective.wasm",
		"../../assets/wasm/transform.wasm",
	}

	modulesData := make([][]byte, 0)

	for _, f := range files {
		data, err := os.ReadFile(f)
		Expect(err).ToNot(HaveOccurred())
		Expect(data).ToNot(BeNil())

		modulesData = append(modulesData, data)
	}

	modules := []*shared.WasmModule{
		{
			Id:                    util.DeterminativeUUID(modulesData[0]),
			Bytes:                 modulesData[0],
			Function:              "f",
			Name:                  "detective",
			XFilename:             "detective.wasm",
			XBundled:              true,
			Description:           util.Pointer("test detective description"),
			Version:               util.Pointer("v0.0.1-detective"),
			Url:                   util.Pointer("https://example.com/detective.wasm"),
			XCreatedAtUnixTsNsUtc: util.Pointer(time.Now().UTC().UnixNano()),
			XUpdatedAtUnixTsNsUtc: nil,
		},
		{
			Id:                    util.DeterminativeUUID(modulesData[1]),
			Bytes:                 modulesData[1],
			Function:              "f",
			Name:                  "transform",
			XFilename:             "transform.wasm",
			XBundled:              true,
			Description:           util.Pointer("test transform description"),
			Version:               util.Pointer("v0.0.1-transform"),
			Url:                   util.Pointer("https://example.com/transform.wasm"),
			XCreatedAtUnixTsNsUtc: util.Pointer(time.Now().UTC().UnixNano()),
			XUpdatedAtUnixTsNsUtc: nil,
		},
	}

	for _, module := range modules {
		protoData, err := proto.Marshal(module)
		Expect(err).ToNot(HaveOccurred())
		Expect(protoData).ToNot(BeNil())

		keyname := RedisWasmKey(module.Name, module.Id)

		err = redisClient.Set(context.Background(), keyname, protoData, 0).Err()
		Expect(err).ToNot(HaveOccurred())

		// Double check that object was added
		redisData, err := redisClient.Get(context.Background(), keyname).Bytes()
		Expect(err).ToNot(HaveOccurred())
		Expect(redisData).ToNot(BeNil())
	}

	return modules
}
