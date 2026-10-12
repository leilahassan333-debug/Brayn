# Brayn

A personal creative workspace for independent designers and brand strategists. Phase 1 is a functioning **demo prototype**, built with Next.js 16, React 19, TypeScript and Tailwind CSS 4.

## Run

Use Node.js 20.9 or later (the prepared environment has Node 24). From the existing checkout:

```bash
cd /workspace/Brayn
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run dev
```

The server listens on port 3000. Keep the terminal running. For production, run `npm run build`, then `npm run start`. No provider keys or environment variables are required for Phase 1.

## Verify

With the app running:

```bash
npm run typecheck
npm run test:e2e
npm run build
```

Browser tests use installed Chromium at `/usr/bin/chromium`. Override `CHROMIUM_PATH` if necessary and `TEST_BASE_URL` for another port. The default is `http://localhost:3000`. Development assets also allow `127.0.0.1`; other origins remain restricted by Next.js. Screenshots are saved to ignored `test-results/`.

## What works

- Create/edit projects with client details, description, status, priority and deadline.
- Add/edit tasks with estimates and planned dates; complete/reopen them.
- Navigate year, month, week and agenda calendars; filter events and open linked projects.
- Review project-linked activity and deadlines.
- Save private project notes and personal project messages.
- Choose Editorial, Minimal or Expressive presentation templates; customize font, accent color, tone and creative discipline, and save working hours.
- Responsive navigation, keyboard-accessible dialogs, save confirmations, search empty states, loading and browser storage error states.

Changes are saved to `localStorage` under `brayn-demo-v1`, per browser. The October 2026 sample projects, meetings and personal commitment are explicitly demo data. To reset the demo, remove that key using browser developer tools. Use sample information only: this prototype has no authentication, backend, cloud sync or secure private uploads yet.

Strategy, Brief generation/export, weekly planning, calendar/Zoom booking and email delivery show **honest future workflow previews**. They do not generate, upload, export, send or book anything. Scheduled email, private durable storage and provider integrations arrive in the later phases listed in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md). The full brief is preserved in [PRODUCT_SPEC.md](PRODUCT_SPEC.md).

## Maintainable frontend and redesigns

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for layer responsibilities, component replacement, shared design tokens and future server integration rules. Start visual changes in `styles/tokens.css`, shared UI in `components/ui`, the shell in `components/layout`, and individual layouts in `features/`. Business rules in `domain/workspace` do not depend on the visual components.

```bash
npm run check      # TypeScript, dependency boundaries and domain/storage tests
npm run build      # Production compilation
npm run test:e2e   # Browser workflows; starts a dev server if needed
```

GitHub Actions runs these checks on pushes to `main` and pull requests. The browser runner uses system Chromium when available, or Playwright's browser installation otherwise.

## Optional visual editing with Builder.io

The Home page supports Builder's visual content editor, with registered functional
Brayn blocks and a native layout fallback. Follow [the connection guide](docs/BUILDER.md)
to create a Space, configure its public API key and edit your first Page.

## Task workflow

Navigation follows Home → Activity → Projects → Files. Expand Files for Brand
Strategy, Design Presentation and Open Files. Meetings remain accessible from Home.
Activity includes a compact task table and offset project task groups; table progress
is the project's completed task count divided by its total. Task controls remain level.

New projects include a start date and offer five starter tasks. They are added only
when accepted. Suggested dates are start, +7, +14, +21 and +28 days; all are editable.
Legacy saved projects and tasks remain supported.

The side task assistant understands local task commands, with no external AI service
or API key. Try “Add a task to finish the mood board by Friday in Olive Studio”,
“Rename Moodboard exploration to Final moodboard”, “Assign Moodboard exploration to
Alex”, or “Reschedule Moodboard exploration to tomorrow”. It asks for missing projects,
tasks, due dates or names and always previews changes before confirmation. Ambiguous
matches require a selection. Dates support YYYY-MM-DD, today, tomorrow and weekday
names; the displayed absolute date is the one that will be saved. Use the task form
for other date formats. Unknown commands show guidance rather than changing data.
Assignment stores a name on the task; it does not create team accounts or notifications.
The demo still saves to this browser only. Stale edit previews are rejected so they
cannot overwrite subsequent changes.

## Private presentation generation

A Supabase-backed presentation studio adds a saved gallery, private uploads, three
templates, OpenAI generation, editable slides, and PowerPoint/PDF downloads. Follow
[the presentation setup guide](docs/PRESENTATIONS.md) to apply the SQL access rules,
configure authentication redirects and redeploy with the required environment values.
