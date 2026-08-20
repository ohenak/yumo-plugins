# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.4, bytes unchanged)
**Date:** 2026-08-20
**Iteration:** 6
**Mode:** upstream-cascade confirmation — TSPEC moved under a recorded approval

## Overview

My v5 approval of PLAN v0.4 was recorded against TSPEC `sha256:eff5a19b…` (commit `ccc739d1`,
TSPEC v0.6). TSPEC at HEAD is `sha256:f629d29d…` (commit `bfe58851`) — TSPEC v0.7, seven commits
later. PLAN's own bytes have not moved (`REVIEWED-COMMIT: 1f8a90be`, still current for this file).
The one question here: is PLAN v0.4 still a faithful compression of TSPEC as it now stands?

The delta is 66 insertions / 37 deletions across eight loci. Two are cosmetic-by-intent
(DEC-DOC-01 de-anchoring), one is a wording scope fix, and **two retire the routing that PLAN's
§Errata section is built on**:

| TSPEC locus | Before (the version I approved against) | After (HEAD) |
|---|---|---|
| **§Open Questions ERR-7** | Open. "FSPEC BR-1 as written forbids this conjunct … a test written to FSPEC reds a correct implementation" | **CLOSED**, resolved by FSPEC v0.11/v0.12. "no question remains routed to FSPEC on this point" |
| **§Open Questions ERR-3** | Open. "As written, AT-33's set equality cannot hold" | **CLOSED**, resolved by FSPEC v0.11. "AT-33 tracks the correction; nothing in this TSPEC changes" |
| **§A.2** | The `docType` conjunct is "a divergence from BR-1 … routed as ERR-7, not resolved silently in code" | "This is FSPEC BR-1 as it now stands, **not a divergence from it**"; §I.3's predicate "implements BR-1 directly" |
| **§A.2 complement** | "AC-4.3's byte-identity for **non-authoring** dispatches" | "AC-4.3's byte-identity for the dispatches **outside BR-1's rule**" |
| **§D.1** | Each domain test asserts every value it carries is a catalogue member | Each asserts every **non-`null`** value is; the test reads `v === null \|\| catalogue.includes(v)`; the non-`null` scoping is named load-bearing for both corpus-outcome domains |
| **P-2a** | "Four code sites carry `dispatchKind: \"authoring\"`", cited by four line anchors | Same four sites, restated as **three object-literal properties plus one positional argument**, cited by enclosing symbol and call shape per DEC-DOC-01 |
| **P-2b, P-10, §T.6, ERR-2** | Line anchors (`:14551-14556`, `:7306`, `:15167`, `:12915`) | Symbol/call-shape citations per DEC-DOC-01 |

**The headline:** this delta moved TSPEC **toward** this PLAN on every substantive locus. TSPEC's
new P-2a wording is, almost verbatim, the structural key LI-01 already commissions; TSPEC's new
§D.1 non-`null` scoping is, verbatim, what LI-23 and §Traceability already carry (both from TE
F-01). No task row's instruction is falsified, no row is added, split or re-ordered, and PLAN
carries **no raw `file:line` anchors at all**, so the DEC-DOC-01 de-anchoring cannot have stranded
a citation here.

What the delta does falsify is PLAN's **prose about upstream**. §Errata routes two items to FSPEC
"first raised by TSPEC v0.6 (as ERR-3 and ERR-7)" and describes both as still live; TSPEC has now
retired both by name, and describes §A.2's conjunct as implementing BR-1 rather than diverging from
it. PLAN is now the only document in the chain still asserting the divergence. That is the same
family as v5's F-01/F-03 — which PLAN has not yet had a revision pass to absorb — now compounded by
the second upstream. Nothing here is High: no implementer reading PLAN builds anything different.

No finding is High. **PLAN still holds as approved.**

## Batches

_pending_

## Dependencies

_pending_

## Verification

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_
