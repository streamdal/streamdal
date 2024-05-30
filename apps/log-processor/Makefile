SERVICE = log-processor
ARCH ?= $(shell uname -m)
VERSION ?= $(shell git rev-parse --short HEAD)
SHORT_SHA ?= $(shell git rev-parse --short HEAD)
GIT_TAG ?= $(shell git tag -l | sort -V | grep apps/log-processor | tail -n 1 | cut -d '/' -f 3 | sed 's/v//')

# If git tag is not present, set default
ifeq ($(GIT_TAG),)
GIT_TAG := 0.0.0
endif

GO = CGO_ENABLED=$(CGO_ENABLED) GOFLAGS=-mod=vendor go
# WASM requires cgo
CGO_ENABLED ?= 1
GO_BUILD_FLAGS = -ldflags "-X main.version=${VERSION} -extldflags=-static" -tags netgo,wasmtime


# Utility functions
check_defined = \
	$(strip $(foreach 1,$1, \
		$(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = $(if $(value $1),, \
	$(error undefined '$1' variable: $2))

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

### Build

.PHONY: build
build: description = Build ${SERVICE}
build: clean build/linux-$(ARCH) build/darwin-$(ARCH)

.PHONY: build/linux-amd64
build/linux-amd64: description = Build server for linux (amd64)
build/linux-amd64: clean
	GOOS=linux GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-linux-amd64

.PHONY: build/linux-x86_64
build/linux-x86_64: description = Build server for linux (x86_64)
build/linux-x86_64: clean
	GOOS=linux GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-linux-amd64

.PHONY: build/linux-arm64
build/linux-arm64: description = Build server for linux (arm64)
build/linux-arm64: clean
	GOOS=linux GOARCH=arm64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-linux-arm64

.PHONY: build/darwin-amd64
build/darwin-amd64: description = Build server for darwin (amd64)
build/darwin-amd64: clean
	GOOS=darwin GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-darwin-amd64

.PHONY: build/darwin-arm64
build/darwin-arm64: description = Build server for darwin (arm64)
build/darwin-arm64: clean
	GOOS=darwin GOARCH=arm64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(SERVICE)-darwin-arm64

.PHONY: clean
clean: description = Remove existing build artifacts
clean:
	$(RM) ./build/$(SERVICE)-*

### Test

.PHONY: test
test: description = Run Go tests
test: GOFLAGS=
test:
	$(GO) test ./... -v -count=1

### Run

.PHONY: run/docker
run/docker: description = Run pre-built log-processor and its dependencies locally
run/docker:
	docker-compose -f docker-compose.yaml up -d

.PHONY: run/docker/local
run/docker/local: description = Build and run log-processor and its dependencies locally
run/docker/local:
	docker-compose -f docker-compose.local.yaml up -d

### Build

.PHONY: docker/build/local
docker/build/local: description = Build docker image locally (needed for M1+)
docker/build/local:
	docker build --load --build-arg TARGETOS=linux --build-arg TARGETARCH=arm64 \
	-t streamdal/$(SERVICE):local \
	-f ./Dockerfile .

.PHONY: docker/build
docker/build: description = Build docker image
docker/build:
	docker buildx build --push --platform=linux/amd64,linux/arm64 \
	-t streamdal/$(SERVICE):$(SHORT_SHA) \
	-f ./Dockerfile .

.PHONY: docker/push
docker/push: description = Push local docker image
docker/push:
	docker push streamdal/$(SERVICE):$(VERSION) && \
	docker push streamdal/$(SERVICE):latest
