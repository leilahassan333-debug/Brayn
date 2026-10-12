import { test } from "node:test";
import assert from "node:assert/strict";
import { seed } from "@/infrastructure/demo/seed";
import { suggestedTasks } from "@/domain/workspace/starter-tasks";
import {
  applyTaskProposal,
  prepareTaskChange,
  readTaskRequest,
  resolveTaskDate,
  type TaskProposal,
} from "@/domain/workspace/task-assistant";
import { decodeWorkspace } from "@/domain/workspace/validation";
import { upsertTask } from "@/domain/workspace/commands";
const op = {
  id: "assistant-task",
  activityId: "assistant-activity",
  at: "2026-10-12T12:00:00Z",
};
const today = "2026-10-12";
function proposal(text: string, projectId?: string): TaskProposal {
  const request = readTaskRequest(text, today)!;
  const result = prepareTaskChange(request, seed, projectId);
  assert.equal(result.kind, "proposal");
  if (result.kind !== "proposal") throw new Error("Expected proposal");
  return result.proposal;
}
test("starter tasks use project start date and handle year and leap transitions", () => {
  assert.equal(suggestedTasks("2026-12-25")[2].date, "2027-01-08");
  assert.equal(suggestedTasks("2028-02-20")[2].date, "2028-03-05");
  assert.equal(suggestedTasks(today).length, 5);
});
test("task requests ask for missing project and due date without changing state", () => {
  const before = JSON.stringify(seed);
  const request = readTaskRequest(
    "Add a task to finish the mood board by Friday",
    today,
  )!;
  const result = prepareTaskChange(request, seed);
  assert.equal(result.kind, "question");
  if (result.kind === "question") assert.equal(result.field, "project");
  const missingDate = prepareTaskChange(
    readTaskRequest("Create Review artwork", today)!,
    seed,
    "p1",
  );
  assert.equal(missingDate.kind, "question");
  if (missingDate.kind === "question") assert.equal(missingDate.field, "date");
  assert.equal(JSON.stringify(seed), before);
});
test("confirmed creation is project-specific and explicit project beats current page", () => {
  const draft = proposal(
    "Add a task to finish the mood board by Friday in Folk & Form",
    "p1",
  );
  assert.equal(draft.projectId, "p2");
  assert.equal(draft.draft.date, "2026-10-16");
  const state = applyTaskProposal(seed, draft, op);
  assert.equal(state.projects[1].tasks.at(-1)?.title, "finish the mood board");
  assert.deepEqual(state.projects[0], seed.projects[0]);
});
test("rename, assignment and rescheduling preserve completion and task metadata", () => {
  const renamed = applyTaskProposal(
    seed,
    proposal('Rename Brand discovery to "Brand research" in Olive Studio'),
    op,
  );
  assert.equal(
    renamed.projects[0].tasks.find((t) => t.id === "t4")?.done,
    true,
  );
  const assigned = proposal(
    "Assign Moodboard exploration to Alex in Olive Studio",
  );
  assert.equal(assigned.draft.assignee, "Alex");
  const moved = proposal(
    "Reschedule Moodboard exploration to tomorrow in Olive Studio",
  );
  assert.equal(moved.draft.date, "2026-10-13");
});
test("stale confirmations and invalid metadata cannot overwrite tasks", () => {
  const preview = proposal("Reschedule Moodboard exploration to Friday", "p1");
  const changed = upsertTask(
    seed,
    "p1",
    { title: "Updated moodboard", date: today, duration: 1 },
    op,
    "t1",
  );
  assert.throws(
    () => applyTaskProposal(changed, preview, op),
    /changed after the preview/,
  );
  assert.throws(
    () =>
      upsertTask(
        seed,
        "p1",
        {
          title: "Task",
          date: today,
          duration: 1,
          priority: "Urgent" as "High",
        },
        op,
      ),
    /priority/,
  );
  const malformed = structuredClone(seed);
  malformed.projects[0].tasks[0].assignee = 22 as unknown as string;
  assert.throws(() => decodeWorkspace(malformed), /assignee/);
  assert.equal(resolveTaskDate("2026-02-30", today), undefined);
  assert.equal(resolveTaskDate("Friday", today), "2026-10-16");
});
