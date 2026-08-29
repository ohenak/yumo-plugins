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

Every figure below is recomputed from TSPEC's own measured quantities (§3.6, §4.3's ≤1,200-byte
framing pin) with `maxBytes = 12500` substituted for `8000`. Nothing else changed.

| Quantity | TSPEC says (at 8000) | At C-5's default as it now stands (12500) |
|---|---|---|
| Line allowance `maxBytes − 1200` | 6,800 | **11,300** |
| Headroom above the 41-line project-level set (6,305) | ~495 bytes ≈ three feature lines at mean 183 | **4,995** bytes ≈ **27** feature lines at mean 183, 19 at the largest observed 261 |
| Worst standing case, `M-6b`'s 63-line set (10,859 index + 1,200 framing = 12,059) | exceeds the bound; lines dropped | **fits, with 441 bytes spare** — nothing is dropped |
| AT-01's two dispatches (7,042 and 7,650 index bytes + 1,200) | 8,242 / 8,850 both **exceed** 8,000 ⇒ expected sets unproducible under defaults | 8,242 / 8,850 both **fit** under 12,500 ⇒ the stated reason for the override is falsified |
| §7.3's 141-record whole-fixture build | byte bound binds | still binds, and `maxEntries` 70 binds first at 141 records — **the D-10 oracle itself survives** |

The consequence that matters most is the third row, and it is a reversal, not a drift. §3.6:433 is
headed **"the order is live under shipped defaults, and this section no longer claims otherwise"** —
a heading written to retire an earlier draft's inertness claim that a previous round had already
found and killed. At 12,500 the inertness claim is **true again**: at the Baseline's `Verified at`
commit, no real dispatch — not even the largest, `M-6b`'s 63-record worst standing case — reaches
the bound. The drop loop runs on no production input. The section now asserts the opposite of HEAD,
in a section whose whole purpose is to have stopped asserting the opposite of HEAD.

That is a testing finding, not a prose one, because §3.6's paragraph is what D-10 cites as its
justification (§9.1's D-10 row reproduces "~495 bytes of headroom — about three more promoted
decisions") and what §7.3's shipped-default assertion is built to pin. The pin can survive; its
stated warrant cannot.

One further consequence has to be written down before the next revision, because it would otherwise
be applied as stale advice from my own last round. **My v4 F-01 must be withdrawn, not carried.**
That Medium asked for §7.3's D-10 input to be rebuilt over the largest *reachable* in-scope set —
project-level ∪ `pdlc-headless-engine`, `M-6b`'s 63 lines / 10,859 bytes — instead of the 141-record
super-set, on the grounds that the byte bound binds there too. At 8,000 that was right (10,859 >
6,800). At 12,500 it is **wrong**: 10,859 ≤ 11,300 and 63 ≤ 70, so that build omits nothing,
`omitted[]` is empty under every drop order, and conjunct (3) becomes exactly the vacuous
empty-by-construction assertion D-10's rejected alternative exists to prevent. The 141-record
whole-fixture build is now the *only* build of the three considered across rounds 3–5 that keeps
conjunct (3) falsifiable, and its "which is what a real dispatch gathers" clause — the sentence my
v4 F-01 asked to strike — is the part that should go, on its own, without the input changing.

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
