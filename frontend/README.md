# KityPes Frontend

Client app for KityPes: listings, chat, profile, verification, and admin panel.

## Key Features

- SSR for public listing pages.
- Real-time chat.
- Role-based access (public, user, admin).
- Caching and optimistic updates via TanStack Query.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS v4, Shadcn UI (Radix UI)
- Axios, TanStack Query v5
- Zustand, React Hook Form, Zod
- pnpm

## Structure

```text
.
├── src/
│   ├── app/             # App Router (pages and layouts)
│   ├── components/      # UI components (features, shared, ui)
│   ├── hook/            # Custom hooks
│   ├── lib/             # Utilities
│   ├── provider/        # Context providers
│   ├── service/         # API clients
│   └── store/           # Zustand store
```

## Configuration

1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Key variables:
   - `NEXT_PUBLIC_API_URL` — backend URL.
   - `NEXT_PUBLIC_APP_URL` — public frontend URL.
   - `SERVER_API_URL` — internal backend URL for SSR in Docker network.

## Local Run

```bash
pnpm install
make dev
```

## Useful Commands

| Command | Description |
|---|---|
| `make dev` | Start the dev server. |
| `make build` | Production build. |
| `make start` | Start production server. |
| `make lint` | Run ESLint. |
