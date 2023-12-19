OUTPUT_DIR      = build
TMP_DIR        := .tmp
RELEASE_VER    := $(shell git rev-parse --short HEAD)
NAME            = default
COVERMODE       = atomic

TEST_PACKAGES      := $(shell go list ./... | grep -v vendor | grep -v fakes)

.PHONY: help
.DEFAULT_GOAL := help

test: getdeps test/integration ## Perform both unit and integration tests

testv: getdeps testv/integration ## Perform both unit and integration tests (with verbose flags)

test/unit: ## Perform unit tests
	go test -cover $(TEST_PACKAGES)

testv/unit: ## Perform unit tests (with verbose flag)
	go test -v -cover $(TEST_PACKAGES)

test/integration: ## Perform integration tests
	go test -cover -tags integration $(TEST_PACKAGES)

testv/integration: ## Perform integration tests
	go test -v -cover -tags integration $(TEST_PACKAGES)

test/race: ## Perform unit tests and enable the race detector
	go test -race -cover $(TEST_PACKAGES)

test/cover: ## Run all tests + open coverage report for all packages
	echo 'mode: $(COVERMODE)' > .coverage
	for PKG in $(TEST_PACKAGES); do \
		go test -coverprofile=.coverage.tmp -tags "integration" $$PKG; \
		grep -v -E '^mode:' .coverage.tmp >> .coverage; \
	done
	go tool cover -html=.coverage
	$(RM) .coverage .coverage.tmp

test/codecov: ## Run all tests + open coverage report for all packages
	ECODE=0; \
	for PKG in $(TEST_PACKAGES); do \
		go test -covermode=$(COVERMODE) -coverprofile=profile.out $$PKG; \
		ECODE=$$((ECODE+$$?));\
		if [ -f profile.out ]; then\
			cat profile.out >> coverage.txt;\
			rm profile.out;\
		fi;\
	done;\
	$(RM) profile.out ;\
	exit $$ECODE;\

getdeps: ## Install needed dependencies for various middlewares
	go get -t -v ./...

generate: ## Run generate for non-vendor packages only
	go list ./... | grep -v vendor | xargs go generate

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_\/-]+:.*?## / {printf "\033[34m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | \
		sort | \
		grep -v '#'
