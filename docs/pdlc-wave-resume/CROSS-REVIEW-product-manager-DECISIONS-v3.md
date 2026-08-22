# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3 (upstream-cascade confirmation, round 3)
**Scope:** Upstream-cascade confirmation. DECISIONS' own bytes are unchanged since my v2 approval
(`sha256:37b3684d…`, matching the `APPROVAL-HASH` recorded there). TSPEC moved underneath it. The
single question answered here: is DECISIONS still a faithful compression of TSPEC **as TSPEC now
stands**? Product lens only.

## Context

**What moved.** My v2 approval of DECISIONS recorded `UPSTREAM-STATE: TSPEC sha256:3cd713c0…`,
which is TSPEC as of commit `0c70e900` ("TSPEC §2.2/§2.3/§3.2 — outcome-qualified lazy-probe").
TSPEC at HEAD is `sha256:458e9ec6…`, commit `b4a628b8`. The erratum round is therefore the range
`0c70e900..b4a628b8` — four commits, 26 insertions and 7 deletions in one file. REQ
(`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) match the hashes my v2 approval pinned; neither
moved, so nothing in this confirmation concerns them.

**What DECISIONS did not do.** `shasum -a 256` over `DECISIONS-pdlc-wave-resume.md` at HEAD returns
`37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46` — byte-identical to the
`APPROVAL-HASH` in my v2 cross-review. The document under review has not been touched. Every
finding below is about DECISIONS' *fidelity to text that changed underneath it*, not about a new
edit to DECISIONS.

**The five substantive upstream edits, and the DECISIONS material each one bears on:**

| # | TSPEC edit (`0c70e900..b4a628b8`) | DECISIONS material that leans on it |
|---|---|---|
| 1 | §3.1 "Why codes and not strings": **four** of the seven reasons interpolate → **three**, carrying **four** interpolated values | O-8 (`:200`–`:207`), DEC-WVR-06 Context (`:359`–`:360`) |
| 2 | §2.4: announcement catalogue **closed by rule**; the excluded invalid-`startWave` notice named in its own table with its exclusion reason | O-5 (`:139`–`:169`), DEC-WVR-03 Consequences row |
| 3 | §6.1 DEC-WVR-02 alternative (b): rejection re-grounded — extraction adds a `main()` parameter and one more adapter binding, **not a host capability** | O-3 (`:91`–`:105`), DEC-WVR-02 Alternatives (`:267`–`:269`) |
| 4 | §6.4 RT-1: `orchestrate-dev.js` is the largest tracked **source module** (734,711 B) and the second-largest tracked file, behind generated `dist/pdlc-cli.mjs` (738,924 B) | Context's measured-surface table, largest-file row (`:44`) |
| 5 | §3.2: duplicated clause ("on the decision on the decision") removed | Nothing in DECISIONS quotes that sentence |

**The shape of the answer.** Edits 3, 4 and 5 move TSPEC *toward* DECISIONS: on the seam-versus-
capability distinction and on the file-size ranking, DECISIONS was already the more careful of the
two documents, and this round brought its upstream into line. Edits 1 and 2 also land the substance
DECISIONS argued for — but they land it in a way DECISIONS could not anticipate, because DECISIONS
does not merely *state* the corrected facts, it states them **alongside a claim about what TSPEC
says**. Those two claims are the whole of this confirmation's findings: they are quotations of and
assertions about upstream text that upstream no longer contains.

## Options Considered

Not the document's options — mine. A cascade confirmation has a narrow catalogue of verdicts, and
naming the ones I rejected is what makes the one I chose auditable.

**(a) Confirm on item-landing alone.** The routed items all landed: §3.1 says three, §2.4 closes by
rule, §6.1 (b) says seam-not-capability, RT-1 gives both file sizes. If the bar were "did the
erratum land", this would be a clean re-approval with no findings. Rejected — DEC-ERR-03 is explicit
that landing is necessary, not sufficient, and the bar is whether *this* document is still a
faithful compression of upstream **at its current version**. Two of DECISIONS' sentences are now
false as statements about TSPEC precisely *because* the items landed. Confirming on item-landing
would ratify a document that misdescribes its own upstream, and would do it in the one round
designed to catch exactly that.

**(b) Raise the two stale erratum notes as High and halt.** Both sentences make an assertion about
upstream that is now untrue, and one of them puts a verbatim quotation in TSPEC's mouth
(`TSPEC §3.1 says "four of the seven reasons interpolate"`) that no longer appears anywhere in the
file — `git grep -n 'four of the seven'` over `docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` at
HEAD returns nothing. Rejected on severity calibration, not on charity. Severity here is measured in
product impact, and I applied three tests:

1. **Does the substantive position change?** No. DECISIONS' own count is *three reasons carrying
   four interpolated values* — which is now, word for word, what §3.1 says. Its own account of the
   §2.4 boundary is the exclusion rule "a notice carries a provenance token iff the resume decision
   emits it about a resolved start point" — which is now, word for word, the rule §2.4 states. On
   the facts that flow downstream into PLAN, PROPERTIES and implementation, DECISIONS and TSPEC are
   in exact agreement. The compression is faithful; the *annotation about the compression* is stale.
2. **Is any P0/P1 requirement narrowed, dropped or reinterpreted?** No. Neither sentence sits in a
   decision clause, a constraint row, a re-evaluation trigger, or a downstream obligation. Both are
   parentheticals in the Options Considered narrative whose grammatical subject is TSPEC, not this
   feature. No acceptance criterion moves if they are struck entirely.
3. **Is this the DEC-ERR-01 shape?** Yes — a delta-confirmation finding that is a false statement in
   a hand-off/bookkeeping section rather than in load-bearing content is demoted, per
   `docs/_decisions/DECISIONS-review-severity-bars.md`. An erratum-tracking parenthetical is
   bookkeeping about the review process by construction: its entire job was to hand an item to the
   round that has now completed.

**(c) Confirm, with the two stale notes recorded as Medium and the two open v2 Lows carried
forward.** Chosen. The defect is real, cheap to fix, and worth naming — a reader of DECISIONS at
HEAD is told that TSPEC contains two defects it does not contain, and told that two errata are
outstanding when both have shipped in TSPEC v1.2. That misdirects the next reader of this document,
which is why it is not a nit. But it gates nothing: no High, so no halt, and the round routes on.

## Decision

## Consequences

## Delta-Confirmation Findings

## Recommendation

## Verdict
