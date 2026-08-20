# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation, TSPEC)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (bytes unchanged since v4, sha256:85888c03…)
**Upstream re-read:** TSPEC `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (sha256:f629d29d…, v0.7)
**Date:** 2026-08-20
**Iteration:** 5 (upstream-cascade confirmation — TSPEC moved, DECISIONS did not)

## Context

DECISIONS' own bytes have not moved since v4 (`APPROVAL-HASH: sha256:85888c03…`, reviewed commit
`82bd5869`). What moved is **TSPEC**. v4 recorded `UPSTREAM-STATE: TSPEC sha256:eff5a19b…` — commit
`ccc739d1`, TSPEC **v0.6**. HEAD is sha256:f629d29d… — commit `bfe58851`, TSPEC **v0.7**. Six
commits landed on the path in between:

| Commits | Substance |
|---|---|
| `e33425a6` | Header re-grounded: Upstream row moves FSPEC v0.9 → **v0.12**, version 0.6 → **0.7**, and a v0.7 erratum block is added recording "no behavioural change" |
| `cb4dae90`, `35dc817f` | **ERR-7 CLOSED.** §A.2 stops routing the `docType` conjunct as a divergence from FSPEC `BR-1` and states it as an implementation *of* `BR-1`'s two-conjunct rule; `BR-11`'s complement is restated as "outside `BR-1`'s rule" rather than "non-authoring". **ERR-3 CLOSED** on FSPEC v0.11 dropping the corpus enumeration from `BR-15`'s expected read set |
| `2c8b880c` | §D.1's four domain-membership tests are scoped to **non-`null`** values (`v === null \|\| catalogue.includes(v)`), because `null` is `corpusOutcome`'s healthy value; `LEARNINGS_CORPUS_OUTCOMES`' set-equality test is explicitly unchanged |
| `4fe44ecb`, `dfd8c1ff`, `bfe58851` | DEC-DOC-01 de-anchoring: P-2a, P-2b, P-10, ERR-2 and §A.2's Phase CR citation move from `file:line` to symbol/call-shape citations. No claim changes |

The confirmation question is not "did the items land" — they did — but whether DECISIONS is still a
faithful compression of TSPEC **as it now stands** (DEC-ERR-03). I re-read every TSPEC section
DECISIONS cites by id or paraphrases, at HEAD: §A.2, §D.1, §D.2, §I.3, §T.5/§T.6, the ground-truth
table `P-1`…`P-12`, the divergence table, `OQ.2`, and `ERR-2`/`ERR-3`/`ERR-4`/`ERR-6`/`ERR-7`.
I did not re-read DECISIONS end to end and did not revisit a settled decision.

Two structural facts frame everything below. First, **this is the first cascade confirmation for
DECISIONS whose trigger is TSPEC** — v3 and v4 were FSPEC cascades, and TSPEC's state was recorded
in their `UPSTREAM-STATE` trailers but not re-derived. So the drift this round surfaces is mostly
**inherited**: it was already present in the pre-round TSPEC bytes (`eff5a19b`, v0.6) and this
round's six commits did not create it. That provenance is not a technicality — it is what keeps the
round non-gating and routes the fixes back to DECISIONS' own revision loop. Second, the direction of
every delta in the table above is **toward** this document: ERR-7's closure makes the two-conjunct
gate `DEC-LI-03` decided the upstream rule rather than a divergence from it, and the de-anchoring
commits move TSPEC to the same symbol-citation convention DECISIONS' own preamble already declares.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Recommendation

## Verdict
