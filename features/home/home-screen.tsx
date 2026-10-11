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
        eyebrow="A LITTLE CLARITY, A LOT OF POSSIBILITY"
        title={
          <>
            Your work, in a good place<span>.</span>
          </>
        }
        description="Home is your daily overview of projects, tasks, deadlines and sample meetings. Use the calendar to plan your day, switch between year, month, week and agenda views, or open a project to continue working."
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
