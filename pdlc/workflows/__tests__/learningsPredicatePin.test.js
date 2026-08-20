// learningsPredicatePin.test.js — PLAN LI-13 (RED, greened by LI-15).
//
// TSPEC §I.1/§I.3's T-PIN-1: a three-way cross-module agreement assertion. `enumerateCorpus`
// (`consolidate-learnings.js`) hands `_git` a literal argv (`LS_FILES_ARGV`, module-private, never
// exported — only ever *handed* to `_git`); `LEARNINGS_CORPUS_ARGV` is `orchestrate-dev.js`'s
// restatement of that same argv (TSPEC :424, "restated here because the engine vendors only
// orchestrate-dev.js"); and `consolidationPredicate.test.js` keeps its own local transcription
// (`LS_FILES_ARGV`, `:23-31`). Two-way agreement would let `consolidate-learnings.js` and its own
// test drift together while this feature's constant stayed correct-but-stale, so all three are
// asserted mutually equal in one test (TSPEC §I.3).
//
// Uses `fakeGit` from `helpers/consolidationDoubles.js` (re-exported from `mergeDoubles.js`) — NOT
// `helpers/seams.js`'s. The two are a different shape: this one is `{ calls, _git }` where `_git` is
// handed directly to the subject and every argv is recorded on `.calls`; `seams.js`'s is the seam
// function itself, recording to `.invocations`. This is the one suite in the feature that drives
// `consolidate-learnings.js`'s own call rather than an `orchestrate-dev.js` seam, per TSPEC §I.3
// ("Which `fakeGit`, and how many transcriptions").
//
// `LEARNINGS_CORPUS_ARGV` does not exist in `orchestrate-dev.js` until LI-15 ("GREEN the constants
// and the config reader") defines it, so the assertion block below is committed `.skip`ped, titled
// with LI-15's id, per the wave gate's full-suite-green rule. LI-15's first action is to remove
// exactly this `.skip` wrapper, observe the red, then implement until green — never delete this
// block or add a new one beside it.
//
// The `orchestrate-dev.js` import is deferred to a dynamic `await import` inside the test body
// (rather than a top-level import) so this file still loads cleanly today, with
// `LEARNINGS_CORPUS_ARGV` absent from that module's exports.

import { enumerateCorpus } from "../consolidate-learnings.js";
import { fakeGit } from "./helpers/consolidationDoubles.js";

// The same literal `consolidationPredicate.test.js` transcribes at `:23-31` — the third leg of
// T-PIN-1's three-way agreement (TSPEC §I.3).
const LS_FILES_ARGV = [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "--",
  ":(glob)docs/*/LEARNINGS-*.md",
  ":(glob)docs/completed/*/LEARNINGS-*.md",
];

describe("LI-T-PIN-1 — cross-module predicate pin (TSPEC §I.1, §T.5)", () => {
  test.skip("LI-15: enumerateCorpus's observed argv, LEARNINGS_CORPUS_ARGV, and consolidationPredicate.test.js's literal are mutually equal", async () => {
    const { LEARNINGS_CORPUS_ARGV } = await import("../orchestrate-dev.js");

    const git = fakeGit({ "ls-files": { ok: true, stdout: "" } });
    await enumerateCorpus(git._git);
    const observedArgv = git.calls[0];

    expect(observedArgv).toEqual(LEARNINGS_CORPUS_ARGV);
    expect(LEARNINGS_CORPUS_ARGV).toEqual(LS_FILES_ARGV);
    expect(observedArgv).toEqual(LS_FILES_ARGV);
  });
});
