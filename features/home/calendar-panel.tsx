import type { WorkspaceController } from "@/application/use-workspace-controller";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Calendar } from "./calendar";
export function CalendarPanel({
  date,
  setDate,
  view,
  setView,
  setModal,
  filter,
  setFilter,
  visibleEvents,
  openProject,
  changeDate,
  dateTitle,
}: Pick<
  WorkspaceController,
  | "date"
  | "setDate"
  | "view"
  | "setView"
  | "setModal"
  | "filter"
  | "setFilter"
  | "visibleEvents"
  | "openProject"
  | "changeDate"
  | "dateTitle"
>) {
  return (
    <Panel className="calendar-panel">
      <div className="section-heading">
        <div>
          <h2>Your calendar</h2>
          <p>A little perspective on what’s ahead.</p>
        </div>
        <button className="plan-button" onClick={() => setModal("plan")}>
          <Sparkles size={15} />
          Plan my week
          <span className="preview-mini">Preview</span>
        </button>
      </div>
      <div className="calendar-toolbar">
        <div className="calendar-date">
          <h3>{dateTitle}</h3>
          <Button
            variant="icon"
            aria-label="Previous calendar period"
            onClick={() => changeDate(-1)}
          >
            <ChevronLeft size={17} />
          </Button>
          <Button
            variant="icon"
            aria-label="Next calendar period"
            onClick={() => changeDate(1)}
          >
            <ChevronRight size={17} />
          </Button>
          <button className="today-button" onClick={() => setDate(new Date())}>
            Today
          </button>
        </div>
        <div className="view-switch" aria-label="Calendar view">
          {(["Year", "Month", "Week", "Agenda"] as const).map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={view === v ? "active" : ""}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <Calendar
        date={date}
        view={view}
        events={visibleEvents}
        selectMonth={(d) => {
          setDate(d);
          setView("Month");
        }}
        openEvent={(e) =>
          e.projectId ? openProject(e.projectId) : setModal("personal")
        }
      />
      <div className="calendar-footer">
        <div className="legend">
          <span>
            <i className="dot purple" />
            Olive Studio
          </span>
          <span>
            <i className="dot orange" />
            Folk & Form
          </span>
          <span>
            <i className="dot green" />
            Morrow
          </span>
          <span>
            <i className="dot neutral" />
            Personal
          </span>
        </div>
        <select
          aria-label="Filter calendar events"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["All events", "Tasks", "Deadlines", "Meetings", "Personal"].map(
            (x) => (
              <option key={x}>{x}</option>
            ),
          )}
        </select>
      </div>
    </Panel>
  );
}
