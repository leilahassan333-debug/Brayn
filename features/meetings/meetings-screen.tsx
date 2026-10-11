import { Panel } from "@/components/ui/panel";
import {
  ArrowRight,
  CalendarDays,
  MessageSquare,
  Plus,
  Video,
} from "lucide-react";
import { parseDate } from "@/domain/workspace/calendar";
import { PageHeading } from "@/components/ui/page-heading";
import { Button } from "@/components/ui/button";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function MeetingsScreen({
  setModal,
  events,
  openProject,
}: Pick<WorkspaceController, "setModal" | "events" | "openProject">) {
  return (
    <>
      <PageHeading
        eyebrow="MAKE TIME FOR GOOD CONVERSATIONS"
        title="Let’s find a moment."
        description="Client conversations, without opening up your private workspace."
        action={
          <Button variant="primary" onClick={() => setModal("booking")}>
            <Plus size={16} />
            Preview availability
          </Button>
        }
      />
      <div className="notice">
        <Video size={18} />
        <span>
          Demo meetings · Calendar, email acceptance and Zoom are not connected.
        </span>
      </div>
      <Panel className="detail-panel">
        <h2>Sample upcoming meetings</h2>
        {events
          .filter((e) => e.type === "Meetings")
          .map((e) => (
            <div className="meeting-row" key={e.id}>
              <div className="meeting-date">
                <span>
                  {parseDate(e.date).toLocaleDateString("en", {
                    month: "short",
                  })}
                </span>
                <strong>{parseDate(e.date).getDate()}</strong>
              </div>
              <div>
                <strong>{e.title}</strong>
                <small>{e.time} · America/New_York · 30 min · Demo</small>
              </div>
              <Button
                variant="secondary"
                onClick={() => e.projectId && openProject(e.projectId)}
              >
                Open project
                <ArrowRight size={14} />
              </Button>
            </div>
          ))}
      </Panel>
      <div className="integration-cards">
        <Panel as="div">
          <CalendarDays />
          <h3>Calendar connection</h3>
          <p>
            Availability checks and double-booking protection are planned for
            Phase 4.
          </p>
          <span className="integration-badge">Not configured</span>
        </Panel>
        <Panel as="div">
          <Video />
          <h3>Zoom connection</h3>
          <p>
            Meeting links will be added only when your Zoom account is
            connected.
          </p>
          <span className="integration-badge">Not configured</span>
        </Panel>
        <Panel as="div">
          <MessageSquare />
          <h3>Scheduled email</h3>
          <p>
            Approved drafts, durable delivery, cancellation and retries arrive
            in Phase 4.
          </p>
          <Button variant="link" onClick={() => setModal("email")}>
            Preview the workflow
            <ArrowRight size={14} />
          </Button>
        </Panel>
      </div>
    </>
  );
}
