# Edit the Home page with Builder.io

Brayn uses Builder's React SDK and Page model for the Home page body. The sidebar,
header, dialogs and other pages remain in code. Without a public API key, matching
published content, or a successful content request, the original Home page renders.

## Connect your Space

1. Create a Builder.io account and a Space for Brayn. Use the visual content editor
   (Publish), which supports SDK integrations. Product names and menu labels may vary.
2. Find the Space's **public API key** in its settings. No private or write key is needed.
3. On your Mac, update Brayn with `git pull`, then install dependencies with `npm ci`.
4. Copy `.env.example` to `.env.local` in the Brayn folder. Set
   `NEXT_PUBLIC_BUILDER_API_KEY=your_public_space_key`. This local file is ignored by Git.
5. Restart `npm run dev`. Keep it running while editing.
6. Create a Page entry targeting URL path `/` and set the editor's preview URL to
   `http://localhost:3000`. Open Builder in the same Mac browser that can reach this URL.
   Allow local-network access if your browser requests it. Builder cannot access this
   laptop server from another machine; if embedding localhost fails, use a deployed
   HTTPS preview of Brayn with the same configuration.

## Design the layout

Builder does not import the existing page as editable layers. Start a new layout
using its built-in text, image, box and column blocks, then insert these registered
components from the custom components list:

- **Brayn Page Heading:** edit the title, description, eyebrow and create-project label.
- **Brayn Overview Stats:** live project and task counts.
- **Brayn Calendar:** calendar views, filters and event navigation.
- **Brayn Upcoming Tasks:** project links for open tasks.
- **Brayn Project Overview:** functional project cards.
- **Brayn Focus Card:** the existing focus panel.

Arrange, size and style their outer containers in Builder. Internal calendar controls,
project cards and other block internals still use Brayn's code and design tokens.
For the current structure, place stats below the heading and use columns for the
calendar and right rail. Keep calendar, project links and a create-project action in
any replacement layout so those actions remain accessible.

Draft changes appear in the editor preview. Publishing a Page activates that layout
on the connected app; publishing Builder content does not deploy Brayn itself.
Content fetched by an already-open page is refreshed on reload. Delete/unpublish the
entry or remove the environment key and restart to restore the code-based Home page.

## Data and credentials

Only public design content is fetched from Builder. Brayn does not intentionally send
workspace records to Builder as content data or publish them into its content model.
Built-in analytics tracking is disabled. The editor iframe can display the current
browser's demo data; use sample data when designing. Do not put client information,
credentials or project notes into published Builder text blocks. Future production
use still needs Brayn's own authentication and backend; Builder is a layout editor.

## Verify the integration

`npm run test:e2e` checks the native workspace. The dedicated Builder tests mock CDN
responses and require a server configured with a dummy public key:

```bash
NEXT_PUBLIC_BUILDER_API_KEY=brayn-public-test-key npm run dev -- --port 3002
```

In a separate terminal:

```bash
TEST_BUILDER=true TEST_BASE_URL=http://localhost:3002 npx playwright test tests/e2e/builder.spec.ts
```

Stop any existing development server for this checkout before starting the test server.
