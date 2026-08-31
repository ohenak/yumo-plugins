# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7, erratum round 7)
**Date:** 2026-08-31
**Iteration:** 9
**Round type:** Delta confirmation (erratum)

## Overview

**Scope.** Three commits since the anchored v8 approval (`604efad86..HEAD`: `e1315dcdb`,
`fd4b7b3ab`, `bf496d9aa`), +23/-3 lines in three places — §0's new v1.7 changelog entry, the v1.3
changelog row's neutralised `six → seven` narration, and §2.1's `coverageInstrumentation.test.js`
row. I re-read my v8 cross-review, diffed the document over that range, measured the cited code at
HEAD myself rather than trusting the row, and re-grounded on REQ / FSPEC at HEAD per `DEC-ERR-03`.
No other section was read or re-litigated.

**Both dispatched items land, and they land on measurement rather than on assertion.** The two
routed items are the same defect seen from two angles: `pm-review`/`se-author` reported that the
row's *direction* (six → seven) disagreed with HEAD, and `te-review` added that the *shipped title's
printed word* is itself stale, so the honest statement is a title moving six → eight while the set
moves seven → eight. The v1.7 edit states both halves — it separates the measured set size from the
printed word instead of picking one — and it neutralises the superseded v1.3 narration in place so a
historical changelog row cannot be read as a live count. That is the correct resolution of the
sharper `te-review` framing, not just the coarser one.

**Product lens, stated plainly.** This row is a co-change-site entry: it tells the implementer what
must move when `lib/stats.mjs` joins the vendored class. Its product obligation is that the co-change
checklist be *complete and executable* — an implementer following a wrong count either edits the
wrong number or, worse, "corrects" a title to a value that reds the shipped `toEqual`. Nothing in
REQ or FSPEC constrains the c8 include set (measured: zero occurrences of `c8` or `include set` in
either upstream document), so this edit compresses no upstream text and carries no fidelity risk to
any acceptance criterion. It is a faithfulness-to-HEAD correction, and it is now correct.

## Delta verification — each edit against HEAD

I measured every number the edit asserts, from the shipped source, not from the document.

| # | Edit | Claim at v1.7 | Verified at HEAD | Verdict |
|---|---|---|---|---|
| 1 | §2.1 row — `REQUIRED_INCLUDES` size | holds **four** entries, the third and fourth being `build-runtime.mjs` and `scripts/check-wave-resume-delta-coverage.mjs` (the latter per `CODE_REVIEW v1 §1-1`) | `coverageInstrumentation.test.js:37-46` — four entries, in exactly that order, the fourth carrying a `CODE_REVIEW v1 §1-1` comment | **Correct**, including the provenance attribution |
| 2 | §2.1 row — measured set size today | literal spreads `REQUIRED_INCLUDES`, then `CAPTURE_SCRIPT_INCLUDE`, then the two `lib/` modules: `4 + 1 + 2` = **seven** | The test body spreads exactly that; and the *shipped artifact* `pdlc/workflows/package.json` → `c8.include` is a **seven**-element array matching it member-for-member and position-for-position | **Correct** — and confirmed against the artifact, not only the spec literal |
| 3 | §2.1 row — the title is stale at HEAD | shipped title still reads "the include set is exactly the **six** modules the feature owns" | `coverageInstrumentation.test.js:264`, verbatim | **Correct**, quoted verbatim |
| 4 | §2.1 row — the comment is stale too | adjacent comment still calls the literal six-member and `REQUIRED_INCLUDES` three-entry | `:260-261` — "The six-member literal is REQUIRED_INCLUDES' three entries, CAPTURE_SCRIPT_INCLUDE, and the two lib/ modules" | **Correct** — this is the half only `te-review` had named; it is now carried |
| 5 | §2.1 row — the move this feature makes | set **seven → eight**; printed word **six → eight**; comment restated as four entries + `CAPTURE_SCRIPT_INCLUDE` + three `lib/` modules | Adding `lib/stats.mjs` gives `4 + 1 + 3` = 8. Both statements follow, and the arithmetic restatement is internally consistent with claim 1 | **Correct** |
| 6 | §2.1 row — "neither carries an assertion" | title and comment are non-asserting; corrected for the same reason as the `learningsPremises.test.js` row's title | The assertion is the `toEqual` over the literal; the title string and comment bind nothing. The test is **live, not skipped** at HEAD, and passes today *because* the title is decorative | **Correct**, and load-bearing: it is why the stale title has survived |
| 7 | v1.3 changelog row neutralised | the number is removed so the row cannot read as a live claim; the row is left as the record of what v1.3 wrote | `TSPEC:114-115` — row body now reads "names P9-02's test title as a co-change site, no assertion affected", with an italic parenthetical quoting the old `six → seven` and marking it wrong on HEAD's measurement, corrected at v1.7 | **Correct** — quoting a superseded number while explicitly voiding it is the right treatment; it preserves the audit trail without leaving a live count |
| 8 | v1.7 changelog — blast radius | "no other count in this document moves — §2.1 still derives **ten** co-change sites, and the packed and copied vendoring classes are untouched" | §2.1 preamble, §1 (`:189`), §7.3 (`:243`) and RK-1 (`:1252`) all still carry **ten**; the copied class (4 → 5) and packed class (5 → 6) rows at `:260-261` are byte-unchanged. The c8 row was already one of the ten, so correcting a number *inside* a row cannot move the site count | **Correct** |
| 9 | Residual stale narration | none left | `grep "six → seven"` returns exactly two hits: the v1.7 changelog describing the correction, and the voided v1.3 parenthetical. No live claim survives | **Clean** |
| 10 | §8.3 placement | not added to §8.3 | §8.3 is scoped "Upstream errata — not folded into this document's verdict". This defect was this TSPEC's own misreading of in-repo code, not an upstream disagreement | **Correctly omitted** — adding it there would have miscategorised a self-inflicted erratum as an FSPEC one |

**Nothing previously approved is disturbed.** The diff touches no type, signature, exit code, oracle,
code sketch, behavioural claim or acceptance mapping. The three changed regions are one new changelog
paragraph, one voided historical clause, and one table cell.

## Upstream re-grounding (DEC-ERR-03)

The dispatch list is necessary, not sufficient: I re-checked upstream at HEAD independently of it.

**Upstream did not move.** The v1.7 changelog attests that REQ `sha256:5f3e8051…` and FSPEC
`sha256:c7d2c832…` are the same documents v1.6 absorbed (FSPEC v1.7 / REQ v1.6). Measured at HEAD:

- `REQ-pdlc-stats.md` → `5f3e80519b982f29ab0b6dad30fa776b4be4b2d34085b235ad755890064ed9f8`, header version **1.6**
- `FSPEC-pdlc-stats.md` → `c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d`, header version **1.7**

Both match the attested prefixes and both match the versions v1.6 grounded on, so the claim "no
upstream decision is absorbed this round" is true rather than assumed. No new `BR-`, `E-` or `AC-`
row and no vocabulary rename entered upstream that v1.6 did not already carry.

**Does the TSPEC still faithfully compress what upstream now says?** For the region this round
touched, the question resolves cleanly: upstream says *nothing* about coverage instrumentation. `c8`
and "include set" appear **zero** times in both REQ and FSPEC. The c8 include array is an in-repo
co-change consequence of `lib/stats.mjs` joining the vendored workflow-module class, derived by
§2.1's sweep, not a compression of any upstream clause. There is therefore no upstream text this row
can have drifted from, and no acceptance criterion whose meaning this edit could narrow, broaden or
re-trigger.

**The upstream claims the surrounding rows still lean on were spot-checked and hold.** §2.1's
sibling-feature rows still cite `docs/completed/pdlc-engine-distribution/` FSPEC §5.2's per-class
count five → six and TSPEC §5.4's `PK-26`, unchanged by this diff; §8.3's one open upstream erratum
(FSPEC BR-26/EC-10's absent feature-recognition predicate) still stands and is untouched, so RK-5's
provisional-predicate framing at `:853` and `:1286` remains accurate. My v8 findings were both closed
at that round and nothing in this diff reopens either.

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
