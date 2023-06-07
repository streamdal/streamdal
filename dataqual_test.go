package dataqual

import (
	"os"
	"path"
	"sync"
	"testing"

	"github.com/pkg/errors"

	protos "github.com/batchcorp/plumber-schemas/build/go/protos/common"
)

func TestMatch(t *testing.T) {
	jsonData := []byte(`{"type": "hello world"}`)

	d, err := setup(Match)
	if err != nil {
		t.Error(err)
	}

	isMatch, err := d.runMatch("string_contains_any", "type", jsonData, []string{"hello"})
	if err != nil {
		t.Error("error during runMatch: " + err.Error())
	}

	if !isMatch {
		t.Error("expected match")
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

	for i := 0; i < b.N; i++ {
		_, err := d.runMatch("string_contains_any", "firstname", jsonData, []string{"Rani"})
		if err != nil {
			b.Fatal("error during runMatch: " + err.Error())
		}
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

	for i := 0; i < b.N; i++ {
		_, err := d.runTransform(jsonData, fm)
		if err != nil {
			b.Error("error during runTransform: " + err.Error())
		}
	}
}

func setup(m Module) (*DataQual, error) {
	d := &DataQual{
		functions:    map[Module]*function{},
		functionsMtx: &sync.RWMutex{},
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
