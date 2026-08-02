---
feature: pdlc-runtime-measurement-spike
ready: false
depends-on: []
---

# REQ — pdlc-runtime-measurement-spike

| Field | Value |
|---|---|
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` R-3; `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` §4.7, R-4, N-6 |
| Downstream | `FSPEC-pdlc-runtime-measurement-spike.md`; any future REQ that would otherwise guess at these facts |
| Cross-Reviews | *(none yet — this is a stub)* |
| LEARNINGS | `docs/pdlc-runtime-measurement-spike/LEARNINGS-pdlc-runtime-measurement-spike.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | stub | Claude + operator | 0.1 | 2026-07-31 |

> **This is a successor stub, not a specified feature.** It exists so that
> `pdlc-review-convergence`'s deferral of the two unmeasured runtime facts is **bound to a named
> successor REQ file** as DC-08 requires. POSTMORTEM R-3 recommended creating a successor for exactly
> this and none was created — that second-order failure is the reason this file exists rather than a
> prose note. It is `ready: false` and is not queue-eligible until an operator sets `ready: true`.

## 1. Problem (inherited)

The predecessor feature's Phase R burned five rounds and never closed two generator classes of
finding, because both turn on properties of the Claude Code workflow runtime that **nobody has
measured**. Every candidate answer was a guess about unobservable behaviour and every guess was
falsifiable by a reviewer-constructed scenario, so the process had no fixed point below the point
where the fact gets measured. The measurements are cheap; they have simply never been taken.

`pdlc-review-convergence` AC-5 stops such findings from consuming review rounds. It does **not** settle
them — that is this feature's job.

## 2. The two facts to measure

| # | Fact | Proposed method | What it settles |
|---|---|---|---|
| **MR-1** | How an exhausted retry, or a dispatch killed by the 180-second stall watchdog, surfaces to the caller of `agent()` — thrown, returned with a marker, or returned indistinguishably from success | One throwaway feature, one dispatch deliberately stalled, the return value recorded | Whether any loop can distinguish a killed dispatch from a completed one, which every no-progress and retry rule depends on |
| **MR-2** | Whether a partial write is visible on disk before its commit, as observed through the injected `_readFile` seam | Read the target document through the adapter at two known points inside one authoring dispatch | Whether any measurement taken mid-dispatch is meaningful; `pdlc-review-convergence` AC-4.1 avoids the question by measuring only at round boundaries |

Optionally also: **MR-3**, whether a review-loop phase in practice runs its rounds inside one workflow
invocation or across several (raised as a Measurement Required item on `pdlc-review-convergence`
round 1). It sizes, but does not change, that REQ's durability decisions.

## 3. Deliverable shape

A spike: an instrumented throwaway run, its raw observations, and a short findings document recording
each fact with the evidence that settled it. The output is a **measurement**, not a mechanism — no
production code need change for this feature to be done.

## 4. Status

Unspecified. The operator authors §5 (acceptance criteria) when this is scheduled. Until then this
file is the binding surface DC-08 requires and nothing more.
