import type { WorkspaceState } from "./models";
import { ValidationError, updatePreferences } from "./commands";
import { dateKey, parseDate } from "./calendar";
type RecordValue = Record<string, unknown>;
function object(value: unknown): asserts value is RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ValidationError("Invalid saved workspace.");
}
function strings(value: RecordValue, keys: string[]) {
  if (keys.some((key) => typeof value[key] !== "string"))
    throw new ValidationError("Invalid saved workspace fields.");
}
function date(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    isNaN(parseDate(value).getTime()) ||
    dateKey(parseDate(value)) !== value
  )
    throw new ValidationError("Invalid saved date.");
}
export function decodeWorkspace(value: unknown): WorkspaceState {
  object(value);
  if (!Array.isArray(value.projects) || !Array.isArray(value.activity))
    throw new ValidationError("Invalid saved workspace lists.");
  object(value.preferences);
  strings(value.preferences, [
    "work",
    "tone",
    "style",
    "font",
    "color",
    "start",
    "end",
  ]);
  const projectIds = new Set<string>();
  const taskIds = new Set<string>();
  const activityIds = new Set<string>();
  for (const project of value.projects) {
    object(project);
    strings(project, [
      "id",
      "name",
      "client",
      "email",
      "description",
      "status",
      "priority",
      "deadline",
      "color",
      "notes",
    ]);
    if (
      !project.id ||
      projectIds.has(project.id as string) ||
      !Array.isArray(project.tasks) ||
      !Array.isArray(project.conversation) ||
      project.conversation.some(
        (message: unknown) => typeof message !== "string",
      )
    )
      throw new ValidationError("Invalid saved project.");
    projectIds.add(project.id as string);
    date(project.deadline);
    for (const task of project.tasks) {
      object(task);
      strings(task, ["id", "title", "date"]);
      date(task.date);
      if (
        !task.id ||
        taskIds.has(task.id as string) ||
        typeof task.done !== "boolean" ||
        typeof task.duration !== "number" ||
        !Number.isFinite(task.duration) ||
        task.duration < 0.25 ||
        task.duration > 100
      )
        throw new ValidationError("Invalid saved task.");
      taskIds.add(task.id as string);
    }
  }
  for (const activity of value.activity) {
    object(activity);
    strings(activity, ["id", "projectId", "text", "at"]);
    if (
      !activity.id ||
      activityIds.has(activity.id as string) ||
      !projectIds.has(activity.projectId as string) ||
      Number.isNaN(new Date(activity.at as string).getTime())
    )
      throw new ValidationError("Invalid saved activity.");
    activityIds.add(activity.id as string);
  }
  const state = value as unknown as WorkspaceState;
  updatePreferences(state, state.preferences);
  return state;
}
