snitch-transform
==================

Library used by [snitch-wasm](https://github.com/streamdal/snitch-wasm) to 
perform transformations on JSON payloads.

Currently only has support for `overwrite`, `mask` and `obfuscate`.

## Usage

```rust
use snitch_protos as protos;
use snitch_transform::transform;

func main() {
   let sample_json = r#"{"hello": "world"}"#;
   
   let mut req = protos::transform::TransformRequest::new();
   req.data = sample_json.into();
   req.path = "hello".to_string();
   req.value = r#""baz""#.to_string();
   
   let updated_json = snitch_transform::transform::overwrite(&req).unwrap();
   
   println!("Input JSON: {} || Result JSON: {}", sample_json, updated_json)
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
