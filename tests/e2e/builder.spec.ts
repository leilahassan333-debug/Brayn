import { test, expect } from "@playwright/test";

// Run against a server configured with a non-secret test key; CDN responses are mocked.
test.describe("Builder Home integration", () => {
  test.skip(process.env.TEST_BUILDER !== "true", "Requires the Builder-configured test server.");

  test("published layout renders functional workspace blocks", async ({ page }) => {
    await page.route("https://cdn.builder.io/api/**/content/page**", route => route.fulfill({
      json: { results: [{ id: "test-home", published: "published", data: { blocks: [
        { "@type": "@builder.io/sdk:Element", id: "builder-heading", component: { name: "Brayn Page Heading", options: { title: "My redesigned workspace", description: "A custom layout with working project actions.", buttonLabel: "Start a project" } } },
        { "@type": "@builder.io/sdk:Element", id: "builder-stats", component: { name: "Brayn Overview Stats", options: {} } },
        { "@type": "@builder.io/sdk:Element", id: "builder-projects", component: { name: "Brayn Project Overview", options: {} } },
      ] } }] },
    }));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "My redesigned workspace" })).toBeVisible();
    await expect(page.getByText("Active projects", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Start a project", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Project name", { exact: true }).fill("Builder test project");
    await page.getByLabel("Client name", { exact: true }).fill("Test client");
    await page.getByLabel("Deadline", { exact: true }).fill("2026-11-12");
    await page.getByRole("dialog").getByRole("button", { name: "Create project", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Builder test project" })).toBeVisible();
  });

  test("missing content preserves the native Home page", async ({ page }) => {
    await page.route("https://cdn.builder.io/api/**/content/page**", route => route.fulfill({ json: { results: [] } }));
    const completed = page.waitForEvent("requestfinished", request => request.url().includes("cdn.builder.io/api/"));
    await page.goto("/");
    await completed;
    await expect(page.getByRole("heading", { name: "Manage your work." })).toBeVisible();
    await page.getByRole("button", { name: "New project", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("network failure preserves the native Home page", async ({ page }) => {
    await page.route("https://cdn.builder.io/api/**/content/page**", route => route.abort());
    const failed = page.waitForEvent("requestfailed", request => request.url().includes("cdn.builder.io/api/"));
    await page.goto("/");
    await failed;
    await expect(page.getByRole("heading", { name: "Manage your work." })).toBeVisible();
    await page.getByRole("button", { name: "New project", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
