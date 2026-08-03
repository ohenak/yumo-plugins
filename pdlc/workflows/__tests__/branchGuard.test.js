/**
 * branchGuard.test.js — the feature-branch guard and the branch pin in prompts.
 *
 * The failure under test is a real one: a run whose working tree had been left
 * on `main` committed and pushed an entire Phase R round — cross-reviews, REQ
 * revisions, the queue row — to the default branch, because nothing in the
 * pipeline ever established `feat-{feature}`. The guard closes that hole in two
 * places, and this suite pins both halves:
 *
 * 1. `ensureFeatureBranch` at pipeline entry — the only place that MUTATES the
 *    checkout, and never proceeds on a branch it did not confirm;
 * 2. `verifyFeatureBranch` at every `reviewLoop` entry — read-only, because
 *    dispatched agents share this working tree and a checkout under them would
 *    corrupt work in flight;
 *
 * plus the agent-side half: every dispatch prompt that ends in a commit names
 * the branch and tells the agent to re-check HEAD before committing.
 *
 * Seam style follows the rest of the L2 suites: doubles come from
 * `helpers/seams.js`, and the git double is what makes the guard live at all —
 * with the shipped Node default the guard is deliberately inert, so a unit test
 * never has its own worktree checked out from under it.
 */

import main, {
  branchGuardTransport,
  defaultGit,
  ensureFeatureBranch,
  featureBranchName,
  reviewLoop,
  verifyFeatureBranch,
} from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";

const FEATURE = "guard-feat";
const BRANCH = `feat-${FEATURE}`;
const REV_PARSE = "rev-parse --abbrev-ref HEAD";

/** A git double scripted by the sequence of results it returns, in call order. */
const scriptedGit = (results) => fakeGit((argv, i) => results[Math.min(i, results.length - 1)]);

const onBranch = { ok: true, stdout: `${BRANCH}\n` };
const onMain = { ok: true, stdout: "main\n" };

/** Swallow the guard's log line — these tests assert on returns and throws. */
const silent = () => {};

// ─── ensureFeatureBranch ──────────────────────────────────────────────────────

describe("ensureFeatureBranch — placing the tree on feat-{feature}", () => {
  it("is a no-op when HEAD already names the feature branch: one probe, no checkout", async () => {
    const git = scriptedGit([onBranch]);

    const result = await ensureFeatureBranch({ feature: FEATURE, _git: git, _log: silent });

    expect(result).toEqual({ ok: true, branch: BRANCH, action: "already-on" });
    expect(git.commands).toEqual([REV_PARSE]);
  });

  it("checks out an existing feature branch when HEAD names another one", async () => {
    // rev-parse → main; checkout succeeds; the re-read confirms the branch.
    const git = scriptedGit([onMain, { ok: true }, onBranch]);

    const result = await ensureFeatureBranch({ feature: FEATURE, _git: git, _log: silent });

    expect(result).toEqual({ ok: true, branch: BRANCH, action: "checked-out" });
    expect(git.commands).toEqual([REV_PARSE, `checkout ${BRANCH}`, REV_PARSE]);
    // `-b` is never reached when the branch already exists: an existing branch
    // carrying work is joined, never shadowed by a fresh one cut from HEAD.
    expect(git.commands).not.toContain(`checkout -b ${BRANCH}`);
  });

  it("creates the branch when it does not exist yet", async () => {
    const git = fakeGit((argv, i) => {
      if (i === 0) return onMain;
      if (argv.join(" ") === `checkout ${BRANCH}`) {
        return { ok: false, stderr: `error: pathspec '${BRANCH}' did not match any file(s)` };
      }
      if (argv.join(" ") === `checkout -b ${BRANCH}`) return { ok: true };
      return onBranch;
    });

    const result = await ensureFeatureBranch({ feature: FEATURE, _git: git, _log: silent });

    expect(result).toEqual({ ok: true, branch: BRANCH, action: "created" });
    expect(git.commands).toEqual([
      REV_PARSE,
      `checkout ${BRANCH}`,
      `checkout -b ${BRANCH}`,
      REV_PARSE,
    ]);
  });

  it("halts when the current branch cannot be read — never proceeds on an unknown branch", async () => {
    const git = scriptedGit([{ ok: false, stderr: "fatal: not a git repository" }]);

    await expect(
      ensureFeatureBranch({ feature: FEATURE, _git: git, _log: silent })
    ).rejects.toMatchObject({
      isHalt: true,
      message: expect.stringContaining("branch guard"),
    });
    // Nothing was mutated: the guard stopped at the probe.
    expect(git.commands).toEqual([REV_PARSE]);
  });

  it("halts when neither checkout succeeds, naming the branch the commits would have landed on", async () => {
    const git = scriptedGit([
      onMain,
      { ok: false, stderr: "did not match" },
      { ok: false, stderr: "fatal: cannot lock ref" },
    ]);

    const error = await ensureFeatureBranch({
      feature: FEATURE,
      _git: git,
      _log: silent,
    }).catch((e) => e);

    expect(error.isHalt).toBe(true);
    expect(error.message).toContain('"main"');
    expect(error.message).toContain(BRANCH);
    expect(error.message).toMatch(/cannot lock ref/);
  });

  it("halts when the checkout reports success but HEAD still names another branch", async () => {
    // The whole point of the second observation: "exited 0" and "the tree is on
    // the branch" are not the same claim.
    const git = scriptedGit([onMain, { ok: true }, onMain]);

    const error = await ensureFeatureBranch({
      feature: FEATURE,
      _git: git,
      _log: silent,
    }).catch((e) => e);

    expect(error.isHalt).toBe(true);
    expect(error.message).toMatch(/still on "main"/);
  });

  it("is inert — never throwing, never mutating — when no git seam is injected", async () => {
    const result = await ensureFeatureBranch({ feature: FEATURE, _log: silent });
    expect(result).toEqual({ ok: true, branch: BRANCH, action: "skipped" });

    // The shipped Node default is not an injected seam: a test that passes no
    // git transport must never have its own checkout moved.
    expect(branchGuardTransport(defaultGit)).toBeNull();
    expect(branchGuardTransport(undefined)).toBeNull();
    expect(typeof branchGuardTransport(fakeGit())).toBe("function");
    expect(featureBranchName(FEATURE)).toBe(BRANCH);
  });
});

// ─── verifyFeatureBranch, and reviewLoop's entry re-check ─────────────────────

describe("verifyFeatureBranch — the read-only re-check", () => {
  it("reads HEAD and nothing else when the tree is on the branch", async () => {
    const git = scriptedGit([onBranch]);
    const result = await verifyFeatureBranch({ feature: FEATURE, _git: git, _log: silent });

    expect(result).toEqual({ ok: true, branch: BRANCH, verified: true });
    expect(git.commands).toEqual([REV_PARSE]);
  });

  it("halts on drift without attempting a checkout — agents may be mid-flight", async () => {
    const git = scriptedGit([onMain]);

    const error = await verifyFeatureBranch({
      feature: FEATURE,
      context: "phase R's review round",
      _git: git,
      _log: silent,
    }).catch((e) => e);

    expect(error.isHalt).toBe(true);
    expect(error.message).toContain("phase R's review round");
    expect(git.commands).toEqual([REV_PARSE]);
  });
});

// ─── The retryable transport fault: an ok-but-empty rev-parse ─────────────────
//
// Measured, run wf_d74b18e0-ecb (2026-08-03): at Phase F's reviewLoop entry the
// injected `_git(["rev-parse","--abbrev-ref","HEAD"])` returned
// `{"ok":true,"stdout":"","stderr":""}` while the tree was on the feature branch
// the whole time — the next rev-parse, seconds later, read it fine. Fail-closed
// was right; the SINGLE-SHOT observation was the defect. An ok-but-empty read is
// therefore re-observed; an `ok: false` read is a real git failure and is not.

/** An `ok` read that reported no branch at all — the transport-fault signature. */
const emptyRead = { ok: true, stdout: "" };
/** Whitespace-only is the same fault: `parseAbbrevRef` trims to "". */
const blankRead = { ok: true, stdout: "  \n" };

/**
 * The literal note a halt carries when every re-observation came back empty.
 * Written out here rather than imported: an oracle that imports the string it
 * checks agrees with the production text by construction.
 */
const TRANSPORT_FAULT_NOTE = "(3 observations, all empty — transport fault suspected)";

/** Today's `verifyFeatureBranch` halt for a genuinely failing rev-parse, verbatim. */
const GENUINE_FAILURE_HALT =
  `Error: branch guard — the working tree is on "an unreadable branch", not ${BRANCH}. ` +
  `Refusing to continue: this round's commits would land there. ` +
  `Check out ${BRANCH} yourself (git checkout -B ${BRANCH}) and re-invoke; nothing was committed.`;

describe("branch guard — an ok-but-empty rev-parse is re-observed, not believed", () => {
  it("verifyFeatureBranch: one empty read then the branch — no halt, exactly two identical probes", async () => {
    const git = scriptedGit([emptyRead, onBranch]);

    const result = await verifyFeatureBranch({ feature: FEATURE, _git: git, _log: silent });

    expect(result).toEqual({ ok: true, branch: BRANCH, verified: true });
    expect(git.commands).toEqual([REV_PARSE, REV_PARSE]);
  });

  it("verifyFeatureBranch: three empty reads halt, naming both the unreadable branch and the count", async () => {
    const git = scriptedGit([emptyRead, blankRead, emptyRead]);

    const error = await verifyFeatureBranch({
      feature: FEATURE,
      _git: git,
      _log: silent,
    }).catch((e) => e);

    expect(error.isHalt).toBe(true);
    expect(error.message).toContain('"an unreadable branch"');
    expect(error.message).toContain(TRANSPORT_FAULT_NOTE);
    // Two retries and no more: the budget is spent, not unbounded.
    expect(git.commands).toEqual([REV_PARSE, REV_PARSE, REV_PARSE]);
  });

  it("verifyFeatureBranch: an ok:false read is a real git failure — one probe, today's message", async () => {
    const git = scriptedGit([{ ok: false, stderr: "fatal: not a git repository" }]);

    const error = await verifyFeatureBranch({
      feature: FEATURE,
      _git: git,
      _log: silent,
    }).catch((e) => e);

    expect(error.isHalt).toBe(true);
    expect(error.message).toBe(GENUINE_FAILURE_HALT);
    // The positive above pins the whole string; this pairs it with the absence
    // that matters — a genuine failure never claims a transport fault.
    expect(error.message).not.toContain("observations");
    expect(git.commands).toEqual([REV_PARSE]);
  });

  it("ensureFeatureBranch: an empty initial read is re-observed, and the checkout still happens", async () => {
    const git = fakeGit((argv, i) => {
      if (i === 0) return emptyRead;
      if (i === 1) return onMain;
      if (argv.join(" ") === `checkout ${BRANCH}`) return { ok: true };
      return onBranch;
    });

    const result = await ensureFeatureBranch({ feature: FEATURE, _git: git, _log: silent });

    expect(result).toEqual({ ok: true, branch: BRANCH, action: "checked-out" });
    expect(git.commands).toEqual([REV_PARSE, REV_PARSE, `checkout ${BRANCH}`, REV_PARSE]);
  });

  it("ensureFeatureBranch: an empty post-checkout confirmation is re-observed, not a halt", async () => {
    const git = fakeGit((argv, i) => {
      if (i === 0) return onMain;
      if (argv.join(" ") === `checkout ${BRANCH}`) return { ok: true };
      return i === 2 ? emptyRead : onBranch;
    });

    const result = await ensureFeatureBranch({ feature: FEATURE, _git: git, _log: silent });

    expect(result).toEqual({ ok: true, branch: BRANCH, action: "checked-out" });
    expect(git.commands).toEqual([REV_PARSE, `checkout ${BRANCH}`, REV_PARSE, REV_PARSE]);
  });

  it("ensureFeatureBranch: three empty confirmations halt, carrying the count", async () => {
    const git = fakeGit((argv, i) => {
      if (i === 0) return onMain;
      if (argv.join(" ") === `checkout ${BRANCH}`) return { ok: true };
      return emptyRead;
    });

    const error = await ensureFeatureBranch({
      feature: FEATURE,
      _git: git,
      _log: silent,
    }).catch((e) => e);

    expect(error.isHalt).toBe(true);
    expect(error.message).toMatch(/still on "an unreadable branch"/);
    expect(error.message).toContain(TRANSPORT_FAULT_NOTE);
    expect(git.commands).toEqual([
      REV_PARSE,
      `checkout ${BRANCH}`,
      REV_PARSE,
      REV_PARSE,
      REV_PARSE,
    ]);
  });

  it("costs a fault-free run nothing: the happy-path probe counts are unchanged", async () => {
    const ensure = scriptedGit([onMain, { ok: true }, onBranch]);
    await ensureFeatureBranch({ feature: FEATURE, _git: ensure, _log: silent });
    expect(ensure.commands).toEqual([REV_PARSE, `checkout ${BRANCH}`, REV_PARSE]);

    const alreadyOn = scriptedGit([onBranch]);
    await ensureFeatureBranch({ feature: FEATURE, _git: alreadyOn, _log: silent });
    expect(alreadyOn.commands).toEqual([REV_PARSE]);

    const verify = scriptedGit([onBranch]);
    await verifyFeatureBranch({ feature: FEATURE, _git: verify, _log: silent });
    expect(verify.commands).toEqual([REV_PARSE]);
  });
});

describe("reviewLoop — a tree that drifted between phases halts before it reviews", () => {
  const baseParams = {
    doc: `docs/${FEATURE}/TSPEC-${FEATURE}.md`,
    phase: "T",
    docType: "TSPEC",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    feature: FEATURE,
  };
  const approve = `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;

  it("halts, and dispatches nothing, when HEAD is no longer feat-{feature}", async () => {
    const dispatched = [];
    const git = scriptedGit([onMain]);

    const error = await reviewLoop({
      ...baseParams,
      _agent: async (skill) => {
        dispatched.push(skill);
        return approve;
      },
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _listFiles: fakeListFiles([]),
      _readFile: () => null,
      _log: silent,
      _git: git,
    }).catch((e) => e);

    expect(error.isHalt).toBe(true);
    expect(error.message).toContain(BRANCH);
    // The commits this round would have produced never had anywhere wrong to go.
    expect(dispatched).toEqual([]);
  });

  it("proceeds normally when the tree is on the branch", async () => {
    const git = fakeGit((argv) =>
      argv.join(" ") === REV_PARSE ? onBranch : { ok: true }
    );

    const result = await reviewLoop({
      ...baseParams,
      _agent: async () => approve,
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _listFiles: fakeListFiles([]),
      _readFile: () => null,
      _log: silent,
      _git: git,
    });

    expect(result).toMatchObject({ converged: true });
    expect(git.commands).not.toContain(`checkout ${BRANCH}`);
  });
});

// ─── main()'s entry guard ─────────────────────────────────────────────────────

describe("main() — the guard runs before any phase", () => {
  const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;

  it("halts the whole run, dispatching no agent, when the branch cannot be established", async () => {
    const dispatched = [];
    const fs = fakeFs({ [REQ_PATH]: "# REQ\n\nBody.\n" });
    const git = scriptedGit([
      onMain,
      { ok: false, stderr: "did not match" },
      { ok: false, stderr: "fatal: cannot lock ref" },
    ]);

    const result = await main({
      reqPath: REQ_PATH,
      _agent: async (skill) => {
        dispatched.push(skill);
        return "";
      },
      _parallel: (promises) => Promise.all(promises),
      _pipeline: async (label, fn) => fn(),
      _phase: silent,
      _log: silent,
      _listFiles: fakeListFiles([]),
      _git: git,
      ...fs.injections(),
    });

    expect(result.outcome).toBe("halted");
    expect(result.haltReason).toContain("branch guard");
    expect(result.haltReason).toContain(BRANCH);
    expect(dispatched).toEqual([]);
  });
});

// ─── The branch pin carried by every committing dispatch ──────────────────────

describe("dispatch prompts pin the branch", () => {
  const doc = `docs/${FEATURE}/TSPEC-${FEATURE}.md`;
  /** Every clause the pin owes, fully substituted (§6.3 — no `{placeholders}`). */
  const expectPinned = (prompt) => {
    expect(prompt).toContain(`All commits for this task must land on branch ${BRANCH}.`);
    expect(prompt).toContain("git rev-parse --abbrev-ref HEAD");
    expect(prompt).toMatch(/STOP and report instead of committing/);
    expect(prompt).toMatch(/Do not run `git checkout` yourself/);
    expect(prompt).not.toMatch(/\{feature\}|\{branch\}/);
  };

  it("names the branch in both reviewer prompts and in the optimizer prompt", async () => {
    const prompts = new Map();
    let round = 0;
    const git = fakeGit((argv) => (argv.join(" ") === REV_PARSE ? onBranch : { ok: true }));

    await reviewLoop({
      doc,
      phase: "T",
      docType: "TSPEC",
      reviewers: ["pm-review", "te-review"],
      optimizer: "se-author",
      feature: FEATURE,
      _agent: async (skill, prompt) => {
        prompts.set(`${skill}-${round}`, prompt);
        if (skill === "se-author") {
          round += 1;
          return "Addressed.";
        }
        // Round 1 needs revision so the optimizer runs; round 2 approves.
        return round === 0
          ? `Issues.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n`
          : `Done.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
      },
      _parallel: (promises) => Promise.all(promises),
      _checkFile: () => ({ ok: true }),
      _listFiles: fakeListFiles([]),
      _readFile: () => null,
      _log: silent,
      _git: git,
    });

    expectPinned(prompts.get("pm-review-0"));
    expectPinned(prompts.get("te-review-0"));
    expectPinned(prompts.get("se-author-0"));
    // …and the re-review prompt of a later round, which is built separately.
    expectPinned(prompts.get("pm-review-1"));
  });

  it("names the branch in the authoring (creator) prompt", async () => {
    const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
    const fs = fakeFs({ [REQ_PATH]: "# REQ\n\nBody.\n" });
    const git = fakeGit((argv) => (argv.join(" ") === REV_PARSE ? onBranch : { ok: true }));
    const authoring = [];

    // Phase R approves immediately, so Phase F's creator dispatch is reached.
    // The FSPEC it is asked for is never written, so the run halts afterwards —
    // irrelevant here: the prompt was recorded before that.
    await main({
      reqPath: REQ_PATH,
      _agent: async (skill, prompt) => {
        if (skill === "pm-author" || skill === "se-author") authoring.push(prompt);
        return `Done.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
      },
      _parallel: (promises) => Promise.all(promises),
      _pipeline: async (label, fn) => fn(),
      _phase: silent,
      _log: silent,
      _listFiles: fakeListFiles([]),
      _git: git,
      ...fs.injections(),
    });

    expect(authoring.length).toBeGreaterThan(0);
    expectPinned(authoring[0]);
  });
});
