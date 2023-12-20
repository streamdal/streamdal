BINARY   = streamdal
ARCH ?= $(shell uname -m)
LOCAL_VERSION = v0.0.0-local

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

# If not set, use local var
ifeq ($(GITHUB_VERSION),)
VERSION := $(LOCAL_VERSION)
else
VERSION := $(GITHUB_VERSION)
endif

GO = CGO_ENABLED=$(CGO_ENABLED) GONOPROXY=github.com/streamdal GOFLAGS=-mod=vendor go
CGO_ENABLED ?= 0
GO_BUILD_FLAGS = -ldflags "-X 'main.VERSION=${VERSION}'"

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

### Dev

.PHONY: setup/linux
setup/linux: description = Install dev tools for linux
setup/linux:
	GO111MODULE=off go get github.com/maxbrunsfeld/counterfeiter

.PHONY: setup/darwin
setup/darwin: description = Install dev tools for darwin
setup/darwin:
	GO111MODULE=off go get github.com/maxbrunsfeld/counterfeiter

.PHONY: run
run: description = Run $(BINARY)
run:
	$(GO) run `ls -1 *.go | grep -v _test.go`

### Build

.PHONY: build
build: description = Build $(BINARY)
build: clean build/linux build/darwin build/darwin-arm64 build/windows

.PHONY: build/linux
build/linux: description = Build $(BINARY) for linux
build/linux: clean
	GOOS=linux GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(BINARY)-linux

.PHONY: build/linux-amd64
build/linux-amd64: description = Build $(BINARY) for linux
build/linux-amd64: clean
	GOOS=linux GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(BINARY)-linux-amd64


.PHONY: build/linux-x86_64
build/linux-x86_64: description = Build $(BINARY) for linux
build/linux-x86_64: clean
	GOOS=linux GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(BINARY)-linux-amd64

.PHONY: build/linux-arm64
build/linux-arm64: description = Build $(BINARY) for linux
build/linux-arm64: clean
	GOOS=linux GOARCH=arm64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(BINARY)-linux-arm64

.PHONY: build/darwin
build/darwin: description = Build $(BINARY) for darwin
build/darwin: clean
	GOOS=darwin GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(BINARY)-darwin

.PHONY: build/darwin-arm64
build/darwin-arm64: description = Build $(BINARY) for darwin/arm64 (Apple Silicon)
build/darwin-arm64: clean
	GOOS=darwin GOARCH=arm64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(BINARY)-darwin-arm64

.PHONY: build/darwin-amd64
build/darwin-amd64: description = Build $(BINARY) for darwin/amd64 (Intel)
build/darwin-amd64: clean
	GOOS=darwin GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(BINARY)-darwin-amd64

.PHONY: build/windows
build/windows: description = Build $(BINARY) for windows
build/windows: clean
	GOOS=windows GOARCH=amd64 $(GO) build $(GO_BUILD_FLAGS) -o ./build/$(BINARY)-windows.exe

.PHONY: clean
clean: description = Remove existing build artifacts
clean:
	$(RM) ./build/$(BINARY)-*

### Test

.PHONY: test
test: description = Run Go unit tests
test: GOFLAGS=
test:
	$(GO) test ./... -v

.PHONY: test/coverage
test/coverage: description = Run Go unit tests and output coverage information
test/coverage: GOFLAGS=
test/coverage:
	$(GO) test ./... -coverprofile c.out
