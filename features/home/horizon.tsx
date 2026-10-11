import type { WorkspaceController } from "@/application/use-workspace-controller";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { parseDate } from "@/domain/workspace/calendar";
export function Horizon({
  due,
  openProject,
  go,
}: Pick<WorkspaceController, "due" | "openProject" | "go">) {
  return (
    <Panel className="up-next">
      <div className="section-heading">
        <h2>Upcoming tasks</h2>
        <span className="tiny-label">TASKS</span>
      </div>
      {due.map((t) => (
        <button
          key={t.id}
          className="horizon-item"
          onClick={() => openProject(t.project.id)}
        >
          <span className={`horizon-indicator ${t.project.color}`}>
            <span />
          </span>
          <div>
            <strong>{t.title}</strong>
            <small>
              {t.project.client} <span>·</span>{" "}
              {parseDate(t.date).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })}
            </small>
          </div>
          <ArrowRight size={14} />
        </button>
      ))}
      {!due.length && (
        <p className="empty">No open tasks. Create a task in a project to plan your next action.</p>
      )}
      <Button variant="link" onClick={() => go("Projects")}>
        See all projects <ArrowRight size={14} />
      </Button>
    </Panel>
  );
}
