import { test, expect } from "@playwright/test";

test("create and edit a project and task, complete it, and retain data after reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Sunroom identity");
  await page.getByLabel("Client name", { exact: true }).fill("Sunroom");
  await page
    .getByLabel("Client email", { exact: true })
    .fill("hello@sunroom.example");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A welcoming identity for a new design studio.");
  await page.getByLabel("Deadline", { exact: true }).fill("2026-10-29");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sunroom identity" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit project", exact: true }).click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Sunroom brand identity");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sunroom brand identity" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page
    .getByLabel("Task name", { exact: true })
    .fill("Explore the wordmark");
  await page.getByLabel("Planned date", { exact: true }).fill("2026-10-22");
  await page.getByLabel("Estimated hours", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Save task", exact: true }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByLabel("Task name", { exact: true })
    .fill("Refine the wordmark");
  await page.getByLabel("Estimated hours", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Save task", exact: true }).click();
  await expect(page.getByText("3h estimated", { exact: false })).toBeVisible();
  await page
    .getByRole("button", { name: "Complete Refine the wordmark", exact: true })
    .click();
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Completed Refine the wordmark/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Completed Refine the wordmark/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sunroom brand identity" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await page.getByLabel("Search projects").fill("Sunroom");
  await page.getByRole("button", { name: /Sunroom brand identity/ }).click();
  await expect(
    page.getByRole("button", { name: "Reopen Refine the wordmark" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("calendar navigation, filters, linked events, year, week and agenda", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "October 2026" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next calendar period" }).click();
  await expect(
    page.getByRole("heading", { name: "November 2026" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Previous calendar period" }).click();
  await page.getByRole("button", { name: "Year", exact: true }).click();
  await page.locator(".mini-month").filter({ hasText: "October" }).click();
  await expect(
    page.getByRole("button", { name: "Month", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Week", exact: true }).click();
  await expect(page.locator(".week .day")).toHaveCount(7);
  await page.getByRole("button", { name: "Agenda", exact: true }).click();
  await page.getByLabel("Filter calendar events").selectOption("Meetings");
  await expect(page.locator(".agenda-event")).toHaveCount(2);
  await page.getByRole("button", { name: /Olive · Creative check-in/ }).click();
  await expect(
    page.getByRole("heading", { name: "A new chapter for Olive" }),
  ).toBeVisible();
});

test("presentation preferences use actual templates, customize and persist", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open profile settings" }).click();
  await page
    .locator(".template-option")
    .filter({ hasText: "Expressive" })
    .click();
  await page
    .getByLabel("Presentation tone")
    .selectOption("Playful & expressive");
  await page
    .getByLabel("Presentation font", { exact: true })
    .selectOption("Arial");
  await page.getByLabel("Accent color", { exact: true }).fill("#bc7050");
  await page
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("preferences saved");
  await page.reload();
  await page.getByRole("button", { name: "Files", exact: true }).click();
  await page.getByRole("button", { name: "Design Presentation", exact: true }).click();
  await expect(
    page.getByText("Expressive presentation", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".presentation-preview .template")).toHaveClass(
    /expressive/,
  );
  await expect(page.locator(".presentation-preview .template")).toHaveCSS(
    "font-family",
    "Arial",
  );
  await page
    .getByRole("button", { name: "Preview presentation workflow" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "does not generate content",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("desktop and mobile render without horizontal overflow or browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Manage your work." }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /Plan my week/ }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "review every suggested change",
  );
  await page.getByRole("button", { name: "Close preview" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Files", exact: true }).click();
  await page.getByRole("button", { name: "Open Files", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Open project files." })).toBeVisible();
  await expect(page.getByText("File uploads are not connected yet", { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test("changing design tokens retains working project actions", async ({
  page,
}) => {
  await page.goto("/");
  const create = page.getByRole("button", { name: "New project", exact: true });
  await expect(create).toBeVisible();
  await page.evaluate(() =>
    document.documentElement.style.setProperty("--color-accent", "#115e59"),
  );
  await expect(create).toHaveCSS("background-color", "rgb(17, 94, 89)");
  await create.click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("A redesigned frontend");
  await page.getByLabel("Client name", { exact: true }).fill("Future Studio");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A redesigned frontend" }),
  ).toBeVisible();
});

test("blocked browser storage shows a clear error while preserving session functionality", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Storage unavailable", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Session-only project");
  await page.getByLabel("Client name", { exact: true }).fill("A sample client");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Session-only project" }),
  ).toBeVisible();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Changes will last only for this session",
  );
});
