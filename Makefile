VERSION ?= $(shell git rev-parse --short HEAD)
SERVICE = snitch-server
ARCH ?= $(shell uname -m)

GO = CGO_ENABLED=$(CGO_ENABLED) GOFLAGS=-mod=vendor go
CGO_ENABLED ?= 0
GO_BUILD_FLAGS = -ldflags "-X main.version=${VERSION}"
DATABASE_URL = postgres://postgres:password@localhost:5432/snitch-server?sslmode=disable
MIGRATIONS_DIR = ./backends/postgres/migrations

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

### Dev

.PHONY: setup/linux
setup/linux: description = Install dev tools for linux
setup/linux:
	GO111MODULE=off go get github.com/maxbrunsfeld/counterfeiter

.PHONY: setup/darwin
setup/darwin: description = Install dev tools for darwin
setup/darwin:
	GO111MODULE=off go get github.com/maxbrunsfeld/counterfeiter
	brew install doctl

.PHONY: run
run: description = Run $(SERVICE)
run:
	$(GO) run `ls -1 *.go | grep -v _test.go` -d

.PHONY: start/deps
start/deps: description = Start dependenciesgit 
start/deps:
	docker-compose up -d rabbitmq kafka kafdrop natsjs

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

### Test

.PHONY: test
test: description = Run Go unit tests
test: GOFLAGS=
test:
	$(GO) test ./...

.PHONY: testv
testv: description = Run Go unit tests (verbose)
testv: GOFLAGS=
testv:
	$(GO) test ./... -v

.PHONY: test/coverage
test/coverage: description = Run Go unit tests
test/coverage: GOFLAGS=
test/coverage:
	$(GO) test ./... -coverprofile c.out

### Docker

.PHONY: docker/build/local
docker/build/local: description = Build docker image
docker/build/local:
	docker build -t batchcorp/$(SERVICE):$(VERSION) --build-arg TARGETOS=linux --build-arg TARGETARCH=arm64 \
	-t batchcorp/$(SERVICE):latest \
	-f ./Dockerfile .

.PHONY: docker/build
docker/build: description = Build docker image
docker/build:
	docker buildx build --push --platform=linux/amd64,linux/arm64 -t ghcr.io/streamdal/$(SERVICE):$(VERSION) \
	-t ghcr.io/streamdal/$(SERVICE):latest \
	-f ./Dockerfile .

.PHONY: docker/run
docker/run: description = Build and run container + deps via docker-compose
docker/run:
	docker-compose up -d

.PHONY: docker/push
docker/push: description = Push local docker image
docker/push:
	docker push ghcr.io/streamdal/$(SERVICE):$(VERSION) && \
	docker push ghcr.io/streamdal/$(SERVICE):latest


### Database Operations

.PHONY: sql/init
sql/init: description = Create initial DB
sql/init:
	dbmate -u $(DATABASE_URL) create

.PHONY: sql/reset
sql/reset: description = Recreate initial DB
sql/reset:
	dbmate -u $(DATABASE_URL) drop
	@echo -e "\n"
	dbmate -u $(DATABASE_URL) create

.PHONY: sql/sh
sql/sh: description = Run psql
sql/sh:
	docker exec -it postgres psql -U postgres -d ui_bff


### Migration Operations

.PHONY: migrate/create
migrate/create: description = Create new migration (NAME=migration_name make migrate/create)
migrate/create:
	 dbmate -u $(DATABASE_URL) -d $(MIGRATIONS_DIR) new $(NAME)

.PHONY: migrate/up
migrate/up: description = Runs migrations
migrate/up:
	 dbmate -u $(DATABASE_URL) -d $(MIGRATIONS_DIR) --no-dump-schema migrate

.PHONY: migrate/rollback
migrate/rollback: description = Rollsback previous migration
migrate/rollback:
	 dbmate -u $(DATABASE_URL) -d $(MIGRATIONS_DIR) --no-dump-schema rollback

### Kube

.PHONY: kube/deploy/dev
kube/deploy/dev: description = Deploy image to kubernetes cluster
kube/deploy/dev:
	doctl kubernetes cluster kubeconfig save do-dev && \
	cat deploy.dev.yaml | \
	sed "s/{{VERSION}}/$(VERSION)/g" | \
	sed "s/{{SERVICE}}/$(SERVICE)/g" | \
	python3 scripts/vaultelier.py | \
	kubectl apply -f -

.PHONY: kube/deploy/prod
kube/deploy/prod: description = Deploy image to kubernetes cluster
kube/deploy/prod:
	aws eks --region us-west-2 update-kubeconfig --name batch-prod-1 && \
	cat deploy.prod.yaml | \
	sed "s/{{VERSION}}/$(VERSION)/g" | \
	sed "s/{{SERVICE}}/$(SERVICE)/g" | \
	python3 scripts/vaultelier.py | \
	kubectl apply -f -

.PHONY: kube/delete
kube/delete: description = Deletes pods from cluster
kube/delete:
	kubectl delete pods -l app=$(SERVICE)

.PHONY: kube/logs
kube/logs: description = Get pod logs
kube/logs:
	kubectl logs -l app=$(SERVICE)

.PHONY: kube/logsf
kube/logsf: description = Get pod logs
kube/logsf:
	kubectl logs -l app=$(SERVICE)
