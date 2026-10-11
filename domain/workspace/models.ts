export type Task = {
  id: string;
  title: string;
  date: string;
  duration: number;
  done: boolean;
};
export type Project = {
  id: string;
  name: string;
  client: string;
  email: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  color: string;
  tasks: Task[];
  notes: string;
  conversation: string[];
};
export type Activity = {
  id: string;
  projectId: string;
  text: string;
  at: string;
};
export type Preferences = {
  work: string;
  tone: string;
  style: string;
  font: string;
  color: string;
  start: string;
  end: string;
};
export type WorkspaceState = {
  projects: Project[];
  activity: Activity[];
  preferences: Preferences;
};

export type ProjectDraft = Pick<
  Project,
  | "name"
  | "client"
  | "email"
  | "description"
  | "status"
  | "priority"
  | "deadline"
>;
export type TaskDraft = Pick<Task, "title" | "date" | "duration">;
export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  color: string;
  projectId?: string;
  type: string;
  time?: string;
};
export type CalendarView = "Year" | "Month" | "Week" | "Agenda";
