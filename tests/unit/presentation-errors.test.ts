import { test } from "node:test";
import assert from "node:assert/strict";
import { presentationErrorMessage } from "@/application/presentations/errors";
test("plain Supabase errors retain useful messages and conflicts explain recovery", () => {
  assert.equal(
    presentationErrorMessage({
      message: "new row violates row-level security policy",
    }),
    "new row violates row-level security policy",
  );
  assert.equal(
    presentationErrorMessage(new Error("Upload exceeds the size limit")),
    "Upload exceeds the size limit",
  );
  assert.match(
    presentationErrorMessage({
      code: "PGRST116",
      message: "JSON object requested, multiple (or no) rows returned",
    }),
    /refresh the page/,
  );
  assert.match(presentationErrorMessage(null), /Try again/);
});
