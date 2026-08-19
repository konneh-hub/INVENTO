# Monorepo Structure

The repository uses pnpm workspaces and Turborepo. Applications live under `apps/`; reusable infrastructure packages live under `packages/`; Prisma and documentation remain root-owned. Each application has its own package manifest and compile/run commands.