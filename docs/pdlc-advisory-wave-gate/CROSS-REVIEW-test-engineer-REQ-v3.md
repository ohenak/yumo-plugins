# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.13)
**Date:** 2026-08-20
**Iteration:** 3

## Delta Basis

Delta re-review of `756bafa5..HEAD` (v1.12, the bytes v2 reviewed → v1.13). `git diff` on
`REQ-pdlc-advisory-wave-gate.md` reports **14 insertions, 5 deletions across 3 hunks**: the version
row and v1.13 changelog block, C-5's soft-threshold pair, and AC-2.4's zero-budget conjunct. Only
those three sections were scanned; sections unchanged since v1/v2 are not re-litigated.

Every existing-behaviour claim inside the changed sections re-measured against the working tree,
not against another document:

| Delta claim | Site verified | Result |
|---|---|---|
| `waveBudgetPerRun: 0` ⇒ per-seam A6 row reads `resolved: 0`, one `escalated` invocation per red wave | Budget escape `orchestrate-dev.js:3510-3512` returns `__preDispatch: {outcome:"escalated", reason:"budget-exhausted"}`; driver terminates with no agent call (`:4147-4156`); disposition carries `seam: "A6"` (`:4041-4052`); wave loop pushes it (`:15388` `if (a6.disposition) advisoryDispositions.push(a6.disposition)`); `advisorySummaryRows` counts `escalated` off `outcome === "escalated"` and `resolved` off `"resolved"` (`:3690-3706`); halt report carries `advisory: advisorySummaryRows(...)` when the tier is on (`:16070`) | **Holds** — v2 F-01 resolved |
| That escalation's class is `unclassified` | Pre-dispatch escape reaches `terminate`, which calls A6's `annotate` (`:4038-4042`); `annotate` returns `rootCause: capturedRootCauseForRecord \|\| "unclassified"` (`:3242`) and `capturedRootCauseForRecord` is `null` until a reply is classified (`:3093`, set only at `:3164`); rendered on the record (`:3636`) and on `ESCALATIONS.md` (`:3770`); halt fields carry the same (`:3566`) | **Holds** — v2 F-02 resolved |
| `advisory.waveBudgetPerRun` admits any integer ≥ 0 | `nonNegativeInt` (`:2073-2077`) keeps `0` as configured rather than defaulting it; `ADVISORY_DEFAULTS.waveBudgetPerRun = 1` (`:1948`) | Holds |
| One A6 invocation per red wave (not per gate attempt) | `runWaveGateSeamFn` fires once, inside the first-pass red-test branch (`:15356-15387`); an unresolved return throws `haltError` immediately (`:15398`) | Holds |
| C-5's `check-req-size.sh` numbers: 700 lines / 61,440 bytes hard, 630 / 55,296 soft | `pdlc/hooks/scripts/check-req-size.sh:39-47` (`LINE_LIMIT=700`, `BYTE_LIMIT=61440`, `SOFT_LINE_LIMIT=630`, `SOFT_BYTE_LIMIT=55296`) | Holds as a transcription; the REQ's own measurement is F-02 below |
| Changelog: row 19 `done` is what unblocks rows 6 and 20; `ready: true` gates only this row's own pickup | `docs/_queue/QUEUE.md:78,81,82` (rows 6/20 declare a `pdlc-advisory-wave-gate` edge, row 19 is `done`); the not-done dependency pre-check is `orchestrate-queue.js:884`; `ready` is parsed as the pickup gate at `:295-296`, `:257` | Holds — SE F-02's correction is accurate |
| Baseline cited as v1.2 | `docs/_constraints/pdlc-wave-gate-baseline.md:7` reads `1.2 · 2026-08-20` | Holds |

## Prior-Finding Disposition

| v2 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-2.4's fourth clause no longer asserts "reads zero". It now reads `resolved: 0` with one `escalated` invocation per red wave — which is exactly what the shipped path produces: the budget escape's disposition carries `seam: "A6"` (`orchestrate-dev.js:4041`), the wave loop pushes it (`:15388`), and `advisorySummaryRows` therefore scores the A6 row `{invocations: 1, resolved: 0, escalated: 1, noAction: 0}` (`:3690-3706`). A PROPERTIES author transcribing the AC literally now writes an oracle that goes GREEN on shipped behaviour, and the two positive conjuncts (`resolved: 0` **and** a nonzero `escalated`) are strictly stronger evidence that the tier ran than the "zero row" they replaced — the AC-1.4 contrast (`advisory.enabled: false` ⇒ no advisory section at all) survives verbatim |
| F-02 | Low | **Resolved** | The zero-budget escalation's class is now named `unclassified`, with AC-2.2's default cited as the reason. Verified: no reply is classified on the pre-dispatch path, so `capturedRootCauseForRecord` stays `null` (`:3093`) and `annotate`'s `|| "unclassified"` fallback (`:3242`) rides the terminal disposition onto the record (`:3636`), `ESCALATIONS.md` (`:3770`) and the halt fields (`:3566`). AC-6.4's countability in this mode is now decidable from the REQ alone. One residual ambiguity about *which* artifact carries the class is F-01 below (Low, not a regression) |

No prior finding regressed, and the revision disturbed no section outside the three hunks above.

## Findings

## Questions

## Positive Observations

## Recommendation

