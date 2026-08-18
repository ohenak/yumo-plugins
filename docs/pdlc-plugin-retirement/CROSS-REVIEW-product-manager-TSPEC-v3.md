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

## Questions

## Positive Observations

## Recommendation

## Verdict
