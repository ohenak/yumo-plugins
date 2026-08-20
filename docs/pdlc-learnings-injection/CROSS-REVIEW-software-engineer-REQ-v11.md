# Cross-Review: software-engineer — REQ (delta confirmation, round 11)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.9)
**Date:** 2026-08-19
**Iteration:** 11 (delta over commit `a2353445` → HEAD)

## Context

The orchestrator routed this confirmation as a targeted erratum round over the REQ, naming one
item: TSPEC `§I.2`/`§I.4`/`§OQ.2` still gate the injector on
`present && config.enabled && !sectionMalformed`, while REQ v0.9 `AC-5.1a` and FSPEC v0.7 `BR-14`
have settled the shipping default open; TSPEC needs re-grounding on that settled upstream and
`OQ.2` closed.

Two structural facts shape the answer, and both are worth stating before the findings:

1. **The item is not a REQ item.** `§I.2`, `§I.4` and `§OQ.2` are TSPEC sections
   (`TSPEC:410`, `TSPEC:515`, `TSPEC:1183`). The REQ is the *authority* the item asks TSPEC to
   re-ground on, not the document owing an edit. Nothing in the item, read literally, is a defect
   in the REQ.
2. **The REQ delta this round is empty.** `git diff a2353445 HEAD -- docs/…/REQ-…md` is zero
   bytes. `a2353445` ("REQ erratum v0.9") is still HEAD for this file, and it is exactly the
   commit my v10 reviewed, approved, and anchored (`REVIEWED-COMMIT: a2353445…` in
   `CROSS-REVIEW-software-engineer-REQ-v10.md`).

So the round's question is not "did the edit break anything" — there was no edit. It is the
second question the confirmation contract asks: **is the REQ still a faithful compression of the
upstream it leans on, at that upstream's current version?** That is what I verified.

## Scope of this round

Everything changed on the branch since `a2353445` is documentation, and none of it is the REQ:

| Changed since `a2353445` | Bearing on this confirmation |
|---|---|
| `DECISIONS-pdlc-learnings-injection.md` (new, 664 lines, then revised to v0.2) | **Where the routed item actually landed.** See the item disposition below. |
| `TSPEC-…md` (+112 lines) | Touched, but **not** on the gate. The `present && config.enabled && !sectionMalformed` conjunction survives verbatim at `TSPEC:435`, and `OQ.2` is still open at `TSPEC:1179-1183`. |
| Nine cross-review files (PM/TE on TSPEC v4–v5 and DECISIONS v1–v2, SE/TE on FSPEC v8, REQ v10) | Review artifacts; no upstream the REQ cites. |
| **No source file at all** | Every shipped-code claim the REQ makes is over bytes that have not moved since v10 verified them. |

Because the delta is empty I did not re-read the REQ from scratch and I am not re-litigating any
section approved in rounds 1–10. What I did do, per this round's charter: re-opened each piece of
**upstream** the REQ leans on at its current version and checked the REQ is still a faithful
compression of it.

### Disposition of the routed item

The item **did land — as a decision, not as the TSPEC edit it asks for.** `DEC-LI-07` ("An absent
configuration section is an enabled run, and no configuration mistake disables the feature",
`DECISIONS:…`) decides the gate is `config.enabled` alone, quotes REQ v0.9's settled text
correctly, and carries the five-state table matching FSPEC v0.7 `BR-14`. The residue is tracked in
writing and owned:

- `DECISIONS:437-448` states the divergence plainly — "TSPEC v0.5 still builds the injector on
  `present && config.enabled && !sectionMalformed` (§I.3) … so TSPEC and DECISIONS now disagree in
  writing" — and names the consequence I would otherwise have filed myself: "**PROPERTIES and PLAN
  authors read TSPEC, not this document**, so an `AT-31`/`AT-32` written against §I.3 would be red
  against the correct implementation."
- It raises `DEC-ERR-01` against TSPEC and records `D-O-9` (`DECISIONS:664`): TSPEC closes `OQ.2`,
  retires `ERR-4`, drops the two conjuncts, aligns `LEARNINGS_DEFAULTS` — "**this must land before
  `AT-31`/`AT-32` are authored against §I.3**".
- `D-O-5` (`DECISIONS:660`) is the standing IMPL-side protection until it does.

That is a legitimate landing at the level the item names, with an owner, a gate and a deadline —
not a silent drop. It is **not** discharge: the TSPEC bytes still contradict settled upstream.
Findings F-01 records that, non-gating on the REQ. The REQ itself was owed nothing and correctly
received nothing.

## Constraints re-verified against HEAD

## Findings

## Questions

## Risks

## Obligations

## Positive Observations

## Recommendation

## Verdict
