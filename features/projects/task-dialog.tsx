import { Check } from "lucide-react";
import { dateKey } from "@/domain/workspace/calendar";
import { taskFormValues } from "@/features/projects/form-values";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function TaskDialog({
  formError,
  date,
  editTask,
  close,
  saveTask,
}: Pick<
  WorkspaceController,
  "formError" | "date" | "editTask" | "close" | "saveTask"
>) {
  return (
    <Modal title={editTask ? "Edit task" : "Add task"} close={close}>
      {formError && (
        <div className="error-banner" role="alert">
          {formError}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveTask(taskFormValues(e.currentTarget));
        }}
      >
        <Field label="Task name">
          <input
            name="title"
            required
            maxLength={150}
            defaultValue={editTask?.title}
            placeholder="Name the action or deliverable"
            autoFocus
          />
        </Field>
        <div className="form-grid">
          <Field label="Planned date">
            <input
              name="date"
              type="date"
              required
              defaultValue={editTask?.date ?? dateKey(date)}
            />
          </Field>
          <Field label="Estimated hours">
            <input
              name="duration"
              type="number"
              required
              min="0.25"
              max="100"
              step="0.25"
              defaultValue={editTask?.duration ?? 1}
            />
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Task priority">
            <select
              name="priority"
              defaultValue={editTask?.priority ?? "Medium"}
            >
              {["Low", "Medium", "High"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Assignee">
            <input
              name="assignee"
              maxLength={80}
              defaultValue={editTask?.assignee ?? ""}
              placeholder="Name (optional)"
            />
          </Field>
        </div>
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save task
            <Check size={15} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
