# EduCore

EduCore is a modular, multi-tenant SaaS platform for Unified Edge Solution.

This repository starts with a clean workspace scaffold that follows the platform architecture
document:

- NestJS backend
- Next.js frontend
- PostgreSQL and Redis infrastructure
- Modular monolith structure with core services and independent products

The current implementation covers the Phase 1 platform foundation:

- Authentication and JWT login
- Tenants, users, roles, permissions
- Product registry, licensing, and feature flags
- Audit logs, notifications, settings, dashboard, and reporting
- Logging, queues, email templates, storage, configuration, health checks, and Swagger

## Layout

```text
apps/
  api/   NestJS backend
  web/   Next.js frontend
```

The API scaffold already includes the architecture-aligned source folders for:

- `core`
- `shared`
- `database`
- `config`
- `events`
- `jobs`
- `products/admission`
- `products/fees`
- `products/procurement`

## Next Steps

1. Copy `.env.example` to `.env` at the repository root.
2. Install dependencies.
3. Run the API and web apps in development mode.
4. Generate the shared platform modules.
5. Fill in the initial product modules.

## Useful Commands

- `npm run dev:api`
- `npm run dev:web`
- `docker compose up -d postgres redis`

## Seeded Demo Access

- Tenant: `miami-academy`
- Email: `admin@educore.local`
- Password: `Password123!`
- Required headers: `X-Tenant-Id` and, when needed, `X-Product-Code`
