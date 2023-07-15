package api

import (
	"net/http"
	"net/http/httptest"

	"github.com/InVisionApp/go-health"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/batchcorp/snitch-server/config"
	"github.com/batchcorp/snitch-server/deps"
)

var _ = Describe("API", func() {
	var (
		request     *http.Request
		response    *httptest.ResponseRecorder
		cfg         *config.Config
		d           *deps.Dependencies
		api         *API
		testVersion = "1.0.1"
	)

	BeforeEach(func() {
		cfg = config.New()
		d = &deps.Dependencies{
			Health: health.New(),
		}

		//d, _ = deps.New(cfg)
		api = New(cfg, d, testVersion)

		response = httptest.NewRecorder()
	})

	Describe("New", func() {
		Context("when instantiating an api", func() {
			It("should have correct attributes", func() {
				Expect(api.Config).ToNot(BeNil())
				Expect(api.Version).To(Equal(testVersion))
			})
		})
	})

	Describe("HealthCheckHandler", func() {
		Context("when the request is successful", func() {
			It("should return 200", func() {
				api.healthCheckHandler(response, request)
				Expect(response.Code).To(Equal(200))
			})
		})
	})

	Describe("VersionHandler", func() {
		Context("when the request is successful", func() {
			It("should return the API version", func() {
				api.versionHandler(response, request)
				Expect(response.Code).To(Equal(200))
				Expect(response.Body).To(ContainSubstring(testVersion))
			})
		})
	})
})
