import type { CalendarEvent, CalendarView } from "./models";
export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const parseDate = (value: string) => new Date(`${value}T12:00:00`);

export function addDays(date: Date, n: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + n);
  return next;
}
export function weekStart(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}
export function moveCalendar(date: Date, view: CalendarView, step: number) {
  const next = new Date(date);
  if (view === "Year") next.setFullYear(next.getFullYear() + step);
  else if (view === "Week") next.setDate(next.getDate() + step * 7);
  else next.setMonth(next.getMonth() + step, 1);
  return next;
}
export function calendarTitle(date: Date, view: CalendarView) {
  if (view === "Year") return String(date.getFullYear());
  if (view === "Week")
    return `${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(weekStart(date))} – ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(addDays(weekStart(date), 6))}`;
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}
export function calendarDays(date: Date, view: CalendarView) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const weeks = Math.ceil(
    (((first.getDay() + 6) % 7) +
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) /
      7,
  );
  return Array.from({ length: view === "Week" ? 7 : weeks * 7 }, (_, i) =>
    addDays(view === "Week" ? weekStart(date) : weekStart(first), i),
  );
}
export function agendaEvents(date: Date, events: CalendarEvent[]) {
  return events
    .filter((e) =>
      e.date.startsWith(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      ),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}
