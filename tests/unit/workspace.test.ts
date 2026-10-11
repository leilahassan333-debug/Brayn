import { test } from "node:test";
import assert from "node:assert/strict";
import { seed } from "@/infrastructure/demo/seed";
import {
  addProjectMessage,
  toggleTaskCompletion,
  updatePreferences,
  updateProjectNotes,
  upsertProject,
  upsertTask,
  ValidationError,
} from "@/domain/workspace/commands";
import {
  agendaEvents,
  calendarDays,
  dateKey,
  moveCalendar,
  weekStart,
} from "@/domain/workspace/calendar";
import {
  searchProjects,
  selectCalendarEvents,
  selectProjectProgress,
} from "@/domain/workspace/selectors";
import { decodeWorkspace } from "@/domain/workspace/validation";
import {
  BrowserWorkspaceRepository,
  DEMO_STORAGE_KEY,
} from "@/infrastructure/demo/browser-repository";

const op = {
  id: "new-id",
  activityId: "new-activity",
  at: "2026-10-11T12:00:00Z",
};
const projectDraft = {
  name: " Sunroom ",
  client: " Studio ",
  email: "hello@example.com",
  description: "A new identity",
  status: "In progress",
  priority: "High",
  deadline: "2026-10-29",
};
const baseline = () => structuredClone(seed);

test("project edits preserve tasks, notes and messages, record activity and leave the input unchanged", () => {
  const state = baseline();
  const before = structuredClone(state);
  const next = upsertProject(state, projectDraft, op, "p1");
  assert.deepEqual(state, before);
  assert.equal(next.projects[0].name, "Sunroom");
  assert.deepEqual(next.projects[0].tasks, state.projects[0].tasks);
  assert.equal(next.projects[0].notes, state.projects[0].notes);
  assert.deepEqual(
    next.projects[0].conversation,
    state.projects[0].conversation,
  );
  assert.equal(next.activity[0].projectId, "p1");
  assert.equal(next.activity[0].text, "Updated Sunroom");
  const created = upsertProject(state, projectDraft, op);
  assert.equal(created.projects.at(-1)?.id, op.id);
  assert.equal(created.projects.at(-1)?.tasks.length, 0);
});

test("invalid business inputs fail atomically without adding tasks or activity", () => {
  const state = baseline();
  const before = structuredClone(state);
  for (const duration of [NaN, Infinity, -1, 0, 0.3, 101])
    assert.throws(
      () =>
        upsertTask(
          state,
          "p1",
          { title: "Sketch", duration, date: "2026-10-12" },
          op,
        ),
      ValidationError,
    );
  assert.throws(
    () => upsertProject(state, { ...projectDraft, deadline: "2026-02-30" }, op),
    ValidationError,
  );
  assert.throws(
    () => upsertProject(state, { ...projectDraft, status: "Invented" }, op),
    ValidationError,
  );
  assert.throws(
    () =>
      upsertTask(
        state,
        "missing",
        { title: "Sketch", duration: 1, date: "2026-10-12" },
        op,
      ),
    ValidationError,
  );
  assert.deepEqual(state, before);
});

test("task editing retains completion and cannot affect another project", () => {
  const state = baseline();
  const next = upsertTask(
    state,
    "p1",
    { title: "Discovery complete", date: "2026-10-13", duration: 2.5 },
    op,
    "t4",
  );
  assert.equal(next.projects[0].tasks.find((t) => t.id === "t4")?.done, true);
  assert.deepEqual(next.projects[1], state.projects[1]);
  const reopened = toggleTaskCompletion(next, "p1", "t4", {
    ...op,
    activityId: "reopened",
  });
  assert.equal(
    reopened.projects[0].tasks.find((t) => t.id === "t4")?.done,
    false,
  );
  assert.equal(reopened.activity[0].text, "Reopened Discovery complete");
  assert.throws(
    () =>
      upsertTask(
        state,
        "p1",
        { title: "Sketch", date: "2026-10-13", duration: 2 },
        op,
        "missing",
      ),
    ValidationError,
  );
});

test("notes and messages stay project-specific, and preferences enforce a real working interval", () => {
  const state = baseline();
  const notes = updateProjectNotes(state, "p1", "New meeting notes", op);
  const next = addProjectMessage(notes, "p1", "A private thought", {
    ...op,
    activityId: "message",
  });
  assert.equal(next.projects[0].notes, "New meeting notes");
  assert.equal(next.projects[0].conversation.at(-1), "A private thought");
  assert.deepEqual(next.projects[1], state.projects[1]);
  assert.throws(
    () => addProjectMessage(state, "p1", "  ", op),
    ValidationError,
  );
  assert.throws(
    () =>
      updatePreferences(state, {
        ...state.preferences,
        end: state.preferences.start,
      }),
    ValidationError,
  );
  const preferences = updatePreferences(state, {
    ...state.preferences,
    style: "Minimal",
    font: "Arial",
    color: "#115e59",
  });
  assert.equal(preferences.preferences.style, "Minimal");
  assert.deepEqual(preferences.projects, state.projects);
});

test("calendar periods handle leap years and year boundaries without mutating dates", () => {
  const leap = new Date(2028, 1, 29);
  const original = leap.getTime();
  assert.equal(dateKey(weekStart(leap)), "2028-02-28");
  assert.equal(calendarDays(leap, "Week").length, 7);
  assert.ok(
    calendarDays(leap, "Month").some((d) => dateKey(d) === "2028-02-29"),
  );
  assert.equal(
    dateKey(moveCalendar(new Date(2026, 11, 31), "Month", 1)),
    "2027-01-01",
  );
  assert.equal(
    dateKey(moveCalendar(new Date(2026, 0, 1), "Week", -1)),
    "2025-12-25",
  );
  assert.equal(leap.getTime(), original);
  const state = baseline();
  state.projects[0].status = "Completed";
  const events = selectCalendarEvents(state);
  assert.ok(!events.some((e) => e.id === "p1deadline"));
  assert.ok(!events.some((e) => e.id === "t4"));
  assert.equal(agendaEvents(new Date(2026, 10, 1), events).length, 0);
  assert.equal(selectProjectProgress(seed.projects[0]).percent, 25);
  assert.equal(searchProjects(seed.projects, " OLIVE ").length, 1);
});

test("legacy demo records remain loadable and malformed nested records are rejected", () => {
  assert.deepEqual(decodeWorkspace(JSON.parse(JSON.stringify(seed))), seed);
  assert.throws(
    () =>
      decodeWorkspace({
        projects: [{}],
        preferences: seed.preferences,
        activity: [],
      }),
    ValidationError,
  );
  const corrupted: any = baseline();
  corrupted.projects[0].tasks = [
    {
      id: "bad",
      title: "bad",
      date: "2026-10-12",
      duration: "two",
      done: false,
    },
  ];
  assert.throws(() => decodeWorkspace(corrupted), ValidationError);
  const duplicate = baseline();
  duplicate.projects[1].id = "p1";
  assert.throws(() => decodeWorkspace(duplicate), ValidationError);
});

test("storage adapter is replaceable and reports corrupt or unavailable storage", async () => {
  let raw: string | null = null;
  let accesses = 0;
  const repository = new BrowserWorkspaceRepository(() => {
    accesses++;
    return {
      getItem: (key) => {
        assert.equal(key, DEMO_STORAGE_KEY);
        return raw;
      },
      setItem: (key, value) => {
        assert.equal(key, DEMO_STORAGE_KEY);
        raw = value;
      },
    };
  });
  assert.equal(accesses, 0);
  assert.equal(await repository.load(), null);
  await repository.save(seed);
  assert.deepEqual(await repository.load(), seed);
  raw = '{"broken":true}';
  await assert.rejects(repository.load(), ValidationError);
  const unavailable = new BrowserWorkspaceRepository(() => {
    throw new Error("Storage disabled");
  });
  await assert.rejects(unavailable.save(seed), /Storage disabled/);
});
