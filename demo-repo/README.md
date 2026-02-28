# Admin Dashboard API

A FastAPI-powered backend service for managing users, roles, documents, and AI-powered text operations.

## Features

- **User Management** — CRUD operations for users with role-based access
- **Document Processing** — Upload, store, and summarize documents using GPT-4
- **AI Chat** — Multi-turn conversation endpoint powered by OpenAI
- **Sentiment Analysis** — Analyze customer feedback sentiment
- **Admin Dashboard** — System stats, analytics, and configuration overview
- **Activity Logging** — Track all user actions for audit purposes

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourcompany/admin-dashboard-api.git
cd admin-dashboard-api

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Docker

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`.

## API Endpoints

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/`                   | Service status                 |
| GET    | `/health`             | Health check                   |
| GET    | `/admin`              | Admin dashboard stats          |
| GET    | `/admin/config`       | View current configuration     |
| POST   | `/admin/users`        | Create a new user              |
| GET    | `/admin/users`        | List all users                 |
| PUT    | `/admin/users/{id}`   | Update a user                  |
| DELETE | `/admin/users/{id}`   | Delete a user                  |
| POST   | `/summarize`          | Summarize text using AI        |
| POST   | `/chat`               | Multi-turn AI chat             |
| POST   | `/analyze/sentiment`  | Analyze text sentiment         |
| POST   | `/documents/upload`   | Upload a document              |
| GET    | `/analytics`          | Platform analytics overview    |

## Environment Variables

See `.env.example` for required configuration variables.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Cache**: Redis
- **AI**: OpenAI GPT-4
- **Containerization**: Docker + Docker Compose

## License

Internal use only. © 2025 Company Inc.
