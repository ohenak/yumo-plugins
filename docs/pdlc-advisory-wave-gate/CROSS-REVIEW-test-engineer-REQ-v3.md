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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | AC-2.4 names the zero-budget escalation's class without naming its carrier; the summary row itself has no class field, so a literal transcription could pin `rootCause` onto the row and go RED | AC-2.4 |
| F-02 | Low | Local | C-5 now states the hook's soft threshold (630 lines / 55,296 bytes) but the REQ measures 656 lines, past it — the constraint the document just adopted is one the document is already outside, with no stated consequence | C-5 |

### F-01 (Low, Local) — the class's carrier is unnamed

AC-2.4's new clause reads "…the per-seam A6 row is present and reads `resolved: 0` with one
`escalated` invocation per red wave, each carrying `unclassified` as its class". The substance is
correct and verified (see Delta Basis), and the grammatical subject of "each" is the *invocation*,
not the row. But the sentence's only named observable is the summary row, and the row carries no
class: `advisorySummaryRows` emits `{seam, invocations, resolved, escalated, noAction, model,
fallback}` and nothing else (`orchestrate-dev.js:3697-3706`). The class lives on three other
artifacts — the record entry's `| Root cause |` line (`:3636`), the escalation log's
(`:3770`), and the halt's `advisory.rootCause` (`:3566`).

Why it is Low and not Medium: AC-6.2 and AC-6.4 already establish the class as a field on the
record and on `ESCALATIONS.md`, so the carrier is recoverable from the document — a PROPERTIES
author who reads §6 as a whole lands on the right oracle. The residual risk is a local one: read
alone, this sentence invites `summary.rows.find(r => r.seam === "A6").rootCause === "unclassified"`,
which is `undefined === "unclassified"` against shipped code.

Resolving change: three words — "…each carrying `unclassified` as its class **on the record and the
escalation log** (no reply having been classified — AC-2.2's default)". No new claim, just the
carrier the assertion attaches to.

### F-02 (Low, Local) — C-5 adopts a threshold the REQ is already past

C-5 now transcribes both of the hook's bounds, and the transcription is exact
(`check-req-size.sh:39-47`). The measurement it invites is not: at HEAD the REQ is **656 lines /
52,844 bytes**. That is inside both hard bounds (44 lines, 8,596 bytes of headroom) but past the
soft **line** threshold of 630, so `check-req-size.sh` emits its soft nudge on every write to this
file — the hook's own words, "a REQ that can only absorb the next review round by deleting existing
text will eventually delete a reason rather than a restatement" (`:42-45`).

This is not a testability defect in an AC, which is why it is Low rather than Medium: C-5 states a
measurement discipline, not a compliance claim, and the hook never blocks (`exit 0` on every path).
It is worth a line because C-5's whole purpose is to make the size question decidable from the
document, and the document now names a bound it silently exceeds. Two resolving changes are equally
acceptable: state the current measurement and the consequence ("past the soft line threshold;
further rounds relocate measured facts to the baseline file rather than growing this document"), or
relocate ~30 lines to `docs/_constraints/pdlc-wave-gate-baseline.md` and come back under 630. The
first is the cheaper one and preserves the round's reasons.

## Questions

| ID | Question |
|----|---------|
| Q-01 | v2's Q-01 and Q-02 remain open and remain non-gating: AC-4.4's truncated `[post-wave, test, post-wave]` sequence still leaves a re-gate post-wave failure's classification undecided in prose, and AC-1.5's zero-notice population still needs a fixture that defeats the earlier dispatch-halt branch (precedence-chain check) before "zero" is a real zero. Both are PROPERTIES-altitude if that is the deliberate routing — please confirm rather than answer here |
| Q-02 | With `waveBudgetPerRun: 0`, the first red wave escalates and the run halts (`orchestrate-dev.js:15398`), so "one `escalated` invocation per red wave" can only ever be observed as exactly one per run. The clause is true either way; is the plural phrasing deliberate future-proofing for a resume-mode run that revisits waves, or should it read "one per run"? |

## Positive Observations

- **The correction landed as a factual restatement, not a retreat.** v2's F-01 was the hardest kind
  of finding to address well — the AC named the right requirement and asserted a false observable,
  so the tempting fixes were to delete the clause or to soften it into unfalsifiability. v1.13 did
  neither: it replaced one wrong value with two right ones (`resolved: 0` **and** a nonzero
  `escalated` count), which is a *stronger* oracle than the sentence it replaced and preserves the
  AC-1.4 contrast that motivated the clause. I re-traced all five hops (escape → terminate →
  disposition `seam` → push → `advisorySummaryRows`) and the AC now matches shipped bytes at each.
- **F-02's fix carries its own justification.** "each carrying `unclassified` as its class (no
  reply having been classified — AC-2.2's default)" states the value *and* the mechanism that
  produces it, so the PROPERTIES author transcribes a literal without needing to read the code —
  which is exactly what the no-implementation-echo rule requires of a spec.
- **The changelog corrected its own prior round's causal claim.** v1.12 attributed the rows 6/20
  unblock to the `ready: true` flag; v1.13 reassigns it to QUEUE row 19's `done` status and demotes
  `ready: true` to this row's own pickup gate. I verified both halves against
  `orchestrate-queue.js:884` and `:295` — the correction is right, and a document that narrates its
  own retractions is one whose unretracted measurements I can trust.
- **C-5's transcription is exact.** Both bounds, hard and soft, match `check-req-size.sh` digit for
  digit. F-02 is about the document's own measurement against them, not about the numbers.

## Recommendation

**Approved with minor changes**

The one High finding from v2 is resolved, verified end-to-end against shipped code rather than
against the FSPEC or TSPEC, and the Low is resolved too. Nothing outside the three changed hunks
was disturbed. Two new Low findings are recorded and neither gates: F-01 asks for three words
naming the class's carrier so the clause cannot be mis-transcribed onto the summary row, and F-02
asks C-5 to state where the document actually sits against the soft threshold it now names. Both
can ride the next edit this REQ takes for any reason.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

