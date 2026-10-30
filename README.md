# ToolShare

ToolShare is a Node.js/Express API using MongoDB and Mongoose.

The backend is organized under `src/` into configuration, models, repositories,
services, controllers, routes, middleware, and utilities. Empty business
modules are starting points and do not yet provide CRUD operations.

## Architecture overview

An overview of the existing components and next steps for the API architecture
is available in [docs/API_ARCHITECTURE.md](./docs/API_ARCHITECTURE.md).

## Getting started

Copy `.env.example` to `.env`, then start the services with Docker Compose:

```sh
docker compose -f docker-compose.yml up --build
```

For repeatable demo accounts and an importable Postman test flow, see
[docs/POSTMAN_TESTING.md](./docs/POSTMAN_TESTING.md).

The API listens on port `5000`. Available routes include `GET /`,
`GET /api/v1/health`, `POST /api/v1/auth/register`,
`POST /api/v1/auth/login`, and `GET /api/v1/me` (with a Bearer JWT).