# WASM Benchmarks

***Up to date as of 2023-09-20***

All benchmarks include marshal/unmarshal of `WASMRequest` and `WASMResponse` respectively

*inferschema*

```bash
go test -bench=.

goos: darwin
goarch: arm64
pkg: github.com/streamdal/go-sdk
BenchmarkInferSchema_FreshSchema/small.json-8   	   14214	     84098 ns/op
BenchmarkInferSchema_FreshSchema/medium.json-8  	    2048	    584883 ns/op
BenchmarkInferSchema_FreshSchema/large.json-8   	     237	   4987073 ns/op
BenchmarkInferSchema_MatchExisting/small.json-8 	   12554	     98659 ns/op
BenchmarkInferSchema_MatchExisting/medium.json-8         	    2000	    590994 ns/op
BenchmarkInferSchema_MatchExisting/large.json-8          	     242	   4941809 ns/op
```

*transform*

```bash
go test -bench=.

goos: darwin
goarch: arm64
pkg: github.com/streamdal/go-sdk
BenchmarkTransform_Replace/small.json-8         	   90685	     13293 ns/op
BenchmarkTransform_Replace/medium.json-8        	   10000	    107225 ns/op
BenchmarkTransform_Replace/large.json-8         	    1266	    945104 ns/op
```

*detective*

```bash
go test -bench=.

goos: darwin
goarch: arm64
pkg: github.com/streamdal/go-sdk
BenchmarkDetective/small.json-8                          	  171969	      6749 ns/op
BenchmarkDetective/medium.json-8                         	   26634	     45081 ns/op
BenchmarkDetective/large.json-8                          	    2934	    390729 ns/op
```
