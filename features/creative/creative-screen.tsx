import { Panel } from "@/components/ui/panel";
import { LayoutTemplate, Sparkles, AlertCircle } from "lucide-react";
import { Template } from "@/features/creative/template-preview";
import { PageHeading } from "@/components/ui/page-heading";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function CreativeScreen({
  data,
  page,
  selected,
  setSelected,
  setModal,
  setPreferences,
  go,
}: Pick<
  WorkspaceController,
  | "data"
  | "page"
  | "selected"
  | "setSelected"
  | "setModal"
  | "setPreferences"
  | "go"
>) {
  return (
    <>
      <PageHeading
        eyebrow={
          page === "Strategy"
            ? "THE THINKING BEHIND THE WORK"
            : "GIVE YOUR WORK ITS MOMENT"
        }
        title={
          page === "Strategy"
            ? "Start with a little direction."
            : "Good work. Beautifully presented."
        }
        description={
          page === "Strategy"
            ? "Strategy is for defining the thinking behind a brand before you start designing: its audience, positioning, brand pillars and tone of voice. Choose a project to explore the planned workflow and the information it needs. This is a preview; AI analysis and strategy generation are not connected yet."
            : "Brief is for presenting finished creative work to a client. Choose a project and preview how your saved template, font and colors could frame the presentation. It currently shows sample content; artwork uploads, generated presentations and PowerPoint or PDF exports are not connected yet."
        }
        action={
          <span className="integration-badge">
            Phase 3 · Integration preview
          </span>
        }
      />
      <div className="output-grid">
        <Panel className="detail-panel">
          <Field label="Choose a project">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {data.projects.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.client} — {p.name}
                </option>
              ))}
            </select>
          </Field>
          <h2>
            {page === "Strategy"
              ? "A clearer starting point"
              : "Your work stays yours"}
          </h2>
          <p className="section-description">
            {page === "Strategy"
              ? "Future strategy generation will use only the notes and files you select for this project, and flag gaps before making assumptions."
              : "Upload completed designs in a later phase. Your presentation will preserve artwork, proportions and colors, using your actual chosen layout template."}
          </p>
          <div className="preview-note">
            <AlertCircle size={17} />
            <div>
              <strong>
                {page === "Strategy"
                  ? "Information to clarify"
                  : "No artwork uploaded"}
              </strong>
              <p>
                {page === "Strategy"
                  ? "Audience, competitors and differentiators need to be confirmed. No AI analysis has been run."
                  : "This is a template preview using abstract sample shapes, not generated work. PowerPoint and PDF export are not connected yet."}
              </p>
            </div>
          </div>
          {page === "Strategy" ? (
            <div className="strategy-list">
              {[
                "Brief understanding",
                "Brand direction & tone of voice",
                "USPs & brand pillars",
                "Distinctiveness & missing information",
              ].map((t, i) => (
                <div key={t}>
                  <span>0{i + 1}</span>
                  {t}
                  <span className="tiny-label">PLANNED</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="style-summary">
              <LayoutTemplate size={22} />
              <div>
                <strong>{data.preferences.style} presentation</strong>
                <small>
                  {data.preferences.tone} · {data.preferences.font}
                </small>
              </div>
              <Button
                variant="link"
                onClick={() => {
                  setPreferences(data.preferences);
                  go("Settings");
                }}
              >
                Change style
              </Button>
            </div>
          )}
          <Button
            variant="primary"
            onClick={() => setModal(page === "Strategy" ? "strategy" : "brief")}
          >
            <Sparkles size={16} />
            {page === "Strategy"
              ? "Preview strategy workflow"
              : "Preview presentation workflow"}
          </Button>
        </Panel>
        <section className="presentation-preview">
          {page === "Brief" ? (
            <>
              <Template
                style={data.preferences.style}
                font={data.preferences.font}
                color={data.preferences.color}
              />
              <p>Saved style preview · Sample content</p>
            </>
          ) : (
            <div className="strategy-preview">
              <span className="tiny-label">THE BIG PICTURE</span>
              <h2>
                Every good brand
                <br />
                starts with a<br />
                <em>good question.</em>
              </h2>
              <span className="strategy-star">✳</span>
              <p>What makes this brand matter?</p>
              <span className="tiny-label">
                WORKFLOW PREVIEW · NO GENERATED OUTPUT
              </span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
