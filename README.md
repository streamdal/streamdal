# snitch-protos
[![Build Status](https://github.com/streamdal/snitch-protos/actions/workflows/release.yml/badge.svg)](https://github.com/streamdal/snitch-protos/actions/workflows/release.yml)
<a href="https://crates.io/crates/snitch-protos/"><img src="https://img.shields.io/crates/v/snitch-protos.svg"></a>

This repo contains the common protobuf definitions for all of the snitch-related
components.

All protobuf is generated via `make`. Use `make help` to see all possible targets.

## Usage
1. Git clone
2. `git checkout -b your-branch`
3. Make your changes
4. `make setup`
5. `make generate`
6. `git add . && git commit -m "your message" && git push origin head`

## gRPC API
The protos expose two gRPC APIs: `external_api.proto` and `internal_api.proto`.

Both APIs are implemented by `snitch-server`.

* `external` is intended to be used by non-SDK clients (such as the UI).
* `internal` is intended to be used by SDK clients.

### Auth
All gRPC methods require you to insert an `authorization` k/v into the request
context/metadata.

### Request/Response ID
All gRPC requests allow you to insert your own `request-id` into the 
context/metadata. This `request-id` can be used to correlate requests, 
responses, logs, etc. If a `request-id` is not specified, `snitch-server` will
generate one automatically.
