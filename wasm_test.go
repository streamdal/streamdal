package streamdal

import (
	"context"
	"encoding/json"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"

	"github.com/streamdal/go-sdk/logger"
	"github.com/streamdal/go-sdk/metrics/metricsfakes"
	"github.com/streamdal/go-sdk/server/serverfakes"
)

var _ = Describe("WASM Modules", func() {
	Context("ValidJSON", func() {

		var req *protos.WASMRequest
		var s *Streamdal
		var f *function

		BeforeEach(func() {
			wasmData, err := os.ReadFile("test-assets/wasm/validjson.wasm")
			Expect(err).ToNot(HaveOccurred())

			req = &protos.WASMRequest{
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

			s = &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    map[string]map[string]*protos.Command{},
				audiencesMtx: &sync.RWMutex{},
				audiences:    map[string]struct{}{},
			}

			f, err = s.createFunction(req.Step)
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = nil
		})

		It("returns success on valid json", func() {
			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
		})

		It("returns failure on invalid json", func() {
			req.InputPayload = []byte(`{"foo":"bar"`)

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_FALSE))
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
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
		})
	})

	Context("InferSchema", func() {
		It("infers a schema from the json payload", func() {
			wasmResp, err := inferSchema("test-assets/json-examples/small.json")
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
			Expect(wasmResp.ExitMsg).To(ContainSubstring("inferred fresh schema"))
		})
	})

	Context("Detective", func() {
		var s *Streamdal
		var req *protos.WASMRequest
		var f *function

		BeforeEach(func() {
			wasmData, err := os.ReadFile("test-assets/wasm/detective.wasm")
			Expect(err).ToNot(HaveOccurred())

			req = &protos.WASMRequest{
				Step: &protos.PipelineStep{
					Step: &protos.PipelineStep_Detective{
						Detective: &steps.DetectiveStep{
							Path:   stringPtr("object.type"),
							Args:   []string{"streamdal"},
							Type:   steps.DetectiveType_DETECTIVE_TYPE_STRING_CONTAINS_ANY,
							Negate: boolPtr(false),
						},
					},
					XWasmId:       stringPtr(uuid.New().String()),
					XWasmFunction: stringPtr("f"),
					XWasmBytes:    wasmData,
				},
				InputPayload: nil,
			}

			s = &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    map[string]map[string]*protos.Command{},
				audiencesMtx: &sync.RWMutex{},
				audiences:    map[string]struct{}{},
			}

			f, err = s.createFunction(req.Step)
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = nil
		})

		It("returns success on string contains any", func() {
			req.InputPayload = []byte(`{"object": {"type": "streamdal"}}`)

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
		})

		It("returns failure on string contains any", func() {
			req.InputPayload = []byte(`{"object": {"type": "microsoft"}}`)

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_FALSE))
		})

		It("can scan the whole payload", func() {
			req.InputPayload = []byte(`{"object": {"type": "streamdal", "cc_num": "4111111111111111"}}`)

			det := req.Step.GetDetective()
			det.Path = stringPtr("")
			det.Args = []string{""}
			det.Type = steps.DetectiveType_DETECTIVE_TYPE_PII_CREDIT_CARD

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))

			// Check that we don't find it
			req.InputPayload = []byte(`{"object": {"type": "streamdal", "cc_num": "1234"}}`)

			data, err = proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err = f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp = &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_FALSE))
		})
	})

	Context("transform", func() {
		var req *protos.WASMRequest
		var s *Streamdal

		BeforeEach(func() {
			s = &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    map[string]map[string]*protos.Command{},
				audiencesMtx: &sync.RWMutex{},
				audiences:    map[string]struct{}{},
			}

			req = &protos.WASMRequest{
				Step: &protos.PipelineStep{
					Step:          nil,
					XWasmId:       stringPtr(uuid.New().String()),
					XWasmFunction: stringPtr("f"),
					XWasmBytes:    nil,
				},
				InputPayload: []byte(`{"object": {"type": "streamdal", "cc_num": "1234"}}`),
			}
		})

		It("modifies a field value", func() {
			wasmData, err := os.ReadFile("test-assets/wasm/transform.wasm")
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = wasmData

			req.Step.Step = &protos.PipelineStep_Transform{
				Transform: &steps.TransformStep{
					Type: steps.TransformType_TRANSFORM_TYPE_REPLACE_VALUE,
					Options: &steps.TransformStep_ReplaceValueOptions{
						ReplaceValueOptions: &steps.TransformReplaceValueOptions{
							Path:  "object.type",
							Value: "\"testing\"",
						},
					},
				},
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
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))

			resultJSON := map[string]interface{}{}
			err = json.Unmarshal(wasmResp.OutputPayload, &resultJSON)
			Expect(err).ToNot(HaveOccurred())
			Expect(resultJSON["object"].(map[string]interface{})["type"]).To(Equal("testing"))
		})

		It("deletes a field", func() {
			wasmData, err := os.ReadFile("test-assets/wasm/transform.wasm")
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = wasmData

			req.Step.Step = &protos.PipelineStep_Transform{
				Transform: &steps.TransformStep{
					Type: steps.TransformType_TRANSFORM_TYPE_DELETE_FIELD,
					Options: &steps.TransformStep_DeleteFieldOptions{
						DeleteFieldOptions: &steps.TransformDeleteFieldOptions{
							Path: "object.type",
						},
					},
				},
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
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
			Expect(wasmResp.OutputPayload).Should(MatchJSON(`{"object": {"cc_num": "1234"}}`))
		})

		It("truncates a field by total length", func() {
			wasmData, err := os.ReadFile("test-assets/wasm/transform.wasm")
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = wasmData

			req.Step.Step = &protos.PipelineStep_Transform{
				Transform: &steps.TransformStep{
					Type: steps.TransformType_TRANSFORM_TYPE_TRUNCATE_VALUE,
					Options: &steps.TransformStep_TruncateOptions{
						TruncateOptions: &steps.TransformTruncateOptions{
							Path:  "object.type",
							Type:  steps.TransformTruncateType_TRANSFORM_TRUNCATE_TYPE_LENGTH,
							Value: 3,
						},
					},
				},
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
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
			Expect(wasmResp.OutputPayload).Should(MatchJSON(`{"object": {"type": "str", "cc_num": "1234"}}`))
		})

		It("truncates a field by percent length", func() {
			wasmData, err := os.ReadFile("test-assets/wasm/transform.wasm")
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = wasmData

			req.Step.Step = &protos.PipelineStep_Transform{
				Transform: &steps.TransformStep{
					Type: steps.TransformType_TRANSFORM_TYPE_TRUNCATE_VALUE,
					Options: &steps.TransformStep_TruncateOptions{
						TruncateOptions: &steps.TransformTruncateOptions{
							Path:  "object.type",
							Type:  steps.TransformTruncateType_TRANSFORM_TRUNCATE_TYPE_PERCENTAGE,
							Value: 50,
						},
					},
				},
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
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
			Expect(wasmResp.OutputPayload).Should(MatchJSON(`{"object": {"type": "stre", "cc_num": "1234"}}`))
		})
	})

	Context("Schema validation", func() {
		var s *Streamdal
		var req *protos.WASMRequest
		var f *function

		BeforeEach(func() {

			schema := []byte(`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Generated schema for Root",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "age": {
      "type": "number"
    },
    "foo": {
      "type": "object",
      "properties": {
        "key": {
          "type": "string"
        }
      },
      "required": [
        "key"
      ]
    }
  },
  "required": [
  ]
}`)

			wasmData, err := os.ReadFile("test-assets/wasm/schemavalidation.wasm")
			Expect(err).ToNot(HaveOccurred())

			req = &protos.WASMRequest{
				Step: &protos.PipelineStep{
					Step: &protos.PipelineStep_SchemaValidation{
						SchemaValidation: &steps.SchemaValidationStep{
							Type:      steps.SchemaValidationType_SCHEMA_VALIDATION_TYPE_JSONSCHEMA,
							Condition: steps.SchemaValidationCondition_SCHEMA_VALIDATION_CONDITION_MATCH,
							Options: &steps.SchemaValidationStep_JsonSchema{
								JsonSchema: &steps.SchemaValidationJSONSchema{
									JsonSchema: schema,
									Draft:      steps.JSONSchemaDraft_JSONSCHEMA_DRAFT_07,
								},
							},
						},
					},
					XWasmId:       stringPtr(uuid.New().String()),
					XWasmFunction: stringPtr("f"),
					XWasmBytes:    wasmData,
				},
				InputPayload: nil,
			}

			s = &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    map[string]map[string]*protos.Command{},
				audiencesMtx: &sync.RWMutex{},
				audiences:    map[string]struct{}{},
			}

			f, err = s.createFunction(req.Step)
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = nil
		})

		It("Fails validation", func() {
			req.InputPayload = []byte(`{
  "name": "Bob",
  "age": "str",
  "foo": {"key": "value"}
}`)

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitMsg).To(Equal("payload does not match schema, invalid fields: age: expected type=number; got value=\"str\""))
			// TODO: Why is Wasm returning "3" (ERROR) here?
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_FALSE))
		})

		It("Passes validation", func() {
			req.InputPayload = []byte(`{
  "name": "Bob",
  "age": 30,
  "foo": {"key": "value"}
}`)

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(wasmResp.ExitMsg).To(Equal("payload matches schema"))
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
		})
	})

	Context("Transform", func() {
		var s *Streamdal
		var req *protos.WASMRequest
		var f *function

		BeforeEach(func() {
			wasmData, err := os.ReadFile("test-assets/wasm/transform.wasm")
			Expect(err).ToNot(HaveOccurred())

			req = &protos.WASMRequest{
				Step: &protos.PipelineStep{
					Step: &protos.PipelineStep_Transform{
						Transform: &steps.TransformStep{
							Type: steps.TransformType_TRANSFORM_TYPE_EXTRACT,
							Options: &steps.TransformStep_ExtractOptions{
								ExtractOptions: &steps.TransformExtractOptions{},
							},
						},
					},
					XWasmId:       stringPtr(uuid.New().String()),
					XWasmFunction: stringPtr("f"),
					XWasmBytes:    wasmData,
				},
				InputPayload: nil,
			}

			s = &Streamdal{
				pipelinesMtx: &sync.RWMutex{},
				pipelines:    map[string]map[string]*protos.Command{},
				audiencesMtx: &sync.RWMutex{},
				audiences:    map[string]struct{}{},
			}

			f, err = s.createFunction(req.Step)
			Expect(err).ToNot(HaveOccurred())

			req.Step.XWasmBytes = nil
		})

		It("extracts a nested field", func() {
			eo := req.Step.GetTransform().GetExtractOptions()
			eo.Paths = []string{"foo.key"}
			eo.Flatten = false

			req.InputPayload = []byte(`{
  "name": "Bob",
  "age": "str",
  "foo": {"key": "value"}
}`)

			data, err := proto.Marshal(req)
			Expect(err).ToNot(HaveOccurred())

			res, err := f.Exec(context.Background(), data)
			Expect(err).ToNot(HaveOccurred())

			wasmResp := &protos.WASMResponse{}

			err = proto.Unmarshal(res, wasmResp)
			Expect(err).ToNot(HaveOccurred())
			Expect(wasmResp).ToNot(BeNil())
			Expect(string(wasmResp.OutputPayload)).To(Equal(`{"foo":{"key":"value"}}`))
			Expect(wasmResp.ExitCode).To(Equal(protos.WASMExitCode_WASM_EXIT_CODE_TRUE))
		})

		// TODO: additional tests for each transform type
	})

	Context("inter step result", func() {
		It("finds and transforms PII in a payload without a path", func() {
			payload := []byte(`{
		"users": [
			{
				"name": "Bob",
				"email": "bob@streamdal.com"
			},
			{
				"name": "Mary",
				"email": "mary@streamdal.com"
			}
		]
	}`)
			detectiveWASM, err := os.ReadFile("test-assets/wasm/detective.wasm")
			Expect(err).ToNot(HaveOccurred())
			transformWASM, err := os.ReadFile("test-assets/wasm/transform.wasm")
			Expect(err).ToNot(HaveOccurred())

			pipeline := &protos.Pipeline{
				Id:   uuid.New().String(),
				Name: "Test Pipeline",
				Steps: []*protos.PipelineStep{
					{
						Name:          "Find Email",
						XWasmId:       stringPtr(uuid.New().String()),
						XWasmBytes:    detectiveWASM,
						XWasmFunction: stringPtr("f"),
						OnFalse: &protos.PipelineStepConditions{
							Abort: protos.AbortCondition_ABORT_CONDITION_ABORT_ALL,
						},
						Step: &protos.PipelineStep_Detective{
							Detective: &steps.DetectiveStep{
								Path:   stringPtr(""), // No path, we're searching the entire payload
								Negate: boolPtr(false),
								Type:   steps.DetectiveType_DETECTIVE_TYPE_PII_EMAIL,
							},
						},
					},
					{
						Dynamic:       true,
						Name:          "Transform Email",
						XWasmId:       stringPtr(uuid.New().String()),
						XWasmBytes:    transformWASM,
						XWasmFunction: stringPtr("f"),
						OnFalse: &protos.PipelineStepConditions{
							Abort: protos.AbortCondition_ABORT_CONDITION_ABORT_ALL,
						},
						Step: &protos.PipelineStep_Transform{
							Transform: &steps.TransformStep{
								Type: steps.TransformType_TRANSFORM_TYPE_REPLACE_VALUE,
								Options: &steps.TransformStep_ReplaceValueOptions{
									ReplaceValueOptions: &steps.TransformReplaceValueOptions{
										Path:  "", // No path, we're getting the result from the detective step
										Value: `"REDACTED"`,
									},
								},
							},
						},
					},
				},
			}

			aud := &protos.Audience{
				ServiceName:   "mysvc1",
				ComponentName: "kafka",
				OperationType: protos.OperationType_OPERATION_TYPE_PRODUCER,
				OperationName: "mytopic",
			}

			s := &Streamdal{
				serverClient: &serverfakes.FakeIServerClient{},
				functionsMtx: &sync.RWMutex{},
				functions:    map[string]*function{},
				audiencesMtx: &sync.RWMutex{},
				audiences:    map[string]struct{}{},
				tails:        map[string]map[string]*Tail{},
				tailsMtx:     &sync.RWMutex{},
				config: &Config{
					ServiceName:     "mysvc1",
					Logger:          &logger.TinyLogger{},
					StepTimeout:     time.Millisecond * 1000,
					PipelineTimeout: time.Millisecond * 1000,
				},
				metrics:      &metricsfakes.FakeIMetrics{},
				pipelinesMtx: &sync.RWMutex{},
				pipelines: map[string]map[string]*protos.Command{
					audToStr(aud): {
						pipeline.Id: {
							Audience: aud,
							Command: &protos.Command_AttachPipeline{
								AttachPipeline: &protos.AttachPipelineCommand{
									Pipeline: pipeline,
								},
							},
						},
					},
				},
			}

			resp := s.Process(context.Background(), &ProcessRequest{
				ComponentName: aud.ComponentName,
				OperationType: OperationType(aud.OperationType),
				OperationName: aud.OperationName,
				Data:          payload,
			})

			Expect(resp.Status).To(Equal(protos.ExecStatus_EXEC_STATUS_TRUE))
			// TODO: Need to improve status messages
			//Expect(*resp.StatusMessage).To(Equal("boop"))
			Expect(resp.Data).To(MatchJSON(`{"users": [{"name":"Bob","email":"REDACTED"},{"name":"Mary","email":"REDACTED"}]}`))
		})

	})
})
