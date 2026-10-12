import { TaskOverview } from "./task-overview";
import { Panel } from "@/components/ui/panel";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { parseDate } from "@/domain/workspace/calendar";
import { PageHeading } from "@/components/ui/page-heading";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function ActivityScreen({
  data,
  activity,
  activeProjects,
  openProject,
  editProjectTask,
  toggleProjectTask,
}: Pick<
  WorkspaceController,
  | "data"
  | "activity"
  | "activeProjects"
  | "openProject"
  | "editProjectTask"
  | "toggleProjectTask"
>) {
  return (
    <>
      <PageHeading
        eyebrow="TRACK YOUR PROGRESS"
        title="Review workspace activity."
        description="Review project updates, completed tasks and saved notes. Check what changed, identify approaching deadlines and open the related project to follow up."
      />
      <TaskOverview
        data={data}
        openProject={openProject}
        editProjectTask={editProjectTask}
        toggleProjectTask={toggleProjectTask}
      />
      <Panel className="detail-panel">
        <h2>Workspace activity</h2>
        <p className="section-description">
          Demo project updates, task completions and upcoming deadlines.
        </p>
        {activity.map((a) => {
          const p = data.projects.find((p) => p.id === a.projectId);
          return (
            <button
              className="activity-row"
              key={a.id}
              onClick={() => openProject(a.projectId)}
            >
              <span className={`metric-icon ${p?.color ?? "purple"}-bg`}>
                <CheckCircle2 size={18} />
              </span>
              <div>
                <strong>{a.text}</strong>
                <small>
                  {p?.client} ·{" "}
                  {new Date(a.at).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              </div>
              <ArrowRight size={16} />
            </button>
          );
        })}
        <h3 className="upcoming-title">Upcoming deadlines</h3>
        {activeProjects.map((p) => (
          <button
            className="activity-row"
            key={p.id}
            onClick={() => openProject(p.id)}
          >
            <span className={`metric-icon ${p.color}-bg`}>
              <CalendarDays size={18} />
            </span>
            <div>
              <strong>{p.name}</strong>
              <small>
                {p.client} · Due{" "}
                {parseDate(p.deadline).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })}
              </small>
            </div>
            <ArrowRight size={16} />
          </button>
        ))}
      </Panel>
    </>
  );
}
