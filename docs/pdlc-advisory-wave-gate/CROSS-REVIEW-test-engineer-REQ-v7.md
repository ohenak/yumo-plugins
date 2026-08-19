# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (header still says v1.8)
**Date:** 2026-08-19
**Iteration:** 7
**Scope:** Delta re-review against my v6 (`REVIEWED-COMMIT: 2e262298`). Changed sections only, plus the sites those changes are cited from.

## Delta under review

`2e262298` is **not an ancestor of HEAD** (`git merge-base --is-ancestor 2e2622980 HEAD` → false). The branch was rebased (`ddf6c2fe chore(rebase): restore QUEUE.md and wave ledger to origin/main versions after rebase`), and the tree-to-tree diff `2e262298..HEAD` on this REQ is **4 insertions, 22 deletions** — all of them *removals or reversals* of previously approved round-3 content, none of them a forward edit:

| Site | v6-approved bytes | HEAD bytes |
|---|---|---|
| Header, Upstream row (`:8`) | `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` | `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` |
| §1 M-WG-6 row (`:99`) | corrected wording (ledger caveat) | reverted to the pre-correction claim |
| §1 corroborating incident | 12-line 2026-08-11 `iv-snapshot-store-postgres` paragraph | deleted |
| §5 C-2 (`:212`, `:214`) | default `1`, "operator decision recorded under Q-1; the earlier proposal of `2` is superseded" | default `2`, "a proposal, not a confirmed operator decision" |
| §8 obligations (`:526`–`:536`) | O-7 present, owner `pdlc-engineering-loop` | O-7 deleted |

The v1.8 and v1.7 changelog paragraphs (`:20`–`:67`) were **not** reverted, so the document's own changelog now records decisions that the body contradicts. Nothing in the delta is a fix; the round-4 items I confirmed in v6 (AC-1.5 population, per-attempt `seamBudgetMinutes`, AC-4.1 conjuncts, R-3 wording) all survive intact — I re-checked each and none regressed.

This is a rebase-loss defect, not an authoring decision. Every finding below is `delta`-introduced by that loss and is blocking under criterion (ii): a load-bearing claim in the document is false at HEAD, or contradicts another site in the same document.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **`advisory.waveBudgetPerRun`'s default contradicts itself three ways inside this document, and contradicts every approved downstream artifact.** §5 C-2 (`REQ:212`) now ships `2` and the gloss (`:214`) calls it "a proposal, not a confirmed operator decision — Q-1", but R-3 (`:499`) says "`advisory.waveBudgetPerRun` (default 1) bounds it at one resolved wave per run (Q-1, decided)" and §9 Q-1 (`:545`) says "**No.** `advisory.waveBudgetPerRun` ships at `1` (C-2, AC-2.4). Revisitable at `2`…". The v1.3 changelog (`:61`) also still records the `1` decision. Downstream, all three approved documents pin `1`: TSPEC `:523` (`waveBudgetPerRun: 1`), `:1069` (default `1`, invalid values "fall back to `1`"), PROPERTIES PROP-CFG-01 (`:163`, "must read back its default `1`"), PROP-CFG-02, PROP-CFG-03, PROP-CTR-11, and PLAN A6-05 (`:108`, "`ADVISORY_DEFAULTS` literal gains `waveBudgetPerRun: 1`"). This is a directly testable constant — PROP-CFG-01 is a set-equality-plus-value oracle over `ADVISORY_DEFAULTS`, so an implementer reading the REQ's C-2 table writes `2` and reddens an approved property. Repair: restore C-2's `1` and the superseded-proposal gloss. | §5 C-2 (`REQ:212`, `:214`) vs R-3 (`:499`), Q-1 (`:545`) |
| F-02 | High | Local | **O-7 is cited three times but no longer exists.** §8's obligations list runs O-5, O-6, O-8 (`REQ:526`–`:536`) — O-7 was deleted. AC-1.2 (`:245`) still ends "is Q-2's decision, recorded as O-7", Q-2 (`:546`) still ends "recorded as O-7", and the v1.3 changelog (`:62`) still says the post-wave defect class was "routed to O-7". The deleted text was the only place carrying the obligation's owner (`pdlc-engineering-loop`, queue row 6) and its scope constraint ("must not be modelled as a widened A6"). As it stands, AC-1.2's accepted consequence has no recorded home, which is exactly the nonexistent-authority citation pattern this REQ has been bitten by before. Repair: restore O-7 verbatim. | §8 (`REQ:526`–`:536`), AC-1.2 (`:245`), Q-2 (`:546`) |
| F-03 | High | Local | **The Upstream citation points at a path that does not exist at HEAD.** The header (`REQ:8`) now cites `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`; that file is absent — the tier REQ lives at `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (present, 27382 bytes). Every "the tier's existing X" claim in this REQ traces through that row, so the traceability chain resolves to nothing. Repair: restore the `docs/completed/` path. | Header, Upstream row (`REQ:8`) |
| F-04 | High | Local | **§1's "Correction, 2026-08-13" paragraph now corrects a claim identical to the one the table makes.** M-WG-6's row (`REQ:99`) reads "a re-invocation re-enters at wave 1 and re-dispatches **every** wave, including those whose commits already landed"; the paragraph immediately below (`:102`–`:104`) says "The M-WG-6 row above previously claimed a re-invocation 're-enters at wave 1 and re-dispatches every wave, including those whose commits already landed.' The source no longer does that *unconditionally*". The row and its own correction are byte-for-byte the same claim, so the document asserts and retracts one fact on adjacent lines. The corrected wording is load-bearing for D-AWG-03b (`:585`), which defers wave resume on the grounds that the ledger *exists* but its preconditions do not hold. Repair: restore the corrected M-WG-6 row. | §1 (`REQ:99`, `:102`–`:104`) |
| F-05 | Medium | Local | **The 2026-08-11 corroborating incident was deleted but is still referenced twice.** §6 (`REQ:344`) says "the 2026-08-11 incident, in a consumer repo, is unaffected" and D-AWG-06 (`:588`) says "observed 2026-08-11: `haltPhase: null`, reason only in the run-report JSON" — the paragraph that introduced the incident, named the repo (`regime-ledger`), the task (T07), the collection-time `ImportError`, and its status as the first live instance of AC-2.2's `wave-internal-defect` class is gone. AC-2.2's second root-cause class loses its only worked example, which is the fixture a TSPEC author would have transcribed. Not blocking on its own (the class is still specified), but restore it with the rest of the round-3 bytes. | §1 (deleted), §6 (`REQ:344`), §10 D-AWG-06 (`:588`) |
| F-06 | Medium | Process | **The approval record no longer describes the bytes at HEAD.** v6's `REVIEWED-COMMIT: 2e262298` and both approval hashes were computed on a commit that is not reachable from HEAD; the rebase silently reverted an approved erratum round without any signal to the pipeline. Any phase that trusts the tier-1 anchors here is trusting a tree that no longer exists. Worth harvesting: a rebase that drops previously approved artifact bytes should be detectable (anchor commit reachability check) rather than found by a reviewer re-diffing. | Approval anchors, v6 trailer |
| F-07 | Medium | Local | **Carried forward, unresolved (v6 F-01).** AC-4.1 conjunct (ii) "applies, re-gate red ⇒ the wave halts" still collides with AC-2.4/AC-4.4's attempt loop, which retries while `advisory.attemptBudget` (default `3`) remains; fixture (ii) stays ambiguous until the criterion names the budget-exhausted case. Unchanged by the delta, restated only so the count is honest; non-gating. | §6 AC-4.1 (`REQ:390`–`:391`), AC-2.4, AC-4.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is the intended repair a straight restore of the round-3 bytes (`fe2d7426`'s content for these five sites), or was any part of the reversal deliberate? If deliberate for C-2, it reopens a frozen decision and contradicts three approved downstream documents — that would need its own round, not an erratum. |

## Positive Observations

- Everything I confirmed in v6 survived the rebase intact: AC-1.5's population still reads "evaluates wave mode" with the no-manifest legacy path inside it, `seamBudgetMinutes` is still per attempt in NFR-4, §5 C-2 and AC-2.4 with the `attemptBudget` × worst case named, AC-4.1's three conjuncts still separate *applies* from *resolves* with the mutation fixture called out, and R-3 still says *run* where it means run. The damage is confined to round-3 content.
- The document's changelog paragraphs are what made this diagnosable in minutes: because `:61`–`:62` still record the Q-1 and Q-2 decisions in their own words, the reverted body sites contradict a written record instead of quietly reading as the current intent. Changelogs that name what was decided pay for themselves exactly here.
- Downstream TSPEC/PROPERTIES/PLAN are consistent with the *pre-revert* REQ, not with HEAD, so no downstream rework is implied by the fix — restoring the five sites re-aligns the chain with no other edits.

## Recommendation

**Needs revision** — four High findings, all introduced by the delta, all repairable by restoring the round-3 bytes at five sites (`:8`, `:99`, §1's incident paragraph, `:212`/`:214`, §8's O-7). No new decision is required and no downstream document changes. F-05, F-06 and F-07 are recorded, not gating.

DEFERRED: AC-4.1 conjunct (ii) budget-exhaustion wording (v6 F-01 / F-07 here) — fold into the same revision if convenient, otherwise let TSPEC pin the fixture.

FINDING: High | delta | local | §5 C-2 (`REQ:212`, `:214`) | `waveBudgetPerRun` default reverted to `2` and re-labelled a proposal, contradicting R-3 (`:499`), Q-1 (`:545`) and the pinned `1` in approved TSPEC/PROPERTIES/PLAN.
FINDING: High | delta | local | §8 obligations (`REQ:526`–`:536`) | O-7 deleted while AC-1.2 (`:245`), Q-2 (`:546`) and the v1.3 changelog (`:62`) still cite it.
FINDING: High | delta | local | Header Upstream row (`REQ:8`) | Upstream path rewritten to `docs/pdlc-advisory-tier/…`, which does not exist at HEAD; the tier REQ is under `docs/completed/`.
FINDING: High | delta | local | §1 M-WG-6 (`REQ:99`, `:102`) | Row reverted to the pre-correction claim, so the "Correction, 2026-08-13" paragraph now retracts the exact text the row asserts.
FINDING: Medium | delta | local | §1 corroborating incident | 2026-08-11 `iv-snapshot-store-postgres` paragraph deleted while §6 (`:344`) and D-AWG-06 (`:588`) still reference it.
FINDING: Medium | delta | nonlocal | Approval anchors | v6's `REVIEWED-COMMIT` is unreachable from HEAD; a rebase reverted approved bytes with no pipeline signal.

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 3, "low": 0}
