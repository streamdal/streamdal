Wasm
====
[![Release WASM files](https://github.com/streamdal/wasm/actions/workflows/release.yml/badge.svg)](https://github.com/streamdal/wasm/actions/workflows/release.yml)
[![Pull Request](https://github.com/streamdal/wasm/actions/workflows/pr.yml/badge.svg)](https://github.com/streamdal/wasm/actions/workflows/pr.yml)

This repository contains all of the Wasm funcs used by various 
[Streamdal](https://github.com/streamdal/streamdal) components.

To build: `make build`

Build artifacts are placed in `./build/*`.

To test: `make test`

Releases are automatically tagged on merge to `main`.

## Wasm Artifact Size

Close to 50% size reduction is achieved by using `lto = true` in `Cargo.toml`.

As per [this doc](https://rustwasm.github.io/docs/book/reference/code-size.html),
this tells LLVM to inline and prune functions which improves both speed and size.

We get another 15-20% reduction by using `wasm-opt` (with `Os` flag).

Result is as follows:

```bash
~/Code/streamdal/wasm/build main* ⇡                                                                          2h41m ✖ ⚑ ◒
❯ du -sh *
1.9M	detective.lto+wasm-opt.wasm
2.4M	detective.lto-only.wasm
```

Without any of the size optimizations, the initial binary size is ~4.2MB.

Compile + optimization time is ~45s on an M2.

## Developing

To update protobuf definitions across all modules, run `bash update_protos.sh 1.2.3`. This will replace the 
version of `streamdal-protos` across all `Cargo.toml` files and run a `cargo update` to pull in the new version.

## Release

Releasing is semi-automatic - you have to manually create and push a new `v0.0.0`
tag and Github Actions will pick up the commit and create a new release.

```
git tag v0.0.4
git push --tags
```

