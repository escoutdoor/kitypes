FROM golang:1.25-alpine AS builder

WORKDIR /app

RUN apk add --no-cache make git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN make swagger

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/app ./cmd/app/main.go

FROM alpine:3.23

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/bin/app ./app
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

USER appuser

CMD ["./app"]
