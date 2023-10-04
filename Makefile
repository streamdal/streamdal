VERSION ?= $(shell git rev-parse --short HEAD)
SERVICE = snitch-server
ARCH ?= $(shell uname -m)

GO = CGO_ENABLED=$(CGO_ENABLED) GOFLAGS=-mod=vendor go
CGO_ENABLED ?= 0
GO_BUILD_FLAGS = -ldflags "-X main.version=${VERSION}"

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

### Setup

.PHONY: setup/darwin
setup/darwin: description = Setup for darwin
setup/darwin:
	brew install go
	brew install curl
	brew install grpcurl

### Dev

.PHONY: run/dev
run/dev: description = Download snitch-server img and run it + all its deps
run/dev:
	docker-compose -f docker-compose.dev.yaml build && \
	docker-compose -f docker-compose.dev.yaml up -d && \
	echo "Running snitch-server version `curl -s http://localhost:8080/version`"

.PHONY: run/dev/build
run/dev/build: description = Build snitch-server img and run it + all its deps
run/dev/build:
	docker-compose -f docker-compose.dev.build.yaml build && \
	docker-compose -f docker-compose.dev.build.yaml up -d && \
	echo "Running snitch-server version `curl -s http://localhost:8080/version`"

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

.PHONY: clean
clean: description = Remove existing build artifacts
clean:
	$(RM) ./build/$(SERVICE)-*

# NOTE: We are doing "|| true" in 'reset' so that 'make' will continue executing
# commands even if they fail

.PHONY: reset
reset: description = Full reset that will remove all snitch-related docker containers, images, volumes, etc.
reset:
	echo "flushall" | nc localhost 6379 || true
	docker ps | grep -i -e snitch -e redis | awk {'print $$1'} | xargs docker rm -f || true
	docker images | grep -i -e snitch -e redis | awk {'print $$3'} | xargs docker rmi -f || true
	docker volume rm -f redis-data || true
	docker volume ls | grep -i redis | awk {'print $2'} | xargs docker volume rm -f || true


### Test

.PHONY: test
test: description = Run Go tests (make sure to bring up deps first; tests are ran non-parallel)
test: GOFLAGS=
test:
	TEST=true $(GO) test ./apis/grpcapi/... -v -count=1

### Docker

.PHONY: docker/build/local
docker/build/local: description = Build docker image locally (needed for M1+)
docker/build/local:
	docker build --load --build-arg TARGETOS=linux --build-arg TARGETARCH=arm64 \
	-t streamdal/$(SERVICE):$(VERSION) \
	-t streamdal/$(SERVICE):latest \
	-f ./Dockerfile .

.PHONY: docker/build
docker/build: description = Build docker image
docker/build:
	docker buildx build --push --platform=linux/amd64,linux/arm64 \
	-t streamdal/$(SERVICE):$(VERSION) \
	-t streamdal/$(SERVICE):latest \
	-f ./Dockerfile .

.PHONY: docker/push
docker/push: description = Push local docker image
docker/push:
	docker push streamdal/$(SERVICE):$(VERSION) && \
	docker push streamdal/$(SERVICE):latest
