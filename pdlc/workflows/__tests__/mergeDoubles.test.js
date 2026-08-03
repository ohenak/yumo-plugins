// ─── mergeDoubles.test.js ───────────────────────────────────────────────────
//
// PLAN §12 F1 (pdlc-merge-phase). Self-test for `__tests__/helpers/mergeDoubles.js`
// — lives outside `helpers/` because jest's `testPathIgnorePatterns` skips
// `/__tests__/helpers/` (and `/__tests__/fixtures/`) for collection; a
// self-test written inside either would never run.

import {
  fakeGhRun,
  passingGh,
  matchKey,
  GH_SURFACE_NAMES,
  fakeGit,
  fakeQueueFs,
  recordingRecordQueueRow,
  fakeSleep,
  fakeNow,
  FIXED_NOW_MS,
  PHASE_DISABLED,
  seeded,
  resolveSeed,
  MERGE_PROP_SEED,
} from "./helpers/mergeDoubles.js";
import { QUEUE_GOLDENS, QUEUE_SHAPES, FEATURE } from "./fixtures/queue-goldens/index.js";
import { updateQueueStatus, QUEUE_STATUSES } from "../orchestrate-queue.js";

describe("fakeGhRun / passingGh", () => {
  test("passingGh answers all six surfaces", () => {
    const map = passingGh();
    expect(GH_SURFACE_NAMES).toHaveLength(6);
    // Every surface's canonical key must be present and "ok".
    const { _ghRun } = fakeGhRun(map);
    return Promise.all(
      GH_SURFACE_NAMES.map(async (name) => {
        const canonicalCommand = {
          prState: "gh pr view https://github.com/o/r/pull/42 --json state,mergeable,mergeStateStatus,number,mergeCommit",
          ci: "gh pr view https://github.com/o/r/pull/42 --json statusCheckRollup",
          reviewThreads: "gh api graphql -f owner=o -f repo=r -F number=42 -f query='reviewThreads'",
          repoCaps:
            "gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge,defaultBranchRef",
          changedFiles: "gh pr view https://github.com/o/r/pull/42 --json files",
          merge: "gh pr merge https://github.com/o/r/pull/42 --merge",
        }[name];
        const reply = await _ghRun(canonicalCommand);
        expect(reply.ok).toBe(true);
      }),
    );
  });

  test("matchKey reduces varying arguments to the same shape", () => {
    expect(matchKey("gh pr merge 42 --squash")).toBe(matchKey("gh pr merge 7 --merge"));
    expect(matchKey("gh pr merge 42 --squash")).not.toBe(matchKey("gh pr view 42 --json state"));
    expect(matchKey(["gh", "auth", "status"])).toBe("gh auth status");
  });

  test("matchKey distinguishes every gh-pr-view-shaped surface by its --json field list", () => {
    expect(matchKey("gh pr view https://x/pull/1 --json state,mergeable,mergeStateStatus,number,mergeCommit")).toBe(
      "gh pr view --json state,mergeable,mergeStateStatus,number,mergeCommit",
    );
    expect(matchKey("gh pr view https://x/pull/1 --json statusCheckRollup")).toBe(
      "gh pr view --json statusCheckRollup",
    );
    expect(matchKey("gh pr view https://x/pull/1 --json files")).toBe("gh pr view --json files");
    expect(matchKey("gh pr view https://x/pull/1 --json mergeCommit,state")).toBe(
      "gh pr view --json mergeCommit,state",
    );
    // Four distinct keys, no collisions.
    const keys = new Set([
      matchKey("gh pr view https://x/pull/1 --json state,mergeable,mergeStateStatus,number,mergeCommit"),
      matchKey("gh pr view https://x/pull/1 --json statusCheckRollup"),
      matchKey("gh pr view https://x/pull/1 --json files"),
      matchKey("gh pr view https://x/pull/1 --json mergeCommit,state"),
    ]);
    expect(keys.size).toBe(4);
  });

  test("passingGh(overrides) drives exactly one surface, leaving the rest untouched", async () => {
    const map = passingGh({ merge: { ok: false, stdout: "", stderr: "not confirmed" } });
    const { _ghRun } = fakeGhRun(map);

    const mergeReply = await _ghRun("gh pr merge 42 --merge");
    expect(mergeReply.ok).toBe(false);
    expect(mergeReply.stderr).toBe("not confirmed");

    const ciReply = await _ghRun("gh pr view 42 --json statusCheckRollup");
    expect(ciReply.ok).toBe(true);
  });

  test("fakeGhRun fails closed for an unfixtured command, without throwing", async () => {
    const { _ghRun } = fakeGhRun({});
    const reply = await _ghRun("gh something unfixtured");
    expect(reply).toEqual({ ok: false, stdout: "", stderr: "no fixture for this command" });
  });

  test("fakeGhRun records every command in order", async () => {
    const { calls, _ghRun } = fakeGhRun(passingGh());
    await _ghRun("gh pr view 42 --json state");
    await _ghRun("gh pr merge 42 --merge");
    expect(calls).toEqual(["gh pr view 42 --json state", "gh pr merge 42 --merge"]);
  });

  test("a failing gh pr merge fixture supplies a real stderr string, verbatim", async () => {
    const map = passingGh({ merge: { ok: false, stdout: "", stderr: "GraphQL: Pull Request is not mergeable" } });
    const { _ghRun } = fakeGhRun(map);
    const reply = await _ghRun("gh pr merge 42 --merge");
    expect(reply.stderr).toBe("GraphQL: Pull Request is not mergeable");
  });

  test("passingGh rejects an unrecognised override name", () => {
    expect(() => passingGh({ notASurface: {} })).toThrow(/unrecognised surface override/);
  });
});

describe("fakeGit", () => {
  test("answers a scripted subcommand and records argv", async () => {
    const { calls, _git } = fakeGit({ rebase: { ok: false, stdout: "", stderr: "conflict" } });
    const reply = await _git(["rebase", "origin/main"]);
    expect(reply).toEqual({ ok: false, stdout: "", stderr: "conflict" });
    expect(calls).toEqual([["rebase", "origin/main"]]);
  });

  test("unscripted subcommands succeed trivially", async () => {
    const { _git } = fakeGit({});
    const reply = await _git(["fetch", "origin"]);
    expect(reply).toEqual({ ok: true, stdout: "", stderr: "" });
  });
});

describe("fakeQueueFs", () => {
  test("reads seeded content and records reads", async () => {
    const { _readFile, reads } = fakeQueueFs({ "docs/_queue/QUEUE.md": "hello" });
    const content = await _readFile("docs/_queue/QUEUE.md");
    expect(content).toBe("hello");
    expect(reads).toEqual(["docs/_queue/QUEUE.md"]);
  });

  test("throws ENOENT for a path never seeded", async () => {
    const { _readFile } = fakeQueueFs({});
    await expect(_readFile("nope.md")).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("writes update .files and record .writes in order", async () => {
    const { _writeFile, files, writes, _checkFile } = fakeQueueFs({});
    expect(await _checkFile("a.md")).toBe(false);
    await _writeFile("a.md", "one");
    await _writeFile("a.md", "two");
    expect(files["a.md"]).toBe("two");
    expect(writes).toEqual([
      { path: "a.md", contents: "one" },
      { path: "a.md", contents: "two" },
    ]);
    expect(await _checkFile("a.md")).toBe(true);
  });
});

describe("recordingRecordQueueRow", () => {
  test("captures feature/status/evidence and returns a fixed disposition", async () => {
    const { calls, _recordQueueRow } = recordingRecordQueueRow("recorded");
    const result = await _recordQueueRow("demo-feature", "done", "abc1234 #42");
    expect(result).toBe("recorded");
    expect(calls).toEqual([{ feature: "demo-feature", status: "done", evidence: "abc1234 #42" }]);
  });

  test("supports a scripted sequence of dispositions", async () => {
    const script = ["recorded", "queueRow:none", "queueRow:error"];
    const { _recordQueueRow } = recordingRecordQueueRow((i) => script[i]);
    expect(await _recordQueueRow("f", "done", null)).toBe("recorded");
    expect(await _recordQueueRow("f", "done", null)).toBe("queueRow:none");
    expect(await _recordQueueRow("f", "done", null)).toBe("queueRow:error");
  });
});

describe("the clock and the phase flag", () => {
  test("fakeSleep resolves immediately", async () => {
    await expect(fakeSleep()).resolves.toBeUndefined();
  });

  test("fakeNow is fixed, not wall-clock", () => {
    expect(fakeNow()).toBe(FIXED_NOW_MS);
    expect(fakeNow()).toBe(fakeNow());
  });

  test("PHASE_DISABLED is false", () => {
    expect(PHASE_DISABLED).toBe(false);
  });
});

describe("seeded generator reproducibility (PROPERTIES §1.2 rule 1)", () => {
  const ORIGINAL_ENV = process.env.PDLC_PROP_SEED;

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) delete process.env.PDLC_PROP_SEED;
    else process.env.PDLC_PROP_SEED = ORIGINAL_ENV;
  });

  test("seeded(MERGE_PROP_SEED) is reproducible", () => {
    const a = seeded(MERGE_PROP_SEED);
    const b = seeded(MERGE_PROP_SEED);
    const seqA = [a.int(0, 1000), a.int(0, 1000), a.int(0, 1000)];
    const seqB = [b.int(0, 1000), b.int(0, 1000), b.int(0, 1000)];
    expect(seqA).toEqual(seqB);
  });

  test("resolveSeed honours the literal when PDLC_PROP_SEED is unset", () => {
    delete process.env.PDLC_PROP_SEED;
    expect(resolveSeed(MERGE_PROP_SEED)).toBe(MERGE_PROP_SEED);
  });

  test("PDLC_PROP_SEED genuinely overrides the literal", () => {
    process.env.PDLC_PROP_SEED = "12345";
    const resolved = resolveSeed(MERGE_PROP_SEED);
    expect(resolved).toBe(12345);
    expect(resolved).not.toBe(MERGE_PROP_SEED);
  });

  test("a seeded-loop failure would carry the seed and the failing value, not only an index", () => {
    // Demonstrates the reporting shape every merge property must follow:
    // build the message a failing `expect` would carry, and assert it
    // names both the seed and the value (never only a loop index).
    const seed = resolveSeed(MERGE_PROP_SEED);
    const rng = seeded(seed);
    const value = rng.int(0, 1000);
    const failureMessage = `seed=${seed} value=${value}`;
    expect(failureMessage).toMatch(/seed=\d+/);
    expect(failureMessage).toMatch(/value=\d+/);
  });
});

describe("byte-identity goldens (TSPEC §13.5, PROPERTIES §5 PROP-M-12)", () => {
  const shapeNames = Object.keys(QUEUE_SHAPES);

  test("captures one golden per queue shape, and every QUEUE_STATUSES member", () => {
    expect(shapeNames).toEqual([
      "canonical5col",
      "alreadyMigrated",
      "paddedCells",
      "oneDataRow",
      "featureAbsent",
      "noTable",
    ]);
    for (const shapeName of shapeNames) {
      expect(Object.keys(QUEUE_GOLDENS[shapeName])).toEqual(QUEUE_STATUSES);
    }
  });

  test("each golden is byte-identical to calling updateQueueStatus at HEAD, right now", () => {
    for (const shapeName of shapeNames) {
      for (const status of QUEUE_STATUSES) {
        const live = updateQueueStatus(QUEUE_SHAPES[shapeName], FEATURE, status);
        expect(live).toEqual(QUEUE_GOLDENS[shapeName][status]);
      }
    }
  });

  test("each status's golden differs from the other statuses' goldens, for a matched shape", () => {
    const canonical = QUEUE_GOLDENS.canonical5col;
    for (const statusA of QUEUE_STATUSES) {
      for (const statusB of QUEUE_STATUSES) {
        if (statusA === statusB) continue;
        expect(canonical[statusA].markdown).not.toBe(canonical[statusB].markdown);
      }
    }
  });

  test("goldens captured empty cannot pass: every matched golden contains the target row", () => {
    for (const shapeName of ["canonical5col", "alreadyMigrated", "paddedCells", "oneDataRow"]) {
      for (const status of QUEUE_STATUSES) {
        const golden = QUEUE_GOLDENS[shapeName][status];
        expect(golden.matched).toBe(true);
        expect(golden.markdown).toEqual(expect.stringContaining(status));
        expect(golden.markdown).toEqual(expect.stringContaining(FEATURE));
      }
    }
  });

  test("the unmatched shapes (feature absent, no table) never claim a match", () => {
    for (const shapeName of ["featureAbsent", "noTable"]) {
      for (const status of QUEUE_STATUSES) {
        expect(QUEUE_GOLDENS[shapeName][status].matched).toBe(false);
        // Unmatched: input markdown is returned untouched.
        expect(QUEUE_GOLDENS[shapeName][status].markdown).toBe(QUEUE_SHAPES[shapeName]);
      }
    }
  });
});
