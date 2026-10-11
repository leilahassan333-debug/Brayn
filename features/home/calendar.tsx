import { ChevronRight } from "lucide-react";
import type { CalendarEvent, CalendarView } from "@/domain/workspace/models";
import {
  dateKey,
  parseDate,
  calendarDays,
  agendaEvents,
} from "@/domain/workspace/calendar";
import { Empty } from "@/components/ui/empty-state";

export function Calendar({
  date,
  view,
  events,
  selectMonth,
  openEvent,
}: {
  date: Date;
  view: CalendarView;
  events: CalendarEvent[];
  selectMonth: (d: Date) => void;
  openEvent: (e: CalendarEvent) => void;
}) {
  const year = date.getFullYear(),
    month = date.getMonth();
  const days = calendarDays(date, view);
  if (view === "Year")
    return (
      <div className="year-calendar">
        {Array.from({ length: 12 }, (_, m) => {
          const first = new Date(year, m, 1);
          const pad = (first.getDay() + 6) % 7;
          return (
            <button
              className="mini-month"
              key={m}
              onClick={() => selectMonth(first)}
            >
              <strong>
                {first.toLocaleDateString("en", { month: "long" })}
              </strong>
              <div>
                {["M", "T", "W", "T", "F", "S", "S"].map((x, i) => (
                  <span className="mini-weekday" key={i}>
                    {x}
                  </span>
                ))}
                {Array.from({ length: pad }, (_, i) => (
                  <span key={"pad" + i} />
                ))}
                {Array.from(
                  { length: new Date(year, m + 1, 0).getDate() },
                  (_, i) => {
                    const key = dateKey(new Date(year, m, i + 1));
                    return (
                      <span
                        key={i}
                        className={
                          events.some((e) => e.date === key) ? "has-event" : ""
                        }
                      >
                        {i + 1}
                      </span>
                    );
                  },
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  if (view === "Agenda") {
    const filtered = agendaEvents(date, events);
    return (
      <div className="agenda">
        {filtered.length ? (
          filtered.map((e) => (
            <button
              className="agenda-event"
              key={e.id}
              onClick={() => openEvent(e)}
            >
              <span className="agenda-date">
                {parseDate(e.date).toLocaleDateString("en", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className={`dot ${e.color}`} />
              <strong>{e.title}</strong>
              <span>{e.time ?? e.type}</span>
              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty
            title="A little breathing room"
            description="No events in this month. Navigate to October 2026 to explore the demo."
          />
        )}
      </div>
    );
  }
  return (
    <div className={`calendar-grid ${view === "Week" ? "week" : ""}`}>
      <div className="weekdays">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar-days">
        {days.map((d) => {
          const key = dateKey(d);
          const items = events.filter((e) => e.date === key);
          return (
            <div
              className={`day ${d.getMonth() !== month && view !== "Week" ? "outside" : ""} ${key === dateKey(new Date()) ? "today" : ""}`}
              key={key}
            >
              <span className="day-number">{d.getDate()}</span>
              {items.map((e) => (
                <button
                  key={e.id}
                  className={`calendar-event ${e.color}`}
                  onClick={() => openEvent(e)}
                  title={`${e.title} · ${e.type}${e.time ? " · " + e.time : ""}`}
                >
                  <i />
                  {e.time && view === "Week" && <small>{e.time}</small>}
                  <span>{e.title}</span>
                  {e.type === "Deadlines" && (
                    <span className="deadline-marker">· due</span>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
