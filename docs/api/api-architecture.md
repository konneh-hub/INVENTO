# API Architecture

The central API is a separate Next.js App Router application. Versioned routes begin under `/api/v1`. The foundation includes only a non-business health route for runtime verification; modules, middleware, services, repositories, configuration, and utility boundaries are reserved under `src/`.
