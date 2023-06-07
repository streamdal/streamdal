package dataqual

import (
	"os"
	"path"
	"sync"
	"testing"

	"github.com/pkg/errors"
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
	jsonData, err := os.ReadFile("json-examples/small.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	d, err := setup(Match)
	if err != nil {
		b.Error(err)
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := d.runMatch("string_contains_any", "firstname", jsonData, []string{"Rani"})
		if err != nil {
			panic("error during runMatch: " + err.Error())
		}
	}
}

//func BenchmarkMatchMediumJSON(b *testing.B) {
//	jsonData, err := os.ReadFile("json-examples/medium.json")
//	if err != nil {
//		panic("unable to read json: " + err.Error())
//	}
//
//	d := setup()
//
//	b.ResetTimer()
//
//	for i := 0; i < b.N; i++ {
//		_, err := d.runTransform("firstname", "Testing", jsonData)
//		if err != nil {
//			panic("error during performMatchRun: " + err.Error())
//		}
//	}
//}
//
//func BenchmarkMatchLargeJSON(b *testing.B) {
//	jsonData, err := os.ReadFile("json-examples/large.json")
//	if err != nil {
//		panic("unable to read json: " + err.Error())
//	}
//
//	d := setup()
//
//	b.ResetTimer()
//
//	for i := 0; i < b.N; i++ {
//		_, err := d.runTransform("firstname", "Testing", jsonData)
//		if err != nil {
//			panic("error during performMatchRun: " + err.Error())
//		}
//	}
//}

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
