# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.1)
**Upstream at dispatch:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.8, sha256:3eb52debcd13aa37913322e7855628a9b237af278581e6773f48ceb1cfd72cba)
**Date:** 2026-08-28
**Iteration:** 3 (upstream-cascade confirmation — FSPEC's own bytes unchanged)

## Scope

Upstream-cascade confirmation, not a re-review. FSPEC v1.1 is byte-unchanged since my v2
approval (`REVIEWED-COMMIT: a8175794`); the approval's `UPSTREAM-STATE` pinned REQ
sha256:c18b7e88…, and that version of the REQ no longer exists. The erratum round moved the REQ
across three commits — `4e197abe5` (§4 C-5), `0756cefed` (§6 R-5, §7 A-1), `273d0ce00` (§1
changelog and Baseline pin) — plus the Baseline to v1.2 in `efbf3dad9`.

What the upstream edit actually changed, read at its current text, not from the changelog:

| Upstream site | Before (my approved version) | Now (v1.8) |
|---|---|---|
| §4 C-5 `decisionLedger.maxEntries` | `70`, **positive** integer | `70`, **non-negative** integer — `0` is a valid admits-nothing value |
| §4 C-5 `decisionLedger.maxBytes` | **`8000`**, positive integer, author analogy to `learningsInjection` | **`12500`**, non-negative integer, derived from Baseline v1.2's `M-7b`/`M-7c` |
| §6 R-5 | "`maxBytes` is an author analogy, not measured" | "Both bounds are now measured … but against one commit rather than a growth model" |
| §7 A-1 | `maxEntries` measured, `maxBytes` "remains a `learningsInjection` analogy, not measured" | Both defaults measured and cited by id (`M-6b`/`M-6c`, `M-7b`/`M-7c`) |
| Baseline pin | v1.1 | v1.2 (§8 `M-7a`…`M-7e` added; §1–§7, and the `Verified at` commit `8c673a09f`, unchanged) |

The one question asked: **does FSPEC still hold against the REQ as it now stands?** I read the
current upstream text at every site FSPEC leans on, not just the changelog's item list. The
type retyping and the R-5 rewrite cascade cleanly — FSPEC never restates a config type, and E-7
already treated `maxEntries` `0` as valid rather than as a fallback, which is exactly the
outcome the retyping was made to license. Two sites do **not** hold: FSPEC recites the old
`maxBytes` default as a literal, and FSPEC's §7 Assumptions restate A-1 in its retired form
while claiming to carry it "unchanged". A third is a version-pin staleness with no semantic
drift behind it.

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
