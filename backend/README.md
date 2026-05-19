# KityPes Backend API

Backend part of the **KityPes** animal adoption platform. This service provides the application's core business logic, data management, real-time communication, and integration with external services.

## 🚀 Key Features
* **REST API**: Handling client application requests.
* **Realtime Chats**: Built-in WebSocket-based chats for adoption-related communication.
* **AWS S3 Integration**: Secure upload and storage of media files (images).
* **AWS SES**: Transactional email delivery (verification, password recovery, etc.).

## 🛠 Tech Stack

* **Language**: Go 1.24+
* **Framework**: Echo
* **Database**: PostgreSQL (using `pgx/pgxscan` and `squirrel` for Query Builder)
* **Caching**: Redis
* **Cloud Services**: AWS (S3, SES)
* **Migrations**: Goose
* **Documentation**: Swaggo

## 🏗 Architecture & Directory Structure

The project is built on **Clean Architecture** principles.

```text
.
├── cmd/app/         # Application entry point (main.go)
├── internal/        # Business logic (internal packages)
│   ├── handler/         # HTTP controllers (Delivery layer)
│   ├── service/         # Business rules and logic (Use Case layer)
│   └── repository/      # Data access (Data Access layer)
├── migrations/      # Database migration SQL scripts
└── pkg/             # Shared utilities and abstractions (logger, DB clients, AWS)
```

## ⚙️ Prerequisites

For local execution and development, you will need:
* **Go** (version 1.24 or higher)
* **Docker** and **Docker Compose**
* **Make**

## 🔧 Configuration

All settings are configured via environment variables. 
1. Copy the configuration file example:
   ```bash
   cp .env.example .env
   ```
2. Edit the `.env` file. Important variable groups:
   * **PostgreSQL / Redis**: Credentials for local/remote databases.
   * **AWS**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, buckets, and regions for S3/SES.
   * **JWT**: Secret keys for generating access tokens.

*(Detailed values for local development are usually already provided in `.env.example`, except for AWS secret keys)*

## 🏃 Running the Project (Local Development)

1. **Infrastructure setup** (Database, Redis):
   ```bash
   docker-compose up -d pg redis
   ```
2. **Launch the application**:
   ```bash
   make run
   ```
   The application will start and be available on the port specified in your `.env` (usually `localhost:3800`).

## 🗄 Database Migrations

Migrations (`migrations/*.sql`) are applied automatically at application startup in the `app.New()` initialization function. 
* All SQL scripts for database schema changes are located in the `migrations/` directory.

## 📚 API Documentation

Documentation is automatically generated from code comments using **Swaggo**.
* **View Swagger UI**: `http://localhost:<YOUR_PORT>/swagger/index.html` (e.g., [http://localhost:3800/swagger/index.html](http://localhost:3800/swagger/index.html) by default). Note that the port might be different if the `HTTP_SERVER_PORT` (or corresponding) variable was changed in your `.env` file.
* **Update Swagger**: If you changed the documentation in the code (`@Summary`, `@Param` comments, etc.), regenerate it with the command:
  ```bash
  make swagger
  ```

## 🛠 Useful Commands (Makefile)

The project is configured with a `Makefile` to simplify routine tasks:

| Command        | Description |
|---------------|------|
| `make run`    | Runs the application on the local machine. |
| `make build`  | Compiles the application into an executable (`bin/app`). |
| `make swagger`| Generates/updates Swagger documentation. |

