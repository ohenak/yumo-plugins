# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (header v1.8)
**Date:** 2026-08-19
**Iteration:** 7

**Scope:** Delta re-review against v6 (`REVIEWED-COMMIT: 2e262298`), decision freeze. Changed
sections only, plus verification of every changed claim against the repository at HEAD.

## Delta under review

`2e262298` is **not an ancestor of HEAD** — `git merge-base --is-ancestor 2e262298 HEAD` returns
false. The branch was rebased onto `origin/main` (`ddf6c2fe restore QUEUE.md and wave ledger to
origin/main versions after rebase`), so the v6 approval anchor points at a commit no longer on the
branch. The tree-to-tree diff `2e262298..HEAD` on the REQ is **4 insertions, 22 deletions**, and
every one of them is a *reversal of previously approved round-3 content*, not a forward edit:

| Site | v6-approved bytes | HEAD bytes |
|---|---|---|
| Header, Upstream (`:8`) | `docs/completed/pdlc-advisory-tier/REQ-…` | `docs/pdlc-advisory-tier/REQ-…` |
| §1, M-WG-6 row (`:99`) | corrected wording ("no phase-level skip") | pre-correction unconditional wording |
| §1 (`:141` ff.) | 12-line 2026-08-11 `iv-snapshot-store-postgres` incident | deleted |
| §5, C-2 (`:212`, `:214`) | default `1`, Q-1 decided, `2` superseded | default `2`, "a proposal, not confirmed" |
| §9, O-7 (`:529` ff.) | O-7 present, owner `pdlc-engineering-loop` | deleted |

The v1.8 and v1.7 changelogs still describe the round-3/round-4 state, and the four round-4 items I
confirmed in v6 (AC-1.5 population, per-attempt `seamBudgetMinutes`, AC-4.1 conjuncts, R-3 wording)
survive intact — I re-checked each and none regressed. So this is rebase content-loss, not an
authoring decision. Under the freeze rules the losses below block under criterion (ii): a
load-bearing claim in the document is false at HEAD or contradicts another site in the document.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | High | Local | **`advisory.waveBudgetPerRun`'s default reverted to `2`, contradicting three sites inside this REQ, the decisions record, and three approved downstream artifacts.** C-2 (`REQ:212`) now ships `2`, and its gloss (`:214`) calls it "a proposal, not a confirmed operator decision — Q-1". But R-3 (`:499`) says "`advisory.waveBudgetPerRun` (default 1) … (Q-1, decided)", §9's Q-1 row (`:545`) says "**No.** `advisory.waveBudgetPerRun` ships `1` (C-2, AC-2.4). Revisitable to `2` once wave resume …", and the v1.3 changelog (`:61`) records the `1` decision. Upstream, `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:36` reads "**Decision: default `1`**" and `:19` explicitly marks the `2` proposal superseded. Downstream, the implementable constant is pinned to `1` in TSPEC (`:523` `waveBudgetPerRun: 1`; `:1069` invalid values fall back to `1`), PLAN A6-05 (`:108` "`ADVISORY_DEFAULTS` gains `waveBudgetPerRun: 1`"), and PROPERTIES PROP-CFG-01/CTR-11. An implementer reading C-2 as the requirement authority ships the wrong constant into a set-equality-plus-value assertion. Repair: restore `1` and the superseded-proposal gloss. | §5 C-2 (`REQ:212`, `:214`) vs R-3 (`:499`), Q-1 (`:545`) |
| F-02 | High | Local | **O-7 deleted from §9 while three sites still cite it.** §9 now lists O-5, O-6, O-8 only (`REQ:529`–`:536`); no O-7. AC-1.2's prose (`:245`) says the build-breaking source-defect class is "permanently outside A6's reach — Q-2's decision, recorded as O-7", §9's Q-2 row (`:546`) says "recorded as O-7", and the v1.3 changelog (`:62`) says the class was "routed to O-7 (Q-2)". The accepted consequence of Q-2 therefore has no recorded home and no owner (`pdlc-engineering-loop`, queue row 6) at HEAD — the nonexistent-authority citation pattern this REQ has been bitten by before. Repair: restore O-7 verbatim. | §9 (`REQ:529`–`:536`), AC-1.2 (`:245`), Q-2 (`:546`) |
| F-03 | High | Local | **The Upstream row cites a path that does not exist at HEAD.** `REQ:11` cites `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`; `ls` shows no such directory. The tier REQ lives at `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (present). Every "the tier's existing X" claim in this REQ — closed refusal-reason set, envelope enumeration, seam/attempt semantics — traces through this row, so the traceability chain resolves to nothing, and the sibling cross-reviews that cite the tier already use the `docs/completed/` path. Repair: restore `docs/completed/`. | Header, Upstream (`REQ:11`) |
| F-04 | High | Local | **§1's M-WG-6 row now asserts verbatim the claim the paragraph two lines below it retracts.** The row (`REQ:99`) reads "a re-invocation re-enters at wave 1 and re-dispatches **every** wave, including those whose commits already landed"; the Correction directly beneath (`:102`–`:104`) says "The M-WG-6 row above *previously* claimed a re-invocation 're-enters at wave 1 and re-dispatches every wave, including those whose commits already landed.' The source no longer does this *unconditionally*". Verified at HEAD that the correction, not the row, is true: the interim wave ledger exists (`WAVE_STATE_PATH`, `orchestrate-dev.js:11322`; read/validate `:11372`–`:11412`; consume/skip `:14210`–`:14285`), so already-committed waves *can* be skipped. The uncorrected row also undercuts D-AWG-03b (`:585`), which defers wave resume precisely on the ground that the mechanism ships but its preconditions do not hold. Repair: restore the corrected row. | §1 (`REQ:99`, `:102`–`:104`), §10 D-AWG-03b (`:585`) |
| F-05 | Medium | Local | **The 2026-08-11 incident paragraph was deleted but two later sites still refer to "the 2026-08-11 incident" as though §1 introduced it.** §6 (`REQ:344`) reasons that "the 2026-08-11 incident, in a consumer repo, is unaffected" by the guard-path escalation, and §10's D-AWG-06 (`:588`) cites "observed 2026-08-11: `haltPhase: null`, reason only in the run-report JSON". Neither antecedent exists in the document any more: the incident is named nowhere else (`grep` for `iv-snapshot`/`regime-ledger` returns nothing). AC-2.2 class 2 `wave-internal-defect` (`:290`) also loses its only live instance. Not blocking on its own — no criterion changes truth value — but the two references are unresolvable prose. Repair: restore the paragraph with the rest of the round-3 bytes. | §1 (deleted), §6 (`REQ:344`), §10 D-AWG-06 (`:588`) |
| F-06 | Medium | Local | **§1's Correction cites line anchors that are ~2 000 lines off at HEAD.** The paragraph cites the ledger at `orchestrate-dev.js:9976` ff. and resume logic at `:12191`–`:12280`, the ledger write inside `if (scriptGate)` at `:12345`–`:12429`, and the `_runCommand` seam at `:12128`. At HEAD those lines hold DOD_STATUS parsing (`:9976`), an unrelated comment (`:12191`, `:12345`), and a blank line (`:12128`). The real sites are `WAVE_STATE_PATH` `:11322`, consume/skip `:14210`–`:14285`, `if (scriptGate)` `:14364`. I re-verified the paragraph's *substance* at HEAD and all four preconditions hold — script-gate-only write (`:14364`), feature/`planHash` mismatch ignore (`:14255`–`:14258`), `headCorroborated` ancestor check (`:14260`), green-and-committed ordering — so only the anchors are wrong, not the conclusion. Inherited, not delta. | §1 Correction (`REQ:106`–`:119`) |
| F-07 | Medium | Local | **Carried from v6 F-26, unresolved.** NFR-4's rationale (`REQ:492`) still says the gate runs "between attempts, never inside one". At HEAD `verifyGate` is invoked at `orchestrate-dev.js:3549`–`:3550`, inside the same `while (true)` iteration that opens the attempt, so the gate runs *inside* an attempt. The requirement's conclusion (no subtraction, no carve-out) is unaffected — the gate is outside the *measured* window, which `Promise.race` (`:3421`) closes at verdict — only the naming clause is wrong. One-clause repair. | §7 NFR-4 (`REQ:488`–`:494`) |
| F-08 | Medium | Process | **A tier-1 approval anchor survived a rebase that reverted the approved bytes.** v6's `APPROVAL-HASH`/`REVIEWED-COMMIT: 2e262298` records approval of a tree that is no longer reachable from HEAD, and nothing in the pipeline signalled that an approved erratum round had been undone. Any phase trusting the anchor is trusting bytes that no longer exist. Worth harvesting: an anchor-commit reachability check at phase entry makes this class detectable without a reviewer re-diffing by hand. | v6 anchors, this round's delta |

DEFERRED: Q-06 from v6 (whether AC-4.1(iii)'s mutation fixture should target an injected gate seam rather than a source edit) stays open for TSPEC; no decision taken here.

## Questions

| ID | Question |
|----|----------|
| Q-07 | Is the restore best done as a `git checkout 2e262298 -- <REQ path>` of the five reverted sites, or by re-applying the round-3 edits by hand? The former reproduces the approved bytes exactly and lets the v6 approval hash be recomputed meaningfully; the latter risks a second partial landing. Not a REQ question — recording it for whoever performs the repair. |
| Q-08 | Did the same rebase revert content in the sibling artifacts (FSPEC, TSPEC, PLAN, PROPERTIES, DECISIONS)? I verified only that TSPEC/PLAN/PROPERTIES still pin `waveBudgetPerRun: 1`, i.e. that they were *not* reverted at that site. A branch-wide check against the other phases' approval anchors is cheap and worth doing before the next phase trusts any of them. |

## Positive Observations

- Nothing that was authored forward in round 4 regressed. AC-1.5's population wording, the
  per-attempt `seamBudgetMinutes` correction across §5/AC-2.4/NFR-4, AC-4.1's three conjuncts and
  R-3's *run* vocabulary are byte-intact at HEAD; I re-diffed each against the v6 evidence.
- The document's redundancy is what caught the loss. Because C-2, R-3, §9's Q-1 row and the v1.3
  changelog each independently state the budget default, a silent revert at one site became a
  visible contradiction rather than a quiet wrong constant — the same holds for O-7 and for the
  M-WG-6 correction. That redundancy is worth keeping.
- The four reverted sites are all restorable from a commit that still exists in the reflog, so the
  repair is mechanical and carries no new decision — the freeze is not an obstacle here.

## Recommendation

**Needs revision**

Four High findings, all of the same cause: the rebase dropped previously approved round-3 bytes
while leaving every reference to them in place. No new decision is required to resolve any of them —
restore the five reverted sites (`REQ:11` Upstream path, `:99` M-WG-6 row, §1's 2026-08-11 incident
paragraph, `:212`/`:214` budget default, §9's O-7) to their v6-approved wording, then re-anchor.
F-05–F-08 are recorded, non-gating, and F-06/F-07 can ride along in the same edit.

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 4, "low": 0}
