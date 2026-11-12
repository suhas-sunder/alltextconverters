import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const staticOnly = new Set(["/privacy-policy/", "/terms-of-service/", "/cookies-policy/"]);
const fixtures = new Map([
  ["/batch-text-files/", "batch-text"],
  ["/markdown-table-converter/", "markdown-table"],
  ["/csv-json-converter/", "csv-json"],
  ["/compare-two-lists/", "compare-two-lists"],
  ["/text-diff/", "text-diff"],
  ["/html-markdown-converter/", "html-markdown"],
  ["/unicode-inspector/", "unicode-inspector"],
  ["/url-query-builder/", "url-query"],
  ["/json-formatter/", "json-formatter"],
  ["/xml-formatter/", "xml-formatter"],
  ["/file-base64-converter/", "file-base64"],
  ["/tools/", "tool-directory"],
]);

const existingRouteWorkflows = [
  ["table-cleanup", "app/client/components/csv-to-list/tableWorkspaceCleanup.ts"],
  ["document-import", "app/client/text/document-import.ts"],
  ["workflow-cleanup", "app/client/text/workflow-cleanup.ts"],
];
const suitePath = name => fileURLToPath(new URL("../tests/" + name + ".browser.mjs", import.meta.url));

function runSuite(name, args) {
  return new Promise((done, reject) => {
    const child = spawn(process.execPath, [suitePath(name), ...args], { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) done();
      else reject(new Error(name + " browser fixture failed (" + (signal ?? code) + ")"));
    });
  });
}

export async function verifyStagedWorkflows({ routes, target, playwrightPath, executablePath }) {
  const tools = routes.filter(route => !staticOnly.has(route));
  assert.ok(tools.length, "staged tool routes are present");
  const names = [];
  for (const route of tools) {
    const suite = fixtures.get(route);
    assert.ok(suite, "No functional browser fixture for staged route " + route);
    await access(suitePath(suite));
    names.push(suite);
  }

  // Some packages extend existing indexable routes and add no staged URL.
  for (const [suite, source] of existingRouteWorkflows) {
    try {
      await access(new URL("../" + source, import.meta.url));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      continue;
    }
    await access(suitePath(suite));
    names.push(suite);
  }

  // Serial execution keeps native clipboard ownership and preview request load stable.
  for (const name of names) {
    console.log("Running staged browser workflow " + name);
    await runSuite(name, [target, playwrightPath, executablePath]);
  }
  console.log("Staged browser workflows passed " + names.length + " of " + names.length + ".");
}
