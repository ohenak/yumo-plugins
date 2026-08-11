# Cross-Review: test-engineer — TSPEC (delta, round 12)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 12
**Scope:** Local — delta re-review of the v2.2 edit set only (`b4addcd..HEAD`, seven TSPEC commits).
v11 approved with no findings; this round re-reads only the changed hunks, re-measures every claim
they make against HEAD, and checks that nothing previously approved regressed. No re-litigation of
settled decisions.

## What changed, and what I re-measured

| # | v2.2 claim | Verification at HEAD | Result |
|---|---|---|---|
| 1 | §1 re-pins to FSPEC **v11.6** / REQ **v2.5** | `FSPEC:12` = `11.6`; `REQ:18` = `2.5` | Confirmed |
| 2 | §12.3: register carries **99** ids over FSPEC §13 (§§13.1–13.9), re-derived at v11.6, **set-equal to §12.3's table both ways** | Enumerated `AT-…` over FSPEC `§13`(2099)–`§14`(2250), de-duped ⇒ **99**. §12.3's file table ⇒ **99**. `comm` both directions ⇒ **empty**. The set equality is real, not asserted | Confirmed mechanically |
| 3 | The FSPEC is no longer cited by line **anywhere** | `grep -nE 'FSPEC-[^ ]*:[0-9]+'` over the TSPEC returns **nothing** | Confirmed |
| 4 | Re-cast anchors resolve: §13.4 (AT-R7), §13.5 (AT-Q13, the register quoted by T-11), §13.7 (AT-P7), §4.3 release table, §18 (BR-09, BR-15), §15 AC→AT map, §6.5 seam table | `FSPEC:2153` "13.4 Routing, the writes and the commit"; `:2166` "13.5 The PR route and idempotence"; `:2198` "13.7 Falsifiability"; `:2551` §4.3 "Release, and what each terminal status does"; `BR-09` `:2598`, `BR-15` `:2610` (both §18); AC-3.2⇒AT-Q13 `:2378`, AC-1.4⇒AT-R7 `:2370` (§15.1); §6.5 `:1007` carries the seam-domain table AT-Q7/AT-Q7c range over | Confirmed — every anchor resolves by section + heading + id |
| 5 | §10.3 row 4 / §13.1 row 13 now name FSPEC §4.2's fifth row **by its text** | `FSPEC:501` = *"Present but **empty**, or a line that is neither form"* — the fifth data row, verbatim as quoted | Confirmed; the v11 defect stays closed and is now drift-proof |
| 6 | §11.6: `rtCheckFile`'s catch-all routes *any* unrecognised reply to `file_missing` (`:817-831`, fall-through `:830`), the double does not (`seams.js:292-306`) | `runtime-adapter.js:817` `async function rtCheckFile`; `:828` `OK`⇒`{ok:true}`, `:829` `EMPTY`⇒`file_empty`, `:830` unconditional `return {ok:false, reason:"file_missing"}`. `seams.js` `checkFile` returns `file_missing` only on an empty path or `!hasOwnProperty` | Confirmed — the fail-open arm is real, and "no L2 fixture can reach it" is right: `CheckReply` (`:358`) has no failure member |
| 7 | §11.4 gains `parseMarker`; §12.2's T-09 row now says **five** | Row present at `:2402`, stated as an **iff** with a round-trip conjunct and `null`/`""` edge inputs; §12.2 T-09 (`:2510`) names all five plus the two determinism rows; the "five rows above" prose is consistent | Confirmed — this is exactly the L-03 repair, and the iff form is the one that survives a `null`-always parser |
| 8 | T-13 / the release-set case **pin `_now`** rather than shape-match, "in the shape the shipped suites already use" | `advisoryDodSeams.test.js:129` `_now: fakeClock._now`, `:1116` `_now: () => 0`; `advisoryDisabled.test.js:276` `_now: () => 0`. The seam is injectable: `_now = () => Date.now()` is a **destructured parameter default** (`orchestrate-dev.js:1623`, `:3182`, `:8417`) | Confirmed — Q-01 answered with an implementable mechanism, and `{ISO-8601}` is now a literal expected value |
| 9 | §3.2's two SKILL rows re-pointed (`consolidate-learnings:56`/`:62`, `harvest-learnings:72-79` after `:77`) | `consolidate-learnings/SKILL.md:56` carries the block/legacy predicate; `:62` carries `{topic} = failure-mode-id`; `harvest-learnings/SKILL.md:77` `Harvested from`, `:78` `Phases exercised` | Confirmed |

## Testability delta

The two edits with real oracle consequence are #7 and #8, and both strengthen falsifiability rather
than restate it.

**T-13's clock pin closes a live hole.** The prior text asserted the release line "matches
`RELEASED: {passId} {ISO-8601}`" without saying where the instant came from. A shape match over
"any well-formed timestamp" is satisfied by an implementation that stamps the release with the
*take's* instant — and a wrong instant in the marker is precisely what makes a later pass's
staleness arithmetic wrong, so the weak oracle would have been silent on the one defect the row
exists to catch. Pinning `_now` and deriving `passId` from the fixture log makes both halves
literal transcriptions from the fixture, never reads off the record under test. The release-set case
(§12.2's `TERMINAL_STATUSES` row) inherits the same oracle explicitly, which matters because that
table's arms are where a read-back-to-itself green would hide easiest.

**`parseMarker`'s strategy is stated in the only form that works.** v2.0 widened the grammar to two
verbs plus a `state` discriminant; a one-directional totality claim would be green on a parser that
returns `null` always, and a containment claim green on one that accepts everything. The iff plus
the round-trip conjunct on `state`/`passId`/`at` defeats both, and the round-trip is what stops the
two verbs being conflated — which is the exact confusion BR-14a exists to prevent.

**§11.6's fail-open disclosure is the honest resolution.** It is named, bounded, attributed to the
pre-existing shipped adapter, and explicitly *not* claimed as tested. That is the right posture; the
one thing left undone is at the disclosure's other end (F-01 below).

Nothing else moved. Every E-11 / BR-14a arm, §7.3 decision 2, §12.3's assignments, §13.1's rejected
alternatives and the §11.3 oracles are byte-identical apart from the anchor recasts. No AT, edge
case, reason code or obligation changed. Nothing in this round regresses a previously approved
property.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §11.6 withdraws the provenance half of §5.1's probe comment ("they do **not** agree on the provenance of the `file_missing` reason") but the comment itself still reads *"The two agree exactly on the one state this layer reads, a missing file — recorded so it stays that way"* (`TSPEC:356-357`). That comment is **shipped source text** — §5.1 is the protocol block the implementer transcribes — and it carries no pointer to the scoping 2,100 lines away. No oracle pins either sentence, so a later maintainer builds on the unscoped reading. Fix is one clause at the comment site: *"…on the three file states; the `file_missing` **reason** has a wider producer in production — see §11.6"* | §5.1 (`:345-357`), §11.6 |
| F-02 | Low | Local | §11.4's `parseMarker` near-miss class lists "leading/trailing junk" as an input the property expects to yield `null`, but neither §7.3 nor the row says whether **whitespace** padding (a trailing newline, which is what a file write leaves) counts as junk. §7.3's "exactly two one-line forms and nothing else" reads strict, while the adjacent `file_empty` boundary is decided by `.trim()` under the double (`seams.js:298`, quoted at `TSPEC:352`). If the implementer trims and the property generator does not, the property reds on conforming code. One sentence in §7.3 — trailing newline tolerated or not — closes it | §11.4 (`:2402`), §7.3 (`:990-994`) |
| F-03 | Low | Local | §5.1's and §5.6(b)'s citation of the shipped clock pattern, `orchestrate-dev.js:1396`, is **stale at HEAD**: `:1396` is a blank JSDoc continuation line; the destructured defaults are at `:1623`, `:3182`, `:8417`. This is the same line-drift class §12.3 just eliminated for FSPEC anchors, and it now sits under a mechanism T-13 leans on. Also worth reconciling the wording: §5.6(b) calls `_now` "a module-level default" while T-13 calls it "a destructured parameter default" — the latter is what the code is, and it is the property that makes T-13's pin possible | §5.1 (`:364`), §5.6(b) (`:535`), §12.2 T-13 |

## Questions

| ID | Question |
|----|---------|
| — | None. Q-01 from round 10 is answered and verified against the shipped suites. |

## Positive Observations

- The register count is no longer a claim I had to take on trust. I re-derived 99 over FSPEC §13 and
  99 over §12.3 and diffed both directions to empty — and §12.3 is right that the number is a
  reader's summary, not the mechanism, because `consolidationTraceability.test.js` re-derives both
  sides at run time. A fourth drift reds in the suite instead of costing a fifth erratum round.
- Recasting every FSPEC anchor as *§-number + heading + id* is the durable repair, not a patch: it
  is the same rule §11.3(e) and §12.2 already impose on the document's own source-text oracles, now
  applied to the document's citations of its upstream. Three rounds of findings on hand-copied
  coordinates end here.
- The erratum-changelog corollary — an entry cites what a pointer *should* name and never narrates
  what the stale one currently hits, because the insertion invalidates the narration in the same
  commit — is a genuinely reusable process lesson, and the 2.1 entry is struck rather than quietly
  reworded.
- §11.6's fail-open entry declines to claim coverage it has not got. "No L2 fixture can construct
  it — `CheckReply` is a three-value union with no failure member, by design" is checkable, and it
  checks out. A disclosed untestable arm is worth more than an oracle that pretends.
- T-13's rejection of the shape match is argued from the defect it would miss, not from taste.

## Recommendation

**Approved with minor changes**

No High findings. The four v2.2 corrections all verify at HEAD, the two with oracle consequence
(T-13's clock pin, `parseMarker`'s iff) make the test strategy strictly stronger, and nothing
previously approved regressed. F-01 through F-03 are one-line repairs the author can fold into the
next touch of this document; none of them changes a mechanism, an oracle's strength or an
acceptance criterion, and none should hold the phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
