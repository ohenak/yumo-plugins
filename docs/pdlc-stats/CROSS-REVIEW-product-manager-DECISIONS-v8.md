# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, erratum round 7)
**Upstream HEAD:** REQ `60a516fb…` · FSPEC `25af3c47…` · TSPEC `cb351bb3…`
**Date:** 2026-08-31
**Iteration:** 8 (delta confirmation)

## Context

**Delta confirmation, not re-review.** `DECISIONS-pdlc-stats.md` moved v1.5 → v1.6 across four commits
(`c10c8688d`, `0b4729034`, `3b2d38076`, `7adc96661`), answering my v7 *Approved with minor changes*
(0 High / 1 Medium / 2 Low) and te-review's parallel items from the same round. My v7 verdict was
non-gating, so this round was an erratum of housekeeping rather than a repair of a blocking defect.

**What I re-grounded before reading the delta (DEC-ERR-03).** The dispatch pins REQ at
`sha256:60a516fb…` and FSPEC at `sha256:25af3c47…`; I hashed both files at HEAD and both match
byte-for-byte, so neither upstream moved under this document. The dispatch names TSPEC by path with
no hash this round; TSPEC at HEAD is v1.4, `sha256:cb351bb3…`, the same revision v1.5 and v1.6 both
record absorbing. **No upstream decision is owed absorption**, so the raised item list is the whole of
the work available this round, and my confirmation is about whether it landed cleanly.

**What I re-verified mechanically at HEAD**, rather than trusting the changelog's account of itself:

| Claim | How checked | Result |
|---|---|---|
| K-3's row is rejoined and the obligations table is a table again | delimiter count per `^\| K-` row | K-1…K-9 all carry five delimiters; rows 586–594 contiguous, table terminates at the blank line 595 |
| The rejoin lost no cell text | whitespace-normalised diff of `c10c8688d`'s removed vs added bytes | **Identical.** Pure re-flow — no word added, none dropped |
| Both breakdowns now name ten | read *What the sweep found* (:236–243) and *Reversibility: hard* (:450–453) | Both now enumerate five enumerations + four test files + `pdlc/README.md`'s prose member list |
| No stale nine-item breakdown survives elsewhere | grep for `nine` across the body | Remaining hits are historical changelog text or the deliberate *"nine sites are enforced by CI and one by attention"* contrast — correct as written |
| The document's ten agree with upstream's ten | TSPEC §2.1 site table at HEAD (`:194`, `:1163`, `RK-1` at `:1191`) | TSPEC carries `pdlc/README.md` as a site and names it *"pinned by no oracle"*; DECISIONS matches |
| No other table was broken by the edit | scan of every non-fenced table for mixed delimiter counts | None found |

I did **not** re-open `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`, K-1, K-2, K-4
through K-8, the option table, the *decisions do not decide* section, or the standing-cost bullets.
None was touched by this round, and all were approved on their merits at v5–v7.

## Options Considered

Three readings of "did the delta land" were open. The choice decides the verdict, so I state it.

**Reading 1 — the structural repair is cosmetic, so confirm on the count fix alone.** Rejected. K-3's
unterminated row was not a rendering nit: it terminated the obligations table, so K-4 through K-9
rendered as literal text outside it and K-3 itself presented no `Falsified by` column. That column is
what PLAN reads to place its red test. A PLAN author working from the broken bytes had six
obligations with no owner column and one obligation with no falsifier — the exact shape that ships a
task whose "done" signal is nobody's. I checked the repair as a load-bearing fix, not a typo fix,
which is why I verified the rejoin is byte-lossless rather than eyeballing it.

**Reading 2 — the carried-unresolved TSPEC divergence re-opens as gating.** Rejected. The divergence
(TSPEC §2.1 says P9-02's title moves *six → seven*; HEAD measures the include set at seven already, so
this feature moves it *seven → eight*) is real, and I re-measured it again this round rather than
inheriting my own v7 arithmetic. But it is a defect in **TSPEC's bytes**, not in these. DECISIONS
carries the correct number, states the divergence in K-3, and books it as an erratum owed upstream.
Editing TSPEC from this dispatch would put an approved document with an approved PLAN beneath it into
revision that nobody was asked to discharge; matching TSPEC's number would be worse still. Low,
inherited, nonlocal — recorded, not gating, exactly as at v7.

**Reading 3 — confirm the routed items, then ask what the edit introduced or left behind.** Adopted.
This is what DEC-ERR-03 asks for. Against that test the round is clean: all three routed items landed,
the fourth was carried by explicit, reasoned design, and the edit introduced nothing.

**Disposition of the routed items**, checked against current bytes:

| Routed item | Raised by | Status now |
|---|---|---|
| Medium · delta · local — both count breakdowns still enumerate nine, omitting `pdlc/README.md` | pm-review (my v7 F-01) | **Resolved.** *What the sweep found* and *Reversibility: hard* both now name all ten, in the same form *Standing costs accepted* already used |
| High-shaped structural defect — K-3's row unterminated, table dies at K-3 | te-review | **Resolved.** Row rejoined into one five-delimiter line with the *Upstream divergence* paragraph inside its obligation cell; K-4…K-9 are rows again; K-3 presents its falsifier column; **no cell text changed** |
| Low · inherited · nonlocal — v1.4 changelog entry asserts `pdlc/README.md` is *not* a tenth site-table row | te-review | **Resolved as marked, not rewritten.** The entry gains a superseded-in-part marker naming v1.5 as the reversal. Correct treatment — a changelog records the document at its own version |
| Low · inherited · nonlocal — v1.4 changelog entry's raw `file:line` anchors | pm-review (my v7 F-03) | **Resolved by the same marker's reasoning.** `DEC-DOC-01` governs body citations, which v1.5 converted; past changelog entries are mentions of what a round measured, not live pointers. I accept this and do not carry the item |
| Low · inherited · nonlocal — TSPEC §2.1's *six → seven* | pm-review (v6 F-05, v7 F-02) | **Carried unresolved by design.** Owed upstream in TSPEC. Re-measured at HEAD this round; DECISIONS remains the correct one. F-01 below |

## Decision

## Consequences

## Delta-Confirmation Findings

## Positive Observations

## Questions

## Verdict
