# POSTMORTEM — Phase F — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → **POSTMORTEM-F** |
| Downstream | operator decision; `LEARNINGS-pdlc-headless-engine.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..5}.md`, `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1,2}.md` (14 files) |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (pm-author) | 1.0 | 2026-08-11 |

RESOLVED: no

## Phase

**Phase F — FSPEC authoring and cross-review. The halt is not a review-round exhaustion: both
documents converged. Phase F halted on the ERRATUM-PROTOCOL step that runs *after* convergence —
the delta confirmation of the REQ erratum round.**

| | |
|---|---|
| Documents | `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.1, converged) and its upstream `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.8) |
| Branch | `feat-pdlc-headless-engine` |
| Halt reason as reported | *delta confirmation for the REQ erratum round did not pass — non-approving: `[se-review]`* |
| Round budget | **not exhausted.** `MAX_REVIEW_ROUNDS = 5`; FSPEC converged in 2 rounds. The binding limit was the erratum bound: **one erratum round per upstream document per phase** |
| Erratum window | `765d2909` (FSPEC approval anchors, 01:08) → `afe0351f` (non-approving delta confirmation, 01:19) — **11 minutes** wall clock |
| Terminal state | ten of eleven errata confirmed resolved; one confirmed-but-wrong (`F-25`, High) plus one contradiction it exposed in an unchanged neighbouring row (`F-26`, Medium). No second erratum round is available, so the phase halted |

The distinction matters for the fix: nothing here says the specs are unconverged. It says one
factual cell, written *by* the erratum round, states the opposite of what HEAD does.

## Iterations

| Round | Document | Version reviewed | SE verdict | TE verdict | Note |
|---|---|---|---|---|---|
| R1–R4 | REQ | v0.4 → v0.7 | — | — | Phase R; converged. Size discipline (pm-author §5e) moved the measured facts to `docs/_constraints/pdlc-engine-baseline.md` as `M-ENG-06`/`M-ENG-07`/`M-ENG-08`, cited from REQ §1.2a by id |
| F1 | FSPEC | v1.0 | Needs revision (3 High) | Needs revision | `cb3ab14e` answers both |
| F2 | FSPEC | v1.1 | Approved with minor changes `{high:0, medium:2, low:3}` | Approved with minor changes | Converged. Anchors recorded in `765d2909` |
| **E1** | **REQ (erratum)** | **v0.8** | **Needs revision `{high:1, medium:1, low:1}`** | Approved with minor changes `{high:0, medium:2, low:1}` | Delta confirmation of the erratum round — **the halt** |

Eleven errata were routed into E1 (two defects raised independently by both reviewers, nine
distinct edits), landed as four content commits plus the version note:

| Commit | Errata carried |
|---|---|
| `0664b6e6` | AC-1.2(c) dev-path read-set attribution; AC-1.3 `--loop` iteration bound |
| `53f07115` | AC-2.1 rows 2/4/5 named logged-in evidence; `pdlc doctor` surface authority |
| `b707edde` | AC-3.5 dispatchable skill-set equality; AC-4.5 transport identity and report delivery |
| `a10bd21d` | `M-ENG-06` declared total over the ACs (adds AC-2.3, AC-4.4 rows); `M-ENG-08` refusal case narrowed |
| `ba92cb92` | REQ v0.8 change note, §1.2a totality sentence |

Ten confirmed. The eleventh — the `M-ENG-06` totality edit — is where the round failed.

## Reviewers

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation
