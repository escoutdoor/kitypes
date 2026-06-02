# KityPes Backend API

Backend of KityPes: REST API, real-time chat, moderation, and AWS integrations.

## Key Features

- REST API for the client app.
- Real-time chat (WebSocket + Redis Pub/Sub).
- Media uploads via S3 pre-signed URLs.
- Transactional emails via SES.
- JWT auth (users do not handle tokens directly).

## Tech Stack

- Go 1.25+, Echo
- PostgreSQL (pgx, squirrel)
- Redis
- AWS S3, AWS SES
- Goose (migrations), Swaggo (Swagger)

## Architecture & Structure

Built using Clean Architecture principles.

```text
.
├── cmd/app/         # Entry point (main.go)
├── internal/        # Business logic
│   ├── handler/         # HTTP controllers
│   ├── service/         # Business rules
│   └── repository/      # Data access
├── migrations/      # SQL migrations
└── pkg/             # Utilities and infrastructure
```

## Configuration

1. Copy env example:
   ```bash
   cp .env.example .env
   ```
2. Configure:
   - PostgreSQL / Redis
   - AWS: `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_SES_SENDER_EMAIL`
   - JWT: `JWT_ACCESS_TOKEN_SECRET_KEY`, `JWT_REFRESH_TOKEN_SECRET_KEY`
   - `APP_FRONTEND_URL`

## Local Run

1. Infrastructure (PostgreSQL, Redis, Prometheus, Grafana):
   ```bash
   docker compose -f compose.yaml up -d
   ```
2. Run the app:
   ```bash
   make run
   ```

## Migrations

SQL migrations run on app start. Files are in [migrations](migrations).

## Swagger

Update docs:
```bash
make swagger
```

After launch: `http://localhost:<PORT>/swagger/index.html`.

## Useful Commands

| Command | Description |
|---|---|
| `make run` | Run locally. |
| `make build` | Build binary. |
| `make swagger` | Generate Swagger. |

