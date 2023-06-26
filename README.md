snitch-detective
================

Rust helper lib for performing value matching in `snitch` WASM functions.

# Usage
```rust
use snitch-detective;

fn main() {
    let matcher = snitch_detective::new();
    
    let maybe_ip = "127.0.0.1".to_string();

    if matcher.ip_address(&maybe_ip) {
    }

    let maybe_ip = "not an IP".to_string();

    if !matcher.ip_address(&maybe_ip) {
        println!("Not an IP");
    }
} 
```
