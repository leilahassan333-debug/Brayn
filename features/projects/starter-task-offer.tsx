import { suggestedTasks } from "@/domain/workspace/starter-tasks";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import type { WorkspaceController } from "@/application/use-workspace-controller";
export function StarterTaskOffer({
  project,
  starterProjectId,
  setStarterProjectId,
  acceptStarterTasks,
}: Pick<
  WorkspaceController,
  "project" | "starterProjectId" | "setStarterProjectId" | "acceptStarterTasks"
>) {
  if (!project || project.id !== starterProjectId) return null;
  return (
    <Panel className="detail-panel starter-task-offer">
      <h2>Add starter tasks?</h2>
      <p className="section-description">
        Review the suggested workflow for {project.name}. Nothing is added until
        you accept. Edit any name or due date afterward.
      </p>
      <ol>
        {suggestedTasks(project.startDate!).map((task) => (
          <li key={task.title}>
            <strong>{task.title}</strong>
            <span>Due {task.date}</span>
          </li>
        ))}
      </ol>
      <div className="button-row">
        <Button onClick={acceptStarterTasks}>Add suggested tasks</Button>
        <Button variant="secondary" onClick={() => setStarterProjectId(null)}>
          Skip starter tasks
        </Button>
      </div>
    </Panel>
  );
}
