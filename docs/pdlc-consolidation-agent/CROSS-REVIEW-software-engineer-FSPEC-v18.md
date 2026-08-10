# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 18
**Scope:** Delta confirmation of the erratum round (v11.6 `48631bc6` → v11.7 `b5ab7503`), technical lens only.

## 1. Erratum disposition

All four raised items are **one item** — §5.3's proposal-file table and paragraph read
"AC-1.4's two named causes" while REQ §4b/AC-1.4 enumerates three, and §15's AC-1.4 → AT
map consequently bound no AT to the third. **Absorbed. Confirmed at HEAD `b5ab7503`.**

| Raiser | Item | Disposition |
|---|---|---|
| te-review (both filings), se-author, pm-review | §5.3 says "two named causes"; REQ AC-1.4 has three | **Closed.** §5.3's table gains a row for the all-unreadable `no-op` (`:768`, **none** proposal file) and the paragraph now reads "three named causes" naming all three, with AC-4.3's degraded pass named as the cause AC-1.4 still does not enumerate (`:773-777`) |
| pm-review | §15's AC-1.4 → AT map binds no AT to the third cause | **Closed.** `:2388` now binds **AT-K3b**, a real row at `:2210` |

Verified against the source of truth rather than the commit message:

- **REQ AC-1.4 really does carry three causes** (`REQ-…:224-233`): empty un-consolidated
  set, all-suppressed as duplicates, and "every enumerated basename unreadable so nothing
  was consumed (§4b)". §5.3's three rows are set-equal to that enumeration, in the REQ's
  own order. The fourth row is still AC-4.3's degraded pass, correctly re-labelled from
  "the third row" to "the degraded-promotion row" so the ordinal did not silently shift.
- **AT-K3b's oracle matches REQ §4b's discriminator exactly.** REQ v2.5's header
  (`REQ-…:26-30`) and §4b (`:625-629`) both say the condition mints **no** reason code and
  is discriminated by AC-7.1's consumed-by-basename list being empty *while* the
  un-consolidated set is non-empty. AT-K3b (`:2210`) asserts precisely that pairing, and
  names what it separates the case from (AC-1.4's first cause, where both sets are empty).
  That is a real oracle, not an absence-only one: it fails a pass that reported the
  all-unreadable corpus as a quiet week.
- **No vocabulary movement.** No status, reason code or `Version` pin changed; the
  vocabularies file stays at 1.4, as REQ v2.5 requires. Confirmed by diff.
- **ER-3 is correctly demoted, not deleted** (`:2333`). It records the partial absorption
  and restates the residue — AC-1.4's enumeration is still exhaustive by its own wording
  while AC-4.3 produces a further cause. That residue is genuinely still open in the REQ,
  so keeping the erratum row is right; closing it would have been the error.
- **No residual "two causes" text anywhere.** Grepped the whole document: `two named
  causes`, `two causes`, `both causes` return nothing outside the v11.7 note's own account
  of what was fixed. `:453`, `:1607`, `:1674`, `:1891` all cite *specific* causes by
  ordinal and each one still names the cause it meant — first, first, first, second — so
  the inserted third row did not renumber a live citation.
- **Scope held.** 27 insertions / 9 deletions on a 2,750-line document. No AC, BR, NFR,
  E-row, vocabulary pin, fixture body or other AT changed. Verified from the diff, not
  from the commit message.

## 2. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | The v11.7 note claims both self-locators were "re-derived at HEAD here", but **both re-derivations miss**. §4.2's reclaim table (`:550`) cites "§4.3 `:578-579` orders release after the append"; at HEAD `:578` is the `skipped-cadence` table row and `:579` is blank. The sentence that orders release after the append is at **`:580-581`**. The note's own arithmetic explains it: the header hunk inserted 14 lines, and the v11.6 value `:566` (correct at the parent commit, verified) maps to `:580`, not `:578` — the re-derivation undershot by the two lines the §5.3 hunk had not yet been accounted for. Fix: `:580-581`, or drop to the named role ("§4.3's release-ordering rule"), which does not drift | §4.2 (`:550`) and the header note (`:26`), target §4.3 (`:580-581`) |
| F-02 | Medium | Local | Same class, second site: AT-P7 cites "§15.3's change register (`:2476`)"; at HEAD `:2476` is the table's `|---|---|---|` separator and the `nudge-consolidation.sh` row is at **`:2477`**. The v11.6 value was `:2459`, and this round inserted 18 lines above it (14 header + 3 §5.3 + 1 AT-K3b), so the derived value is `:2477`. Off by one. Fix: `:2477`, or cite the row by path — `§15.3's `nudge-consolidation.sh` row` — which survives every future insertion. Both F-01 and F-02 are the same defect: the two locators were re-derived against the header hunk alone, not against the round's full insertion set | §13.4 AT-P7 (`:2147`) and the header note (`:26`), target §15.3 (`:2477`) |
| F-03 | Medium | Local | AT-K3b's Given — "a corpus whose enumerated basenames are **all unreadable** on disk" — is a read-side input state this FSPEC never specifies. Every "unreadable" rule the document carries is about the **log** file (§3.4 `:448`, E-02 `:2711`, AT-P8 `:2148`) or the **advisory corpus** (§9.2 `:1763`); §19.1's parsed-input table, which is written for totality under DC-01, has **no row** for a LEARNINGS file that enumerates but cannot be read. So the two facts AT-K3b's Given rests on live only in the REQ (`REQ-…:620-624`: the basename stays in the un-consolidated set, and therefore still counts toward AC-1.2's volume trigger, so an all-unreadable corpus re-fires the trigger every tick). §5.3's new row states the first half in a rationale cell ("the basenames stay in the un-consolidated set and the next pass retries them"), which is why this is not gating — the behaviour is decidable from REQ §4b, which AT-K3b cites. But a test author building AT-K3b's fixture has to leave this document to learn what the pass does with the unreadable file, and the recurring-trigger consequence is stated nowhere at either layer's FSPEC level. Fix: one §19.1 E-row (unreadable enumerated LEARNINGS ⇒ stays in the un-consolidated set, omitted from the consumed pair, no error, volume trigger still fires) citing AT-K3b, mirroring how E-02 pairs with AT-P8 | §19.1 (`:2708-2711`), §13.4 AT-K3b (`:2210`) |

No High finding. No previously approved content changed meaning; no prior finding of mine
re-opened.

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | Three rounds running, the self-locator re-derivation has been the round's only defect (v17 F-01/F-02, now F-01/F-02 again). Is there a reason to keep locators as line numbers at all in the four places that point *inside this document*? Named-role pointers ("§4.3's release-ordering rule", "§15.3's `nudge-consolidation.sh` row") are exact, self-maintaining, and would retire the whole class. The external `file:line` anchors are a different matter and should stay numeric |
| Q-02 | Does the all-unreadable corpus re-firing AC-1.2's volume trigger on **every** tick (REQ §4b `:624-625`, which accepts it explicitly) want a stated bound at this layer — a repeated-`no-op` note in the report, say — or is "each pass reporting its terminal row with nothing consumed" the whole intended answer? F-03 asks for the state to be written down; this asks whether the loop it implies is meant to be observable to an operator |

## 4. Positive Observations

- **The erratum was absorbed at the layer that owns it, and nothing else moved.** A
  one-line contradiction could have been fixed by editing the sentence; instead the fix
  carries a table row, an AT, a map binding and an updated erratum record, so the third
  cause is now testable rather than merely mentioned. 27 insertions, zero AC/BR/fixture
  churn.
- **AT-K3b's discriminator is asserted in already-enumerated values.** Minting a reason
  code would have been the easy way to make the state decidable, and it would have breached
  the `Version` 1.4 pin and turned AT-L5 red. Using the empty-consumed / non-empty-set
  *pairing* instead gets the same discrimination for free — and the row names the case it
  separates from, so it is a differential oracle, not an assertion that something is absent.
- **The ordinal shift was handled, not ignored.** Inserting a row into §5.3's table
  renumbered the degraded row, and both citers were found: the paragraph now says
  "the degraded-promotion row" and AT-R7's Given was restated by name rather than by
  ordinal. That is the failure mode this document has been bitten by before, caught here
  before it shipped.
- **ER-3 was demoted rather than closed.** "Partially absorbed" with the residue restated
  is the honest record — the REQ's exhaustiveness claim really is still wrong about AC-4.3,
  and a closed ER-3 would have lost the only standing note of it.

## 5. Carried, non-gating

v17's three findings were out of this erratum's scope and are **not re-raised as new**;
they remain open and are recorded here so the round does not lose them:

- **v17 F-01** — §3.1's `nudge-consolidation.sh` row still anchors the pre-edit file under
  a "File:line at HEAD" heading.
- **v17 F-02** — §15.3's register and AT-P7 still name `:41` / `:28` / `:36-41` / `:43`;
  of AT-P7's six anchors only `:25` survives at HEAD. AT-P7's own drift disclaimer keeps
  this from being an oracle defect.
- **v17 F-03** — §3.1's "Shipped behaviour" column heading no longer matches its own
  consolidate-learnings cell.
- **v17 Q-01** stands unanswered: whether §3.1/§15.3 record pre-feature state permanently
  or track HEAD. It decides whether F-01/F-02 above are re-anchors or a heading change.

## Recommendation

**Approved with minor changes.**

The erratum is absorbed and confirmed at HEAD `b5ab7503`. All four raised filings are one
item, and it is closed at the site it was raised against: §5.3's table now carries three
`no-op` cause rows set-equal to REQ AC-1.4's three, its paragraph reads "three named
causes", and §15's AC-1.4 map binds AT-K3b — a real row whose oracle matches REQ §4b's
stated discriminator exactly and mints no reason code, so the `Version` 1.4 pin holds and
AT-L5 stays exact. ER-3 is demoted to partially-absorbed with its residue restated, which
is the correct disposition since the REQ's exhaustiveness claim is still open against
AC-4.3. No AC, BR, NFR, E-row, fixture or other AT changed; no previously approved content
changed meaning; the ordinal shift the new row caused was chased to both of its citers.

Three non-gating findings. Two are one defect at two sites — the round's self-locators were
re-derived against the header hunk alone rather than the full insertion set, landing
`:578-579` on a table row and `:2476` on a table separator (F-01, F-02); both are two lines
and one line short respectively, and both would be retired permanently by naming the target
instead of numbering it (Q-01). The third is a completeness gap the new AT exposes rather
than creates: AT-K3b's "all unreadable" Given is a corpus-read state §19.1 has no row for,
decidable only from REQ §4b (F-03). No High finding. My v17 approval stands, extended to
`b5ab7503`.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 0}
