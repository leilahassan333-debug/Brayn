import { test, expect, type Page } from "@playwright/test";
async function createProject(page: Page, name: string) {
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Project name", { exact: true }).fill(name);
  await dialog.getByLabel("Client name", { exact: true }).fill("Studio Test");
  await dialog.getByLabel("Project start date").fill("2026-12-25");
  await dialog.getByLabel("Deadline", { exact: true }).fill("2027-02-01");
  await dialog
    .getByRole("button", { name: "Create project", exact: true })
    .click();
}
async function send(page: Page, text: string) {
  await page.getByLabel("Message to task assistant").fill(text);
  await page.getByRole("button", { name: "Send request" }).click();
}

test("navigation follows requested order and Activity shows editable task rows", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("button")).toHaveText([
    "Home",
    "Activity",
    "Projects",
    "Files",
  ]);
  await nav.getByRole("button", { name: "Files", exact: true }).click();
  await expect(
    nav.getByRole("button", { name: "Files", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(nav.getByRole("button")).toHaveText([
    "Home",
    "Activity",
    "Projects",
    "Files",
    "Brand Strategy",
    "Design Presentation",
    "Open Files",
  ]);
  await nav.getByRole("button", { name: "Activity", exact: true }).click();
  const row = page
    .locator(".task-overview-table tbody tr")
    .filter({ hasText: "Moodboard exploration" });
  await expect(row).toContainText("1/4");
  await expect(row).toContainText("Olive Studio");
  await row
    .getByRole("button", { name: "Complete Moodboard exploration" })
    .click();
  await expect(row).toContainText("2/4");
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Task priority").selectOption("High");
  await page.getByLabel("Assignee", { exact: true }).fill("Alex");
  await page.getByRole("button", { name: "Save task" }).click();
  await nav.getByRole("button", { name: "Activity", exact: true }).click();
  await expect(row).toContainText("High");
  await expect(row).toContainText("Assigned to Alex");
  for (const group of await page.locator(".stagger-group").all())
    await expect(group).toHaveCSS("transform", "none");
});

test("starter tasks require acceptance, use start plus fourteen days and remain editable", async ({
  page,
}) => {
  await page.goto("/");
  await createProject(page, "Starter workflow");
  await expect(page.locator(".task-row")).toHaveCount(0);
  await expect(page.locator(".starter-task-offer")).toContainText("2027-01-08");
  await page.getByRole("button", { name: "Add suggested tasks" }).click();
  await expect(page.locator(".task-row")).toHaveCount(5);
  await expect(page.locator(".starter-task-offer")).toHaveCount(0);
  await page
    .locator(".task-row")
    .filter({ hasText: "Start designing" })
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await expect(page.getByLabel("Planned date")).toHaveValue("2027-01-08");
  await page.getByLabel("Task name").fill("Design identity concepts");
  await page.getByLabel("Planned date").fill("2027-01-09");
  await page.getByRole("button", { name: "Save task" }).click();
  await expect(
    page.locator(".task-row").filter({ hasText: "Design identity concepts" }),
  ).toBeVisible();
  await createProject(page, "Empty workflow");
  await page.getByRole("button", { name: "Skip starter tasks" }).click();
  await expect(page.locator(".task-row")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await page.getByRole("button", { name: /Starter workflow/ }).click();
  await expect(page.locator(".task-row")).toHaveCount(5);
  await expect(
    page.locator(".task-row").filter({ hasText: "Design identity concepts" }),
  ).toBeVisible();
});

test("assistant clarifies, previews, cancels and confirms task changes", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Task assistant", exact: true })
    .click();
  await send(page, "Add a task to finish the mood board");
  await expect(
    page.getByText("Which project should I use? Choose its name below."),
  ).toBeVisible();
  await page.getByLabel("Choose project").selectOption("p1");
  await expect(
    page.getByText("When is it due?", { exact: false }),
  ).toBeVisible();
  await send(page, "2026-10-16");
  await expect(page.locator(".assistant-proposal")).toContainText(
    "finish the mood board",
  );
  await expect(page.locator(".assistant-proposal")).toContainText("2026-10-16");
  expect(
    await page.evaluate(() => localStorage.getItem("brayn-demo-v1")),
  ).toBeNull();
  await page.getByRole("button", { name: "Cancel change" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("brayn-demo-v1")),
  ).toBeNull();
  await send(
    page,
    "Add a task to finish the mood board by 2026-10-16 in Olive Studio",
  );
  await page.getByRole("button", { name: "Confirm change" }).click();
  await expect(
    page.locator(".task-row").filter({ hasText: "finish the mood board" }),
  ).toBeVisible();
  await expect(
    page.getByText("Task change saved. Your project is updated."),
  ).toBeVisible();
  await send(page, "Assign finish the mood board to Alex");
  await page.getByRole("button", { name: "Confirm change" }).click();
  await expect(
    page.locator(".task-row").filter({ hasText: "finish the mood board" }),
  ).toContainText("Assigned to Alex");
  await send(page, "Reschedule finish the mood board to 2026-10-20");
  await expect(page.locator(".assistant-proposal")).toContainText("2026-10-20");
  await page.getByRole("button", { name: "Confirm change" }).click();
  await send(page, "Rename finish the mood board to Final mood board");
  await page.getByRole("button", { name: "Confirm change" }).click();
  await page.getByRole("button", { name: "Close task assistant" }).click();
  await expect(
    page.locator(".task-row").filter({ hasText: "Final mood board" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await page.getByRole("button", { name: /A new chapter for Olive/ }).click();
  await expect(
    page.locator(".task-row").filter({ hasText: "Final mood board" }),
  ).toContainText("Oct 20");
});

test("mobile navigation and assistant stay usable without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Files", exact: true }).click();
  await page
    .getByRole("button", { name: "Brand Strategy", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Build a clear brand strategy." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await page
    .getByRole("button", { name: "Task assistant", exact: true })
    .click();
  await send(page, "Add a task to review artwork by Friday in Olive Studio");
  await expect(
    page.getByRole("button", { name: "Confirm change" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-task-assistant.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Task assistant", exact: true }),
  ).toBeFocused();
});
