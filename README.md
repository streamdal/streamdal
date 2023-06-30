snitch-detective
================
[![Test](https://github.com/streamdal/snitch-detective/actions/workflows/pr.yaml/badge.svg)](https://github.com/streamdal/snitch-detective/actions/workflows/pr.yaml)

Rust helper lib for performing value matching in `snitch` WASM functions.

For available matchers, look at the enums listed in
[snitch-protos](https://github.com/streamdal/snitch-protos/blob/main/protos/rules/matcher.proto).

# Install
```
cargo add protobuf && \
cargo add snitch-detective
```

# Usage
```rust
use snitch_detective::Detective;

fn main() {
    let detective = Detective::new();
    
    let maybe_ip = "127.0.0.1".to_string();
    
    let match_request = MatchRequest {
        data: "test".as_bytes().to_vec(),
        path: "field1.field2".to_string(),
        args: vec![maybe_ip],
        negate: false,
        type_: protobuf::EnumOrUnknown::from(MatchType::MATCH_TYPE_IP_ADDRESS),
        special_fields: Default::default(),
    };


    let result = detective.matches(&match_request).unwrap();
    assert_eq!(result, true);
} 
```

## Note on regex
Regex-based matchers are currently slow because we have to compile the pattern on every call.

This will improve when we implement K/V functionality in SDK's.

The idea is that WASM funcs will be given the ability to GET/PUT items in cache, so `detective` would be wired up to accept a param that is a trait that allows working with the cache funcs.

If K/V trait is provided to `detective` - before compiling a regex pattern, it would first check if the cache already contains it. If yes, it'll use that, if not, it'll compile and put it in the cache.

~DS 06-29-2023
