PROTOC_IMAGE = rvolosatovs/protoc:development
NODE_IMAGE = node:lts-alpine

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
setup/darwin: description = Install protobuf tooling for macOS -- TODO: update correct protoc version
setup/darwin:
	# Protocol compiler
	brew tap yoheimuta/protolint
	brew install protobuf@3.11.4 protolint

	# Go plugin used by the protocol compiler
	go get -u github.com/golang/protobuf/protoc-gen-go

.PHONY: setup/linux
setup/linux: description = Install protobuf tooling for linux -- TODO: update correct protoc version
setup/linux:
	# Protocol compiler
	PROTOC_ZIP=protoc-3.10.1-linux-x86_64.zip
	curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v3.10.1/$PROTOC_ZIP
	sudo unzip -o $PROTOC_ZIP -d /usr/local bin/protoc
	sudo unzip -o $PROTOC_ZIP -d /usr/local 'include/*'
	rm -f $PROTOC_ZIP

	# Go plugin used by the protocol compiler
	go get -u github.com/golang/protobuf/protoc-gen-go

.PHONY: generate/go
generate/go: description = Compile protobuf schemas for Go
generate/go: clean/go
generate/go:
	mkdir -p build/go/protos && \
	mkdir -p build/go/protos/steps && \
	mkdir -p build/go/protos/shared

	docker run --rm -v ${PWD}:${PWD} -w ${PWD} ${PROTOC_IMAGE} \
 		--proto_path=protos \
 		--go_out=./build/go/protos \
 		--go-grpc_out=./build/go/protos \
 		--go-grpc_opt=paths=source_relative \
 		--go_opt=paths=source_relative \
		protos/*.proto protos/steps/*.proto protos/shared/*.proto || (exit 1)

	@echo Successfully compiled protos

.PHONY: generate/ts
generate/ts: description = Compile protobuf schema descriptor and generate types for Typescript
generate/ts: clean/ts
generate/ts:
	mkdir -p build/ts/protos
	mkdir -p build/ts/deno
	mkdir -p build/ts/node

	docker run --platform linux/amd64 --rm -v ${PWD}:${PWD} -w ${PWD}/build/ts ${NODE_IMAGE} \
		./build.sh

	@echo Successfully compiled Typescript Protobuf libs for Node and Deno

.PHONY: generate/rust
generate/rust: description = Compile protobuf schemas for Go
generate/rust: clean/rust
generate/rust:
	mkdir -p build/rust/protos/src

	docker run --rm -v ${PWD}:${PWD} -w ${PWD} ${PROTOC_IMAGE} \
 		--proto_path=protos \
 		--rust_out=./build/rust/protos/src \
		protos/*.proto protos/steps/*.proto protos/shared/*.proto || (exit 1)

	@echo Successfully compiled protos

.PHONY: generate/python
generate/python: description = Compile protobuf schema descriptor and generate types for python
generate/python: clean/python
generate/python:
	mkdir -p build/python/streamdal_protos
	docker run --rm -v ${PWD}:/defs streamdal/betterproto:latest \
 		--python_betterproto_out=/defs/build/python/streamdal_protos \
 		--pyi_out=/defs/build/python/streamdal_protos \
		-I /defs/protos/ \
		-I /defs/protos/steps/ \
		-I /defs/protos/shared/ \
		/defs/protos/*.proto || (exit 1)

	@echo Successfully compiled protos

# Protoset files contain binary encoded google.protobuf.FileDescriptorSet protos
.PHONY: generate/protoset
generate/protoset: description = Generate protoset for services
generate/protoset: clean/protoset
generate/protoset:
	mkdir -p build
	docker run --rm -v ${PWD}:${PWD} -w ${PWD} ${PROTOC_IMAGE} \
 		--include_imports \
 		-o build/protos.protoset \
 		--proto_path=protos \
		protos/*.proto protos/steps/*.proto protos/shared/*.proto || (exit 1)

	@echo Successfully generated protoset

.PHONY: generate
generate: description = Run all generate/* targets
generate: lint generate/go generate/rust generate/protoset generate/ts generate/python

.PHONY: clean/go
clean/go: description = Remove all Go build artifacts
clean/go:
	rm -rf ./build/go/*

.PHONY: clean/rust
clean/rust: description = Remove all Rust build artifacts
clean/rust:
	rm -rf ./build/rust/protos/src/*

.PHONY: clean/python
clean/python: description = Remove all Python build artifacts
clean/python:
	rm -rf ./build/python/streamdal_protos
	rm -rf ./build/python/streamdal_protos.egg-info

.PHONY: clean/protoset
clean/protoset: description = Remove protoset artifacts
clean/protoset:
	rm -rf ./build/protos.protoset

.PHONY: clean/ts
clean/ts: description = Remove all TS build artifacts
clean/ts:
	rm -rf ./build/ts/protos/*
	rm -rf ./build/ts/deno/*
	rm -rf ./build/ts/node/*

.PHONY: lint
lint: description = Run protolint
lint:
	protolint protos/
