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
} from "../orchestrate-dev.js";

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
