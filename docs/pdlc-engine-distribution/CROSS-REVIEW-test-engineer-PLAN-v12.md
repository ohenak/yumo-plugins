# Cross-Review: test-engineer — PLAN (delta re-review, round 12)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.17)
**Date:** 2026-08-16
**Iteration:** 12
**Scope:** Delta re-review, v0.15 → v0.17. Decision freeze: only a defect the delta introduced, or a load-bearing claim false at HEAD, blocks. Not a whole-document re-review.

## 1. What changed

Since `1eea225f` (the commit v11 reviewed), six commits touch this file; `git diff 1eea225f..HEAD -- {plan}` is **12 insertions, 6 deletions** in five hunks.

| Hunk | Change | Class |
|---|---|---|
| `:12` | version cell 0.15 → 0.17, phase P → CR | header |
| `:19` (v0.9 row) | scope clause re-corrected: edited-cell list drops T16's Description | changelog |
| `:23` (v0.12 row) | edit count restated as "three one-passage edits, two Status flips and two changelog corrections" | changelog |
| `:27–28` | new v0.16 and v0.17 rows | changelog |
| `:37` (§2, T50) | item (i) gains the third discriminator arm (`exit 0 ⇒ present ⇒ leg runs, no skip`) | task-table |
| `:45` (§4 rule 4) | new paragraph naming `_tspec-packed-set.mjs`'s owner and co-change obligation | prose |
| `:55–57` (DoD 4) | concession's "this module alone" replaced by a two-module enumeration with re-measured figures | DoD |

Exactly one task-table cell is edited (T50's Description); no `Status`, `Deps`, `Batch`, `Test File` or `Source File` cell moves, and §2.1 and §3 are outside the diff. The two round-10 findings of mine that this round set out to close (v10 F-01, T50's implicit present arm; v10 F-03, v0.12's edit arithmetic) are both addressed. One of the two changelog corrections, however, replaced a true statement with a false one.

## 2. Status of my round-11 findings

| v11 finding | Severity | State at HEAD |
|---|---|---|
| F-01: `4 516 pass` absolute survives in v0.13's row and DoD item 2 | Medium | Open, not addressed this round; carried as a deferral below |
| F-02: v0.13's "59 rows / 59 paths" conflates row count with path count (61 distinct) | Low | Open, deferred |
| F-03: v0.14's replacement `1..747` / `806 pass` pair is itself stale | Low | Open, deferred |

None is a blocker under the freeze, and none was re-opened by the delta.

## 3. What I re-derived at HEAD

**(a) The v0.9 window edited four task-table cells, not three — verified in git.** The v0.9 round is the commit span `59ccddb5..b754075f` on this file (eight commits, `git log --oneline`). Per-commit, the rows whose lines change are: `e3d2d206` → **T01** (Status), `b2d160d1` → **T16** (Description), `054e9180` → **T59**, `b754075f` → **T50**; the other four commits touch no task row. `b2d160d1` is titled "attribute AT-3.8a literal removal to FSPEC v0.3 in all three places (PM round-6 F-04)" — it is v0.9's own item (f), and one of its "three places" *is* T16. Its edit survives at HEAD byte-for-byte: `diff <(git show b2d160d1:{plan} | grep '^| T16') <(grep '^| T16' {plan})` differs only in the Status cell (⬚ → ✅, flipped later in v0.13), and the row at `PLAN:190` still reads "**FSPEC v0.3's erratum round removed the stale literal** — `FSPEC:68-73` … PM round-6 F-04", which is `b2d160d1`'s text and not its predecessor's. So T16's Description was edited **twice**: once in `59ccddb5` (v0.8's window, which PM round-10 F-03 correctly found) and once in `b2d160d1` (v0.9's own window, which PM round-10 F-03 did not look for). Finding F-01 below.

**(b) T50's third arm matches T59's contract.** `:37`'s item (i) now reads `exit non-zero ⇒ absent ⇒ registered skip` / `cannot execute ⇒ unprobeable ⇒ workflow failure` / `exits 0 ⇒ present ⇒ leg runs and records no skip`, and the following sentence names the `absent` and `unprobeable` branches instead of "both branches". That is a three-way partition stated on the cell an implementer transcribes, and it matches T59's assertion set (v0.12(a): no inventory entry names the capability **and** the ran-marker is present — positive, not absence-only). v10 F-01 closed, and closed at the level of the defect.

**(c) §4 rule 4's new paragraph is accurate.** `pdlc/engine/__tests__/_tspec-packed-set.mjs` exists at HEAD (76 lines); `grep -rn _tspec-packed-set pdlc/engine/__tests__/` returns exactly two importers, `packaging.test.js:31` and `publish-channel.test.js:80`, as the paragraph says; it appears in no §3 manifest row, so the bijection rule 7 asserts is unaffected; and the file's own header carries the co-change obligation in the same terms ("Adding, removing or re-classing a member is a SPEC change first … Never this file alone") plus the anti-echo clause the paragraph paraphrases ("never from a directory listing or from `checkPackedSet`'s own refusal message"). The plan-side record is a duplicate of a true header, not a second source.

**(d) DoD item 4's re-measured figures reproduce exactly.** `cd pdlc/engine && npm test -- --experimental-test-coverage` at HEAD: `bin/cli.mjs` 85.98 branch, `lib/provenance.mjs` 100, `lib/resolve-version.mjs` 97.14, `lib/store.mjs` 94.44, `scripts/postinstall.mjs` 100, `scripts/prepack.mjs` 91.67, `scripts/publish-preflight.mjs` 88.61, `scripts/fixture-machine.mjs` 88.57 — all eight above the 85 % branch floor, every figure digit-identical to the document. Function coverage likewise: `fixture-machine` 40.74, `publish-preflight` **63.33**, and the six remaining modules at 88.24 (cli) or 100, so "the remaining six meet **both** measures" is true as stated. v0.16's routed-erratum premise also reproduces: `bin/pdlc.mjs` reads **100 % branch / 50 % functions**, not round 4's 66.67 %.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | **The v0.9 row's re-corrected scope clause is false at HEAD, and the delta made it false.** `:19` now reads "the task-table cells edited are **T59's and T50's Descriptions, and T01's Status**", with item (b) of v0.17 arguing that T16's Description belongs to the v0.8 window because it was edited in `59ccddb5` — "three cells, not four". `59ccddb5` did edit T16, but so did **`b2d160d1`**, which is inside the v0.9 window (`59ccddb5..b754075f`) and is v0.9's own item (f), "the AT-3.8a discharge is attributed to FSPEC v0.3 … in all three places (`:22`, T16, §7)". The same paragraph therefore asserts T16 was not edited in this window and, five items later, describes editing it. The `b2d160d1` text is what T16 carries at HEAD (`PLAN:190`). v0.12's list of four cells was correct; this round replaced a correct scope list with an incorrect one and recorded the replacement as a correction, which is worse than the original slip: the next reviewer who diffs §2 against this row finds a discrepancy that the row now pre-emptively explains away. This clause is load-bearing exactly as the row itself says — "a reader who trusts a changelog row's byte-unchanged claim in order to skip diffing §2 is trusting a scope list that is complete". *Fix:* restore T16's Description to v0.9's edited-cell list (four cells: T16, T59, T50 Descriptions, T01 Status), and record that `59ccddb5` and `b2d160d1` both touched T16, one in each window. | `PLAN:19` (v0.9 row), `PLAN:28` (v0.17 item (b)) |
| F-02 | Low | Local | **DoD item 4's new `publish-preflight.mjs` residue list is a coalesced subset, and does not say so.** `:57` names "`40-46`, `353-370`, `395-414`, `452-549`"; the HEAD run also reports `301-303`, `305-307`, `309-311` and `553-554` uncovered for that module. Every named range is real and the conclusion (function residue is the real-`npm`/network/tag-context drivers) holds, so this is presentation, not fact — and it follows the same abbreviating convention the pre-existing `fixture-machine.mjs` list uses, which likewise omits `387-405` and `641-655`. It reads as an enumeration, though, in an item whose whole edit was about stating an enumeration exactly. *Fix:* mark both lists "principal ranges" or quote them in full. | `PLAN:57` (DoD item 4) |

One High. Nothing else in the delta broke a claim that held at v0.15: T50's third arm, §4 rule 4's new paragraph and all eleven re-measured coverage figures reproduce at HEAD.

## 5. Questions

None. F-01 needs a correction, not a decision.

## 6. Positive Observations

- **T50's item (i) closes v10 F-01 at the level the finding named.** The fix was not to add a sentence about the `present` case somewhere in the plan; it was to put the third arm in the cell an implementer transcribes into the workflow predicate, and then to repair the sentence downstream that said "both branches" now that three exist. That downstream repair is the part that usually gets missed, and it is what stops the cell reading as two arms plus an editorial afterthought.
- **The `_tspec-packed-set.mjs` paragraph records an owner for a file that had none, without inventing a manifest row for it.** The helper arrived as a Phase CR remediation, so it has no batch and no owning task; §3's bijection with §2 would have broken had it been given a row. Naming it in §4 instead, with a co-change rather than a single-writer obligation, is the treatment that fits what it actually is — and I verified the header states the same obligation, so the plan is a second copy of a true thing rather than the only copy.
- **DoD item 4 stopped claiming uniqueness it could not support, and re-measured to prove the new claim.** "This module alone, for a unique reason" became "two modules for one reason", with all eight branch figures re-taken; the six remaining modules are the ones now called hermetic on both measures, and they are. A concession that names its full extent is auditable; one that says "alone" is a trap for the reader who later meets `publish-preflight.mjs` at 63 % functions.
- **Both changelog corrections name the correcting version in place.** v0.12's arithmetic now agrees with its own enumeration, and each fix says which version made it, so the changelog can be read forward without re-diffing. That discipline is exactly why F-01 is visible at all — the row states its claim precisely enough to be checked against git.

## 7. Deferred observations (recorded, not blocking)

DEFERRED: Re-anchor or date-stamp the `4 516 pass` absolute in v0.13's row and DoD item 2, per v0.14's own precedent for the engine half (v11 F-01).
DEFERRED: Reconcile v0.13's manifest check as "59 rows / 61 distinct paths" (v11 F-02).
DEFERRED: Date-stamp v0.14's replacement `1..747` / `806 pass` pair (v11 F-03).
DEFERRED: T09's ignore-direction notice text is asserted against a re-derived `message(id, params)` call in `plugin-root-notice.test.js` (v10 F-02, implementation-side).
DEFERRED: No counter covers the deletion gap the skipped-block convention opens; item 17's per-file `# pass` floor is the named instrument, recorded as follow-on rather than scheduled (v9/v10/v11).

## 8. Summary

The round set out to close two of my open findings and one of PM's, and it closed all three at the level of the defect: T50 now states its discriminator as a partition, v0.12's arithmetic agrees with its own enumeration, and — separately — §4 records the shared helper's owner and DoD item 4 states its coverage concession over the two modules that actually carry it. Eleven measured figures reproduce at HEAD to the digit.

The third correction went the wrong way. PM round-10 F-03 found one commit editing T16 in v0.8's window and inferred T16 was not in v0.9's; git shows a second commit, `b2d160d1`, editing T16 inside v0.9's window — and it is v0.9's own item (f), sitting five items below the clause that now denies it. That is a defect this delta introduced into a claim reviewers use to decide whether to diff §2, so it blocks under the freeze on both grounds: delta-introduced, and false against the repository at HEAD. One clause restores it.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
