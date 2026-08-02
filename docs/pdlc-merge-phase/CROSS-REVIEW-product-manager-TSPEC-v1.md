# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-merge-phase/TSPEC-pdlc-merge-phase.md` (v1.0)
**Date:** 2026-08-02
**Iteration:** 1
**Scope:** Product-lens review of TSPEC v1.0 against REQ v1.1 and FSPEC v1.2 — behavioural fidelity, traceability, safety-property preservation, operator experience, and the declared size overrun. Technical design quality, test mechanics and code structure are out of this lens.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **Two of FSPEC §11's rows are unreachable and two are double-claimed.** `MergeOutcome.row` is defined (§2.4) as "the §11 row that resolved — reported, and asserted by tests", and §13.3 builds one `it.each` case per §11 row. But §5.3's table mixes §2.2 row numbers into that field: `!record.prUrl` resolves to **"row 3"** (FSPEC §11 row 3 is *PR already MERGED*; no-`prUrl` is §11 **row 6**), and `!record.o1.ok` resolves to **"row 4"** (FSPEC §11 row 4 is *guard fired — path matched*, which **escalates**; unparseable PR state is §11 **row 8**, which deliberately does **not** escalate). §12 E8 repeats the second mislabel. As written, §11 rows 6 and 8 can never be produced, and rows 3 and 4 are each produced by two conditions with different `mergeStatus`/escalation expectations — the row-table suite would be self-contradictory. FSPEC §11's closing paragraph makes row 8's distinctness from rows 4–5 an explicit operator signal. Fix: state once in §2.4 that `row` is always a §11 row number, then correct §5.3 (`row 6`, `row 8`) and §12 E8. | FSPEC §11 rows 3/4/6/8; AC-6.1a |
| F-02 | High | Local | **FSPEC §8.2's mandatory operator report line is absent from the TSPEC.** FSPEC §8.2 requires, once per merged run, the notice `Local {defaultBranch} is ahead of its remote by the queue-row commit for {feature}; pdlc does not push it — it reaches the remote with the next feature's PR.` It is the only place the operator learns that M4/M5 committed to a local branch pdlc will never push. The string, and any note carrying it, appear nowhere in the TSPEC: §7.1's post-merge sequence emits only the M2 note and the M3 escalation, §10.2 enumerates escalations + notes + the §9.4 deferred note, §12's E-table has no row, and §13 asserts nothing about it. This is a silently dropped, operator-visible behaviour on the feature's happy path. Fix: name it in §7.1/§10.2 as a plain note (not an escalation) emitted on every `merged` resolution including §11 row 3, and add an assertion to `mergePhase`. | AC-5.7; FSPEC §8.2 |
| F-03 | High | Local | **An operator-facing configuration key is renamed without authority.** REQ §7 and FSPEC §10.1 name the setting `mergeableRetryDelay`; the TSPEC calls it `mergeableRetryDelaySeconds` in `MERGE_DEFAULTS` (§2.2), the §3.1 validator table, §4.3 and §15.1. Config keys in `.claude/pdlc.config.json` are the consuming repo's contract, and §10.3's per-key fallback is silent — so an operator who follows the REQ/FSPEC gets the 10 s default with no warning and no way to tell. Renaming a documented setting is a product decision. Fix: adopt `mergeableRetryDelay` as specified, or route the rename back to the FSPEC/REQ before it ships. | AC-7.1/AC-7.3; FSPEC §10.1 |
| F-04 | Medium | Local | **The `mergeMethod` reported domain is widened beyond the FSPEC's enumeration.** FSPEC §9.1 fixes `mergeMethod` to `rebase` \| `merge` \| `unknown` \| `null`; §2.4 and §5.1 add `"squash"`. The widening is coherent with FSPEC §6.1's opt-in `allowSquashMerge`, so this is very likely an FSPEC omission rather than a TSPEC error — but `mergeMethod` is a reported field consumers may switch on, and this document is where the divergence would ship unreviewed. Fix: state the added member explicitly in §10.1 with a one-line pointer that it is reachable only under `allowSquashMerge: true`, and raise the FSPEC §9.1 erratum. | FSPEC §9.1, §6.1 |
| F-05 | Low | Local | **§5.5's row-5 `O4` observation leaves an FSPEC sentence false.** Observing `O4` for the default-branch name on the already-merged path is well-argued, minimal, and the right resolution of the SE-v3/TE-v3 rider — the terminal value, the zero-merge and no-guard guarantees all hold. But FSPEC §2.2 row 5's "Nothing later runs, including … remaining preconditions" and §2.5's wording now over-state the contract, and a future reader will read the FSPEC, not this TSPEC's §5.5. Fix: request a one-line FSPEC erratum ("row 5 takes `O4` as an observation, never as a precondition"), so the two documents agree in writing. | FSPEC §2.2 r5, §2.5; NFR-5 |
| F-06 | Low | Local | **§14 rolls several acceptance criteria up into parent rows.** Every criterion I traced is covered *somewhere* (§13.2/§13.3/§12), so this is not a coverage gap — but §14 has no explicit row for AC-6.1a (the §11 condition table, which §13.2 treats as the primary suite), AC-3.3/AC-3.7 (additive guard set and the `.claude/workflows/` default), AC-4.2/AC-4.3, AC-5.4, AC-2.3, AC-6.2a, or the §11 rows 19–22 composable annotations. Fix: add those seven rows; they cost ~7 lines and make the table usable as the DoD checklist it will be read as. | AC-6.1a, AC-3.3, AC-3.7, AC-4.2, AC-4.3, AC-5.4, AC-2.3, AC-6.2a |
| F-07 | Low | Process | **Size overrun is mostly justified, but ~200 lines are duplication rather than obligation.** Judging content rather than the number: eight named FSPEC obligations, a 23-row condition table, four changed files and a seam migration genuinely cannot be specified in 700 lines, and I would not cut §4, §5, §7.4, §8 or §11 — each carries contract a PLAN author needs. Three sections do restate material already fixed elsewhere: §15.1's obligation table duplicates §1's obligation index almost row-for-row (keep one); §12's E8–E20 and E26–E29 restate §5.3 and §11 rows without adding a decision (keep only the rows §11 does *not* express — E1–E7, E21–E25, E30–E31); §15.3's feasibility prose adds nothing to §15.2. That is roughly 180–220 lines with no obligation lost. | REQ size budget (process) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On the §11 row-3 (already-merged) recovery path, is the F-02 "local default is ahead of its remote" note intended to be emitted? FSPEC §8.2 says "once per merged run", which reads as including row 3, but row 3's M4 may be a no-op re-write producing no commit — in which case the sentence would be false. Please pin the answer in §7.1 rather than leaving it to the implementer. |
| Q-02 | §9.1 has the driver write `done` with no evidence, relying on Phase MERGE's M4 having already written the `Evidence` cell. On the §11 row-18 exception path (row in `pending`/`blocked`/`halted`, file unchanged), M4 wrote nothing — does the driver's subsequent unconditional `done` write then overwrite the status the FSPEC §2.5 rule deliberately preserved? |

## Positive Observations

- §5.1's demand-driven core is the right shape for the *product* contract, not just the code: it makes FSPEC §2.3's short-circuit ("an observation that is never demanded is never taken") structural rather than a discipline someone must remember, and §13.3's "rows 1–2 assert no observation function was called at all" is exactly the assertion that proves it.
- Every safety property I checked is preserved intact and argued in place: no guard override (§6.3, including the source scan so a future override reds a test), squash absent from the array rather than skipped at attempt time (§5.6), `gated`/`on` both running the full precondition chain with no bypass (§5.3), and fail-closed parsing as one shared shape across all six surfaces (§2.4, §4.1).
- §6.4's mutant analysis for AC-3.5 is written so a reviewer can *check* the falsifiability claim instead of trusting it, and the three near-miss lists reproducing arm A exactly is the assertion that kills a substring or case-insensitive implementation.
- §10.3's "never `❌`" and §5.2's outer `try/catch` together give AC-1.3 two independent structural defences, and §10.3 names the reason (`main()` derives the halting phase from the glyph) that is invisible from the FSPEC.
- §15.4's `DECISIONS_WARRANTED: no` is correctly reasoned: the load-bearing product alternatives were all pinned in the FSPEC, and the four engineering decisions state their rejected alternative in place.
- §15.2's honest naming of the permanent `refused` in this repo, and of the git ≥ 2.26 assumption as something to *measure* rather than assume, is exactly the disclosure that keeps the first operator from filing it as a defect.

## Recommendation

**Needs revision**

Must change before approval:

1. **F-01** — declare `row` as always a §11 row number; correct §5.3 (`row 6` for no-`prUrl`, `row 8` for unparseable `O1.state`) and §12 E8.
2. **F-02** — specify FSPEC §8.2's "local default branch is ahead of its remote" note in §7.1/§10.2, with an assertion in §13.2.
3. **F-03** — restore `mergeableRetryDelay`, or route the rename back to the REQ/FSPEC.
4. **F-04** — record the `squash` member of `mergeMethod` in §10.1 and raise the FSPEC §9.1 erratum.

F-05 through F-07 are advisory and need not gate approval; F-07 in particular is a trim, not a rewrite — no obligation-bearing content should be cut.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 1, "low": 3}
