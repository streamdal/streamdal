VERSION ?= e074107
SERVICE = demo-client
ARCH ?= $(shell uname -m)
GOOS=linux GOARCH=arm64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-linux-arm64
GO=go
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


.PHONY: run
run: description = Run with defaults
run:
	go run *.go register -d \
	--num-instances 1 \
	--service-name "service" \
	--component-name "kafka" \
	--operation-name  "demo-operation" \
	--consumer-input-type file \
	--consumer-input-file ./test-data/sample.json
	# this client also supports --quiet (for quiet output), various "reconnect"
	# conditions and support for launching multiple clients. `--help` for more
	# info.

### Build

.PHONY: build
build: description = Build $(SERVICE)
build: clean build/linux-$(ARCH) build/darwin-$(ARCH)

.PHONY: build/linux-amd64
build/linux-amd64: description = Build $(SERVICE) for linux
build/linux-amd64: clean
	GOOS=linux GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-linux-amd64

.PHONY: build/linux-x86_64
build/linux-x86_64: description = Build $(SERVICE) for linux
build/linux-x86_64: clean
	GOOS=linux GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-linux-amd64

.PHONY: build/linux-arm64
build/linux-arm64: description = Build $(SERVICE) for linux
build/linux-arm64: clean
	GOOS=linux GOARCH=arm64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-linux-arm64

.PHONY: build/darwin-amd64
build/darwin-amd64: description = Build $(SERVICE) for darwin
build/darwin-amd64: clean
	GOOS=darwin GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-darwin-amd64

.PHONY: build/darwin-arm64
build/darwin-arm64: description = Build $(SERVICE) for darwin
build/darwin-arm64: clean
	GOOS=darwin GOARCH=arm64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-darwin-arm64

.PHONY: docker/build
docker/build: description = Build docker image
docker/build:
	docker buildx build --push --platform=linux/amd64,linux/arm64 \
        -t streamdal/demo-client:e074107 \
        -t streamdal/demo-client:latest \
        -f ./Dockerfile .

.PHONY: clean
clean: description = Clean build
clean:
	rm -rf /path/to/your/build/artifacts
