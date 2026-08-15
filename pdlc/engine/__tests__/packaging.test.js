// Packaging oracles (PLAN T16): PF-4's both-directions packed-set equality
// against TSPEC §5.4's literal `PK-*` table, run over a real `npm pack` into
// a temp directory — never `--dry-run`, because the vendor rows (PK-20…
// PK-22) exist only once `prepack` has run (FSPEC PF-4). The failure
// message names TSPEC §5.4 as the expected set's source, never the tarball
// or the tree under test (BR-8.1, TSPEC:365-373).
//
// Every block below is committed `test.skip`, titled with its owning
// `[green]` task's id, per PLAN v0.10's skipped-block convention: this is
// the `[red]` task (T16, batch 2), and each block's production dependency
// lands in a later batch — the `files` allow-list (T25, batch 3), the
// `prepack`/vendored workflow members (T33, batch 4), and the final
// whole-set equality plus pairing record (T49, batch 5, after T05's
// batch-4 licence discharge). The owning task un-skips its titled block as
// its first act (§2, §4 kind 1).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "..", "..");
const DECISIONS_PATH = path.join(
  REPO_ROOT,
  "docs/_decisions/DECISIONS-plugin-distribution.md",
);

const TSPEC_SOURCE_NOTE =
  "expected set's source: TSPEC §5.4's literal `PK-*` table " +
  "(docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md §5.4) " +
  "— never a listing of pdlc/engine/lib/ or the tarball itself";

// ─── TSPEC §5.4's literal expected set (never derived from a directory
// listing of the code under test — TE round-1 F-01) ────────────────────────

const LIB_MODULES_AT_HEAD = [
  "adapter",
  "auth",
  "catalogue",
  "guard-measurement",
  "handshake",
  "outcome",
  "report",
  "run",
  "skills",
  "startup",
  "transport-cli",
  "transport",
]; // V-03, PK-5…PK-16

const LIB_MODULES_FROM_THIS_FEATURE = ["resolve-version", "store", "provenance"]; // §3.1, PK-17…PK-19

// AT-3.8b's Workflow-members class (FSPEC §5.2, "three members and nothing
// else" — TSPEC:390, TSPEC:436-438). PK-20…PK-22.
const WORKFLOW_MEMBERS = [
  "vendor/workflows/orchestrate-dev.js",
  "vendor/workflows/orchestrate-queue.js",
  "vendor/workflows/VENDOR-MANIFEST.json",
];

// Builds the full expected packed set (AT-3.8a's whole-set assertion),
// member-for-member, from TSPEC §5.4's literal table. `licenceRecorded`
// is the only conditional member (PK-3): its presence is read from N-2's
// recorded decision, never from whether `pdlc/engine/LICENSE` exists in
// the tree (TSPEC:374-386's deletion-tolerance argument).
function expectedPackedSet({ licenceRecorded }) {
  return [
    "package.json", // PK-1
    "README.md", // PK-2
    ...(licenceRecorded ? ["LICENSE"] : []), // PK-3
    "bin/pdlc.mjs", // PK-4
    "bin/cli.mjs", // PK-4b
    ...LIB_MODULES_AT_HEAD.map((m) => `lib/${m}.mjs`), // PK-5…PK-16
    ...LIB_MODULES_FROM_THIS_FEATURE.map((m) => `lib/${m}.mjs`), // PK-17…PK-19
    ...WORKFLOW_MEMBERS, // PK-20…PK-22
    "scripts/postinstall.mjs", // PK-23
  ];
}

// Count conjunct (TSPEC:387-393, FSPEC:539-541): 4 manifest-adjacent/`bin/`
// + 15 `lib/*.mjs` + 3 vendored + 1 install script + 0/1 licence.
function expectedMemberCount({ licenceRecorded }) {
  return 4 + 15 + 3 + 1 + (licenceRecorded ? 1 : 0);
}

// N-2: has a licence decision been recorded in
// `DECISIONS-plugin-distribution.md`? Read from the decision record,
// never from `pdlc/engine/LICENSE`'s presence in the tree.
function licenceRecorded() {
  let text;
  try {
    text = readFileSync(DECISIONS_PATH, "utf8");
  } catch {
    return false;
  }
  return /^\*\*N-2 recorded:\*\*\s*yes/m.test(text);
}

// Runs a real `npm pack` (never `--dry-run` — TE Q-01, TSPEC:1247-1250)
// into a fresh temp directory and returns the packed member list, each
// entry relative to the package root (the leading `package/` tar prefix
// stripped).
function packRealTarball() {
  const destDir = mkdtempSync(path.join(tmpdir(), "pdlc-engine-pack-"));
  try {
    const packResult = spawnSync(
      "npm",
      ["pack", "--json", "--pack-destination", destDir],
      { cwd: ENGINE_ROOT, encoding: "utf8" },
    );
    assert.equal(
      packResult.status,
      0,
      `npm pack failed: ${packResult.stderr || packResult.stdout}`,
    );
    const [{ filename }] = JSON.parse(packResult.stdout);
    const tarballPath = path.join(destDir, filename);
    const listResult = spawnSync("tar", ["-tzf", tarballPath], {
      encoding: "utf8",
    });
    assert.equal(listResult.status, 0, `tar listing failed: ${listResult.stderr}`);
    return listResult.stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.endsWith("/"))
      .map((line) => line.replace(/^package\//, ""));
  } finally {
    rmSync(destDir, { recursive: true, force: true });
  }
}

// Both-directions set-equality (BR-8.1): an added member and a removed
// member each fail. The failure message names TSPEC §5.4 as the expected
// set's source (PM v4 Q-01), never the tarball.
function assertPackedSetEquals(actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const unexpected = actual.filter((m) => !expectedSet.has(m));
  const missing = expected.filter((m) => !actualSet.has(m));
  assert.deepEqual(
    { unexpected, missing },
    { unexpected: [], missing: [] },
    `Packed set mismatch (${TSPEC_SOURCE_NOTE}). ` +
      `Unexpected members: ${JSON.stringify(unexpected)}. ` +
      `Missing members: ${JSON.stringify(missing)}.`,
  );
}

// ─── T25: `files` allow-list (PLAN §4 kind 1) ──────────────────────────────
//
// `package.json`'s `files` allow-list is what decides the packed set at
// all (D-5): without it, `npm pack` ships whatever `.gitignore` does not
// exclude, including `__tests__/`. This block does not require the vendor
// rows (T33) or the licence discharge (T05) — it only needs the allow-list
// itself, so it is the first leg T25 unskips.

test(
  "T25: files allow-list admits only manifest-adjacent, bin/ and lib/ members — no test corpus",
  () => {
    const packed = packRealTarball();
    assert.ok(
      !packed.some((m) => m.startsWith("__tests__/")),
      `packed set must exclude the test corpus (FSPEC §5.2's excluded-by-set-equality list), got: ${JSON.stringify(packed)}`,
    );
    assert.ok(
      !packed.includes("node_modules"),
      "packed set must exclude node_modules",
    );
    const allowedPrefixes = ["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"];
    const npmAlwaysIncluded = ["package.json", "README.md", "LICENSE"];
    for (const member of packed) {
      const allowed =
        npmAlwaysIncluded.includes(member) ||
        allowedPrefixes.some((prefix) => member === prefix || member.startsWith(prefix));
      assert.ok(allowed, `member outside the declared files allow-list: ${member} (${TSPEC_SOURCE_NOTE})`);
    }
  },
);

// ─── T33: AT-3.8b, Workflow-members class (PLAN §4 kind 1) ─────────────────
//
// `prepack` vendors the two workflow modules and the manifest into
// `vendor/workflows/`, and `.npmignore`'s `!vendor/workflows/` negates the
// `vendor/` git-ignore rule so `files`' `vendor/workflows/` entry actually
// packs them. This sub-assertion is a class check over one row of AT-3.8a,
// not a competing expected side (FSPEC:778-782).

test.skip(
  "T33: packed workflow members equal FSPEC §5.2's Workflow-members class member-for-member (AT-3.8b)",
  () => {
    const packed = packRealTarball();
    const packedWorkflowMembers = packed
      .filter((m) => m.startsWith("vendor/workflows/"))
      .sort();
    assertPackedSetEquals(packedWorkflowMembers, [...WORKFLOW_MEMBERS].sort());
    assert.ok(
      !packed.includes(".npmignore"),
      ".npmignore is never a packed member — npm always excludes it (TSPEC:216-221)",
    );
  },
);

// ─── T49: AT-3.8a, full whole-set equality plus pairing record ────────────
//
// The whole-set assertion (AT-3.8a): the packed tarball equals TSPEC
// §5.4's literal `PK-*` table member-for-member, in both directions, with
// the count conjunct asserted against the **transcribed** list's length
// (never the tarball's own length — BR-8.1 forbids the self-derived
// expectation). This is the last leg to become checkable end-to-end: it
// needs the `files` allow-list (T25), the vendored workflow members
// (T33) and, once N-2 is recorded, the licence discharge (T05) — so T49
// is the task that un-skips it.

test.skip(
  "T49: packed tarball equals TSPEC §5.4's expected set member-for-member, both directions, with pairing record present (AT-3.8a)",
  () => {
    const packed = packRealTarball();
    const licence = licenceRecorded();
    const expected = expectedPackedSet({ licenceRecorded: licence });

    assertPackedSetEquals(packed, expected);

    const transcribedCount = expected.length;
    assert.equal(
      transcribedCount,
      expectedMemberCount({ licenceRecorded: licence }),
      `count conjunct must be asserted against the transcribed PK-* list's length ` +
        `(${licence ? 24 : 23} expected), never the tarball's own length (BR-8.1)`,
    );

    const packageJsonText = readFileSync(
      path.join(ENGINE_ROOT, "package.json"),
      "utf8",
    );
    const manifest = JSON.parse(packageJsonText);
    assert.ok(
      manifest.pdlcPairing,
      "package.json must carry F-5 step 6's pairing record",
    );
  },
);
