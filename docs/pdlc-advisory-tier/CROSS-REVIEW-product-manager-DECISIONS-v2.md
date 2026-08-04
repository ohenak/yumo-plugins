# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review — product lens. Verification that each v1 finding is resolved, plus a scan of the changed sections only (`git diff 6703b20..67aceb2`, +183/−54) for new issues. Sections unchanged since v1 were not re-litigated.

## Prior-finding disposition

Every v1 finding is resolved, and each resolution was re-verified against the branch rather than taken
on the commit message's word.

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | DEC-ADV-08's Context (`DECISIONS:546-553`) now quotes `FSPEC:145` verbatim and states "**FSPEC C-2 already reconciles them**"; the decision is reframed as "a **conformance** choice, not a deviation and not a conflict resolution … no erratum against FSPEC is owed or raised" (`:559-562`). I re-read `FSPEC:145` — the quoted text matches character-for-character. The re-evaluation trigger (`:593-596`) no longer waits on an erratum; it now fires on C-2's clause being restated. |
| F-02 | High | **Resolved** | DEC-ADV-03's Context (`:265-273`) now cites the §4.1 preamble at `FSPEC:232-237`, A5-8 at `FSPEC:635` and R-2 at `FSPEC:690`, and concludes "There is no live contradiction to resolve." All three citations verify: `FSPEC:232-237` is inside `### 4.1 The flow` (header at `FSPEC:206`) and reads as quoted; `FSPEC:635` carries "The produced-change check and the record write both complete **before** the push"; `FSPEC:690` carries the matching clause. The entry's residual question ("how a **uniform** driver expresses that order without a per-seam branch") is a genuine TSPEC-side choice, and the rejected alternative was correspondingly restated from "the literal FSPEC order" to "a per-seam driver branch". The real `commitPaths` finding survives (`:305-312`). |
| F-03 | Medium | **Resolved** | The closing paragraph is rewritten (`:758-771`): it names TSPEC's `commitPaths` gap as the live defect and adds an explicit "**Two things that look like upstream defects and are not**" paragraph pinning both to their FSPEC line numbers. `grep -i erratum` over the whole document returns **zero** FSPEC-directed errata; every remaining routing targets TSPEC (`:170`, `:311`, `:655`, `:761`, `:785`). |
| F-04 | Low | **Resolved** | `:718` now reads "an explicit ten-name allow-list". `build-runtime.mjs:243-254` holds exactly ten entries. |
| F-05 | Low | **Resolved** | DEC-ADV-07 gains "**The restoration path chosen is: none.**" (`:498-504`), states plainly that both offered options are rejected and the judgement left with the operator, and cross-references re-evaluation trigger 3 — exactly the sentence F-05 asked for. |
| F-06 | Low | **Resolved** | DEC-ADV-04 gains a dedicated paragraph (`:376-386`) restating AC-1.4 unchanged — "no advisory agent runs on an unresolved model and the run fails loudly … no third fallback and no silent revert to `MODEL_DEFAULT`" — and bounding "non-fatal by construction" to the fallback branch. The added unreachability analysis stays inside REQ's grant: AC-1.4's last sentence is "The detection point is TSPEC's to choose" (`REQ:82-84`), so declaring it a unit-level obligation is a licensed choice, not a narrowing. |
| F-07 | Low | **Resolved** | `:514-517` now cites `dodVerifyLoop` at `dev:6273` and the log at `dev:6297`, and attributes the write to the `dod-verify` agent. Verified: `async function dodVerifyLoop(` at `orchestrate-dev.js:6272-6273`; the `CODE_REVIEW-…` `_log` call at `:6295-6300`. |

## Findings

All three are new, all Low, all confined to text the revision added. No prior finding remains open.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-08 | Low | Local | **The TSPEC erratum list is narrower than the stale TSPEC text it describes.** `DECISIONS:761-763` routes three TSPEC items — the `commitPaths` export gap, §16.1's manifest over-claim, and §11.3's "deliberate C-2 deviation" table cell. Having correctly established that no FSPEC erratum is owed, the document leaves unnamed the two places where TSPEC states the *opposite* at greater length: **§16.4 is titled "Errata raised against FSPEC (not fixed here)"** and enumerates both now-settled items — "A2-6 / R-2 ordering gap … FSPEC never reconciles them" (`TSPEC:1464-1466`) and "C-2 / D-5 conflict … satisfies both, contradictorily" (`TSPEC:1468-1470`) — and **`TSPEC:257`** opens §3.2's rule with "One deliberate deviation from C-2, resolving an FSPEC conflict (see the erratum in §16.4)". An erratum edit that fixes only the §11.3 cell leaves §16.4 asserting two FSPEC defects this document says do not exist. The document itself makes the completeness of this list load-bearing: it notes at `:770-771` that "an erratum round is bounded at one per upstream document per phase, and a confirmation that fails halts the phase" — so an item omitted from the round is not cheaply raised in a second one. Severity is Low only because I am emitting both items as errata from this review, so the routing happens regardless; what remains is the document's own accuracy as the record of what was routed. **Fix:** extend `:762-763` to name TSPEC §16.4 (both numbered items) and `TSPEC:257` alongside §11.3. | FSPEC C-2, A2-6, R-2; TSPEC §16.4, §3.2, §11.3 |
| F-09 | Low | Local | **"One live upstream defect" now heads a paragraph that routes three, and a fourth is routed elsewhere and never listed.** `:758` reads "**One live upstream defect is recorded but not decided here: TSPEC's `commitPaths` export gap**", then `:762-763` adds two more; separately, DEC-ADV-10's new paragraph routes a fourth — "TSPEC §11.2 owns the header's fields, and the scenario row is routed there as an erratum" (`:649-655`) — which the closing section does not mention. I confirmed that fourth item is genuine, not spurious: `TSPEC:1227-1229` records the fixture's provenance as "the exact commit sha `26c3f1c`, the command, the date" with no scenario field. The count in the lead sentence is the only thing wrong. **Fix:** "**Four TSPEC errata are recorded but not decided here**", and add the §11.2 scenario row to the list so the section remains the single index of what left this phase. | — (internal consistency of the document's own upstream-routing record) |
| F-10 | Low | Local | **DEC-ADV-03's "a step-7 failure reverts a working-tree edit only" does not hold at A4, which the same revision newly brings under the claim.** `:279-281` states the generalisation and then adds "At the three seams whose act is *not* irreversible (A1, A3, A4) `verifyGate` runs the gate alone". A4's action is not a working-tree edit: FSPEC §8.1 has the seam "resolve the conflicts, **complete the rebase**", and A4-4 (`FSPEC:566`) defines its revert as "returning the branch to its pre-seam state", with A4-6 (`FSPEC:568`) forbidding a third tree state. Reverting a completed rebase is a branch-state restore, not an edit undo. The design is unaffected — A4-6 is preserved everywhere else in the document, and FSPEC owns the revert semantics — but a reader who takes the generalisation literally will under-scope A4's revert obligation. **Fix:** qualify the clause, e.g. "reverts a working-tree edit only (A2, A5); at A4 the revert is FSPEC A4-4's restore of the pre-seam branch state, still one of BR-5's two tree states". | FSPEC A4-4, A4-6, BR-5 |

## Questions

## Positive Observations

## Recommendation

## Verdict
