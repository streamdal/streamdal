SERVICE := server
ARCH = $(shell uname -m)
LOCAL_VERSION = v0.0.0-local
LOCAL_SHORT_SHA = $(shell git rev-parse --short HEAD)

define WELCOME_MESSAGE
     _                                _       _
 ___| |_ _ __ ___  __ _ _ __ ___   __| | __ _| |
/ __| __| '__/ _ \/ _` | '_ ` _ \ / _` |/ _` | |
\__ \ |_| | |  __/ (_| | | | | | | (_| | (_| | |
|___/\__|_|  \___|\__,_|_| |_| |_|\__,_|\__,_|_|
================================================
    	  Code-Native Data Pipelines

endef

export WELCOME_MESSAGE

ifeq ($(GITHUB_VERSION),)
GITHUB_VERSION := v0.0.0-github
endif

ifeq ($(GITHUB_SHORT_SHA),)
GITHUB_SHORT_SHA := ffffffff
endif

ifeq ($(GITHUB_TAG),)
GITHUB_TAG := $(GITHUB_VERSION)-$(GITHUB_SHORT_SHA)
endif

GO = CGO_ENABLED=$(CGO_ENABLED) GOFLAGS=-mod=vendor go
CGO_ENABLED ?= 0

# If github env var is NOT present, use local vars
ifeq ($(GITHUB_ENV),)
GO_BUILD_FLAGS = -ldflags "-X main.version=${LOCAL_VERSION}"
else
GO_BUILD_FLAGS = -ldflags "-X main.version=${GITHUB_VERSION}-${GITHUB_SHORT_SHA}"
endif

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
	@echo "$$WELCOME_MESSAGE"
	@perl -ne '$(HELP_SCRIPT)' $(MAKEFILE_LIST)

### Setup

.PHONY: setup/darwin
setup/darwin: description = Setup for darwin
setup/darwin:
	mv env.example .env
	brew install go
	brew install curl
	brew install grpcurl

### Dev

.PHONY: run/dev
run/dev: description = Download streamdal/server img and run it + all its deps
run/dev:
	docker rm -f "/streamdal-server" || true && \
    docker rm -f "/streamdal-redis" || true && \
    docker rm -f "/streamdal-envoy" || true && \
	docker rm -f "/streamdal-graphite" || true && \
	docker rm -f "/streamdal-grafana" || true && \
	docker-compose -f docker-compose.dev.yaml pull && \
	docker-compose -f docker-compose.dev.yaml up --always-recreate-deps --force-recreate -d && \
	echo "Running stramdal/server version `curl -s http://localhost:8081/version`"

.PHONY: run/dev/build
run/dev/build: description = Build streamdal/server img and run it + all its deps
run/dev/build:
	docker rm -f "/streamdal-server" || true && \
	docker rm -f "/streamdal-redis" || true && \
	docker rm -f "/streamdal-envoy" || true && \
	docker rm -f "/streamdal-graphite" || true && \
	docker rm -f "/streamdal-grafana" || true && \
	docker-compose -f docker-compose.dev.build.yaml build && \
	docker-compose -f docker-compose.dev.build.yaml up -d && \
	echo "Running streamdal/server version `curl -s http://localhost:8081/version`"

.PHONY: stop/dev
stop/dev: description = Stop streamdal/server img and all its deps
stop/dev:
	docker-compose -f docker-compose.dev.yaml down

.PHONY: stop/dev/build
stop/dev/build: description = Stop streamdal/server img and all its deps
stop/dev/build:
	docker-compose -f docker-compose.dev.build.yaml down

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

# NOTE: We are doing "|| true" in 'reset' so that 'make' will continue executing
# commands even if they fail

.PHONY: reset
reset: description = Full reset (will remove all streamdal components - containers, images, volumes, etc.)
reset:
	echo "flushall" | nc localhost 6379 || true
	docker ps | grep -i -e streamdal -e redis | awk {'print $$1'} | xargs docker rm -f || true
	docker images | grep -i -e streamdal -e redis | awk {'print $$3'} | xargs docker rmi -f || true
	docker volume rm -f redis-data || true
	docker volume ls | grep -i redis | awk {'print $2'} | xargs docker volume rm -f || true


### Test

.PHONY: test
test: description = Run Go tests (make sure to bring up deps first; tests are ran non-parallel)
test: GOFLAGS=
test:
	@echo "Make sure to bring up deps first via 'make run/dev'"
	cd assets/wasm && bash ./download-wasm.sh && cd - && \
	TEST=true $(GO) test ./... -v -count=1

### Docker

.PHONY: docker/build
docker/build: description = Build docker image (intended to be ran by Github Actions)
docker/build:
	docker buildx build --push --platform=linux/amd64,linux/arm64 \
	-t streamdal/$(SERVICE):$(GITHUB_VERSION)-$(GITHUB_SHORT_SHA) \
	-t streamdal/$(SERVICE):latest \
	-f ./Dockerfile .

.PHONY: docker/build/local
docker/build/local: description = Build docker image locally (needed for M1+)
docker/build/local:
	docker build --progress=plain --no-cache --load --build-arg TARGETOS=linux --build-arg TARGETARCH=arm64 \
	-t streamdal/$(SERVICE):$(LOCAL_VERSION)-$(LOCAL_SHORT_SHA) \
	-t streamdal/$(SERVICE):latest \
	-f ./Dockerfile .

.PHONY: docker/push/local
docker/push: description = Push local docker image
docker/push:
	docker push streamdal/$(SERVICE):$(LOCAL_VERSION)-$(LOCAL_SHORT_SHA) && \
	docker push streamdal/$(SERVICE):latest
