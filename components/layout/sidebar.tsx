import {
  ChevronDown,
  Plus,
  Settings2,
  Sparkles,
  FolderClosed,
  Home,
  LayoutTemplate,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkspaceController } from "@/application/use-workspace-controller";

const nav = [
  { name: "Home", icon: Home },
  { name: "Projects", icon: FolderClosed },
  { name: "Activity", icon: Zap },
  { name: "Strategy", icon: Sparkles },
  { name: "Brief", icon: LayoutTemplate },
  { name: "Meetings", icon: Video },
];
export function Sidebar({
  data,
  page,
  selected,
  sidebar,
  setPreferences,
  openProject,
  go,
  createProject,
}: Pick<
  WorkspaceController,
  | "data"
  | "page"
  | "selected"
  | "sidebar"
  | "setPreferences"
  | "openProject"
  | "go"
  | "createProject"
>) {
  return (
    <aside className={`sidebar ${sidebar ? "open" : ""}`}>
      <button
        className="brand"
        onClick={() => go("Home")}
        aria-label="Brayn home"
      >
        <span className="brand-mark">
          <Sparkles size={22} />
        </span>
        brayn<span className="brand-period">.</span>
      </button>
      <div className="workspace-label">
        <span className="avatar mini">J</span>
        <div>
          Jamie’s workspace<small>Personal space</small>
        </div>
        <ChevronDown size={14} />
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {nav.map((n) => (
          <button
            key={n.name}
            className={`nav-item ${page === n.name ? "active" : ""}`}
            onClick={() => go(n.name)}
          >
            <n.icon size={18} />
            <span>{n.name}</span>
            {n.name === "Meetings" && <span className="nav-count">2</span>}
            {n.name === "Home" && page === "Home" && (
              <span className="nav-dot" />
            )}
          </button>
        ))}
      </nav>
      <div className="project-label">
        <span>YOUR PROJECTS</span>
        <Button
          onClick={createProject}
          aria-label="Create project"
          variant="icon"
        >
          <Plus size={15} />
        </Button>
      </div>
      <div className="sidebar-projects">
        {data.projects.map((p) => (
          <button
            key={p.id}
            onClick={() => openProject(p.id)}
            className={`sidebar-project ${page === "Project" && selected === p.id ? "selected" : ""}`}
          >
            <i className={`dot ${p.color}`} />
            <span>{p.client}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <div className="creative-note">
          <div className="note-doodle">✺</div>
          <strong>Own your next move.</strong>
          <p>
            Set your priorities.
            <br />
            Move the work forward.
          </p>
        </div>
        <button
          className="profile"
          onClick={() => {
            setPreferences(data.preferences);
            go("Settings");
          }}
        >
          <span className="avatar">J</span>
          <div>
            Jamie Parker<small>Independent designer</small>
          </div>
          <Settings2 size={17} />
        </button>
      </div>
    </aside>
  );
}
