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

## Questions

## Positive Observations

## Recommendation

## Verdict
