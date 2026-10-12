import {
  errorResponse,
  presentationContext,
} from "@/server/presentations/context";
import { generatePresentation } from "@/server/presentations/generate";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const { client, presentation } = await presentationContext(request);
    return Response.json(await generatePresentation(client, presentation), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
