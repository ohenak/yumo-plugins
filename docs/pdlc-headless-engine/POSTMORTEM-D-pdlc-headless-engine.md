# POSTMORTEM — Phase D, pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `DECISIONS` → **POSTMORTEM-D** |
| Downstream | operator decision; `LEARNINGS-pdlc-headless-engine.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{1,2}.md` (4 files); `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v8.md` (erratum delta, 2 files) |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted — awaiting operator resolution | Claude (se-author) | 1.0 | 2026-08-11 |

RESOLVED: no

## Phase

**Phase D (DECISIONS Creation + Review) converged and was then halted by the erratum protocol.**
The DECISIONS document itself is not in dispute: it converged in round 2 and its approval anchors
are recorded. The halt came afterwards, in the erratum wave Phase D routed upward to `REQ` — and it
came with **both delta-confirmation files on the branch carrying approving verdicts**.

| | |
|---|---|
| Documents | `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.2, **converged**, anchors `sha256:bce4becb…` recorded in `96b8671a`); upstream `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (edited to v0.10 in `6ff9871a`) |
| Branch | `feat-pdlc-headless-engine` |
| Halt reason reported | *ERRATUM-PROTOCOL: the REQ delta confirmation was non-approving: `[se-review]`* |
| Erratum items routed to REQ | (1) *se-author:* no constraint authorises requiring a working interpreter on an unattended host — DEC-ENG-03's startup refusal turns a host that previously ran with the guard silently inert into one that cannot run at all; `grep -in "python\|interpreter"` over REQ returned zero hits. (2) *pm-review:* the REQ must state the precondition — a working Python interpreter of the kind probed at `guard-harvest-before-delete.sh:14-21` is required on the host running the engine unattended |
| Round budget | **not exhausted.** `MAX_REVIEW_ROUNDS` is 5; DECISIONS converged in round 2. The binding bound was `MAX_ERRATUM_ROUNDS_PER_DOC = 1` (`orchestrate-dev.js:5644`) — and even that was not exceeded |
| Erratum window | `96b8671a` (DECISIONS approval anchors) → `6ff9871a` (targeted REQ edit, v0.9 → v0.10, `+31/−28`) → `2d125f41` (se delta confirmation) → `23a1a614` (te delta confirmation) |
| Terminal state | **the halt contradicts the artifacts on the branch.** Both confirmation files end `VERDICT: Approved with minor changes` with `{"high": 0, "medium": 1, "low": 1}`; under the High-only bar (`isPassResult`, `orchestrate-dev.js:5230-5233`) each is a pass. Nothing in the repository records a non-approving se-review |
| Collateral | the phase's **second** erratum — the FSPEC EC-row / rung-placement item DEC-ENG-03 also depends on — was never dispatched. `ERRATUM_DOC_TYPES` orders `REQ` before `FSPEC` (`:5613-5617`), and the REQ halt threw out of the routing loop before FSPEC's round ran. `grep -inE "python|interpreter"` over FSPEC still returns zero hits at HEAD |

## Iterations

## Reviewers

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation
