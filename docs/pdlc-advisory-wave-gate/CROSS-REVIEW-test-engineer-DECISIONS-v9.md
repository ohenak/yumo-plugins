# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.8)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v8.md` (v1.6)
**Delta reviewed:** `8412569e..HEAD` — five commits, 28 insertions / 158 deletions in DECISIONS
**Date:** 2026-08-19
**Iteration:** 9

## Context

Round 8 left no High finding and two non-blocking ones, both against the three-column sizing block
in `## Consequences`: F-01 (column (3) enumerated twenty where the record's own recipe returns
twenty-two, the two generated `it` titles in `advisoryDriver.test.js` uncounted) and F-02 (the
"four lines above it" locator, sixteen lines off). The author did not patch the two numbers. v1.8
removes the block from this document entirely and relocates it to
`SIZING-pdlc-advisory-wave-gate.md`, a PLAN appendix, keeping only column (1)'s **four** beside the
decisions.

That makes this round's scope unusually narrow and unusually checkable: three questions only. Did
the relocation preserve the content my findings were against, and were those findings fixed in the
new home? Is the one number that stayed behind true at HEAD? And did the removal leave the record
internally consistent — no orphaned reference to a column that no longer lives here. I answered all
three by running greps and a suite, not by reading prose, and I checked the byte-frozen claim about
`DEC-A6-01`…`DEC-A6-04` against the diff rather than trusting it.

## Options Considered

My v8 review closed with a Q-01 that argued the recurring defect was not membership but the presence
of a moving measurement in a stable record, and asked whether the number belonged in the document at
all. PM v8 Q-01 and POSTMORTEM-D §6 reached the same place. Three responses were open: patch the two
counts again (the option four previous rounds took, and the one that produced a finding each time);
replace the integers with the recipe alone; or move the block to a document whose readers expect
measurement. The author took the third, which is the one I would have argued for — and, importantly,
moved it rather than deleting it, so PLAN's batch sizing keeps its evidence instead of inheriting an
unsourced "four".

The residual risk in a relocation is silent loss: content that disappears in the move and is scored
as "resolved" because the finding's anchor no longer exists. That is what I checked first, and it is
why the disposition table below cites the new home's line numbers rather than recording my v8
findings as moot.

## Findings

### Disposition of v8 findings

| v8 finding | Disposition | Evidence re-verified at HEAD |
|---|---|---|
| F-01 (Medium) — column (3) enumerated twenty, recipe returns twenty-two; `advisoryDriver.test.js`'s two generated `it` titles uncounted | **Resolved in the new home, not lost in the move.** Column (3) is now **twenty-five**, and the two titles I named are enumerated explicitly as "the **two generated `it` titles** that restate the same range" | `SIZING-pdlc-advisory-wave-gate.md:198–201` quotes both verbatim; both quotes match the source — `advisoryDriver.test.js:238` (`verifyGate is null; resolved is unreachable on every path … (PROP-GATE-01…05, TSPEC §5.5, §6.5)`) and `:280` (`resolved is reachable only through its declared verifyGate … (PROP-GATE-01…05)`). The `advisoryDriver` sub-count reads "(four)" at `SIZING:195`, consistent with the two comment sites plus these two |
| F-02 (Low) — "four lines above it" is sixteen lines | **Resolved by deletion of the offset, which is what I asked for.** The relocated sentence reads "the registry banner **above it** already reads `PROP-GATE-01…06`" — content anchor kept, positional claim dropped, per `DEC-DOC-01` | `SIZING:197`; source neighbourhood re-read: `advisoryDriver.test.js:214` banner reads `PROP-GATE-01…06`, `:230` banner reads `PROP-GATE-01…05` — the inconsistency the sentence names is still live and still correctly described |

### The one number that stayed here

`## Consequences`' surviving bullet keeps a single count: "The number an implementer must not get
wrong is **four**: those three production constants plus the one test-side literal a gate still
demands (`advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality inside `PROP-SUM-01`)."
Re-derived at HEAD rather than carried over:

- The three production constants exist and all three carry the pre-A6 value —
  `orchestrate-dev.js:1942` (`ENVELOPE_DEFAULTS`, four members), `:1944` (`ADVISORY_DEFAULTS`), and
  `:1951` (`ADVISORY_SEAMS = ["A1" … "A5"]`).
- The test-side literal is **exactly one**. `grep -rn '"A5"\]' pdlc/workflows/__tests__` returns two
  hits: `advisoryRecord.test.js:496`, the cited `PROP-SUM-01` equality, and
  `advisoryDriver.test.js:867`'s `gateExclusivityCases(["A5"])`, which is a per-block seam filter,
  not a set-equality transcription, and does not move at A6. The neighbouring assertion at
  `advisoryRecord.test.js:505` spreads `devModule.ADVISORY_SEAMS` rather than transcribing it, so it
  is derived and correctly outside column (1).

Four is right, and it is the only integer in the document whose staleness would cost an implementer
anything.

### Consistency of the removal

`grep -nE 'column \([123]\)|three-column|twelve|twenty|seven|ten|already-migrated'` over the
document returns only the v1.8 preamble at `:22–30`, the relocation bullet at `:364–375`, and the
"one task" bullet at `:381` — no orphaned cross-reference to a column that now lives elsewhere, and
no surviving count other than "four". The delegation target is real and cited in both directions:
`SIZING-pdlc-advisory-wave-gate.md` exists with columns (1)/(2)/(3), the excluded false positives,
the grep recipe and the `dist/pdlc-cli.mjs` disposition intact, and PLAN v1.6 cites it from inside
`## Overview` (heading at `PLAN:22`; the citation block sits at `:174–187`, with no intervening
heading), which is exactly where this record says the citation is.

The preamble's "`DEC-A6-01`…`DEC-A6-04` stood byte-frozen" claim is also exact: the only line in the
`8412569e..HEAD` DECISIONS diff matching `DEC-A6-0[1-4]` is the new prose sentence making the claim.
No decision entry was touched. "A finding in each of five consecutive review rounds" holds too —
sizing findings appear in both reviewers' files for v4, v5, v6, v7 and v8.

### New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The preamble reintroduces one relocated integer.** `:30` reads "the \"twelve already-migrated sites\" bullet is folded into column (2)". As a description of what moved it is accurate, and twelve does match `SIZING`'s column (2) today — but it is a HEAD measurement sitting in the document whose stated purpose in v1.8 is to hold none, and it will read as a current claim to anyone who does not parse it as a quotation of v1.7's bullet title. The fix is to drop the number from the quotation ("the already-migrated-sites bullet is folded into column (2)"), which loses nothing: no reader needs the old bullet's cardinality to understand the move. Non-blocking, and I would not have filed it against any other document — it is only worth naming because the whole point of v1.8 is that integers with a short shelf life do not live here | `DECISIONS` v1.8 preamble, `:30` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The relocation gave the three totals one home, but PLAN's citing note at `PLAN:174–187` restates all three of them inline — "the **four** gate-demanded edits", "the **twelve** sites already at the post-A6 value", "the **twenty-five** ungated prose surfaces". That recreates the two-copies condition the move exists to end: the next re-measurement of `SIZING` will leave PLAN's Overview stale, and a stale relation between a citing note and its appendix reads more authoritative than a stale number alone (the `SIZING:37` rule about re-running rather than re-deriving is written against exactly this). This is a PLAN-side question, not a DECISIONS defect — DECISIONS' own claim ("cited from PLAN's Overview HEAD-drift note") is true — so I raise it rather than file it: would PLAN's note be better as a pointer plus column (1)'s four, mirroring what DECISIONS now does? |
| Q-02 | `SIZING`'s Cross-Reviews field reads "*(none — relocated content, reviewed as `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v1…v8.md`)*". That is honest about provenance, but it means the appendix now carries the feature's most volatile enumeration in a document with no review round of its own and no phase that re-opens it. If A6-05 slips a wave, what re-runs the recipe? |

## Positive Observations

- **The relocation fixed both of my v8 findings on the way out, rather than scoring them moot.** The
  easy version of this move is a cut-and-paste that carries the twenty and the wrong offset into the
  new file, where no round is looking. Instead column (3) is re-derived to twenty-five with the two
  `it` titles I named enumerated verbatim (`SIZING:198–201`), and the bad positional locator is gone
  rather than corrected — the outcome I argued for on `DEC-DOC-01` grounds. I verified both quotes
  against `advisoryDriver.test.js:238` and `:280` rather than against the previous review.
- **The document now states a rule that generalises past this feature.** `SIZING:37–44` — "no clause
  here reconciles one column to another", and re-run rather than re-derive, in the same session as
  the edit — names the actual defect generator of Phase D. Four of the five sizing rounds died on a
  sentence relating two populations where only one had been re-measured; a stale *relation* reads as
  reconciled and so survives review longer than a stale integer. That is a durable process lesson
  and it is written where the next editor will hit it.
- **Column (1) survived the move unchanged and still checks out.** It is the one number with a real
  implementer cost, and it is the one the record kept. Re-derived from HEAD in this round, not
  carried: three `export const` sites in `orchestrate-dev.js` and exactly one test-side literal at
  `advisoryRecord.test.js:496`, with `advisoryDriver.test.js:867`'s `["A5"]` correctly outside it.
- **"No decision entry is touched" is verifiable and verified.** A record that removes a third of its
  bytes invites the question of what else moved; the byte-frozen claim about `DEC-A6-01`…`DEC-A6-04`
  answers it in a form a diff can settle, and the diff settles it.

## Decision

No High finding stands, and none of the delta introduced one. My two v8 findings are resolved — not
by patching numbers in place, but by moving the block to a document where the numbers are expected to
move, and fixing both while doing it. The single count left behind is correct at HEAD. The removal is
clean: no orphaned column references, no surviving stale integer, and the delegation target exists,
is complete, and is cited from PLAN's Overview as claimed.

One Low finding, one PLAN-side question. Neither gates.

## Recommendation

**Approved with minor changes**

The one change worth making, non-blocking: drop the integer from the preamble's quotation at `:30`
("the already-migrated-sites bullet is folded into column (2)"), so that v1.8's own text carries no
HEAD measurement other than column (1)'s four. Q-01 is worth routing to PLAN's author before A6-05
is dispatched, since PLAN's Overview now holds the second copy of the totals this move was meant to
de-duplicate.

## Consequences

- Phase D's sizing surface is out of the decision record and into a PLAN appendix, so future rounds
  on DECISIONS cannot be re-opened by tree drift. That is the intended effect and it should hold:
  the four remaining integers-worth of claim in this document are all decision-shaped.
- The volatility moves with the content. `SIZING` inherits the drift, with no review round of its
  own (Q-02). The mitigation the documents already carry — the printed recipe plus the re-run rule —
  is the right one, but it is only as good as the next editor's willingness to run it.
- If Q-01 is not addressed, the first re-measurement of `SIZING` will silently falsify three numbers
  in PLAN's Overview.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
