import StudioRoot from "@/integrations/presentations/studio-root";
export default function Page() {
  return (
    <main className="presentation-route">
      <a href="/" className="text-link">
        ← Back to workspace
      </a>
      <StudioRoot />
    </main>
  );
}
