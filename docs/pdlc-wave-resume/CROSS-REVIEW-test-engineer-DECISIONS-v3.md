# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md (v1.1, bytes unchanged)
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** upstream-cascade confirmation — does DECISIONS still hold as approved against TSPEC v1.2 at HEAD? Not a re-review of DECISIONS.

## Context

My approval of DECISIONS v1.1 (`CROSS-REVIEW-test-engineer-DECISIONS-v2.md`, *Approved with minor
changes*, 0 High / 2 Medium / 2 Low) was recorded against `REVIEWED-COMMIT: 020b74a0` with
`UPSTREAM-STATE: TSPEC sha256:3cd713c0…`. TSPEC is now `sha256:458e9ec6…` (v1.2). REQ
(`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) are byte-identical to the versions my approval
was taken against, so this confirmation is entirely about the TSPEC delta.

**The delta, measured rather than described.** `git diff 0c70e900..b4a628b8 --
docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` is 26 insertions / 7 deletions across five hunks:

| TSPEC hunk | What changed | Relationship to my v2 review |
|---|---|---|
| §2.4 (new block after the announcement table) | The catalogue is closed **by rule** — *a notice carries a provenance token iff the resume decision emits it about a resolved start point* — with a one-row table naming the excluded notice (invalid `implementation.startWave`) and its exclusion reason, and the statement that the exclusion is what holds the changed-assertion count at three. | This is **erratum 1 of the two I routed in v2**, landed. |
| §3.1 ("Why codes and not strings") | "Four of the seven reasons interpolate" → "**Three** of the seven … `feature-mismatch`, `head-unreachable`, `over-count` … carrying four interpolated values between them". | **Erratum 2 of the two I routed in v2**, landed, and landed in the exact form DECISIONS O-8 already carried. |
| §6.1 DEC-WVR-06 row | Same off-by-one corrected in the rejected-alternative rationale ("three of the seven … four values in total, §3.1"). | Consequential to erratum 2. |
| §6.1 DEC-WVR-02 alternative (b) | "adds a `main()` parameter and a **runtime capability**" → "the probe already runs through the existing `_git` seam … so extraction would add a `main()` parameter and one more adapter binding, **not a host capability** … the cost is plumbing, not capability". | Routed by SE, not by me. Moves TSPEC onto the position DECISIONS O-3 already held. |
| §6.4 RT-1; §3.2 | `orchestrate-dev.js` restated as the largest tracked *source module* (734,711 B) and second-largest tracked file behind generated `dist/pdlc-cli.mjs` (738,924 B); one duplicated clause (`"on the decision on the decision"`) removed. | RT-1 is the correction of my v1 F-04 as it lands upstream; the §3.2 fix is cosmetic. |

**What I checked, beyond the item list (DEC-ERR-03).** The items landing is necessary, not
sufficient. I re-read every TSPEC passage DECISIONS leans on, at v1.2, and compared it to what
DECISIONS says about it: §2.4's announcement table and its three-changed-assertion subsection (cited
by DEC-WVR-03 and by O-5), §3.1's frozen catalogues (cited by O-8 and DEC-WVR-06), §3.4's seam table
and its "the diff adds no parameter to `main()`" discharge of REQ C-3 (cited twice — O-3 and
DEC-WVR-02), §6.1's decision ids (cited for the shared-id convention), §6.4 RT-1/RT-2/RT-6 (cited in
Risks), and OB-F1/OB-F4 (cited in the open table). Four of those six citations are now *more*
faithful than they were at my approval, because the erratum moved TSPEC onto DECISIONS' side of two
disputes. The two that regressed are the two places where DECISIONS quotes the **old** TSPEC text in
order to raise the erratum — those raises are now false statements about upstream, and they are this
confirmation's findings.

## Options Considered

_(pending)_

## Decision

_(pending)_

## Consequences

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
