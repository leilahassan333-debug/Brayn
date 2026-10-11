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
        description="A few good things in motion"
        icon={<FolderClosed size={21} />}
      />
      <StatCard
        title="Tasks to move forward"
        value={overview.openTasks}
        description="One step at a time"
        icon={<CheckCircle2 size={21} />}
        tone="orange"
      />
      <StatCard
        title="Upcoming meetings"
        value={overview.upcomingMeetings}
        description="Good conversations ahead"
        icon={<Video size={21} />}
        tone="green"
      />
    </div>
  );
}
