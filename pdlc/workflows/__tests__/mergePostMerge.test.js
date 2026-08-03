// ─── mergePostMerge.test.js ────────────────────────────────────────────────
//
// PLAN §4/§12 A6 (pdlc-merge-phase). TSPEC §4.7 and §7 — merge execution
// (`executeMerge`) and the helper-level slice of the post-merge sequence
// M1-M5: `evidenceCellFor` (§7.3), `deleteRemoteBranch` (M2, §7.2),
// `updateDefaultBranch` (M3, §7.4).
//
// TSPEC §13.2's `mergePhase` coverage splits into `mergePhase` (phase-level,
// A7, `mergePhase.test.js`) and `mergePostMerge` (helper-level, this file,
// A6) — PLAN §7's declared divergence from §13.2's named test-file list.
// This file drives each helper directly through `fakeGhRun` / `fakeGit`
// (`helpers/mergeDoubles.js`), never through `phaseMerge` or `decideMerge`.

import {
  executeMerge,
  evidenceCellFor,
  deleteRemoteBranch,
  updateDefaultBranch,
  classifyMergeResult,
  OBSERVATION_REASONS,
  MERGE_NOTES,
  MERGE_ESCALATIONS,
  featureBranchName,
} from "../orchestrate-dev.js";
import { fakeGhRun, fakeGit } from "./helpers/mergeDoubles.js";

/**
 * A local `_git` double that scripts by full-argv inspection, not just
 * `argv[0]` — `fakeGit`'s `script` (helpers/mergeDoubles.js, F1-owned, not
 * edited here) answers a fixed reply per subcommand, but `updateDefaultBranch`
 * issues two different `rev-parse` invocations (`--verify` vs
 * `--abbrev-ref`) that must answer differently. `handler(argv)` returns a
 * reply or `undefined`/`null` to fall through to the trivial-success default.
 */
function scriptedGit(handler) {
  const calls = [];
  const _git = async (argv) => {
    calls.push(argv);
    return handler(argv) ?? { ok: true, stdout: "", stderr: "" };
  };
  return { calls, _git };
}

const PR_URL = "https://github.com/o/r/pull/42";
const MERGED_READBACK_OK = {
  ok: true,
  stdout: JSON.stringify({ state: "MERGED", mergeCommit: { oid: "abc1234def5678" } }),
  stderr: "",
};

// ─── executeMerge — O6 (TSPEC §4.7) ────────────────────────────────────────

describe("executeMerge", () => {
  test("issues exactly the merge command for the given method", async () => {
    const { calls, _ghRun } = fakeGhRun({
      "gh pr merge": { ok: true, stdout: "Merged pull request #42\n", stderr: "" },
      "gh pr view --json mergeCommit,state": MERGED_READBACK_OK,
    });
    await executeMerge(PR_URL, "rebase", { _ghRun });
    expect(calls[0]).toBe(`gh pr merge ${PR_URL} --rebase`);
  });

  test("confirmed: zero-exit merge with a MERGED read-back returns ok + oid", async () => {
    const { _ghRun } = fakeGhRun({
      "gh pr merge": { ok: true, stdout: "Merged pull request #42\n", stderr: "" },
      "gh pr view --json mergeCommit,state": MERGED_READBACK_OK,
    });
    const result = await executeMerge(PR_URL, "merge", { _ghRun });
    expect(result).toEqual({ ok: true, oid: "abc1234def5678" });
  });

  test("always reads back after a zero-exit merge command, before deciding", async () => {
    const { calls, _ghRun } = fakeGhRun({
      "gh pr merge": { ok: true, stdout: "Merged pull request #42\n", stderr: "" },
      "gh pr view --json mergeCommit,state": MERGED_READBACK_OK,
    });
    await executeMerge(PR_URL, "squash", { _ghRun });
    expect(calls).toEqual([
      `gh pr merge ${PR_URL} --squash`,
      `gh pr view ${PR_URL} --json mergeCommit,state`,
    ]);
  });

  test("zero-exit-unconfirmed: merge exits zero, read-back does not show MERGED — failed attempt, reason not-confirmed", async () => {
    const { _ghRun } = fakeGhRun({
      "gh pr merge": { ok: true, stdout: "Merged pull request #42\n", stderr: "" },
      "gh pr view --json mergeCommit,state": {
        ok: true,
        stdout: JSON.stringify({ state: "OPEN", mergeCommit: null }),
        stderr: "",
      },
    });
    const result = await executeMerge(PR_URL, "rebase", { _ghRun });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("not-confirmed");
  });

  test("zero-exit-unconfirmed with empty stderr: detail is the fixed 'merge not confirmed' token", async () => {
    const { _ghRun } = fakeGhRun({
      "gh pr merge": { ok: true, stdout: "Merged pull request #42\n", stderr: "" },
      "gh pr view --json mergeCommit,state": {
        ok: true,
        stdout: JSON.stringify({ state: "OPEN", mergeCommit: null }),
        stderr: "",
      },
    });
    const result = await executeMerge(PR_URL, "rebase", { _ghRun });
    expect(result.detail).toBe("merge not confirmed");
  });

  test("a stderr-bearing merge-command failure: reason command-failed, detail is the first stderr line", async () => {
    const { _ghRun } = fakeGhRun({
      "gh pr merge": {
        ok: false,
        stdout: "",
        stderr: "GraphQL: Pull Request is not mergeable (mergePullRequest)\nmore detail here",
      },
    });
    const result = await executeMerge(PR_URL, "rebase", { _ghRun });
    expect(result).toEqual({
      ok: false,
      reason: "command-failed",
      detail: "GraphQL: Pull Request is not mergeable (mergePullRequest)",
    });
  });

  test("a stderr-bearing merge-command failure with empty stderr: detail falls back to the fixed token", async () => {
    const { _ghRun } = fakeGhRun({
      "gh pr merge": { ok: false, stdout: "", stderr: "" },
    });
    const result = await executeMerge(PR_URL, "merge", { _ghRun });
    expect(result).toEqual({
      ok: false,
      reason: "command-failed",
      detail: "merge not confirmed",
    });
  });

  test("a failed merge command does not issue a read-back", async () => {
    const { calls, _ghRun } = fakeGhRun({
      "gh pr merge": { ok: false, stdout: "", stderr: "boom" },
    });
    await executeMerge(PR_URL, "rebase", { _ghRun });
    expect(calls).toEqual([`gh pr merge ${PR_URL} --rebase`]);
  });

  test("read-back command itself fails to run: reason command-failed (not not-confirmed)", async () => {
    const { _ghRun } = fakeGhRun({
      "gh pr merge": { ok: true, stdout: "Merged pull request #42\n", stderr: "" },
      "gh pr view --json mergeCommit,state": { ok: false, stdout: "", stderr: "network blip" },
    });
    const result = await executeMerge(PR_URL, "rebase", { _ghRun });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("command-failed");
  });

  test("read-back is unparseable: normalised to not-confirmed at the executeMerge boundary (reason is a two-member closed set)", async () => {
    const { _ghRun } = fakeGhRun({
      "gh pr merge": { ok: true, stdout: "Merged pull request #42\n", stderr: "" },
      "gh pr view --json mergeCommit,state": { ok: true, stdout: "not json", stderr: "" },
    });
    const result = await executeMerge(PR_URL, "rebase", { _ghRun });
    // classifyMergeResult itself would say "unparseable" — confirm that, then
    // confirm executeMerge's own contract collapses it into the closed set.
    expect(classifyMergeResult("Merged pull request #42\n", "not json")).toEqual({
      ok: false,
      reason: "unparseable",
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("not-confirmed");
  });

  test("every reason executeMerge can produce is a member of OBSERVATION_REASONS", async () => {
    const cases = [
      await executeMerge(PR_URL, "rebase", {
        _ghRun: fakeGhRun({ "gh pr merge": { ok: false, stdout: "", stderr: "x" } })._ghRun,
      }),
      await executeMerge(PR_URL, "rebase", {
        _ghRun: fakeGhRun({
          "gh pr merge": { ok: true, stdout: "x", stderr: "" },
          "gh pr view --json mergeCommit,state": { ok: true, stdout: "not json", stderr: "" },
        })._ghRun,
      }),
    ];
    for (const c of cases) {
      if (!c.ok) expect(OBSERVATION_REASONS).toContain(c.reason);
    }
  });

  test("the returned per-attempt shape can be recorded verbatim as {method, ok, detail}", async () => {
    const { _ghRun } = fakeGhRun({
      "gh pr merge": { ok: false, stdout: "", stderr: "denied" },
    });
    const result = await executeMerge(PR_URL, "rebase", { _ghRun });
    const attempt = { method: "rebase", ok: result.ok, detail: result.detail };
    expect(attempt).toEqual({ method: "rebase", ok: false, detail: "denied" });
  });
});

// ─── evidenceCellFor — TSPEC §7.3 ──────────────────────────────────────────

describe("evidenceCellFor", () => {
  test("a merge SHA of at least 7 characters: fixed 7-character truncation + PR number", () => {
    expect(evidenceCellFor("abc1234def5678", 42)).toBe("abc1234 #42");
  });

  test("never git's variable-length abbreviation — always exactly 7 characters", () => {
    expect(evidenceCellFor("abcdefabcdefabcdef", 7)).toBe("abcdefa #7");
  });

  test("mergeSha shorter than 7 characters: falls back to the literal 'merged' token", () => {
    expect(evidenceCellFor("abc12", 42)).toBe("merged #42");
  });

  test("mergeSha null: 'merged' literal token, never a SHA-shaped placeholder", () => {
    expect(evidenceCellFor(null, 42)).toBe("merged #42");
  });

  test("mergeSha non-string: 'merged' literal token", () => {
    expect(evidenceCellFor(12345678, 42)).toBe("merged #42");
  });

  test("exactly 7 characters is accepted (>= 7, not > 7)", () => {
    expect(evidenceCellFor("abc1234", 1)).toBe("abc1234 #1");
  });
});

// ─── deleteRemoteBranch — M2 (TSPEC §7.2) ──────────────────────────────────

describe("deleteRemoteBranch", () => {
  test("issues exactly one command: git push origin --delete feat-{feature}", async () => {
    const { calls, _git } = fakeGit();
    await deleteRemoteBranch({ feature: "widget", _git });
    expect(calls).toEqual([["push", "origin", "--delete", featureBranchName("widget")]]);
  });

  test("success: { ok: true }", async () => {
    const { _git } = fakeGit();
    const result = await deleteRemoteBranch({ feature: "widget", _git });
    expect(result).toEqual({ ok: true });
  });

  test("failure: ok false with a reason, never touching the local branch (only one command issued)", async () => {
    const { calls, _git } = fakeGit({
      push: { ok: false, stdout: "", stderr: "remote: branch protected\nmore" },
    });
    const result = await deleteRemoteBranch({ feature: "widget", _git });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("remote: branch protected");
    expect(calls).toEqual([["push", "origin", "--delete", featureBranchName("widget")]]);
  });
});

// ─── updateDefaultBranch — M3 (TSPEC §7.4) ─────────────────────────────────

describe("updateDefaultBranch", () => {
  test("step 0: defaultBranch unavailable — fails before any command, no branch field", async () => {
    const { calls, _git } = fakeGit();
    const result = await updateDefaultBranch({ defaultBranch: null, mergeSha: "abc1234", _git });
    expect(result).toEqual({ ok: false, reason: "default branch name unavailable" });
    expect(calls).toEqual([]);
  });

  test("happy path, branch already exists locally: status, fetch, rev-parse, checkout, rebase, merge-base, in order", async () => {
    const { calls, _git } = scriptedGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--verify") return { ok: true, stdout: "sha\n", stderr: "" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result).toEqual({ ok: true, branch: "main" });
    expect(calls.map((a) => a[0])).toEqual([
      "status",
      "fetch",
      "rev-parse",
      "checkout",
      "rebase",
      "merge-base",
    ]);
    expect(calls[3]).toEqual(["checkout", "main"]);
    expect(calls[4]).toEqual(["rebase", "--empty=drop", "FETCH_HEAD"]);
    expect(calls[5]).toEqual(["merge-base", "--is-ancestor", "abc1234", "HEAD"]);
  });

  test("happy path, branch absent locally: checkout -B, no rebase step", async () => {
    const { calls, _git } = scriptedGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--verify") return { ok: false, stdout: "", stderr: "" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result).toEqual({ ok: true, branch: "main" });
    expect(calls.map((a) => a[0])).toEqual(["status", "fetch", "rev-parse", "checkout", "merge-base"]);
    expect(calls[3]).toEqual(["checkout", "-B", "main", "FETCH_HEAD"]);
  });

  test("merge-base falls back to FETCH_HEAD when mergeSha is nullish", async () => {
    const { calls, _git } = scriptedGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--verify") return { ok: false, stdout: "", stderr: "" };
    });
    await updateDefaultBranch({ defaultBranch: "main", mergeSha: null, _git });
    expect(calls[calls.length - 1]).toEqual(["merge-base", "--is-ancestor", "FETCH_HEAD", "HEAD"]);
  });

  test("step 1: !ok status is a failure — reason 'working tree is dirty', reports the branch HEAD is actually on", async () => {
    const { _git } = scriptedGit((argv) => {
      if (argv[0] === "status") return { ok: false, stdout: "", stderr: "" };
      if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") {
        return { ok: true, stdout: "feat-widget\n", stderr: "" };
      }
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result).toEqual({ ok: false, reason: "working tree is dirty", branch: "feat-widget" });
  });

  test("step 1: non-empty stdout is ALSO a failure — 'working tree is dirty'", async () => {
    const { _git } = scriptedGit((argv) => {
      if (argv[0] === "status") return { ok: true, stdout: " M dirty-file.txt\n", stderr: "" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("working tree is dirty");
  });

  test("step 2: fetch failure — reason names the first stderr line", async () => {
    const { _git } = scriptedGit((argv) => {
      if (argv[0] === "fetch") return { ok: false, stdout: "", stderr: "fatal: unable to access\nsecond line" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("git fetch failed: fatal: unable to access");
  });

  test("step 4: checkout failure — reason names the first stderr line, reports the branch HEAD is on", async () => {
    const { _git } = scriptedGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--verify") return { ok: false, stdout: "", stderr: "" };
      if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") {
        return { ok: true, stdout: "feat-widget\n", stderr: "" };
      }
      if (argv[0] === "checkout") return { ok: false, stdout: "", stderr: "error: pathspec 'main' did not match" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result).toEqual({
      ok: false,
      reason: "checkout failed: error: pathspec 'main' did not match",
      branch: "feat-widget",
    });
  });

  test("step 5: rebase conflict — runs rebase --abort (ignored), reason names the replay conflict", async () => {
    const { calls, _git } = scriptedGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--verify") return { ok: true, stdout: "sha\n", stderr: "" };
      if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") return { ok: true, stdout: "main\n", stderr: "" };
      if (argv[0] === "rebase" && argv[1] === "--empty=drop") {
        return { ok: false, stdout: "", stderr: "CONFLICT (content): Merge conflict in x.js" };
      }
      if (argv[0] === "rebase" && argv[1] === "--abort") return { ok: true, stdout: "", stderr: "" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe(
      "replay of local queue-row commits onto main conflicted: CONFLICT (content): Merge conflict in x.js",
    );
    expect(calls.some((a) => a[0] === "rebase" && a[1] === "--abort")).toBe(true);
  });

  test("step 5's abort result is ignored even when the abort itself fails", async () => {
    const { _git } = scriptedGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--verify") return { ok: true, stdout: "sha\n", stderr: "" };
      if (argv[0] === "rebase" && argv[1] === "--empty=drop") return { ok: false, stdout: "", stderr: "conflict" };
      if (argv[0] === "rebase" && argv[1] === "--abort") return { ok: false, stdout: "", stderr: "abort also failed" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("replay of local queue-row commits onto main conflicted: conflict");
  });

  test("step 6: merge-base ancestry failure — fixed reason, reports the branch HEAD is on", async () => {
    const { _git } = scriptedGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--verify") return { ok: false, stdout: "", stderr: "" };
      if (argv[0] === "rev-parse" && argv[1] === "--abbrev-ref") return { ok: true, stdout: "main\n", stderr: "" };
      if (argv[0] === "merge-base") return { ok: false, stdout: "", stderr: "" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result).toEqual({
      ok: false,
      reason: "merge commit is not an ancestor of HEAD after update",
      branch: "main",
    });
  });

  test("on failure, the reported branch falls back to 'unknown' when the rev-parse --abbrev-ref probe itself fails", async () => {
    const { _git } = scriptedGit((argv) => {
      if (argv[0] === "status") return { ok: false, stdout: "", stderr: "" };
      if (argv[0] === "rev-parse") return { ok: false, stdout: "", stderr: "" };
    });
    const result = await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    expect(result.branch).toBe("unknown");
  });

  test("argv arrays, never command strings — every call is an array", async () => {
    const { calls, _git } = scriptedGit((argv) => {
      if (argv[0] === "rev-parse" && argv[1] === "--verify") return { ok: true, stdout: "sha\n", stderr: "" };
    });
    await updateDefaultBranch({ defaultBranch: "main", mergeSha: "abc1234", _git });
    for (const call of calls) {
      expect(Array.isArray(call)).toBe(true);
    }
  });
});

// ─── MERGE_NOTES — TSPEC §7.1/§10.2 naming-drift reconciliation (A6, SE F-04) ──

describe("MERGE_NOTES.aheadOfRemote", () => {
  test("the exact FSPEC §8.2 sentence, interpolating O4's defaultBranchRef.name and the feature", () => {
    expect(MERGE_NOTES.aheadOfRemote("main", "widget")).toBe(
      "Local main is ahead of its remote by the queue-row commit for widget; " +
        "pdlc does not push it — it reaches the remote with the next feature's PR.",
    );
  });

  test("MERGE_NOTES is frozen (DC-01)", () => {
    expect(Object.isFrozen(MERGE_NOTES)).toBe(true);
  });
});

// ─── MERGE_ESCALATIONS.tree/.queue — literal FSPEC §9.3 anchors (CR
// test-engineer finding 2). mergePhase.test.js's escalation assertions all
// build their expected value by calling this same catalogue — an
// implementation echo that cannot catch a reworded template. These two
// tests transcribe FSPEC §9.3's wording by hand, mirroring the guard
// escalation's literal anchor at mergePhase.test.js:552 and
// MERGE_NOTES.aheadOfRemote's literal anchor immediately above. ──────────

describe("MERGE_ESCALATIONS.tree / .queue — literal text (FSPEC §9.3)", () => {
  test("MERGE_ESCALATIONS.tree — the exact FSPEC §9.3 sentence", () => {
    expect(
      MERGE_ESCALATIONS.tree({ prUrl: "https://github.com/o/r/pull/42", reason: "working tree is dirty", branch: "unknown" }),
    ).toBe(
      "MERGE ESCALATION: working tree not updated after merging https://github.com/o/r/pull/42 — working tree is dirty; tree is on unknown",
    );
  });

  test("MERGE_ESCALATIONS.queue — the exact FSPEC §9.3 sentence", () => {
    expect(
      MERGE_ESCALATIONS.queue({
        prUrl: "https://github.com/o/r/pull/42",
        shortSha: "abc1234",
        feature: "widget",
        detail: "queue row not found",
      }),
    ).toBe(
      "MERGE ESCALATION: merged https://github.com/o/r/pull/42 (abc1234) but the queue row for widget was not updated — queue row not found",
    );
  });
});

// ─── MERGE_NOTES — literal text for the remaining six catalogue members (CR
// test-engineer finding 3). `aheadOfRemote` was already anchored above;
// everywhere else `mergePhase.test.js` asserts these six against
// `MERGE_NOTES.*(…)` itself — an implementation echo. One literal anchor
// per member, same remedy as finding 2. ─────────────────────────────────

describe("MERGE_NOTES — literal text (remaining catalogue members)", () => {
  test("mergeDeferred — the exact FSPEC §9.4 sentence", () => {
    expect(MERGE_NOTES.mergeDeferred("widget", "no permitted merge method")).toBe(
      "Merge deferred for widget: no permitted merge method. The queue row is unchanged; merge the PR to advance it.",
    );
  });

  test("sectionMalformed — the exact TSPEC §3.3/§10.3 sentence", () => {
    expect(MERGE_NOTES.sectionMalformed()).toBe(
      '.claude/pdlc.config.json\'s "merge" section is present but not an object; every merge setting is using its default.',
    );
  });

  test("noPrNumber — the exact TSPEC §7.5/E19 sentence", () => {
    expect(MERGE_NOTES.noPrNumber("widget", "https://github.com/o/r/pull/42")).toBe(
      "Queue row for widget was not updated: no PR number could be resolved from https://github.com/o/r/pull/42.",
    );
  });

  test("recordedUncommitted — the exact TSPEC §7.5 sentence", () => {
    expect(MERGE_NOTES.recordedUncommitted("widget", "queue row recorded but not committed")).toBe(
      "Queue row for widget: queue row recorded but not committed",
    );
  });

  test("nonOverwrite — the exact FSPEC §2.5 sentence", () => {
    expect(MERGE_NOTES.nonOverwrite("widget", 'row left unchanged: found status "blocked"')).toBe(
      'Queue row for widget: row left unchanged: found status "blocked"',
    );
  });

  test("branchDeleteFailed — the exact TSPEC §7.2/FSPEC §6.4 sentence", () => {
    expect(MERGE_NOTES.branchDeleteFailed("widget", "no such remote branch")).toBe(
      "Remote branch deletion failed for widget: no such remote branch",
    );
  });
});
