VERSION ?= $(shell git rev-parse --short HEAD)
SERVICE = demo-client
ARCH ?= $(shell uname -m)
GO = go

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

.PHONY: run/all
run/all: description = Run all of the clients
run/all:
	make run1 & \
	make run2 & \
	make run3 & \
	make run4 & \
	make run5 & \
	make run6

.PHONY: run1
run1: description = Run signup-service
run1:
	go run *.go -d \
	--display-exec-time \
	--message-rate 1 \
	--service-name "signup-service" \
	--operation-type 2 \
	--operation-name  "verifier" \
	--component-name "postgresql" \
	--data-source-type file \
	--data-source-file ./assets/sample-signup-producer.json
	# this client also supports --quiet (for quiet output), various "reconnect"
	# conditions and support for launching multiple clients. `--help` for more
	# info.

.PHONY: run2
run2: description = Run signup-service
run2:
	go run *.go -d \
	--quiet \
	--display-exec-time \
	--message-rate 10,20 \
	--service-name "signup-service" \
	--operation-type 2 \
	--operation-name  "recorder" \
	--component-name "kafka" \
	--data-source-type file \
	--data-source-file ./assets/sample.json

.PHONY: run3
run3: description = Run billing-service
run3:
	go run *.go -d \
	--quiet \
	--message-rate 1,4 \
	--service-name "billing-service" \
	--operation-type 1 \
	--operation-name  "processor" \
	--component-name "kafka" \
	--data-source-type file \
	--data-source-file ./assets/sample-billing-consumer.json

.PHONY: run4
run4: description = Run billing-service
run4:
	go run *.go -d \
	--quiet \
	--message-rate 3,5 \
	--service-name "billing-service" \
	--operation-type 2 \
	--operation-name  "stripe-register" \
	--component-name "stripe" \
	--data-source-type file \
	--data-source-file ./assets/sample-billing-producer.json

.PHONY: run5
run5: description = Run welcome-service
run5:
	go run *.go -d \
	--quiet \
	--message-rate 1,5 \
	--service-name "welcome-service" \
	--operation-type 1 \
	--operation-name  "reader" \
	--component-name "kafka" \
	--data-source-type file \
	--data-source-file ./assets/sample-welcome-consumer.json

.PHONY: run6
run6: description = Run welcome-service
run6:
	go run *.go -d \
	--quiet \
	--message-rate 1,3 \
	--service-name "welcome-service" \
	--operation-type 2 \
	--operation-name  "emailer" \
	--component-name "aws-ses" \
	--data-source-type file \
	--data-source-file ./assets/sample-welcome-producer.json

.PHONY: run7
run7: description = PII Key word
run7:
	go run *.go -d \
	--message-rate 1,10 \
	--service-name "pii-keyword" \
	--operation-type 2 \
	--operation-name  "pii-service" \
	--component-name "aws-ses" \
	--display-exec-time \
	--data-source-type file \
	--data-source-file ./assets/pii-key-value.json

.PHONY: run/async
run/async: description = Run signup-service-async service configured with async
run/async:
	go run *.go -d \
	--quiet \
	--async \
	--display-exec-time \
	--message-rate 10,20 \
	--service-name "signup-service-async" \
	--operation-type 2 \
	--operation-name  "recorder" \
	--component-name "kafka" \
	--data-source-type file \
	--data-source-file ./assets/sample.json

.PHONY: run/sampling
run/sampling: description = Run signup-service-async service configured with sampling rate of 1 message/sec
run/sampling:
	go run *.go -d \
	--quiet \
	--sampling-rate 1 \
	--display-exec-time \
	--message-rate 10,100 \
	--service-name "signup-service-sampling" \
	--operation-type 2 \
	--operation-name  "verifier" \
	--component-name "mysql" \
	--data-source-type file \
	--data-source-file ./assets/sample.json

.PHONY: run/async-sampling
run/async-sampling: description = Run signup-service-async service configured with async and sampling
run/async-sampling:
	go run *.go -d \
	--quiet \
	--async \
	--sampling-rate 1 \
	--display-exec-time \
	--message-rate 10,100 \
	--service-name "signup-service-async-sampling" \
	--operation-type 2 \
	--operation-name  "worker" \
	--component-name "postgresql" \
	--data-source-type file \
	--data-source-file ./assets/sample.json


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
docker/build: description = Build and push docker image
docker/build:
	docker buildx create --use
	docker buildx build --push --platform=linux/amd64,linux/arm64 \
        -t streamdal/demo-client:$(VERSION) \
        -t streamdal/demo-client:latest \
        -f ./Dockerfile .

.PHONY: clean
clean: description = Clean build
clean:
	rm -rf ./build/demo-client-*
