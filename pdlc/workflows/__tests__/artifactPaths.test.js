/**
 * artifactPaths.test.js — TSPEC §7.4's `artifactPaths` set-equality (AT-4.5).
 *
 * Owner: T23 (RED, batch 2) writes every assertion below, skipped and titled
 * for T38 (GREEN, batch 5), which owns classes 7-11 (PLAN §2 skip convention,
 * operator decision 2026-08-14): LEARNINGS, `CODE_REVIEW-*`, POSTMORTEM,
 * `ADVISORY-*`, and the anchor-appended `CROSS-REVIEW-*` set surfaced through
 * `appendApprovalAnchors`'s `{appended, paths}` return and its three call
 * sites (`reviewLoop`'s PASS branch, `main()`'s two callers of it, and the
 * erratum-confirmation body).
 *
 * The oracle itself — `assertArtifactSetEquality` below — is this task's own
 * harness, not production behaviour, so its self-tests (§0) stay UN-skipped
 * per the PLAN §2 carve-out ("a block that is already satisfiable at its
 * `[red]` task's own wave ... stays un-skipped and running"). They are also
 * this task's falsifier (TE round-1 F-13): a fixture that produces a
 * `CODE_REVIEW-*.md` file with its push removed must redden the equality by
 * NAMING the missing class, not by reporting a bare count mismatch.
 *
 * Every other describe block below asserts against `orchestrate-dev.js`
 * behaviour that does not exist at HEAD (V-14: the only push site is
 * conditional and `converge()`-only) — those blocks are `test.skip`, titled
 * `"T38: ..."`, and T38's first obligation is to remove exactly those `.skip`
 * wrappers, observe the tests red, and implement until green.
 */

import main, { reviewLoop, crossReviewPath } from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";

// ─── §0. The document-class catalogue (TSPEC §7.4's eleven-row table) ────────

/**
 * One entry per class in TSPEC §7.4's table. `re` matches a `docs/{feature}/`
 * relative path (the shape every `artifactPaths` entry takes at HEAD).
 * `QUEUE.md` and `docs/_decisions/` are deliberately ABSENT from this table —
 * TSPEC §7.4 states they are outside AC-4.5's scope entirely, covered instead
 * by AC-5.3's kind 3 (§7.2).
 */
// `[^_/][^/]*` excludes the project's non-feature dirs (`docs/_queue/`,
// `docs/_decisions/`, `docs/_constraints/`) from ever matching a feature
// segment — they are not "restricted to classes the run produced" gaps, they
// are outside AC-4.5's scope entirely (TSPEC §7.4).
const ARTIFACT_CLASSES = [
  { n: 1, id: "REQ", re: /^docs\/[^_/][^/]*\/REQ-[^/]+\.md$/ },
  { n: 2, id: "FSPEC", re: /^docs\/[^_/][^/]*\/FSPEC-[^/]+\.md$/ },
  { n: 3, id: "TSPEC", re: /^docs\/[^_/][^/]*\/TSPEC-[^/]+\.md$/ },
  { n: 4, id: "DECISIONS", re: /^docs\/[^_/][^/]*\/DECISIONS-[^/]+\.md$/ },
  { n: 5, id: "PLAN", re: /^docs\/[^_/][^/]*\/PLAN-[^/]+\.md$/ },
  { n: 6, id: "PROPERTIES", re: /^docs\/[^_/][^/]*\/PROPERTIES-[^/]+\.md$/ },
  { n: 7, id: "LEARNINGS", re: /^docs\/[^_/][^/]*\/LEARNINGS-[^/]+\.md$/ },
  { n: 8, id: "CODE_REVIEW", re: /^docs\/[^_/][^/]*\/CODE_REVIEW-[^/]+-v\d+\.md$/ },
  { n: 9, id: "POSTMORTEM", re: /^docs\/[^_/][^/]*\/POSTMORTEM-[^/]+-[^/]+\.md$/ },
  { n: 10, id: "ADVISORY", re: /^docs\/[^_/][^/]*\/ADVISORY-[^/]+\.md$/ },
  { n: 11, id: "CROSS-REVIEW", re: /^docs\/[^_/][^/]*\/CROSS-REVIEW-[^/]+-[^/]+-v\d+\.md$/ },
];

/** The class label for a path, or `"UNCLASSIFIED"` when nothing in the
 * catalogue matches (e.g. `docs/_queue/QUEUE.md`, `docs/_decisions/*`). */
function classify(path) {
  const hit = ARTIFACT_CLASSES.find((c) => c.re.test(path));
  return hit ? hit.id : "UNCLASSIFIED";
}

/**
 * Set-equality oracle for AT-4.5. Throws a descriptive `Error` naming every
 * missing and every extra class BY NAME — never a bare count — because a bare
 * count mismatch cannot tell an operator which document the pipeline forgot
 * to enumerate (this task's falsifier, TE round-1 F-13).
 *
 * @param {string[]} actual - `result.artifactPaths` from a run
 * @param {string[]} expected - the paths the run's own fixture produced
 */
function assertArtifactSetEquality(actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((p) => !actualSet.has(p));
  const extra = actual.filter((p) => !expectedSet.has(p));
  if (missing.length === 0 && extra.length === 0) return;

  const describe_ = (paths) =>
    paths.map((p) => `${classify(p)} (${p})`).join(", ") || "none";
  throw new Error(
    `artifactPaths set-equality failed.\n` +
      `Missing (produced but not enumerated): ${describe_(missing)}\n` +
      `Extra (enumerated but not produced): ${describe_(extra)}`
  );
}

describe("assertArtifactSetEquality — the oracle itself (un-skipped, T23's own harness)", () => {
  it("passes silently when the produced set and the reported set match exactly", () => {
    const produced = [
      "docs/f/REQ-f.md",
      "docs/f/FSPEC-f.md",
      "docs/f/CODE_REVIEW-f-v1.md",
    ];
    expect(() => assertArtifactSetEquality(produced, produced)).not.toThrow();
  });

  it("names the missing class when a produced CODE_REVIEW-*.md file's push is removed — not a bare count mismatch (falsifier, TE round-1 F-13)", () => {
    const feature = "af-feat";
    const codeReviewPath = `docs/${feature}/CODE_REVIEW-${feature}-v1.md`;
    const produced = [
      `docs/${feature}/REQ-${feature}.md`,
      `docs/${feature}/FSPEC-${feature}.md`,
      codeReviewPath,
    ];
    // The push for CODE_REVIEW-*.md is removed: the run produced the file but
    // never enumerated it, exactly V-14's shape for classes 7-11 at HEAD.
    const reported = produced.filter((p) => p !== codeReviewPath);

    let thrown = null;
    try {
      assertArtifactSetEquality(reported, produced);
    } catch (err) {
      thrown = err;
    }

    expect(thrown).not.toBeNull();
    // Names the class...
    expect(thrown.message).toContain("CODE_REVIEW");
    // ...and the exact path, not merely a length.
    expect(thrown.message).toContain(codeReviewPath);
    // Never degenerates to a bare count-mismatch message.
    expect(thrown.message).not.toMatch(/^expected \d+.*(got|found) \d+/i);
  });

  it("classify() returns UNCLASSIFIED for QUEUE.md and docs/_decisions/ — both outside AC-4.5's scope (TSPEC §7.4)", () => {
    expect(classify("docs/_queue/QUEUE.md")).toBe("UNCLASSIFIED");
    expect(classify("docs/_decisions/DECISIONS-review-severity-bars.md")).toBe(
      "UNCLASSIFIED"
    );
    // A feature-scoped DECISIONS document, by contrast, is class 4.
    expect(classify("docs/some-feat/DECISIONS-some-feat.md")).toBe("DECISIONS");
  });
});

// ─── §1. Classes 1-6 (converge()-owned) — already reach artifactPaths ────────
//
// V-14: converge()'s push (`:11507`) is conditional but reachable for R, F, T,
// P, D — so these already work at HEAD. Asserted here as the FLOOR the
// set-equality test in §8 stands on; not itself a red assertion, but titled
// for T38 because it shares this file's fixture and is folded into the same
// wave (PLAN §2's "one block per owning task", not "one block per behaviour
// change").

describe("T38: classes 1-6 (REQ, FSPEC, TSPEC, PLAN, PROPERTIES) reach artifactPaths via converge()", () => {
  const FEATURE = "test-feat";
  const readParseablePlan = (path) =>
    String(path).includes("/PLAN-")
      ? "| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | `src/one.js` |\n"
      : null;

  function makeSuccessAgent() {
    return async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      if (["se-review", "te-review", "pm-review"].includes(skill)) {
        return 'Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      }
      if (["pm-author", "se-author", "te-author"].includes(skill)) {
        if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
          return "Finalized.\nDECISIONS_WARRANTED: false";
        }
        if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
          return JSON.stringify({
            tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
          });
        }
        return "Document created.";
      }
      if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
      if (skill === "harvest-learnings") return "Harvest complete.";
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      if (skill === "ship-pr") {
        if (prompt.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
        if (prompt.includes("Raise a pull request")) {
          return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        }
        return "Checks.\nCI_STATUS: passed";
      }
      return "Success.";
    };
  }

  function baseArgs() {
    return {
      reqPath: `docs/${FEATURE}/REQ-${FEATURE}.md`,
      _readFile: readParseablePlan,
      _agent: makeSuccessAgent(),
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
    };
  }

  test.skip("T38: a successful run's artifactPaths contains REQ, FSPEC, TSPEC, PLAN and PROPERTIES (DECISIONS not warranted)", async () => {
    const result = await main(baseArgs());
    expect(result.outcome).toBe("success");

    const produced = [
      `docs/${FEATURE}/REQ-${FEATURE}.md`,
      `docs/${FEATURE}/FSPEC-${FEATURE}.md`,
      `docs/${FEATURE}/TSPEC-${FEATURE}.md`,
      `docs/${FEATURE}/PLAN-${FEATURE}.md`,
      `docs/${FEATURE}/PROPERTIES-${FEATURE}.md`,
    ];
    for (const path of produced) {
      expect(result.artifactPaths).toContain(path);
    }
    // DECISIONS_WARRANTED: false ⇒ class 4 is not produced this run, and must
    // not be reported either.
    expect(
      result.artifactPaths.some((p) => classify(p) === "DECISIONS")
    ).toBe(false);
  });
});

// ─── §2. Class 7 (LEARNINGS) and class 8 (CODE_REVIEW) — Phase H and Phase DOD

describe("T38: LEARNINGS-{feature}.md (class 7) reaches artifactPaths after Phase H", () => {
  const FEATURE = "test-feat";
  const readParseablePlan = (path) =>
    String(path).includes("/PLAN-")
      ? "| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | `src/one.js` |\n"
      : null;

  function makeSuccessAgent() {
    return async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      if (["se-review", "te-review", "pm-review"].includes(skill)) {
        return 'Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      }
      if (["pm-author", "se-author", "te-author"].includes(skill)) {
        if (typeof prompt === "string" && prompt.includes("DECISIONS_WARRANTED")) {
          return "Finalized.\nDECISIONS_WARRANTED: false";
        }
        if (typeof prompt === "string" && prompt.includes("Return a JSON object")) {
          return JSON.stringify({
            tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
          });
        }
        return "Document created.";
      }
      if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
      if (skill === "harvest-learnings") return "Harvest complete.";
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      if (skill === "ship-pr") {
        if (prompt.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
        if (prompt.includes("Raise a pull request")) {
          return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        }
        return "Checks.\nCI_STATUS: passed";
      }
      return "Success.";
    };
  }

  function baseArgs() {
    return {
      reqPath: `docs/${FEATURE}/REQ-${FEATURE}.md`,
      _readFile: readParseablePlan,
      _agent: makeSuccessAgent(),
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
    };
  }

  test.skip("T38: a successful run enumerates LEARNINGS-{feature}.md — authored at Phase H outside converge(), never pushed at HEAD", async () => {
    const result = await main(baseArgs());
    expect(result.outcome).toBe("success");
    expect(result.harvestStatus).not.toMatch(/skipped/i);
    expect(result.artifactPaths).toContain(`docs/${FEATURE}/LEARNINGS-${FEATURE}.md`);
  });

  test.skip("T38: CODE_REVIEW-{feature}-v{N}.md (class 8) reaches artifactPaths after Phase DOD passes", async () => {
    const result = await main(baseArgs());
    expect(result.outcome).toBe("success");
    const dod = result.phases.find((p) => p.phase === "DOD");
    expect(dod.status).toBe("✅");
    // dod-verify's loop iterates at least once, so at least v1 exists; assert
    // by class rather than a literal version number, matching how the
    // production report itself only knows the iteration count.
    expect(
      result.artifactPaths.some((p) => classify(p) === "CODE_REVIEW")
    ).toBe(true);
  });
});

// ─── §3. Class 9 (POSTMORTEM) — a phase that exhausts its round budget ───────
//
// Adapted from haltAndQueue.test.js's harness (RLH-25): Phase R's reviewers
// never approve, so the round budget exhausts and reviewLoop dispatches a
// fresh POSTMORTEM. `main()` never pushes it (V-14 lists it under "never
// enumerated at all").

describe("T38: POSTMORTEM-{phase}-{feature}.md (class 9) reaches artifactPaths when a phase halts and writes one", () => {
  const FEATURE = "pm-feat";
  const DOCS = `docs/${FEATURE}`;
  const REQ_PATH = `${DOCS}/REQ-${FEATURE}.md`;
  const POSTMORTEM_R = `${DOCS}/POSTMORTEM-R-${FEATURE}.md`;

  const REQ_TEXT = [
    "# REQ", "", "## Problem / Context", "", "Body.", "",
    "## Goals", "", "Body.", "", "## Non-Goals", "", "Body.", "",
    "## Constraints", "", "Body.", "", "## Acceptance Criteria", "", "AC-1. Body.", "",
    "## Risks", "", "Body.", "", "## Obligations", "", "None.", "",
  ].join("\n");

  function baseTree() {
    return {
      [REQ_PATH]: REQ_TEXT,
      [`${DOCS}/FSPEC-${FEATURE}.md`]: "# FSPEC\n",
      [`${DOCS}/TSPEC-${FEATURE}.md`]: "# TSPEC\n",
      [`${DOCS}/PLAN-${FEATURE}.md`]:
        "# PLAN\n\n| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | `src/one.js` |\n",
      [`${DOCS}/PROPERTIES-${FEATURE}.md`]: "# PROPERTIES\n",
    };
  }

  const APPROVING = 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
  const NEEDS_REVISION = 'Review with issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';
  const POSTMORTEM_PROMPT_RE = /^Write (\S*POSTMORTEM-[^\s.]+\.md)\./;

  test.skip("T38: a fresh POSTMORTEM written when Phase R exhausts its round budget is enumerated in artifactPaths", async () => {
    const fs = fakeFs(baseTree());
    const listFiles = fakeListFiles((dirPath) =>
      Object.keys(fs.files)
        .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
        .map((p) => p.slice(dirPath.length + 1))
    );

    const agentFn = async (skill, prompt) => {
      const text = typeof prompt === "string" ? prompt : "";
      const pm = POSTMORTEM_PROMPT_RE.exec(text);
      if (pm) {
        fs.writeFile(pm[1], "# Post-mortem\n\n## Pattern Disagreement\n\nx\n\n## Recommendation\n\nx\n");
        return "Post-mortem written.";
      }
      if (["se-review", "pm-review", "te-review"].includes(skill)) {
        return text.includes(`REQ-${FEATURE}.md`) ? NEEDS_REVISION : APPROVING;
      }
      if (["pm-author", "se-author", "te-author"].includes(skill)) {
        if (text.includes("DECISIONS_WARRANTED")) return "Finalized.\nDECISIONS_WARRANTED: false";
        if (text.includes("Return a JSON object")) {
          return JSON.stringify({ tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }] });
        }
        return "Document created.\nREVISION-COMPLETE: yes";
      }
      return "Success.";
    };

    const result = await main({
      reqPath: REQ_PATH,
      _agent: agentFn,
      _parallel: (p) => Promise.all(p),
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _checkFile: fs.checkFile,
      _readFile: fs.readFile,
      _hashFile: fs.hashFile,
      _writeFile: fs.writeFile,
      _appendFile: fs.appendFile,
      _listFiles: listFiles,
      _mergeWorktree: async () => ({ ok: true }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
    });

    expect(result.outcome).toBe("halted");
    expect(fs.files[POSTMORTEM_R]).toBeTruthy();
    expect(result.artifactPaths).toContain(POSTMORTEM_R);
  });
});

// ─── §4. Class 11 (anchor-appended CROSS-REVIEW-*) — TSPEC §7.4's named route

describe("T38: reviewLoop's PASS branch surfaces the anchor-appended CROSS-REVIEW paths (call site A)", () => {
  const FEATURE = "anchor-feat";
  const DOC = `docs/${FEATURE}/TSPEC-${FEATURE}.md`;
  const APPROVE = 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';

  test.skip("T38: appendApprovalAnchors returns {appended, paths}, and reviewLoop's returned record carries the two anchored CROSS-REVIEW paths on a PASS round", async () => {
    const crPm = crossReviewPath(FEATURE, "pm-review", "TSPEC", 1);
    const crTe = crossReviewPath(FEATURE, "te-review", "TSPEC", 1);
    const fs = fakeFs({
      [DOC]: "# TSPEC\n\nBody.\n",
      [crPm]: "## Review\n\nLooks good.\n",
      [crTe]: "## Review\n\nLooks good.\n",
    });
    const git = fakeGit();

    const agentFn = async (skill) => {
      if (skill === "pm-review" || skill === "te-review") return APPROVE;
      return "";
    };

    const result = await reviewLoop({
      doc: DOC,
      phase: "T",
      docType: "TSPEC",
      reviewers: ["pm-review", "te-review"],
      optimizer: "se-author",
      feature: FEATURE,
      iteration: 1,
      _agent: agentFn,
      _parallel: (p) => Promise.all(p),
      _checkFile: fs.checkFile,
      _readFile: fs.readFile,
      _hashFile: fs.hashFile,
      _hashNormalizedFile: fs.hashNormalizedFile,
      _appendFile: fs.appendFile,
      _git: git,
      _log: () => {},
    });

    expect(result.converged).toBe(true);
    // Both anchors actually landed on disk — the precondition for the route
    // TSPEC §7.4 names existing at all.
    expect(fs.appends.map((a) => a.path).sort()).toEqual([crPm, crTe].sort());
    // The record surfaces exactly the paths appendApprovalAnchors reports it
    // appended, so main()'s two callers (both inside main(), which cannot see
    // module-scope appendApprovalAnchors) can push them without a new seam.
    expect(result.anchoredPaths).toEqual(expect.arrayContaining([crPm, crTe]));
    expect(result.anchoredPaths.length).toBe(2);
  });
});

describe("T38: main() pushes reviewLoop's anchored CROSS-REVIEW paths onto artifactPaths", () => {
  const FEATURE = "test-feat";
  const DOCS = `docs/${FEATURE}`;
  const PARSEABLE_PLAN =
    "| Task ID | Description | Batch | Dependencies |\n|---|---|---|---|\n| T1 | first | 1 | - |\n\n| Task | Files |\n|---|---|\n| T1 | `src/one.js` |\n";
  // §7.4's targetClause names the round's own review file outright (CR F-11) —
  // the same regex erratumProtocol.test.js's harness uses to have the double
  // "write its cross-review file" the way a real reviewer episode does.
  const CROSS_REVIEW_TARGET_RE = /Write your cross-review to exactly this path: (\S+)\./;

  test.skip("T38: a successful run's artifactPaths contains at least one round-1 CROSS-REVIEW file, anchor-appended via appendApprovalAnchors", async () => {
    const seeded = {
      [`${DOCS}/REQ-${FEATURE}.md`]: "# REQ\n\nBody.\n",
      [`${DOCS}/FSPEC-${FEATURE}.md`]: "# FSPEC\n\nBody.\n",
      [`${DOCS}/TSPEC-${FEATURE}.md`]: "# TSPEC\n\nBody.\n",
      [`${DOCS}/PLAN-${FEATURE}.md`]: PARSEABLE_PLAN,
      [`${DOCS}/PROPERTIES-${FEATURE}.md`]: "# PROPERTIES\n\nBody.\n",
    };
    const fs = fakeFs(seeded);
    const listFiles = fakeListFiles((dirPath) =>
      Object.keys(fs.files)
        .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
        .map((p) => p.slice(dirPath.length + 1))
    );
    const git = fakeGit();

    const agentFn = async (skill, prompt) => {
      const text = typeof prompt === "string" ? prompt : "";
      if (["pm-review", "se-review", "te-review"].includes(skill)) {
        // The reviewer "writes its own cross-review file" before returning,
        // exactly as a real dispatched episode commits it during the round —
        // appendApprovalAnchors requires the file to already exist to append to.
        const m = CROSS_REVIEW_TARGET_RE.exec(text);
        if (m) fs.writeFile(m[1], "## Review\n\nApproved.\n");
        return 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
      }
      if (["pm-author", "se-author", "te-author"].includes(skill)) {
        if (text.includes("DECISIONS_WARRANTED")) return "Finalized.\nDECISIONS_WARRANTED: false";
        if (text.includes("Return a JSON object")) {
          return JSON.stringify({
            tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }],
          });
        }
        return "Document updated.";
      }
      if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
      if (skill === "harvest-learnings") return "Harvest complete.";
      if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
      if (skill === "ship-pr") {
        if (text.includes("Rebase the feature branch")) return "Rebased.\nREBASE_STATUS: clean";
        if (text.includes("Raise a pull request")) {
          return "PR opened.\nPR_URL: https://github.com/acme/repo/pull/42";
        }
        return "Checks.\nCI_STATUS: passed";
      }
      return "Success.";
    };

    const result = await main({
      reqPath: `${DOCS}/REQ-${FEATURE}.md`,
      _agent: agentFn,
      _parallel: (p) => Promise.all(p),
      _readFile: fs.readFile,
      _hashFile: fs.hashFile,
      _writeFile: fs.writeFile,
      _appendFile: fs.appendFile,
      _checkFile: fs.checkFile,
      _listFiles: listFiles,
      _git: git,
      _phase: () => {},
      _pipeline: async (l, fn) => fn(),
      _mergeWorktree: async () => ({ ok: true }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
    });

    expect(result.outcome).toBe("success");
    expect(
      result.artifactPaths.some((p) => classify(p) === "CROSS-REVIEW")
    ).toBe(true);
  });
});
