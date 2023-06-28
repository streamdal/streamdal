snitch-detective
================

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
