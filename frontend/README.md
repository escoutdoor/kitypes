# KityPes Frontend

Frontend part of the **KityPes** animal adoption platform. This web application provides a responsive, interactive user interface for browsing animal ads, chatting with owners, managing favorites, and administrative tools.

## 🚀 Key Features
* **Modern UI/UX**: Fast, accessible, and responsive interface.
* **Realtime Chats**: WebSocket-based messaging for discussing adoption details.
* **Role-Based Routing**: Dedicated areas for public users, authenticated users, and administrators.
* **Optimistic Updates & Caching**: Efficient data fetching and state caching using TanStack Query.

## 🛠 Tech Stack

* **Framework**: Next.js 16 (App Router)
* **Library**: React 19
* **Language**: TypeScript 5
* **Styling**: Tailwind CSS v4, Shadcn UI (Radix UI)
* **Data Fetching**: Axios, TanStack Query v5 (React Query)
* **State Management**: Zustand (for global application state)
* **Forms & Validation**: React Hook Form + Zod
* **Package Manager**: pnpm

## 🏗 Architecture & Directory Structure

The project follows a modular frontend structure built around the Next.js App Router.

```text
.
├── src/
│   ├── app/             # Next.js App Router (pages and layouts)
│   ├── components/      # UI Components (features, shared, ui)
│   ├── hook/            # Custom React hooks (business logic, data fetching)
│   ├── lib/             # Utility functions and configurations
│   ├── provider/        # React Context providers
│   ├── service/         # API abstraction layer (HTTP requests)
│   └── store/           # Zustand stores for global state
```

## ⚙️ Prerequisites

* **Node.js** (version 20 or higher)
* **pnpm** (preferred package manager)
* **Make** (optional, for utility commands)

## 🔧 Configuration

Application settings are configured via environment variables. Next.js automatically reads the `.env` file.
1. Copy the example configuration file:
   ```bash
   cp .env.example .env 
   ```
2. Configure the following variables:
   * **`PORT`**: The port to run the application on (e.g., 3000). Next.js automatically detects this variable.
   * **`NEXT_PUBLIC_API_URL`**: Base URL for KityPes Backend REST API.

## 🏃 Running the Project

1. **Install dependencies**:
   ```bash
   pnpm install
   ```
2. **Launch the development server**:
   ```bash
   make dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000) (or the port specified by the `PORT` variable in `.env`).

## 🛠 Useful Commands (Makefile)

We use a `Makefile` to simplify routine commands:

| Command | Description |
|---------|-------------|
| `make dev` | Starts the Next.js development server. |
| `make build` | Compiles the application for production deployment. |
| `make start` | Runs the compiled production application. |
| `make lint` | Runs ESLint to check for code quality and formatting issues. |
