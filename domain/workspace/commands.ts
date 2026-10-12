import type {
  Activity,
  Preferences,
  Project,
  ProjectDraft,
  Task,
  TaskDraft,
  WorkspaceState,
} from "./models";
import { dateKey, parseDate } from "./calendar";

// Pure rules: no React, browser APIs, network clients, or persistence.
export class ValidationError extends Error {}
export type Operation = { id: string; activityId: string; at: string };
const statuses = ["In progress", "Review", "On hold", "Completed"];
const priorities = ["Low", "Medium", "High"];
function text(value: string, name: string, limit: number, required = true) {
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.length > limit
  )
    throw new ValidationError(
      `${name} must ${required ? "contain text and " : ""}be at most ${limit} characters.`,
    );
  return value.trim();
}
function validDate(value: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(parseDate(value).getTime()) ||
    dateKey(parseDate(value)) !== value
  )
    throw new ValidationError("Choose a valid date.");
  return value;
}
function requireProject(state: WorkspaceState, id: string) {
  const project = state.projects.find((p) => p.id === id);
  if (!project) throw new ValidationError("This project could not be found.");
  return project;
}
function record(
  state: WorkspaceState,
  projectId: string,
  message: string,
  op: Operation,
): WorkspaceState {
  const activity: Activity = {
    id: op.activityId,
    projectId,
    text: message,
    at: op.at,
  };
  return { ...state, activity: [activity, ...state.activity] };
}
export function upsertProject(
  state: WorkspaceState,
  input: ProjectDraft,
  op: Operation,
  projectId?: string,
): WorkspaceState {
  const existing = projectId ? requireProject(state, projectId) : undefined;
  if (!statuses.includes(input.status) || !priorities.includes(input.priority))
    throw new ValidationError("Choose a valid project status and priority.");
  const email = text(input.email, "Email", 254, false);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ValidationError("Enter a valid client email.");
  const project: Project = {
    ...input,
    id: existing?.id ?? op.id,
    name: text(input.name, "Project name", 100),
    client: text(input.client, "Client name", 80),
    email,
    description: text(input.description, "Description", 1000, false),
    deadline: validDate(input.deadline),
    startDate: validDate(
      input.startDate ?? existing?.startDate ?? op.at.slice(0, 10),
    ),
    color:
      existing?.color ??
      ["purple", "orange", "green"][state.projects.length % 3],
    tasks: existing?.tasks ?? [],
    notes: existing?.notes ?? "",
    conversation: existing?.conversation ?? [],
  };
  const next = {
    ...state,
    projects: existing
      ? state.projects.map((p) => (p.id === project.id ? project : p))
      : [...state.projects, project],
  };
  return record(
    next,
    project.id,
    `${existing ? "Updated" : "Created"} ${project.name}`,
    op,
  );
}
export function upsertTask(
  state: WorkspaceState,
  projectId: string,
  input: TaskDraft,
  op: Operation,
  taskId?: string,
): WorkspaceState {
  const project = requireProject(state, projectId);
  const existing = taskId
    ? project.tasks.find((t) => t.id === taskId)
    : undefined;
  if (taskId && !existing)
    throw new ValidationError("This task could not be found.");
  if (
    !Number.isFinite(input.duration) ||
    input.duration < 0.25 ||
    input.duration > 100 ||
    input.duration % 0.25 !== 0
  )
    throw new ValidationError(
      "Task duration must be 0.25–100 hours in quarter-hour increments.",
    );
  const priority = input.priority ?? existing?.priority ?? "Medium";
  if (!priorities.includes(priority))
    throw new ValidationError("Choose a valid task priority.");
  const task: Task = {
    ...input,
    id: existing?.id ?? op.id,
    title: text(input.title, "Task name", 150),
    priority,
    assignee: text(
      input.assignee ?? existing?.assignee ?? "",
      "Assignee",
      80,
      false,
    ),
    date: validDate(input.date),
    done: existing?.done ?? false,
  };
  const tasks = existing
    ? project.tasks.map((t) => (t.id === task.id ? task : t))
    : [...project.tasks, task];
  return record(
    {
      ...state,
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, tasks } : p,
      ),
    },
    projectId,
    `${existing ? "Edited" : "Added"} task: ${task.title}`,
    op,
  );
}
export function toggleTaskCompletion(
  state: WorkspaceState,
  projectId: string,
  taskId: string,
  op: Operation,
): WorkspaceState {
  const project = requireProject(state, projectId);
  const task = project.tasks.find((t) => t.id === taskId);
  if (!task) throw new ValidationError("This task could not be found.");
  const next = {
    ...state,
    projects: state.projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === taskId ? { ...t, done: !t.done } : t,
            ),
          }
        : p,
    ),
  };
  return record(
    next,
    projectId,
    `${task.done ? "Reopened" : "Completed"} ${task.title}`,
    op,
  );
}
export function updateProjectNotes(
  state: WorkspaceState,
  projectId: string,
  input: string,
  op: Operation,
): WorkspaceState {
  requireProject(state, projectId);
  const notes = text(input, "Notes", 20000, false);
  return record(
    {
      ...state,
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, notes } : p,
      ),
    },
    projectId,
    "Updated project notes",
    op,
  );
}
export function addProjectMessage(
  state: WorkspaceState,
  projectId: string,
  input: string,
  op: Operation,
): WorkspaceState {
  requireProject(state, projectId);
  const message = text(input, "Message", 5000);
  return record(
    {
      ...state,
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, conversation: [...p.conversation, message] }
          : p,
      ),
    },
    projectId,
    "Added a private project message",
    op,
  );
}
export function updatePreferences(
  state: WorkspaceState,
  input: Preferences,
): WorkspaceState {
  if (
    !["Editorial", "Minimal", "Expressive"].includes(input.style) ||
    !["Georgia", "Arial", "Trebuchet MS"].includes(input.font) ||
    !/^#[a-fA-F0-9]{6}$/.test(input.color)
  )
    throw new ValidationError(
      "Choose a valid presentation style, font and accent color.",
    );
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.start) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.end) ||
    input.start >= input.end
  )
    throw new ValidationError("Working hours must finish after they start.");
  return {
    ...state,
    preferences: {
      ...input,
      work: text(input.work, "Creative discipline", 100),
      tone: text(input.tone, "Tone", 100),
    },
  };
}
