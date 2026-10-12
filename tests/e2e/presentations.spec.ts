import { test, expect } from "@playwright/test";
import type { Presentation } from "@/domain/presentations/models";
const owner = "11111111-1111-1111-1111-111111111111";
const id = "22222222-2222-2222-2222-222222222222";
test.describe("private presentation studio", () => {
  test.skip(
    process.env.TEST_PRESENTATIONS !== "true",
    "Requires a Supabase-configured test server with mocked endpoints.",
  );
  test("saved gallery, private uploads, templates, editing and both downloads", async ({
    page,
  }) => {
    let stored: Presentation | undefined;
    await page.addInitScript(
      ({ owner }) =>
        localStorage.setItem(
          "sb-testproject-auth-token",
          JSON.stringify({
            access_token: "test-access-token",
            refresh_token: "test-refresh-token",
            token_type: "bearer",
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: owner,
              email: "owner@example.com",
              aud: "authenticated",
              role: "authenticated",
            },
          }),
        ),
      { owner },
    );
    await page.route(
      "https://testproject.supabase.co/rest/v1/presentations**",
      async (route) => {
        const request = route.request();
        if (request.method() === "POST") {
          const draft = request.postDataJSON();
          stored = {
            ...draft,
            id,
            assets: [],
            slides: [],
            notes: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        if (request.method() === "PATCH")
          stored = {
            ...stored!,
            ...request.postDataJSON(),
            updated_at: new Date().toISOString(),
          };
        await route.fulfill({
          json: request.method() === "GET" ? (stored ? [stored] : []) : stored,
        });
      },
    );
    await page.route(
      "https://testproject.supabase.co/storage/v1/object/presentation-assets/**",
      (route) => route.fulfill({ json: { Key: "uploaded" } }),
    );
    await page.route(
      "https://testproject.supabase.co/storage/v1/object/sign/presentation-assets/**",
      (route) =>
        route.fulfill({
          json: {
            signedURL: "/object/sign/presentation-assets/test.png?token=test",
          },
        }),
    );
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1sAAAAASUVORK5CYII=",
      "base64",
    );
    await page.route(
      "https://testproject.supabase.co/storage/v1/object/sign/presentation-assets/test.png**",
      (route) => route.fulfill({ body: png, contentType: "image/png" }),
    );
    await page.route("**/api/presentations/generate", async (route) => {
      expect(route.request().headers().authorization).toBe(
        "Bearer test-access-token",
      );
      stored = {
        ...stored!,
        slides: [
          {
            title: "Client direction",
            body: "Grounded in uploaded notes.",
            assetIds: [stored!.assets[0].id],
          },
          { title: "Next steps", body: "Review the identity.", assetIds: [] },
        ],
      };
      await route.fulfill({ json: stored });
    });
    await page.route("**/api/presentations/export", (route) => {
      const format = route.request().postDataJSON().format;
      return route.fulfill({
        body: format === "pdf" ? "%PDF-test" : "PK-test",
        contentType: "application/octet-stream",
      });
    });
    await page.goto("/presentations");
    await expect(
      page.getByRole("heading", { name: "Your presentations." }),
    ).toBeVisible();
    await page.getByRole("button", { name: "New presentation" }).click();
    await page.getByLabel("Presentation name").fill("Olive client deck");
    await page
      .getByRole("button", { name: "Create presentation", exact: true })
      .click();
    await page
      .getByLabel("Notes and instructions")
      .fill("A warm identity for a ceramics studio. Use the supplied artwork.");
    await page
      .getByLabel("Upload photos or supporting files")
      .setInputFiles({
        name: "artwork.png",
        mimeType: "image/png",
        buffer: png,
      });
    await expect(page.getByText("Files uploaded privately.")).toBeVisible();
    await page.getByRole("button", { name: /Minimal/ }).click();
    await page
      .getByRole("button", { name: "Generate presentation", exact: true })
      .click();
    await page.getByLabel("Slide 1 title").fill("Edited client direction");
    await page.getByRole("button", { name: "Move slide 2 up" }).click();
    await expect(page.getByLabel("Slide 1 title")).toHaveValue("Next steps");
    for (const [label, extension] of [
      ["Download PowerPoint", "pptx"],
      ["Download PDF", "pdf"],
    ]) {
      const pending = page.waitForEvent("download");
      await page.getByRole("button", { name: label }).click();
      const download = await pending;
      expect(download.suggestedFilename()).toContain(`.${extension}`);
    }
    await page.getByRole("button", { name: "Back to gallery" }).click();
    await expect(page.locator(".presentation-card")).toContainText(
      "Olive client deck",
    );
    await expect(page.locator(".presentation-card")).toContainText("2 slides");
    expect(stored?.template).toBe("Minimal");
    expect(stored?.assets[0].path).toMatch(new RegExp(`^${owner}/${id}/`));
    await page.reload();
    await page.locator(".presentation-card").click();
    await expect(page.getByLabel("Slide 2 title")).toHaveValue(
      "Edited client direction",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
  test("anonymous visitors must sign in before they can upload", async ({
    page,
  }) => {
    await page.goto("/presentations");
    await expect(
      page.getByRole("heading", { name: "Sign in to your presentations." }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Upload photos or supporting files"),
    ).toHaveCount(0);
  });
});
