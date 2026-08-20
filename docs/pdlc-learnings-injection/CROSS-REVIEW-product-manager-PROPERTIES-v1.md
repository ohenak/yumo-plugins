# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 1

## Verification basis

Every claim below was re-measured against the repository at HEAD
(`e2ccaa8`, `feat-pdlc-learnings-injection`), not read off a document.

**The document's own measured premises all hold.** I checked each row of its §Overview premise
table and found none overstated:

| Premise the document asserts | What I measured |
|---|---|
| `dispatchAndVerify` sees both conjuncts | `async function dispatchAndVerify({` at `pdlc/workflows/orchestrate-dev.js:8862`, with `dispatchKind` branched at `:8886` |
| Three object-literal `dispatchKind: "authoring"` sites plus one positional | `grep -c 'dispatchKind: "authoring"'` returns **3** (`:12861`, `:12955`, `:13657`); the fourth is the positional `"authoring"` argument to `runWrapped(optimizer, optPrompt, doc, …)` at `:7663`. The document's phrasing is exactly right, and it is right for the reason it gives |
| `consolidate-learnings.js` keeps `LS_FILES_ARGV` private and exports `enumerateCorpus(_git)` | `const LS_FILES_ARGV = Object.freeze([…])` (unexported) and `export async function enumerateCorpus(_git)` in `pdlc/workflows/consolidate-learnings.js` |
| The corpus at HEAD is 9 documents | The predicate's own argv globs (`:(glob)docs/*/LEARNINGS-*.md`, `:(glob)docs/completed/*/LEARNINGS-*.md`) return exactly 9 paths; the two `docs/discarded/{p}/…` documents fall outside both globs, which is the measured basis PROP-CORPUS-03 relies on |
| All 9 open with `# LEARNINGS — {feature}` and carry a bare ISO `Date Completed` | confirmed document by document: first non-blank line is `# LEARNINGS — {feature}` in all 9, and `Date Completed` is a bare ISO value (`2026-06-02` … `2026-08-18`) in all 9. §O.6's "the annotated-cell branch is synthetic" is therefore an honest declaration, not a hedge |
| `WALK_SKIP_DIRS = new Set([".git", "node_modules"])` | `pdlc/workflows/lib/document-oracles.mjs`, `WALK_SKIP_DIRS` definition |
| `export const MERGE_CONFIG_PATH = ".claude/pdlc.config.json"` | `pdlc/workflows/orchestrate-dev.js:48` |
| `.baseline-worktree` is unignored today | `git check-ignore -v .baseline-worktree` exits **1** |
| No test file of this feature exists yet; no root `scripts/` | `ls pdlc/workflows/__tests__ \| grep -i learnings` is empty; `scripts/` does not exist |
| §F.4's seam doubles exist | `helpers/seams.js` exports `fakeFs` and `fakeGit`; `helpers/consolidationDoubles.js` re-exports both; `advisoryDisabled.test.js` imports `mainDev` from `../orchestrate-dev.js` |

**PLAN and test-file coverage.** All 23 tasks `LI-01 … LI-23` in PLAN §Batches appear in §C.3 with a
red or a green owner, and PLAN's §File-ownership manifest lists exactly **fourteen** new test rows
over fourteen files, matching §Overview's "fourteen new test files". Every test file named anywhere
in this document is either one of those fourteen planned-new rows or an existing file
(`consolidationPredicate.test.js`, `helpers/seams.js`, `helpers/consolidationDoubles.js`,
`advisoryDisabled.test.js`), each of which I confirmed on disk. **No property names a test file the
PLAN does not create.**

**REQ acceptance-criteria coverage.** REQ carries 25 acceptance criteria (`AC-1.1 … AC-6.2`). §C.2
lists all 25, and no AC is left with zero properties — though two of the rows do not hold up under
inspection (F-02, F-04 below).

## Findings

## Questions

## Positive Observations

## Recommendation

