# System Architecture

The foundation separates three clients: the React/Vite Business Web app, the React Native/Expo Mobile app, and the Next.js Platform Administration app. A separate Next.js App Router application owns the future versioned API. PostgreSQL is the persistence service and Prisma is the database access foundation.

No domain workflows or business models are implemented in this phase.
