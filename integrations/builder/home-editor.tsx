"use client";

import { Content, fetchOneEntry, getBuilderSearchParams, isPreviewing } from "@builder.io/sdk-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { WorkspaceController } from "@/application/use-workspace-controller";
import { PageHeading } from "@/components/ui/page-heading";
import { Button } from "@/components/ui/button";
import { OverviewStats } from "@/features/home/overview-stats";
import { CalendarPanel } from "@/features/home/calendar-panel";
import { Horizon } from "@/features/home/horizon";
import { ProjectOverview } from "@/features/home/project-overview";
import { FocusCard } from "@/features/home/focus-card";

// The editor receives layout content, not a serialized copy of workspace data.
// Components resolve their data and actions through the existing controller.
const WorkspaceContext = createContext<WorkspaceController | null>(null);
function useWorkspace() {
  const controller = useContext(WorkspaceContext);
  if (!controller) throw new Error("Builder blocks require the Brayn workspace.");
  return controller;
}
function Heading({ title = "Manage your work.", description = "Track projects, tasks and deadlines from one dashboard.", eyebrow = "TAKE CONTROL OF YOUR WORK", buttonLabel = "New project" }) {
  const controller = useWorkspace();
  return <PageHeading title={title} description={description} eyebrow={eyebrow} action={<Button onClick={controller.createProject}>{buttonLabel}</Button>} />;
}
function Stats() { return <OverviewStats overview={useWorkspace().overview} />; }
function Calendar() { return <CalendarPanel {...useWorkspace()} />; }
function Tasks() { return <Horizon {...useWorkspace()} />; }
function Projects() { return <ProjectOverview {...useWorkspace()} />; }

const customComponents = [
  {
    name: "Brayn Page Heading", component: Heading,
    inputs: [
      { name: "title", type: "string", defaultValue: "Manage your work." },
      { name: "description", type: "longText", defaultValue: "Track projects, tasks and deadlines from one dashboard." },
      { name: "eyebrow", type: "string", defaultValue: "TAKE CONTROL OF YOUR WORK" },
      { name: "buttonLabel", type: "string", defaultValue: "New project" },
    ],
  },
  { name: "Brayn Overview Stats", component: Stats },
  { name: "Brayn Calendar", component: Calendar },
  { name: "Brayn Upcoming Tasks", component: Tasks },
  { name: "Brayn Project Overview", component: Projects },
  { name: "Brayn Focus Card", component: FocusCard },
];
type BuilderEntry = Awaited<ReturnType<typeof fetchOneEntry>>;

export default function HomeEditor({ apiKey, controller, children }: {
  apiKey: string;
  controller: WorkspaceController;
  children: ReactNode;
}) {
  const [entry, setEntry] = useState<BuilderEntry>(null);
  const [preview, setPreview] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const editing = isPreviewing();
    setPreview(editing);
    // A published page targets /; editor query parameters allow draft previews.
    fetchOneEntry({
      apiKey, model: "page", userAttributes: { urlPath: "/" },
      options: getBuilderSearchParams(new URLSearchParams(window.location.search)),
    }).then((content) => {
      if (active) { setEntry(content); setFailed(false); }
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [apiKey]);

  if (failed || (!entry && !preview)) return <>{children}</>;
  return (
    <WorkspaceContext.Provider value={controller}>
      <Content apiKey={apiKey} model="page" content={entry} customComponents={customComponents} canTrack={false} />
    </WorkspaceContext.Provider>
  );
}
