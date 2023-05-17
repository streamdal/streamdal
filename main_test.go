package main

//func BenchmarkSmallJSON(b *testing.B) {
//	inst, store, err := setup("src/json.wasm")
//	if err != nil {
//		panic("unable to setup: " + err.Error())
//	}
//
//	jsonData, err := os.ReadFile("json-examples/small.json")
//	if err != nil {
//		panic("unable to read json: " + err.Error())
//	}
//
//	b.ResetTimer()
//
//	for i := 0; i < b.N; i++ {
//		_, err := performMatchRun(inst, store, jsonData)
//		if err != nil {
//			panic("error during performMatchRun: " + err.Error())
//		}
//	}
//}
//
//func BenchmarkMediumJSON(b *testing.B) {
//	inst, store, err := setup("src/json.wasm")
//	if err != nil {
//		panic("unable to setup: " + err.Error())
//	}
//
//	jsonData, err := os.ReadFile("json-examples/medium.json")
//	if err != nil {
//		panic("unable to read json: " + err.Error())
//	}
//
//	b.ResetTimer()
//
//	for i := 0; i < b.N; i++ {
//		_, err := performMatchRun(inst, store, jsonData)
//		if err != nil {
//			panic("error during performMatchRun: " + err.Error())
//		}
//	}
//}
//
//func BenchmarkLargeJSON(b *testing.B) {
//	inst, store, err := setup("src/json.wasm")
//	if err != nil {
//		panic("unable to setup: " + err.Error())
//	}
//
//	jsonData, err := os.ReadFile("json-examples/large.json")
//	if err != nil {
//		panic("unable to read json: " + err.Error())
//	}
//
//	b.ResetTimer()
//
//	for i := 0; i < b.N; i++ {
//		_, err := performMatchRun(inst, store, jsonData)
//		if err != nil {
//			panic("error during performMatchRun: " + err.Error())
//		}
//	}
//}
