import { ArrowRight, CalendarDays } from "lucide-react";
import type { Project } from "@/domain/workspace/models";
import { parseDate } from "@/domain/workspace/calendar";
import { selectProjectProgress } from "@/domain/workspace/selectors";

export function ProjectCard({
  project: p,
  open,
}: {
  project: Project;
  open: () => void;
}) {
  const { percent, completed, total } = selectProjectProgress(p);
  return (
    <button className={`project-card ${p.color}`} onClick={open}>
      <div className="project-card-top">
        <span className="client-symbol">
          <span className="client-initials">
            {p.client
              .split(/\s+/)
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </span>
        </span>
        <span className="status">{p.status}</span>
        <ArrowRight size={17} />
      </div>
      <div className="client-name">{p.client}</div>
      <h3>{p.name}</h3>
      <div className="project-progress">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="project-card-footer">
        <span>
          {completed} / {total} tasks
        </span>
        <span>
          <CalendarDays size={13} />
          {parseDate(p.deadline).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </button>
  );
}
