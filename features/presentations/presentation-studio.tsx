"use client";
import { useState } from "react";
import { Plus, Upload, ArrowUp, ArrowDown } from "lucide-react";
import type { StudioController } from "@/application/presentations/use-studio";
import { templates } from "@/domain/presentations/models";
import { PageHeading } from "@/components/ui/page-heading";
import { Panel } from "@/components/ui/panel";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
export function PresentationStudio(studio: StudioController) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const p = studio.selected;
  const feedback = (
    <>
      {studio.error && (
        <p className="error-banner" role="alert">
          {studio.error}
        </p>
      )}
      {studio.message && (
        <p className="studio-message" role="status">
          {studio.message}
        </p>
      )}
      {studio.busy && (
        <p role="status" className="studio-message">
          Working… Keep this page open.
        </p>
      )}
    </>
  );
  if (!studio.configured)
    return (
      <>
        <PageHeading
          eyebrow="DESIGN PRESENTATION"
          title="Create your presentations."
          description="Upload content, choose a template, generate slides, then download PowerPoint or PDF."
        />
        <Panel className="detail-panel">
          <h2>Connect your presentation storage</h2>
          <p className="section-description">
            Supabase must be configured before private uploads and saved
            presentations are available. Set the project URL and publishable key
            in Vercel, apply the database setup, then redeploy.
          </p>
        </Panel>
      </>
    );
  if (!studio.user)
    return (
      <>
        <PageHeading
          eyebrow="PRIVATE PRESENTATION STUDIO"
          title="Sign in to your presentations."
          description="Your uploads and presentations are private to your account."
        />
        <Panel className="detail-panel studio-auth">
          {feedback}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void studio.login(email, password);
            }}
          >
            <fieldset disabled={studio.busy}>
              <Field label="Email address">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <div className="button-row">
                <Button type="submit">Sign in</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (email && password.length >= 8)
                      void studio.signup(email, password);
                  }}
                >
                  Create account
                </Button>
              </div>
              <p className="section-description">
                Use at least eight characters for your password. New accounts
                may require email confirmation before sign-in.
              </p>
            </fieldset>
          </form>
        </Panel>
      </>
    );
  const patch = (value: Partial<NonNullable<typeof p>>) => {
    if (p) studio.setSelected({ ...p, ...value });
  };
  return (
    <>
      <PageHeading
        eyebrow="DESIGN PRESENTATION"
        title={p ? p.title : "Your presentations."}
        description="Upload your content, choose a template and generate a presentation. Review the slides before downloading PowerPoint or PDF."
        action={
          <Button
            variant="secondary"
            onClick={() => void studio.logout()}
            disabled={studio.busy}
          >
            Sign out
          </Button>
        }
      />
      {feedback}
      {!p ? (
        <>
          <div className="section-heading">
            <h2>Saved presentations</h2>
            <Button onClick={() => setCreating(true)} disabled={studio.busy}>
              <Plus size={18} />
              New presentation
            </Button>
          </div>
          {creating && (
            <Panel className="detail-panel">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (title.trim() && (await studio.create(title.trim()))) {
                    setCreating(false);
                    setTitle("");
                  }
                }}
              >
                <Field label="Presentation name">
                  <input
                    required
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </Field>
                <div className="button-row">
                  <Button type="submit" disabled={studio.busy}>
                    Create presentation
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setCreating(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Panel>
          )}
          <div className="presentation-gallery">
            {studio.presentations.map((item) => (
              <button
                className="presentation-card"
                key={item.id}
                onClick={() => studio.setSelected(item)}
                disabled={studio.busy}
              >
                <div
                  className={`deck-thumbnail deck-${item.template.toLowerCase()}`}
                >
                  <span>{item.template}</span>
                  <strong>{item.slides[0]?.title ?? item.title}</strong>
                  <i />
                </div>
                <h3>{item.title}</h3>
                <p>
                  {item.slides.length
                    ? `${item.slides.length} slides`
                    : "Draft"}{" "}
                  · {new Date(item.updated_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
          {!studio.presentations.length && (
            <Panel className="detail-panel">
              <h3>No presentations yet</h3>
              <p className="section-description">
                Create your first presentation. Saved drafts and generated
                slides will appear here.
              </p>
            </Panel>
          )}
        </>
      ) : (
        <fieldset className="studio-editor" disabled={studio.busy}>
          <div className="button-row">
            <Button
              variant="secondary"
              onClick={async () => {
                await studio.save();
              }}
            >
              Save changes
            </Button>
            <Button
              variant="link"
              onClick={async () => {
                if (await studio.save()) studio.setSelected(null);
              }}
            >
              Back to gallery
            </Button>
          </div>
          <Panel className="detail-panel">
            <h2>1. Upload your content</h2>
            <Field label="Presentation title">
              <input
                maxLength={150}
                required
                value={p.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </Field>
            <Field label="Notes and instructions">
              <textarea
                maxLength={20000}
                rows={5}
                value={p.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                placeholder="Add the project brief, context, key messages and any information the presentation should include."
              />
            </Field>
            <Field label="Upload photos or supporting files">
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,text/plain,application/pdf"
                onChange={(e) => {
                  if (e.target.files?.length)
                    void studio.upload(Array.from(e.target.files));
                  e.target.value = "";
                }}
              />
            </Field>
            <p className="section-description">
              <Upload size={14} /> PNG, JPG, WebP, TXT and PDF · Up to 12 files,
              10 MB per file, 25 MB total. Original artwork is preserved.
            </p>
            <div className="studio-assets">
              {p.assets.map((asset) => (
                <div key={asset.id}>
                  {studio.urls[asset.id] ? (
                    <img src={studio.urls[asset.id]} alt={asset.name} />
                  ) : (
                    <span>
                      {asset.type === "application/pdf" ? "PDF" : "File"}
                    </span>
                  )}
                  <small>{asset.name}</small>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="detail-panel">
            <h2>2. Choose a template</h2>
            <div className="studio-template-grid">
              {templates.map((template) => (
                <button
                  type="button"
                  key={template}
                  className={`studio-template ${p.template === template ? "selected" : ""}`}
                  aria-pressed={p.template === template}
                  onClick={() => patch({ template })}
                >
                  <div
                    className={`deck-thumbnail deck-${template.toLowerCase()}`}
                  >
                    <span>{template}</span>
                    <strong>Your presentation</strong>
                    <i />
                  </div>
                  <strong>{template}</strong>
                </button>
              ))}
            </div>
          </Panel>
          <Panel className="detail-panel">
            <h2>3. Generate your presentation</h2>
            <p className="section-description">
              Generate editable slides from the supplied content. This sends
              your selected uploads and notes to OpenAI. Check generated text
              for accuracy before sharing. Regenerating replaces the saved
              slides.
            </p>
            <Button
              onClick={() => void studio.generate()}
              disabled={!p.notes.trim() && !p.assets.length}
            >
              {p.slides.length ? "Regenerate slides" : "Generate presentation"}
            </Button>
          </Panel>
          {!!p.slides.length && (
            <Panel className="detail-panel">
              <div className="section-heading">
                <h2>4. Review and edit slides</h2>
                <div className="button-row">
                  <Button onClick={() => void studio.download("pptx")}>
                    Download PowerPoint
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => void studio.download("pdf")}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
              <div className="studio-slides">
                {p.slides.map((slide, index) => (
                  <div className="slide-editor" key={index}>
                    <div className="section-heading">
                      <h3>Slide {index + 1}</h3>
                      <div className="button-row">
                        <Button
                          variant="icon"
                          aria-label={`Move slide ${index + 1} up`}
                          disabled={index === 0}
                          onClick={() => {
                            const slides = [...p.slides];
                            [slides[index - 1], slides[index]] = [
                              slides[index],
                              slides[index - 1],
                            ];
                            patch({ slides });
                          }}
                        >
                          <ArrowUp size={16} />
                        </Button>
                        <Button
                          variant="icon"
                          aria-label={`Move slide ${index + 1} down`}
                          disabled={index === p.slides.length - 1}
                          onClick={() => {
                            const slides = [...p.slides];
                            [slides[index], slides[index + 1]] = [
                              slides[index + 1],
                              slides[index],
                            ];
                            patch({ slides });
                          }}
                        >
                          <ArrowDown size={16} />
                        </Button>
                      </div>
                    </div>
                    <Field label={`Slide ${index + 1} title`}>
                      <input
                        maxLength={100}
                        value={slide.title}
                        onChange={(e) =>
                          patch({
                            slides: p.slides.map((s, i) =>
                              i === index ? { ...s, title: e.target.value } : s,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field label={`Slide ${index + 1} text`}>
                      <textarea
                        rows={4}
                        maxLength={600}
                        value={slide.body}
                        onChange={(e) =>
                          patch({
                            slides: p.slides.map((s, i) =>
                              i === index ? { ...s, body: e.target.value } : s,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field label={`Slide ${index + 1} image`}>
                      <select
                        value={slide.assetIds[0] ?? ""}
                        onChange={(e) =>
                          patch({
                            slides: p.slides.map((s, i) =>
                              i === index
                                ? {
                                    ...s,
                                    assetIds: e.target.value
                                      ? [e.target.value]
                                      : [],
                                  }
                                : s,
                            ),
                          })
                        }
                      >
                        <option value="">No image</option>
                        {p.assets
                          .filter((a) => a.type.startsWith("image/"))
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                      </select>
                    </Field>
                    {slide.assetIds[0] && studio.urls[slide.assetIds[0]] && (
                      <img
                        className="slide-artwork"
                        src={studio.urls[slide.assetIds[0]]}
                        alt={`Artwork for slide ${index + 1}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={() => void studio.save()}>
                Save presentation
              </Button>
            </Panel>
          )}
        </fieldset>
      )}
    </>
  );
}
