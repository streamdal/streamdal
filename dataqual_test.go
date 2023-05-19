package dataqual

import (
	"os"
	"sync"
	"testing"
)

func BenchmarkMatchSmallJSON(b *testing.B) {

	jsonData, err := os.ReadFile("json-examples/small.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	d := setup()

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := d.RunTransform("firstname", "Testing", jsonData)
		if err != nil {
			panic("error during performMatchRun: " + err.Error())
		}
	}
}

func BenchmarkMatchMediumJSON(b *testing.B) {
	jsonData, err := os.ReadFile("json-examples/medium.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	d := setup()

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := d.RunTransform("firstname", "Testing", jsonData)
		if err != nil {
			panic("error during performMatchRun: " + err.Error())
		}
	}
}

func BenchmarkMatchLargeJSON(b *testing.B) {
	jsonData, err := os.ReadFile("json-examples/large.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	d := setup()

	b.ResetTimer()
	
	for i := 0; i < b.N; i++ {
		_, err := d.RunTransform("firstname", "Testing", jsonData)
		if err != nil {
			panic("error during performMatchRun: " + err.Error())
		}
	}
}

func setup() *DataQual {
	d := &DataQual{
		functions:    map[Module]*function{},
		functionsMtx: &sync.RWMutex{},
		wasmData:     map[Module][]byte{},
		wasmDataMtx:  &sync.RWMutex{},
	}

	data, err := os.ReadFile("src/transform.wasm")
	if err != nil {
		panic(err)
	}

	inst, err := createFunction(data)
	if err != nil {
		panic(err)
	}

	d.functions[Transform] = inst

	return d
}
