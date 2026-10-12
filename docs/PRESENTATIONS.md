# Connect the presentation studio

The studio is available under Files → Design Presentation when Supabase is configured,
and directly at `/presentations`. Existing workspace demo data stays in browser storage;
presentations and their uploaded assets use Supabase and require sign-in.

## Apply database and storage rules

1. Open your Brayn Supabase project → SQL Editor → New query.
2. Copy the complete contents of `supabase/migrations/20261012_presentations.sql`.
3. Run it once. It creates the presentation table, owner-only row security, private
   bucket policies, and a generation rate limit. If it reports a policy/table already
   exists, do not repeatedly run it; review which statements previously succeeded.
4. Confirm `presentation-assets` remains private. Review any pre-existing storage
   policies: remove policies allowing public or unrestricted authenticated access to
   this bucket. PostgreSQL permissive policies combine with OR; a new private policy
   cannot override an old broad policy.

## Account settings

In Supabase Authentication → URL Configuration, use your deployed Brayn origin as
Site URL and add `https://brayn-five.vercel.app/presentations` to allowed redirect URLs
(replace the hostname if your domain differs). Use exact allowed origins/paths for
preview deployments. Email confirmation links return to the studio. Ensure Email
sign-in is enabled. Create an account in the studio, confirm the email if required,
then sign in. This adds account privacy to presentations; it does not migrate demo
workspace projects to a live backend.

## Vercel configuration

These environment variables must be present for the deployment being built:

- `NEXT_PUBLIC_SUPABASE_URL`: root Project URL, without `/rest/v1/`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable or legacy anon key.
- `OPENAI_API_KEY`: server-only Secret, with API billing and Responses API access.
- `OPENAI_PRESENTATION_MODEL`: optional; defaults to `gpt-4.1-mini`.

Redeploy after setting public variables; Next.js embeds them at build time. No
Supabase service-role credential is required. Set an OpenAI project spending budget
appropriate for your use. Generation requires sign-in and is limited to one request
per 30 seconds and twenty requests per account per rolling day; failed provider
attempts count toward the limit. The app does not offer billing or paid-user limits.

## Workflow and current limits

Create a named presentation → upload PNG/JPG/WebP images, TXT or PDF source files →
add notes → choose Editorial, Minimal or Expressive → generate → edit slide text,
image selection and order → save → download editable PowerPoint and PDF. The gallery
contains actual saved records, including drafts, rather than sample generated decks.
Uploads are limited to twelve files, ten MB each and twenty-five MB total. DOCX,
video and other file types are not supported yet. Each slide can contain one uploaded
image, displayed with its original aspect ratio; text remains editable in PowerPoint.

Generating sends the selected notes and files to OpenAI. Structured slide results
are validated against the presentation's uploaded image IDs before saving. Existing
slides remain untouched if generation fails or the record changes during generation.
Review all generated claims and missing information before sharing.

PDF is rendered directly from the same slide content and template, rather than by
converting the PowerPoint. Both outputs preserve artwork; PDF typography may differ
from PowerPoint's installed fonts. PDF uses embedded DejaVu fonts (license included
under `server/presentations/fonts`). No separate PDF service is required. Downloads
are generated on request, not stored as exported files. Generation runs synchronously
within a sixty-second Vercel function window; the browser must stay open. A durable
job queue, collaborative editing, file deletion, and advanced slide layouts are future
work. Back to gallery saves current changes before leaving.

Live provider behavior and database policies require verification in your Supabase
project: sign in with two different accounts, verify that each sees only its own
presentations and cannot read the other's storage paths, then generate a small test
deck and open both downloaded formats. Local mocked tests cannot prove your deployed
Supabase policy configuration or OpenAI billing status.
