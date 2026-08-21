# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.13)
**Date:** 2026-08-20
**Iteration:** 3

## Method

Delta re-review. The tree state my v2 measured was `756bafa5`; the diff read this round is
`git diff 756bafa5..HEAD -- docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`, which
carries exactly three commits: `b7ae5a03` (AC-2.4's zero-budget oracle), `aecc5986` (C-5's second
bound), `53fe0b73` (v1.13 changelog plus v1.12's corrected causal clause). Only those hunks were
scanned for new issues; sections approved in v1/v2 were not re-litigated. Every claim below was
re-measured against HEAD source, not against the document.

Branch verified `feat-pdlc-advisory-wave-gate` before reading and again immediately before the
commit of this file. No `git checkout` run in the shared tree.

## Prior-finding disposition

| Prior | Severity | Status | Evidence re-measured this round |
|---|---|---|---|
| F-01 | Low (Process) | **Resolved** | C-5 now reads `(700 lines / 61,440 bytes hard, 630 lines / 55,296 bytes soft)`. Both pairs match the shipped script byte-for-byte: `pdlc/hooks/scripts/check-req-size.sh` `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (:41-42) and `SOFT_LINE_LIMIT=630` / `SOFT_BYTE_LIMIT=55296` (:44-45), with the soft arm firing on *either* bound (:54-57). |
| F-02 | Low (Local) | **Resolved** | The v1.12 changelog clause now reads "QUEUE row 19 `done`, which is what blocked rows 6 and 20 on the queue's not-done dependency pre-check; `ready: true` … unblocks only this row's own pickup". That is the shipped split: the successor pre-check reads only the queue row's `status` (`pdlc/workflows/orchestrate-queue.js:880-885`, `match.status !== "done"`), while `ready` gates only the row's own pickup (`:1339-1341`, `Skip "…": REQ not marked ready: true (still a draft).`). `docs/_queue/QUEUE.md:81` reads `done`; rows 6 and 20 (`:78`, `:82`) carry the edge. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | AC-2.4's new clause reads as if the class rode the per-seam summary row; the shipped row carries no class field. Attach the class to the invocation's durable entry instead. | §6 AC-2.4 |
| F-02 | Low | Local | "one `escalated` invocation per red wave" is unobservable more than once per run — the first unresolved A6 halts the run, so the realisable oracle is one escalation, one red wave. | §6 AC-2.4 |
| F-03 | Low | Local | At 656 lines the document is past C-5's own newly-named soft threshold (630), so every edit to it now emits the relocation warning. | §5 C-5 |

### F-01 (Low, Local) — the class is on the record/escalation entry, not on the summary row

AC-2.4 now reads: *"the per-seam A6 row is present and reads `resolved: 0` with one `escalated`
invocation per red wave, each carrying `unclassified` as its class"*. The row half is exact —
`advisorySummaryRows` builds one row per member of `ADVISORY_SEAMS` (`pdlc/workflows/orchestrate-dev.js:3690`)
with fields `seam`, `invocations`, `resolved`, `escalated`, `noAction`, `model`, `fallback`
(`:3697-3705`), so an enabled tier with `waveBudgetPerRun: 0` does show an A6 row reading
`resolved: 0`, `escalated: 1`, and that is distinguishable from AC-1.4 inertness, where the whole
section is `undefined` (`:16070`, `:16110`).

The class is not on that row. It reaches the operator through `annotate`, whose `rootCause` field is
built at `:3242` (`capturedRootCauseForRecord || "unclassified"`) and rides both the record entry and
the escalation entry via `terminate` (`:4036-4041` annotations spread into the disposition, `:4067`
onto the terminal object). The budget escape returns before any dispatch
(`:3510-3512`, `if (waveBudget.resolved >= advisoryConfig.waveBudgetPerRun) return { __preDispatch: { outcome: "escalated", reason: "budget-exhausted" } }`),
which the driver turns straight into a terminate call (`:4147-4156`), so `classifyReply` never runs and
`capturedRootCauseForRecord` is still null — the observed class really is `unclassified`, and it really
is AC-2.2's default. Only the *carrier* is misnamed.

**Change:** make the carrier explicit, e.g. *"…the per-seam A6 row is present and reads `resolved: 0`
with one `escalated` invocation per red wave, each such invocation's record and escalation entry
naming `unclassified` as its class…"*. Grounding the oracle on the artifact that actually holds the
field keeps a test from asserting a row key that does not exist.

### F-02 (Low, Local) — one escalation per run is the realisable reading

The same sentence quantifies per red wave. Within one run that quantifier can only ever be
witnessed once: an unresolved A6 halts the run at the wave that produced it
(`pdlc/workflows/orchestrate-dev.js:15390-15398`, `if (!a6.resolved) … throw haltError(testGateMessage, …)`),
and under `waveBudgetPerRun: 0` the escape at `:3511` fires on the very first red wave because
`waveBudget.resolved` starts at 0. So the universally-quantified claim is true and the observation is
singular. AC-2.4's earlier default-budget sentence ("one wave A6 resolved exhausts the shipped default
of 1, so the next red wave escalates without a dispatch") does not have this problem, because a
resolution continues the run.

**Change:** one clause — *"every red wave that occurs escalates with no dispatch (the first such
escalation halting the run, so a single run witnesses one)"* — keeps the requirement's generality and
tells the test author the shape of the fixture. Not gating: no criterion is wrong, only its
observability is over-stated.

### F-03 (Low, Local) — the document sits above the soft threshold C-5 now names

Measured now: `wc -l -c` → 656 lines / 52,844 bytes. Bytes are inside the soft bound (55,296); lines
are not (656 > 630), so `check-req-size.sh` emits its relocation `additionalContext` on every
Write/Edit to this file (`:44-45`, `:53-66`). This is not a violation — the hard ceiling still has 44
lines / 8,596 bytes of headroom (`:41-42`) — and C-5 is now honest about both bounds, which is what my
v2 F-01 asked for. It is worth recording that the round that fixed the statement also grew the
document by 9 lines. The next revision that adds material should pay for it out of
`docs/_constraints/pdlc-wave-gate-baseline.md`, as v1.12's routing already did, rather than out of the
remaining headroom.

## Questions

## Positive Observations

## Recommendation

## Verdict
