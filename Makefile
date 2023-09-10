# Pattern #1 example: "example : description = Description for example target"
# Pattern #2 example: "### Example separator text
help: HELP_SCRIPT = \
	if (/^([a-zA-Z0-9-\.\/]+).*?: description\s*=\s*(.+)/) { \
		printf "\033[34m%-40s\033[0m %s\n", $$1, $$2 \
	} elsif(/^\#\#\#\s*(.+)/) { \
		printf "\033[33m>> %s\033[0m\n", $$1 \
	}

.PHONY: help
help:
	@perl -ne '$(HELP_SCRIPT)' $(MAKEFILE_LIST)

.PHONY: setup/darwin
setup/darwin: description = Install WASM tooling for macOS
setup/darwin:
	# Install Rust
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

	# Install WASM tooling
	rustup target add wasm32-wasi

	# Install WASM optimizer
	cargo install wasm-opt

.PHONY: build
build: description = Build all targets
build: build/detective build/transform build/httprequest

.PHONY: build/detective
build/detective: description = Build WASM target for detective
build/detective: clean/detective
	cd detective && \
	cargo build --target=wasm32-wasi --release && \
	wasm-opt -Os -o ../build/detective.wasm target/wasm32-wasi/release/detective.wasm

.PHONY: clean/detective
clean/detective: description = Remove detective WASM artifacts
clean/detective:
	rm -rf detective/target build/detective.wasm

.PHONY: build/transform
build/transform: description = Build WASM target for transform
build/transform: clean/transform
	cd transform && \
	cargo build --target=wasm32-wasi --release && \
	wasm-opt -Os -o ../build/transform.wasm target/wasm32-wasi/release/transform.wasm

.PHONY: clean/transform
clean/transform: description = Remove transform WASM artifacts
clean/transform:
	rm -rf transform/target build/transform.wasm

.PHONY: build/httprequest
build/httprequest: description = Build WASM target for httprequest
build/httprequest: clean/httprequest
	cd httprequest && \
	cargo build --target=wasm32-wasi --release && \
	wasm-opt -Os -o ../build/httprequest.wasm target/wasm32-wasi/release/httprequest.wasm

.PHONY: clean/httprequest
clean/httprequest: description = Remove httprequest WASM artifacts
clean/httprequest:
	rm -rf httprequest/target build/httprequest.wasm

.PHONY: build/kv
build/kv: description = Build WASM target for kv
build/kv: clean/kv
	cd kv && \
	cargo build --target=wasm32-wasi --release && \
	wasm-opt -Os -o ../build/kv.wasm target/wasm32-wasi/release/kv.wasm

.PHONY: clean/kv
clean/kv: description = Remove kv WASM artifacts
clean/kv:
	rm -rf kv/target build/kv.wasm

.PHONY: clean
clean: description = Remove all build artifacts
clean: clean/detective clean/transform

.PHONY: test
test: description = Run tests
test:
	cd common && cargo test

