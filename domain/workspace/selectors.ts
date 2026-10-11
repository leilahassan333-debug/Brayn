import type { CalendarEvent, Project, WorkspaceState } from "./models";
export const selectTasks = (state: WorkspaceState) =>
  state.projects.flatMap((project) =>
    project.tasks.map((task) => ({ ...task, project })),
  );
export const selectOpenTasks = (state: WorkspaceState) =>
  selectTasks(state)
    .filter((task) => !task.done)
    .sort((a, b) => a.date.localeCompare(b.date));
export const selectProjectProgress = (project: Project) => {
  const completed = project.tasks.filter((task) => task.done).length;
  return {
    completed,
    total: project.tasks.length,
    percent: project.tasks.length
      ? Math.round((completed / project.tasks.length) * 100)
      : 0,
  };
};
export function selectCalendarEvents(
  state: WorkspaceState,
  additionalEvents: CalendarEvent[] = [],
): CalendarEvent[] {
  return [
    ...selectOpenTasks(state).map((task) => ({
      id: task.id,
      date: task.date,
      title: task.title,
      color: task.project.color,
      projectId: task.project.id,
      type: "Tasks",
    })),
    ...state.projects
      .filter((project) => project.status !== "Completed")
      .map((project) => ({
        id: project.id + "deadline",
        date: project.deadline,
        title: project.client + " deadline",
        color: project.color,
        projectId: project.id,
        type: "Deadlines",
      })),
    ...additionalEvents.filter(
      (event) =>
        !event.projectId ||
        state.projects.some((project) => project.id === event.projectId),
    ),
  ];
}
export const searchProjects = (projects: Project[], query: string) =>
  projects.filter((p) =>
    (p.name + " " + p.client)
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
export const selectActivity = (state: WorkspaceState) =>
  [...state.activity].sort((a, b) => b.at.localeCompare(a.at));

export const selectActiveProjects = (state: WorkspaceState) =>
  state.projects.filter((project) => project.status !== "Completed");
export const selectOverview = (
  state: WorkspaceState,
  events: CalendarEvent[],
) => ({
  activeProjects: selectActiveProjects(state).length,
  openTasks: selectOpenTasks(state).length,
  upcomingMeetings: events.filter((event) => event.type === "Meetings").length,
});
