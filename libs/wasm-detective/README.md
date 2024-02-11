wasm-detective
================
[![Release](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-release.yml/badge.svg)](https://github.com/streamdal/streamdal/blob/main/.github/workflows/libs-wasm-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-detective-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/blob/main/.github/workflows/libs-wasm-detective-pr.yml)
<a href="https://crates.io/crates/streamdal-wasm-detective/"><img src="https://img.shields.io/crates/v/streamdal-wasm-detective.svg"></a>
<a href="https://docs.rs/streamdal-wasm-detective/"><img src="https://img.shields.io/badge/docs-rustdoc-369"></a>
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

> [!CAUTION]
> Releases for this library are no longer published on crates.io. Wasm modules
> include this library by using "path" in `Cargo.toml`.

_**Rust helper lib for performing value matching in `streamdal/wasm` Wasm functions.**_

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---

For available matchers, look at the enums listed in
[/libs/protos/protos](https://github.com/streamdal/streamdal/blob/main/libs/protos/protos/steps/sp_steps_detective.proto).

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
Due to regex being extremely slow, majority of the matchers do not use them. If
a matcher relies on regex, it will be noted in the matcher's documentation and
in the [console](../../apps/console).

## Development
The library must be tested using Rust nightly (because we use `#![feature(test)]` to enable the ability to bench).

To install nightly: `rustup install nightly`

To run tests using nightly: `cargo +nightly test`

To run benches using nightly: `cargo +nightly bench`

<sub>You can also set nightly as default using `rustup default nightly`.</sub>

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

## Release

Any push or merge to the `main` branch with any changes in `/libs/wasm-detective/*`
will automatically tag and release a new console version with `libs/wasm-detective/vX.Y.Z`.

<sub>(1) If you'd like to skip running the release action on push/merge to `main`,
include `norelease` anywhere in the commit message.</sub>
