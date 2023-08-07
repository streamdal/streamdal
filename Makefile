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
setup/darwin: description = Install toolkit for building on macOS M1
setup/darwin:
	brew install tinygo wasmtime

.PHONY: test
test: description = Run all tests
test:
	#bash ./init_wasm.sh
	go test ./...

.PHONY: test/fakes
test/fakes: description = Generate all fakes
test/fakes:
	go run github.com/maxbrunsfeld/counterfeiter/v6 -o test-assets/fakes/memoryfake.go github.com/tetratelabs/wazero/api.Memory
	go run github.com/maxbrunsfeld/counterfeiter/v6 -o test-assets/fakes/modulefake.go github.com/tetratelabs/wazero/api.Module
	go generate ./...


.PHONY: test/coverage
test/coverage: description = Run all tests
test/coverage:
	#bash ./init_wasm.sh
	go test ./... -coverprofile c.out