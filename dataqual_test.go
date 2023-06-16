package dataqual

import (
	"context"
	"os"
	"path"
	"sync"
	"testing"
	"time"

	"github.com/pkg/errors"

	protos "github.com/batchcorp/plumber-schemas/build/go/protos/common"
)

func TestMatch_true(t *testing.T) {
	jsonData := []byte(`{"type": "hello world"}`)

	d, err := setup(Match)
	if err != nil {
		t.Error(err)
	}

	isMatch, err := d.runMatch(context.Background(), "string_contains_any", "type", jsonData, []string{"hello"})
	if err != nil {
		t.Error("error during runMatch: " + err.Error())
	}

	if !isMatch {
		t.Error("expected match")
	}
}

func TestMatch_false(t *testing.T) {
	jsonData := []byte(`{"type": "hello world"}`)

	d, err := setup(Match)
	if err != nil {
		t.Error(err)
	}

	isMatch, err := d.runMatch(context.Background(), "string_contains_any", "type", jsonData, []string{"gmail"})
	if err != nil {
		t.Error("error during runMatch: " + err.Error())
	}

	if isMatch {
		t.Error("expected no match")
	}
}

func BenchmarkMatchSmallJSON(b *testing.B) {
	matchBench("json-examples/small.json", b)
}

func BenchmarkMatchMediumJSON(b *testing.B) {
	matchBench("json-examples/medium.json", b)
}

func BenchmarkMatchLargeJSON(b *testing.B) {
	matchBench("json-examples/large.json", b)
}

func BenchmarkTransformSmallJSON(b *testing.B) {
	transformBench("json-examples/small.json", b)
}

func BenchmarkTransformMediumJSON(b *testing.B) {
	transformBench("json-examples/medium.json", b)
}

func BenchmarkTransformLargeJSON(b *testing.B) {
	transformBench("json-examples/large.json", b)
}

func matchBench(fileName string, b *testing.B) {
	jsonData, err := os.ReadFile(fileName)
	if err != nil {
		b.Error("unable to read json: " + err.Error())
	}

	d, err := setup(Match)
	if err != nil {
		b.Error(err)
	}

	b.ResetTimer()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	for i := 0; i < b.N; i++ {
		_, err := d.runMatch(ctx, "string_contains_any", "firstname", jsonData, []string{"Rani"})
		if err != nil {
			cancel()
			b.Fatal("error during runMatch: " + err.Error())
		}
		cancel()
	}
}

func transformBench(fileName string, b *testing.B) {
	jsonData, err := os.ReadFile(fileName)
	if err != nil {
		b.Error("unable to read json: " + err.Error())
	}

	d, err := setup(Transform)
	if err != nil {
		b.Error(err)
	}

	b.ResetTimer()

	fm := &protos.FailureModeTransform{
		Type:  protos.FailureModeTransform_TRANSFORM_TYPE_REPLACE,
		Path:  "firstname",
		Value: "Testing",
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	for i := 0; i < b.N; i++ {
		_, err := d.failTransform(ctx, jsonData, fm)
		if err != nil {
			b.Error("error during runTransform: " + err.Error())
		}
	}
}

func setup(m Module) (*DataQual, error) {
	d := &DataQual{
		functions:    map[Module]*function{},
		functionsMtx: &sync.RWMutex{},
		Config:       &Config{WasmTimeout: time.Second},
	}

	wasmFile := path.Join("src", string(m)+".wasm")

	data, err := os.ReadFile(wasmFile)
	if err != nil {
		return nil, errors.New("unable to read wasm file: " + err.Error())
	}

	if len(data) == 0 {
		return nil, errors.New("empty wasm file")
	}

	inst, err := createFunction(data)
	if err != nil {
		return nil, err
	}

	d.functions[m] = inst

	return d, nil
}
