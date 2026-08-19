// documentOracles.test.js — T-02 (batch 2, RED-terminal); packaging and
// advertised-version oracles retired at pdlc-plugin-retirement T24 (FSPEC
// AT-1.6, DECISIONS DEC-09).
//
// Exercises `coveredViolations(root)`, the root-parameterised jest oracle
// that lives in `../lib/document-oracles.mjs`. Also asserts the literal
// `EXEMPTIONS` array, the two-root independence property, the split
// covered-violations fixture guard (on-disk presence + git-tracked-ness),
// §6.3's surviving D-1/D-3 document-correction oracles against CLAUDE.md /
// pdlc/README.md, and the post-sweep `pdlcPluginCompat` handshake check
// that DEC-09 substitutes for the retired packaging/advertised-version
// oracles.
//
// The packaging oracle (`packagingViolations`) and the advertised-version
// oracle (`advertisedVersionViolation`), together with every test and
// fixture helper that existed only to exercise them, were deleted in the
// same commit as `document-oracles.mjs`'s production-code change (BR-SWEEP-4):
// both checked `pdlc/workflows/dist/`'s bundles and
// `distribution-manifest.json`, which the sweep's class 7 had already
// deleted.

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import { coveredViolations, EXEMPTIONS } from "../lib/document-oracles.mjs";
import { satisfiesRange } from "../../engine/lib/handshake.mjs";

import { itOrSkip } from "./helpers/driftCapabilities.js";

// ---------------------------------------------------------------------------
// Roots
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = resolve(HERE, "..");
const LIVE_ROOT = realpathSync(resolve(HERE, "../../..")); // TSPEC §13.4
const COVERED_FIXTURE_ROOT = resolve(HERE, "fixtures", "covered-violations"); // T-10, batch 3

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts });
}

// ---------------------------------------------------------------------------
// §10.1 — EXEMPTIONS (frozen four-member literal, TE F-10)
// ---------------------------------------------------------------------------

describe("EXEMPTIONS (§10.1)", () => {
  test("is the frozen four-member literal, one string per FSPEC §7.5 clause, in clause order", () => {
    expect(EXEMPTIONS).toEqual([
      "generated tree: pdlc/workflows/dist/",
      "feature-docs: docs/<X>/ containing REQ-<X>.md",
      "any distribution-manifest.json",
      "any __tests__/",
    ]);
  });
});

// ---------------------------------------------------------------------------
// §10 / §14 — coveredViolations(root)
// ---------------------------------------------------------------------------

const EXPECTED_SEVEN = [
  "docs/PLAN-top-level.md",
  "docs/_queue/QUEUE.md",
  "docs/design/MASTER-PLAN.md",
  "pdlc/skills/orchestrate-dev/SKILL.md",
  "pdlc/skills/orchestrate-queue/SKILL.md",
  "pdlc/workflows/orchestrate-dev.js",
  "pdlc/workflows/orchestrate-queue.js",
]; // TSPEC §10.1 fixture-contents table, sorted LC_ALL=C by path

describe("coveredViolations (§10, §10.1)", () => {
  test("AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing", () => {
    expect(coveredViolations(LIVE_ROOT)).toEqual([]);
  });

  test("AT-23: coveredViolations(fixture root) returns exactly the 7 expected paths, sorted LC_ALL=C", () => {
    const result = coveredViolations(COVERED_FIXTURE_ROOT);
    expect(result.map((entry) => entry.path)).toEqual(EXPECTED_SEVEN);
    for (const entry of result) {
      expect(Array.isArray(entry.patterns)).toBe(true);
      expect(entry.patterns.length).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------------------
  // DOD-04 — FSPEC §7.5 exemption (iii) needs a DECISIVE fixture.
  //
  // Exemption (iii) is "any distribution-manifest.json", matched by BASENAME.
  // Until now the only manifest in the fixture tree lived at
  // pdlc/workflows/dist/distribution-manifest.json — already exempt under
  // clause (i)'s generated-tree prefix — so clause (iii) was never the
  // decisive exemption and `isDistributionManifest` survived being replaced
  // by `return false` with every oracle suite still green.
  //
  // docs/design/distribution-manifest.json is outside BOTH generated trees,
  // outside any REQ-bearing docs/<X>/ dir (docs/design/ has no REQ-design.md —
  // that is exactly why MASTER-PLAN.md next to it IS a reported violation),
  // and carries no __tests__ segment. Clause (iii) is therefore the only thing
  // standing between it and the report, and it carries a covered pattern
  // ("managed manually") so it would be reported the instant (iii) stops
  // firing. Neither the five patterns nor EXEMPTIONS move (FSPEC §7.5, R-10).
  // -------------------------------------------------------------------------
  describe("exemption (iii) is decisive, not shadowed by (i) (DOD-04)", () => {
    const MANIFEST_REL = "docs/design/distribution-manifest.json";

    test("the fixture manifest exists outside both generated trees and carries a covered pattern", () => {
      const abs = join(COVERED_FIXTURE_ROOT, MANIFEST_REL);
      expect(existsSync(abs)).toBe(true);
      expect(MANIFEST_REL.startsWith(".claude/workflows/")).toBe(false);
      expect(MANIFEST_REL.startsWith("pdlc/workflows/dist/")).toBe(false);
      expect(MANIFEST_REL.split("/")).not.toContain("__tests__");
      // docs/design/ is not a feature-doc dir: no REQ-design.md sibling.
      expect(existsSync(join(COVERED_FIXTURE_ROOT, "docs/design/REQ-design.md"))).toBe(false);
      // Non-vacuity: without a covered pattern the assertion below would hold
      // for any reason at all.
      expect(readFileSync(abs, "utf8").toLowerCase()).toContain("managed manually");
    });

    test("it is absent from coveredViolations(FIXTURE_ROOT) — only clause (iii) can excuse it", () => {
      const reported = coveredViolations(COVERED_FIXTURE_ROOT).map((entry) => entry.path);
      expect(reported).not.toContain(MANIFEST_REL);
      expect(reported).toEqual(EXPECTED_SEVEN);
    });
  });

  describe("two-root independence (§10)", () => {
    test("calling coveredViolations against the fixture root does not perturb the LIVE_ROOT call, or vice versa", () => {
      const liveBefore = coveredViolations(LIVE_ROOT);
      const fixtureResult = coveredViolations(COVERED_FIXTURE_ROOT);
      const liveAfter = coveredViolations(LIVE_ROOT);

      expect(liveAfter).toEqual(liveBefore);
      expect(fixtureResult.map((entry) => entry.path)).toEqual(EXPECTED_SEVEN);
    });
  });
});

// ---------------------------------------------------------------------------
// §10.1, TE Q-04 — the split covered-violations fixture guard.
//
// On-disk presence is capability-free (runs on every runner). Tracked-ness
// is gated by itOrSkip("git", …) since it shells out to `git ls-files`.
// ---------------------------------------------------------------------------

describe("covered-violations fixture guard (§10.1, TE Q-04)", () => {
  const ALL_FIXTURE_RELATIVE_PATHS = [
    ...EXPECTED_SEVEN,
    "docs/some-feature/REQ-some-feature.md",
    "docs/some-feature/FSPEC-some-feature.md",
    "pdlc/workflows/dist/orchestrate-queue.bundle.js",
    "pdlc/workflows/dist/distribution-manifest.json",
    "pdlc/workflows/__tests__/someTest.js",
    "docs/design/distribution-manifest.json",
  ]; // TSPEC §10.1's table, now 13 files (7 expected violations + 6 exempt entries).
  // Corrected from "12-file … + 5 exempt" (SE F-13, Phase CR): the array had held 13
  // entries; only the comment was stale. Verified against `git ls-files` over the fixture root.
  // DOD-04 added docs/design/distribution-manifest.json — the exemption-(iii)
  // witness, which must be exempt for a reason clause (i) cannot also supply.
  // pdlc-plugin-retirement T24 (FSPEC AT-1.6) dropped the fourteenth entry,
  // .claude/workflows/orchestrate-dev.bundle.js: that tree is no longer a
  // generated-tree exemption (EXEMPTIONS §10.1), so it no longer demonstrates
  // clause (i) and was deleted rather than left to become a false violation.

  test("every fixture-inventory file exists on disk (capability-free, every runner)", () => {
    for (const rel of ALL_FIXTURE_RELATIVE_PATHS) {
      expect(existsSync(join(COVERED_FIXTURE_ROOT, rel))).toBe(true);
    }
  });

  itOrSkip(
    "every fixture-inventory file is git-tracked, not merely present on disk",
    "git",
    [
      "AC-6.4's anti-widening guard not verified: the covered-violations fixture's git-tracked-ness could not be confirmed without git, so an untracked stray file masquerading as fixture content would go unnoticed.",
    ],
    () => {
      for (const rel of ALL_FIXTURE_RELATIVE_PATHS) {
        expect(() => run("git", ["ls-files", "--error-unmatch", rel], { cwd: COVERED_FIXTURE_ROOT })).not.toThrow();
      }
    },
  );
});

// ---------------------------------------------------------------------------
// AT-1.6 / DEC-09 — post-sweep plugin/engine compatibility.
//
// The packaging oracle (packagingViolations) and the advertised-version
// oracle (advertisedVersionViolation), and every fixture/helper that only
// existed to exercise them, are gone: both checked `pdlc/workflows/dist/`'s
// bundles and `distribution-manifest.json`, which the retirement sweep's
// class 7 already deleted, making the sweep its own witness (DEC-09). Class
// 9 replaces them with a direct, positive check of the shipped handshake:
// `pdlc/.claude-plugin/plugin.json`'s version equals the literal `0.23.2`
// and `satisfiesRange(version, pdlcPluginCompat).ok === true` against
// `pdlc/engine/package.json`'s declared `pdlcPluginCompat` range. The
// negative arm below exercises the same shipped `satisfiesRange`
// (`pdlc/engine/lib/handshake.mjs`) against a version just outside that
// range so a version bump that silently leaves the handshake window reds
// this suite instead of shipping quietly (DC-03).
// ---------------------------------------------------------------------------

describe("AT-1.6 / DEC-09 — pdlcPluginCompat handshake", () => {
  const pdlcPluginCompat = JSON.parse(
    readFileSync(join(LIVE_ROOT, "pdlc", "engine", "package.json"), "utf8"),
  ).pdlcPluginCompat;

  test("post-sweep plugin.json version is the literal 0.23.2 and satisfies pdlcPluginCompat", () => {
    const pluginJson = JSON.parse(
      readFileSync(join(LIVE_ROOT, "pdlc", ".claude-plugin", "plugin.json"), "utf8"),
    );
    expect(pluginJson.version).toBe("0.23.2");
    expect(satisfiesRange(pluginJson.version, pdlcPluginCompat).ok).toBe(true);
  });

  test("satisfiesRange rejects 0.24.0 against pdlcPluginCompat with a non-null reason (negative arm)", () => {
    const verdict = satisfiesRange("0.24.0", pdlcPluginCompat);
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).not.toBeNull();
  });
});


// ---------------------------------------------------------------------------
// §6.3 — D-1, D-3 document-correction oracles (v2.1, TE F-01; D-2 retired,
// pdlc-plugin-retirement T24, FSPEC AT-1.6).
//
// Asserted against LIVE_ROOT's live document text.
// ---------------------------------------------------------------------------

function extractSection(markdown, headingLine) {
  const lines = markdown.split("\n");
  const startIdx = lines.findIndex((line) => line.trim() === headingLine);
  if (startIdx === -1) {
    throw new Error(`extractSection: heading not found: ${headingLine}`);
  }
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i += 1) {
    if (/^#{1,6}\s/.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join("\n");
}

describe("§6.3 document-correction oracles (D-1, D-3)", () => {
  const claudeMd = readFileSync(join(LIVE_ROOT, "CLAUDE.md"), "utf8");
  const readmeMd = readFileSync(join(LIVE_ROOT, "pdlc", "README.md"), "utf8");

  test("D-1: CLAUDE.md's 'Workflow scripts and the runtime build' section names both pdlc/workflows/dist/ and distribution-manifest.json, and no line co-occurs build-runtime with .claude/workflows/", () => {
    const section = extractSection(claudeMd, "### Workflow scripts and the runtime build");

    expect(section).toEqual(expect.stringContaining("pdlc/workflows/dist/"));
    expect(section).toEqual(expect.stringContaining("distribution-manifest.json"));

    const coOccurs = section
      .split("\n")
      .some((line) => line.includes("build-runtime") && line.includes(".claude/workflows/"));
    expect(coOccurs).toBe(false);
  });

  // D-2 (CLAUDE.md's hooks table names check-workflow-drift.sh, and the
  // skills/scripts inventory names sync-workflows.sh) is retired as of
  // pdlc-plugin-retirement T24 (FSPEC AT-1.6, DEC-09): both scripts are
  // gone, and the assertion requiring CLAUDE.md to keep naming them is gone
  // together with the prose it guarded.

  // -------------------------------------------------------------------------
  // DOD-08 — PLAN §9 requires pdlc/RELEASE-CHECKLIST.md to EXIST "with the
  // three §2.1a rows and carrying none of the five patterns". Only the second
  // half was covered, and only incidentally, by coveredViolations(LIVE_ROOT)
  // == [] — an assertion that gets MORE green if the file is deleted. This is
  // the existence-and-content half.
  // -------------------------------------------------------------------------
  test("DOD-08: pdlc/RELEASE-CHECKLIST.md exists and carries headings for all three §2.1a commitments", () => {
    const checklistPath = join(LIVE_ROOT, "pdlc", "RELEASE-CHECKLIST.md");
    expect(existsSync(checklistPath)).toBe(true);

    const headings = readFileSync(checklistPath, "utf8")
      .split("\n")
      .filter((line) => /^#{1,6}\s/.test(line));

    for (const commitment of [/\bAC-6\.2a\b/, /\bAC-6\.6\b/, /\bNFR-2\b/]) {
      expect(headings.some((line) => commitment.test(line))).toBe(true);
    }
  });

  test("D-3: pdlc/README.md mentions workflows/dist/, and no line matches .claude/workflows/ followed by bundle", () => {
    expect(readmeMd).toEqual(expect.stringContaining("workflows/dist/"));

    const badLine = readmeMd
      .split("\n")
      .some((line) => /\.claude\/workflows\//.test(line) && /bundle/.test(line));
    expect(badLine).toBe(false);
  });
});

// PLAN T14 — AT-1.3's mechanical half (FSPEC L-6, TSPEC §4.4) — red from this batch until
// T15 (PLAN §1.3 skip-naming convention would apply a bare `it.skip`/`describe.skip`, but
// this module is a `SWEPT_SURFACE_MODULES` member for the skip-join orphan-freedom oracle
// (TSPEC §5.5, `consumerCleanup.test.js`), which requires every `pending` assertion in its
// domain to be registered through `describeOrSkip`/`itOrSkip` — a capability-gated
// mechanism this task-sequencing skip does not fit. `hookCompatibility.test.js` is the one
// module excluded from that domain for exactly this reason (see its own comment); this
// module is not excluded, so the red-until-later-task convention here is a plain failing
// `test(...)`, the same pattern the `§6.3 document-correction oracles` block above uses
// ("red from this batch until L-06"). The post-sweep *.test.js literal only holds once
// class 6 (T15's deletions: 19 M-8 modules plus runtimeProvenanceWiring.test.js) lands.
describe("T15: AT-1.3 mechanical half — post-sweep *.test.js literal, L-6 row 1's four titles, L-6 row 2's host retains PROP-COMPAT-04/05/06", () => {
  test("post-sweep pdlc/workflows/__tests__/*.test.js count equals TSPEC §4.4's corrected literal of 99", () => {
    const testDir = resolve(WORKFLOWS, "__tests__");
    const count = readdirSync(testDir).filter((name) => name.endsWith(".test.js")).length;
    expect(count).toBe(99);
  });

  test("L-6 row 1: orchestrateQueue.test.js carries all four re-homed queue-triage assertion titles", () => {
    const source = readFileSync(resolve(WORKFLOWS, "__tests__", "orchestrateQueue.test.js"), "utf8");
    const protectedTitles = [
      "returns no-queue when the queue file is missing",
      "runs the pipeline for a ready entry and sets awaiting-merge",
      "skips a blocked entry per triage and reports idle when none are ready",
      "sets halted status when the pipeline halts",
    ];
    for (const title of protectedTitles) {
      expect(source).toContain(`it("${title}"`);
    }
  });

  test("L-6 row 2: hookCompatibility.test.js still carries PROP-COMPAT-04, PROP-COMPAT-05, PROP-COMPAT-06", () => {
    const source = readFileSync(resolve(WORKFLOWS, "__tests__", "hookCompatibility.test.js"), "utf8");
    for (const propCompat of ["PROP-COMPAT-04", "PROP-COMPAT-05", "PROP-COMPAT-06"]) {
      expect(source).toContain(propCompat);
    }
  });
});

// PLAN T21 — AT-1.5 (FSPEC class 8, TSPEC §9 row 8) — red from this batch until T22. Same
// red-until-later-task convention as the T14/T15 pair and the §6.3 block above (plain failing
// `test(...)`, not `describe.skip`): this module is a `SWEPT_SURFACE_MODULES` member, so a
// capability-gated `pending` assertion would have to go through `describeOrSkip`/`itOrSkip`,
// which this task-sequencing skip does not fit.
describe("T21: AT-1.5 — .worktreeinclude / .gitignore consumer-runtime row", () => {
  test(".worktreeinclude carries no row whose only purpose is the consumer runtime copy", () => {
    const worktreeIncludePath = join(LIVE_ROOT, ".worktreeinclude");
    // A file left with no rows is deleted rather than left empty (AT-1.5) — .worktreeinclude's
    // only row today is the consumer-runtime copy, so post-T22 the file must not exist at all.
    expect(existsSync(worktreeIncludePath)).toBe(false);
  });

  test(".gitignore carries no row whose only purpose is the consumer runtime copy, and its ~20-line rationale block is gone with it", () => {
    const gitignore = readFileSync(join(LIVE_ROOT, ".gitignore"), "utf8");

    expect(gitignore).not.toEqual(expect.stringContaining(".claude/workflows/"));
    expect(gitignore).not.toEqual(expect.stringContaining("Generated consumer runtime copies"));

    // .gitignore's other rows still stand — this is a targeted row deletion, not a rewrite.
    expect(gitignore).toEqual(expect.stringContaining(".tokensave/"));
    expect(gitignore).toEqual(expect.stringContaining("node_modules/"));
    expect(gitignore).toEqual(expect.stringContaining("docs/_decisions/.consolidation-lock"));
    expect(gitignore).toEqual(expect.stringContaining("coverage/"));
  });
});
