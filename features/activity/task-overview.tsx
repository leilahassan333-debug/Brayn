import type { WorkspaceController } from "@/application/use-workspace-controller";
import { parseDate } from "@/domain/workspace/calendar";
import { selectProjectProgress } from "@/domain/workspace/selectors";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export function TaskOverview({
  data,
  openProject,
  editProjectTask,
  toggleProjectTask,
}: Pick<
  WorkspaceController,
  "data" | "openProject" | "editProjectTask" | "toggleProjectTask"
>) {
  return (
    <>
      <Panel className="detail-panel task-overview">
        <h2>Task overview</h2>
        <p className="section-description">
          Review every task. Progress shows completed tasks out of the project’s
          total.
        </p>
        <div className="task-overview-scroll">
          <table className="task-overview-table">
            <thead>
              <tr>
                {[
                  "Status",
                  "Priority",
                  "Project progress",
                  "Task description",
                  "Client",
                  "Due date",
                  "Actions",
                ].map((label) => (
                  <th key={label} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.projects.flatMap((project) => {
                const { completed, total } = selectProjectProgress(project);
                return project.tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <button
                        className="task-status-control"
                        aria-label={`${task.done ? "Reopen" : "Complete"} ${task.title}`}
                        aria-pressed={task.done}
                        onClick={() => toggleProjectTask(project.id, task)}
                      >
                        {task.done ? "Completed" : "Open"}
                      </button>
                    </td>
                    <td>
                      <span
                        className={`task-priority priority-${(task.priority ?? "Medium").toLowerCase()}`}
                      >
                        {task.priority ?? "Medium"}
                      </span>
                    </td>
                    <td>
                      {completed}/{total}
                    </td>
                    <td>
                      <strong>{task.title}</strong>
                      {task.assignee && (
                        <small>Assigned to {task.assignee}</small>
                      )}
                    </td>
                    <td>
                      <button
                        className="text-link"
                        onClick={() => openProject(project.id)}
                      >
                        {project.client}
                      </button>
                    </td>
                    <td>
                      <time dateTime={task.date}>
                        {parseDate(task.date).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        compact
                        onClick={() => editProjectTask(project.id, task)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
        {!data.projects.some((p) => p.tasks.length) && (
          <p className="section-description">
            No tasks yet. Add tasks from a project or use the task assistant.
          </p>
        )}
      </Panel>
      <section
        className="project-task-groups"
        aria-label="Tasks grouped by project"
      >
        <h2>Tasks by project</h2>
        {data.projects.map((project, index) => (
          <Panel
            key={project.id}
            className={`detail-panel stagger-group stagger-${index % 3}`}
          >
            <div className="section-heading">
              <div>
                <h3>{project.name}</h3>
                <p>{project.client}</p>
              </div>
              <Button variant="link" onClick={() => openProject(project.id)}>
                Open project
              </Button>
            </div>
            {project.tasks.map((task) => (
              <div className="group-task-row" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.done}
                  aria-label={`${task.done ? "Reopen" : "Complete"} ${task.title} in ${project.name}`}
                  onChange={() => toggleProjectTask(project.id, task)}
                />
                <div>
                  <strong>{task.title}</strong>
                  <small>
                    {task.priority ?? "Medium"} priority · Due {task.date}
                    {task.assignee ? ` · ${task.assignee}` : ""}
                  </small>
                </div>
                <Button
                  variant="secondary"
                  compact
                  onClick={() => editProjectTask(project.id, task)}
                >
                  Edit task
                </Button>
              </div>
            ))}
            {!project.tasks.length && (
              <p className="section-description">No tasks in this project.</p>
            )}
          </Panel>
        ))}
      </section>
    </>
  );
}
