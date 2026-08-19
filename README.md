# Inventory Platform

Inventory Platform is a multi-tenant inventory management system under construction. This repository is currently in the **foundation and architecture phase**: it contains runnable application boundaries, shared package boundaries, development tooling, and database infrastructure, but no business functionality.

## Architecture

The monorepo keeps the Business Web, Mobile, Platform Administration, and central API applications independent. The API will own server-side behavior and Prisma will own database access. Shared packages contain only cross-application infrastructure until domain design is approved.

## Technology Stack

- React, Vite, TypeScript, React Router, Tailwind CSS
- React Native, Expo, Expo Router
- Next.js App Router for administration and API
- PostgreSQL and Prisma
- pnpm and Turborepo
- ESLint, Prettier, Docker Compose

## Repository Layout

```text
apps/       web, mobile, admin, api
packages/   types, schemas, permissions, api-client, config, utils, ui
prisma/     schema and migration/seed boundaries
docs/       architecture, database, API, and development notes
```

## Setup

1. Install Node.js 20 or newer and enable pnpm with `corepack enable`.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env`.
4. Start PostgreSQL with `docker compose up -d postgres`.
5. Generate the Prisma client with `pnpm db:generate`.

## Development Commands

- `pnpm dev` starts all development applications through Turborepo.
- `pnpm --filter @inventory/web dev` starts the Vite web app.
- `pnpm --filter @inventory/mobile start` starts Expo.
- `pnpm --filter @inventory/admin dev` starts the administration app.
- `pnpm --filter @inventory/api dev` starts the API app.

## Quality Commands

Run `pnpm build`, `pnpm lint`, `pnpm typecheck`, or `pnpm format:check` from the root.

## Current Scope

No authentication, authorization, tenants, inventory, purchasing, sales, reporting, billing, audit behavior, or business database models have been implemented. Those belong to a later, explicitly designed phase.