// T-08: anti-drift reds (PLAN T-08; TSPEC §6.4, workflows half).
//
// `pdlc/workflows/lib/stats.mjs` does not exist yet — it is created green by T-12. Every test
// here that needs `REVIEW_DOC_TYPE_ROWS` or `NON_FEATURE_DIRS` loads `lib/stats.mjs` via a
// dynamic `import()` inside the test body (never a top-level import, so the file itself keeps
// loading and skipping) and is wrapped in `.skip` until T-12 lands, at which point the owning
// task un-skips this exact block (never writes a new test beside it).
//
// This task owns exactly two of §6.4's seven anti-drift oracles:
//
//   1. Doc-type catalogue agreement (§3.3) — set-equality between `REVIEW_DOC_TYPE_ROWS` and the
//      doc types the real `orchestrate-dev.js` driver's `parseReviewFilename` accepts, probed
//      with a real role slug over an all-caps candidate set (never a fixed containment check —
//      RK-3 names exactly the drift a containment probe cannot detect).
//   2. Exclusion-set equality (§4.4) — set-equality between `NON_FEATURE_DIRS` and the
//      non-feature directory names actually present at this repository's `docs/` root, with the
//      subset half proven by an artifact-naming witness, never the leading-underscore predicate
//      under test (§6.4: "the witness [is] deliberately *not* §4.4's leading-underscore
//      predicate ... [so] the oracle and the predicate can disagree").
//
// `parseReviewFilename` itself is real HEAD code (T-01's pre-flight gate already confirms it is
// exported from `../orchestrate-dev.js`), so it is imported at top level — only the `lib/stats.mjs`
// half of each oracle is deferred.

import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { parseReviewFilename } from "../orchestrate-dev.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const DOCS_ROOT = join(REPO_ROOT, "docs");

// TSPEC §6.4: "the probe therefore spells `CROSS-REVIEW-software-engineer-{T}-v1.md`" — a real
// role slug (`software-engineer`, from `orchestrate-dev.js`'s reviewer MAP) so a `bad_role`
// short-circuit can never masquerade as a correct `bad_doc_type` rejection.
const ROLE_SLUG = "software-engineer";

// TSPEC §6.4: the all-caps candidate set the probe checks for set-equality against
// `REVIEW_DOC_TYPE_ROWS` — the six accepted names plus eight known-rejected all-caps names, so a
// *seventh* accepted type (not just a missing/extra one from the six) is detectable.
const DOC_TYPE_CANDIDATES = [
  "REQ",
  "FSPEC",
  "TSPEC",
  "PLAN",
  "PROPERTIES",
  "DECISIONS",
  "REVIEW",
  "IMPLEMENTATION",
  "LEARNINGS",
  "POSTMORTEM",
  "CODE_REVIEW",
  "QUEUE",
  "DOD",
  "HANDOFF",
];

describe("T-08: doc-type catalogue set-equality (TSPEC §3.3, §6.4)", () => {
  it("T-12: REVIEW_DOC_TYPE_ROWS is set-equal to the doc types parseReviewFilename accepts, probed over the all-caps candidate set with a real role slug", async () => {
    const { REVIEW_DOC_TYPE_ROWS } = await import("../lib/stats.mjs");

    const acceptedByDriver = DOC_TYPE_CANDIDATES.filter((docType) => {
      const basename = `CROSS-REVIEW-${ROLE_SLUG}-${docType}-v1.md`;
      const result = parseReviewFilename(basename);
      return result.ok === true;
    });

    expect(new Set(acceptedByDriver)).toEqual(new Set(REVIEW_DOC_TYPE_ROWS));
  });

  it("T-12: every known-rejected all-caps candidate is rejected specifically as bad_doc_type, never bad_role", async () => {
    // Guards the probe's own validity (TSPEC §6.4): if the role slug were wrong, every candidate
    // would short-circuit on `bad_role` and the set-equality assertion above would pass
    // vacuously against an empty accepted set. This test would then be the only thing to catch
    // that the probe itself is broken.
    await import("../lib/stats.mjs");

    const rejected = DOC_TYPE_CANDIDATES.filter((docType) => {
      const basename = `CROSS-REVIEW-${ROLE_SLUG}-${docType}-v1.md`;
      return parseReviewFilename(basename).ok === false;
    }).map((docType) => {
      const basename = `CROSS-REVIEW-${ROLE_SLUG}-${docType}-v1.md`;
      return { docType, reason: parseReviewFilename(basename).reason };
    });

    // Jest's expect takes one argument; collect offenders so a failure names them.
    const rejectedForUnexpectedReason = rejected.filter(({ reason }) => reason !== "bad_doc_type");
    expect(rejectedForUnexpectedReason).toEqual([]);
  });
});

// TSPEC §6.4: "the witness [is] deliberately *not* §4.4's leading-underscore predicate ... [so]
// the oracle and the predicate can disagree — which is the only way it can catch anything." A
// directory is deemed a feature directory here if it carries at least one file whose basename
// ends `-{dirname}.md` (an artifact named for it), or it carries no files at all among its
// **immediate** children (EC-03's readable-but-empty feature row) — never by asking whether its
// name starts with `_`.
function isFeatureDirectoryByArtifactWitness(dirName) {
  const absDir = join(DOCS_ROOT, dirName);
  const entries = readdirSync(absDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());
  if (files.length === 0) return true;
  return files.some((entry) => entry.name.endsWith(`-${dirName}.md`));
}

describe("T-08: exclusion-set equality (TSPEC §4.4, §6.4)", () => {
  it("T-12: superset — every NON_FEATURE_DIRS name is present as a directory at docs/", async () => {
    const { NON_FEATURE_DIRS } = await import("../lib/stats.mjs");

    const liveDirNames = readdirSync(DOCS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const missingAtDocsRoot = NON_FEATURE_DIRS.filter((name) => !liveDirNames.includes(name));
    expect(missingAtDocsRoot).toEqual([]);
  });

  it("T-12: subset — every docs/ directory not in NON_FEATURE_DIRS is a feature directory by the artifact-naming witness, never the leading-underscore predicate under test", async () => {
    const { NON_FEATURE_DIRS } = await import("../lib/stats.mjs");

    const liveDirNames = readdirSync(DOCS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const nonExcluded = liveDirNames.filter((name) => !NON_FEATURE_DIRS.includes(name));
    expect(nonExcluded.length).toBeGreaterThan(0);

    const nonWitnessedNonExcluded = nonExcluded.filter(
      (name) => !isFeatureDirectoryByArtifactWitness(name)
    );
    expect(nonWitnessedNonExcluded).toEqual([]);
  });
});

// ─── REQ-STATS-08's "runs no `git` command" conjunct, over the module that
//     actually executes (CR-v1 PM F-06) ─────────────────────────────────────
//
// PROP-RO-05 pins `statsIo()`'s key set in `bin/cli.mjs`, which proves the seam
// handed to `runStats` carries no write member — but not that `lib/stats.mjs`
// refrains from reaching outside that seam on its own. The empirical read-only
// snapshot cannot close the hole either: it excludes `.git/`, the one directory a
// `git` write would touch. This oracle is structural and total over the module's
// own source: `lib/stats.mjs` declares no imports at all, so it has no way to
// spawn a process, run `git`, or open a socket — every capability it uses arrives
// through the injected `StatsIo`/`StatsParsers`.

describe("T-08: lib/stats.mjs reaches outside its injected seams for nothing (REQ-STATS-08, REQ C-1/R-3)", () => {
  const STATS_SOURCE_PATH = join(__dirname, "..", "lib", "stats.mjs");

  it("declares no import and no require — no child_process, no fs, no network capability", () => {
    const source = readFileSync(STATS_SOURCE_PATH, "utf8");
    // Strip line and block comments so a capability named in prose never trips this.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

    // Positive conjunct: the file really was read and really is the module under
    // test — otherwise an empty/misresolved read would pass every negative below.
    expect(code).toEqual(expect.stringContaining("export function runStats"));

    expect(code).not.toMatch(/^\s*import\b/m);
    expect(code).not.toMatch(/\bimport\s*\(/);
    expect(code).not.toMatch(/\brequire\s*\(/);
    for (const capability of ["child_process", "execSync", "spawnSync", "node:fs", "fetch(", "git "]) {
      expect(code).not.toEqual(expect.stringContaining(capability));
    }
  });
});
