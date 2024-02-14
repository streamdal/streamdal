streamdal-transform
==================

[![Release](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-release.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-transform-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-transform-pr.yml)
<a href="https://crates.io/crates/streamdal-wasm-transform/"><img src="https://img.shields.io/crates/v/streamdal-wasm-transform.svg"></a>
<a href="https://docs.rs/streamdal-wasm-transform/"><img src="https://img.shields.io/badge/docs-rustdoc-369"></a>
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

> [!CAUTION]
> Releases for this library are no longer published on crates.io. Wasm modules
> include this library by using "path" in `Cargo.toml`.

_**Rust library used by [/libs/wasm](https://github.com/streamdal/streamdal/tree/main/libs/wasm) to 
perform transformations on JSON payloads.**_

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---


## Usage

```rust
fn main() {
    let sample_json = r#"{"hello": "world"}"#;

    let req = streamdal_wasm_transform::transform::Request {
        data: sample_json.into(),
        path: "hello".to_string(),
        value: r#""baz""#.to_string(),
    };

    let updated_json = streamdal_wasm_transform::transform::overwrite(&req).unwrap();

    println!(
        "Input JSON: {} || Result JSON: {}",
        sample_json, updated_json,
    )
}
```

## IMPORTANT 

1. `overwrite()`
    1. Overwrite value will be used as-is - if target is intended to be a 
string, then make sure to include quotes in the payload ( Ie. `"123"`)
1. `mask()`
   2. Works for numbers and strings
   3. For numbers, it will replace 80% of the number characters with `0`
   4. For strings, it will replace 80% of the characters with `*`
1. `obfuscate()`
   2. Works ONLY on strings
   3. Will replace 100% of the characters with a sha256 hash
1. `delete_path()`
   2. Does not work on array elements yet
1. `truncate()` 
   2. Works on strings
   3. For strings, it will truncate the string to the specified length
