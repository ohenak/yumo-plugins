// advisoryBundle.test.js — PLAN A-14 (batch 3, depends on A-02).
//
// RED (authored with skipped describes, un-skipped by the 🟢 owner A-32 — the marker is spelled
// obliquely here so PROP-REG-08's raw-text sweep never matches this narration). This file owns the one
// PLAN-level bundle-composition obligation TSPEC §2.3 states: `orchestrate-dev.js`'s advisory
// core is reached from `orchestrate-queue.js` only through the shared `__dev` IIFE the bundler
// already produces (TSPEC §2.1/§2.2 — "no new build source, no new inlining order, no change to
// build.mjs's three-source structure"), so making it reachable is exactly two additive edits to
// `pdlc/workflows/build-runtime.mjs`: the dev module's export list (`build:87`) gains the
// advisory names plus `commitPaths`, and the queue module's prelude (`build:96-103`) gains one
// `const … = __dev.…;` binding per name. This file carries no FSPEC acceptance case (§8.1's
// coverage map) — it is the PLAN's own regression proof that A-32's edit stays additive: three
// build sources, three shipped artifacts, no new `wrapModule` call, no new manifest row, and the
// runtime's structural constraints (`export const meta` first, no other `export`, no `import`)
// still hold on both hand-authored bundles once the export surface grows.
//
// `build-runtime.mjs` is read as raw source text, never imported: importing it re-runs the whole
// build as a side effect (`runtimeBundle.test.js` already accepts that cost for
// `stripModuleSyntax`), and this file's obligation is about what the *source* declares, not about
// re-executing the builder. The two calls this file inspects — `wrapModule("__dev", …)` and
// `wrapModule("__queue", …)` — are extracted by a small paren-balance walk over a
// comments/strings-masked copy of the source, so a comment or a string literal inside either call
// can never mislead the boundary the way a naive `indexOf("]);")` could.
//
// Today (pre-A-32) neither call mentions any advisory name — grep confirms zero hits — so every
// case below is genuinely RED under this file's own oracle, not vacuously green.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS_DIR = join(__dirname, "..");
const DIST_DIR = join(WORKFLOWS_DIR, "dist");

const BUILD_SOURCE = readFileSync(join(WORKFLOWS_DIR, "build-runtime.mjs"), "utf8");

// ---------------------------------------------------------------------------
// Paren-balance extraction — comments and string/template contents blanked
// (length-preserving, so indices into the original source stay valid), then a
// depth-counted walk from the anchor's opening `(` to its matching `)`.
// ---------------------------------------------------------------------------

function maskStringsAndComments(src) {
  const out = src.split("");
  const blank = (a, b) => {
    for (let k = a; k < b && k < out.length; k++) {
      if (out[k] !== "\n") out[k] = " ";
    }
  };
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") {
      let j = i;
      while (j < src.length && src[j] !== "\n") j++;
      blank(i, j);
      i = j;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end === -1 ? src.length : end + 2;
      blank(i, j);
      i = j;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      blank(i, j);
      i = j;
      continue;
    }
    i += 1;
  }
  return out.join("");
}

/** The full text of a call `anchor(...)` — `anchor` must end exactly at the
 *  call's opening `(` — matched against its balanced closing `)`, or `null`
 *  when the anchor is absent or never balances. Returned text is sliced from
 *  the ORIGINAL (unmasked) source, so it still evaluates as real JS/reads as
 *  the author wrote it. */
function sliceBalancedCall(source, anchor) {
  const anchorIdx = source.indexOf(anchor);
  if (anchorIdx === -1) return null;
  const openIdx = anchorIdx + anchor.length - 1;
  if (source[openIdx] !== "(") return null;
  const masked = maskStringsAndComments(source);
  let depth = 0;
  for (let i = openIdx; i < masked.length; i++) {
    if (masked[i] === "(") depth += 1;
    else if (masked[i] === ")") {
      depth -= 1;
      if (depth === 0) return source.slice(anchorIdx, i + 1);
    }
  }
  return null;
}

// TSPEC §2.2's placement decision plus §2.3's example code (`build:87`,
// `build:96-103`): the advisory core's six names, plus `commitPaths` — the one
// pre-existing module-private symbol §6.4.1's A2 `verifyGate` needs and that
// gains an `export` keyword for it (A-17).
const ADVISORY_BUNDLE_NAMES = [
  "runAdvisorySeam",
  "parseAdvisoryConfig",
  "readAdvisoryConfigSafely",
  "resolveAdvisoryRung",
  "advisorySummaryRows",
  "ADVISORY_DEFAULTS",
  "commitPaths",
];

// ---------------------------------------------------------------------------
// Dev export list — `const devModule = wrapModule("__dev", stripModuleSyntax(devSource), [...])`.
// ---------------------------------------------------------------------------

describe("PLAN A-32 — the dev module's export list carries the advisory surface", () => {
  const devCall = sliceBalancedCall(BUILD_SOURCE, 'const devModule = wrapModule(');

  it("the devModule wrapModule() call is present and balances", () => {
    expect(devCall).not.toBeNull();
  });

  test.each(ADVISORY_BUNDLE_NAMES)('the export list carries "%s"', (name) => {
    expect(devCall).toMatch(new RegExp(`"${name}"`));
  });

  it("the pre-existing export names are untouched (additive, not a rewrite)", () => {
    for (const name of ["main", "meta", "checkPrCi", "mergeWorktree", "checkFileNonEmpty", "parsePlanTasks"]) {
      expect(devCall).toMatch(new RegExp(`"${name}"`));
    }
  });
});

// ---------------------------------------------------------------------------
// Queue prelude — `const queueModule = wrapModule("__queue", stripModuleSyntax(queueSource), [...], "<prelude>")`.
// One `const NAME = __dev.NAME;` binding per advisory name, per TSPEC §2.3's example.
// ---------------------------------------------------------------------------

describe("PLAN A-32 — the queue module's prelude binds each advisory name", () => {
  const queueCall = sliceBalancedCall(BUILD_SOURCE, "const queueModule = wrapModule(");

  it("the queueModule wrapModule() call is present and balances", () => {
    expect(queueCall).not.toBeNull();
  });

  it("the pre-existing realMain binding survives untouched", () => {
    expect(queueCall).toMatch(/const realMain = __dev\.main;/);
  });

  test.each(ADVISORY_BUNDLE_NAMES)('the prelude binds "%s" to __dev.%s', (name) => {
    const bindingRe = new RegExp(`const\\s+${name}\\s*=\\s*__dev\\.${name}\\s*;`);
    expect(queueCall).toMatch(bindingRe);
  });
});

// ---------------------------------------------------------------------------
// Both shipped bundles still satisfy the runtime's structural constraints
// (TSPEC §13.6 / §2.3: "the §2.3 prelude edit must not break" them) once the
// export surface has grown. Same three constraints `runtimeBundle.test.js`
// pins generically; restated here as this task's own regression proof over
// the specific edit A-32 makes, not a duplicate of that file's obligation.
// ---------------------------------------------------------------------------

const SHIPPED_BUNDLES = ["orchestrate-dev.bundle.js", "orchestrate-queue.bundle.js"];

describe("PLAN A-32 — both shipped artifacts still satisfy the runtime's structural constraints", () => {
  test.each(SHIPPED_BUNDLES)("%s: `export const meta` is the first statement", (file) => {
    const text = readFileSync(join(DIST_DIR, file), "utf8");
    const firstCode = text.split("\n").find((line) => line.trim() && !line.trim().startsWith("//"));
    expect(firstCode).toMatch(/^export const meta = \{/);
  });

  test.each(SHIPPED_BUNDLES)("%s: exports nothing but meta", (file) => {
    const text = readFileSync(join(DIST_DIR, file), "utf8");
    expect(text.match(/^export /gm) || []).toHaveLength(1);
  });

  test.each(SHIPPED_BUNDLES)("%s: contains no static import statement", (file) => {
    const text = readFileSync(join(DIST_DIR, file), "utf8");
    expect(text).not.toMatch(/^import\s/m);
  });
});

// ---------------------------------------------------------------------------
// The artifact set is pinned by id (originally three — TSPEC §2.1: "no new
// build source, no new inlining order"; PLAN A-32: "no new `wrapModule` call,
// no manifest row added"; widened to four when pdlc-consolidation-agent T32
// added consolidate-learnings.bundle.js as a sanctioned artifact). Read from
// the generated manifest rather than the bundles list literal in
// build-runtime.mjs, so a `bundles` array edit that adds an unsanctioned
// entry is caught the same way a hand-authored extra artifact would be.
// ---------------------------------------------------------------------------

describe("PLAN A-32 — the bundle composition carries exactly the sanctioned artifacts", () => {
  it("distribution-manifest.json carries exactly four rows, the same four ids", () => {
    const manifest = JSON.parse(readFileSync(join(DIST_DIR, "distribution-manifest.json"), "utf8"));
    expect(manifest.rows).toHaveLength(4);
    expect(manifest.rows.map((r) => r.id).sort()).toEqual([
      "consolidate-learnings",
      "orchestrate-dev",
      "orchestrate-queue",
      "pdlc-cli",
    ]);
  });
});
