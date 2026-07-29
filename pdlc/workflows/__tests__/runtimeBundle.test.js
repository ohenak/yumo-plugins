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
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import { stripModuleSyntax } from "../build-runtime.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "..", "..");
const BUNDLES = ["orchestrate-queue.bundle.js", "orchestrate-dev.bundle.js"];

// Sole output directory per AC-6.1 / TSPEC §2.3 point 1 — T-14 moves build-runtime.mjs's
// OUT_DIR here. Until then, every read below fails with ENOENT: that is the batch-2
// RED-terminal state this file is deliberately left in (PLAN T-05).
const DIST = resolve(WORKFLOWS, "dist");
const MANIFEST_PATH = resolve(DIST, "distribution-manifest.json");

const read = (file) => readFileSync(resolve(DIST, file), "utf8");

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

  it.each(BUNDLES)("keeps %s under pdlc/workflows/dist/ — the sole output directory (AC-6.1)", (file) => {
    // Fails with ENOENT until T-14 moves build-runtime.mjs's OUT_DIR to dist/.
    expect(() => readFileSync(resolve(DIST, file), "utf8")).not.toThrow();
  });

  it("keeps distribution-manifest.json in dist/ as a --check subject (TSPEC §2.3 point 3)", () => {
    // Fails with ENOENT until T-14 emits the manifest; once it exists, --check above must
    // also treat it as a freshness subject (that behavior lives in build-runtime.mjs, T-14).
    expect(() => readFileSync(MANIFEST_PATH, "utf8")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// DOD-03 — the freshness GATE itself must be falsifiable.
//
// The "bundle freshness" case above spawns `--check` against an already-fresh
// tree and asserts exit 0. That passes whether or not the staleness detector
// works: neutralising BOTH `stale = true` assignments in build-runtime.mjs
// (the bundle branch and the manifest branch) was MEASURED to leave the whole
// suite green. The cases below supply the missing direction — a tree that IS
// stale must exit non-zero and say so, naming each stale row.
//
// Everything happens in a throwaway tmpdir. The real pdlc/workflows/dist/ is
// never written to: `makeBuildTree()` copies the four inputs build-runtime.mjs
// reads (three module sources + itself) plus the plugin manifest into a fresh
// root, and runs the builder there, so OUT_DIR resolves inside the tmpdir.
// ---------------------------------------------------------------------------

describe("DOD-03 — build-runtime.mjs --check detects staleness", () => {
  const BUILD_INPUTS = [
    "build-runtime.mjs",
    "orchestrate-dev.js",
    "orchestrate-queue.js",
    "runtime-adapter.js",
  ];
  const tmpRoots = [];

  /** A self-contained repo root whose pdlc/workflows/dist/ was just built and
   * is therefore, by construction, in sync. */
  function makeBuildTree() {
    const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "pdlc-buildcheck-")));
    tmpRoots.push(root);

    const workflows = join(root, "pdlc", "workflows");
    mkdirSync(workflows, { recursive: true });
    mkdirSync(join(root, "pdlc", ".claude-plugin"), { recursive: true });

    for (const file of BUILD_INPUTS) {
      copyFileSync(resolve(WORKFLOWS, file), join(workflows, file));
    }
    copyFileSync(
      resolve(REPO_ROOT, "pdlc", ".claude-plugin", "plugin.json"),
      join(root, "pdlc", ".claude-plugin", "plugin.json")
    );

    // Generate dist/ inside the tmpdir (no --check: this is the write path).
    execFileSync("node", [join(workflows, "build-runtime.mjs")], { cwd: root, stdio: "pipe" });
    return root;
  }

  /** Runs `--check` in `root` and returns { status, output } instead of throwing. */
  function runCheck(root) {
    try {
      const stdout = execFileSync(
        "node",
        [join(root, "pdlc", "workflows", "build-runtime.mjs"), "--check"],
        { cwd: root, encoding: "utf8", stdio: "pipe" }
      );
      return { status: 0, output: stdout };
    } catch (err) {
      return { status: err.status, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
    }
  }

  const distFile = (root, name) => join(root, "pdlc", "workflows", "dist", name);
  const perturb = (root, name) =>
    writeFileSync(distFile(root, name), `${readFileSync(distFile(root, name), "utf8")}\n// hand-edited\n`);

  afterAll(() => {
    for (const root of tmpRoots) rmSync(root, { recursive: true, force: true });
  });

  it("control: a freshly built temp tree passes --check (exit 0, no STALE row)", () => {
    const { status, output } = runCheck(makeBuildTree());
    expect(status).toBe(0);
    expect(output).not.toMatch(/STALE/);
    expect(output).toMatch(/in-sync {2}pdlc\/workflows\/dist\/distribution-manifest\.json/);
  });

  it("a perturbed BUNDLE makes --check exit non-zero and print a STALE row naming it", () => {
    const root = makeBuildTree();
    perturb(root, "orchestrate-dev.bundle.js");

    const { status, output } = runCheck(root);
    expect(status).not.toBe(0);
    expect(output).toMatch(/STALE {4}pdlc\/workflows\/dist\/orchestrate-dev\.bundle\.js/);
    // The manifest's sha1 is computed from the in-memory contents, never re-read
    // from disk, so a hand-edited bundle leaves the manifest itself in sync —
    // which is precisely why the manifest branch needs its own case below.
    expect(output).toMatch(/in-sync {2}pdlc\/workflows\/dist\/distribution-manifest\.json/);
    expect(output).toMatch(/Bundles are out of date/);
  });

  it("a perturbed MANIFEST alone makes --check exit non-zero and print a STALE row naming it", () => {
    const root = makeBuildTree();
    perturb(root, "distribution-manifest.json");

    const { status, output } = runCheck(root);
    expect(status).not.toBe(0);
    expect(output).toMatch(/STALE {4}pdlc\/workflows\/dist\/distribution-manifest\.json/);
    // No bundle was touched, so the bundle branch must NOT be what failed here.
    expect(output).not.toMatch(/STALE {4}pdlc\/workflows\/dist\/orchestrate-\w+\.bundle\.js/);
    expect(output).toMatch(/Bundles are out of date/);
  });

  it("both perturbed: --check exits non-zero and names every stale row", () => {
    const root = makeBuildTree();
    perturb(root, "orchestrate-dev.bundle.js");
    perturb(root, "orchestrate-queue.bundle.js");
    perturb(root, "distribution-manifest.json");

    const { status, output } = runCheck(root);
    expect(status).not.toBe(0);
    for (const name of [...BUNDLES, "distribution-manifest.json"]) {
      expect(output).toMatch(new RegExp(`STALE {4}pdlc/workflows/dist/${name.replace(/\./g, "\\.")}`));
    }
  });

  it("--check writes nothing: a stale tree stays stale after the check", () => {
    const root = makeBuildTree();
    perturb(root, "distribution-manifest.json");
    const before = readFileSync(distFile(root, "distribution-manifest.json"), "utf8");

    expect(runCheck(root).status).not.toBe(0);

    expect(readFileSync(distFile(root, "distribution-manifest.json"), "utf8")).toBe(before);
    expect(runCheck(root).status).not.toBe(0);
  });
});
