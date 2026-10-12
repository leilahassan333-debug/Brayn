import "server-only";
import { createClient } from "@supabase/supabase-js";
import { validatePresentation } from "@/domain/presentations/models";
export class RequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function presentationContext(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new RequestError("Supabase is not configured.", 503);
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new RequestError("Sign in to continue.", 401);
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: auth, error: authError } = await client.auth.getUser(token);
  if (authError || !auth.user)
    throw new RequestError("Your session expired. Sign in again.", 401);
  const text = await request.text();
  if (text.length > 4096) throw new RequestError("Request is too large.");
  let body: { id?: string; format?: string };
  try {
    body = JSON.parse(text);
  } catch {
    throw new RequestError("Invalid request.");
  }
  if (!body || typeof body.id !== "string" || !/^[a-f0-9-]{36}$/i.test(body.id))
    throw new RequestError("Choose a valid presentation.");
  const { data, error } = await client
    .from("presentations")
    .select("*")
    .eq("id", body.id)
    .eq("owner_id", auth.user.id)
    .single();
  if (error || !data)
    throw new RequestError("Presentation not found or access denied.", 404);
  return { client, presentation: validatePresentation(data), body };
}
export function errorResponse(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof RequestError
          ? error.message
          : "The request failed. Check your configuration and try again.",
    },
    {
      status: error instanceof RequestError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
