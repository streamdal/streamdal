<a href="https://crates.io/crates/streamdal-transform/"><img src="https://img.shields.io/crates/v/streamdal-transform.svg"></a>
<a href="https://docs.rs/streamdal-transform/"><img src="https://img.shields.io/badge/docs-rustdoc-369"></a>


streamdal-transform
==================

Library used by [streamdal/wasm](https://github.com/streamdal/wasm) to 
perform transformations on JSON payloads.

Currently only has support for `overwrite`, `mask` and `obfuscate`.

## Usage

```rust
fn main() {
    let sample_json = r#"{"hello": "world"}"#;

    let req = Request {
        data: sample_json.into(),
        path: "hello".to_string(),
        value: r#""baz""#.to_string(),
    };

    let updated_json = streamdal_transform::transform::overwrite(&req).unwrap();

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

## Use as-is - has not been tested in production :)
