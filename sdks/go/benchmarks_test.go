package streamdal

import (
	"context"
	"fmt"
	"os"
	"path"
	"strings"
	"sync"
	"testing"

	"github.com/google/uuid"
	"github.com/pkg/errors"
	"google.golang.org/protobuf/proto"

	"github.com/streamdal/streamdal/libs/protos/build/go/protos"
	"github.com/streamdal/streamdal/libs/protos/build/go/protos/steps"
)

var jsonFiles = []string{"test-assets/json-examples/small.json", "test-assets/json-examples/medium.json", "test-assets/json-examples/large.json"}

func BenchmarkTransform_Replace(b *testing.B) {
	for _, jsonFile := range jsonFiles {
		testName := strings.TrimPrefix(jsonFile, "test-assets/json-examples/")

		b.Run(testName, func(b *testing.B) {
			step := &protos.PipelineStep{
				Step: &protos.PipelineStep_Transform{
					Transform: &steps.TransformStep{
						Path:  "firstname",
						Value: "replacement",
						Type:  steps.TransformType_TRANSFORM_TYPE_REPLACE_VALUE,
					},
				},
			}
			benchmarkWASM(path.Join(WasmDir, "transform.wasm"), jsonFile, step, b)
		})
	}
}

func BenchmarkInferSchema_FreshSchema(b *testing.B) {
	for _, jsonFile := range jsonFiles {
		testName := strings.TrimPrefix(jsonFile, "test-assets/json-examples/")

		b.Run(testName, func(b *testing.B) {
			step := &protos.PipelineStep{
				Step: &protos.PipelineStep_InferSchema{
					InferSchema: &steps.InferSchemaStep{
						CurrentSchema: nil,
					},
				},
			}
			benchmarkWASM(path.Join(WasmDir, "inferschema.wasm"), jsonFile, step, b)
		})
	}
}

func BenchmarkInferSchema_MatchExisting(b *testing.B) {
	for _, jsonFile := range jsonFiles {
		testName := strings.TrimPrefix(jsonFile, "test-assets/json-examples/")

		b.Run(testName, func(b *testing.B) {
			wasmResp, _ := inferSchema(jsonFile)

			step := &protos.PipelineStep{
				Step: &protos.PipelineStep_InferSchema{
					InferSchema: &steps.InferSchemaStep{
						CurrentSchema: wasmResp.OutputStep,
					},
				},
			}

			benchmarkWASM(path.Join(WasmDir, "inferschema.wasm"), jsonFile, step, b)
		})
	}
}

func BenchmarkDetective(b *testing.B) {
	for _, jsonFile := range jsonFiles {
		testName := strings.TrimPrefix(jsonFile, "test-assets/json-examples/")

		b.Run(testName, func(b *testing.B) {
			step := &protos.PipelineStep{
				Step: &protos.PipelineStep_Detective{
					Detective: &steps.DetectiveStep{
						Path:   stringPtr("firstname"),
						Args:   []string{"Rani"},
						Type:   steps.DetectiveType_DETECTIVE_TYPE_STRING_EQUAL,
						Negate: boolPtr(false),
					},
				},
			}
			benchmarkWASM(path.Join(WasmDir, "detective.wasm"), jsonFile, step, b)
		})
	}
}

// Only perform when necessary. We don't need to DOS anyone
//func BenchmarkHttpRequest(b *testing.B) {
//	step := &protos.PipelineStep{
//		Step: &protos.PipelineStep_HttpRequest{
//			HttpRequest: &steps.HttpRequestStep{
//				Request: &steps.HttpRequest{
//					Method:  steps.HttpRequestMethod_HTTP_REQUEST_METHOD_GET,
//					Url:     "https://www.google.com",
//					Headers: map[string]string{},
//				},
//			},
//		},
//	}
//	benchmarkWASM(path.Join(WasmDir, "httprequest.wasm", "test-assets/json-examples/small.json", step, b)
//}

// ---------------------------- Helper Methods ----------------------------
func benchmarkWASM(wasmFile, testPayloadFile string, step *protos.PipelineStep, b *testing.B) {
	wasmData, err := os.ReadFile(wasmFile)
	if err != nil {
		b.Fatal(err)
	}

	payloadData, err := os.ReadFile(testPayloadFile)
	if err != nil {
		b.Fatal(err)
	}

	req := &protos.WASMRequest{
		Step:         step,
		InputPayload: payloadData,
	}

	req.Step.XWasmBytes = wasmData
	req.Step.XWasmId = stringPtr(uuid.New().String())
	req.Step.XWasmFunction = stringPtr("f")

	s := &Streamdal{
		pipelinesMtx: &sync.RWMutex{},
		pipelines:    map[string][]*protos.Pipeline{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
	}

	f, err := s.createFunction(req.Step)
	if err != nil {
		b.Fatal(err)
	}

	req.Step.XWasmBytes = nil

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		data, err := proto.Marshal(req)
		if err != nil {
			b.Fatalf("Unable to marshal WASMRequest: %s", err)
		}

		res, err := f.Exec(context.Background(), data)
		if err != nil {
			b.Fatal(err)
		}

		wasmResp := &protos.WASMResponse{}

		if err := proto.Unmarshal(res, wasmResp); err != nil {
			b.Fatal("unable to unmarshal wasm response: " + err.Error())
		}

		//WASMExitCode_WASM_EXIT_CODE_UNSET = 0
		//WASMExitCode_WASM_EXIT_CODE_TRUE  = 1
		//WASMExitCode_WASM_EXIT_CODE_FALSE = 2
		//WASMExitCode_WASM_EXIT_CODE_ERROR = 3
		// Some benchmarks will intentionally fail, so allow status codes 1 and 2
		if wasmResp.ExitCode < 1 || wasmResp.ExitCode > 2 {
			b.Errorf("expected ExitCode = 0, got = %d, message: %s", wasmResp.ExitCode, wasmResp.ExitMsg)
		}
	}
}

// inferSchema is used to generate an existing schema for benchmarks
// It is not used in the actual benchmark itself
func inferSchema(fileName string) (*protos.WASMResponse, error) {
	wasmData, err := os.ReadFile(path.Join(WasmDir, "inferschema.wasm"))
	if err != nil {
		return nil, err
	}

	payloadData, err := os.ReadFile(fileName)
	if err != nil {
		return nil, errors.Wrap(err, "unable to load json file")
	}

	req := &protos.WASMRequest{
		Step: &protos.PipelineStep{
			Step: &protos.PipelineStep_InferSchema{
				InferSchema: &steps.InferSchemaStep{
					CurrentSchema: nil,
				},
			},
			XWasmId:       stringPtr(uuid.New().String()),
			XWasmFunction: stringPtr("f"),
			XWasmBytes:    wasmData,
		},
		InputPayload: payloadData,
	}

	s := &Streamdal{
		pipelinesMtx: &sync.RWMutex{},
		pipelines:    map[string][]*protos.Pipeline{},
		audiencesMtx: &sync.RWMutex{},
		audiences:    map[string]struct{}{},
		wasmCacheMtx: &sync.RWMutex{},
		wasmCache:    map[string][]byte{},
		config: &Config{
			WazeroExecutionMode: WazeroExecutionModeCompiler,
		},
	}

	f, err := s.createFunction(req.Step)
	if err != nil {
		return nil, err
	}

	req.Step.XWasmBytes = nil

	data, err := proto.Marshal(req)
	if err != nil {
		return nil, err
	}

	res, err := f.Exec(context.Background(), data)
	if err != nil {
		return nil, err
	}

	wasmResp := &protos.WASMResponse{}

	if err := proto.Unmarshal(res, wasmResp); err != nil {
		return nil, fmt.Errorf("unable to unmarshal wasm response: %s", err)
	}

	return wasmResp, nil
}
