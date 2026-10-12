import type { TaskDraft } from "./models";
import { addDays, dateKey, parseDate } from "./calendar";

export function suggestedTasks(startDate: string): TaskDraft[] {
  const start = parseDate(startDate);
  const titles = [
    "Create a presentation strategy",
    "Create the mood board",
    "Start designing",
    "Finish the design presentation",
    "Complete the first presentation round",
  ];
  return titles.map((title, index) => ({
    title,
    date: dateKey(addDays(start, [0, 7, 14, 21, 28][index])),
    duration: 1,
    priority: "Medium",
    assignee: "",
  }));
}
