import { PageHeading } from "@/components/ui/page-heading";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import type { WorkspaceController } from "@/application/use-workspace-controller";
export function FilesScreen({
  data,
  openProject,
  go,
}: Pick<WorkspaceController, "data" | "openProject" | "go">) {
  return (
    <>
      <PageHeading
        eyebrow="PROJECT FILES"
        title="Open project files."
        description="Access each project’s files and outputs. File uploads are not connected yet; explore strategy and presentation previews from the Files menu."
      />
      <Panel className="detail-panel">
        <h2>Files and outputs</h2>
        {data.projects.map((project) => (
          <div className="group-task-row" key={project.id}>
            <div>
              <strong>{project.name}</strong>
              <small>{project.client} · No uploaded files</small>
            </div>
            <Button variant="secondary" onClick={() => openProject(project.id)}>
              Open project
            </Button>
          </div>
        ))}
        <div className="button-row">
          <Button variant="secondary" onClick={() => go("Strategy")}>
            Brand Strategy
          </Button>
          <Button variant="secondary" onClick={() => go("Brief")}>
            Design Presentation
          </Button>
        </div>
      </Panel>
    </>
  );
}
