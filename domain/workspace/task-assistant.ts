import type { TaskDraft, WorkspaceState } from "./models";
import { addDays, dateKey, parseDate } from "./calendar";
import { upsertTask, type Operation, ValidationError } from "./commands";

export type TaskRequest = {
  action: "create" | "edit" | "assign" | "reschedule";
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  title?: string;
  date?: string;
  assignee?: string;
  priority?: "Low" | "Medium" | "High";
};
export type TaskProposal = {
  projectId: string;
  projectName: string;
  action: TaskRequest["action"];
  taskId?: string;
  expected?: string;
  draft: TaskDraft;
};
export type AssistantReply =
  | { kind: "help"; message: string }
  | {
      kind: "question";
      message: string;
      field: "project" | "task" | "date" | "assignee" | "title";
      request: TaskRequest;
    }
  | { kind: "proposal"; proposal: TaskProposal };
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const clean = (value: string) =>
  value
    .trim()
    .replace(/^["“']|["”']$/g, "")
    .trim();

export function resolveTaskDate(
  value: string,
  today: string,
): string | undefined {
  const text = value
    .toLowerCase()
    .trim()
    .replace(/[.!?]$/, "");
  const absolute = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  if (absolute)
    return dateKey(parseDate(absolute)) === absolute ? absolute : undefined;
  if (text === "today") return today;
  if (text === "tomorrow") return dateKey(addDays(parseDate(today), 1));
  const day = text.match(
    /^(next )?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/,
  );
  if (day) {
    const target = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ].indexOf(day[2]);
    let offset = (target - parseDate(today).getDay() + 7) % 7;
    if (day[1]) offset = offset || 7;
    return dateKey(addDays(parseDate(today), offset));
  }
}

export function readTaskRequest(
  message: string,
  today: string,
): TaskRequest | undefined {
  const text = message.trim().replace(/[.!?]$/, "");
  const action = /^(?:please )?(add|create)\b/i.test(text)
    ? "create"
    : /^(?:please )?(reschedule|move|postpone)\b/i.test(text)
      ? "reschedule"
      : /^(?:please )?assign\b/i.test(text)
        ? "assign"
        : /^(?:please )?(edit|rename|change|update)\b/i.test(text)
          ? "edit"
          : undefined;
  if (!action) return;
  let body = text.replace(
    /^(?:please )?(add|create|reschedule|move|postpone|assign|edit|rename|change|update)\s+(?:a\s+)?(?:task\s+)?(?:to\s+)?/i,
    "",
  );
  const request: TaskRequest = { action };
  const due = body.match(
    /\s+(?:by|due(?: on)?|on|to)\s+(\d{4}-\d{2}-\d{2}|today|tomorrow|(?:next )?(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday))(?=\s+(?:in|for)\b|$)/i,
  );
  if (due) {
    request.date = resolveTaskDate(due[1], today);
    body = body.replace(due[0], "");
  }
  const projectHint = body.match(/\s+(?:in|for)\s+(.+)$/i);
  if (projectHint) {
    request.projectName = clean(projectHint[1]);
    body = body.slice(0, projectHint.index).trim();
  }
  const priority = body.match(
    /\s+(?:(?:with|to)\s+)?(low|medium|high)\s+priority\b/i,
  );
  if (priority) {
    request.priority = (priority[1][0].toUpperCase() +
      priority[1].slice(1).toLowerCase()) as TaskRequest["priority"];
    body = body.replace(priority[0], "");
  }
  if (action === "assign") {
    const assigned = body.match(/^(.*?)\s+to\s+(.+)$/i);
    if (assigned) {
      body = assigned[1];
      request.assignee = clean(assigned[2]);
    }
  }
  if (action === "edit") {
    const renamed = body.match(/^(.*?)\s+to\s+(.+)$/i);
    if (renamed) {
      body = renamed[1];
      request.title = clean(renamed[2]);
    }
  }
  if (action === "create") request.title = clean(body);
  else request.taskName = clean(body);
  return request;
}

export function prepareTaskChange(
  request: TaskRequest,
  state: WorkspaceState,
  currentProjectId?: string,
): AssistantReply {
  const question = (
    field: "project" | "task" | "date" | "assignee" | "title",
    message: string,
  ): AssistantReply => ({ kind: "question", field, message, request });
  let text =
    request.action === "create"
      ? (request.title ?? "")
      : (request.taskName ?? "");
  // Explicit "in/for PROJECT" takes precedence over the current page.
  const explicit = text.match(/\s+(?:in|for)\s+(.+)$/i);
  const hint = request.projectName ?? explicit?.[1];
  let projectId = request.projectId;
  if (hint && !projectId) {
    const matches = state.projects.filter(
      (p) =>
        normalize(p.name) === normalize(hint) ||
        normalize(p.client) === normalize(hint),
    );
    if (matches.length !== 1)
      return question(
        "project",
        "Which project should I use? Choose its name below.",
      );
    projectId = matches[0].id;
    if (explicit) text = text.slice(0, explicit.index).trim();
  } else if (explicit) text = text.slice(0, explicit.index).trim();
  if (!projectId) projectId = currentProjectId;
  if (!projectId && request.action !== "create") {
    const matches = state.projects.filter((p) =>
      p.tasks.some((t) => normalize(t.title) === normalize(text)),
    );
    if (matches.length === 1) projectId = matches[0].id;
  }
  if (!projectId && state.projects.length === 1)
    projectId = state.projects[0].id;
  if (!projectId)
    return question(
      "project",
      "Which project should I use? Choose its name below.",
    );
  const project = state.projects.find((p) => p.id === projectId);
  if (!project)
    return question(
      "project",
      "That project is unavailable. Choose a project.",
    );
  request = { ...request, projectId };
  let task;
  if (request.action !== "create") {
    let matches = project.tasks.filter((t) =>
      request.taskId
        ? t.id === request.taskId
        : normalize(t.title) === normalize(text),
    );
    if (!matches.length && !request.taskId && normalize(text))
      matches = project.tasks.filter((t) =>
        normalize(t.title).includes(normalize(text)),
      );
    if (matches.length !== 1)
      return {
        kind: "question",
        field: "task",
        message: "Which task should I change? Choose a task below.",
        request,
      };
    task = matches[0];
  }
  if (request.action === "create" && !text)
    return {
      kind: "question",
      field: "title",
      message: "What should the task be called?",
      request,
    };
  if (
    (request.action === "create" || request.action === "reschedule") &&
    !request.date
  )
    return {
      kind: "question",
      field: "date",
      message: "When is it due? Enter a date, Friday, today or tomorrow.",
      request,
    };
  if (request.action === "assign" && !request.assignee)
    return {
      kind: "question",
      field: "assignee",
      message: "Who should this task be assigned to?",
      request,
    };
  if (
    request.action === "edit" &&
    !request.title &&
    !request.priority &&
    !request.date
  )
    return {
      kind: "question",
      field: "title",
      message: "What is the new task name?",
      request,
    };
  const draft: TaskDraft = {
    title: request.action === "create" ? text : (request.title ?? task!.title),
    date: request.date ?? task!.date,
    duration: task?.duration ?? 1,
    assignee: request.assignee ?? task?.assignee ?? "",
    priority: request.priority ?? task?.priority ?? "Medium",
  };
  return {
    kind: "proposal",
    proposal: {
      projectId,
      projectName: project.name,
      action: request.action,
      taskId: task?.id,
      expected: task ? JSON.stringify(task) : undefined,
      draft,
    },
  };
}

export function applyTaskProposal(
  state: WorkspaceState,
  proposal: TaskProposal,
  operation: Operation,
): WorkspaceState {
  if (proposal.taskId) {
    const task = state.projects
      .find((p) => p.id === proposal.projectId)
      ?.tasks.find((t) => t.id === proposal.taskId);
    if (JSON.stringify(task) !== proposal.expected)
      throw new ValidationError(
        "This task changed after the preview. Ask again to review the latest version.",
      );
  }
  return upsertTask(
    state,
    proposal.projectId,
    proposal.draft,
    operation,
    proposal.taskId,
  );
}
