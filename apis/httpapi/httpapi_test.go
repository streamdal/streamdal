package httpapi

import (
	"net/http"
	"net/http/httptest"

	"github.com/InVisionApp/go-health/v2"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/streamdal/snitch-server/config"
	"github.com/streamdal/snitch-server/deps"
)

var _ = Describe("HTTPAPI", func() {
	var (
		request     *http.Request
		response    *httptest.ResponseRecorder
		cfg         *config.Config
		d           *deps.Dependencies
		api         *HTTPAPI
		testVersion = "1.0.1"
	)

	BeforeEach(func() {
		cfg = config.New(testVersion)

		d = &deps.Dependencies{
			Config: cfg,
			Health: health.New(),
		}

		api = New(d)

		response = httptest.NewRecorder()
	})

	Describe("New", func() {
		Context("when instantiating an api", func() {
			It("should have correct attributes", func() {
				Expect(api.Deps.Config).ToNot(BeNil())
				Expect(api.Deps.Config.VersionStr).To(Equal(testVersion))
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
			It("should return the HTTPAPI version", func() {
				api.versionHandler(response, request)
				Expect(response.Code).To(Equal(200))
				Expect(response.Body).To(ContainSubstring(testVersion))
			})
		})
	})
})
