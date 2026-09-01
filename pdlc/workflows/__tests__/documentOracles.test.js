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
// its retired index-manifest file, which the sweep's class 7 had already
// deleted.

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import { coveredViolations, EXEMPTIONS } from "../lib/document-oracles.mjs";
import { ADVISORY_DEFAULTS, ADVISORY_SEAMS, ENVELOPE_DEFAULTS } from "../orchestrate-dev.js";
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
      "any distribution" + "-manifest.json",
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
  // `coveredViolations` walks the tree with `readdirSync` and never consults git
  // (deliberately — AT-23 runs it against a fixture directory that is not a repo).
  // Against LIVE_ROOT that makes AT-22 environment-sensitive: any gitignored local
  // tool cache that happens to contain a covered pattern — `.serena/cache/*.pkl`,
  // `.tokensave/tokensave.db` — reads as a repo violation on the developer's machine
  // but does not exist in CI or a fresh clone. That sensitivity is why the shipped
  // wave-gate command excluded this whole file, which in turn let CODE_REVIEW v1
  // §1-5's red `PROP-SWEEP-2(b)` land invisibly. The fix is to make AT-22 itself
  // environment-independent — a gitignored path is by construction not a repo
  // violation — so the file can run in the gate. `--no-index` is required: several
  // of these caches are untracked, and without it `check-ignore` reports nothing
  // for a path git has never seen.
  function ignoredByGit(relPath) {
    try {
      run("git", ["check-ignore", "-q", "--no-index", relPath], { cwd: LIVE_ROOT });
      return true;
    } catch (err) {
      if (err.status === 1) return false;
      throw err;
    }
  }

  function liveViolations() {
    return coveredViolations(LIVE_ROOT).filter((entry) => !ignoredByGit(entry.path));
  }

  test("AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT), excluding gitignored local state, is empty post-landing", () => {
    expect(liveViolations()).toEqual([]);
  });

  test("AT-22 non-vacuity: the gitignored-path filter narrows nothing that git actually tracks", () => {
    // The filter must only ever remove paths git ignores. Asserting that directly
    // keeps it from degenerating into "return []" if `check-ignore` ever starts
    // succeeding for everything (e.g. a stray `*` rule, or a non-repo cwd).
    for (const entry of coveredViolations(LIVE_ROOT)) {
      if (liveViolations().some((kept) => kept.path === entry.path)) continue;
      expect([entry.path, ignoredByGit(entry.path)]).toEqual([entry.path, true]);
    }
    // And a path that is plainly NOT ignored must survive the filter, so a
    // real violation can never be filtered away.
    expect(ignoredByGit("pdlc/workflows/orchestrate-dev.js")).toBe(false);
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
  // Exemption (iii) is "any" plus the retired index-manifest filename, matched by BASENAME.
  // Until now the only manifest in the fixture tree lived at
  // pdlc/workflows/dist/'s copy of that same retired filename — already exempt under
  // clause (i)'s generated-tree prefix — so clause (iii) was never the
  // decisive exemption and `isDistributionManifest` survived being replaced
  // by `return false` with every oracle suite still green.
  //
  // docs/design/'s copy of that same retired filename is outside BOTH generated trees,
  // outside any REQ-bearing docs/<X>/ dir (docs/design/ has no REQ-design.md —
  // that is exactly why MASTER-PLAN.md next to it IS a reported violation),
  // and carries no __tests__ segment. Clause (iii) is therefore the only thing
  // standing between it and the report, and it carries a covered pattern
  // ("managed manually") so it would be reported the instant (iii) stops
  // firing. Neither the five patterns nor EXEMPTIONS move (FSPEC §7.5, R-10).
  // -------------------------------------------------------------------------
  describe("exemption (iii) is decisive, not shadowed by (i) (DOD-04)", () => {
    const MANIFEST_REL = "docs/design/distribution" + "-manifest.json";

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
    "pdlc/workflows/dist/orchestrate-queue.bundle" + ".js",
    "pdlc/workflows/dist/distribution" + "-manifest.json",
    "pdlc/workflows/__tests__/someTest.js",
    "docs/design/distribution" + "-manifest.json",
  ]; // TSPEC §10.1's table, now 13 files (7 expected violations + 6 exempt entries).
  // Corrected from "12-file … + 5 exempt" (SE F-13, Phase CR): the array had held 13
  // entries; only the comment was stale. Verified against `git ls-files` over the fixture root.
  // DOD-04 added the docs/design/ copy of the retired index-manifest filename — the exemption-(iii)
  // witness, which must be exempt for a reason clause (i) cannot also supply.
  // pdlc-plugin-retirement T24 (FSPEC AT-1.6) dropped the fourteenth entry,
  // the .claude/workflows/ copy of the retired per-module bundle artifact: that tree is no longer a
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
// bundles and its retired index-manifest file, which the retirement sweep's
// class 7 already deleted, making the sweep its own witness (DEC-09). Class
// 9 replaces them with a direct, positive check of the shipped handshake:
// `pdlc/.claude-plugin/plugin.json`'s version satisfies
// `satisfiesRange(version, pdlcPluginCompat).ok === true` against
// `pdlc/engine/package.json`'s declared `pdlcPluginCompat` range. The
// negative arm below exercises the same shipped `satisfiesRange`
// (`pdlc/engine/lib/handshake.mjs`) against a version just outside that
// range so a version bump that silently leaves the handshake window reds
// this suite instead of shipping quietly (DC-03).
//
// The post-sweep pin was originally the frozen literal `0.23.4`. That froze
// the manifest against the rule `pdlc/OPERATIONS.md` states as shipped —
// "changing anything under `pdlc/skills/`, `pdlc/hooks/` or `pdlc/workflows/`
// means bumping `pdlc/.claude-plugin/plugin.json`'s version" — so a branch
// that changed plugin bytes could only stay green by leaving the version
// stale (CODE_REVIEW-pdlc-engineering-loop-v4 B-01). The pin is therefore a
// MONOTONIC bar, not an equality: the shipped version must be strictly
// greater than the post-sweep baseline `0.23.4` and still inside the
// handshake window. A stale manifest reds; a bump that leaves the window
// reds; a compliant bump is green.
// ---------------------------------------------------------------------------

/** `-1 | 0 | 1` over dotted numeric versions; pre-release suffixes are not used here. */
function compareVersions(a, b) {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i += 1) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

describe("AT-1.6 / DEC-09 — pdlcPluginCompat handshake", () => {
  const pdlcPluginCompat = JSON.parse(
    readFileSync(join(LIVE_ROOT, "pdlc", "engine", "package.json"), "utf8"),
  ).pdlcPluginCompat;

  /** The version the retirement sweep left behind; every later plugin-byte change bumps past it. */
  const POST_SWEEP_BASELINE = "0.23.4";

  test("shipped plugin.json version is bumped past the post-sweep baseline and satisfies pdlcPluginCompat", () => {
    const pluginJson = JSON.parse(
      readFileSync(join(LIVE_ROOT, "pdlc", ".claude-plugin", "plugin.json"), "utf8"),
    );
    expect(compareVersions(pluginJson.version, POST_SWEEP_BASELINE)).toBe(1);
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

  test("D-1: CLAUDE.md's 'Workflow scripts and the runtime build' section names pdlc/workflows/dist/ and pdlc-cli.mjs, does not claim the retired index-manifest file survives, and no line co-occurs build-runtime with .claude/workflows/", () => {
    const section = extractSection(claudeMd, "### Workflow scripts and the runtime build");

    expect(section).toEqual(expect.stringContaining("pdlc/workflows/dist/"));
    expect(section).toEqual(expect.stringContaining("pdlc-cli.mjs"));
    expect(section).not.toEqual(expect.stringContaining("distribution" + "-manifest.json"));

    const coOccurs = section
      .split("\n")
      .some((line) => line.includes("build-runtime") && line.includes(".claude/workflows/"));
    expect(coOccurs).toBe(false);
  });

  // D-2 (CLAUDE.md's hooks table names the retired drift-detection script, and the
  // skills/scripts inventory names the retired plugin-channel sync script) is retired as of
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
// ("red from this batch until L-06"). A6-00 bumps this to the pre-sweep count of 100 (it
// added .pdlc-backups/ to .gitignore, not a *.test.js module, so the file count itself is
// unchanged by A6-00 — the literal moves only because TSPEC §4.4's own corrected count
// changed upstream of this task). CR round 1 then moved the count itself for the first
// time: closing TE F-06 required an enabled-tier, `mainDev`-driven A6 module, landed as
// `advisoryWaveGateMain.test.js`, so the pre-sweep figure was 101. CODE_REVIEW v1 §1 finding 3
// moves it a second time, for the same kind of reason: closing that finding required generative
// (`fast-check`) properties for A6's five pure helpers, landed as a module of their own rather
// than folded into `advisoryWaveGate.test.js` — the table-driven cases there pin the named
// examples and remain the readable documentation of intent, while the new module pins the laws
// those examples are instances of. Hence 102. pdlc-wave-resume adds suites of its own
// (`waveResumePreflight.test.js` in batch 1, then three more in batch 2 and one in batch 3, per
// that PLAN's §3.3 manifest) — but its manifest lands one file per wave, so re-pinning the
// literal here would red the wave gate mid-feature at every wave. Its suites share the
// `waveResume*.test.js` namespace, so they take the same treatment as `learnings*`: excluded
// from the census, with that PLAN's §3.3 manifest owning their census. The literal stays 102.
// The literal still is NOT the post-sweep count: it only
// drops to the coupled sweep's post-sweep figure once class 6 (T15's deletions: 19 M-8
// modules plus runtimeProvenanceWiring.test.js) lands in that sweep, at which point the
// coupled sweep must re-derive it — this comment names the coupling rather than leaving it
// to be inferred, and TSPEC §4.4 (a different feature's document) still reads 99.
describe("T15: AT-1.3 mechanical half — post-sweep *.test.js literal, L-6 row 1's four titles, L-6 row 2's host retains PROP-COMPAT-04/05/06", () => {
  test("pre-sweep pdlc/workflows/__tests__/*.test.js count equals 102 (CODE_REVIEW v1's corrected figure; learnings* and waveResume* namespaces census-excluded), pending the coupled sweep's post-sweep re-derivation", () => {
    const testDir = resolve(WORKFLOWS, "__tests__");
    // §4.4's literal counts the population the retirement sweep left behind. The
    // pdlc-learnings-injection feature adds suites under its own reserved
    // `learnings*.test.js` namespace (that PLAN's suite-map closure owns their
    // census), so they are excluded here rather than the literal re-pinned per wave.
    // pdlc-wave-resume's `waveResume*.test.js` suites land one wave at a time and are
    // excluded on the same precedent (its PLAN's §3.3 manifest owns their census).
    // pdlc-engineering-loop does the same under its reserved `loop*.test.js`
    // and `escalationView*.test.js` namespaces (its PLAN's file-ownership
    // table owns that census).
    // pdlc-loop-economics adds new suites under its reserved `loopEconomics*.test.js`
    // namespace, already covered by the `loop` exclusion below (its PLAN's §4
    // file-ownership manifest owns their census).
    // pdlc-stats adds suites under its reserved `stats*.test.js` namespace
    // (its PLAN §2 owns their census), so they are excluded below.
    const count = readdirSync(testDir).filter(
      (name) =>
        name.endsWith(".test.js") &&
        !name.startsWith("learnings") &&
        !name.startsWith("waveResume") &&
        !name.startsWith("loop") &&
        !name.startsWith("escalationView") &&
        !name.startsWith("stats")
    ).length;
    expect(count).toBe(102);
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

    // M-11j's obligation is on the row's *purpose* — the generated distribution channel —
    // not on the path literal. It was originally asserted as "the string `.claude/workflows/`
    // does not appear", a proxy that held only while nothing else needed to ignore that path.
    // CODE_REVIEW v1 §1-1 (pdlc-advisory-wave-gate) measured six machine-local runtime/state
    // artifacts re-tracked under `.claude/`, so the path now needs an ignore rule again for a
    // purpose the retirement never retired: keeping per-machine state out of the index. The
    // proxy is therefore narrowed to what M-11j actually deletes — the channel rationale block
    // and the distribution-channel vocabulary that block carried. The positive obligation on
    // the surviving machine-local rows is asserted by the `.claude/` hygiene block below.
    expect(gitignore).not.toEqual(expect.stringContaining("Generated consumer runtime copies"));
    expect(gitignore).not.toEqual(expect.stringContaining("installed from"));
    expect(gitignore).not.toEqual(expect.stringContaining("pdlc/workflows/dist/"));

    // .gitignore's other rows still stand — this is a targeted row deletion, not a rewrite.
    expect(gitignore).toEqual(expect.stringContaining(".tokensave/"));
    expect(gitignore).toEqual(expect.stringContaining("node_modules/"));
    expect(gitignore).toEqual(expect.stringContaining("docs/_decisions/.consolidation-lock"));
    expect(gitignore).toEqual(expect.stringContaining("coverage/"));
  });
});

// ---------------------------------------------------------------------------
// CODE_REVIEW v1 §1-1 (pdlc-advisory-wave-gate) — machine-local `.claude/` state
// must not be tracked. The review measured six runtime/state artifacts re-added
// to the index by commit `e3b9d5a3`; four of them are the consumer-runtime copies
// `pdlc-plugin-retirement` T22 deleted, and `.claude/pdlc-wave-state.json` is the
// local wave ledger REQ §1 describes as a working-tree observation. Untracking is
// a one-time act; this oracle is what keeps it untracked, since ignore rules do
// not apply to already-tracked paths and so cannot self-heal a re-add.
// ---------------------------------------------------------------------------

describe("`.claude/` machine-local state is untracked and stays untracked (CODE_REVIEW v1 §1-1)", () => {
  const MACHINE_LOCAL_PATHS = [
    ".claude/pdlc-wave-state.json",
    ".claude/workflows/orchestrate-dev.bun" + "dle.js",
    ".claude/workflows/orchestrate-queue.bun" + "dle.js",
    ".claude/workflows/pdlc-cli.mjs",
    ".claude/workflows/.pdlc-dri" + "ft-state.json",
    ".claude/workflows/.pdlc-sync-manifest.json",
  ];

  function trackedUnderDotClaude() {
    return run("git", ["ls-files", ".claude/"], { cwd: LIVE_ROOT })
      .split("\n")
      .filter(Boolean);
  }

  // `git check-ignore` exits 1 when the path is NOT ignored, which execFileSync
  // throws on — so the exit status is the answer, not an error.
  function isIgnored(relPath) {
    try {
      run("git", ["check-ignore", "-q", "--no-index", relPath], { cwd: LIVE_ROOT });
      return true;
    } catch (err) {
      if (err.status === 1) return false;
      throw err;
    }
  }

  test("none of the six machine-local artifacts are tracked", () => {
    const tracked = trackedUnderDotClaude();
    for (const path of MACHINE_LOCAL_PATHS) {
      expect(tracked).not.toContain(path);
    }
  });

  test("the only tracked files under `.claude/` are the two shared, reviewable ones", () => {
    // Set-equality, not a subset check: a seventh machine-local artifact appearing
    // under `.claude/` must red this test even though it is on no list above.
    expect(trackedUnderDotClaude().sort()).toEqual([
      ".claude/pdlc.config.example.json",
      ".claude/settings.json",
    ]);
  });

  test("an ignore rule now stops each of them being re-added", () => {
    for (const path of MACHINE_LOCAL_PATHS) {
      expect([path, isIgnored(path)]).toEqual([path, true]);
    }
  });

  test("the ignore rules are anchored, so the checked-in fixture's nested `.claude/workflows/` is untouched", () => {
    // The anchoring rationale the retirement measured and this feature preserves:
    // an unanchored `.claude/workflows/` matches at every depth and would make new
    // files under the covered-violations fixture un-`git add`-able without `-f`,
    // silently dropping a future fixture file at authoring time.
    const fixtureNested =
      "pdlc/workflows/__tests__/fixtures/covered-violations/.claude/workflows/orchestrate-dev.bun" +
      "dle.js";
    expect(isIgnored(fixtureNested)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CODE_REVIEW v1 §1-6 (pdlc-advisory-wave-gate) — the runbook's advisory-tier
// disclosure family. Four claims in pdlc/OPERATIONS.md's "Advisory tier" section
// were falsified by A6's arrival: the seam count, the seam enumeration, the
// config-key list (and its "four-member" envelope wording) and the per-seam row
// count. They went stale because every one of them was hand-transcribed prose
// with no oracle tying it to the constant it describes. These tests derive the
// expected text FROM the shipped constants, so the next seam or config key reds
// the runbook rather than silently outdating it.
//
// `CLAUDE.md` and `README.md` carry no seam-count prose — checked at review time
// and re-checked here, so the family stays confined to this one file.
// ---------------------------------------------------------------------------

describe("pdlc/OPERATIONS.md advisory-tier disclosure family tracks the shipped constants (CODE_REVIEW v1 §1-6)", () => {
  const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];

  function advisorySection() {
    const operationsMd = readFileSync(join(LIVE_ROOT, "pdlc", "OPERATIONS.md"), "utf8");
    const start = operationsMd.indexOf("## Advisory tier");
    expect(start).toBeGreaterThan(-1);
    const rest = operationsMd.slice(start + 3);
    const end = rest.indexOf("\n## ");
    return end === -1 ? rest : rest.slice(0, end);
  }

  test("(a) the remediation-seam count word equals ADVISORY_SEAMS.length", () => {
    const section = advisorySection();
    const expected = COUNT_WORDS[ADVISORY_SEAMS.length];
    expect(section).toEqual(expect.stringContaining(`${expected}\nnamed seams`));
    // and no other count word is used for the same noun
    for (const word of COUNT_WORDS) {
      if (word === expected) continue;
      expect(section).not.toEqual(expect.stringContaining(`${word}\nnamed seams`));
      expect(section).not.toEqual(expect.stringContaining(`${word} named seams`));
    }
  });

  test("(b) the seam bullet enumerates every member of ADVISORY_SEAMS", () => {
    const section = advisorySection();
    const bullet = section.slice(section.indexOf("- **Seams:**"));
    for (const seam of ADVISORY_SEAMS) {
      expect([seam, bullet.includes(`\`${seam}\``)]).toEqual([seam, true]);
    }
  });

  test("(c) the config-key list names every key of ADVISORY_DEFAULTS and no stale envelope arity", () => {
    const section = advisorySection();
    const bullet = section.slice(section.indexOf("- **Config keys**"));
    for (const key of Object.keys(ADVISORY_DEFAULTS)) {
      expect([key, bullet.includes(`\`${key}\``)]).toEqual([key, true]);
    }
    // The envelope's arity is described in words; it must match ENVELOPE_DEFAULTS.
    const expectedArity = COUNT_WORDS[ENVELOPE_DEFAULTS.length];
    expect(bullet).toEqual(expect.stringContaining(`${expectedArity}-member literal`));
    for (const word of COUNT_WORDS) {
      if (word === expectedArity) continue;
      expect(bullet).not.toEqual(expect.stringContaining(`${word}-member literal`));
    }
  });

  test("(d) the reporting bullet's per-seam row count equals ADVISORY_SEAMS.length", () => {
    const section = advisorySection();
    const bullet = section.slice(section.indexOf("- **Reporting:**"));
    const expected = COUNT_WORDS[ADVISORY_SEAMS.length];
    expect(bullet).toEqual(expect.stringContaining(`${expected} per-seam rows`));
    for (const word of COUNT_WORDS) {
      if (word === expected) continue;
      expect(bullet).not.toEqual(expect.stringContaining(`${word} per-seam rows`));
    }
  });

  test("the disclosure family is confined to OPERATIONS.md — CLAUDE.md and README.md carry no seam-count prose", () => {
    for (const relPath of ["CLAUDE.md", "README.md"]) {
      const text = readFileSync(join(LIVE_ROOT, relPath), "utf8");
      for (const word of COUNT_WORDS) {
        expect(text).not.toEqual(expect.stringContaining(`${word} named seams`));
        expect(text).not.toEqual(expect.stringContaining(`${word} per-seam rows`));
      }
    }
  });
});

// PLAN T27/T28 — AT-2.1/2.2/2.3 (FSPEC §6.2, class 12, M-11k/M-11l). Class 12 is the last
// deletion class: the instructional documents (CLAUDE.md, pdlc/OPERATIONS.md, both READMEs,
// pdlc/RELEASE-CHECKLIST.md) still carried prose about the retired plugin-channel machinery
// (build+sync fresh-clone bootstrap, the sync-manifest `unverified`/`--force` ladder, the
// SessionStart drift hook, worktree consumer-copy caveats) after the machinery itself was
// deleted by earlier classes. BR-DOC-2: removed, not deprecated — no pointer left behind.
describe("T27/T28: AT-2.1/2.2/2.3 — one documented story (class 12)", () => {
  const RETIRED_TERMS = [
    "sync-workflo" + "ws.sh",
    "check-workflow-dri" + "ft.sh",
    "lib/pdlc-dri" + "ft.sh",
    ".worktreeinclude",
    "unverified",
    "--force",
    "Fresh-clone bootstrap",
  ];

  test("AT-2.1: CLAUDE.md carries no instruction to build/sync/force-sync/check-drift/bootstrap a fresh clone's runtime artifacts, and M-11l's retired OPERATIONS.md headings are gone", () => {
    const claudeMd = readFileSync(join(LIVE_ROOT, "CLAUDE.md"), "utf8");
    for (const term of RETIRED_TERMS) {
      expect(claudeMd).not.toEqual(expect.stringContaining(term));
    }
    expect(claudeMd).not.toEqual(expect.stringContaining("### Fresh-clone bootstrap"));

    const operationsMd = readFileSync(join(LIVE_ROOT, "pdlc", "OPERATIONS.md"), "utf8");
    // M-11l's four retired verbatim headings — quoted as they read at the sweep's base commit.
    expect(operationsMd).not.toEqual(expect.stringContaining("## Workflow scripts and the runtime build"));
    expect(operationsMd).not.toEqual(
      expect.stringContaining("## When sync skips a row: `unverified` and `--force`"),
    );
    expect(operationsMd).not.toEqual(expect.stringContaining("## Worktrees"));
    expect(operationsMd).not.toEqual(expect.stringContaining("## Distribution scripts"));
    // M-11l names this heading as deliberately *not* retired — it describes the surviving path.
    expect(operationsMd).toEqual(expect.stringContaining("## The engine channel (`pdlc/engine`)"));

    // Exactly one described way to run the pipeline unattended: the headless engine CLI.
    const pdlcReadme = readFileSync(join(LIVE_ROOT, "pdlc", "README.md"), "utf8");
    expect(pdlcReadme).toEqual(expect.stringContaining("Headless engine"));
    for (const term of RETIRED_TERMS) {
      expect(pdlcReadme).not.toEqual(expect.stringContaining(term));
    }

    const rootReadme = readFileSync(join(LIVE_ROOT, "README.md"), "utf8");
    for (const term of RETIRED_TERMS) {
      expect(rootReadme).not.toEqual(expect.stringContaining(term));
    }
  });

  test("AT-2.2: pdlc/RELEASE-CHECKLIST.md carries no row instructing a check that cannot be performed", () => {
    const checklist = readFileSync(join(LIVE_ROOT, "pdlc", "RELEASE-CHECKLIST.md"), "utf8");
    for (const term of RETIRED_TERMS) {
      expect(checklist).not.toEqual(expect.stringContaining(term));
    }
    // The consolidation-bundle drift-gate distribution note described a mechanism (the queue's
    // SessionStart drift gate) that classes 3 and 4 already deleted.
    expect(checklist).not.toEqual(
      expect.stringContaining("consolidation bundle's drift-gate consequence"),
    );
  });

  test("AT-2.3: no live decision or open queue row mandates the retired copy channel", () => {
    const decisions = readFileSync(
      join(LIVE_ROOT, "docs", "_decisions", "DECISIONS-plugin-distribution.md"),
      "utf8",
    );
    // Every superseded decision carries an explicit superseding entry naming this feature.
    expect(decisions).toEqual(expect.stringContaining("superseded by `pdlc-plugin-retirement`"));

    const queue = readFileSync(join(LIVE_ROOT, "docs", "_queue", "QUEUE.md"), "utf8");
    const releaseCiRow = queue
      .split("\n")
      .find((line) => line.includes("pdlc-release-ci") && line.trim().startsWith("|"));
    expect(releaseCiRow).toBeDefined();
    for (const term of RETIRED_TERMS) {
      expect(releaseCiRow).not.toEqual(expect.stringContaining(term));
    }
  });
});

// ---------------------------------------------------------------------------
// PROP-SWEEP-2 / PROP-SWEEP-3 (FSPEC AC-1.2, L-2, L-3, BR-SWEEP-5; AT-1.2) —
// T29 [gate]. L-3's `grep -rln '<7-term alternation>' $(git ls-files)` is
// the maintainer's hand-run ship-time check; this permanent oracle assembles
// the *same* seven-term command programmatically against LIVE_ROOT and pins
// PROP-SWEEP-2's three conjuncts plus PROP-SWEEP-3's pairwise glob<->
// baseline-disposition check.
// ---------------------------------------------------------------------------

describe("PROP-SWEEP-2/PROP-SWEEP-3: L-3's sweep command (AC-1.2, FSPEC L-2, L-3, BR-SWEEP-5, AT-1.2)", () => {
  // L-2's seven terms, verbatim (FSPEC §4.2 L-2 table) — fragment-assembled
  // so this test file's own source is never itself an eighth sweep hit
  // (the same discipline `document-oracles.mjs`'s COVERED_PATTERNS uses for
  // the same self-reference reason).
  const L2_TERMS = [
    "sync-workflo" + "ws",
    "pdlc-dri" + "ft",
    "check-workflow-dri" + "ft",
    "\\.bundle\\.js",
    "distribution-mani" + "fest",
    "pdlc-dri" + "ft-state",
    "distribution\\.checkEna" + "bled",
  ];

  // Pinned independently of L2_TERMS above, so a change to one array without
  // the other reds this test — guarding PROP-SWEEP-2(c)'s "neither
  // narrowing a term to green a red search (E-12) nor adding a surviving
  // identifier (E-13)" fidelity requirement.
  const EXPECTED_L2_TERMS = [
    "sync-workflo" + "ws",
    "pdlc-dri" + "ft",
    "check-workflow-dri" + "ft",
    "\\.bundle\\.js",
    "distribution-mani" + "fest",
    "pdlc-dri" + "ft-state",
    "distribution\\.checkEna" + "bled",
  ];

  // A-1's frozen allow-list, transcribed from
  // docs/_constraints/pdlc-retirement-baseline.md's glob table (C-6).
  const A1_GLOBS = [
    "docs/completed/**",
    "docs/discarded/**",
    "docs/_decisions/**",
    "docs/_constraints/pdlc-retirement-baseline.md",
    "**/LEARNINGS-*.md",
    "**/POSTMORTEM-*.md",
    "pdlc/workflows/__tests__/fixtures/CODE_REVIEW-*.md",
    "pdlc/workflows/__tests__/fixtures/planParse/**",
    "docs/_queue/QUEUE.md",
    "docs/pdlc-plugin-retirement/**",
    "docs/pdlc-advisory-wave-gate/**",
    "docs/pdlc-learnings-injection/**",
    "docs/pdlc-engineering-loop/**",
    "docs/PLAN-*.md",
    "docs/design/**",
    "docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md",
    "pdlc/hooks/scripts/cleanup-consumer-workflows.sh",
    "pdlc/workflows/__tests__/consumerCleanup.test.js",
    "docs/pdlc-wave-resume/**",
  ];

  // Minimal glob->RegExp: '**/' matches zero or more leading path segments,
  // a lone '**' matches anything including '/', a lone '*' does not cross
  // '/'. Sufficient for A-1's own glob shapes — no '?', no brace expansion,
  // no character classes appear anywhere in the baseline's table.
  function globToRegExp(glob) {
    let out = "";
    let i = 0;
    while (i < glob.length) {
      if (glob.startsWith("**/", i)) {
        out += "(?:.*/)?";
        i += 3;
      } else if (glob.startsWith("**", i)) {
        out += ".*";
        i += 2;
      } else if (glob[i] === "*") {
        out += "[^/]*";
        i += 1;
      } else {
        out += glob[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        i += 1;
      }
    }
    return new RegExp("^" + out + "$");
  }

  function gitTrackedFiles(root) {
    return run("git", ["ls-files"], { cwd: root })
      .split("\n")
      .filter(Boolean);
  }

  // L-3's exact command, run from LIVE_ROOT so the reported paths are the
  // same repo-relative paths A-1's globs are written against.
  function unfilteredSweep() {
    const files = gitTrackedFiles(LIVE_ROOT);
    const pattern = L2_TERMS.join("\\|");
    try {
      const out = run("grep", ["-rln", pattern, ...files], { cwd: LIVE_ROOT });
      return out.split("\n").filter(Boolean).sort();
    } catch (err) {
      // grep exits 1 for "no matches" — not an error condition here, but a
      // non-zero exit for any *other* reason must still surface as a test
      // failure rather than silently reading as an empty sweep (this is
      // exactly the failure mode PROP-SWEEP-2(a)'s non-vacuity control
      // exists to catch).
      if (err.status === 1) {
        return String(err.stdout || "")
          .split("\n")
          .filter(Boolean)
          .sort();
      }
      throw err;
    }
  }

  function minusA1(paths) {
    const matchers = A1_GLOBS.map(globToRegExp);
    return paths.filter((p) => !matchers.some((re) => re.test(p)));
  }

  test("PROP-SWEEP-2(a): the unfiltered sweep is non-empty and contains both A-1 positive-control paths — an empty unfiltered output, from a word-split or a non-zero grep, must not silently read as a pass", () => {
    const unfiltered = unfilteredSweep();
    expect(unfiltered.length).toBeGreaterThan(0);
    expect(unfiltered).toContain("docs/_decisions/DECISIONS-plugin-distribution.md");
    expect(unfiltered).toContain("docs/_constraints/pdlc-retirement-baseline.md");
  });

  test("PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list is empty — AC-1.2's required-empty gate", () => {
    const residual = minusA1(unfilteredSweep());
    expect(residual).toEqual([]);
  });

  test("PROP-SWEEP-2(c): the command's term set-equals L-2's seven terms verbatim — neither narrowed (E-12) nor widened (E-13)", () => {
    expect(L2_TERMS).toHaveLength(7);
    expect([...L2_TERMS].sort()).toEqual([...EXPECTED_L2_TERMS].sort());
  });

  test("PROP-SWEEP-3: every A-1 glob carries a per-file disposition recorded in the baseline — the mirror of PROP-SWEEP-2(c) on the exclusion side", () => {
    const baseline = readFileSync(
      join(LIVE_ROOT, "docs", "_constraints", "pdlc-retirement-baseline.md"),
      "utf8",
    );
    for (const glob of A1_GLOBS) {
      expect(baseline).toEqual(expect.stringContaining(glob));
    }
  });
});
