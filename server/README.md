# Server integrations

`presentations/` validates Supabase bearer sessions, enforces owner-scoped access,
requests structured slide content from OpenAI, and exports PowerPoint/PDF files.
Provider modules are server-only. Browser code uses the Supabase publishable key;
no service-role key is required. Keep OPENAI_API_KEY server-side.

Apply the migration and follow [the setup guide](../docs/PRESENTATIONS.md) before use.
Workspace projects/tasks remain the existing browser-storage demo; the live backend
currently covers presentations and their private uploaded assets only.
