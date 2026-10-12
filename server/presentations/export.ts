import "server-only";
import PptxGenJS from "pptxgenjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, rgb } from "pdf-lib";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Presentation } from "@/domain/presentations/models";
import { RequestError } from "./context";
const WIDTH = 960,
  HEIGHT = 540;
export function slideLayout(
  template: Presentation["template"],
  image: boolean,
) {
  const expressive = template === "Expressive";
  return {
    background: expressive
      ? "14283D"
      : template === "Editorial"
        ? "F5F1E9"
        : "FFFFFF",
    foreground: expressive ? "FFFFFF" : "202124",
    accent: expressive ? "60BBFF" : "007BD6",
    title: { x: 48, y: 46, width: image ? 405 : 864 },
    body: { x: 48, y: 145, width: image ? 405 : 864 },
    image: { x: 500, y: 64, width: 412, height: 410 },
  };
}
function color(hex: string) {
  return rgb(
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  );
}
function wrappedLines(
  text: string,
  font: PDFFont,
  size: number,
  width: number,
) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      for (const character of (line ? " " : "") + word) {
        if (line && font.widthOfTextAtSize(line + character, size) > width) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}
function fitText(
  text: string,
  font: PDFFont,
  width: number,
  height: number,
  initial: number,
) {
  let size = initial;
  while (
    size > 10 &&
    wrappedLines(text, font, size, width).length * size * 1.3 > height
  )
    size--;
  return {
    size,
    lines: wrappedLines(text, font, size, width),
    lineHeight: size * 1.3,
  };
}
export async function exportPresentation(
  client: SupabaseClient,
  p: Presentation,
  format: string,
) {
  if (!p.slides.length)
    throw new RequestError("Generate and save slides before downloading.");
  const images = new Map<string, Buffer>();
  let totalBytes = 0;
  const imageSizes = new Map<string, { width: number; height: number }>();
  for (const asset of p.assets.filter((a) =>
    p.slides.some((s) => s.assetIds.includes(a.id)),
  )) {
    const { data, error } = await client.storage
      .from("presentation-assets")
      .download(asset.path);
    if (error || !data)
      throw new RequestError(
        "An image is unavailable. Check private storage access.",
      );
    const buffer = Buffer.from(await data.arrayBuffer());
    totalBytes += buffer.length;
    if (buffer.length > 10 * 1024 * 1024 || totalBytes > 25 * 1024 * 1024)
      throw new RequestError("Uploaded content exceeds the file size limits.");
    // Convert WebP to PNG on the server for consistent PDF/PPTX image support.
    const normalized =
      asset.type === "image/webp"
        ? await (await import("sharp")).default(buffer).png().toBuffer()
        : buffer;
    images.set(asset.id, normalized);
    const metadata = await (
      await import("sharp")
    )
      .default(normalized)
      .metadata();
    if (!metadata.width || !metadata.height)
      throw new RequestError("Invalid uploaded image.");
    imageSizes.set(asset.id, {
      width: metadata.width,
      height: metadata.height,
    });
  }
  if (format === "pptx") {
    const deck = new PptxGenJS();
    deck.layout = "LAYOUT_WIDE";
    deck.title = p.title;
    deck.subject = "Brayn presentation";
    deck.author = "Brayn";
    p.slides.forEach((s, index) => {
      const image = images.get(s.assetIds[0]);
      const layout = slideLayout(p.template, !!image);
      const slide = deck.addSlide();
      slide.background = { color: layout.background };
      slide.addText(s.title, {
        x: layout.title.x / 72,
        y: layout.title.y / 72,
        w: layout.title.width / 72,
        h: 1.1,
        fontFace: p.template === "Editorial" ? "Georgia" : "Arial",
        fontSize: 30,
        color: layout.foreground,
        breakLine: false,
        margin: 0,
        fit: "shrink",
      });
      slide.addText(s.body, {
        x: layout.body.x / 72,
        y: layout.body.y / 72,
        w: layout.body.width / 72,
        h: 4.2,
        fontFace: "Arial",
        fontSize: 18,
        color: layout.foreground,
        margin: 0,
        valign: "top",
        fit: "shrink",
      });
      if (image) {
        const data = `data:image/${image[0] === 0x89 ? "png" : "jpeg"};base64,${image.toString("base64")}`;
        const dimensions = imageSizes.get(s.assetIds[0])!;
        const factor = Math.min(
          layout.image.width / dimensions.width,
          layout.image.height / dimensions.height,
        );
        const width = dimensions.width * factor,
          height = dimensions.height * factor;
        slide.addImage({
          data,
          x: (layout.image.x + (layout.image.width - width) / 2) / 72,
          y: (layout.image.y + (layout.image.height - height) / 2) / 72,
          w: width / 72,
          h: height / 72,
        });
      }
      slide.addText(String(index + 1), {
        x: 12.5,
        y: 7.1,
        w: 0.3,
        h: 0.2,
        fontSize: 10,
        color: layout.accent,
      });
    });
    return Buffer.from(
      (await deck.write({ outputType: "nodebuffer" })) as Buffer,
    );
  }
  if (format !== "pdf") throw new RequestError("Choose PowerPoint or PDF.");
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(
    await readFile(
      path.join(process.cwd(), "server/presentations/fonts/DejaVuSans.ttf"),
    ),
    { subset: true },
  );
  const editorial = await pdf.embedFont(
    await readFile(
      path.join(process.cwd(), "server/presentations/fonts/DejaVuSerif.ttf"),
    ),
    { subset: true },
  );
  pdf.setTitle(p.title);
  for (const [index, s] of p.slides.entries()) {
    const image = images.get(s.assetIds[0]);
    const layout = slideLayout(p.template, !!image);
    const page = pdf.addPage([WIDTH, HEIGHT]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: WIDTH,
      height: HEIGHT,
      color: color(layout.background),
    });
    const titleFont = p.template === "Editorial" ? editorial : font;
    const titleText = fitText(s.title, titleFont, layout.title.width, 80, 28);
    page.drawText(titleText.lines.join("\n"), {
      x: layout.title.x,
      y: HEIGHT - layout.title.y - titleText.size,
      size: titleText.size,
      lineHeight: titleText.lineHeight,
      font: titleFont,
      color: color(layout.foreground),
    });
    const bodyText = fitText(s.body, font, layout.body.width, 300, 18);
    page.drawText(bodyText.lines.join("\n"), {
      x: layout.body.x,
      y: HEIGHT - layout.body.y - bodyText.size,
      size: bodyText.size,
      lineHeight: bodyText.lineHeight,
      font,
      color: color(layout.foreground),
    });
    if (image) {
      const embedded =
        image[0] === 0x89
          ? await pdf.embedPng(image)
          : await pdf.embedJpg(image);
      const factor = Math.min(
        layout.image.width / embedded.width,
        layout.image.height / embedded.height,
      );
      const width = embedded.width * factor,
        height = embedded.height * factor;
      page.drawImage(embedded, {
        x: layout.image.x + (layout.image.width - width) / 2,
        y: HEIGHT - layout.image.y - (layout.image.height + height) / 2,
        width,
        height,
      });
    }
    page.drawText(String(index + 1), {
      x: WIDTH - 48,
      y: 24,
      size: 10,
      font,
      color: color(layout.accent),
    });
  }
  return Buffer.from(await pdf.save());
}
