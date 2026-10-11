import type { WorkspaceController } from "@/application/use-workspace-controller";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/features/projects/project-card";
export function ProjectOverview({
  data,
  openProject,
  go,
}: Pick<WorkspaceController, "data" | "openProject" | "go">) {
  return (
    <section className="project-section">
      <div className="section-heading">
        <div>
          <h2>
            Your projects{" "}
            <span className="muted-count">{data.projects.length}</span>
          </h2>
          <p>Review project status and open the work you need.</p>
        </div>
        <Button variant="link" onClick={() => go("Projects")}>
          All projects <ArrowRight size={15} />
        </Button>
      </div>
      <div className="project-grid">
        {data.projects.slice(0, 3).map((p) => (
          <ProjectCard key={p.id} project={p} open={() => openProject(p.id)} />
        ))}
      </div>
    </section>
  );
}
