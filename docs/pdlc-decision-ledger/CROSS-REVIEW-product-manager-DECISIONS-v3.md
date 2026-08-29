# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.2)
**Date:** 2026-08-28
**Iteration:** 3

Delta re-review. Base commit `b9849cbd7` (the commit carrying my v2); the document moved
across three commits since (`ec3b4f391`, `9cfcba84b`, `3c4b499c4`), 17 insertions / 6 deletions.
Changed surface: the header block (Version 1.1 → 1.2, cross-review glob `v{N}`), one added
paragraph in `## Context`, `DEC-DECLEDGER-14`'s row in `## Decision`, the
`DEC-DECLEDGER-10, DEC-DECLEDGER-12` re-evaluation trigger row, and the fourth Risks-accepted
bullet. I scanned only those hunks for new issues and re-verified my one prior finding at HEAD.
Sections approved in earlier rounds were not re-litigated.

## Prior findings disposition

| Prior | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 — the derived byte figures (11,300 / 441 / 4,995) had no upstream home, and the cited site (TSPEC §3.6) still computes `8000 − 1200 = 6,800`, with nothing warning the reader that the propagation was outstanding | Medium | **Resolved** | The gap I asked to be closed with "one clause" was closed with two, in both places a reader can arrive from. `## Context`'s citation rule now carries an explicit exception paragraph: §3.6 "has not yet taken REQ v1.8 — it is pinned at REQ v1.7 / Baseline v1.1", its *derived* figures are "pre-raise, pending `ERR-2`'s propagation", the *quoted* figures are unaffected "because they are measurements of the corpus rather than of the bound", and the derived 11,300 / 441 / 4,995 "have no upstream home until §3.6 is re-measured". Every one of those claims checks out at HEAD: TSPEC's header pins REQ v1.7 / Baseline **v1.1** (`TSPEC-pdlc-decision-ledger.md:8-12`); §3.6 still computes `8000 − 1200 = 6,800` (`:435`) and still concludes *"the order is live under shipped defaults"* (`:433`); the quoted 6,305 and 10,859 are §3.6's own corpus rows (`:419`, `:422`) and are bound-independent, so they survive the raise unchanged. The quoted/derived split is the right distinction to have drawn — it tells a reader exactly which of this document's numbers a §3.6 re-measurement will and will not move |

The document also closed the High that the test-engineer's v2 raised on the same round's
remediation (DEC-DECLEDGER-14 pointing at `ERR-3`). I re-checked it because it sits inside my
changed surface: TSPEC §9.2 defines `ERR-3` as FSPEC AT-02's retired citation-format clause
(`TSPEC-pdlc-decision-ledger.md:1332`) and `ERR-4` as AT-03's Given contradicting AT-01's frozen
fixture (`:1341`), and D-11 raises the `_readFile`-double decision "at the FSPEC as ERR-4"
(`:1286`). Both sites now read `ERR-4` (Decision row; Risks bullet), and the Risks bullet goes
further than the correction needed by naming what `ERR-3` *is* and stating that no decision here
pairs with it — which is what stops the next reader re-deriving the same mis-pairing.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The new discharge list is stated as complete ("Those five sites are the discharge list") but is a containment, not a set-equality — at least one pre-raise site sits outside it.** The `DEC-DECLEDGER-10, DEC-DECLEDGER-12` trigger row enumerates five §3.6/D-10/§7.3 sites, and each of the five is real at HEAD: §3.6's `8000 − 1200 = 6,800` (`TSPEC-pdlc-decision-ledger.md:435`), its *"~495 bytes of headroom"* (`:436`), its *"the order is live under shipped defaults"* (`:433`), D-10 restating the 6,800-byte allowance in its rejected-alternative clause (`:1285`), and §7.3's *"At 141 records the byte bound binds"* (`:954`). But §4.3's framing-budget rationale also derives from the retired bound — *"§3.6's ~495 bytes of headroom shrink one-for-one with any raise, so the task that writes `DECISION_LEDGER_RULE_TEXT` either fits the budget or re-opens the arithmetic together with ERR-2"* (`:630`) — and it is in none of the five: it is not in §3.6, not D-10, not the §7.3 sentence quoted. Within §7.3 the same is true of *"6,305 index bytes against a 6,800-byte allowance leave nothing to drop"* (`:958`) and *"Under the shipped bound roughly two do (§3.6's ~495 bytes of headroom…)"* (`:964`), which the row's single quoted sentence does not obviously reach. The content is right and the direction is right; the defect is the completeness claim wrapped around it. A TSPEC author discharging `ERR-2` against this list one site at a time lands exactly the failure the row's own first clause warns against — "in one pass, not one figure at a time" — and leaves §4.3 telling the reader the framing pin costs 495 bytes of headroom that no longer exist. Fix is one word plus one site: say the five are the §3.6/D-10/§7.3 sites *and* name §4.3's derived `~495` (or drop "the discharge list" for "the sites in §3.6, D-10 and §7.3", so the row stops promising an enumeration it has not made). | REQ C-5; REQ-DECLEDGER-07 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The Context exception says the derived figures "have no upstream home until §3.6 is re-measured", which is accurate for the 11,300 allowance and its two slacks. But §3.6 already carries the raise's *conclusion* in one place — *"a default of **12,500** admits the worst standing case (10,859 + 1,200 …)"* (`TSPEC-pdlc-decision-ledger.md:472`) — so §3.6 is half-migrated rather than wholly pre-raise. No change wanted here; flagging only in case the discharge list should record that `:472` is the one §3.6 line that already agrees with REQ v1.8 and must *not* be rewritten in the pass. |
| Q-02 | Carried from v2 and still open, non-blocking: DEC-DECLEDGER-13's *"~154-byte mean line"* (`6,305 / 41 = 153.8`) versus §3.6's reported project-level mean of **153** (`TSPEC-pdlc-decision-ledger.md:437`). Both round the same measurement and no conclusion turns on the difference. |

## Positive Observations

- **The fix went to the reader's arrival points, not to the finding's wording.** I asked for a note
  that §3.6's derived figures were pre-raise. The revision put it in `## Context`'s citation rule —
  where a reader learns the "measurements are cited, never restated" convention and would otherwise
  trust §3.6 wholesale — *and* in the re-evaluation trigger, where the person who eventually
  discharges `ERR-2` will be standing. Same defect, two audiences, and the fix is placed for each.
- **The quoted/derived distinction is a better answer than the one I asked for.** My finding asked
  for a warning clause. What landed is a rule: figures *quoted* from §3.6 are corpus measurements
  and are bound-independent (10,859, 6,305), figures *derived* here are bound-dependent and move
  when the bound moves (11,300, 441, 4,995). I verified both halves at `TSPEC:419` and `:422` — the
  quoted rows genuinely have no `maxBytes` term in them. That rule tells a future reader which
  numbers a re-measurement touches without re-doing the analysis, which the warning clause I asked
  for would not have.
- **The outstanding work is stated as checkable rather than as a caveat.** "One such re-measurement
  is outstanding now, and it is checkable rather than general" followed by named, quoted sites is
  the difference between a disclaimer and a work item. Four of the five quotes I spot-checked are
  verbatim at HEAD. F-01 is that this good instinct stopped one site short of the set-equality it
  claimed — not that the instinct is wrong.
- **The `ERR-3` → `ERR-4` correction was made in terms, not by substitution.** The Risks bullet now
  says *why* `ERR-4` is the right pairing (AT-03's fixture mutation, TSPEC's D-11) and what `ERR-3`
  separately is (AT-02's citation-format correction, no decision pairs with it). A one-character
  id fix would have been re-derivable-wrong next round; this is not.
- **The header bumped to v1.2 and the cross-review pointer generalised to `v{N}`.** Small, but it is
  the third round of this document and the pointer had been pinned at `v1` since the first — it now
  names the series rather than one round of it.

## Recommendation

**Approved with minor changes**

My one prior finding is resolved, and resolved at the right altitude — the exception is stated as a
rule about which figures move with the bound, not as a caveat about one paragraph. The
test-engineer's v2 High inside the same changed surface (`ERR-3` → `ERR-4`) is also resolved, and I
independently confirmed the routing against TSPEC §9.2 and D-11 rather than against the document's
own prose. No High finding is open, delta or inherited.

The single Medium is the completeness claim on the new discharge list: the five named sites are all
genuine, but §4.3's derived `~495` (`TSPEC-pdlc-decision-ledger.md:630`) sits outside the
enumeration the row calls "the discharge list". That is a one-line fix in this document and does not
gate the phase; the underlying §3.6 re-measurement is TSPEC's to land under `ERR-2` and is correctly
not taken here.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}

APPROVAL-HASH: sha256:fa39cee9fcab31d7551b39923b3bddd5f33ec028ee89b9ec5c3c42bb7004cd96
APPROVAL-HASH-NORMALIZED: sha256:6cdbba7480df2d0138a9464d188c8c98e3c88f493b5bf10a43270ca0b4c67b37
REVIEWED-COMMIT: 3c4b499c4382bbe679a72a019d504364542bbd28
UPSTREAM-STATE: REQ sha256:d61cbb0d4a5b052b703435a4b488e64ef65293520308ee71927a75ee84f7764a
UPSTREAM-STATE: FSPEC sha256:b32a6623036ddc6a86ccc3396431b1364aeaf36b70745b0d11025765b0711bb1
UPSTREAM-STATE: TSPEC sha256:751e55c9a31fb7f1313f658317b05a2e5f5ce64767305fc8aacf68164b4710a2
