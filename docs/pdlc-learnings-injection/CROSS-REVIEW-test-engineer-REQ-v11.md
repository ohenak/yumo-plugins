# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 11
**Round type:** delta confirmation — **no REQ delta this round**; routed item is TSPEC-scoped
**Scope:** whether the routed item requires any REQ change, whether REQ v0.9's settled reading still holds at HEAD, and re-verification of the upstream text REQ leans on.

## Problem / Context

Round 10 confirmed erratum v0.9 (`a2353445`) and approved the REQ with two Low findings. This
round routes one item, raised by se-author:

> §I.2/§I.4/§OQ.2 still gate the injector on `present && config.enabled && !sectionMalformed`
> and record the shipping default as open (`ERR-4`), while REQ v0.9 AC-5.1a and FSPEC v0.7
> BR-14 have settled it — an absent section is an enabled run on §4.1's defaults, "no second
> gate beyond the key". TSPEC needs re-grounding on REQ v0.9 / FSPEC v0.7 and `OQ.2` closed.

Every section id in that item (`§I.2`, `§I.4`, `§OQ.2`, `ERR-4`) belongs to
`TSPEC-pdlc-learnings-injection.md`, not to the REQ. The item does not ask the REQ for a byte;
it names REQ v0.9 as the *authority that already settled* the question, and asks a downstream
document to be re-grounded on it. DECISIONS v0.2 records exactly this routing at `D-O-9`
("TSPEC closes `OQ.2`, retires `ERR-4`, drops the `present`/`sectionMalformed` conjuncts from
§I.3 and aligns `LEARNINGS_DEFAULTS` with REQ §4.1 … | TSPEC").

Accordingly there is no REQ delta this round: `a2353445` is still the last commit touching the
REQ, `git status` is clean, and the reviewed bytes are byte-identical to those approved at v10.
The question a no-delta round has to answer is therefore not "did the edit land" but the one
DEC-ERR-03 makes standing: **does the REQ still say, at HEAD, the thing the routed item and its
downstream consumers are now leaning on it to say?** That is what I re-derived below, from the
REQ text and from the shipped code and sibling documents it cites — not from the item's summary
of them.

## Goals

- Determine whether the routed item requires any REQ change, or whether the REQ is correctly
  untouched and the obligation sits downstream.
- Re-verify that REQ v0.9 AC-5.1a and §4.1 actually carry the settled reading the item and
  DECISIONS attribute to them, in the current bytes.
- Re-verify every upstream premise the REQ leans on — shipped code claims in §1.2 claim 2 and
  AC-5.1b, the vendoring premise behind C-3/G-6 — at HEAD, per DEC-ERR-03, since a no-delta
  round is exactly when a premise can rot unnoticed.
- Check downstream coherence in the one direction that bears on the REQ's own testability: that
  FSPEC v0.7 BR-14 reads AC-5.1a the same way, so a test author reading either lands on one
  behaviour.
- Carry forward v10's two unresolved Low findings honestly rather than dropping them because
  no edit occurred.

## Non-Goals

- Reviewing TSPEC. `§I.2`, `§I.4`, `§OQ.2` and `ERR-4` are TSPEC sections and the erratum against
  them is a TSPEC round; nothing in this confirmation approves or blocks that work. TE review of
  TSPEC v0.5 is already recorded through v5 and will resume when the erratum lands.
- Re-litigating unchanged REQ sections approved in rounds 1–10. With no delta, the "scan only
  changed sections" rule leaves only the upstream-fidelity sweep DEC-ERR-03 mandates.
- Opening new decisions. The round remains frozen; anything I would have argued for in an open
  round is a `DEFERRED:` line, not a finding.
- TSPEC-altitude mechanics — seam design, fake construction, assertion placement. Findings here
  ask only whether the REQ's black-box observables remain writable as tests today.

## Constraints

- **No-delta round.** A finding can only be `inherited` this round; `delta` is unavailable
  because no bytes changed. With no changed sections, `local` is undefined, so every finding is
  tagged `nonlocal` under the strictest-reading rule.
- **Decision freeze.** A finding blocks only if (i) an edit broke something that worked, or
  (ii) a load-bearing claim contradicts the repository at HEAD. Neither applies below.
- **Rigour bar.** Any open High, old or new, means Needs revision. There is none; v10's two open
  findings are both Low.
- **REQ altitude.** Observable-outcome findings only. The routed item's subject matter — which
  conjuncts a builder gates on — is implementation mechanics and is out of lens for the REQ by
  construction, which is itself part of why the item is correctly addressed to TSPEC.

## Delta disposition

## Routed-item disposition

## Upstream re-verification at HEAD

## Acceptance Criteria

## Findings

## Questions

## Risks

## Obligations

## Positive Observations

## Recommendation

## Verdict
