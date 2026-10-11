import type { ReactNode } from "react";
export function StatCard({
  title,
  value,
  description,
  icon,
  tone = "purple",
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  tone?: "purple" | "orange" | "green";
}) {
  return (
    <div className="overview-card">
      <span className={`metric-icon ${tone}-bg`}>{icon}</span>
      <div>
        <span>{title}</span>
        <strong>
          {value.toString().padStart(2, "0")}
          <small>{description}</small>
        </strong>
      </div>
    </div>
  );
}
