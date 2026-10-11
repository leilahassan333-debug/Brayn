import { Bell, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function Topbar({
  data,
  page,
  sidebar,
  setSidebar,
  setPreferences,
  project,
  go,
}: Pick<
  WorkspaceController,
  | "data"
  | "page"
  | "sidebar"
  | "setSidebar"
  | "setPreferences"
  | "project"
  | "go"
>) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <Button
          variant="icon"
          className="mobile-menu"
          aria-label="Open navigation"
          onClick={() => setSidebar(!sidebar)}
        >
          <Menu size={20} />
        </Button>
        <span>My workspace</span>
        <ChevronRight size={13} />
        <strong>{page === "Project" ? project.client : page}</strong>
      </div>
      <div className="topbar-actions">
        <span className="demo-pill">
          <i />
          Demo workspace
        </span>
        <Button
          aria-label="View activity notifications"
          variant="icon"
          onClick={() => go("Activity")}
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </Button>
        <button
          className="avatar small"
          aria-label="Open profile settings"
          onClick={() => {
            setPreferences(data.preferences);
            go("Settings");
          }}
        >
          J
        </button>
      </div>
    </header>
  );
}
