# WASM Benchmarks

***Up to date as of 2023-09-20***

All benchmarks include marshal/unmarshal of `WASMRequest` and `WASMResponse respectively`

*inferschema*

```bash
go test -bench=.

goos: darwin
goarch: arm64
pkg: github.com/streamdal/snitch-go-client
BenchmarkInferSchema_FreshSchema/small.json-8         	   16830	     72359 ns/op
BenchmarkInferSchema_FreshSchema/medium.json-8        	    2074	    574853 ns/op
BenchmarkInferSchema_FreshSchema/large.json-8         	     240	   5009645 ns/op
BenchmarkInferSchema_MatchExisting/small.json-8       	   12140	     99325 ns/op
BenchmarkInferSchema_MatchExisting/medium.json-8      	    2006	    597972 ns/op
BenchmarkInferSchema_MatchExisting/large.json-8       	     237	   5030887 ns/op
```

*transform*

```bash
```

*detective*

```bash
```

*transform*

```bash
```

*kv*

```bash
```