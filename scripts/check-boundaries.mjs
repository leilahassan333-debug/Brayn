import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
const violations = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.tsx?$/.test(file)) await check(file);
  }
}
async function check(file) {
  const source = await readFile(file, "utf8");
  const imports = [
    ...source.matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g),
  ].map((match) => match[1]);
  const domain = file.startsWith("domain/"),
    application = file.startsWith("application/");
  const presentation =
    (file.startsWith("features/") || file.startsWith("components/")) &&
    file !== "components/workspace.tsx";
  for (const dependency of imports) {
    if (domain && !dependency.startsWith("./"))
      violations.push(
        `${file}: domain rules may import only other domain modules (${dependency}).`,
      );
    if (
      application &&
      /^@\/(infrastructure|features|components|app|server)\//.test(dependency)
    )
      violations.push(
        `${file}: application code must depend on ports, not implementation layers (${dependency}).`,
      );
    if (presentation && /^@\/(infrastructure|server|app)\//.test(dependency))
      violations.push(
        `${file}: visual components cannot import adapters or server modules (${dependency}).`,
      );
  }
  if (domain && /\b(localStorage|window|document|fetch|process)\b/.test(source))
    violations.push(
      `${file}: domain rules must be independent of browser, environment and network APIs.`,
    );
  if (presentation && /\b(localStorage|fetch)\b|process\.env/.test(source))
    violations.push(
      `${file}: visual components must receive data and callbacks rather than access storage or integrations.`,
    );
}
for (const directory of ["domain", "application", "features", "components"])
  await walk(directory);
if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else console.log("Architecture boundaries verified.");
