.PHONY: build run swagger test

build:
	go build -o ./bin/app ./cmd/app

run: build
	./bin/app

swagger:
	go tool swag init -g main.go -d cmd/app,internal --parseDependency --parseInternal

test:
	go test -v ./... -count=$(COUNT)
