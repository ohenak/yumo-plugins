// loopGuardPaths.test.js — PLAN P8-08 (AT-32).
//
// Document oracle: reads the guard-path extras and the MERGE_GUARD_DEFAULTS literal that
// pdlc/OPERATIONS.md's "Merge guard-path extras (BR-23/BR-24)" section documents — from the
// repo's tracked default-branch content, not the working tree (TSPEC T-Q-01, so an uncommitted
// edit cannot silently satisfy this oracle) — applies the shipped effectiveGuardPaths() to the
// documented extras at render time, and asserts set-equality against the documented
// guarded-path set. The expected set is DERIVED from the doc's own text, never restated as a
// hand-written literal here, so a later widening of MERGE_GUARD_DEFAULTS (BR-23) or a new
// configured extra (BR-24) reds this oracle the moment the doc and the code disagree, rather
// than passing silently.

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { MERGE_GUARD_DEFAULTS, effectiveGuardPaths } from "../orchestrate-dev.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

// TSPEC T-Q-01 / AT-32: read from the repo's tracked default-branch content, not the working
// tree.
const OPERATIONS_TEXT = execSync("git show HEAD:pdlc/OPERATIONS.md", {
  cwd: REPO_ROOT,
  encoding: "utf8",
});

// CR v1 F-05: the extras half of this oracle needs a referent that is NOT the sentence under
// test. Before this, both sides derived from OPERATIONS.md's own bullet list
// (effectiveGuardPaths(x) = defaults ∪ x, so `x` cancelled), making the extras comparison a
// tautology that no fabricated, added or deleted bullet could red.
//
// The referent is this repo's own `.claude/pdlc.config.json` — the file the merge gate actually
// reads, which is what makes AC-5.1a's "the documented set and the enforced set are the same
// object" mean anything. It is gitignored and operator-local, so it is absent in CI and in a
// fresh clone. That case is reported as a NAMED SKIP rather than a silent pass (TE CR v1 F-05's
// explicit condition): an absent referent must be visible, not mistaken for agreement.
//
// It deliberately is NOT `.claude/pdlc.config.example.json`: BR-29/P8-02 requires the example to
// ship `guardPaths: []`, because `effectiveGuardPaths` unions and never subtracts and a non-empty
// example would silently widen every copying consumer's guarded set.
const LIVE_CONFIG_PATH = join(REPO_ROOT, ".claude", "pdlc.config.json");

function liveConfiguredExtras() {
  let raw;
  try {
    raw = readFileSync(LIVE_CONFIG_PATH, "utf8");
  } catch {
    return { present: false, extras: [], reason: `${LIVE_CONFIG_PATH} is absent (gitignored, operator-local)` };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    // A malformed config is a failure, not a skip: the file is present, so the referent exists
    // and is unreadable, which is a real defect rather than an unconfigured machine.
    throw new Error(`${LIVE_CONFIG_PATH} is present but does not parse: ${err.message}`);
  }
  const merge = parsed && parsed.merge;
  if (!merge || !Array.isArray(merge.guardPaths)) {
    return {
      present: false,
      extras: [],
      reason: `${LIVE_CONFIG_PATH} is present but declares no merge.guardPaths array`,
    };
  }
  return { present: true, extras: merge.guardPaths, reason: null };
}

const LIVE = liveConfiguredExtras();

const SECTION_HEADING = "## Merge guard-path extras (BR-23/BR-24)";

/** Slices out the named section, up to (but not including) the next `## ` heading. */
function guardPathSection(text) {
  const start = text.indexOf(SECTION_HEADING);
  if (start < 0) {
    throw new Error(`OPERATIONS.md is missing the "${SECTION_HEADING}" section`);
  }
  const nextHeading = text.indexOf("\n## ", start + SECTION_HEADING.length);
  return nextHeading < 0 ? text.slice(start) : text.slice(start, nextHeading);
}

/** Parses the documented MERGE_GUARD_DEFAULTS literal quoted in the section's prose. */
function documentedDefaults(section) {
  const match = section.match(/`MERGE_GUARD_DEFAULTS`\s*\n\(`(\[[^\]]*\])`/);
  if (!match) {
    throw new Error("OPERATIONS.md does not quote the MERGE_GUARD_DEFAULTS literal");
  }
  return [...match[1].matchAll(/"([^"]+)"/g)].map(([, p]) => p);
}

/** Parses the documented configured extra(s): the "- `path`" bullet list under the section's
 * "…extra is:" line. */
function documentedExtras(section) {
  const anchor = section.indexOf("extra is:");
  if (anchor < 0) {
    throw new Error('OPERATIONS.md does not name the documented guard-path extra ("extra is:")');
  }
  const after = section.slice(anchor);
  return [...after.matchAll(/^- `([^`]+)`$/gm)].map(([, p]) => p);
}

const SECTION = guardPathSection(OPERATIONS_TEXT);
const DOCUMENTED_DEFAULTS = documentedDefaults(SECTION);
const DOCUMENTED_EXTRAS = documentedExtras(SECTION);

function normalized(p) {
  return p.endsWith("/") ? p : `${p}/`;
}

function asSortedSet(paths) {
  return [...new Set(paths.map(normalized))].sort();
}

describe("AT-32: OPERATIONS.md's guard-path extras match the shipped effective set", () => {
  test("OPERATIONS.md names at least one configured guard-path extra", () => {
    expect(DOCUMENTED_EXTRAS.length).toBeGreaterThan(0);
  });

  test("AC-5.1a: the documented extras are set-equal to this repo's ENFORCED (configured) extras", () => {
    // The load-bearing conjunct: `expected` comes from the config file the merge gate reads,
    // `actual` from the prose. Neither side derives from the other, so documenting an extra
    // nobody configured — or configuring one nobody documented — reds this test.
    if (!LIVE.present) {
      // Named skip, never a silent pass: the referent is absent, so this equality is UNCHECKED
      // on this machine and says so out loud. The conjuncts below still run.
      console.warn(`AT-32: enforced-set equality NOT CHECKED — ${LIVE.reason}`);
      return;
    }
    expect(asSortedSet(DOCUMENTED_EXTRAS)).toEqual(asSortedSet(LIVE.extras));
  });

  test("the enforced extras are non-empty when configured (the equality above is not vacuous)", () => {
    if (!LIVE.present) {
      console.warn(`AT-32: non-vacuity NOT CHECKED — ${LIVE.reason}`);
      return;
    }
    expect(LIVE.extras.length).toBeGreaterThan(0);
  });

  test("effectiveGuardPaths(documented extras) is set-equal to the documented guarded-path set", () => {
    // Always runs, config or no config: pins the documented MERGE_GUARD_DEFAULTS literal against
    // the shipped constant, so a later widening of the defaults (BR-23) reds the documentation on
    // every machine. The extras cancel across this comparison by construction — which is exactly
    // why the conjunct above, whose referent is the config file, is the one that carries AC-5.1a.
    const expected = asSortedSet([...DOCUMENTED_DEFAULTS, ...DOCUMENTED_EXTRAS]);
    const actual = asSortedSet(effectiveGuardPaths(DOCUMENTED_EXTRAS));
    expect(actual).toEqual(expected);
  });

  test("membership conjunct: every documented extra is absent from MERGE_GUARD_DEFAULTS (BR-24 additivity)", () => {
    for (const extra of DOCUMENTED_EXTRAS) {
      expect(MERGE_GUARD_DEFAULTS.includes(normalized(extra))).toBe(false);
    }
  });

  test("membership conjunct: every MERGE_GUARD_DEFAULTS member survives into the effective set (BR-23 union-only)", () => {
    const effective = effectiveGuardPaths(DOCUMENTED_EXTRAS);
    for (const def of MERGE_GUARD_DEFAULTS) {
      expect(effective.includes(def)).toBe(true);
    }
  });
});
