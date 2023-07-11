snitch-detective
================
[![Release](https://github.com/streamdal/snitch-detective/actions/workflows/release.yaml/badge.svg)](https://github.com/streamdal/snitch-detective/actions/workflows/release.yaml)
[![Test](https://github.com/streamdal/snitch-detective/actions/workflows/pr.yaml/badge.svg)](https://github.com/streamdal/snitch-detective/actions/workflows/pr.yaml)

Rust helper lib for performing value matching in `snitch` WASM functions.

For available matchers, look at the enums listed in
[snitch-protos](https://github.com/streamdal/snitch-protos/blob/main/protos/steps/detective.proto).

# Install
```
cargo add snitch-protos
cargo add snitch-detective
```

# Usage
```rust
// TODO: Add usage example
```

## Note on regex
Regex-based matchers are currently slow because we have to compile the pattern on every call.

This will improve when we implement K/V functionality in SDK's.

The idea is that WASM funcs will be given the ability to GET/PUT items in cache, so `detective` would be wired up to accept a param that is a trait that allows working with the cache funcs.

If K/V trait is provided to `detective` - before compiling a regex pattern, it would first check if the cache already contains it. If yes, it'll use that, if not, it'll compile and put it in the cache.

~DS 06-29-2023
