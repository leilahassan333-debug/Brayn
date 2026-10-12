import { test } from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  validatePresentation,
  type Presentation,
} from "@/domain/presentations/models";
import { exportPresentation } from "@/server/presentations/export";
import { generatePresentation } from "@/server/presentations/generate";
import { presentationContext } from "@/server/presentations/context";
const owner = "11111111-1111-1111-1111-111111111111";
const id = "22222222-2222-2222-2222-222222222222";
const deck: Presentation = {
  id,
  owner_id: owner,
  title: "Client presentation",
  notes: "Brand identity for a ceramics studio.",
  template: "Editorial",
  assets: [],
  slides: [
    {
      title: "Résumé & direction",
      body: "Brand direction grounded in the supplied brief.",
      assetIds: [],
    },
  ],
  created_at: "2026-10-12T12:00:00Z",
  updated_at: "2026-10-12T12:00:00Z",
};
const unusedClient = {} as SupabaseClient;
test("presentation validation rejects foreign file paths and invented image references", () => {
  assert.equal(validatePresentation(deck), deck);
  assert.throws(
    () =>
      validatePresentation({
        ...deck,
        assets: [
          {
            id: "a",
            name: "Photo",
            path: `another-user/${id}/a.png`,
            type: "image/png",
            size: 3,
          },
        ],
      }),
    /asset/,
  );
  assert.throws(
    () =>
      validatePresentation({
        ...deck,
        slides: [{ title: "Slide", body: "Text", assetIds: ["invented"] }],
      }),
    /slide/,
  );
  assert.throws(
    () => validatePresentation({ ...deck, notes: "x".repeat(20001) }),
    /data/,
  );
});
test("exports contain real editable PowerPoint text and a readable PDF", async () => {
  const pptx = await exportPresentation(unusedClient, deck, "pptx");
  const zip = await JSZip.loadAsync(pptx);
  const slide = await zip.file("ppt/slides/slide1.xml")!.async("string");
  assert.match(slide, /Résumé/);
  assert.match(slide, /Brand direction grounded/);
  assert.match(slide, /<a:t>/);
  const bytes = await exportPresentation(unusedClient, deck, "pdf");
  assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
  const pdf = await PDFDocument.load(bytes);
  assert.equal(pdf.getPageCount(), 1);
  assert.deepEqual(pdf.getPage(0).getSize(), { width: 960, height: 540 });
});
test("uploaded artwork is embedded without stretching in both exports", async () => {
  const image = await (
    await import("sharp")
  )
    .default({
      create: { width: 200, height: 100, channels: 3, background: "#336699" },
    })
    .png()
    .toBuffer();
  const client = {
    storage: {
      from: () => ({
        download: async () => ({
          data: new Blob([new Uint8Array(image)]),
          error: null,
        }),
      }),
    },
  } as unknown as SupabaseClient;
  const p = {
    ...deck,
    assets: [
      {
        id: "photo",
        name: "art.png",
        type: "image/png",
        size: image.length,
        path: `${owner}/${id}/photo.png`,
      },
    ],
    slides: [{ ...deck.slides[0], assetIds: ["photo"] }],
  };
  const zip = await JSZip.loadAsync(
    await exportPresentation(client, p, "pptx"),
  );
  const slide = await zip.file("ppt/slides/slide1.xml")!.async("string");
  assert.ok(
    Object.keys(zip.files).some(
      (path) => path.startsWith("ppt/media/") && path.endsWith(".png"),
    ),
  );
  const imageExtent = slide.match(
    /<p:pic>[\s\S]*?<a:ext cx="(\d+)" cy="(\d+)"/,
  );
  assert.ok(imageExtent);
  assert.ok(
    Math.abs(Number(imageExtent[1]) / Number(imageExtent[2]) - 2) < 0.001,
  );
  assert.equal(
    (
      await PDFDocument.load(await exportPresentation(client, p, "pdf"))
    ).getPageCount(),
    1,
  );
});
test("backend refuses missing authentication and absent provider configuration", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-test-key";
  await assert.rejects(
    () =>
      presentationContext(
        new Request("http://localhost/api", {
          method: "POST",
          body: JSON.stringify({ id }),
        }),
      ),
    /Sign in/,
  );
  delete process.env.OPENAI_API_KEY;
  await assert.rejects(
    () => generatePresentation(unusedClient, deck),
    /not configured/,
  );
});
test("generation validates structured output before saving and avoids overwriting concurrent edits", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  const original = globalThis.fetch;
  let saved = false;
  const client = {
    rpc: async () => ({ error: null }),
    from: () => ({
      update: (changes: object) => ({
        eq: () => ({
          eq: () => ({
            select: () => ({
              single: async () => {
                saved = true;
                return { data: { ...deck, ...changes }, error: null };
              },
            }),
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
  globalThis.fetch = async () =>
    Response.json({
      status: "completed",
      output: [
        {
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                slides: [
                  { title: "Generated", body: "Grounded notes", assetIds: [] },
                ],
              }),
            },
          ],
        },
      ],
    });
  try {
    const result = await generatePresentation(client, deck);
    assert.equal(result.slides[0].title, "Generated");
    assert.equal(saved, true);
    saved = false;
    const conflicted = {
      rpc: async () => ({ error: null }),
      from: () => ({
        update: () => ({
          eq: () => ({
            eq: () => ({
              select: () => ({
                single: async () => ({
                  data: null,
                  error: new Error("conflict"),
                }),
              }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;
    await assert.rejects(
      () => generatePresentation(conflicted, deck),
      /changed during generation/,
    );
    globalThis.fetch = async () =>
      Response.json({
        status: "completed",
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  slides: [
                    { title: "Wrong", body: "Text", assetIds: ["unknown"] },
                  ],
                }),
              },
            ],
          },
        ],
      });
    await assert.rejects(() => generatePresentation(client, deck), /invalid/);
    assert.equal(saved, false);
  } finally {
    globalThis.fetch = original;
    delete process.env.OPENAI_API_KEY;
  }
});
