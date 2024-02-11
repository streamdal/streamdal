Wasm
====
[![Release WASM files](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-release.yml/badge.svg)](https://github.com/streamdal/streamdal/blob/main/.github/workflows/libs-wasm-release.yml)
[![Pull Request](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-pr.yml/badge.svg)](https://github.com/streamdal/streamdal/actions/workflows/libs-wasm-pr.yml)
[![Discord](https://img.shields.io/badge/Community-Discord-4c57e8.svg)](https://discord.gg/streamdal)

_**This repository contains all of the Wasm funcs used by various 
[Streamdal](https://github.com/streamdal/streamdal) components.**_

<sub>For more details, see the main
[streamdal repo](https://github.com/streamdal/streamdal).</sub>

---

## Usage

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

## Development

To update protobuf definitions across all modules, run `bash update_protos.sh 1.2.3`. This will replace the 
version of `streamdal-protos` across all `Cargo.toml` files and run a `cargo update` to pull in the new version.

## Release

Any push or merge to the `main` branch with any changes in `/libs/wasm/*`
will automatically tag and release a new console version with `libs/wasm/vX.Y.Z`.

<sub>If you'd like to skip running the release action on push/merge to `main`,
include `norelease` anywhere in the commit message.</sub>
