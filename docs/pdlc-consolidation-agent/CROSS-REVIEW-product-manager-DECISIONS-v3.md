# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 3
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `9b05e97..HEAD` — four document commits: `17abd84` (DEC-CONS-03 invoking-tree verb set,
`TSPEC:1620` citation, §2 provisional marker), `691af5d` (strike "no mutating git verb at all" in
DEC-CONS-04 and §11.2), `7bdb99a` (DEC-CONS-06 read-prompt oracle scoped to both read-path prompt
arguments), `6e66b25` (drop bare reviewer-question references). I read my v2 cross-review, ran
`git diff 9b05e97..HEAD` on the document, and confined this pass to the changed spans plus my three
v2 findings.

Changed spans: §2's DEC-CONS-01 row; §5 (DEC-CONS-03) domains 1, 2 and 3; §6 (DEC-CONS-04)'s
`git`-mediated-locking rejection; §7's hook-cost closing sentence; §7's differential paragraph;
§8 (DEC-CONS-06)'s two read-side bullets; §11.2's DEC-CONS-03 row. Everything else is untouched and
not re-litigated — DEC-CONS-01's residual and three-arm Testability, DEC-CONS-02, DEC-CONS-05's
post-edit-hook baseline, DEC-CONS-07's two accepted costs, §10, §11.1, §11.3.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-04 | Low | **Resolved, and beyond what I asked** | I asked for the negative arm to be stated as a file-wide grep *or* for `rtReadRange` to be named beside `rtReadProbe`. The revision took the second option and then showed the first would have been **wrong** — see F-07 below for the one claim inside that demonstration I cannot confirm. The oracle is now set-equal to the two-member read-path prompt set: `rtReadProbe` (`runtime-adapter.js:369`, prompt `:374`) and `rtReadChunk` (`:268`, prompt `:281`, reached via `rtReadRange` at `:346`). All four citations verified at HEAD. |
| F-05 | Low | **Resolved** | `grep -n "reviewer Q\|Reviewer Q\|Q-0"` over the document returns **nothing**. All three bare references are gone and each host sentence still reads as an assertion in its own right ("…so the two sections agree: three changes, one file, one owning task."; "…which would make the 'one predicate' claim unfalsifiable."). Dropped rather than qualified, which is what I preferred. |
| F-06 | Low | **Resolved** | §2's DEC-CONS-01 row now carries the parenthetical: "the `gh` half is settled; the `git` half is **provisional** pending §11.3 item 3 — `rtShellQuote` single-quotes every `_git` argv element, so shell expansion cannot carry it there". The index and §11.3 no longer disagree. |
| Q-04 / Q-05 | — | Still open, still not findings | Neither is answered in this revision and neither needs to be: Q-04 is a PLAN-sequencing question and Q-05 a release-note suggestion. I carry both forward unchanged. |

## Verification of the changed sections

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
