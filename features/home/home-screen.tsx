import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import type { WorkspaceController } from "@/application/use-workspace-controller";
import { OverviewStats } from "./overview-stats";
import { CalendarPanel } from "./calendar-panel";
import { FocusCard } from "./focus-card";
import { Horizon } from "./horizon";
import { ProjectOverview } from "./project-overview";
type HomeProps = Pick<
  WorkspaceController,
  | "data"
  | "overview"
  | "date"
  | "setDate"
  | "view"
  | "setView"
  | "setModal"
  | "filter"
  | "setFilter"
  | "visibleEvents"
  | "due"
  | "openProject"
  | "go"
  | "createProject"
  | "changeDate"
  | "dateTitle"
>;
export function HomeScreen(props: HomeProps) {
  return (
    <>
      <PageHeading
        eyebrow="TAKE CONTROL OF YOUR WORK"
        title={
          <>
            Manage your work<span>.</span>
          </>
        }
        description="Track projects, tasks and deadlines from one dashboard. Review sample meetings, switch calendar views and open a project to take the next action."
        action={
          <Button onClick={props.createProject}>
            <Plus size={17} />
            New project
          </Button>
        }
      />
      <OverviewStats overview={props.overview} />
      <div className="home-grid">
        <CalendarPanel {...props} />
        <aside className="right-rail">
          <FocusCard />
          <Horizon {...props} />
        </aside>
      </div>
      <ProjectOverview {...props} />
    </>
  );
}
