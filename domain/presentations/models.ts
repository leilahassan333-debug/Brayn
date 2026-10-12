export type PresentationTemplate = "Editorial" | "Minimal" | "Expressive";
export type PresentationAsset = {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
};
export type Slide = { title: string; body: string; assetIds: string[] };
export type Presentation = {
  id: string;
  owner_id: string;
  title: string;
  template: PresentationTemplate;
  notes: string;
  assets: PresentationAsset[];
  slides: Slide[];
  updated_at: string;
  created_at: string;
};
export const templates: PresentationTemplate[] = [
  "Editorial",
  "Minimal",
  "Expressive",
];
export const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/pdf",
];
export function validatePresentation(input: unknown): Presentation {
  const p = input as Presentation;
  if (
    !p ||
    typeof p.id !== "string" ||
    typeof p.owner_id !== "string" ||
    typeof p.title !== "string" ||
    !p.title.trim() ||
    p.title.length > 150 ||
    !templates.includes(p.template) ||
    typeof p.notes !== "string" ||
    p.notes.length > 20000 ||
    !Array.isArray(p.assets) ||
    p.assets.length > 12 ||
    !Array.isArray(p.slides) ||
    p.slides.length > 12
  )
    throw new Error("Invalid presentation data.");
  for (const asset of p.assets)
    if (
      !asset ||
      typeof asset.id !== "string" ||
      typeof asset.name !== "string" ||
      asset.name.length > 255 ||
      typeof asset.path !== "string" ||
      asset.path.length > 200 ||
      !asset.path.startsWith(`${p.owner_id}/${p.id}/`) ||
      !allowedTypes.includes(asset.type) ||
      !Number.isFinite(asset.size) ||
      asset.size < 0 ||
      asset.size > 10 * 1024 * 1024
    )
      throw new Error("Invalid presentation asset.");
  if (p.assets.reduce((sum, a) => sum + a.size, 0) > 25 * 1024 * 1024)
    throw new Error("Use at most 25 MB of files per presentation.");
  for (const slide of p.slides)
    if (
      !slide ||
      typeof slide.title !== "string" ||
      slide.title.length > 100 ||
      typeof slide.body !== "string" ||
      slide.body.length > 600 ||
      !Array.isArray(slide.assetIds) ||
      slide.assetIds.length > 1 ||
      slide.assetIds.some(
        (id) =>
          !p.assets.some((a) => a.id === id && a.type.startsWith("image/")),
      )
    )
      throw new Error("Invalid slide content.");
  return p;
}
