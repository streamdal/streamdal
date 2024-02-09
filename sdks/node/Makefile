VERSION ?= $(shell git rev-parse --short HEAD)
SERVICE = node-sdk
ARCH ?= $(shell uname -m)
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


.PHONY: docker/build
docker/build: description = Build docker image
docker/build:
	docker buildx build --push --platform=linux/amd64,linux/arm64 -t ghcr.io/streamdal/node-sdk:$(SERVICE) \
	-t ghcr.io/streamdal/node-sdk:latest \
	-f ./Dockerfile .
