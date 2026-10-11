import { Plus, Search } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { Empty } from "@/components/ui/empty-state";
import { ProjectCard } from "@/features/projects/project-card";
import { Button } from "@/components/ui/button";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function ProjectsScreen({
  data,
  query,
  setQuery,
  matchingProjects,
  openProject,
  createProject,
}: Pick<
  WorkspaceController,
  | "data"
  | "query"
  | "setQuery"
  | "matchingProjects"
  | "openProject"
  | "createProject"
>) {
  return (
    <>
      <PageHeading
        eyebrow="YOUR CREATIVE CORNER"
        title="Ideas, becoming real."
        description="Every project has a story. Keep yours together."
        action={
          <Button variant="primary" onClick={createProject}>
            <Plus size={17} />
            New project
          </Button>
        }
      />
      <div className="list-toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Search projects"
            placeholder="Find a project or client…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span>{data.projects.length} projects · private to you</span>
      </div>
      <div className="project-grid full">
        {matchingProjects.map((p) => (
          <ProjectCard key={p.id} project={p} open={() => openProject(p.id)} />
        ))}
      </div>
      {!matchingProjects.length && (
        <Empty
          title="No projects found"
          description="Try a different search, or start a new chapter."
        />
      )}
    </>
  );
}
