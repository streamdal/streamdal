package main

import (
	"os"
	"testing"
)

func BenchmarkSmallJSON(b *testing.B) {
	inst, store, err := setup("src/json.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	f, err := inst.Exports.GetFunction("f")
	if err != nil {
		panic("unable to get func: " + err.Error())
	}

	alloc, err := inst.Exports.GetFunction("alloc")
	if err != nil {
		panic("unable to get alloc func: " + err.Error())
	}

	dealloc, err := inst.Exports.GetFunction("dealloc")
	if err != nil {
		panic("unable to get dealloc func: " + err.Error())
	}

	jsonData, err := os.ReadFile("json-examples/small.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := performRun(inst, store, f, alloc, dealloc, jsonData)
		if err != nil {
			panic("error during performRun: " + err.Error())
		}
	}
}

func BenchmarkMediumJSON(b *testing.B) {
	inst, store, err := setup("src/json.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	f, err := inst.Exports.GetFunction("f")
	if err != nil {
		panic("unable to get func: " + err.Error())
	}

	alloc, err := inst.Exports.GetFunction("alloc")
	if err != nil {
		panic("unable to get alloc func: " + err.Error())
	}

	dealloc, err := inst.Exports.GetFunction("dealloc")
	if err != nil {
		panic("unable to get dealloc func: " + err.Error())
	}

	jsonData, err := os.ReadFile("json-examples/medium.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := performRun(inst, store, f, alloc, dealloc, jsonData)
		if err != nil {
			panic("error during performRun: " + err.Error())
		}
	}
}

func BenchmarkLargeJSON(b *testing.B) {
	inst, store, err := setup("src/json.wasm")
	if err != nil {
		panic("unable to setup: " + err.Error())
	}

	f, err := inst.Exports.GetFunction("f")
	if err != nil {
		panic("unable to get func: " + err.Error())
	}

	alloc, err := inst.Exports.GetFunction("alloc")
	if err != nil {
		panic("unable to get alloc func: " + err.Error())
	}

	dealloc, err := inst.Exports.GetFunction("dealloc")
	if err != nil {
		panic("unable to get dealloc func: " + err.Error())
	}

	jsonData, err := os.ReadFile("json-examples/large.json")
	if err != nil {
		panic("unable to read json: " + err.Error())
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := performRun(inst, store, f, alloc, dealloc, jsonData)
		if err != nil {
			panic("error during performRun: " + err.Error())
		}
	}
}
