# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.5)
**Date:** 2026-08-11
**Iteration:** 7

**Scope:** delta re-review against v6. `git diff 22eb0b3b..HEAD --
docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` is **empty** — the document is
byte-identical to the revision I approved with minor changes in round 6. The delta in this
round is entirely **upstream**: FSPEC moved v1.3 → v1.5 (the erratum round my v6 review
filed, plus the POSTMORTEM-T v2.0 resolution), and that movement is what this review
checks TSPEC against. Every claim below is grounded in HEAD source on
`feat-pdlc-headless-engine` and cited `file:line`.

## Prior findings disposition

None of v6's three findings (0 High, 2 Medium, 1 Low) is addressed, because the document
did not change. All three were explicitly non-blocking and folded-forward by agreement, so
this is not a regression — it is the state I approved. They carry into this round unchanged,
and one of them (F-36) is now **settled in its own favour by the upstream edit**.

| v6 finding | Disposition | Verification |
|---|---|---|
| F-36 Medium — the "composed but never executed → `null` terminals" branch has no producer at HEAD | **Still open, and the upstream half of the argument has now landed.** I offered two repairs: drop the clause, or requalify it per FSPEC BR-MODEL-3. FSPEC took the *second* — v1.5's BR-MODEL-3 now reads "The dry-run surface is **not** a way to reach it: one invocation composes one skill's prompt and dispatches nothing … so it exercises at most one row and is never the corpus's source" (`FSPEC:670-674`). TSPEC's clause still says the opposite half out loud: the `null`-terminal line exists so as to keep BR-MODEL-3 "true in both halves" (`TSPEC:789-794`). The branch remains unproducible — `emitDryRun` calls `adapter.composePrompt` directly (`pdlc/engine/bin/pdlc.mjs:190`) and never `_agent`; had a dispatch been attempted, `inertTransport().dispatch()` **throws** (`:100-102`), which settles as an error outcome, not `null` terminals | `pdlc/engine/bin/pdlc.mjs:98-104`, `:171-193`; `FSPEC:670-674`; `TSPEC:789-794`, `:1429-1432` |
| F-37 Medium — row 4's pinned `transport-contract-violation` vs §5.3's engine-fatal rule | **Still open, unchanged.** §5.3's engine-fatal sentence (`TSPEC:1184`) and §7.4 row 4 still read side by side without the escape-scoping clause. Re-derived at HEAD and the reconciliation still holds: `resolveAdvisoryRung`'s dispatch-error arm catches and re-enters the `opus` rung (`pdlc/workflows/orchestrate-dev.js:3143-3157`), so the rejection never reaches `run.mjs`'s top-level catch | `TSPEC:1184-1194`, §7.4 row 4 |
| F-38 Low — run iv's fixture should be named as throwing §3.4's `TransportError` | **Still open, unchanged.** Row 4's parenthetical still derives the member without naming the class the fixture injects | §7.4 row 4, §3.4 |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
