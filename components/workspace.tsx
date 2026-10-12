"use client";
import dynamic from "next/dynamic";
import { AlertCircle } from "lucide-react";
import { useWorkspaceController } from "@/application/use-workspace-controller";
import type { WorkspaceRepository } from "@/application/workspace-repository";
import { BrowserWorkspaceRepository } from "@/infrastructure/demo/browser-repository";
import { demoEvents, seed } from "@/infrastructure/demo/seed";
import { Sidebar } from "./layout/sidebar";
import { Topbar } from "./layout/topbar";
import { WorkspaceFooter } from "./layout/workspace-footer";
import { Toast } from "./ui/toast";
import { HomeScreen } from "@/features/home/home-screen";
import { ProjectsScreen } from "@/features/projects/projects-screen";
import { ProjectScreen } from "@/features/projects/project-screen";
import { ActivityScreen } from "@/features/activity/activity-screen";
import { CreativeScreen } from "@/features/creative/creative-screen";
import { MeetingsScreen } from "@/features/meetings/meetings-screen";
import { SettingsScreen } from "@/features/settings/settings-screen";
import { FilesScreen } from "@/features/files/files-screen";
import { TaskAssistant } from "@/features/assistant/task-assistant";
import { ProjectDialog } from "@/features/projects/project-dialog";
import { TaskDialog } from "@/features/projects/task-dialog";
import { IntegrationPreviewDialog } from "@/features/creative/integration-preview-dialog";

const HomeEditor = dynamic(() => import("@/integrations/builder/home-editor"));
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY?.trim();

// Composition root: swapping the adapter never requires editing a visual screen.
const demoRepository = new BrowserWorkspaceRepository();
const demoConfig = {
  initial: seed,
  events: demoEvents,
  initialDate: new Date(2026, 9, 11),
};
export default function Workspace({
  repository = demoRepository,
}: {
  repository?: WorkspaceRepository;
}) {
  const controller = useWorkspaceController(repository, demoConfig);
  const {
    page,
    ready,
    sidebar,
    setSidebar,
    storageError,
    formError,
    modal,
    toast,
    setToast,
  } = controller;
  return (
    <div className="workspace">
      <Sidebar {...controller} />
      {sidebar && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        />
      )}
      <div className="main-shell">
        <Topbar {...controller} />
        <main>
          {storageError && (
            <div role="alert" className="error-banner">
              <AlertCircle size={18} />
              {storageError}
            </div>
          )}
          {formError && !modal && (
            <div role="alert" className="error-banner">
              <AlertCircle size={18} />
              {formError}
            </div>
          )}
          {!ready ? (
            <div className="loading" role="status">
              Getting your workspace ready…
            </div>
          ) : (
            <>
              {page === "Files" && <FilesScreen {...controller} />}
              {page === "Home" &&
                (builderApiKey ? (
                  <HomeEditor apiKey={builderApiKey} controller={controller}>
                    <HomeScreen {...controller} />
                  </HomeEditor>
                ) : (
                  <HomeScreen {...controller} />
                ))}
              {page === "Projects" && <ProjectsScreen {...controller} />}
              {page === "Project" && <ProjectScreen {...controller} />}
              {page === "Activity" && <ActivityScreen {...controller} />}
              {(page === "Strategy" || page === "Brief") && (
                <CreativeScreen {...controller} />
              )}
              {page === "Meetings" && <MeetingsScreen {...controller} />}
              {page === "Settings" && <SettingsScreen {...controller} />}
              <WorkspaceFooter />
            </>
          )}
        </main>
      </div>
      <TaskAssistant {...controller} />
      <Toast message={toast} dismiss={() => setToast("")} />
      {modal === "project" && <ProjectDialog {...controller} />}
      {modal === "task" && <TaskDialog {...controller} />}
      <IntegrationPreviewDialog {...controller} />
    </div>
  );
}
