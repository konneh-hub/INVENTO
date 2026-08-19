# Database Architecture

PostgreSQL runs locally through Docker Compose. Prisma is configured with a PostgreSQL datasource and generated client, but the schema intentionally contains no business-domain models. Migrations and seed directories are reserved for later phases.