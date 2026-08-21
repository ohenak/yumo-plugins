// learningsPredicatePin.test.js — PLAN LI-13.
//
// LI-T-PIN-1 (TSPEC §I.1, §T.5): a three-way agreement assertion in one test. The argv
// `enumerateCorpus` (in `consolidate-learnings.js`) actually hands `_git` must equal both
// `orchestrate-dev.js`'s restated `LEARNINGS_CORPUS_ARGV` AND this file's own hand-transcribed
// literal (mirroring `consolidationPredicate.test.js`'s idiom, never imported from either
// production module — a transcription pinned against production, not copied from it).
//
// Uses `fakeGit` from `helpers/consolidationDoubles.js` (re-exported from `mergeDoubles.js`) —
// NOT `helpers/seams.js`'s fakeGit, which is a different shape: `seams.js`'s fakeGit *is* the
// seam function and records `git.invocations` as `{argv, result}`; `consolidationDoubles.js`'s
// hands the seam out as `git._git` and records bare argv arrays on `git.calls`. This is the one
// suite in the feature that uses the sibling's fakeGit, because its subject — `enumerateCorpus`
// — lives in the sibling module, `consolidate-learnings.js`, tested through that module's own
// established harness.

import { enumerateCorpus } from "../consolidate-learnings.js";
import { fakeGit } from "./helpers/consolidationDoubles.js";
import { LEARNINGS_CORPUS_ARGV } from "../orchestrate-dev.js";

// Hand-transcribed literal — this file's own copy, never imported from either production
// module. All three of this literal, `LEARNINGS_CORPUS_ARGV`, and the argv `enumerateCorpus`
// hands `_git` must agree.
const PINNED_ARGV = Object.freeze([
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "--",
  ":(glob)docs/*/LEARNINGS-*.md",
  ":(glob)docs/completed/*/LEARNINGS-*.md",
]);

test("LI-T-PIN-1: enumerateCorpus's argv, LEARNINGS_CORPUS_ARGV, and this file's literal are mutually equal", async () => {
  const git = fakeGit({ "ls-files": { ok: true, stdout: "" } });

  await enumerateCorpus(git._git);

  expect(git.calls).toHaveLength(1);
  expect(git.calls[0]).toEqual(PINNED_ARGV);
  expect(LEARNINGS_CORPUS_ARGV).toEqual(PINNED_ARGV);
  expect(git.calls[0]).toEqual(LEARNINGS_CORPUS_ARGV);
});
