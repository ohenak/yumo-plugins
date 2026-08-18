# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.3)
**Date:** 2026-08-17
**Iteration:** 3
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v2.md`. Prior findings verified against
the revised text; only the changed hunks (`git diff 0b2a0615..HEAD`, 77 insertions / 37 deletions,
one file) were scanned for new issues. Unchanged sections already approved were not re-litigated.

## Prior findings disposition

| v2 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Partially resolved** — see F-01 below | §5.2's TT-3 is now two named halves and does re-home the mode-bit block over an enumerated, set-equal script set, with a companion assertion tying that enumeration to the executables tracked under `pdlc/hooks/scripts/`. That is the right shape. The enumeration itself is one script short: it lists `cleanup-consumer-workflows.sh` plus `check-scope-field.sh`, `guard-harvest-before-delete.sh` and `nudge-consolidation.sh`, and omits `check-req-size.sh`, which is tracked `100755` (`git ls-files -s pdlc/hooks/scripts/`), registered at `pdlc/hooks/hooks.json:24`, and named by AC-3.3 ("the scope-field and REQ-size warnings emit"). The gap that made the v2 finding High therefore still exists for one hook, and the companion set-equality assertion cannot pass as written. |
| F-02 | High | **Resolved** | §4.5 clause 1(b) now stops at the run-variable *key* level and enumerates the fixed schema in a table: `engine.dispatches.{bySkill,byPhase}` enumerated, `…bySkill.<skill-name>`/`…byPhase.<phase>` not; `engine.outcomes.{ran,halted,blocked,refused,"max-passes",idle}` enumerated. Verified against the source: `pdlc/engine/lib/report.mjs:64` seeds `dispatches = { bySkill: {}, byPhase: {} }` and `:71` seeds `outcomes = { ran: 0, halted: 0, blocked: 0, refused: 0, "max-passes": 0, idle: 0 }` — the six transcribed keys are exactly the six in the code, in the code's own spelling including the quoted `"max-passes"`. The `:21` docstring is quoted accurately ("the zero-valued shape for `dispatches`/`outcomes`, never a missing key"). A vanished outcome kind or dispatch axis now reds clause 1, which is what AC-5.2's "no field, no phase, no gate disappeared" needs; a differing dispatched skill set still passes. |
| F-03 | Low | **Resolved** | §4.4 now reads "**2 deleted / 3 surviving**, not 4 + 1" and names the members correctly against `const FIVE_SCRIPTS` (`bootstrap.test.js`): `check-workflow-drift.sh` (class 4) and `sync-workflows.sh` (class 5) deleted; `check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh` surviving. Verified — those five are the array's members, and the three named survivors are tracked `100755` at HEAD. The arithmetic is right; the attribution of those three to AC-3.3 is not (F-01). |

Both High findings were acted on in the same round, and the surrounding new material (§2.6 helper
survivorship, §2.7's `MERGE_GUARD_DEFAULTS` anchor correction, §3.2's 4a/4b split, §6.1 erratum 7's
amendment) checks out against the tree — see Positive Observations. The findings below are new;
F-01 is the unclosed remainder of the v2 finding, F-02 and F-03 are Low.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **TT-3's set-equal enumeration omits `check-req-size.sh`, so one AC-3.3 hook still loses its mode-bit oracle, and the row's own companion assertion contradicts the enumeration.** §5.2 row TT-3 half (b) enumerates `{ pdlc/hooks/scripts/cleanup-consumer-workflows.sh, check-scope-field.sh, guard-harvest-before-delete.sh, nudge-consolidation.sh }` and then requires that enumeration to "**set-equal** the executable scripts actually tracked under `pdlc/hooks/scripts/` (excluding the sourced, deliberately non-executable `lib/`)". Measured at HEAD, `git ls-files -s pdlc/hooks/scripts/` returns six tracked `100755` files — `check-req-size.sh`, `check-scope-field.sh`, `check-workflow-drift.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh`, `sync-workflows.sh` — plus `lib/pdlc-drift.sh` at `100644`. The sweep deletes exactly two of the six (`check-workflow-drift.sh`, class 4; `sync-workflows.sh`, class 5) and adds one, so the post-sweep executable set has **five** members: the four enumerated plus `check-req-size.sh`. Two consequences, both product-visible. (i) `check-req-size.sh` is a hook AC-3.3 explicitly names — "the scope-field and **REQ-size** warnings emit" (REQ AC-3.3) — and is one of the four surviving `hooks.json` entries the TSPEC's own §4.4 L-6 row 2 counts (`pdlc/hooks/hooks.json:9,20,24,34`; `:24` is `check-req-size.sh`). It has no mode-bit oracle today (it was never in `FIVE_SCRIPTS`) and gains none here, so the post-sweep tree ships a hook whose lost execute bit fails silently — the exact failure mode the v2 finding was raised about. (ii) As written the row cannot go green: the enumeration and the tracked-executable set are not set-equal, so the companion assertion reds on a correct sweep, or gets quietly relaxed to containment during implementation, which is the guard the row exists to provide. Fix: add `pdlc/hooks/scripts/check-req-size.sh` to TT-3's enumeration (five members post-sweep) and keep the set-equality companion as stated. | REQ AC-3.3, AC-1.7; FSPEC AT-3.3 |
| F-02 | Low | Local | **§4.4 attributes three hooks to AC-3.3; AC-3.3 names four.** The paragraph reads "`check-scope-field.sh`, `guard-harvest-before-delete.sh` and `nudge-consolidation.sh` survive unchanged as **the three hooks AC-3.3 names**", and §5.2's TT-3 inherits the same framing ("the three surviving hook scripts"). AC-3.3 names four surviving behaviours — "harvest guard refuses a premature review-file deletion; the scope-field **and REQ-size** warnings emit; the consolidation nudge reaches the human session" (`REQ-pdlc-plugin-retirement.md`, AC-3.3) — and AC-1.7's surviving hook-entry set is likewise four. The correct statement is that three of `FIVE_SCRIPTS`'s five members survive, and that `FIVE_SCRIPTS` was never coextensive with AC-3.3's hook set. This is the sentence that produced F-01's short enumeration, so the two corrections land together; recorded separately because the miscited requirement will otherwise propagate into PLAN and PROPERTIES as "three hooks". | REQ AC-3.3 |
| F-03 | Low | Local | **§5.2's AT-3.3 clause 2 row names two different host modules for the same new assertion, and overstates what is uncovered today.** The row opens "Both conjuncts land in the retained `hookCompatibility.test.js` (§2.6) in class 6's reduction commit, because **neither is covered today**", then says of `nudge-consolidation.sh` that "a new stdout-JSON-plus-exit-`0` assertion for it is added **there**" in a sentence whose immediately preceding subject is `consolidationHookParity.test.js`. An implementer cannot tell which module owns the nudge oracle. Separately, "neither is covered today" is too strong for `check-scope-field.sh`: `PROP-COMPAT-04` already asserts `expect(exitCode).toBe(0)` (`pdlc/workflows/__tests__/hookCompatibility.test.js:100`) alongside the two `toContain` lines (`:102`–`:103`), so what is missing is the parsed-JSON conjunct, not the exit conjunct. The substance of the row is right and the strengthening is worth doing; the fix is to name one host module explicitly for the nudge assertion and to narrow the "neither is covered" clause to the JSON shape. | REQ AC-3.3; FSPEC AT-3.3 |

FINDING: High | delta | local | §5.2 row TT-3 half (b) / §4.4 bootstrap paragraph | TT-3's set-equal enumeration omits `check-req-size.sh`, an AC-3.3/AC-1.7 surviving hook tracked `100755`, so that hook still ships with no mode-bit oracle and the row's own tracked-executable set-equality assertion cannot pass
FINDING: Low | delta | local | §4.4 bootstrap paragraph | "the three hooks AC-3.3 names" miscites AC-3.3, which names four surviving hooks including the REQ-size warning
FINDING: Low | delta | local | §5.2 AT-3.3 clause 2 row | host module for the new nudge assertion is stated as both `hookCompatibility.test.js` and `consolidationHookParity.test.js`; "neither is covered today" overstates the gap for `check-scope-field.sh` (`hookCompatibility.test.js:100` already asserts exit `0`)

## Questions

## Positive Observations

## Recommendation

## Verdict
