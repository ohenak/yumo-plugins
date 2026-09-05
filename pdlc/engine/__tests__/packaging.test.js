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
import { mkdtempSync, rmSync, readFileSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildPairingRecord } from "../scripts/publish-preflight.mjs";
import {
  TSPEC_SOURCE_NOTE,
  WORKFLOW_MEMBERS,
  tspecPackedCount,
  tspecPackedSet,
} from "./_tspec-packed-set.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(ENGINE_ROOT, "..", "..");
const DECISIONS_PATH = path.join(
  REPO_ROOT,
  "docs/_decisions/DECISIONS-plugin-distribution.md",
);

// ─── TSPEC §5.4's literal expected set ────────────────────────────────────
//
// Transcribed once, in `_tspec-packed-set.mjs`, and imported here and by
// `publish-channel.test.js` (CR round-3 TE F-05). It is never derived from a
// directory listing of the code under test (TE round-1 F-01), nor from
// `checkPackedSet`'s own refusal message (TE CR v2 F-03). The co-change
// obligation — TSPEC §5.4 and FSPEC §5.2 move first — is recorded there.

// TSPEC §7 D-6: relative path preserved, never flattened with
// `path.basename` — the vendored `lib/*.mjs` members would otherwise
// resolve to a non-existent top-level `pdlc/workflows/{basename}`.
const WORKFLOW_MODULE_NAMES = WORKFLOW_MEMBERS.filter(
  (member) => member !== "vendor/workflows/VENDOR-MANIFEST.json",
).map((member) => member.replace(/^vendor\/workflows\//, ""));

// Local aliases keeping this file's existing call sites (`licenceRecorded`)
// unchanged while the transcription itself lives in one place.
const expectedPackedSet = ({ licenceRecorded }) => tspecPackedSet({ licence: licenceRecorded });
const expectedMemberCount = ({ licenceRecorded }) => tspecPackedCount({ licence: licenceRecorded });

// wave-12 fix: `packRealTarball()` builds a scratch copy of the engine
// package and its sibling `pdlc/workflows/` directory rather than packing
// `ENGINE_ROOT` in place (see the comment on `packRealTarball` below).
// This list says what gets copied into that scratch tree.
const ENGINE_INPUT_ENTRIES = [
  "package.json",
  "README.md",
  "LICENSE", // conditional (N-2); copied only when present in ENGINE_ROOT
  ".npmignore",
  ".gitignore",
  "bin",
  "lib",
  "scripts",
];

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
// `npm pack`'s `prepack` lifecycle hook shells out to `scripts/prepack.mjs`,
// which deletes and recreates `vendor/workflows/` in place (§5.2). Packing
// `ENGINE_ROOT` itself would therefore mutate the real, git-ignored
// `pdlc/engine/vendor/` for the duration of this test and race other
// in-process test files under `_run-suite.mjs`'s file-level parallelism
// (wave-12 defect: this nondeterministically reddened `cli.test.js`'s
// two-root workflow-module resolution assertions, TSPEC §5.3 AF-3). So
// this builds a scratch copy of the engine package inputs plus a sibling
// `pdlc/workflows/` directory under a temp root, and packs *that* — the
// real checkout is never touched. The scratch tree mirrors the real
// repo's `pdlc/engine` + `pdlc/workflows` sibling layout so the copied,
// unmodified `scripts/prepack.mjs`'s own relative-path resolution
// (`ENGINE_ROOT/../../pdlc/workflows`) still lands on the copied workflow
// modules with no override needed.
function packRealTarball() {
  const buildRoot = mkdtempSync(path.join(tmpdir(), "pdlc-engine-build-"));
  const destDir = mkdtempSync(path.join(tmpdir(), "pdlc-engine-pack-"));
  try {
    const buildEngineDir = path.join(buildRoot, "pdlc", "engine");
    const buildWorkflowsDir = path.join(buildRoot, "pdlc", "workflows");
    mkdirSync(buildEngineDir, { recursive: true });
    mkdirSync(buildWorkflowsDir, { recursive: true });

    for (const entry of ENGINE_INPUT_ENTRIES) {
      const source = path.join(ENGINE_ROOT, entry);
      if (!existsSync(source)) continue; // LICENSE is conditional (N-2)
      cpSync(source, path.join(buildEngineDir, entry), { recursive: true });
    }

    for (const name of WORKFLOW_MODULE_NAMES) {
      const dest = path.join(buildWorkflowsDir, name);
      mkdirSync(path.dirname(dest), { recursive: true });
      cpSync(path.join(REPO_ROOT, "pdlc", "workflows", name), dest);
    }

    const packResult = spawnSync(
      "npm",
      ["pack", "--json", "--pack-destination", destDir],
      { cwd: buildEngineDir, encoding: "utf8" },
    );
    assert.equal(
      packResult.status,
      0,
      `npm pack failed: ${packResult.stderr || packResult.stdout}`,
    );
    const packInfo = JSON.parse(packResult.stdout);
    // npm 12 changed `npm pack --json` from an array to an object keyed by package name.
    const packEntry = Array.isArray(packInfo)
      ? packInfo[0]
      : typeof packInfo.filename === "string"
        ? packInfo
        : Object.values(packInfo)[0];
    const { filename } = packEntry;
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
    rmSync(buildRoot, { recursive: true, force: true });
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

test(
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

// ─── T49: AT-3.8a, full whole-set equality plus pairing-record builder ────
//
// The whole-set assertion (AT-3.8a): the packed tarball equals TSPEC
// §5.4's literal `PK-*` table member-for-member, in both directions, with
// the count conjunct asserted against the **transcribed** list's length
// (never the tarball's own length — BR-8.1 forbids the self-derived
// expectation). This is the last leg to become checkable end-to-end: it
// needs the `files` allow-list (T25), the vendored workflow members
// (T33) and, once N-2 is recorded, the licence discharge (T05) — so T49
// is the task that un-skips it.
//
// `pdlcPairing` itself is checked structurally, not by presence on the
// checked-out `package.json`: TSPEC §5.2:212 states the field is ABSENT in
// the checkout and written only by the publish job (O-6, single-writer),
// and §8.4 fixes the sequence as (1) preflight over the unmutated tree,
// (2) the publish job writes `pdlcPairing`, (3) prepack+pack, (4) PF-4/PF-5
// re-asserted against the packed tarball. Asserting `manifest.pdlcPairing`
// truthy here — before any publish job has run — could never pass and
// contradicted the single-writer decision it was meant to verify.

test(
  "T49: packed tarball equals TSPEC §5.4's expected set member-for-member, both directions, pairing record built per F-5 step 6 (AT-3.8a)",
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
    assert.equal(
      manifest.pdlcPairing,
      undefined,
      "TSPEC §5.2:212 / O-6 single-writer: the preflight tree is unmutated by " +
        "design — pdlcPairing is written by the publish job, never present on " +
        "the checked-out package.json",
    );

    const pluginVersion = JSON.parse(
      readFileSync(
        path.join(REPO_ROOT, "pdlc", ".claude-plugin", "plugin.json"),
        "utf8",
      ),
    ).version;
    const record = buildPairingRecord(manifest, pluginVersion, "engine-v0.1.0", "0".repeat(40));
    assert.deepEqual(
      Object.keys(record).sort(),
      ["commit", "engineVersion", "pluginCompat", "pluginVersionAtTag", "tag"].sort(),
      "F-5 step 6's pairing record must carry exactly these five keys",
    );
    assert.equal(record.engineVersion, manifest.version);
    assert.equal(record.pluginCompat, manifest.pdlcPluginCompat);
  },
);
