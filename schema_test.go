package streamdal

import (
	"context"
	"sync"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/streamdal/go-sdk/logger/loggerfakes"
	"github.com/streamdal/go-sdk/server/serverfakes"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"
)

var _ = Describe("Schema", func() {

	var s *Streamdal
	var aud *protos.Audience

	BeforeEach(func() {
		s = &Streamdal{
			schemasMtx: &sync.RWMutex{},
			schemas:    make(map[string]*protos.Schema),
			config: &Config{
				Logger: &loggerfakes.FakeLogger{},
			},
		}

		aud = &protos.Audience{
			ServiceName:   "test-service",
			OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
			OperationName: "test-operation",
			ComponentName: "kafka",
		}
	})

	Context("getSchema", func() {
		It("returns empty when no schema found", func() {
			schema := s.getSchema(context.Background(), nil)
			Expect(schema).To(Equal([]byte(``)))
		})

		It("returns schema when found", func() {
			s.schemas[audToStr(aud)] = &protos.Schema{
				JsonSchema: []byte(`{"type": "string"}`),
			}

			schema := s.getSchema(context.Background(), aud)
			Expect(schema).To(Equal([]byte(`{"type": "string"}`)))
		})
	})

	Context("setSchema", func() {
		It("sets schema", func() {
			s.setSchema(context.Background(), aud, []byte(`{"type": "string"}`))
			schema := s.getSchema(context.Background(), aud)
			Expect(schema).To(Equal([]byte(`{"type": "string"}`)))
		})
	})

	Context("handleSchema", func() {
		It("returns false when no schema step", func() {
			fakeClient := &serverfakes.FakeIServerClient{}
			s.serverClient = fakeClient

			step := &protos.PipelineStep{
				Step: nil,
			}

			got := s.handleSchema(context.Background(), aud, step, nil)

			Expect(got).To(BeFalse())
		})

		It("returns false on bad wasm exit", func() {
			fakeClient := &serverfakes.FakeIServerClient{}
			s.serverClient = fakeClient

			step := &protos.PipelineStep{
				Step: &protos.PipelineStep_InferSchema{
					InferSchema: &steps.InferSchemaStep{
						CurrentSchema: []byte(`{}`),
					},
				},
			}

			wasmResp := &protos.WASMResponse{
				ExitCode: protos.WASMExitCode_WASM_EXIT_CODE_FAILURE,
			}

			got := s.handleSchema(context.Background(), aud, step, wasmResp)

			Expect(got).To(BeFalse())
		})

		It("sends to server when an updated schema is generated", func() {
			fakeClient := &serverfakes.FakeIServerClient{}
			s.serverClient = fakeClient

			step := &protos.PipelineStep{
				Step: &protos.PipelineStep_InferSchema{
					InferSchema: &steps.InferSchemaStep{
						CurrentSchema: []byte(`{}`),
					},
				},
			}

			wasmResp := &protos.WASMResponse{
				ExitCode:   protos.WASMExitCode_WASM_EXIT_CODE_SUCCESS,
				OutputStep: []byte(`{"type": "string"}`),
			}

			got := s.handleSchema(context.Background(), aud, step, wasmResp)

			// Give time for goroutine to run
			time.Sleep(time.Millisecond * 500)

			Expect(got).To(BeTrue())
			Expect(fakeClient.SendSchemaCallCount()).To(Equal(1))
		})
	})
})
