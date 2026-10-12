import { Check } from "lucide-react";
import type { Task } from "@/domain/workspace/models";
import { parseDate } from "@/domain/workspace/calendar";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty-state";
export function TaskList({
  tasks,
  onToggle,
  onEdit,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <>
      {tasks.map((t) => (
        <div className={`task-row ${t.done ? "done" : ""}`} key={t.id}>
          <button
            type="button"
            className="task-check"
            aria-label={`${t.done ? "Reopen" : "Complete"} ${t.title}`}
            aria-pressed={t.done}
            onClick={() => onToggle(t)}
          >
            {t.done && <Check size={15} />}
          </button>
          <div>
            <strong>{t.title}</strong>
            <small>
              {parseDate(t.date).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })}{" "}
              <span>·</span> {t.duration}h estimated
              {t.priority && <> · {t.priority} priority</>}
              {t.assignee && <> · Assigned to {t.assignee}</>}
            </small>
          </div>
          <Button variant="secondary" compact onClick={() => onEdit(t)}>
            Edit
          </Button>
        </div>
      ))}
      {!tasks.length && (
        <Empty
          title="No tasks yet"
          description="Add a task with a clear action, deadline and priority."
        />
      )}
    </>
  );
}
