// statsRealPaths.test.js — PLAN T-18 (pdlc-stats).
//
// Real-path acceptance tests over the live `docs/completed/` archive (TSPEC §6.1, FSPEC §6):
// AT-09, AT-10, AT-11, AT-13, AT-14b, AT-18 and AT-15's symbolic-link leg. Every fixture below
// runs `computeFeatureStats`/`discoverFeatures` (already green — T-13/T-14, PLAN batches 4/5)
// over `realStatsIo()` (T-02), never `fakeStatsIo`, because these legs assert against real
// `lstat`/`readdir`/`readFile` behaviour a hand-built tree cannot falsify (TSPEC §2.4, §6.1).
//
// Every literal below is a measurement of this repository's `docs/completed/` archive as it
// stood on 2026-08-31 — re-measure with `ls docs/completed/<feature>/`. A red here after an
// archive change (a new archival, a harvest) is expected and is not this module's bug; the
// `doc-moves-break-pinned-tests` pattern (RK-4, TSPEC §6.1's own citation) is accepted for this
// exact reason — FSPEC §6 requires literal, non-derived expectations on real paths.
//
// AT-15's enumeration and removal-probe legs are `statsMetrics.test.js` (T-04/T-13)'s, over
// `fakeStatsIo`; only the symbolic-link leg lands here, since `fakeStatsIo` never fabricates a
// symbolic link and cannot distinguish `lstatSync` from `statSync` (TSPEC §6.1's own note).

import fs from "node:fs";
import os from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { computeFeatureStats, discoverFeatures } from "../lib/stats.mjs";
import { realStatsIo } from "./helpers/statsDoubles.js";
import {
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
} from "../orchestrate-dev.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const DOCS_ROOT = join(REPO_ROOT, "docs");
const COMPLETED_ROOT = join(DOCS_ROOT, "completed");

const REAL_PARSERS = Object.freeze({
  parseReviewFilename,
  deriveRoundWindow,
  deriveDodRoundIndex,
  parseResolvedMarker,
});

describe("AT-09: docs/completed/pdlc-advisory-wave-gate/ — TSPEC round is 6, four REVIEW-v{1,2}.md basenames malformed", () => {
  it("measured 2026-08-31 via `ls docs/completed/pdlc-advisory-wave-gate/`", () => {
    const dir = join(COMPLETED_ROOT, "pdlc-advisory-wave-gate");
    const stats = computeFeatureStats(realStatsIo(), REAL_PARSERS, "pdlc-advisory-wave-gate", dir);

    expect(stats.reviewRounds.byDocType.TSPEC).toEqual({
      state: "measured",
      rounds: 6,
      collidingRole: null,
    });
    expect([...stats.reviewRounds.malformed].sort()).toEqual([
      "CROSS-REVIEW-product-manager-REVIEW-v1.md",
      "CROSS-REVIEW-product-manager-REVIEW-v2.md",
      "CROSS-REVIEW-test-engineer-REVIEW-v1.md",
      "CROSS-REVIEW-test-engineer-REVIEW-v2.md",
    ]);
  });
});

describe("AT-10: docs/completed/pdlc-headless-engine/ — TSPEC round is 13, other five rows read harvested", () => {
  it("measured 2026-08-31 via `ls docs/completed/pdlc-headless-engine/`", () => {
    const dir = join(COMPLETED_ROOT, "pdlc-headless-engine");
    const stats = computeFeatureStats(realStatsIo(), REAL_PARSERS, "pdlc-headless-engine", dir);

    expect(stats.reviewRounds.byDocType.TSPEC).toEqual({
      state: "measured",
      rounds: 13,
      collidingRole: null,
    });
    for (const docType of ["REQ", "FSPEC", "PLAN", "PROPERTIES", "DECISIONS"]) {
      expect(stats.reviewRounds.byDocType[docType]).toEqual({
        state: "harvested",
        rounds: null,
        collidingRole: null,
      });
    }
  });
});

describe("AT-11: docs/completed/pdlc-loop-economics/ — DoD rounds is 2, the highest version minus one, not a count", () => {
  it("measured 2026-08-31 via `ls docs/completed/pdlc-loop-economics/`", () => {
    const dir = join(COMPLETED_ROOT, "pdlc-loop-economics");
    const stats = computeFeatureStats(realStatsIo(), REAL_PARSERS, "pdlc-loop-economics", dir);

    expect(stats.dodRounds).toEqual({ state: "measured", rounds: 2 });
  });
});

describe("AT-14b: docs/completed/pdlc-headless-engine/ — exactly four halt entries, phase sequence D, F, I, T", () => {
  it("measured 2026-08-31 via `ls docs/completed/pdlc-headless-engine/`", () => {
    const dir = join(COMPLETED_ROOT, "pdlc-headless-engine");
    const stats = computeFeatureStats(realStatsIo(), REAL_PARSERS, "pdlc-headless-engine", dir);

    expect(stats.halts.map((h) => h.phase)).toEqual(["D", "F", "I", "T"]);
    expect(stats.halts).toHaveLength(4);
  });
});

describe("AT-13: docs/completed/pdlc-wave-resume/, copied into a temp root with a foreign POSTMORTEM added — exactly one halt entry, phase PR, resolved", () => {
  it("the added foreign-feature file contributes nothing (FSPEC AT-13's Given)", () => {
    const tmpRoot = fs.mkdtempSync(join(os.tmpdir(), "pdlc-stats-at13-"));
    try {
      const srcDir = join(COMPLETED_ROOT, "pdlc-wave-resume");
      const destDir = join(tmpRoot, "pdlc-wave-resume");
      fs.cpSync(srcDir, destDir, { recursive: true });
      // added to the copy only, never to the repository — a foreign feature's postmortem,
      // which the per-feature `POSTMORTEM-([^-]+)-{escapedFeature}\.md` pattern never matches.
      fs.writeFileSync(join(destDir, "POSTMORTEM-P-some-other-feature.md"), "RESOLVED: yes\n");

      const stats = computeFeatureStats(realStatsIo(), REAL_PARSERS, "pdlc-wave-resume", destDir);

      expect(stats.halts).toEqual([{ phase: "PR", resolution: "resolved" }]);
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});

describe("AT-18: this repository's docs/ fleet — invariants, not counts", () => {
  it("every feature directory appears exactly once, docs/pdlc-halt-hardening/ is among them, no row is named completed, and the stray docs/PLAN-*.md file yields no row", () => {
    const io = realStatsIo();
    const { features, unclassified } = discoverFeatures(io, DOCS_ROOT);
    const names = features.map((f) => f.name);

    // every feature directory appears exactly once
    expect(new Set(names).size).toBe(names.length);

    // docs/pdlc-halt-hardening/ is among them, resolved to the live directory (BR-02)
    const halt = features.find((f) => f.name === "pdlc-halt-hardening");
    expect(halt).toBeDefined();
    expect(halt.dir).toBe(join(DOCS_ROOT, "pdlc-halt-hardening"));

    // no row is named "completed" — it is the archive directory itself, not a feature
    expect(names).not.toContain("completed");

    // docs/PLAN-pdlc-integration-boundary-gates.md is a file, not a directory — yields no row
    expect(names).not.toContain("PLAN-pdlc-integration-boundary-gates.md");
    expect(names).not.toContain("PLAN-pdlc-integration-boundary-gates");

    // this repository's docs/ tree has no leading-underscore directory outside
    // NON_FEATURE_DIRS at HEAD, so nothing here is unclassified
    expect(unclassified).toEqual([]);
  });
});

describe("AT-15 (symbolic-link leg): a process-family member that is a symlink contributes its own size, not its target's (EC-19)", () => {
  it("processBytes reflects lstat, never stat, on a symlinked cross-review — a statSync implementation reds here", () => {
    const tmpRoot = fs.mkdtempSync(join(os.tmpdir(), "pdlc-stats-at15-"));
    try {
      const feature = "pdlc-stats-at15-fixture";
      const dir = join(tmpRoot, feature);
      fs.mkdirSync(dir);

      // one spec document, so the denominator is non-zero (state stays "measured")
      fs.writeFileSync(join(dir, `REQ-${feature}.md`), "spec contents\n");

      // a target file far larger than the link, deliberately outside the feature
      // directory — discovery is one directory listing (BR-03), never traversal
      const targetPath = join(tmpRoot, "huge-target.md");
      fs.writeFileSync(targetPath, "X".repeat(200000));

      // the process-family member: a symlink whose basename is a real cross-review
      // grammar match, whose target is the huge file above
      const linkPath = join(dir, "CROSS-REVIEW-test-engineer-TSPEC-v1.md");
      fs.symlinkSync(targetPath, linkPath);

      const stats = computeFeatureStats(realStatsIo(), REAL_PARSERS, feature, dir);

      const linkOwnSize = fs.lstatSync(linkPath).size;
      const targetSize = fs.statSync(targetPath).size;

      expect(stats.byteRatio.state).toBe("measured");
      expect(stats.byteRatio.processBytes).toBe(linkOwnSize);
      expect(stats.byteRatio.processBytes).toBeLessThan(targetSize);
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});
