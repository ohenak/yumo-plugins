---
feature: pdlc-review-convergence-calibration
ready: false
depends-on: [pdlc-rcv-budget-stop]
---

# REQ — pdlc-review-convergence-calibration

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` — R-2, N-2, AC-2.4, AC-2.6 |
| Downstream | `FSPEC-pdlc-review-convergence-calibration.md` |
| Cross-Reviews | *(none yet — this is a stub)* |
| LEARNINGS | `docs/pdlc-review-convergence-calibration/LEARNINGS-pdlc-review-convergence-calibration.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | stub | Claude + operator | 0.1 | 2026-07-31 |

> **This is a successor stub, not a specified feature.** It exists so that
> `pdlc-review-convergence`'s deferral of cross-panel count comparability is **bound to a named
> successor REQ file** as DC-08 requires, rather than to prose. It is `ready: false` and is not
> queue-eligible until an operator specifies it and sets `ready: true`.

## 1. Problem (inherited)

`pdlc-review-convergence` AC-2.4 declines to compare the blocking counts of two rounds whose panel
shapes differ: a sum over two reviewers and a sum over one are not the same measurement, and any
normalisation between them would be a guess taken without evidence (N-2). The consequence, recorded as
that REQ's R-2, is that the fixed-point rule cannot fire across the round-1-to-round-2 boundary in the
target regime — the boundary where a plateau is most likely to first be visible.

That decision was correct **at the time it was taken**, because no real runs of the new panel shape
existed to calibrate a normalisation against. Once such runs exist, the decision is re-openable on
evidence rather than on judgement.

## 2. What this feature would decide

| # | Question | Evidence needed |
|---|---|---|
| Q-1 | Is a verifier round's blocking count systematically related to a dual round's on the same document? | The per-round tables AC-4.7 emits, across ≥ 5 completed review-loop phases under the new panel shape |
| Q-2 | If so, is the relationship stable enough to normalise, or only stable enough to bound? | Same corpus |
| Q-3 | Should AC-2.4's unequal-panel-shape non-comparison be replaced, narrowed, or left as is? | Q-1, Q-2 |
| Q-4 | Does the fixed-point test need **finding identity**, not just count? A non-decreasing count can hide complete turnover — every prior finding closed, every new one raised against new text — which AC-2.1 reads as a plateau and AC-4.2 simultaneously classifies as `new-mechanism`. Observed on the parent REQ's own Phase R: counts 10, 5, 5, 5 with zero findings carried into the last round (parent R-9, SE v4 G-06). | The same corpus, plus the cross-review files themselves — deciding this needs a findings-table grammar the parent's N-3 declines to introduce, so the cost of that grammar is part of the question |

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | `pdlc-review-convergence` shipped | Its AC-4.7 per-round report table present in `orchestrate-dev` at HEAD | Must hold before authoring — this feature is stated over that table's output |
| **BL-02** | A corpus of completed phases under the new panel shape | ≥ 5 phases' run reports retained | Must hold before authoring — without it this feature repeats the guess it exists to replace |

## 4. Status

Unspecified. The operator authors §5 (acceptance criteria) when BL-02 is satisfied. Until then this
file is the binding surface DC-08 requires and nothing more.
