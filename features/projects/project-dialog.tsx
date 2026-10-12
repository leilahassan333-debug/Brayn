import { ArrowRight } from "lucide-react";
import { dateKey } from "@/domain/workspace/calendar";
import { projectFormValues } from "@/features/projects/form-values";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function ProjectDialog({
  formError,
  editProject,
  close,
  saveProject,
}: Pick<
  WorkspaceController,
  "formError" | "editProject" | "close" | "saveProject"
>) {
  return (
    <Modal
      title={editProject ? "Edit project" : "Create project"}
      close={close}
    >
      <p className="section-description">
        Set the client, scope, deadline and priority. Add tasks and notes after
        creating the project.
      </p>
      {formError && (
        <div className="error-banner" role="alert">
          {formError}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveProject(projectFormValues(e.currentTarget));
        }}
      >
        <Field label="Project name">
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={editProject?.name}
            placeholder="Give your project a name"
            autoFocus
          />
        </Field>
        <div className="form-grid">
          <Field label="Client name">
            <input
              name="client"
              required
              maxLength={80}
              defaultValue={editProject?.client}
              placeholder="Client or company name"
            />
          </Field>
          <Field label="Client email">
            <input
              name="email"
              type="email"
              defaultValue={editProject?.email}
              placeholder="hello@client.com"
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            name="description"
            maxLength={1000}
            defaultValue={editProject?.description}
            placeholder="Describe the scope and expected deliverables."
            rows={3}
          />
        </Field>
        <div className="form-grid">
          <Field label="Deadline">
            <input
              name="deadline"
              type="date"
              required
              defaultValue={editProject?.deadline ?? dateKey(new Date())}
            />
          </Field>
          <Field label="Priority">
            <select
              name="priority"
              defaultValue={editProject?.priority ?? "Medium"}
            >
              {["Low", "Medium", "High"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Project start date">
          <input
            name="startDate"
            type="date"
            required
            defaultValue={editProject?.startDate ?? dateKey(new Date())}
          />
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={editProject?.status ?? "In progress"}
          >
            {["In progress", "Review", "On hold", "Completed"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {editProject ? "Save project" : "Create project"}
            <ArrowRight size={15} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
