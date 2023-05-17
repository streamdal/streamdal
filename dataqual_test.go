package dataqual

import (
	"os"
	"testing"
)

func BenchmarkMatchSmallJSON(b *testing.B) {
	inst, err := setup("src/match.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	jsonData, err := os.ReadFile("json-examples/small.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := performMatchRun(inst, jsonData)
		if err != nil {
			panic("error during performMatchRun: " + err.Error())
		}
	}
}

func BenchmarkMatchMediumJSON(b *testing.B) {
	inst, err := setup("src/match.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	jsonData, err := os.ReadFile("json-examples/medium.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := performMatchRun(inst, jsonData)
		if err != nil {
			panic("error during performMatchRun: " + err.Error())
		}
	}
}

func BenchmarkMatchLargeJSON(b *testing.B) {
	inst, err := setup("src/match.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	jsonData, err := os.ReadFile("json-examples/large.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := performMatchRun(inst, jsonData)
		if err != nil {
			panic("error during performMatchRun: " + err.Error())
		}
	}
}
