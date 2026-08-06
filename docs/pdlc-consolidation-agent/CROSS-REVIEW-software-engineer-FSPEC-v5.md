# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v5.0)
**Date:** 2026-08-06
**Iteration:** 5
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `d0ee225` (the last FSPEC commit `CROSS-REVIEW-software-engineer-FSPEC-v4.md` reviewed); diff `d0ee225..HEAD` — 122 insertions, 33 deletions across 6 commits. Only the changed sections were re-read for new issues.

## Prior findings — disposition

Every v4 finding was re-checked against the revision and, where it made a claim about HEAD, against
the code. **All four are closed as filed.** As in each of the last three rounds, the repairs create
new checkable defects in the sections they rewrote; those are filed below on their own merits, not as
reopenings.

| v4 | Verdict | Evidence |
|---|---|---|
| F-01 (Medium) — §6.5's invoking-tree permitted set `{add, commit}` was red on a conforming pass that reads its branch name through the git seam | **Resolved, and on both git domains rather than the one I named.** §6.5's table grows a fifth column (the Given each domain's obliged conjunct is asserted on), both git rows admit `read-branch` / `read-status` as permitted-but-not-obliged, and a new paragraph states *why* they are permitted and why they are not obliged (AC-3.8b obliges the observation, not a seam — the same shape `fetch` has in the clone row). §5.4 carries the matching clause at `:682-686`, BR-28 and AT-Q7 move with it. I re-verified the precedent: `parseAbbrevRef` is `orchestrate-dev.js:3491-3496` exactly, `readHeadBranch` issues `_git(["rev-parse","--abbrev-ref","HEAD"])` at `:3524`, `gitWithLockRetry` is `:8617` and `commitPaths` `:8669` — all as cited but one (F-04 below) |
| F-02 (Medium) — the `suppressed-by:` grammar diverged from the REQ-owned vocabularies row with no erratum | **Resolved as filed.** ER-5 is routed in §14.4 with the exact argument, and the divergence is stated at all four sites that carry the grammar: §10.3's class table (`:1607` — "one exception is named rather than absorbed"), §10.3's field table (`:1625`), BR-26 and §15.2's lexicon row. I verified the upstream row at HEAD: `docs/_constraints/pdlc-consolidation-vocabularies.md:63` spells `` `{id}:{action} → PR URL` entries, or empty ``, and the change-control clause at `:25-27` is as quoted. ER-5's shipping assumption reuses ER-2's rather than inventing a third |
| F-03 (Medium) — §8.2's "one `target`" merge observable was undetermined across §5.2 kinds | **Resolved for the mixed-kind case, with the rule stated as a total order** (§8.2 `:1191-1224`), three checkable consequences, O-C8 recording the cost, §10.4 item 4 naming the elided kind, BR-33b, and AT-R6b gaining a third fixture. The kind axis is closed. The *subject* axis it depends on is not — filed as F-01 — and the new fixture's Given contradicts itself — filed as F-02 |
| F-04 (Low) — two off-by-one line citations | **Resolved, and verified.** `build-runtime.mjs:448` opens `const bundles = [`, its closing `];` is `:471`, and the `pdlc-cli.mjs` entry runs `:464-470` (opening brace `:464`, `file:` key `:465`). §14.1 T-02 and §15.3 now say exactly that |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
