import { TaskList } from "./task-list";
import { selectProjectProgress } from "@/domain/workspace/selectors";
import { Panel } from "@/components/ui/panel";
import {
  CalendarDays,
  LayoutTemplate,
  Plus,
  Settings2,
  Sparkles,
} from "lucide-react";
import { parseDate } from "@/domain/workspace/calendar";
import { PageHeading } from "@/components/ui/page-heading";
import { Empty } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function ProjectScreen({
  setModal,
  setEditProject,
  setEditTask,
  projectTab,
  setProjectTab,
  project,
  go,
  toggleTask,
  saveNotes,
  saveMessage,
}: Pick<
  WorkspaceController,
  | "setModal"
  | "setEditProject"
  | "setEditTask"
  | "projectTab"
  | "setProjectTab"
  | "project"
  | "go"
  | "toggleTask"
  | "saveNotes"
  | "saveMessage"
>) {
  const { completed, total } = selectProjectProgress(project);
  return (
    <>
      <PageHeading
        eyebrow={project.client.toUpperCase()}
        title={project.name}
        description={project.description}
        action={
          <Button
            variant="secondary"
            onClick={() => {
              setEditProject(project);
              setModal("project");
            }}
          >
            <Settings2 size={16} />
            Edit project
          </Button>
        }
      />
      <div className="project-meta">
        <span className={`status ${project.color}`}>{project.status}</span>
        <span>
          <CalendarDays size={16} />
          Due{" "}
          {parseDate(project.deadline).toLocaleDateString("en", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span>{project.priority} priority</span>
        <span>
          {completed}/{total} tasks done
        </span>
      </div>
      <div className="project-tabs">
        {["Tasks", "Notes", "Conversation", "Files & outputs"].map((t) => (
          <button
            className={projectTab === t ? "active" : ""}
            onClick={() => setProjectTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <Panel className="detail-panel">
        {projectTab === "Tasks" && (
          <>
            <div className="section-heading">
              <div>
                <h2>One step at a time</h2>
                <p>Your tasks, your way. Add what matters to this project.</p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setEditTask(null);
                  setModal("task");
                }}
              >
                <Plus size={16} />
                Add task
              </Button>
            </div>
            <TaskList
              tasks={project.tasks}
              onToggle={toggleTask}
              onEdit={(task) => {
                setEditTask(task);
                setModal("task");
              }}
            />
          </>
        )}
        {projectTab === "Notes" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveNotes(
                project.id,
                String(new FormData(e.currentTarget).get("notes") ?? ""),
              );
            }}
            key={project.id}
          >
            <h2>Project notes</h2>
            <p className="section-description">
              Keep discoveries and meeting notes close to the work.
            </p>
            <Field label="Private notes">
              <textarea name="notes" defaultValue={project.notes} rows={8} />
            </Field>
            <Button variant="primary" type="submit">
              Save notes
            </Button>
          </form>
        )}
        {projectTab === "Conversation" && (
          <>
            <h2>A conversation with your ideas</h2>
            <p className="section-description">
              Private project messages. Clients cannot see this space.
            </p>
            {project.conversation.map((text, i) => (
              <div className="conversation" key={i}>
                <span className="avatar mini">J</span>
                <div>
                  <strong>
                    You <span>· Private note</span>
                  </strong>
                  <p>{text}</p>
                </div>
              </div>
            ))}
            <form
              className="conversation-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                if (
                  saveMessage(
                    project.id,
                    String(new FormData(form).get("message") ?? ""),
                  )
                )
                  form.reset();
              }}
            >
              <Field label="A thought worth keeping">
                <textarea
                  name="message"
                  placeholder="Capture a thought, a question, a next step…"
                  required
                  rows={3}
                />
              </Field>
              <Button variant="primary" type="submit">
                Add private message
              </Button>
            </form>
          </>
        )}
        {projectTab === "Files & outputs" && (
          <>
            <Empty
              title="A home for the finished work"
              description="Private file uploads and saved creative outputs arrive in Phases 2 and 3. No files have been uploaded."
            />
            <div className="button-row">
              <Button variant="secondary" onClick={() => go("Strategy")}>
                <Sparkles size={16} />
                Explore Strategy
              </Button>
              <Button variant="secondary" onClick={() => go("Brief")}>
                <LayoutTemplate size={16} />
                Explore Brief
              </Button>
            </div>
          </>
        )}
      </Panel>
      <div className="client-info">
        <span className="tiny-label">CLIENT DETAILS</span>
        <strong>{project.client}</strong>
        <span>{project.email || "No email added"}</span>
        <span>Clients stay outside your private workspace.</span>
      </div>
    </>
  );
}
