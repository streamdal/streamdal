snitch-transformer
==================

Library used by `snitch-wasm` to transform JSON data.

Currently only has support for "overwrite", "mask" and "obfuscate".

## Usage

```rust
use snitch_transformer;

fn main() {
    let json = r#"{"object": {"hello": "world"}}"#;

    let updated_json = transformer::overwrite(json, "object.hello", r#"test"#).unwrap();

    println!("updated json: {}", updated_json);
    // {"object": {"hello": "test"}}
   
    // Keep in mind that replace value will be used as-is
    let updated_json = transformer::overwrite(json, "object.hello", "test").unwrap();
    // Will result in: {"object": {"hello": test}}
   
    // OR
    let updated_json = transformer::mask(json, "object.hello", '*');
    // updated_json == {"object": {"hello": "*****"}}

    // OR
    let updated_json = transformer::obfuscate(json, "object.hello");
    // updated_json == {"object": {"hello": "woAF1"}}
}
```

## IMPORTANT 

1. `overwrite()`
    1. Overwrite value will be used as-is - if target is intended to be a 
string, then make sure to include quotes in the payload ( Ie. `"123"`)
1. `mask()`
    1. For `number` value types, `mask()` will default to use `0`; for strings,
`mask` will default to `*`.
1. `obfuscate()`
    1. `obfuscate()` uses xxHash64 to hash values and replace 80% of the
original value with the hash generated via xxHash.
    1. For number value types, xxHash will replace 80% of the number characters
with xxHash's integer representation of the original value.

## Use as-is - has not been tested in production :)
