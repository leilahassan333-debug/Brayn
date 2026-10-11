# Future server integrations

The Phase 1 MVP intentionally has no live backend or provider clients. Shared business rules are already in `domain/workspace`; storage is behind `application/workspace-repository.ts`.

In Phase 2, add authentication and user-scoped database/storage services here. Mark implementation modules with `import 'server-only'`, validate and authorize requests on the server, and expose only safe operations through Next.js route handlers/server actions. Provider credentials stay server-side. Do not import these modules from visual components.

Later integrations must use durable background processing and project-specific context, and must not pretend to work until configured and tested. See [the architecture guide](../docs/ARCHITECTURE.md).
