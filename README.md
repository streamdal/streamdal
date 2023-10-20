# Wasm

This repository contains all of the Wasm funcs used by `snitch` components.

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
~/Code/streamdal/snitch-wasm/build main* ⇡                                                                          2h41m ✖ ⚑ ◒
❯ du -sh *
1.9M	detective.lto+wasm-opt.wasm
2.4M	detective.lto-only.wasm
```

Without any of the size optimizations, the initial binary size is ~4.2MB.

Compile + optimization time is ~45s on an M2.

## Release

Releasing is semi-automatic - you have to manually create and push a new `v0.0.0`
tag and Github Actions will pick up the commit and create a new release.

```
git tag v0.0.4
git push --tags
```
