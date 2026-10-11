import { CheckCircle2, FolderClosed, Video } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
export function OverviewStats({
  overview,
}: {
  overview: {
    activeProjects: number;
    openTasks: number;
    upcomingMeetings: number;
  };
}) {
  return (
    <div className="overview">
      <StatCard
        title="Active projects"
        value={overview.activeProjects}
        description="Projects not yet completed"
        icon={<FolderClosed size={21} />}
      />
      <StatCard
        title="Open tasks"
        value={overview.openTasks}
        description="Tasks awaiting completion"
        icon={<CheckCircle2 size={21} />}
        tone="orange"
      />
      <StatCard
        title="Upcoming meetings"
        value={overview.upcomingMeetings}
        description="Sample meetings on the calendar"
        icon={<Video size={21} />}
        tone="green"
      />
    </div>
  );
}
