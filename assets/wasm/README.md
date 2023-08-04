# What is this directory?

This directory contains specific versions of the WASM artifacts pulled from
the [streamdal/snitch-wasm](https://github.com/streamdal/snitch-wasm) repo.

The files in this directory are _intentionally_ populated by hand to avoid
accidentally introducing incorrect versions of the WASM artifacts.

The file format follows the convention: `$NAME_$SEMVER.wasm`

Where `$NAME` is the lowercase name of the protobuf pipeline step listed 
[here](https://github.com/streamdal/snitch-protos/blob/main/protos/pipeline.proto#L49-L53). 

`$SEMVER` is the semantic version of the WASM artifact which will be the same
as the _release tag_ in the [streamdal/snitch-wasm](https://github.com/streamdal/snitch-wasm) repo.

Example:

`transform_0_0_1.wasm`, `detective_0_0_1.wasm`, `decode_0_0_1.wasm`

# Updating WASM Artifacts

When updating WASM artifacts, follow these steps:

1. Create a new branch (ie. `yourname/my-wasm-update`)
2. Update WASM artifacts by moving the files into `./assets/wasm/` directory
    1. **Make sure to remove the old artifact(s)!**
3. Update the `./wasm/wasm.go` map to include the new artifacts
4. Try to build a local Docker image (`make docker/build/local`)
5. If that succeeds, commit and push your changes + open a PR
6. The WASM artifacts will be injected into the resulting Docker image on merge
to master
