import {
  errorResponse,
  presentationContext,
} from "@/server/presentations/context";
import { exportPresentation } from "@/server/presentations/export";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const { client, presentation, body } = await presentationContext(request);
    if (!["pptx", "pdf"].includes(body.format ?? ""))
      return Response.json(
        { error: "Choose PowerPoint or PDF." },
        { status: 400 },
      );
    const bytes = await exportPresentation(client, presentation, body.format!);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type":
          body.format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="presentation.${body.format}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
