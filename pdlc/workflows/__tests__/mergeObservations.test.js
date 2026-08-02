// ─── mergeObservations.test.js ──────────────────────────────────────────────
//
// PLAN §12 A2 (pdlc-merge-phase). TSPEC §4.1–§4.7 — the PURE half of the six
// observation points: `mergeCommandFor` (the single home of every `gh`
// command string), `parsePrRef`, and every `classify*` function.
//
// Per TSPEC §13.2, this file has two blocks. THIS TASK (A2) owns block (a)
// only — the pure functions, tested standalone with no `_ghRun` double at
// all. Block (b) — the transport-level `observe*` wrappers driven through
// `fakeGhRun` — is A5's, appended later to this same file (PLAN §4/§5: the
// A2 → A5 edge exists precisely because A5 appends here).
//
// Every `classify*` shares one fail-closed shape: `{ ok: true, ... } |
// { ok: false, reason }`, `reason` drawn from the closed `OBSERVATION_REASONS`
// catalogue (TSPEC §4.1, DC-01, DC-11).

import {
  mergeCommandFor,
  parsePrRef,
  classifyPrState,
  classifyReviewThreads,
  classifyRepoCaps,
  classifyChangedFiles,
  classifyMergeResult,
  OBSERVATION_REASONS,
  defaultGhRun,
  observePrState,
  observeCi,
  observeReviewThreads,
  observeRepoCaps,
  observeChangedFiles,
  decideMerge,
  MERGE_DEFAULTS,
} from "../orchestrate-dev.js";
import { fakeGhRun, passingGh } from "./helpers/mergeDoubles.js";

// ─── (a) mergeCommandFor — exact bytes per surface (TSPEC §4.1–§4.7) ───────

describe("mergeCommandFor", () => {
  test("prState — O1's exact command", () => {
    expect(mergeCommandFor("prState", { prUrl: "https://github.com/o/r/pull/42" })).toBe(
      "gh pr view https://github.com/o/r/pull/42 --json state,mergeable,mergeStateStatus,number,mergeCommit",
    );
  });

  test("ci — O2's exact command (the same rollup checkPrCi reads)", () => {
    expect(mergeCommandFor("ci", { prUrl: "https://github.com/o/r/pull/42" })).toBe(
      "gh pr view https://github.com/o/r/pull/42 --json statusCheckRollup",
    );
  });

  test("repoCaps — O4's exact command, no PR URL involved", () => {
    expect(mergeCommandFor("repoCaps", {})).toBe(
      "gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge,defaultBranchRef",
    );
  });

  test("changedFiles — O5 step 1's exact command", () => {
    expect(mergeCommandFor("changedFiles", { prUrl: "https://github.com/o/r/pull/42" })).toBe(
      "gh pr view https://github.com/o/r/pull/42 --json files",
    );
  });

  test("changedFilesFallback — O5 step 2's exact command", () => {
    expect(
      mergeCommandFor("changedFilesFallback", { owner: "o", repo: "r", number: 42 }),
    ).toBe("gh api --paginate --slurp repos/o/r/pulls/42/files");
  });

  test("merge — O6's exact command, one per candidate method", () => {
    expect(mergeCommandFor("merge", { prUrl: "https://github.com/o/r/pull/42", method: "rebase" })).toBe(
      "gh pr merge https://github.com/o/r/pull/42 --rebase",
    );
    expect(mergeCommandFor("merge", { prUrl: "https://github.com/o/r/pull/42", method: "merge" })).toBe(
      "gh pr merge https://github.com/o/r/pull/42 --merge",
    );
    expect(mergeCommandFor("merge", { prUrl: "https://github.com/o/r/pull/42", method: "squash" })).toBe(
      "gh pr merge https://github.com/o/r/pull/42 --squash",
    );
  });

  test("mergeReadback — O6's read-back, exact command", () => {
    expect(mergeCommandFor("mergeReadback", { prUrl: "https://github.com/o/r/pull/42" })).toBe(
      "gh pr view https://github.com/o/r/pull/42 --json mergeCommit,state",
    );
  });

  test("reviewThreads — O3's exact GraphQL command, cursor OMITTED on the first call", () => {
    const cmd = mergeCommandFor("reviewThreads", { owner: "o", repo: "r", number: 42 });
    expect(cmd).toBe(
      "gh api graphql -f owner=o -f repo=r -F number=42 -f query='\n" +
        "query($owner:String!,$repo:String!,$number:Int!,$cursor:String){\n" +
        "  repository(owner:$owner,name:$repo){ pullRequest(number:$number){\n" +
        "    reviewThreads(first:100, after:$cursor){\n" +
        "      pageInfo{ hasNextPage endCursor } nodes{ isResolved } } } } }'",
    );
    expect(cmd).not.toMatch(/-f cursor=/);
  });

  test("reviewThreads — cursor is passed as endCursor on later pages", () => {
    const cmd = mergeCommandFor("reviewThreads", { owner: "o", repo: "r", number: 42, cursor: "abc123==" });
    expect(cmd).toMatch(/-f cursor=abc123==/);
    // -F for number (an Int), -f for everything else (TSPEC §4.4)
    expect(cmd).toMatch(/-F number=42/);
    expect(cmd).not.toMatch(/-f number=/);
  });

  test("throws on an unrecognised surface — mergeCommandFor is the ONLY builder, and it is total over its own domain", () => {
    expect(() => mergeCommandFor("nonsense", {})).toThrow(/unrecognised surface/);
  });
});

// ─── (a) parsePrRef — pure parse of a PR URL (TSPEC §4.4) ──────────────────

describe("parsePrRef", () => {
  test("parses the canonical shape", () => {
    expect(parsePrRef("https://github.com/acme/widgets/pull/42")).toEqual({
      owner: "acme",
      repo: "widgets",
      number: 42,
    });
  });

  test("host is ignored (GitHub Enterprise, etc.)", () => {
    expect(parsePrRef("https://ghe.example.com/acme/widgets/pull/7")).toEqual({
      owner: "acme",
      repo: "widgets",
      number: 7,
    });
  });

  test("tolerates trailing path segments", () => {
    expect(parsePrRef("https://github.com/acme/widgets/pull/42/files")).toEqual({
      owner: "acme",
      repo: "widgets",
      number: 42,
    });
  });

  test("tolerates a query string", () => {
    expect(parsePrRef("https://github.com/acme/widgets/pull/42?tab=files")).toEqual({
      owner: "acme",
      repo: "widgets",
      number: 42,
    });
  });

  test("returns null for a malformed URL", () => {
    expect(parsePrRef("not a url")).toBeNull();
    expect(parsePrRef("https://github.com/acme/widgets")).toBeNull();
    expect(parsePrRef("https://github.com/acme/widgets/pull/notanumber")).toBeNull();
    expect(parsePrRef("https://github.com/acme/widgets/pull/0")).toBeNull();
    expect(parsePrRef("https://github.com/acme/widgets/pull/-1")).toBeNull();
  });

  test("returns null for non-string input", () => {
    expect(parsePrRef(null)).toBeNull();
    expect(parsePrRef(undefined)).toBeNull();
    expect(parsePrRef(42)).toBeNull();
  });
});

// ─── (a) OBSERVATION_REASONS — the shared frozen catalogue (DC-01) ─────────

describe("OBSERVATION_REASONS", () => {
  test("is exactly the closed set TSPEC §4.1/§4.7 names", () => {
    expect(OBSERVATION_REASONS).toEqual([
      "command-failed",
      "unparseable",
      "field-absent",
      "unrecognised-value",
      "incomplete",
      "not-confirmed",
    ]);
  });

  test("is frozen", () => {
    expect(Object.isFrozen(OBSERVATION_REASONS)).toBe(true);
  });
});

// ─── (a) classifyPrState — O1's per-field sentinel rule (TSPEC §4.2) ───────

describe("classifyPrState", () => {
  const raw = (obj) => JSON.stringify(obj);

  test("command-failed when the underlying command did not run (raw is null)", () => {
    expect(classifyPrState(null)).toEqual({ ok: false, reason: "command-failed" });
  });

  test("unparseable when the output is not JSON", () => {
    expect(classifyPrState("not json {")).toEqual({ ok: false, reason: "unparseable" });
  });

  test("field-absent when `state` is missing entirely", () => {
    expect(classifyPrState(raw({ mergeable: "MERGEABLE" }))).toEqual({
      ok: false,
      reason: "field-absent",
    });
  });

  test("unrecognised-value when `state` is outside {OPEN, CLOSED, MERGED}", () => {
    expect(classifyPrState(raw({ state: "DRAFTED" }))).toEqual({
      ok: false,
      reason: "unrecognised-value",
    });
  });

  test.each(["OPEN", "CLOSED", "MERGED"])("recognises state %s", (state) => {
    const result = classifyPrState(raw({ state, mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42 }));
    expect(result.ok).toBe(true);
    expect(result.state).toBe(state);
  });

  test.each(["MERGEABLE", "CONFLICTING", "UNKNOWN"])("recognises mergeable %s", (mergeable) => {
    const result = classifyPrState(raw({ state: "OPEN", mergeable, mergeStateStatus: "CLEAN", number: 42 }));
    expect(result.ok).toBe(true);
    expect(result.mergeable).toBe(mergeable);
  });

  test("mergeable outside its recognised set becomes the sentinel, not a whole-observation failure", () => {
    const result = classifyPrState(raw({ state: "OPEN", mergeable: "GARBAGE", mergeStateStatus: "CLEAN", number: 42 }));
    expect(result.ok).toBe(true);
    expect(result.mergeable).toBe("__unrecognised__");
  });

  test("mergeable absent also becomes the sentinel", () => {
    const result = classifyPrState(raw({ state: "OPEN", mergeStateStatus: "CLEAN", number: 42 }));
    expect(result.ok).toBe(true);
    expect(result.mergeable).toBe("__unrecognised__");
  });

  test.each(["CLEAN", "UNSTABLE", "BEHIND", "BLOCKED", "DIRTY", "DRAFT", "HAS_HOOKS", "UNKNOWN"])(
    "recognises mergeStateStatus %s",
    (mergeStateStatus) => {
      const result = classifyPrState(raw({ state: "OPEN", mergeable: "MERGEABLE", mergeStateStatus, number: 42 }));
      expect(result.ok).toBe(true);
      expect(result.mergeStateStatus).toBe(mergeStateStatus);
    },
  );

  test("mergeStateStatus outside its eight-value set becomes the sentinel", () => {
    const result = classifyPrState(raw({ state: "OPEN", mergeable: "MERGEABLE", mergeStateStatus: "WEIRD", number: 42 }));
    expect(result.ok).toBe(true);
    expect(result.mergeStateStatus).toBe("__unrecognised__");
  });

  test("a non-positive-integer number becomes null, never a failure", () => {
    const result = classifyPrState(raw({ state: "OPEN", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: "notanumber" }));
    expect(result.ok).toBe(true);
    expect(result.number).toBeNull();
  });

  test("number 0 or negative is also null", () => {
    expect(classifyPrState(raw({ state: "OPEN", number: 0 })).number).toBeNull();
    expect(classifyPrState(raw({ state: "OPEN", number: -3 })).number).toBeNull();
  });

  test("a valid positive integer number passes through", () => {
    const result = classifyPrState(raw({ state: "OPEN", number: 7 }));
    expect(result.number).toBe(7);
  });

  test("mergeCommit.oid absent is LEGAL (open PR) — null, never a failure", () => {
    const result = classifyPrState(raw({ state: "OPEN" }));
    expect(result.ok).toBe(true);
    expect(result.mergeCommitOid).toBeNull();
  });

  test("mergeCommit.oid present (merged PR) is carried through", () => {
    const result = classifyPrState(raw({ state: "MERGED", mergeCommit: { oid: "abc1234def5678" } }));
    expect(result.ok).toBe(true);
    expect(result.mergeCommitOid).toBe("abc1234def5678");
  });

  test("a non-string mergeCommit.oid is null, never a failure", () => {
    const result = classifyPrState(raw({ state: "OPEN", mergeCommit: { oid: 12345 } }));
    expect(result.ok).toBe(true);
    expect(result.mergeCommitOid).toBeNull();
  });
});

// ─── (a) classifyReviewThreads — O3, one page at a time (TSPEC §4.4) ───────

describe("classifyReviewThreads", () => {
  const page = (obj) =>
    JSON.stringify({ data: { repository: { pullRequest: { reviewThreads: obj } } } });

  test("command-failed when raw is null", () => {
    expect(classifyReviewThreads(null)).toEqual({ ok: false, reason: "command-failed" });
  });

  test("unparseable when the output is not JSON", () => {
    expect(classifyReviewThreads("{{{not json")).toEqual({ ok: false, reason: "unparseable" });
  });

  test("field-absent when `nodes` is missing", () => {
    expect(
      classifyReviewThreads(page({ pageInfo: { hasNextPage: false, endCursor: null } })),
    ).toEqual({ ok: false, reason: "field-absent" });
  });

  test("field-absent when `pageInfo` is missing", () => {
    expect(classifyReviewThreads(page({ nodes: [] }))).toEqual({
      ok: false,
      reason: "field-absent",
    });
  });

  test("unrecognised-value when a node's isResolved is not a boolean", () => {
    expect(
      classifyReviewThreads(
        page({ pageInfo: { hasNextPage: false, endCursor: null }, nodes: [{ isResolved: "yes" }] }),
      ),
    ).toEqual({ ok: false, reason: "unrecognised-value" });
  });

  test("an empty node list is a valid, fully-resolved page", () => {
    const result = classifyReviewThreads(
      page({ pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] }),
    );
    expect(result).toEqual({ ok: true, hasNextPage: false, endCursor: null, unresolved: 0 });
  });

  test("counts unresolved threads on the page and carries pagination state", () => {
    const result = classifyReviewThreads(
      page({
        pageInfo: { hasNextPage: true, endCursor: "cursor1" },
        nodes: [{ isResolved: true }, { isResolved: false }, { isResolved: false }],
      }),
    );
    expect(result).toEqual({ ok: true, hasNextPage: true, endCursor: "cursor1", unresolved: 2 });
  });
});

// ─── (a) classifyRepoCaps — O4 (TSPEC §4.5) ────────────────────────────────

describe("classifyRepoCaps", () => {
  const raw = (obj) => JSON.stringify(obj);
  const full = {
    rebaseMergeAllowed: true,
    mergeCommitAllowed: true,
    squashMergeAllowed: false,
    deleteBranchOnMerge: true,
    defaultBranchRef: { name: "main" },
  };

  test("command-failed when raw is null", () => {
    expect(classifyRepoCaps(null)).toEqual({ ok: false, reason: "command-failed" });
  });

  test("unparseable when the output is not JSON", () => {
    expect(classifyRepoCaps("not json")).toEqual({ ok: false, reason: "unparseable" });
  });

  test("recognises a fully well-formed reply", () => {
    expect(classifyRepoCaps(raw(full))).toEqual({
      ok: true,
      rebase: true,
      mergeCommit: true,
      squash: false,
      deleteBranchOnMerge: true,
      defaultBranch: "main",
    });
  });

  test.each([
    "rebaseMergeAllowed",
    "mergeCommitAllowed",
    "squashMergeAllowed",
    "deleteBranchOnMerge",
  ])("fails closed when %s is absent", (key) => {
    const { [key]: _drop, ...rest } = full;
    const result = classifyRepoCaps(raw(rest));
    expect(result.ok).toBe(false);
  });

  test.each([
    "rebaseMergeAllowed",
    "mergeCommitAllowed",
    "squashMergeAllowed",
    "deleteBranchOnMerge",
  ])("fails closed when %s is not a boolean (garbage value)", (key) => {
    const result = classifyRepoCaps(raw({ ...full, [key]: "yes" }));
    expect(result.ok).toBe(false);
  });

  test("fails closed when defaultBranchRef.name is absent", () => {
    const result = classifyRepoCaps(raw({ ...full, defaultBranchRef: {} }));
    expect(result.ok).toBe(false);
  });

  test("fails closed when defaultBranchRef.name is empty", () => {
    const result = classifyRepoCaps(raw({ ...full, defaultBranchRef: { name: "" } }));
    expect(result.ok).toBe(false);
  });

  test("fails closed when defaultBranchRef itself is missing", () => {
    const { defaultBranchRef: _drop, ...rest } = full;
    expect(classifyRepoCaps(raw(rest)).ok).toBe(false);
  });
});

// ─── (a) classifyChangedFiles — O5's completeness rule (TSPEC §4.6) ───────

describe("classifyChangedFiles", () => {
  const primaryOf = (files) => JSON.stringify({ files });
  const fallbackOf = (pages) => JSON.stringify(pages);

  test("command-failed at step 1 with no fallback available is possibly-incomplete → incomplete", () => {
    // Step 1 failed (raw null) and no fallback raw was supplied at all.
    expect(classifyChangedFiles(null, null)).toEqual({ ok: false, reason: "incomplete" });
  });

  test("a short, well-formed step-1 list is COMPLETE — no fallback needed, even if fallbackRaw is null", () => {
    const result = classifyChangedFiles(primaryOf([{ path: "a.js" }, { path: "b.js" }]), null);
    expect(result).toEqual({ ok: true, files: ["a.js", "b.js"] });
  });

  test("an empty step-1 list is a VALID observation, not a failure", () => {
    expect(classifyChangedFiles(primaryOf([]), null)).toEqual({ ok: true, files: [] });
  });

  test("a full-page step-1 list is possibly incomplete and falls back", () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ path: `f${i}.js` }));
    const fallbackPages = [[{ filename: "f0.js" }, { filename: "f1.js" }]];
    const result = classifyChangedFiles(primaryOf(fullPage), fallbackOf(fallbackPages));
    expect(result).toEqual({ ok: true, files: ["f0.js", "f1.js"] });
  });

  test("a member without a string path is unparseable — no fallback attempted", () => {
    const result = classifyChangedFiles(primaryOf([{ notPath: "x" }]), fallbackOf([[{ filename: "should-not-be-used" }]]));
    expect(result).toEqual({ ok: false, reason: "unparseable" });
  });

  test("fallback rename rule: previous_filename is added alongside filename", () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ path: `f${i}.js` }));
    const fallbackPages = [[{ filename: "new.js", previous_filename: "old.js" }]];
    const result = classifyChangedFiles(primaryOf(fullPage), fallbackOf(fallbackPages));
    expect(result).toEqual({ ok: true, files: ["new.js", "old.js"] });
  });

  test("fallback that fails to parse as an array of arrays is incomplete", () => {
    const result = classifyChangedFiles(null, "not json");
    expect(result).toEqual({ ok: false, reason: "incomplete" });
  });

  test("fallback whose pages contain an element without a string filename is incomplete", () => {
    const result = classifyChangedFiles(null, fallbackOf([[{ notFilename: "x" }]]));
    expect(result).toEqual({ ok: false, reason: "incomplete" });
  });

  test("a needed fallback that never ran (fallbackRaw null) is incomplete", () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ path: `f${i}.js` }));
    expect(classifyChangedFiles(primaryOf(fullPage), null)).toEqual({ ok: false, reason: "incomplete" });
  });

  test("step 1 not an array of files at all is possibly incomplete (falls back)", () => {
    const result = classifyChangedFiles(JSON.stringify({ files: "not-an-array" }), fallbackOf([[{ filename: "x.js" }]]));
    expect(result).toEqual({ ok: true, files: ["x.js"] });
  });
});

// ─── (a) classifyMergeResult — O6's read-back check (TSPEC §4.7) ──────────

describe("classifyMergeResult", () => {
  test("command-failed when the merge command itself never ran", () => {
    expect(classifyMergeResult(null, JSON.stringify({ state: "MERGED", mergeCommit: { oid: "abc1234" } }))).toEqual({
      ok: false,
      reason: "command-failed",
    });
  });

  test("command-failed when the read-back command itself never ran", () => {
    expect(classifyMergeResult("Merged pull request #42\n", null)).toEqual({
      ok: false,
      reason: "command-failed",
    });
  });

  test("unparseable when the read-back output is not JSON", () => {
    expect(classifyMergeResult("Merged pull request #42\n", "not json")).toEqual({
      ok: false,
      reason: "unparseable",
    });
  });

  test("confirmed: state MERGED and a string oid", () => {
    const result = classifyMergeResult(
      "Merged pull request #42\n",
      JSON.stringify({ state: "MERGED", mergeCommit: { oid: "abc1234def" } }),
    );
    expect(result).toEqual({ ok: true, oid: "abc1234def" });
  });

  test("not-confirmed: zero-exit merge, but read-back state is not MERGED", () => {
    const result = classifyMergeResult(
      "Merged pull request #42\n",
      JSON.stringify({ state: "OPEN", mergeCommit: null }),
    );
    expect(result).toEqual({ ok: false, reason: "not-confirmed" });
  });

  test("not-confirmed: state MERGED but oid missing/non-string", () => {
    const result = classifyMergeResult(
      "Merged pull request #42\n",
      JSON.stringify({ state: "MERGED", mergeCommit: {} }),
    );
    expect(result).toEqual({ ok: false, reason: "not-confirmed" });
  });

  test("every reason classifyMergeResult can produce is a member of OBSERVATION_REASONS", () => {
    const cases = [
      classifyMergeResult(null, "x"),
      classifyMergeResult("x", null),
      classifyMergeResult("x", "not json"),
      classifyMergeResult("x", JSON.stringify({ state: "OPEN" })),
    ];
    for (const c of cases) {
      expect(OBSERVATION_REASONS).toContain(c.reason);
    }
  });
});

// ─── (b) defaultGhRun — the seam's Node default (TSPEC §4.1) ──────────────
//
// PLAN §12 A5. Mirrors `defaultGit`'s exact three-field contract and its
// exact `catch` shape (`err.stderr || err.message`), never throws.

describe("defaultGhRun", () => {
  test("success: ok true, stdout carried, stderr empty", async () => {
    const execFn = () => "output text\n";
    const result = await defaultGhRun("gh pr view https://x/pull/1 --json state", { execFn });
    expect(result).toEqual({ ok: true, stdout: "output text\n", stderr: "" });
  });

  test("success with a falsy return value still yields a string stdout", async () => {
    const execFn = () => undefined;
    const result = await defaultGhRun("gh repo view --json x", { execFn });
    expect(result).toEqual({ ok: true, stdout: "", stderr: "" });
  });

  test("failure: prefers err.stderr over err.message, matching defaultGit exactly", async () => {
    const execFn = () => {
      const err = new Error("exec failed generically");
      err.stderr = "gh: command not found";
      throw err;
    };
    const result = await defaultGhRun("gh pr view https://x/pull/1 --json state", { execFn });
    expect(result).toEqual({ ok: false, stdout: "", stderr: "gh: command not found" });
  });

  test("failure: falls back to err.message when err.stderr is absent", async () => {
    const execFn = () => {
      throw new Error("spawn gh ENOENT");
    };
    const result = await defaultGhRun("gh pr view https://x/pull/1 --json state", { execFn });
    expect(result).toEqual({ ok: false, stdout: "", stderr: "spawn gh ENOENT" });
  });

  test("failure: a thrown non-Error still yields a string stderr, never throws out", async () => {
    const execFn = () => {
      // eslint-disable-next-line no-throw-literal
      throw "raw string throw";
    };
    await expect(defaultGhRun("gh pr view https://x/pull/1 --json state", { execFn })).resolves.toEqual({
      ok: false,
      stdout: "",
      stderr: "",
    });
  });

  test("passes the exact command string through to execFn, untouched", async () => {
    const seen = [];
    const execFn = (cmd) => {
      seen.push(cmd);
      return "{}";
    };
    const command = mergeCommandFor("repoCaps", {});
    await defaultGhRun(command, { execFn });
    expect(seen).toEqual([command]);
  });
});

// ─── (b) observePrState — O1 (TSPEC §4.2) ──────────────────────────────────

describe("observePrState", () => {
  test("issues exactly mergeCommandFor's prState command, and nothing else", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { calls, _ghRun } = fakeGhRun(passingGh());
    await observePrState(prUrl, { _ghRun });
    expect(calls).toEqual([mergeCommandFor("prState", { prUrl })]);
  });

  test("a passing reply classifies through to a full O1Observation", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun(passingGh({ prState: { stdout: JSON.stringify({ state: "OPEN", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42 }) } }));
    const result = await observePrState(prUrl, { _ghRun });
    expect(result).toEqual({ ok: true, state: "OPEN", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42, mergeCommitOid: null });
  });

  test("a transport failure fails closed with command-failed, never throws", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun({}); // no fixture at all — fails closed
    const result = await observePrState(prUrl, { _ghRun });
    expect(result).toEqual({ ok: false, reason: "command-failed" });
  });

  test("garbage (unparseable) stdout fails closed with unparseable", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun(passingGh({ prState: { stdout: "not json {{{" } }));
    const result = await observePrState(prUrl, { _ghRun });
    expect(result).toEqual({ ok: false, reason: "unparseable" });
  });
});

// ─── (b) observeCi — O2, delegating to checkPrCi unchanged (TSPEC §4.4) ───

describe("observeCi", () => {
  test("issues exactly mergeCommandFor's ci command", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { calls, _ghRun } = fakeGhRun(passingGh());
    await observeCi(prUrl, { _ghRun });
    expect(calls).toEqual([mergeCommandFor("ci", { prUrl })]);
  });

  test("hands the raw rollup text to checkPrCi and returns its verdict — passed", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun(
      passingGh({ ci: { stdout: JSON.stringify({ statusCheckRollup: [{ status: "COMPLETED", conclusion: "SUCCESS" }] }) } }),
    );
    expect(await observeCi(prUrl, { _ghRun })).toBe("passed");
  });

  test("a failed check rolls up to failed", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun(
      passingGh({ ci: { stdout: JSON.stringify({ statusCheckRollup: [{ status: "COMPLETED", conclusion: "FAILURE" }] }) } }),
    );
    expect(await observeCi(prUrl, { _ghRun })).toBe("failed");
  });

  test("no rollup entries reported is none", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun(passingGh({ ci: { stdout: JSON.stringify({ statusCheckRollup: [] }) } }));
    expect(await observeCi(prUrl, { _ghRun })).toBe("none");
  });

  test("a transport failure never throws and classifies unknown (no second classifier — AC-4.0)", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun({});
    expect(await observeCi(prUrl, { _ghRun })).toBe("unknown");
  });

  test("garbage stdout also classifies unknown", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun(passingGh({ ci: { stdout: "not json" } }));
    expect(await observeCi(prUrl, { _ghRun })).toBe("unknown");
  });

  test("_checkCi is injectable and receives the raw rollup text via execFn", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const { _ghRun } = fakeGhRun(passingGh({ ci: { stdout: "the-raw-rollup-text" } }));
    const seenExecFn = [];
    const _checkCi = async (url, { execFn }) => {
      seenExecFn.push(execFn());
      return "passed";
    };
    const result = await observeCi(prUrl, { _ghRun, _checkCi });
    expect(result).toBe("passed");
    expect(seenExecFn).toEqual(["the-raw-rollup-text"]);
  });
});

// ─── (b) observeReviewThreads — O3, bounded cursor pagination (TSPEC §4.4) ─

describe("observeReviewThreads", () => {
  const ref = { owner: "o", repo: "r", number: 42 };

  test("null ref (unparseable PR URL) fails closed without issuing any command", async () => {
    const { calls, _ghRun } = fakeGhRun(passingGh());
    const result = await observeReviewThreads(null, { _ghRun });
    expect(result).toEqual({ ok: false, reason: "unparseable" });
    expect(calls).toEqual([]);
  });

  test("a single page with no next page: one call, aggregated count", async () => {
    const page = JSON.stringify({
      data: { repository: { pullRequest: { reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [{ isResolved: true }, { isResolved: false }] } } } },
    });
    const { calls, _ghRun } = fakeGhRun(passingGh({ reviewThreads: { stdout: page } }));
    const result = await observeReviewThreads(ref, { _ghRun });
    expect(result).toEqual({ ok: true, unresolved: 1 });
    expect(calls).toHaveLength(1);
  });

  test("cursor is omitted on the first call and forwarded as endCursor on the next", async () => {
    const pageOne = { data: { repository: { pullRequest: { reviewThreads: { pageInfo: { hasNextPage: true, endCursor: "CUR1" }, nodes: [{ isResolved: false }] } } } } };
    const pageTwo = { data: { repository: { pullRequest: { reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [{ isResolved: false }] } } } } };
    let call = 0;
    const _ghRun = async (command) => {
      call += 1;
      if (call === 1) {
        expect(command).not.toMatch(/-f cursor=/);
        return { ok: true, stdout: JSON.stringify(pageOne), stderr: "" };
      }
      expect(command).toMatch(/-f cursor=CUR1/);
      return { ok: true, stdout: JSON.stringify(pageTwo), stderr: "" };
    };
    const result = await observeReviewThreads(ref, { _ghRun });
    expect(result).toEqual({ ok: true, unresolved: 2 });
    expect(call).toBe(2);
  });

  test("three pages aggregate across all of them", async () => {
    const mkPage = (hasNextPage, endCursor, unresolvedCount) => ({
      data: {
        repository: {
          pullRequest: {
            reviewThreads: {
              pageInfo: { hasNextPage, endCursor },
              nodes: Array.from({ length: unresolvedCount }, () => ({ isResolved: false })),
            },
          },
        },
      },
    });
    const pages = [mkPage(true, "c1", 2), mkPage(true, "c2", 3), mkPage(false, null, 1)];
    let call = 0;
    const _ghRun = async () => {
      const reply = pages[call];
      call += 1;
      return { ok: true, stdout: JSON.stringify(reply), stderr: "" };
    };
    const result = await observeReviewThreads(ref, { _ghRun });
    expect(result).toEqual({ ok: true, unresolved: 6 });
    expect(call).toBe(3);
  });

  test("exceeding MERGE_MAX_THREAD_PAGES (10) fails closed as incomplete, after exactly 10 fetches", async () => {
    let call = 0;
    const _ghRun = async () => {
      call += 1;
      return {
        ok: true,
        stdout: JSON.stringify({
          data: { repository: { pullRequest: { reviewThreads: { pageInfo: { hasNextPage: true, endCursor: `c${call}` }, nodes: [] } } } },
        }),
        stderr: "",
      };
    };
    const result = await observeReviewThreads(ref, { _ghRun });
    expect(result).toEqual({ ok: false, reason: "incomplete" });
    expect(call).toBe(10);
  });

  test("a page that fails to parse fails the whole observation closed, without further pages", async () => {
    let call = 0;
    const _ghRun = async () => {
      call += 1;
      return { ok: true, stdout: "not json", stderr: "" };
    };
    const result = await observeReviewThreads(ref, { _ghRun });
    expect(result.ok).toBe(false);
    expect(call).toBe(1);
  });

  test("reviewDecision never appears in the issued command (REQ AC-1.2)", async () => {
    const { calls, _ghRun } = fakeGhRun(passingGh());
    await observeReviewThreads(ref, { _ghRun });
    for (const c of calls) {
      expect(c).not.toMatch(/reviewDecision/);
    }
  });
});

// ─── (b) observeRepoCaps — O4 (TSPEC §4.5) ─────────────────────────────────

describe("observeRepoCaps", () => {
  test("issues exactly mergeCommandFor's repoCaps command, no PR URL involved", async () => {
    const { calls, _ghRun } = fakeGhRun(passingGh());
    await observeRepoCaps({ _ghRun });
    expect(calls).toEqual([mergeCommandFor("repoCaps", {})]);
  });

  test("a passing reply classifies through", async () => {
    const { _ghRun } = fakeGhRun(passingGh());
    const result = await observeRepoCaps({ _ghRun });
    expect(result.ok).toBe(true);
    expect(result.defaultBranch).toBe("main");
  });

  test("garbage stdout fails closed, never guessing a branch name (AC-2.5a)", async () => {
    const { _ghRun } = fakeGhRun(passingGh({ repoCaps: { stdout: "not json" } }));
    const result = await observeRepoCaps({ _ghRun });
    expect(result.ok).toBe(false);
  });

  test("a transport failure fails closed with command-failed", async () => {
    const { _ghRun } = fakeGhRun({});
    expect(await observeRepoCaps({ _ghRun })).toEqual({ ok: false, reason: "command-failed" });
  });
});

// ─── (b) observeChangedFiles — O5, the completeness rule (TSPEC §4.6) ────

describe("observeChangedFiles", () => {
  const prUrl = "https://github.com/o/r/pull/42";
  const ref = { owner: "o", repo: "r", number: 42 };

  test("a short well-formed step-1 list is complete: only ONE command issued, no fallback", async () => {
    const { calls, _ghRun } = fakeGhRun(
      passingGh({ changedFiles: { stdout: JSON.stringify({ files: [{ path: "a.js" }, { path: "b.js" }] }) } }),
    );
    const result = await observeChangedFiles(prUrl, ref, { _ghRun });
    expect(result).toEqual({ ok: true, files: ["a.js", "b.js"] });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe(mergeCommandFor("changedFiles", { prUrl }));
  });

  test("an empty step-1 list is a VALID observation, and still only one command", async () => {
    const { calls, _ghRun } = fakeGhRun(passingGh({ changedFiles: { stdout: JSON.stringify({ files: [] }) } }));
    const result = await observeChangedFiles(prUrl, ref, { _ghRun });
    expect(result).toEqual({ ok: true, files: [] });
    expect(calls).toHaveLength(1);
  });

  test("a full-page step-1 list triggers exactly the fallback command, second", async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ path: `f${i}.js` }));
    const fallbackPages = [[{ filename: "f0.js" }, { filename: "f1.js" }]];
    const { calls, _ghRun } = fakeGhRun(
      passingGh({
        changedFiles: { stdout: JSON.stringify({ files: fullPage }) },
      }),
    );
    // fakeGhRun's default "changedFilesFallback" fixture is not part of the
    // six passingGh surfaces (it is a secondary command mergeCommandFor also
    // builds) — supply it directly via a wrapping fake.
    const map = passingGh({ changedFiles: { stdout: JSON.stringify({ files: fullPage }) } });
    map["gh api --paginate --slurp"] = { ok: true, stdout: JSON.stringify(fallbackPages), stderr: "" };
    const { calls: calls2, _ghRun: ghRun2 } = fakeGhRun(map);
    const result = await observeChangedFiles(prUrl, ref, { _ghRun: ghRun2 });
    expect(result).toEqual({ ok: true, files: ["f0.js", "f1.js"] });
    expect(calls2).toEqual([
      mergeCommandFor("changedFiles", { prUrl }),
      mergeCommandFor("changedFilesFallback", { owner: ref.owner, repo: ref.repo, number: ref.number }),
    ]);
    expect(calls).toBeDefined(); // unused first fakeGhRun instance — kept out of the assertion path
  });

  test("a malformed entry in step 1 fails closed as unparseable — the fallback is NEVER attempted", async () => {
    const { calls, _ghRun } = fakeGhRun(
      passingGh({ changedFiles: { stdout: JSON.stringify({ files: [{ notPath: "x" }] }) } }),
    );
    const result = await observeChangedFiles(prUrl, ref, { _ghRun });
    expect(result).toEqual({ ok: false, reason: "unparseable" });
    expect(calls).toHaveLength(1);
  });

  test("a null ref reaching a needed fallback fails closed as incomplete, without attempting it (TE-v3 N-01)", async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ path: `f${i}.js` }));
    const { calls, _ghRun } = fakeGhRun(passingGh({ changedFiles: { stdout: JSON.stringify({ files: fullPage }) } }));
    const result = await observeChangedFiles(prUrl, null, { _ghRun });
    expect(result).toEqual({ ok: false, reason: "incomplete" });
    expect(calls).toHaveLength(1); // step 1 only — no fallback command was ever built
  });

  test("a fallback command that itself fails to run is incomplete", async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ path: `f${i}.js` }));
    const map = passingGh({ changedFiles: { stdout: JSON.stringify({ files: fullPage }) } });
    map["gh api --paginate --slurp"] = { ok: false, stdout: "", stderr: "rate limited" };
    const { _ghRun } = fakeGhRun(map);
    const result = await observeChangedFiles(prUrl, ref, { _ghRun });
    expect(result).toEqual({ ok: false, reason: "incomplete" });
  });

  test("a transport failure at step 1 alone (short-circuit no fallback available) is incomplete", async () => {
    const { calls, _ghRun } = fakeGhRun({});
    const result = await observeChangedFiles(prUrl, ref, { _ghRun });
    expect(result).toEqual({ ok: false, reason: "incomplete" });
    expect(calls).toHaveLength(2); // step 1 attempted, then the fallback attempted too — both failed closed
  });
});

// ─── (b) §3.3 re-observation counting — the reason-line wording (TSPEC §4.3)
//
// The retry LOOP itself lives in decideMerge/phaseMerge (A4/A7), never in
// observePrState — this block only pins the exact interpolated wording the
// loop's exhaustion produces, for mergeableRetries ∈ {0, 1, 3}, and proves
// observePrState is itself stateless (repeated calls are independent — the
// counting is the caller's, never the observation's).

describe("§3.3 re-observation counting (mergeableRetries ∈ {0, 1, 3})", () => {
  const baseRecord = () => ({
    prUrl: "https://github.com/o/r/pull/42",
    o1: { ok: true, state: "OPEN", mergeable: "UNKNOWN", mergeStateStatus: "CLEAN", number: 42, mergeCommitOid: null },
    o1Count: 1,
    ci: "passed",
    o3: { ok: true, unresolved: 0 },
    o4: null,
    o5: { ok: true, files: ["src/example.js"] },
    attempts: [],
  });
  const config = { ...MERGE_DEFAULTS, mergeMode: "on" };

  test.each([0, 1, 3])(
    "mergeableRetries=%i: o1Count still within bound demands another O1, o1Count beyond it resolves 'deferred' with the exact wording",
    (mergeableRetries) => {
      const cfg = { ...config, mergeableRetries };

      // Within bound: o1Count === 1 + mergeableRetries - 1 (i.e. still <= retries after the first observation)
      // when mergeableRetries > 0 there is room for at least one more demand.
      if (mergeableRetries > 0) {
        const stillWithin = decideMerge({ ...baseRecord(), o1Count: 1 }, cfg);
        expect(stillWithin).toEqual({ kind: "need", observation: "O1", waitMs: cfg.mergeableRetryDelay * 1000 });
      }

      // Exhausted: o1Count === 1 + mergeableRetries (one more than the accepted bound).
      const exhaustedCount = 1 + mergeableRetries;
      const exhausted = decideMerge({ ...baseRecord(), o1Count: exhaustedCount }, cfg);
      expect(exhausted.kind).toBe("resolved");
      expect(exhausted.mergeStatus).toBe("deferred");
      expect(exhausted.reason).toBe(`mergeability still UNKNOWN after ${exhaustedCount} observations`);
    },
  );

  test("mergeableRetries=0 produces the deliberately ungrammatical 'after 1 observations'", () => {
    const cfg = { ...config, mergeableRetries: 0 };
    const result = decideMerge({ ...baseRecord(), o1Count: 1 }, cfg);
    expect(result.reason).toBe("mergeability still UNKNOWN after 1 observations");
  });

  test("observePrState is stateless: repeated calls each independently reflect only their own reply", async () => {
    const prUrl = "https://github.com/o/r/pull/42";
    const replies = [
      JSON.stringify({ state: "OPEN", mergeable: "UNKNOWN", mergeStateStatus: "CLEAN", number: 42 }),
      JSON.stringify({ state: "OPEN", mergeable: "MERGEABLE", mergeStateStatus: "CLEAN", number: 42 }),
    ];
    let call = 0;
    const _ghRun = async () => {
      const stdout = replies[call];
      call += 1;
      return { ok: true, stdout, stderr: "" };
    };
    const first = await observePrState(prUrl, { _ghRun });
    const second = await observePrState(prUrl, { _ghRun });
    expect(first.mergeable).toBe("UNKNOWN");
    expect(second.mergeable).toBe("MERGEABLE");
    expect(call).toBe(2);
  });
});
