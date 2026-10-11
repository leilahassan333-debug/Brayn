# Architecture and redesign guide

Brayn is a Next.js App Router application using TypeScript and Tailwind CSS 4. The current MVP is an interactive, browser-persisted **demo**. The architecture preserves Phase 1 behavior while making presentation replaceable. No cloud backend, authentication or live integrations are claimed.

## Dependency direction

```text
app/page.tsx (Next.js server entry)
  └─ components/workspace.tsx (client composition root)
       ├─ application/use-workspace-controller.ts (actions + view state)
       │    ├─ domain/workspace/* (pure rules, validation and selectors)
       │    └─ application/workspace-repository.ts (persistence port)
       ├─ infrastructure/demo/* (browser adapter + explicit sample data)
       └─ features/* and components/* (props + callback rendering)
```

- **Domain**: typed projects, tasks, activity and preferences; commands validate before immutable updates; identifiers and timestamps are supplied by the caller. Calendar calculations and selectors run without React, DOM, storage or providers. These functions can also run on a future server.
- **Application**: coordinates domain commands, optimistic in-memory state, serialized persistence, loading/storage errors, selected project, calendar navigation and dialog state. It depends on the repository interface, not a concrete browser/database/provider implementation.
- **Infrastructure**: `BrowserWorkspaceRepository` resolves local storage lazily, validates saved records and retains the existing `brayn-demo-v1` format. Sample meetings and projects stay here, outside the rules. This adapter is replaceable and tests use an injected fake storage implementation.
- **Presentation**: feature screens accept typed data and action callbacks. Shared buttons, panels, accessible fields, dialogs, empty states and notifications live in `components/ui`. Sidebar, topbar and footer live in `components/layout`. Project cards, calendar views and presentation templates have dedicated components. Screens cannot access storage, provider SDKs or secrets.
- **Composition root**: `components/workspace.tsx` is the one place that wires the controller to the demo adapter and screens. Replace the adapter here when live storage is implemented.

`npm run check:boundaries` enforces the dependency direction. Unit tests verify the rules without mounting visual components; browser tests verify end-to-end behavior.

## Redesign using Figma or Builder.io

1. Change the theme in `styles/tokens.css`: semantic colors, font families and type scale, spacing, radii, border widths and shadows. Tailwind theme aliases share those variables (`bg-primary`, `text-foreground`, `font-sans`, `rounded-control`, etc.).
2. Replace shared primitives and shell components before replacing individual feature layouts. Preserve labels, keyboard behavior, data props and action callbacks. `Button` supports primary, secondary, icon and link variants; submit buttons explicitly use `type="submit"`.
3. Rebuild feature screens against the existing `WorkspaceController` slices, using plain props and callbacks. Figma/Builder output belongs in the presentation layer. Keep domain commands, repository ports and persisted data out of generated visual code.
4. Keep the composition root responsible for wiring state/actions. Presentation components can be previewed with ordinary fixture props; they do not need a live provider or database.
5. Run `npm run check`, `npm run build`, and `npm run test:e2e`. Theme replacement is browser-tested without changing project behavior.

`styles/base.css` supplies browser defaults, `styles/workspace.css` contains replaceable component classes, and `styles/responsive.css` contains layout adaptations. The illustrative shapes are disposable CSS. User-chosen presentation colors and fonts are **content preferences**, separate from the application's design tokens; redesigning the shell should not overwrite them. Layout templates and preview metadata live under `features/creative` and `features/settings`.

No Figma/Builder connection has been configured. The code is ready for those tools to supply visual components; no vendor is required for core functionality.

## Adding the real backend

Phase 2 must implement authentication, user-scoped persistence, private uploads and server-side authorization. Add providers under `server/` and route handlers/server actions under `app/`, keeping private modules marked `server-only`. The browser must never receive provider keys or make privileged provider requests.

The current repository port reads/writes a demo workspace aggregate. A live adapter must translate changes into authenticated server operations, validate them again, isolate the authenticated user's data, handle version conflicts and enforce transactions. Do not expose a raw full-workspace overwrite endpoint that trusts client-supplied ownership. Domain rules are reusable; durable storage and concurrency controls are additional Phase 2 responsibilities.

AI context must remain project-specific. Generation, scheduling, email and booking need durable background jobs, status and idempotency; calendar booking also needs atomic availability checks. Verify provider documentation when implementing each integration. No fake provider responses or placeholder credentials are present in this MVP.

## GitHub workflow

The repository includes `.github/workflows/ci.yml`. Pushes to `main` and pull requests run type checks, architectural checks, domain/storage tests, a production build, and Chromium browser tests against the production server. Branches and PRs can be used for future feature or visual changes. Generated outputs, dependencies, browser traces and environment files are excluded from Git.
