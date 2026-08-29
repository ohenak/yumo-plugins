# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (own bytes unchanged since v4 approval)
**Upstream changed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.7 → v1.8, sha256:3eb52debcd13aa37913322e7855628a9b237af278581e6773f48ceb1cfd72cba)
**Date:** 2026-08-28
**Iteration:** 5 (upstream-cascade confirmation, not a re-review)

## Scope of this confirmation

I approved TSPEC at v4 ("Approved with minor changes", 0 High / 1 Medium / 1 Low) against
`UPSTREAM-STATE: REQ sha256:c18b7e88…`. That REQ no longer exists: an erratum round moved it to
v1.8. TSPEC's own bytes have not changed. The single question here is whether TSPEC is still a
faithful compression of the REQ **as it now stands** — not whether the routed items landed.

They did land. That is necessary and not sufficient, and in this case it is the reason the answer is
no: the two errata TSPEC itself raised (§9.2, ERR-1 and ERR-2) were both **accepted upstream**, and
ERR-2 was accepted with the value TSPEC recommended — `maxBytes` **12500**. TSPEC anticipated the
number in one paragraph (§3.6:472–474) while the rest of the document — its type comments, its
config example, its shipped-default oracle, its headroom argument, its AT-01 rationale and its
assumption recital — is still written at **8000**. A spec that recommends a change upstream inherits
the duty to be correct once the change is taken; nine sites now cite a REQ that says something
else.

I re-read only: my v4 cross-review, the REQ diff `bdd9e1d1..b5fd4dd3`, Baseline v1.2's new §8
(`M-7a`–`M-7e`), and the TSPEC sections that lean on C-5/A-1/R-5 — §3.6, §4.1, §5.3, §7.3, §7.5's
AT-01 note, §9.2, §9.3 T-2, §9.4. I did not re-litigate anything else.

## Upstream delta

Four commits (`efbf3dad9`, `4e197abe5`, `0756cefed`, `273d0ce00`), +19 −11 lines in the REQ, plus
Baseline v1.1 → **v1.2**. Three substantive movements:

| # | REQ change | TSPEC's exposure |
|---|---|---|
| 1 | C-5 retypes both thresholds `positive integer` → **`non-negative integer`**, stating `0` is a valid admits-nothing value | TSPEC §4.1 already **implements** non-negative — correct — but §4.1:512–514 and §9.2 ERR-1 still describe it as a *divergence from* the REQ that is *raised upstream*. The divergence is gone |
| 2 | C-5's `maxBytes` default `8000` → **`12500`**, derived from Baseline v1.2's new `M-7b` (9,296 substance bytes over the 63-record worst standing case) and `M-7c` (12,500 clears it by 3,204 ≈ 50 bytes/record of framing) | Load-bearing. §3.6's binding argument, §7.3's D-10 assertion prose, §7.5's AT-01 note, §4.1's type comment and §5.3's config example all compute from 8000 |
| 3 | R-5 and A-1 **retire the unmeasured-analogy claim**: A-1 now reads "Both defaults derive from measurements … `maxBytes` (12500) from `M-7b`/`M-7c`"; R-5 is re-aimed at the *growth model* (`M-6d`, `M-7d`) rather than at measurement | TSPEC §9.4 recites the retired sentence verbatim as "carried from FSPEC §7 **unchanged**", and TSPEC carries R-5's new growth risk nowhere |

The REQ's own erratum note scopes the cascade: *"FSPEC §3.3's recital of the default cascades;
nothing else moves."* That is true of the FSPEC. It is not true of the TSPEC, which is where the
default is turned into arithmetic and then into oracles — and arithmetic does not cascade by
citation, it has to be re-executed.

## Arithmetic re-executed at the new default

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
