import { Panel } from "@/components/ui/panel";
import { Check, CheckCircle2 } from "lucide-react";
import { styles } from "@/features/settings/presentation-styles";
import { Template } from "@/features/creative/template-preview";
import { PageHeading } from "@/components/ui/page-heading";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function SettingsScreen({
  preferences,
  setPreferences,
  savePreferences,
}: Pick<
  WorkspaceController,
  "preferences" | "setPreferences" | "savePreferences"
>) {
  return (
    <>
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title="A workspace that feels like you."
        description="Your preferences, carried into your next creative chapter."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          savePreferences(preferences);
        }}
      >
        <Panel className="detail-panel">
          <div className="section-heading">
            <div>
              <h2>Your presentation style</h2>
              <p>
                Choose a real layout template. Artwork will always stay intact.
              </p>
            </div>
            <span className="tiny-label">BRIEF DEFAULTS</span>
          </div>
          <div className="form-grid">
            <Field label="What kind of creative work do you do?">
              <select
                value={preferences.work}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    work: e.target.value,
                  })
                }
              >
                {[
                  "Brand identity & design",
                  "Brand strategy",
                  "Graphic design",
                  "Illustration",
                  "Multidisciplinary creative",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="What tone feels right?">
              <select
                value={preferences.tone}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    tone: e.target.value,
                  })
                }
              >
                {[
                  "Warm & thoughtful",
                  "Clear & confident",
                  "Playful & expressive",
                  "Formal & polished",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="template-grid">
            {styles.map((s) => (
              <button
                type="button"
                aria-label={s.name + " presentation style"}
                aria-pressed={preferences.style === s.name}
                className={`template-option ${preferences.style === s.name ? "chosen" : ""}`}
                key={s.name}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    style: s.name,
                    font: s.font,
                  })
                }
              >
                <Template style={s.name} />
                <div>
                  <strong>{s.name}</strong>
                  {preferences.style === s.name && <CheckCircle2 size={17} />}
                  <p>{s.description}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="form-grid">
            <Field label="Presentation font">
              <select
                aria-label="Presentation font"
                value={preferences.font}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    font: e.target.value,
                  })
                }
              >
                {["Georgia", "Arial", "Trebuchet MS"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Accent color">
              <input
                type="color"
                value={preferences.color}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    color: e.target.value,
                  })
                }
              />
            </Field>
          </div>
          <div className="live-template">
            <div>
              <h3>Your customized preview</h3>
              <p>Layout, typography and accent color update here.</p>
            </div>
            <Template
              style={preferences.style}
              font={preferences.font}
              color={preferences.color}
            />
          </div>
          <div className="settings-hours">
            <h3>Working hours</h3>
            <p>
              Monday–Friday · America/New_York. Weekly planning is a Phase 4
              preview.
            </p>
            <div className="form-grid">
              <Field label="Start">
                <input
                  type="time"
                  value={preferences.start}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      start: e.target.value,
                    })
                  }
                  required
                />
              </Field>
              <Field label="Finish">
                <input
                  type="time"
                  value={preferences.end}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      end: e.target.value,
                    })
                  }
                  min={preferences.start}
                  required
                />
              </Field>
            </div>
          </div>
          <Button variant="primary" type="submit">
            <Check size={17} />
            Save preferences
          </Button>
        </Panel>
      </form>
      <Panel className="connected-services">
        <h2>Connected services</h2>
        <p>
          Calendar, Zoom, email and AI providers are not configured. No
          credentials are needed for this demo.
        </p>
        <span className="integration-badge">
          Live integrations arrive in later phases
        </span>
      </Panel>
    </>
  );
}
