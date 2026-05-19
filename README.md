# KityPes

> A purpose-driven platform connecting loving families with pets in need, featuring real-time communication, intuitive ad management, and robust security systems to ensure a trusted adoption experience.

## About the Project

**KityPes** is a modern, full-stack application on a mission to give every pet a loving family. At its core, the platform serves as a secure bridge between pet shelters, volunteers, and future pet owners. 

Beyond simply listing adoption advertisements, KityPes provides an engaging, deeply personalized environment. Users can instantly communicate through real-time chat to discuss pet details. At the same time, a comprehensive set of trust and safety tools operates behind the scenes. Through user verification, active report handling, and built-in protections against spam or malicious actors, KityPes maintains a clean, secure community—ensuring that everyone's focus remains entirely on what truly matters: finding the perfect companion.

## Key Features

- **Pet Advertisements Management:** Create, browse, update, and delete pet adoption ads.
- **Real-Time Chat:** Instant messaging between users for ad inquiries and pet details.
- **User Verification:** Built-in system for profile verification to build trust and safety within the community.
- **Reports & Moderation:** Comprehensive reporting system and an Admin panel for managing users, handling reports, and content moderation (blocking ads / banning accounts).
- **Favorites:** Save and keep track of favorite pet advertisements.

## Architecture & Tech Stack

The project follows a decoupled Client-Server architecture, divided into independent frontend and backend modules.

**Backend:**
- Go (Golang)
- PostgreSQL
- AWS S3 (Media Storage) & AWS SES (Email Service)
- Docker & Docker Compose
- Prometheus (Metrics)

**Frontend:**
- Next.js / React
- Tailwind CSS

## Repository Structure & Navigation

This repository is structured as a monorepo containing both the backend API and the frontend application. 

For detailed setup, installation, and deployment instructions, please refer to the specific documentation for each module:

- 📁 **[`/backend`](./backend/README.md)** — Go server, REST API, database migrations, and Docker configurations.
- 📁 **[`/frontend`](./frontend/README.md)** — Next.js client, UI components, and state management.

## API Documentation

The backend exposes a standardized REST API documented with Swagger (OpenAPI). 

To prevent Git churn, the generated Swagger files (`docs.go`, `swagger.json`, `swagger.yaml`) are ignored in the repository. You must generate them locally by running `make swagger` in the `backend/` directory, which will output the files into the `backend/docs/` folder.

Once generated and the backend service is running locally, the Swagger UI is accessible for interactive API exploration.

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

