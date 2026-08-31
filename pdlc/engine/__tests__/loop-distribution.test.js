// TSPEC §7 (Distribution: the packed channel that carries `lib/`), AT-52.
// PLAN P7-01: the engine-side additive-only + importability oracle for the
// packed channel that carries `pdlc/workflows/lib/loop-session.mjs` and
// `pdlc/workflows/lib/escalation-view.mjs` onto an installed engine
// (`@kaneho/pdlc-engine`) -- the pipeline runs the published package, never
// `pdlc/workflows/` directly, so naming the two modules' home in the source
// tree without naming the vendoring channel is a load-bearing-cosmetic
// defect (TSPEC §7).
//
// Every block below is committed `test.skip`, titled with its owning
// `[green]` task's id, P7-02: TSPEC §7 *Ordering* lands D-1, D-2, D-3, D-5
// and D-6 together in one task (splitting them reds a required check at the
// split), so all four conjuncts below turn green in that same task. This is
// the `[red]` task (P7-01) -- each block was run unskipped, observed to
// fail for the reason its own comment states, then skipped.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "..", "..");
const WORKFLOWS_DIR = path.join(REPO_ROOT, "pdlc", "workflows");

const TSPEC_DISTRIBUTION_PATH = path.join(
  REPO_ROOT,
  "docs",
  "completed",
  "pdlc-engine-distribution",
  "TSPEC-pdlc-engine-distribution.md",
);
const FSPEC_DISTRIBUTION_PATH = path.join(
  REPO_ROOT,
  "docs",
  "completed",
  "pdlc-engine-distribution",
  "FSPEC-pdlc-engine-distribution.md",
);

// TSPEC §7's shared delta, transcribed once, here, exactly as its D-1...D-6
// table names the new member this feature adds -- never derived from a
// directory listing. Two shapes: bare (D-1, D-5 -- source-tree-relative, as
// copied *from* `pdlc/workflows/`) and vendored (D-2, D-3 --
// vendor-tree-relative, as it lands *in* `vendor/workflows/`).
const NEW_LIB_MEMBERS_BARE = ["lib/stats.mjs"];
const NEW_LIB_MEMBERS_VENDORED = ["vendor/workflows/lib/stats.mjs"];

// Baselines re-based onto HEAD's post-state: the prior feature's D-1/D-2/
// D-3/D-5 delta (`loop-session.mjs`, `escalation-view.mjs`, bare and
// vendored) has already landed and is no longer "new" -- it is now part of
// the pre-existing member set this feature's single new member is additive
// over.
const D1_BASELINE = [
  "orchestrate-dev.js",
  "orchestrate-queue.js",
  "lib/loop-session.mjs",
  "lib/escalation-view.mjs",
];
const D2_D3_BASELINE = [
  "vendor/workflows/orchestrate-dev.js",
  "vendor/workflows/orchestrate-queue.js",
  "vendor/workflows/VENDOR-MANIFEST.json",
  "vendor/workflows/lib/loop-session.mjs",
  "vendor/workflows/lib/escalation-view.mjs",
];
const D5_BASELINE = [
  "orchestrate-dev.js",
  "orchestrate-queue.js",
  "lib/loop-session.mjs",
  "lib/escalation-view.mjs",
];

// Both-directions-lite: every pre-existing member is still present
// (nothing dropped), and the delta over baseline is exactly `added` --
// nothing else was introduced either.
function assertAdditiveOnly(actual, baseline, added, label) {
  assert.ok(Array.isArray(actual), `${label}: expected an array, got ${typeof actual}`);
  for (const member of baseline) {
    assert.ok(actual.includes(member), `${label}: lost pre-existing member ${member}`);
  }
  for (const member of added) {
    assert.ok(actual.includes(member), `${label}: missing new member ${member}`);
  }
  assert.equal(
    actual.length,
    baseline.length + added.length,
    `${label}: delta over baseline must be exactly the new member, got ${JSON.stringify(actual)}`,
  );
}

// ─── (a) Importability ─────────────────────────────────────────────────
//
// A manifest-only or enumeration-only assertion passes while
// `ERR_MODULE_NOT_FOUND` still fires on an installed engine (TSPEC §7). So
// this invokes the real, unmodified `runPrepack` against the real
// `pdlc/workflows/` checkout into a fresh temp vendor tree -- the same
// recipe `packaging.test.js`'s `packRealTarball()` exercises via `npm
// pack`'s `prepack` lifecycle -- and then reads the bytes of, and
// `import()`s, both `lib/` members from the vendor tree it produced,
// rather than stopping at `VENDOR-MANIFEST.json`'s enumeration.
test("P7-02: vendored orchestrate-queue.js and both lib/ modules are importable from the packed tree", async () => {
  const vendorDir = mkdtempSync(path.join(tmpdir(), "pdlc-loop-distribution-vendor-"));
  try {
    const { runPrepack } = await import("../scripts/prepack.mjs");
    runPrepack({ sourceDir: WORKFLOWS_DIR, vendorDir, engineVersion: "0.0.0-test" });

    // Basic sanity, already true at HEAD: the vendored queue module itself
    // imports cleanly.
    const queueUrl = pathToFileURL(path.join(vendorDir, "orchestrate-queue.js")).href;
    await assert.doesNotReject(import(queueUrl));

    // Both new members must actually have been copied into the vendor
    // tree `runPrepack` produced -- read as bytes, not just enumerated --
    // and must sit where a future `./lib/{name}` relative import from the
    // vendored `orchestrate-queue.js` resolves. Red at HEAD: `MODULE_NAMES`
    // is still the flat two-entry list, so `runPrepack` never attempts to
    // copy either name, and reading them throws `ENOENT`.
    for (const member of NEW_LIB_MEMBERS_BARE) {
      const vendoredPath = path.join(vendorDir, member);
      assert.doesNotThrow(
        () => readFileSync(vendoredPath),
        `expected ${member} to be vendored by runPrepack (TSPEC §7 D-1)`,
      );
      const memberUrl = pathToFileURL(vendoredPath).href;
      await assert.doesNotReject(
        import(memberUrl),
        `expected ${member} to be import()able from the vendor tree`,
      );
    }
  } finally {
    rmSync(vendorDir, { recursive: true, force: true });
  }
});

// ─── (b) Additive-only over D-1, D-2, D-3 and D-5 ──────────────────────
//
// Each constant is read live, via a dynamic namespace import, at test
// time -- never transcribed. (D-6's `WORKFLOW_MODULE_NAMES` in
// `packaging.test.js` is derived from D-3's `WORKFLOW_MEMBERS`, TSPEC §7
// TE F-03: it adds no falsifying power of its own here, and is proved
// separately by conjunct (d)'s copy-step soundness.) Namespace imports are
// used throughout, not named imports, so an as-yet-unexported constant
// (true of D-1, D-2 and D-5 at HEAD) resolves to `undefined` and fails the
// assertion cleanly, rather than crashing the whole file at parse time.
test("P7-02: D-1, D-2, D-3 and D-5 are additive-only over the pre-existing members, at test time", async () => {
  const prepackNs = await import("../scripts/prepack.mjs");
  assertAdditiveOnly(
    prepackNs.MODULE_NAMES,
    D1_BASELINE,
    NEW_LIB_MEMBERS_BARE,
    "D-1 (prepack.mjs MODULE_NAMES)",
  );

  const publishPreflightNs = await import("../scripts/publish-preflight.mjs");
  assertAdditiveOnly(
    publishPreflightNs.WORKFLOW_MEMBERS,
    D2_D3_BASELINE,
    NEW_LIB_MEMBERS_VENDORED,
    "D-2 (publish-preflight.mjs WORKFLOW_MEMBERS)",
  );

  const packedSetNs = await import("./_tspec-packed-set.mjs");
  assertAdditiveOnly(
    packedSetNs.WORKFLOW_MEMBERS,
    D2_D3_BASELINE,
    NEW_LIB_MEMBERS_VENDORED,
    "D-3 (_tspec-packed-set.mjs WORKFLOW_MEMBERS)",
  );
  assert.equal(
    packedSetNs.tspecPackedCount({ licence: false }),
    4 + 15 + 6 + 1,
    "D-3 (_tspec-packed-set.mjs tspecPackedCount): vendored class size must be 6",
  );

  const fixtureMachineNs = await import("../scripts/fixture-machine.mjs");
  assertAdditiveOnly(
    fixtureMachineNs.WORKFLOW_MODULE_NAMES,
    D5_BASELINE,
    NEW_LIB_MEMBERS_BARE,
    "D-5 (fixture-machine.mjs WORKFLOW_MODULE_NAMES)",
  );
});

// ─── (c) D-4 document oracle ────────────────────────────────────────────
//
// TSPEC §7's *Who proves which conjunct* paragraph settles this as a
// test-time document-oracle conjunct, never a review-time obligation:
// `docs/completed/pdlc-engine-distribution/` TSPEC §5.4's `PK-*` table,
// FSPEC §5.2's per-class count and AT-3.8b's member-count sentence must
// agree with `tspecPackedCount`'s vendored class size -- derived from the
// live constant, never compared against a literal transcribed here.
test("P7-02: docs/completed/pdlc-engine-distribution/ TSPEC §5.4, FSPEC §5.2 and AT-3.8b agree with tspecPackedCount's vendored class size", async () => {
  const { tspecPackedCount } = await import("./_tspec-packed-set.mjs");
  // 4 manifest-adjacent/bin/ + 15 lib/*.mjs + 1 install script; the
  // remainder of the licence:false count is the vendored class size.
  const vendoredClassSize = tspecPackedCount({ licence: false }) - (4 + 15 + 1);
  // Number-word map, not a single-value ternary: this feature's D-3 grows
  // the vendored class from five to six, and the map must keep agreeing
  // with whichever word the sibling documents (TSPEC §5.4 / AT-3.8b, FSPEC
  // §5.2) name at test time, not just the two values seen so far.
  const CLASS_SIZE_WORDS = { 5: "five", 6: "six" };
  const vendoredClassWord = CLASS_SIZE_WORDS[vendoredClassSize] ?? String(vendoredClassSize);

  const tspecText = readFileSync(TSPEC_DISTRIBUTION_PATH, "utf8");
  const fspecText = readFileSync(FSPEC_DISTRIBUTION_PATH, "utf8");

  assert.match(
    tspecText,
    new RegExp(`names the vendored ${vendoredClassWord}`),
    `TSPEC §5.4 / AT-3.8b's member-count sentence must name the vendored ` +
      `class size tspecPackedCount derives at test time (${vendoredClassSize})`,
  );
  assert.match(
    fspecText,
    new RegExp(`\\*\\*${vendoredClassWord} vendored workflow members\\*\\*`),
    `FSPEC §5.2's per-class count must name the vendored class size ` +
      `tspecPackedCount derives at test time (${vendoredClassSize})`,
  );
  assert.equal(
    vendoredClassSize,
    6,
    "tspecPackedCount's vendored class size must be 6 once D-3 lands (TSPEC §7 D-3)",
  );
});

// ─── (d) Copy-step soundness (D-6) ──────────────────────────────────────
//
// `packaging.test.js`'s `packRealTarball()` derives its own workflow
// member list from D-3's `WORKFLOW_MEMBERS` via
// `.filter(...).map(m => path.basename(m))` (`packaging.test.js:49-51`).
// `path.basename` flattens the `lib/` segment: once D-3 grows the vendored
// `lib/` members, that derivation yields bare `loop-session.mjs` /
// `escalation-view.mjs` / `stats.mjs`, which resolve to non-existent
// top-level `pdlc/workflows/` files and `packRealTarball()` throws `ENOENT`
// (TSPEC §7 D-6). This block owns no file but `loop-distribution.test.js`
// (P7-01's file-ownership boundary), so it cannot un-skip
// `packaging.test.js`'s own blocks; instead it reproduces the same
// derivation against the real `pdlc/workflows/` checkout, proving the
// flattening bug independently of when D-3 itself grows. D-3's own
// `WORKFLOW_MEMBERS` is read post-state here -- once this feature's D-3
// task lands, it already carries the new member, so this conjunct iterates
// the post-state member set directly rather than concatenating the delta
// on top (concatenating would double-count the new member once D-3 lands).
test("P7-02: the workflow-member copy step preserves each member's relative path (no path.basename flattening)", async () => {
  const { WORKFLOW_MEMBERS } = await import("./_tspec-packed-set.mjs");
  const postStateMembers = WORKFLOW_MEMBERS.filter(
    (m) => m !== "vendor/workflows/VENDOR-MANIFEST.json",
  );
  // packaging.test.js:49-51's derivation, reproduced here -- post-D-6, the
  // derivation strips the `vendor/workflows/` prefix but preserves the
  // remaining relative path (no `path.basename` flattening) -- never used
  // to decide production behaviour.
  const flattenedNames = postStateMembers.map((m) => m.replace(/^vendor\/workflows\//, ""));

  let firstMissing = null;
  for (const name of flattenedNames) {
    try {
      readFileSync(path.join(WORKFLOWS_DIR, name));
    } catch (err) {
      firstMissing = { name, code: err.code };
      break;
    }
  }
  assert.equal(
    firstMissing,
    null,
    "packRealTarball()'s workflow-member copy step must not throw ENOENT " +
      `once D-3 grows -- got ${JSON.stringify(firstMissing)}; path.basename ` +
      "flattening resolves a lib/ member to a non-existent top-level file " +
      "(TSPEC §7 D-6)",
  );
});
