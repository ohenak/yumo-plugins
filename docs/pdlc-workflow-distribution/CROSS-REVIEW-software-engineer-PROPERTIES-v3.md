# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/PROPERTIES-pdlc-workflow-distribution.md` (v2.1, Draft)
**Date:** 2026-07-28
**Iteration:** 3

**Scope: narrow verification, not a re-review.** This iteration verifies exclusively the
disposition of the 8 Lows in `CROSS-REVIEW-software-engineer-PROPERTIES-v2.md` against the v2.1 diff
(`git diff 535671c..fe22176`). v2.0 was already approved with minor changes; unchanged sections are
not re-litigated, and no new fronts are opened outside the v2.1 diff.

## Verification performed this round

| Check | Result |
|---|---|
| Diff scope | `git diff 535671c..fe22176 -- .../PROPERTIES-pdlc-workflow-distribution.md` touches only: front-matter version bump + revision-note prose, §1.4's §8/§10 rows and the ceiling line, §2.1(2)'s split criterion + table, §2.3's L7 row, §2.5's shrink-ladder count (PM F-03, not mine), §3 PROP-CLS-02(a)/(b) and P-R-10, PROP-CLS-07, §7 PROP-MTM-03/-04/-07, §8.0's Form/JS-extraction rows, §8.1 PROP-SEAM-03, §13.1 (AC-2.4 PM copy, AC-3.2 exit fix, four new AC/NFR rows), and the new §15.4 ledger. Every hunk maps to one of the 11 round-2 dispositions (3 PM + 8 SE) or to version-bump bookkeeping. **Confirmed clean — nothing beyond scope.** |
| PM-High spot-check (exit 2, PROP-MTM-03/§13.1) | REQ §4 AC-3.3's precedence table (`0` verified-green / `1` sync-fixable / `2` unverified-provenance / `3` unverified-unresolved / `4` write-failed) and FSPEC O-14/§5.8 both state a `local-edit`/`unverified` row outranks `stale`/`missing`, landing at exit 2. TSPEC AT-10 (`staleRow` + `unverifiedRow`, "mixed run exits 2 on post-run precedence") is explicit. AT-8a (`localEditRow` alone) doesn't print an exit code in its table row, but its only row is `local-edit`, which under AC-3.3's precedence is unverified-provenance ⇒ exit 2 — consistent with the property's "both worked at exit 2" claim. FSPEC §5.8/O-14's "exit 1 reachable only when post-copy verification is absent or defeated" is verbatim at FSPEC lines ~2108/2789. **Confirmed consistent.** |

## Findings — disposition verification

| ID | v2 finding (paraphrase) | v2.1 site | Verdict |
|----|---|---|---|
| F-01 | §8/§10 budget subtotals off by one row each (47→48, 27→32); total 181 vs ≈180 ceiling | §1.4 rows now read **48** and **32**; ceiling line now reads "≈ 180 spawns (rows sum to **181**...)"; §15.1's SE F-05 ledger entry corrected to match | **Resolved.** Recomputed independently: §8 = 21+16+4+6+1 = 48; §10 = 3+6+4+5+8+6 = 32. Ceiling/wall-clock argument unchanged as stated. |
| F-02 | PROP-MTM-07's domain unscoped, two conjuncts red on write-failing / declined-row trees | Property now reads "For every generated consumer tree **whose first sync is fault-free and exits 0** (excluding PROP-MTM-06's write-failing trees and PROP-MTM-03's local-edit/unverified trees...)" | **Resolved as a domain restriction, not an oracle weakening.** The exclusion narrows which trees the property quantifies over; conjuncts 1–5 are untouched. This is the correct fix — confirmed not a case of softening the oracle to dodge the finding. |
| F-03 | P-R-10 names two unco-holdable adjacencies where the body identifies three; PROP-CLS-07 mischaracterized as compensating for the reordering | P-R-10 and §2.1(2)/§3 now state **three** (`missing`/`in-sync`, `unverified`/`stale`, `stale`/`local-edit`); PROP-CLS-02(b) states explicitly "PROP-CLS-07 is one of those compensating controls, not a fixture for the `unverified`/`stale` reordering itself" — red against the degraded-manifest fall-through, and a pure rung-4/5 swap that still lands on `unverified` stays green against it | **Resolved.** Matches the finding's own analysis verbatim; the `stale`/`local-edit` row's self-referential framing is now extended to this row too. |
| F-04 | PROP-MTM-04's heading claims a biconditional ("exactly when") the operational and structural predicates don't jointly support | Heading changed to "agrees on every run where step 6 did not change R's classification"; conjunct 2 keeps the operational predicate, states it is *not* equivalent to the structural one, and gives the real reason agreement holds on a verified copy (rung 3 fires before any manifest lookup, so the entry rewrite cannot move R) | **Resolved — survivor is well-defined.** The new heading tracks classification-invariance rather than entry-write-invariance, which is what conjunct 2 actually asserts; the no-pre-existing-entry sub-case (conjunct 3) is called out as agreeing "for a reason distinct from both of these," so no residual iff is implied anywhere in the property. |
| F-05 | §8.0's `readonly PDLC_FAULT_TOKENS` is a re-source hazard; `readFaultTokens()` doesn't assert exit status | "Form" row now specifies an idempotent-source guard (`[[ -n ${PDLC_DRIFT_LIB_SOURCED:-} ]] && return 0; readonly PDLC_DRIFT_LIB_SOURCED=1`) before the `readonly` array assignment; "JS extraction" row now specifies `readFaultTokens()` asserts the child's exit status before the 16-entry sanity conjunct | **Resolved, both halves.** |
| F-06 | Three body/ledger inaccuracies: L7's partial ancestor path, PROP-CLS-07 silent on the present-without-this-id sub-recipe, PROP-SEAM-03's bearing/non-bearing scoping error | §2.3 L7 now reads the full path (`A1=yes, A2=yes, A3=yes, A4=yes, A5=equal`); PROP-CLS-07 now states both the absent case *and* present-without-this-id emit no N-4; PROP-SEAM-03 moves the malformed-selector forms (`backup:`, `backup:a:b`) into the bearing clause with an explicit exception carve-out | **Resolved, all three.** |
| F-07 | §13.1 claims "the full list" while omitting AC-1.1a, AC-6.2a, NFR-4, NFR-5 | Four rows added: AC-1.1a → §11.1 (discharged via O-11); AC-6.2a → not property-shaped (P1); NFR-4 → PROP-MTM-04 conjunct 1's `assertPhaseOrder` (routed by name); NFR-5 → not property-shaped (P2) | **Resolved — each disposition owned.** "Not property-shaped" is itself a valid, explicit disposition for AC-6.2a/NFR-5, not a gap; NFR-4 is the one that needed (and got) a named property home. |
| F-08 | PROP-CLS-02(a) row 3 (`unknown` > every lower) isn't a co-holding fixture under the section's stated criterion | §2.1(2)'s criterion broadened to "is the reordering observable through some input," with co-holdability named as the usual but not the only route; row 3 reclassified as order-observing (rungs 3/5 unevaluable under `A0 = absent`, not a co-holding pair) | **Resolved, and rows 1–2 are not weakened.** Both retained rows (`unknown`>`missing`, `in-sync`>`unverified`) get an added clause — "both guards genuinely **co-hold**" — reaffirming they still satisfy the narrower, stricter criterion in addition to the broadened one. The broadening only widens what counts as sufficient; it does not relax what rows 1–2 already proved. |

## Questions

None — the two v2 questions (Q-01 on PROP-MTM-07 reuse, Q-02 on C1 re-sourcing) are answered by the
F-02 and F-05 dispositions above and do not require a separate response.

## Positive Observations

- All eight Lows are addressed at the cited site, not only in the §15.4 ledger — spot-checked
  against the live document text, not just the disposition table's prose.
- F-08's disposition is the most delicate of the eight (a broadened criterion risks quietly
  weakening what was already proven for rows 1–2), and the fix explicitly re-asserts the stricter
  co-holding claim for those rows rather than relying on the broadened one alone.
- The new §15.4 ledger is reviewer-qualified (`PM F-nn` / `SE F-nn`) and each row is independently
  checkable against the body, consistent with the discipline v1 → v2 established.

## Recommendation

**Approved**

All eight round-2 Lows are resolved at the site, none introduces a new High/Medium-shaped issue, and
the v2.1 diff contains nothing beyond the 11 dispositions (3 PM + 8 SE) plus version-bump
bookkeeping. No residual findings to carry forward.

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
