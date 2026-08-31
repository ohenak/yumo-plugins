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

**The delta resolves the routed items and breaks nothing previously approved. Confirmed.**

Three things carried the confirmation, and all three are checks rather than impressions.

**The structural repair is provably lossless.** I reconstructed `c10c8688d`'s removed and added bytes,
normalised whitespace, and compared: identical. The *Upstream divergence, owed to TSPEC* paragraph now
sits inside K-3's obligation cell, which is where its content always belonged — it qualifies the
obligation, it is not a note beside the table. Nothing in the row's meaning moved, and the row now
carries `same task` as owner and its two-conjunct falsifier text in the fourth cell, matching the
shape of every other K-row. The six rows below it are rows again. This is the repair the finding
asked for, done in the cheapest way that could have been correct.

**The count reconciliation is complete and self-consistent.** The document now says ten in the count
word *and* in every decomposition of it. I checked the three places the number is decomposed and the
four places it is asserted, and they agree with each other and with the site table's ten rows, with
K-1's partition (sites 5 and 7 → K-3; site 6 → K-8; sites 8, 9, 10 → K-9), with K-9's ownership of
`pdlc/README.md`, and with TSPEC §2.1 at HEAD. The one remaining `nine` in live prose is deliberate
and correct: *"nine sites are enforced by CI and one is enforced by attention"* under *Standing costs
accepted*, which is the point that bullet exists to make.

**Fidelity to upstream at HEAD holds.** REQ and FSPEC hash-match their pins exactly, so nothing this
document compresses from them has moved. TSPEC at HEAD carries the same ten-site set including
`pdlc/README.md` and the same "pinned by no oracle" residue (`RK-1`), so the co-change contract PLAN
reads is now one contract across both documents rather than two that partition differently. That was
the product concern behind my v6 High; it stays closed.

**Verdict: Approved with minor changes.** One Low, inherited and nonlocal, owed upstream in TSPEC and
not actionable here. Nothing blocks Phase D.

## Consequences

**For Phase D / PLAN.** Not blocked, and materially better served than at v1.5. A PLAN author reading
v1.5's bytes saw an obligations table that ended at K-3, six obligations rendered as prose, and K-3
with no falsifier column — the input to a mis-sized task list. That is now a nine-row table with a
falsifier cell on every row. Combined with the reconciled ten, PLAN can partition the co-change set
mechanically: ten site-table rows, four K-rows covering them without overlap, one site (`pdlc/README.md`)
flagged twice as having no red behind it.

**For the implementer.** Unchanged from v7 — the purity detector, the array-equality warning on
`c8.include`, and the `MODULE_NAMES`-vs-packed-class mismatch note all survive this round untouched.
The one behavioural risk the document still carries is K-9's third site going green-but-undone, which
the document names rather than hides.

**For upstream (TSPEC).** One erratum stays owed: §2.1's `coverageInstrumentation.test.js` row
(*"six → seven"*, TSPEC `:51`). Two approved documents disagree on a mechanical fact until it lands,
with DECISIONS holding the correct value. The residual product risk is direction-of-travel — the pin
says TSPEC is authoritative, so a later reader could "correct" DECISIONS into agreement with a number
that is wrong. K-3's clause naming the divergence and its direction is the strongest mitigation a
downstream document can apply unilaterally, and it survived this round's rejoin intact.

**For harvest.** One signal from this round looks durable beyond the feature, and I flag it for
`docs/_constraints/DOMAIN-CONSTRAINTS.md` rather than inflating a severity here:

- **A count word and its decompositions drift apart when only the count is routed.** This was my v7
  F-01, and it is now the third round in this document where a total moved and a nearby enumeration of
  that total did not (v1.3's `six → seven`, v1.4's option-B re-pricing, v1.5's `nine → ten`). The
  mechanical form of the lesson: when a routed finding moves a count, the round must sweep every
  decomposition of it, not just the assertion the finding cited. v1.6 closed the instance; the pattern
  is what is worth keeping.

- **A long table cell rewritten in place can silently terminate its table.** K-3's row was split by an
  interleaved paragraph during a *content* edit two rounds earlier, and no review round caught it
  until te-review read the rendered shape. Cheap mechanical guard: after any edit to a markdown table
  row, check that every row in that table carries the same delimiter count. This is `Process` scope —
  it belongs in a review checklist, not in a domain constraint.

**On the stale dispatch pin (carried from my v7 Q-01).** For the second consecutive round the dispatch
cited a TSPEC hash matching no revision on this branch; this round the dispatch omits the hash
entirely. The document handled it correctly both times by re-grounding on HEAD under `DEC-ERR-03`.
Still a pipeline observation rather than a document defect, so it stays a question.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Description |
|----|----------|-----------|----------|----------------|-------------|
| F-01 | Low | inherited | nonlocal | K-3 / `DEC-STATS-01` site table, `coverageInstrumentation.test.js` row | TSPEC §2.1's row still states P9-02's title moves *"six → seven"*. Re-measured at HEAD: `REQUIRED_INCLUDES` holds four entries, so the literal is `4 + 1 + 2` and `c8.include` is seven today; this feature makes it eight. DECISIONS carries the correct arithmetic and books the difference as an erratum owed upstream in **TSPEC**. Not correctable here and not to be matched into agreement. Carried from v6 F-05 / v7 F-02. |

FINDING: Low | inherited | nonlocal | K-3 / DEC-STATS-01 site table, coverageInstrumentation.test.js row | TSPEC section 2.1 still states P9-02's title moves six to seven; re-measured at HEAD, REQUIRED_INCLUDES holds four entries so c8.include is seven today and this feature makes it eight. DECISIONS carries the correct arithmetic and records the divergence; the repair belongs upstream in TSPEC and the document must not be corrected into agreement with a number known to be wrong. Carried from v6 F-05 and v7 F-02.

## Positive Observations

- **The structural repair was verified, not asserted.** I reconstructed the commit's removed and added
  bytes and compared them whitespace-normalised: identical. An edit that rejoins a 2,000-character
  table row is exactly where text quietly goes missing, and this one lost nothing.

- **The paragraph went back where it belonged, not merely inside the row.** The *Upstream divergence*
  text now sits in K-3's obligation cell — it qualifies the obligation. The cheaper fix (drop it below
  the table as a note) would also have rendered, and would have detached a live caveat from the row
  PLAN reads.

- **The count fix reused the copy that was already right.** Both breakdowns now read in the same form
  *Standing costs accepted* had used since v1.5 — five enumerations, four test files, `pdlc/README.md`'s
  prose member list — instead of inventing a third phrasing. Three decompositions of the same number,
  one wording.

- **The changelog was marked, not rewritten.** The v1.4 entry keeps its text and its `file:line` forms
  and gains a superseded-in-part marker with the reason stated: a changelog records the document at
  its own version, and `DEC-DOC-01` governs body citations, not historical entries. That reasoning also
  disposes of my own v7 F-03, and I accept it — rewriting past entries is the bookkeeping churn that
  decision exists to prevent.

- **The carried item is carried honestly.** The v1.6 changelog says in plain terms that the TSPEC
  divergence is *not* matched into agreement, why TSPEC is not edited from this dispatch (approved,
  with an approved PLAN beneath it), and where the repair is owed. Naming an unresolved item and its
  owner is stronger than closing it locally would have been.

- **Upstream was re-grounded before the delta was written.** The document hashed TSPEC and FSPEC at
  HEAD, found the dispatch's TSPEC pin resolving to nothing for the second round running, said so, and
  proceeded under `DEC-ERR-03` rather than failing silently or trusting a dead hash.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Second round running, the dispatch's TSPEC pin (`sha256:512a9fcf…`, and this round no hash at all) matches no revision of TSPEC on this branch, while HEAD is `cb351bb3…`. Where is that hash produced? If an approval anchor can name a version that never existed — rather than an older one that did — the staleness check is not lagging but unresolvable, and the next cascade cannot distinguish "upstream moved" from "pin corrupt". Process question, not a defect in these bytes. |
| Q-02 | K-9 now owns three sites, two with falsifiers and one without. Should PLAN's task for it carry an explicit review checkpoint for the `pdlc/README.md` edit? A green `run.test.js` and `learningsPremises.test.js` reads as "K-9 done" — the partial-co-change shape `RK-1` exists to prevent. Carried unanswered from v7. |

## Positive Observations

## Questions

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:48522bf9e03f6a459ce4c38eb0aa4b8fcb00d6c2d3693c749167af7bc2a4c88e
APPROVAL-HASH-NORMALIZED: sha256:d298b24c3b488e3fa5985ce3a8cf1ed0fc882b151b0c9b7de18fded6f3a9d034
REVIEWED-COMMIT: 7adc9666196cca6357174fcbb513b6a6f597af2f
UPSTREAM-STATE: REQ sha256:60a516fb2ede925b2428dca1bc8e4e61587c52827ea55b9e4965ea57b9a8f1c9
UPSTREAM-STATE: FSPEC sha256:25af3c47c218d8987d258c6bda917cb5fecd21014ec794864c4e7b9a1cafd7f8
UPSTREAM-STATE: TSPEC sha256:512a9fcfd425725363024ec856597da6918d6d376247be2271b2d4af0c0af81f
