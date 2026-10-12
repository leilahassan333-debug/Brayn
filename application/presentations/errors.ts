/** Supabase/PostgREST can reject with plain objects rather than Error instances. */
export function presentationErrorMessage(
  problem: unknown,
  fallback = "The request could not be completed. Try again.",
): string {
  if (problem && typeof problem === "object") {
    const value = problem as { code?: string; message?: unknown };
    if (value.code === "PGRST116")
      return "The saved presentation changed or is no longer accessible. Keep a copy of unsaved text, refresh the page and reopen it before retrying.";
    if (typeof value.message === "string" && value.message.trim())
      return value.message;
  }
  return fallback;
}
