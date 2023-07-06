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

.PHONY: build
build: description = Build all targets
build: build/matcher build/transformer

.PHONY: build/matcher
build/matcher: description = Build WASM target for matcher
build/matcher: clean/matcher
	cd matcher && cargo build --target=wasm32-wasi --release

.PHONY: clean/matcher
clean/matcher: description = Remove matcher WASM artifacts
clean/matcher:
	rm -rf matcher/target

.PHONY: build/transformer
build/transformer: description = Build WASM target for transformer
build/transformer: clean/transformer
	cd transformer && cargo build --target=wasm32-wasi --release

.PHONY: clean/transformer
clean/transformer: description = Remove transformer WASM artifacts
clean/transformer:
	rm -rf transformer/target


.PHONY: test
test: description = Run tests
test:
	cd common && cargo test
