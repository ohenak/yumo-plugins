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

## Questions

## Positive Observations

## Recommendation

## Verdict
