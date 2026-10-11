"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CalendarEvent,
  CalendarView,
  Preferences,
  Project,
  ProjectDraft,
  Task,
  TaskDraft,
  WorkspaceState,
} from "@/domain/workspace/models";
import {
  addProjectMessage,
  toggleTaskCompletion,
  updatePreferences,
  updateProjectNotes,
  upsertProject,
  upsertTask,
} from "@/domain/workspace/commands";
import { calendarTitle, moveCalendar } from "@/domain/workspace/calendar";
import {
  searchProjects,
  selectActivity,
  selectActiveProjects,
  selectOverview,
  selectCalendarEvents,
  selectOpenTasks,
  selectTasks,
} from "@/domain/workspace/selectors";
import type { WorkspaceRepository } from "./workspace-repository";
import { useWorkspace } from "./use-workspace";

export type WorkspaceConfig = {
  initial: WorkspaceState;
  events: CalendarEvent[];
  initialDate: Date;
};
export function useWorkspaceController(
  repository: WorkspaceRepository,
  config: WorkspaceConfig,
) {
  const { initial, events: additionalEvents, initialDate } = config;
  const { data, ready, storageError, commit } = useWorkspace(
    repository,
    initial,
  );
  const [page, setPage] = useState("Home");
  const [selected, setSelected] = useState(initial.projects[0]?.id ?? "");
  const [date, setDate] = useState(initialDate);
  const [view, setView] = useState<CalendarView>("Month");
  const [modal, setModal] = useState<string | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [toast, setToast] = useState("");
  const [formError, setFormError] = useState("");
  const [query, setQuery] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(
    initial.preferences,
  );
  const [filter, setFilter] = useState("All events");
  const [projectTab, setProjectTab] = useState("Tasks");
  useEffect(() => setPreferences(data.preferences), [data.preferences]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const project =
    data.projects.find((p) => p.id === selected) ?? data.projects[0];
  const tasks = useMemo(() => selectTasks(data), [data]);
  const events = useMemo(
    () => selectCalendarEvents(data, additionalEvents),
    [data, additionalEvents],
  );
  const overview = useMemo(() => selectOverview(data, events), [data, events]);
  const activeProjects = useMemo(() => selectActiveProjects(data), [data]);
  const visibleEvents = events.filter(
    (e) => filter === "All events" || e.type === filter,
  );
  const due = useMemo(() => selectOpenTasks(data).slice(0, 4), [data]);
  const matchingProjects = useMemo(
    () => searchProjects(data.projects, query),
    [data.projects, query],
  );
  const activity = useMemo(() => selectActivity(data), [data]);
  const openProject = (id: string) => {
    if (!data.projects.some((p) => p.id === id)) return;
    setSelected(id);
    setPage("Project");
    setProjectTab("Tasks");
    setSidebar(false);
  };
  const go = (name: string) => {
    setPage(name);
    setSidebar(false);
    setQuery("");
  };
  const close = useCallback(() => {
    setModal(null);
    setEditProject(null);
    setEditTask(null);
    setFormError("");
  }, []);
  const createProject = () => {
    setEditProject(null);
    setFormError("");
    setModal("project");
  };
  const operation = () => ({
    id: crypto.randomUUID(),
    activityId: crypto.randomUUID(),
    at: new Date().toISOString(),
  });
  const attempt = (fn: () => void) => {
    try {
      fn();
      setFormError("");
      return true;
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "This change could not be saved.",
      );
      return false;
    }
  };
  const saveProject = (draft: ProjectDraft) =>
    attempt(() => {
      const op = operation();
      const next = commit((current) =>
        upsertProject(current, draft, op, editProject?.id),
      );
      const id = editProject?.id ?? op.id;
      close();
      setSelected(id);
      setPage("Project");
      setProjectTab("Tasks");
      setSidebar(false);
      setToast(
        editProject
          ? "Project updated"
          : "Your next chapter starts here. Project created!",
      );
      return next;
    });
  const saveTask = (draft: TaskDraft) =>
    attempt(() => {
      commit((current) =>
        upsertTask(current, project.id, draft, operation(), editTask?.id),
      );
      close();
      setToast("Task saved");
    });
  const toggleTask = (task: Task) =>
    attempt(() => {
      commit((current) =>
        toggleTaskCompletion(current, project.id, task.id, operation()),
      );
      setToast(
        task.done ? "Task reopened" : "A little progress. Task completed!",
      );
    });
  const saveNotes = (projectId: string, notes: string) =>
    attempt(() => {
      commit((current) =>
        updateProjectNotes(current, projectId, notes, operation()),
      );
      setToast("Project notes saved");
    });
  const saveMessage = (projectId: string, message: string) =>
    attempt(() => {
      commit((current) =>
        addProjectMessage(current, projectId, message, operation()),
      );
      setToast("Private message saved");
    });
  const savePreferences = (value: Preferences) =>
    attempt(() => {
      commit((current) => updatePreferences(current, value));
      setToast("Presentation style and preferences saved");
    });
  const changeDate = (step: number) => setDate(moveCalendar(date, view, step));
  const dateTitle = calendarTitle(date, view);
  return {
    data,
    overview,
    activeProjects,
    ready,
    storageError,
    page,
    selected,
    setSelected,
    date,
    setDate,
    view,
    setView,
    modal,
    setModal,
    editProject,
    setEditProject,
    editTask,
    setEditTask,
    toast,
    setToast,
    formError,
    query,
    setQuery,
    sidebar,
    setSidebar,
    preferences,
    setPreferences,
    filter,
    setFilter,
    projectTab,
    setProjectTab,
    project,
    tasks,
    events,
    visibleEvents,
    due,
    matchingProjects,
    activity,
    openProject,
    go,
    close,
    createProject,
    saveProject,
    saveTask,
    toggleTask,
    saveNotes,
    saveMessage,
    savePreferences,
    changeDate,
    dateTitle,
  };
}
export type WorkspaceController = ReturnType<typeof useWorkspaceController>;
