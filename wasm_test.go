package streamdal

import (
	"context"
	"os"
	"sync"

	"github.com/google/uuid"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/protos/build/go/protos"
	"github.com/streamdal/protos/build/go/protos/steps"
)

var _ = Describe("WASM Modules", func() {
	Context("ValidJSON", func() {
		It("returns success on valid json", func() {
			wasmData, err := os.ReadFile("test-assets/wasm/validjson.wasm")
			Expect(err).ToNot(HaveOccurred())

			req := &protos.WASMRequest{
				Step: &protos.PipelineStep{
					Step: &protos.PipelineStep_ValidJson{
						ValidJson: &steps.ValidJSONStep{},
					},
					XWasmId:       stringPtr(uuid.New().String()),
					XWasmFunction: stringPtr("f"),
					XWasmBytes:    wasmData,
				},
				InputPayload: []byte(`{"foo":"bar"}`),
			}

			s := &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    map[string]map[string]*protos.Command{},
				audiencesMtx: &sync.RWMutex{},
				audiences:    map[string]struct{}{},
			}

			f, err := s.createFunction(req.Step)
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = nil

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS))
		})
	})

	Context("httpRequest", func() {
		It("performs a HTTP request", func() {
			wasmData, err := os.ReadFile("test-assets/wasm/httprequest.wasm")
			Expect(err).ToNot(HaveOccurred())

			req := &protos.WASMRequest{
				Step: &protos.PipelineStep{
					Step: &protos.PipelineStep_HttpRequest{
						HttpRequest: &steps.HttpRequestStep{
							Request: &steps.HttpRequest{
								Url:    "https://www.google.com",
								Method: steps.HttpRequestMethod_HTTP_REQUEST_METHOD_GET,
								Body:   []byte(``),
							},
						},
					},
					XWasmId:       stringPtr(uuid.New().String()),
					XWasmFunction: stringPtr("f"),
					XWasmBytes:    wasmData,
				},
				InputPayload: []byte(``),
			}

			s := &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    map[string]map[string]*protos.Command{},
				audiencesMtx: &sync.RWMutex{},
				audiences:    map[string]struct{}{},
			}

			f, err := s.createFunction(req.Step)
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = nil

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS))
		})
	})

	Context("InferSchema", func() {
		It("infers a schema from the json payload", func() {
			wasmResp, err := inferSchema("test-assets/json-examples/small.json")
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS))
			Expect(wasmResp.ExitMsg).To(ContainSubstring("inferred fresh schema"))
		})
	})
})
