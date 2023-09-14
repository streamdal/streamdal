//go:build noparallel

package httpapi

//// This is a "semi-integration" test suite -- it requires a running RedisBackend server
//// but does NOT start an actual HTTP API; the tests test the handlers (rather
//// than the routes).
//var _ = Describe("HTTPAPI", func() {
//	var (
//		cfg         *config.Config
//		d           *deps.Dependencies
//		api         *HTTPAPI
//		testVersion = "1.0.1"
//		apiErr      error
//		depsErr     error
//	)
//
//	BeforeEach(func() {
//		os.Setenv("SNITCH_SERVER_NODE_NAME", "test-node")
//		os.Setenv("SNITCH_SERVER_AUTH_TOKEN", "1234")
//
//		cfg = config.New(testVersion)
//		cfg.WASMDir = "./assets/wasm"
//
//		d, depsErr = deps.New(cfg)
//
//		Expect(depsErr).ToNot(HaveOccurred())
//		Expect(d).ToNot(BeNil())
//
//		o := &Options{
//			KVService:            d.KVService,
//			HTTPAPIListenAddress: cfg.HTTPAPIListenAddress,
//			Version:              testVersion,
//			ShutdownContext:      d.ShutdownContext,
//			Health:               d.Health,
//			BusService:           d.BusService,
//			AuthToken:            cfg.AuthToken,
//		}
//
//		api, apiErr = New(o)
//
//		Expect(apiErr).ToNot(HaveOccurred())
//		Expect(api).ToNot(BeNil())
//	})
//
//	Describe("getUsageKVHandler", func() {
//		BeforeEach(func() {
//			// Clear the KV store
//			err := d.KVService.DeleteAll(nil)
//			Expect(err).ToNot(HaveOccurred())
//		})
//
//		It("should return correct usage", func() {
//			request := httptest.NewRequest(http.MethodGet, "/api/v1/kv-usage", nil)
//			response := httptest.NewRecorder()
//
//			api.getUsageKVHandler(response, request)
//
//			Expect(response.Code).To(Equal(http.StatusOK))
//
//			// There should be nothing in the KV store
//			Expect(response.Body.String()).To(Equal(`{"num_items":0,"num_bytes":0}`))
//
//			// Add some items
//			err := addKVs(d.KVService, 10)
//			Expect(err).ToNot(HaveOccurred())
//
//			// Get usage again, there should be more than 0 items
//			response2 := httptest.NewRecorder()
//			api.getUsageKVHandler(response2, request)
//
//			Expect(response.Code).To(Equal(http.StatusOK))
//			usage := &kv.Usage{}
//			err = json.Unmarshal(response2.Body.Bytes(), usage)
//			Expect(err).ToNot(HaveOccurred())
//
//			Expect(usage.NumItems).To(BeNumerically(">=", 10))
//			Expect(usage.NumBytes).To(BeNumerically(">", 0))
//		})
//	})
//
//	Describe("getKVHandler", func() {
//		BeforeEach(func() {
//			// Clear the KV store
//			err := d.KVService.DeleteAll(nil)
//			Expect(err).ToNot(HaveOccurred())
//		})
//
//		It("happy path", func() {
//			// Shouldn't have any items
//			request := httptest.NewRequest(http.MethodGet, "/api/v1/kv/test-key-0", nil)
//			response1 := httptest.NewRecorder()
//
//			api.getKVHandler(response1, request)
//
//			Expect(response1.Code).To(Equal(http.StatusNotFound))
//
//			// Now add something
//			err := addKVs(d.KVService, 1)
//			Expect(err).ToNot(HaveOccurred())
//
//			// Get the first item
//			response2 := httptest.NewRecorder()
//
//			api.getKVHandler(response2, request)
//
//			//Expect(response2.Code).To(Equal(http.StatusOK))
//			Expect(response2.Body.String()).To(Equal("wtf"))
//		})
//	})
//})
//
//func addKVs(svc kv.IKV, numItems int) error {
//	objects := make([]*protos.KVObject, 0)
//
//	for i := 0; i < numItems; i++ {
//		objects = append(objects, &protos.KVObject{
//			Key:   "test-key-" + strconv.Itoa(i),
//			Value: []byte(util.GenerateUUID()),
//		})
//	}
//
//	return svc.Create(nil, objects, false)
//}
