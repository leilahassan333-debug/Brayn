# Brayn implementation plan

1. **Interactive demo (current)** — establish Next.js, TypeScript and Tailwind; create the private workspace shell, unified calendar with year/month/week/agenda navigation, projects and editable tasks, linked activity, and persistent presentation preferences. Use browser-local, explicitly demo persistence. Preview Strategy, Brief, Meetings and planning honestly. Validate production build and browser workflows.
2. **Private foundation** — authentication, user-scoped database and authorization, private object storage with signed access, upload validation, durable activity and migrations. Replace local demo storage without losing Phase 1 behavior.
3. **Creative outputs** — verify provider documentation; server-only credentials; project-grounded strategy with missing-information and assumption review, immediate save and version history. Actual style templates, artwork-preserving layout, editable slide text/order, real PPTX/PDF export. Durable jobs, progress, retries and failures.
4. **Work orchestration** — review-before-apply weekly scheduling using working hours, estimates, priorities, commitments and breaks. Provider calendars, timezone-aware availability and atomic booking; private email accept/decline links. Approved scheduled email via durable jobs and idempotent delivery, cancellation/status. Configured Zoom connections.
5. **Deeper tools** — source-backed originality checks across visual/text/font inputs, explicit uncertainty and no fabricated results or licensing claims; advanced slide editing.

## Phase 1 boundaries
No authentication, cloud sync, file upload, AI generation, booking or email sending. Demo persistence is per browser and is unsuitable for sensitive client information. Future integration actions are labeled previews. No client dashboard, marketplace, public profile or team collaboration.

## Phase 1 architecture foundation

The functional prototype is now organized into pure domain rules, application controllers, a replaceable persistence port, the browser demo adapter, reusable UI primitives, and independent feature screens. Shared design tokens govern visual styling and Tailwind aliases. Existing local data remains compatible. The architecture guide documents redesign and future backend boundaries; GitHub CI validates domain rules, architectural boundaries, build and browser behavior.
