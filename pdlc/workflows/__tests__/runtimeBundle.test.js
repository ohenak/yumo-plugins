/**
 * runtimeBundle.test.js — the generated bundles must satisfy the workflow
 * runtime's constraints, and must not drift from the canonical modules.
 *
 * Probed against the runtime on 2026-07-27: the sandbox exposes only
 * agent/parallel/pipeline/phase/log/workflow/args/budget/console/setTimeout.
 * A static import, a second export, or a missing leading `meta` refuses to
 * launch — which is exactly how orchestrate-queue was unrunnable before the
 * build step existed. These assertions encode each refusal.
 */

import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { stripModuleSyntax } from "../build-runtime.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "..", "..");
const BUNDLES = ["orchestrate-queue.bundle.js", "orchestrate-dev.bundle.js"];

const read = (file) =>
  readFileSync(resolve(REPO_ROOT, ".claude", "workflows", file), "utf8");

describe("stripModuleSyntax", () => {
  it("drops static import statements", () => {
    expect(stripModuleSyntax('import realMain from "./orchestrate-dev.js";\nconst a = 1;')).toBe(
      "const a = 1;"
    );
  });

  it("unwraps named and default exports", () => {
    expect(stripModuleSyntax("export const meta = {};")).toBe("const meta = {};");
    expect(stripModuleSyntax("export function f() {}")).toBe("function f() {}");
    expect(stripModuleSyntax("export async function g() {}")).toBe("async function g() {}");
    expect(stripModuleSyntax("export default async function main() {}")).toBe(
      "async function main() {}"
    );
  });

  it("leaves dynamic imports alone (they sit in overridden code paths)", () => {
    const src = 'const { execSync } = await import("child_process");';
    expect(stripModuleSyntax(src)).toBe(src);
  });
});

describe.each(BUNDLES)("%s", (file) => {
  it("declares meta as its first statement", () => {
    const firstCode = read(file)
      .split("\n")
      .find((line) => line.trim() && !line.trim().startsWith("//"));
    expect(firstCode).toMatch(/^export const meta = \{/);
  });

  it("exports nothing but meta", () => {
    const exports = read(file).match(/^export /gm) || [];
    expect(exports).toHaveLength(1);
  });

  it("contains no static import statement", () => {
    expect(read(file)).not.toMatch(/^import\s/m);
  });

  it("ends in a top-level return, so the runtime gets a result", () => {
    expect(read(file).trimEnd()).toMatch(/\}\);$/);
  });

  it("routes file IO through the agent-backed adapters", () => {
    const src = read(file);
    expect(src).toMatch(/_checkFile: rtCheckFile/);
    expect(src).toMatch(/_readFile: rtReadFile/);
  });
});

describe("bundle freshness", () => {
  it("is up to date with the canonical modules", () => {
    // Throws (non-zero exit) when a bundle would differ from what is on disk.
    execFileSync("node", [resolve(WORKFLOWS, "build-runtime.mjs"), "--check"], {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
  });
});
