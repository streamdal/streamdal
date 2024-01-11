wasm-detective
================
<a href="https://crates.io/crates/streamdal-wasm-detective/"><img src="https://img.shields.io/crates/v/streamdal-wasm-detective.svg"></a>
<a href="https://docs.rs/streamdal-wasm-detective/"><img src="https://img.shields.io/badge/docs-rustdoc-369"></a>
[![Release](https://github.com/streamdal/wasm-detective/actions/workflows/release.yaml/badge.svg)](https://github.com/streamdal/wasm-detective/actions/workflows/release.yaml)
[![Test](https://github.com/streamdal/wasm-detective/actions/workflows/pr.yaml/badge.svg)](https://github.com/streamdal/wasm-detective/actions/workflows/pr.yaml)

> [!CAUTION]
> There are no longer releases for this library. It is now included directly into wasm modules via Cargo.toml path


Rust helper lib for performing value matching in `streamdal/wasm` Wasm functions.

For available matchers, look at the enums listed in
[streamdal/protos](https://github.com/streamdal/protos/blob/main/protos/steps/detective.proto).

# Install
```
cargo add streamdal-protos
cargo add streamdal-wasm-detective
```

# Usage
```rust
fn main() {
    let det = detective::Detective::new();

    let sample_json = r#"{
        "field1": {
            "field2": "2"
        }
    }"#;

    let request = Request {
        match_type: DetectiveType::DETECTIVE_TYPE_HAS_FIELD,
        data: &sample_json.as_bytes().to_vec(),
        path: "field1".to_string(),
        args: vec!["1".to_string()],
        negate: false,
    };

    match det.matches(&request) {
        Ok(value) => println!("Result: {:#?}", value),
        Err(err) => println!("Error: {:#?}", err),
    }
}
```

## Note on regex
Regex-based matchers are currently slow because we have to compile the pattern on every call.

This will improve when we implement K/V functionality in SDK's.

The idea is that WASM funcs will be given the ability to GET/PUT items in cache, so `detective` would be wired up to accept a param that is a trait that allows working with the cache funcs.

If K/V trait is provided to `detective` - before compiling a regex pattern, it would first check if the cache already contains it. If yes, it'll use that, if not, it'll compile and put it in the cache.

~DS 06-29-2023

## Development
The library must be tested using Rust nightly (because we use `#![feature(test)]` to enable the ability to bench).

To install nightly: `rustup install nightly`

To run tests using nightly: `cargo +nightly test`

To run benches using nightly: `cargo +nightly bench`

<sub>You can also set nightly as default using `rustup default nightly`.</sub>

## Releasing

Any changes made under libs/wasm-detective will be automatically released to crates.io with a version bump

## Benchmarks

Valid as of 2023-11-14

```
test test_bench::bench_credit_card         ... bench:         730 ns/iter (+/- 8)
test test_bench::bench_credit_card_payload ... bench:       7,821 ns/iter (+/- 90)
test test_bench::bench_email               ... bench:         531 ns/iter (+/- 8)
test test_bench::bench_email_payload       ... bench:       6,150 ns/iter (+/- 78)
test test_bench::bench_email_utf8          ... bench:         907 ns/iter (+/- 9)
test test_bench::bench_has_field           ... bench:         386 ns/iter (+/- 11)
test test_bench::bench_hostname            ... bench:         410 ns/iter (+/- 6)
test test_bench::bench_ipv4_address        ... bench:         213 ns/iter (+/- 3)
test test_bench::bench_ipv6_address        ... bench:         320 ns/iter (+/- 2)
test test_bench::bench_mac_address         ... bench:         343 ns/iter (+/- 7)
test test_bench::bench_semver              ... bench:         378 ns/iter (+/- 6)
test test_bench::bench_string_contains_all ... bench:         218 ns/iter (+/- 4)
test test_bench::bench_string_contains_any ... bench:         221 ns/iter (+/- 1)
test test_bench::bench_uuid                ... bench:         402 ns/iter (+/- 6)
```