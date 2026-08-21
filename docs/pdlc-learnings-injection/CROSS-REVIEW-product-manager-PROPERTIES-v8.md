# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 8 (delta re-review under DECISION FREEZE — PROPERTIES v0.4 → v0.5)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (v0.9) · DECISIONS `sha256:56617f5ab31a…` · PLAN
`sha256:b9fbd3eacb1b…` (v0.7, unchanged since my v7) · PROPERTIES under review
`sha256:6341096d6011…` (**v0.5**, was v0.4 `sha256:599a97a029e5…`), branch
`feat-pdlc-learnings-injection` at `7ac7fe8b`.

## Overview

**The question.** At v7 I raised two High findings and two non-gating ones, all four confined to
§C.4's HEAD accounting: the fourteen-row test-file inventory contradicted the very
`git ls-files pdlc/workflows/__tests__` measurement the section says it restates (F-01), the
ledger-routing conclusion derived from it was written against a batch-13-in-the-future world (F-02),
the four amendment cases owed to `learningsBlock.test.js` were not recorded as having lost their
red-owning task (F-03), and the header attributed PLAN's P-A-7 two-case table to v0.6/v0.7 when v0.6
alone added it (F-04). This round measures v0.5 — 84 insertions / 45 deletions in two regions
(header cell, §C.4), across four commits `21edb7c5`, `91aeb6bb`, `4cb84db5`, `7ac7fe8b` — against
those findings and against the repository at `7ac7fe8b`.

**All four of my v7 findings are resolved, and the two High ones are resolved with evidence I could
re-run.** The inventory is not merely corrected but re-founded: it is now declared a *snapshot, not a
live claim*, pinned to the commit the command was run at (`21edb7c5`), with an added **Added by**
column carrying the adding commit for every row — which is exactly the shape my v7 DEFERRED item
asked for, taken up unprompted. I checked all fourteen adding shas independently
(`git log --diff-filter=A`) and **all fourteen match**. The ledger paragraph is restated against
HEAD, correctly concluding that case A is unreachable and case B is live, and the P-A-6 deferral is
described as spent rather than pending. F-03's four owed cases are recorded with the grep evidence I
used, and the header now attributes the table to v0.6 with v0.7's four actual changelog items named.

**One defect this delta introduced.** §C.4's new closing sentence says the two gaps it finds in
PLAN case B's wording are *"routed as errata rather than decided here"* (line 1124). §G.3 — the
document's own **Routed Errata** list, unchanged by this delta — still reads *"Still open — one item,
re-routed this round"* and carries only the AT-15 suite-assignment item. Nothing routes the two new
gaps. That is one High finding in the freeze's category (i), and it is the *same* pattern §G.3 itself
records as a past failure in its struck P-A-7 entry: *"§C.4 asserted this routing and this list did
not carry it, so it reached no author from here (PM v5 F-01)."* The fix is three lines in §G.3. So
the PLAN work is not held up behind that edit, I route both gaps upward myself in this review's
ERRATUM lines.

**Nothing else moves.** No property, oracle, fixture, AT id, severity, group membership or red/green
trace changed in this delta; §C.4's count table (70 / 35 / 23 / 21 / 12) is byte-unchanged.

## Properties

**No property moves, and none is disturbed.** The diff touches the `Upstream` header cell, the
version cell (0.4 → 0.5) and §C.4. No property id, no `red LI-xx` / `green LI-yy` trace, no AT id, no
severity and no group membership changed. §C.4's reconciliation table — 70 properties, 35 ATs, 23
tasks, 21 owning tasks, 0 properties with no owning task, 12 fail-open arms (lines 1054–1062) — is
byte-unchanged, as is §C.3's 23-of-23 task accounting.

**The inventory now agrees with the repository, row for row.** I re-ran the document's own stated
method and independently derived each adding commit rather than reading them from the table:

| §C.4 row | Owning task | Tracked at `21edb7c5` | `git log --diff-filter=A` | Table says | Match |
|---|---|---|---|---|---|
| `helpers/learningsFixtures.js` | LI-02 | yes | `1920f281` | `1920f281` | ✓ |
| `learningsPremises.test.js` | LI-01 | yes | `cdeb1509` | `cdeb1509` | ✓ |
| `learningsCaptureScript.test.js` | LI-03 | yes | `688a5651` | `688a5651` | ✓ |
| `learningsPredicatePin.test.js` | LI-13 | yes | `07af8f52` | `07af8f52` | ✓ |
| `learningsSelect.test.js` | LI-07 | yes | `1544fdbd` | `1544fdbd` | ✓ |
| `learningsBlock.test.js` | LI-08 | yes | `5e522a52` | `5e522a52` | ✓ |
| `learningsCorpus.test.js` | LI-09 | yes | `b79b7859` | `b79b7859` | ✓ |
| `learningsBaselineGuard.test.js` | LI-06 | yes | `4a6c1816` | `4a6c1816` | ✓ |
| `learningsRecord.test.js` | LI-10 | yes | `2fe07964` | `2fe07964` | ✓ |
| `learningsDispatchSet.test.js` | LI-11 | yes | `c3e723e5` | `c3e723e5` | ✓ |
| `learningsConfig.test.js` | LI-12 | yes | `eb32d7d2` | `eb32d7d2` | ✓ |
| `learningsArmInventory.test.js` | LI-23 | yes | `100e3d9c` | `100e3d9c` | ✓ |
| `learningsSuiteMap.test.js` | LI-14 | yes | `960c229c` | `960c229c` | ✓ |
| `fixtures/learnings-baseline/` | LI-06 | yes (`MANIFEST.json`, `PHASE-F-AUTHORING-PROMPT/0.txt`, `PHASE-R-REVIEW-PROMPTS/{0,1}.txt`) | `4a6c1816` | `4a6c1816` | ✓ |

Fourteen of fourteen, exactly as stated (**F-01 of v7 resolved**). The snapshot pin is honest too:
`git diff --name-status 21edb7c5 HEAD` returns only this PROPERTIES document, so no test file has
landed since the pin and the table is current as well as pinned.

**The task-id accounting is right in both directions.** `git log main..HEAD` yields commits for
**LI-01…LI-21 and LI-23**, and LI-22 alone has none — precisely what line 1096 claims. LI-22 owning
none of the fourteen is confirmed in PLAN's own LI-22 row (a 🔵 REFACTOR-and-close task whose
artifact is a full-suite green run plus the human cross-check of LI-23's arm inventory, not a file).
LI-04's `.gitignore:13` `/.baseline-worktree/` rule is present and landed at `ae2af1da`, matching the
new parenthetical.

**The ledger restatement is now true at HEAD (F-02 of v7 resolved).** LI-08 `5e522a52`, LI-17
`2cbacada`, LI-16 `d462ddd8` and LI-21 `92b7ea0c` are all on the branch. PLAN's case A is scoped
*"before batch 7"* (PLAN line 491) and case B to *"batch 9 or later"* (line 492), so "case B is the
live case and case A is unreachable" follows from the repository, not from assertion. P-A-6's text at
PLAN line 590 does say the PROPERTIES suite commits *"at the first point the suite is green, which in
practice is after LI-21 (batch 13)"* — so "spent, not pending" is the correct reading now that
`92b7ea0c` has landed. The paragraph also keeps the conclusion that mattered — *no property of this
document changes either way* — and my v7 DEFERRED item asking that the two sentences be reconciled
into one claim is closed by the new closing paragraph separating P-A-7 case B (the implementation
suite) from P-A-6 (this document's own suite).

## Oracles

**No oracle statement changed in this delta.** §O.1–§O.10 are byte-identical; the only oracle-adjacent
movement is §C.4's new account of which oracles are *owed* to a landed suite. That account I checked
against the file.

**F-03 of v7 is resolved, and its evidence holds at HEAD.** §C.4 now records that the four owed cases
are absent from `learningsBlock.test.js` and that both green owners have landed, so they are
*"property-owed cases with no red-owning task remaining ahead of them"*. Every element of that claim
verifies:

| Claim in §C.4 | Verified at HEAD |
|---|---|
| one `describe` naming three ATs | `describe("LI-17: block/material suite (LI-AT-05, LI-AT-11, LI-AT-12)"` — `learningsBlock.test.js` line 38, quoted verbatim in the document |
| no un-numbered `## Cross-Feature Patterns` / un-glossed `## Rejected Proposals` heading-form arm | the only occurrences are fixture *bodies* (`:42`, `:110`, `:130`) and the canonical glossed name `"Rejected Proposals (with rationale)"` in the builder (`:81`); no arm exercises the non-canonical form |
| no `###`-as-body case | no `###` literal in the suite |
| no `## Process Findings` near-miss | absent |
| only `maxBytes` literals are `40` and `66` | `const maxBytes = 40` (line 111), `const maxBytes = 66` (line 131); the third call site passes `100000` (line 87) as an explicitly unbounded value, not a bound — so "only `maxBytes` literals" reads correctly for the bound cases |
| no `extractInjectableMaterial(text, 0)` case | absent |

**The expectations in the landed suite remain literal transcriptions, not implementation echoes** —
which is what makes §C.4's "amendment into green code" framing safe rather than alarming. The AT-12
case states its arithmetic in a comment and asserts the expected string as a literal
(`expect(result.material).toBe("## Cross-Feature Patterns\n\n" + "b".repeat(38))`, with the comment
*"hand-computed, never derived here"*), and AT-11's byte-bound case does the same at 40 bytes. No
expected value is imported from or recomputed by the unit under test.

**The new PROP-CONFIG-09 sentence is accurate and its pairing survives.** §C.4 now says
`learningsConfig.test.js` *"already carries LI-AT-30's three cases"* and names the third as asserting
`RSN-NO-MATERIAL` on every non-self path and no document carrying `RSN-COUNT`. At HEAD the three
`test("LI-AT-30…` cases are at lines 226, 242 and 258; the third asserts set-equality over the
enumerated non-self corpus paths with `expect(row.reason).toBe("RSN-NO-MATERIAL")` per row (line 279)
and pairs the negative conjunct
`expect(dispatch.rejected.some((r) => r.reason === "RSN-COUNT")).toBe(false)` (line 285) with that
positive set-equality on the same path. That is the pairing rule satisfied — the negative is not an
absence-only oracle, and the enumeration is checked by set equality rather than containment, so a
deleted case fails.

**One anchor-style nit, non-gating.** The new prose cites `learningsConfig.test.js:226`, `:242`,
`:258` and `.gitignore:13` as raw `file:line` anchors without a quoted string or symbol beside them.
Under `DECISIONS-review-severity-bars.md` `DEC-DOC-01` that is a Low, `Process`-scoped item (F-03
below). The `learningsBlock.test.js:38`, `:111` and `:131` anchors are *not* in that class — each sits
beside the verbatim text it points at, and `:111`/`:131` are the measured evidence for a
"these are the only literals" claim, where position is the claim under test.

## Fixtures

**No fixture claim changed except the one my F-01 asked for, and it is now correct.**

| Fixture dependency | State at `7ac7fe8b` | Effect of this delta |
|---|---|---|
| `helpers/learningsFixtures.js` (LI-02) | tracked, added `1920f281` | row unchanged; now also carries its adding commit |
| `fixtures/learnings-baseline/` (LI-06) | tracked — `MANIFEST.json`, `PHASE-F-AUTHORING-PROMPT/0.txt`, `PHASE-R-REVIEW-PROMPTS/0.txt`, `PHASE-R-REVIEW-PROMPTS/1.txt`, added `4a6c1816` | **repaired**: was *not yet created*, now *exists (landed)* with the four member paths spelled out. This was the fourteenth row of my v7 F-01 and the one I called the clearest case; the fix enumerates the directory's contents rather than asserting existence, which is strictly better than what I asked for |
| §F.1's named corpora (`NO-MATERIAL`, `ZERO-BOUND`, `DIVERGENT-CORPUS`, the five-section AT-11 fixture) | declared through the helper | untouched — §F.1 is byte-unchanged |
| PROP-BOUND-07's hand-computed byte literals over the AT-11 fixture | `learningsBlock.test.js:106–139` still carries the 25 + 2 + n arithmetic in comments and the literal expected strings | unchanged, and still transcribed rather than computed from the unit under test |
| PROP-BOUND-08's real-corpus arm | reads the live corpus | unaffected |
| `scripts/capture-learnings-baseline.mjs` (LI-05) | tracked — `git ls-files scripts/` returns exactly that one path, landed `ced75955` ("LI-05 — GREEN the capture script") | unchanged from v0.4; the closing paragraph's account still verifies exactly |

**The asymmetry I flagged at v7 is gone.** The `scripts/` correction was the model I asked the author
to apply to the fourteen-row table; v0.5 applies it and goes further, generalising the pattern into a
stated method — *"a snapshot, not a live claim … each row carries the commit that added the file, so
a reader can tell a stale reading from a current one without re-running anything."* That sentence is
the durable form of the fix: it makes the next staleness visible instead of silent, which is why I
would rather see it than a one-off re-measurement.

**No generator, corpus declaration or fixture byte moves under any of this.** §F.1–§F.4 are unchanged
and no property's fixture dependency is re-pointed.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
