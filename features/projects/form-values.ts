import type { ProjectDraft, TaskDraft } from "@/domain/workspace/models";
// Browser form adaptation only; domain validation accepts plain data.
export function projectFormValues(form: HTMLFormElement): ProjectDraft {
  const data = new FormData(form);
  const value = (key: string) => String(data.get(key) ?? "");
  return {
    name: value("name"),
    client: value("client"),
    email: value("email"),
    description: value("description"),
    status: value("status"),
    priority: value("priority"),
    deadline: value("deadline"),
    startDate: value("startDate"),
  };
}
export function taskFormValues(form: HTMLFormElement): TaskDraft {
  const data = new FormData(form);
  return {
    title: String(data.get("title") ?? ""),
    date: String(data.get("date") ?? ""),
    duration: Number(data.get("duration")),
    priority: String(data.get("priority") ?? "Medium") as TaskDraft["priority"],
    assignee: String(data.get("assignee") ?? ""),
  };
}
