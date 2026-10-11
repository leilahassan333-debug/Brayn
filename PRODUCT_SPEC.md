Build a private web application for independent creative freelancers, especially graphic designers and brand strategists.
PRODUCT PURPOSE
Help freelancers organize existing client projects, understand brand briefs, plan their work, generate presentations from completed designs, and manage client meetings and scheduled emails.
Use Slack as a reference for the workspace structure: persistent sidebar, compact navigation, project conversations and a central work area. Give the application its own visual identity.
This is a personal workspace. Clients communicate through email and meeting links. They do not access the freelancer’s dashboard. Do not add public profiles, freelancer discovery, a marketplace or team collaboration.
FIRST ACTION
Inspect the existing project. Preserve its established stack if there is one; otherwise use Next.js, TypeScript and Tailwind CSS.
Save this product brief in PRODUCT_SPEC.md. Create a phased implementation plan, then implement Phase 1 and run it locally.
DESIGN
Create a polished desktop-first interface with:
- A persistent left sidebar.
- A calendar-centered Home screen.
- Clear project navigation.
- Compact, readable layouts.
- Subtle colors and consistent typography.
- Accessible controls and responsive layouts.
- Clear empty, loading, error and success states.
Use attached screenshots as visual references. Make reasonable reversible design decisions where details are unspecified.
SIDEBAR
Home
Projects
Activity
Strategy
Brief
Meetings
Include profile/settings access for presentation preferences, working hours and connected services.
HOME
Show all project deadlines, tasks, meetings and personal commitments in one calendar.
Provide year, month, week and agenda views.
Include a “Plan my week” action. It should consider working hours, deadlines, priority, task duration, meetings, personal commitments and breaks.
Propose schedule changes for review. Never apply a revised schedule without user approval. Flag overloaded weeks and suggest what to postpone.
PROJECTS
Users can create and edit projects containing:
- Client details.
- Project description and status.
- Deadlines and priority.
- User-entered tasks with duration estimates.
- Uploaded files and meeting notes.
- Private project conversations.
- Strategies and presentations.
Users enter their own tasks. AI may suggest tasks, but users choose which to add.
STRATEGY
Users select project notes and files, then click “Create a strategy.”
Generate:
- An understanding of the supplied brief.
- Brand direction.
- Tone of voice.
- USPs.
- Brand pillars.
- Distinctiveness and uniqueness.
Flag missing information. Let the user supply it or explicitly allow an assumption. Keep assumptions visibly labeled.
Save the generated result immediately to the private dashboard, linked to its project. Support editing and version history.
BRIEF
“Brief” is the user-facing name for the presentation of completed creative work. It is separate from Strategy.
Explain this distinction with short help text.
Users upload completed designs, visual references and supporting text. Assemble them into a client presentation using their saved presentation style.
Preserve uploaded artwork. Do not redesign it, change colors, distort it or crop away important content.
Save the generated presentation to the dashboard. Support preview, editable slide text and ordering, and real PowerPoint/PDF downloads. Implement deeper visual slide editing as a later phase.
PRESENTATION ONBOARDING
Ask:
- What type of creative work do you do?
- What tone should your presentations use?
- Which presentation style do you prefer?
Provide template previews and customization of fonts, colors and layout preferences.
Save the chosen style as the default for future projects. Use an actual template behind each style, rather than only a descriptive prompt.
ACTIVITY
Show project statuses, task completions, generated outputs and upcoming deadlines. Every activity item links to its project.
MEETINGS
Show upcoming meetings and help users offer available calendar slots to clients.
Provide email-based acceptance or decline without exposing the private workspace.
Handle time zones, recheck availability before booking and prevent double bookings.
Add Zoom links when the Zoom connection is configured.
EMAIL
Users write or approve each email, select its recipient and choose when it should send.
Support drafts, scheduled messages, cancellation and delivery status.
Scheduling must work even when the browser is closed. Handle retries without sending duplicate messages.
ORIGINALITY CHECKER — LATER PHASE
Plan for checking multiple uploaded images/designs, text and font information.
Report similarities with sources and uncertainty. Do not claim that visual similarity proves plagiarism or that an unidentified font is licensed.
Do not simulate search results or licensing checks.
BUILD PHASES
Phase 1: Interactive dashboard prototype using clearly labeled demo data. Make project creation, task editing, calendar navigation, project selection and presentation-style selection work. Show previews for future integrations without claiming real generation or sending.
Phase 2: Authentication, database and private uploads. Replace demo persistence with real saved data.
Phase 3: Project-grounded strategy generation and template-based presentation generation, with background processing, progress, failures, retries and saved outputs.
Phase 4: Weekly planning, scheduled email, calendar booking and Zoom integration.
Phase 5: Originality tools and deeper presentation editing.
TECHNICAL REQUIREMENTS
- Keep provider credentials on the server.
- Isolate every user’s records and files.
- Maintain project-specific AI context.
- Use background jobs for long-running work.
- Verify current provider documentation before integrations.
- If a service is not configured, show that honestly.
- Separate demo mode from live mode.
- Preserve completed features between phases.
PHASE 1 IS COMPLETE WHEN
I can create a project, add/edit tasks, navigate calendar views, open project details, view activity and save a presentation-style preference.
Run appropriate checks and inspect the interface in a browser. Provide launch instructions and clearly state what is functional versus awaiting integration.
## Architecture requirement (October 11, 2026)

Use Next.js, TypeScript and Tailwind CSS. Prioritize a functional, maintainable MVP with a simple, replaceable visual design. All UI components should be modular and reusable. Keep presentation separate from business rules, persistence and API integrations. Centralize colors, typography, spacing and borders in design tokens. Future Figma/Builder.io redesigns must be able to replace the frontend without rebuilding core functionality. Version-control all source through GitHub.
