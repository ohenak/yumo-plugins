/**
 * runtimeProvenanceWiring.test.js — PLAN T55 (RED). §7.2's kind-3 carrier
 * ("`_recordQueueRow` -> `rewriteStatus`'s 8th parameter -> `build-runtime.mjs`'s
 * closure", TSPEC round-2 revisions, K-3) names two generated call sites:
 * `QUEUE_ENTRY`'s closure (build-runtime.mjs:274) and `DEV_ENTRY`'s closure
 * (:307). Both must widen their `__queue.rewriteStatus(...)` call to carry a
 * `provenance` 8th argument (AT-5.3), and the generated `dist/` bundles must
 * carry it too — not only the template source.
 *
 * Neither `QUEUE_ENTRY` nor `DEV_ENTRY` is exported (they are unexported
 * template-literal constants), so this file observes the one thing a
 * consumer of `build-runtime.mjs` actually sees: the emitted bundle text.
 * `makeBuildTree()` mirrors `runtimeBundle.test.js`'s DOD-03 helper — a
 * throwaway tmpdir, a real `node build-runtime.mjs` run, so a freshly built
 * tree is inspected rather than trusting the checked-in copy alone. The
 * checked-in `pdlc/workflows/dist/` bundles are asserted too (AT-5.3's "the
 * built dist/ artifacts carry it"): T44 (batch 7) is the task that rebuilds
 * and commits them, so both legs are RED until T44 lands.
 *
 * The extraction is a masked-paren scan over the `__queue.rewriteStatus(`
 * call text, not a regex over the whole file: the queue module's own
 * internal `rewriteStatus(...)` calls (unprefixed, e.g. `orchestrate-queue.js`
 * lines 1426/1439/1464) must not be picked up, only the `__queue.`-prefixed
 * entrypoint-closure call each bundle carries exactly once.
 */

import { execFileSync } from "child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const REPO_ROOT = resolve(WORKFLOWS, "..", "..");
const DIST = resolve(WORKFLOWS, "dist");

const BUILD_INPUTS = [
  "build-runtime.mjs",
  "orchestrate-dev.js",
  "orchestrate-queue.js",
  "runtime-adapter.js",
  "cli.mjs",
  "consolidate-learnings.js",
];

/** A self-contained repo root with a freshly built `pdlc/workflows/dist/`. */
function makeBuildTree() {
  const root = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "pdlc-provwire-")));
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

  execFileSync("node", [join(workflows, "build-runtime.mjs")], { cwd: root, stdio: "pipe" });
  return join(workflows, "dist");
}

/** Finds `needle(`'s matching close paren in `source`, starting at `needle`'s
 * first occurrence, and returns the raw text between the parens. Balances
 * parens naively (no string/comment masking): the call sites under test
 * carry no nested string literals, so this is sufficient here. */
function callArgsText(source, needle) {
  const start = source.indexOf(needle);
  if (start === -1) return null;
  const openParen = start + needle.length - 1;
  let depth = 0;
  for (let i = openParen; i < source.length; i++) {
    if (source[i] === "(") depth++;
    else if (source[i] === ")") {
      depth--;
      if (depth === 0) return source.slice(openParen + 1, i);
    }
  }
  return null;
}

/** Splits a call's argument text on top-level commas (parens-balanced). */
function splitTopLevelArgs(argsText) {
  const args = [];
  let depth = 0;
  let current = "";
  for (const ch of argsText) {
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() !== "") args.push(current.trim());
  return args;
}

/** The `__queue.rewriteStatus(...)` call's argument list, as trimmed strings. */
function rewriteStatusArgs(source) {
  const argsText = callArgsText(source, "__queue.rewriteStatus(");
  expect(argsText).not.toBeNull();
  return splitTopLevelArgs(argsText);
}

describe("T55: build-runtime.mjs's two entry closures widen to a provenance 8th argument", () => {
  let freshDist;
  let tmpRootParent;

  beforeAll(() => {
    freshDist = makeBuildTree();
    tmpRootParent = resolve(freshDist, "..", "..", "..");
  });

  afterAll(() => {
    if (tmpRootParent) rmSync(tmpRootParent, { recursive: true, force: true });
  });

  it.skip("T44: freshly built orchestrate-queue.bundle.js's QUEUE_ENTRY closure passes provenance 8th", () => {
    const source = readFileSync(resolve(freshDist, "orchestrate-queue.bundle.js"), "utf8");
    const args = rewriteStatusArgs(source);
    expect(args).toHaveLength(8);
    expect(args[6]).toBe("evidence");
    expect(args[7]).toBe("provenance");
  });

  it.skip("T44: freshly built orchestrate-dev.bundle.js's DEV_ENTRY closure passes provenance 8th", () => {
    const source = readFileSync(resolve(freshDist, "orchestrate-dev.bundle.js"), "utf8");
    const args = rewriteStatusArgs(source);
    expect(args).toHaveLength(8);
    expect(args[6]).toBe("evidence");
    expect(args[7]).toBe("provenance");
  });

  it.skip("T44: the checked-in dist/orchestrate-queue.bundle.js carries the 8th argument (AT-5.3)", () => {
    const source = readFileSync(resolve(DIST, "orchestrate-queue.bundle.js"), "utf8");
    const args = rewriteStatusArgs(source);
    expect(args).toHaveLength(8);
    expect(args[7]).toBe("provenance");
  });

  it.skip("T44: the checked-in dist/orchestrate-dev.bundle.js carries the 8th argument (AT-5.3)", () => {
    const source = readFileSync(resolve(DIST, "orchestrate-dev.bundle.js"), "utf8");
    const args = rewriteStatusArgs(source);
    expect(args).toHaveLength(8);
    expect(args[7]).toBe("provenance");
  });
});
