# KityPes

A pet adoption platform with a full interaction cycle: listings, real-time chat, user verification, and moderation.

## Key Features

- Pet listings: create, edit, archive, delete.
- Real-time chat between listing owners and adopters.
- Roles and verification: user, volunteer, shelter, admin.
- Reports and moderation: ad blocking, user bans, content control.
- Favorites for quick access to saved listings.

## Architecture

- Next.js (SSR) for public pages, Go API for `/api/*`.
- ECS on EC2 behind ALB; TLS via ACM.
- RDS Postgres, ElastiCache Redis, S3, SES.

## Tech Stack

**Backend:** Go, Echo, PostgreSQL, Redis, AWS S3, AWS SES, JWT, Goose, Swaggo.

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query, Zustand.

## Repository

- [backend/README.md](backend/README.md) — API server, migrations, integrations.
- [frontend/README.md](frontend/README.md) — client app, UI, state, data fetching.

## Local Run (Quick)

1. Copy env files:
	- [backend/.env.example](backend/.env.example) -> backend/.env
	- [frontend/.env.example](frontend/.env.example) -> frontend/.env
2. Run the full stack with Docker:
	```bash
	docker compose -f docker-compose.dev.yaml up --build
	```
3. Or run separately:
	- infrastructure: `docker compose -f backend/compose.yaml up -d`
	- backend: `make -C backend run`
	- frontend: `make -C frontend dev`

## CI/CD & Deployment

GitHub Actions builds the backend, builds Docker images, pushes them to ECR, and updates ECS Task Definitions with a rolling update.

## License

MIT License — see [LICENSE](LICENSE).

