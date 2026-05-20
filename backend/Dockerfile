FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/app ./cmd/app/main.go

FROM alpine:3.23

WORKDIR /app

COPY --from=builder /app/bin/app ./app
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["./app"]