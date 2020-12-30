PACKAGE=gyfhub

# Names and Versions
DOCKER_CONTAINER=$(PACKAGE)-db
MIGRATE_VERSION=v4.12.2

# Paths
BIN = $(CURDIR)/bin
SERVER = $(CURDIR)/server
WEB = $(CURDIR)/web

# DB Settings
LOCAL_DEV_DB_USER=gyfhub
LOCAL_DEV_DB_PASS=dev
LOCAL_DEV_DB_HOST=localhost
LOCAL_DEV_DB_PORT=5438
LOCAL_DEV_DB_DATABASE=$(PACKAGE)
DB_CONNECTION_STRING="postgres://$(LOCAL_DEV_DB_USER):$(LOCAL_DEV_DB_PASS)@$(LOCAL_DEV_DB_HOST):$(LOCAL_DEV_DB_PORT)/$(LOCAL_DEV_DB_DATABASE)?sslmode=disable"

# Make Commands
.PHONY: tools
tools: 
	# 1. Creates BIN Folder
	# 2. Installs golang migrate
	# 3. Installs air
	# 4. Intalls sqlboiler & sqlboiler-psql 
	@mkdir -p $(BIN) 
	cd $(BIN) && curl -L https://github.com/golang-migrate/migrate/releases/download/$(MIGRATE_VERSION)/migrate.linux-amd64.tar.gz | tar xvz && mv migrate.linux-amd64 migrate
	cd $(SERVER) && go build -o $(BIN)/air github.com/cosmtrek/air
	env GO111MODULE=off GOBIN=$(BIN) go get github.com/volatiletech/sqlboiler 
	env GO111MODULE=off GOBIN=$(BIN) go get github.com/volatiletech/sqlboiler/drivers/sqlboiler-psql

# SQL
.PHONY: sql
sql:
	$(BIN)/sqlboiler $(BIN)/sqlboiler-psql --wipe --tag db --config $(SERVER)/sqlboiler.toml --output $(SERVER)/db


# Docker
.PHONY: docker-start
docker-start:
	docker start $(DOCKER_CONTAINER) || docker run -d -p $(LOCAL_DEV_DB_PORT):5432 --name $(DOCKER_CONTAINER) -e POSTGRES_USER=$(PACKAGE) -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=$(PACKAGE) postgres:11-alpine

.PHONY: docker-stop
docker-stop:
	docker stop $(DOCKER_CONTAINER)

.PHONY: docker-remove
docker-remove:
	docker rm $(DOCKER_CONTAINER)

.PHONY: docker-setup
docker-setup:
	docker exec -it $(DOCKER_CONTAINER) psql -U $(PACKAGE) -c 'CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'



# Database
.PHONY: db-drop
db-drop:
	$(BIN)/migrate -database $(DB_CONNECTION_STRING) -path $(SERVER)/migrations drop -f

.PHONY: db-migrate
db-migrate:
	$(BIN)/migrate -database $(DB_CONNECTION_STRING) -path $(SERVER)/migrations up

.PHONY: db-seed
db-seed:
	cd $(SERVER) && go run cmd/platform/main.go db --seed

.PHONY: db-reset
db-reset: db-drop db-migrate sql db-seed 

.PHONY: db-prepare
db-prepare: 
	docker exec -it gyfhub-db psql -U gyfhub





.PHONY: web-install
web-install:
	cd $(WEB) && npm install

.PHONY: gmt
go-mod-tidy:
	cd $(SERVER) && go mod tidy

.PHONY: gmd
gmd:
	cd $(SERVER) && go mod download

.PHONY: deps
deps: web-install gmd

.PHONY: init
init:  docker-start docker-setup deps tools  db-migrate db-seed

.PHONY: serve
serve:
	# replaces realize
	cd $(SERVER) && ../bin/air -c .air.toml




