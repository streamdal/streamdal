# protos
[![Release](https://github.com/streamdal/streamdal/actions/workflows/libs-protos-release.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/libs-protos-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/libs-protos-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/libs-protos-pr.yml)
<a href="https://crates.io/crates/streamdal-protos/"><img src="https://img.shields.io/crates/v/streamdal-protos.svg"></a>
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

_**This repo contains the common protobuf definitions used by various Streamdal components.**_

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---

## Development

1. `git clone git@github.com:streamdal/streamdal`
2. `cd streamdal/libs/protos`
3. `git checkout -b your-branch`
4. Make your changes (such as updating or adding .proto files)
5. `make setup`
6. `make generate`
7. `git add . && git commit -m "your message" && git push origin head`

## Release Tags

`streamdal/streamdal/libs/protos` uses `libs/protos/vX.Y.Z` format tags.

This is done primarily for Go, as it has a very specific way it handles modules
that [exist in subdirs](https://go.dev/wiki/Modules#faqs--multi-module-repositories).

## Usage

To fetch this module, you will have to use the following cmd:

`go get github.com/streamdal/streamdal/libs/protos@vX.Y.Z`

To use the protos pkg in your code, the import will look like this:

`import "github.com/streamdal/streamdal/libs/protos/build/go/protos"`

## gRPC API

The protos expose two gRPC APIs: `external_api.proto` and `internal_api.proto`.

Both APIs are implemented by `streamdal/server`.

* `external` is intended to be used by non-SDK clients (such as the UI).
* `internal` is intended to be used by SDK clients.

### Auth

All gRPC methods require you to insert an `authorization` k/v into the request
context/metadata.

### Request/Response ID

All gRPC requests allow you to insert your own `request-id` into the 
context/metadata. This `request-id` can be used to correlate requests, 
responses, logs, etc. If a `request-id` is not specified, `streamdal/server` will
generate one automatically.

## Release

Any push or merge to the `main` branch with any changes in `/libs/protos/*`
will automatically tag and release a new console version with `libs/protos/vX.Y.Z`."

NOTE: Proto compilation/building is done via `make generate`. The generated
files should be committed to the repo as the CI job will NOT build them.

<sub>If you'd like to skip running the release action on push/merge to `main`,
include "norelease" anywhere in the commit message.</sub>

