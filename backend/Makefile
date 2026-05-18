.PHONY: build run swagger

build:
	go build -o ./bin/app ./cmd/app

run: build
	./bin/app

swagger:
	go tool swag init -g cmd/app/main.go --parseDependency --parseInternal
