# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.2)
**Date:** 2026-08-29
**Iteration:** 4 (delta re-review of the v1.1 → v1.2 diff)

## Overview

**Scope of this pass.** My v3 was an upstream-cascade confirmation that returned **Needs revision**
on two Highs, both tagged `inherited`: PROP-INV-06's exclusion regions and PROP-INV-07's assertion
were written against `TSPEC` §7.3 at v0.7/v0.8 and had been overtaken by §7.3 at **v1.0**. v1.2 is
the repair round. I diffed `ae0a4a5f0..HEAD` on the document (`102 +`, `24 -`, one file) and read
only the changed regions: the header pin and changelog, PROP-INV-06/07/09 and the new PROP-INV-11,
the new PROP-WIRE-12, PROP-OFF-05, the INV rationale paragraph, §FX-BASELINE's *Feeds* note, the
Coverage Matrix counts and module manifest, the BR-11/NG-4 and DC-07 obligation rows, and §Gaps'
second routed item. Nothing outside those regions is re-litigated here.

**Both of my v3 Highs are resolved, and I verified the repair against source, not only against
`TSPEC` prose.**

| v3 finding | Disposition | Evidence I checked |
|---|---|---|
| **F-01** (High) — PROP-INV-06 excluded "three brace-matched function bodies" | **Resolved** | `PROPERTIES`:409 now excludes the body of **every** member of `DECISION_LEDGER_OWNED_DECLS`, "**fourteen** at `TSPEC` v1.0, the six functions plus the eight top-level constants", each sliced "from its own declaration line to the next top-level declaration of any name", boundaries from **all** module top-level declarations. That is verbatim the mechanism `TSPEC`:1337 specifies, and it is the mechanism the precedent actually implements: `loopEconomicsAnchorGuard.test.js:63–66` builds `allTopLevelDecls`, `:123–127` slices `bodyOf(name)` from that declaration's line to the next entry's line, and `:114` holds `ANCHOR_TOKENS` as a test-file constant. The document also states the negative I asked for — brace-matching "cannot slice a constant such as `DECISION_HEADING_RE` at all" |
| **F-02** (High) — PROP-INV-07 asserted export set-equality, the form §7.3 rejects | **Resolved** | `PROPERTIES`:411 now carries §7.3's partition — `CENSUS_TOKENS` ∪ `CENSUS_EXEMPT` **set-equal** to `OWNED_DECLS`, sub-sets **disjoint**, both directions over the frozen fourteen-member list — and states explicitly that export set-equality "is the form `TSPEC` §7.3 **rejects as red by construction** … and must not be asserted". `TSPEC`:1336 is the matching text. The BR-11/NG-4 gloss (`PROPERTIES`:953) and the INV rationale paragraph (`:415–424`) were re-worded in step, which were the two secondary sites I named |
| **F-03** (Medium) — module manifest's T-11 → T-18 red→green rationale rested on a production `CENSUS_TOKENS` | **Resolved** | `PROPERTIES`:891–906 records the test-file home for all three operands and re-states the edge: T-11 is skipped in batch 2 and un-skipped by T-18 because PROP-INV-11's resolves-to-exactly-one and PROP-INV-08's non-empty-slice read the owned list against HEAD — "the ordinary red-before-green edge, not red-by-construction" |

**The partition arithmetic closes, and I recomputed it rather than taking it.** `TSPEC`:1336's
`DECISION_LEDGER_CENSUS_EXEMPT` holds exactly eight members (`parseDecisionLedgerConfig`,
`buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`,
`DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`,
`DECISION_LEDGER_NOTICES`); the token set holds six; the union is fourteen and is disjoint. Split by
kind, that union is six functions and eight top-level constants — exactly the fourteen `TSPEC`:1337
enumerates (§4.1/§4.2/§4.4's six functions plus §3.1, §3.2, §4.1, §4.3 ×2 and §5.2's three
catalogues). PROP-INV-06's "six functions plus the eight top-level constants" and PROP-INV-11's
"fourteen members" are therefore both correct, and the two sentences are consistent with each other,
which is where a hand-restated partition usually goes wrong.

**Counts reconcile.** `10 + 11 + 9 + 6 + 12 + 11 + 5 + 11 + 12 + 6 + 10 = 103`; the pyramid
restatement `36 + 12 + 39 + 6 + 10 = 103` with FAIL 11 + PRE 5 + INV 11 + WIRE 12 = 39. Both are
right, and I found no surviving `101`/`37` outside the changelog's own history entries.

**The `PLAN` divergence is routed, not adjudicated, which is the correct disposition.** My v3 Q-01
asked whether the repair should wait on `PLAN` converging to `TSPEC` v1.0. v1.2 answers by re-pinning
to the deeper upstream and routing the contradiction as a second `ERRATUM: PLAN` item
(`PROPERTIES`:980–994). I agree with that call: `PLAN` v0.7 at HEAD is genuinely out of contract with
`TSPEC` v1.0, and a PROPERTIES that followed `PLAN` would be out of contract with the document
`PLAN` itself derives from. I re-raise the erratum in my own trailer so the route does not depend on
this document alone carrying it.

## Properties

Four property surfaces moved. I checked each against `TSPEC` HEAD and, where it makes a claim about
shipped code, against `orchestrate-dev.js` itself.

**PROP-INV-06 (`PROPERTIES`:409) — implementable now.** The exclusion is (a) every owned
declaration's slice and (b) the sentinel-bounded `main()` wiring run. The false-red I named in v3 is
gone: `gatherDecisionCorpus`'s and `renderDecisionLedgerBlock`'s uses of their siblings now sit
inside sliced regions, and `DECISION_LEDGER_OMIT_REASONS` / `DECISION_LEDGER_CORPUS_OUTCOMES` are
themselves owned declarations, so their own declaration lines are excluded. The remainder is a real
non-empty region — `orchestrate-dev.js` is ~817 KB and the fourteen slices are a small fraction of
it — so the census is not vacuously green either.

**PROP-INV-07 (`:411`) — the partition, in both directions.** This is now a set-equality over an
enumerated contract, not a containment check, which satisfies the completeness bar: a member
deleted from either sub-set, or a fifteenth declaration added to `OWNED_DECLS` and classified into
neither, reddens. It is a transcription of `TSPEC`:1336's contract, not a derivation from code.

**PROP-INV-11 (`:412`) — the right shape for the red-on-rename conjunct.** Asserting a resolution
**count of `1`** rather than "resolves" is what makes both the zero case and the two case fail; a
truthiness check would have caught only the first. This is the conjunct `TSPEC`:1337 states in its
"how it is kept honest" column, and the property correctly notes PROP-INV-08's non-emptiness catches
neither (a zero-resolution member yields no slice to be empty). No implementation echo: the count is
a literal `1` from the spec, not derived from the module.

**PROP-WIRE-12 (`:348`) — faithful to §7.2's conjunct 3, and the absence is paired.** `TSPEC`:1172
specifies the symmetric difference of the two `report` key sets as exactly `{decisionLedger}`, set
equality in both directions, referent the arm's own paired runs and expressly **not** §7.4's
recording. The property transcribes that, and it satisfies the no-absence-only-oracle bar in both
halves: the flag-off arm's "no `decisionLedger` key" is asserted as one side of a positive set
equality against the flag-on run, and the flag-on arm carries a positive presence-and-shape
assertion rather than a bare `toBeDefined`. Its "no `FSPEC` AT row asserts `report.decisionLedger`"
claim is true at HEAD — `grep -c "report.decisionLedger" FSPEC-pdlc-decision-ledger.md` returns **0**.

**PROP-INV-09 (`:410`) — the hand-off now lands somewhere.** In v1.1 the field's behavioural
obligation was routed to PROP-OFF-05 and PROP-WIRE-11, neither of which asserts a `report` key set on
a live run. It is now routed to PROP-WIRE-12's two homes, which is `TSPEC` §7.3's report-field
paragraph verbatim ("by exactly two named homes: §7.2's live composition-root arm, whose conjunct 3
… and, on the flag-on path, that same arm's presence-and-shape assertion"). The rationale it cites
is also true of shipped code: `learningsInjectionField` is declared at `orchestrate-dev.js:15167` and
named at eight `buildFinalReport`-adjacent sites (`:16734`, `:16751`, `:16776`, `:16800`, `:18322`,
`:18357`, …), all far outside any wiring sentinel — so a census token on the field name would indeed
red on conforming code.

**PROP-OFF-05 (`:362`) — the referent correction is right; its case scope is now under-specified.**
Dropping the FX-BASELINE referent is correct and I verified the premise: `TSPEC` §7.4's *Recorded
stream, deliberately narrow* bullet records one case driving exported `reviewLoop` and captures
reviewer-prompt streams only, so there is no notices array and no `report` key set in the recording
to be set-equal *to*. Routing the key-set half to PROP-WIRE-12 is likewise right. What the edit
leaves open is **which** flag-off case the surviving conjunct covers. PROP-OFF-05 says "With the flag
off, the emitted notice set must be **set-equal to empty**", and the OFF family's flag-off is
PROP-OFF-02's **four** not-enabled spellings — which include the wrong-typed key and the malformed
block. `TSPEC`:1008–1009 (F-4, F-5) specifies those two as disabled runs that **do** emit
`NTC-DECLEDGER-MALFORMED` / `NTC-DECLEDGER-KEYTYPE`. Under the four-spelling reading the assertion
reds on conforming code; under the clean-`false` reading it is exactly right. §7.2's own conjunct 3
is unambiguous because its flag-off arm is the clean one, so the ambiguity is this document's to
close, with one clause. Filed **F-01** below, Medium — the correct reading is recoverable from
`TSPEC` §6 and PROP-OFF-01's own referent, so it does not gate.

## Oracles

The oracle section is byte-unchanged in this diff, and I re-checked only whether the changed
properties disturb it. They do not.

| Oracle | Touched by v1.2? | Why not |
|---|---|---|
| ORC-01 corpus oracle | No | Whole-line equality over FX-CORPUS; no census or `report` operand |
| ORC-02 citation resolution chain | No | Starts at the rendered line |
| ORC-03 shipped-default assertions | No | §4.1 defaults and the transcribed 6,305 / 10,859 literals, none of which moved |
| ORC-04 byte-identity baseline guard | No | Pins `mergeBaseSha`; the *Feeds* note gained a non-referent sentence, but ORC-04's own assertion is unchanged |
| ORC-05 bounds model | No | O-8, renderer |
| ORC-06 replay oracle | No | FX-REPLAY anchoring; discharges PROP-INV-01…04, untouched by the census rewrite |

Two things worth stating positively because they bound the blast radius of this round. First, the
census is still specified **only** inside the INV property table — no oracle owns it — so the repair
was four table rows and three prose glosses, and there is no second site where the v0.8 wording could
have survived. I grepped for one: `PROPERTIES` carries no remaining reference to "three function
bodies", to brace-matching as the slicing mechanism, or to export set-equality as an assertion
rather than as a rejected form.

Second, ORC-04's referent is now stated in two places that agree. `§FX-BASELINE`'s *Feeds* line
(`:792–794`) gained "It is **not** the referent for any `report` key set or notices array — see
PROP-WIRE-12", and PROP-OFF-05 and PROP-WIRE-12 each say the same thing from their own side. That
three-way agreement is the property I would want here, because the failure mode `TSPEC` §7.2 warns
about ("easy to get wrong") is precisely a reader picking up the recording as a key-set referent from
whichever site they read first.

## Fixtures

No fixture literal, digest or path moved in this round, and none should have: the census reads module
source, not a fixture, and PROP-WIRE-12's referent is the live arm's own paired runs. I re-verified
the four transcribed literals are untouched (6,305 / 10,859 / 12,059 / 441) and that FX-CORPUS,
FX-REPLAY, FX-FAILOPEN and FX-PRECEDENCE are byte-identical in the diff.

The one fixture-adjacent edit is §FX-BASELINE's *Feeds* note, and it is a **narrowing of a referent
claim, not a change of fixture content** — the recording is unchanged; what changed is the document's
statement of what it may be compared against. I checked that narrowing against `TSPEC` §7.4 directly
rather than against PROPERTIES' paraphrase: the *Recorded stream, deliberately narrow* bullet says
the case drives exported `reviewLoop` and records reviewer-prompt streams, and gives the reason —
a whole-`main()` recording "would red on this feature's additions (the new notices, the new report
field) and would have to be re-transcribed mid-feature, proving nothing". So the narrowing is not
merely permitted, it is the point of the fixture's design.

The three census operands' home is likewise a fixture-shaped question and is now recorded where a
reader will hit it: `decisionLedgerCensus.test.js` declares all three
(`PROPERTIES`:891–898), matching the precedent exactly — `ANCHOR_TOKENS` at
`loopEconomicsAnchorGuard.test.js:114` is a constant of the scanning test, not of the scanned module.
That home is what makes PROP-INV-07's partition closeable at all, since a test-file constant can
never be a member of a list of *module* declarations, and the document now says so in the manifest
rather than leaving it to be inferred.

## Findings

Both v3 Highs are resolved (see §Overview). Two new findings, neither gating.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **PROP-OFF-05's flag-off scope is under-specified against `TSPEC` §6.** It asserts "With the flag off, the emitted notice set must be **set-equal to empty**". The OFF family's flag-off is PROP-OFF-02's four not-enabled spellings, two of which — the wrong-typed key and the malformed `decisionLedger` block — are specified by `TSPEC`:1008–1009 (F-4, F-5) as disabled runs that emit `NTC-DECLEDGER-MALFORMED` / `NTC-DECLEDGER-KEYTYPE`. An implementer reading PROP-OFF-05 across all four spellings writes an assertion that reds on conforming code. **Fix:** scope the conjunct to the well-formed not-enabled case (PROP-OFF-01's referent — `enabled` absent or `false`), and say in the same clause that the malformed and wrong-typed spellings emit their §6 notices and are asserted by the FAIL/CFG families, so the empty-set claim is not read as contradicting them. One clause; no property added | `PROPERTIES`:362, PROP-OFF-05 |
| F-02 | Low | Local | **§Gaps' routed `PLAN` item under-enumerates the divergent sites — six, not five.** It names `PLAN`'s revision history, the T-11 row, the two file-ownership manifest rows and the §Definition of Done census bullet. `PLAN`:158's **T-18 row** carries the divergence too, and in the most operative form of all: "**Add frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration in `pdlc/workflows/orchestrate-dev.js`** … holding T-11's six token strings". A `PLAN` author repairing only the five named sites leaves the one instruction that would actually put a census constant into production code. **Fix:** say six and name `PLAN`:158 | `PROPERTIES`:980–994, §Gaps |

**On F-01's severity.** I considered High, because "asserts something that reds on conforming code"
is exactly the class my v3 F-01 was. It is not the same class in practice: there the property named
a mechanism (`brace-matching`) that cannot slice a constant, so no reading of it was implementable,
whereas here one of the two available readings is correct and is the one `TSPEC` §7.2's own flag-off
arm uses. The cost of the ambiguity is one round-trip at implementation, not an unimplementable
contract, and PROP-OFF-01 sitting four rows above supplies the disambiguating referent. Medium.

**Previously-filed, still open, not re-litigated.** My v2 F-01 (DISC task attribution) and v2 F-03
(BND range in §Overview) were addressed in v1.1; my v3 F-03 (module manifest census rationale) is
resolved in v1.2. Nothing from the earlier rounds remains open that this round reopened.

## Questions

| ID | Question |
|----|---------|
| Q-01 | **Is `DECISION_LEDGER_NOTICES` still correctly `CENSUS_EXEMPT` now the partition is closed?** (Carried from v3 Q-02, unanswered and still not a finding.) Its exemption reason at `TSPEC`:1336 is *behavioural* — "run-level notice ids, which generic driver code legitimately renders and counts" — not structural like the other seven plumbing members. If a future notice id ever carries record-derived detail, the partition stays green while the census goes blind to it. One clause in PROP-INV-07 or in the exempt list's reason column would close it; I am not asking for it this round |
| Q-02 | **Does PROP-WIRE-12's "presence and shape" have a pinned shape?** The property asserts `report.decisionLedger`'s presence **and shape** on the flag-on run, but the shape itself is specified in `TSPEC` §5.4, not restated here. That is the right altitude — I am not asking PROPERTIES to duplicate a field contract — but I want to confirm the implementer is expected to transcribe §5.4's shape literally rather than assert `typeof === "object"`, which would be a containment check where a set equality is available |
| Q-03 | My v2 Q-01 (whether PROP-DISC-09's "set equality" is a subset check against a nine-name literal) remains open and unaffected by this round. Restated only so it is not lost between rounds |

## Positive Observations

- **The repair went to the deeper upstream and routed the conflict rather than papering it.** Facing
  a `TSPEC` v1.0 / `PLAN` v0.7 contradiction, v1.2 re-pinned to `TSPEC` and filed an `ERRATUM: PLAN`
  with the divergence enumerated site by site. That is the disposition I argued for in v3 Q-01, and
  the §Gaps entry states the arithmetic of *why* `PLAN`'s form cannot hold ("under `PLAN`'s form
  `DECISION_LEDGER_CENSUS_TOKENS` is simultaneously a member of the owned list and a declaration
  whose slice must be excluded"), which is the sentence that will let the `PLAN` author converge
  without re-deriving the analysis.
- **PROP-INV-11 was added rather than folded into PROP-INV-08.** The resolves-to-exactly-one conjunct
  and the non-empty-slice conjunct catch disjoint defects, and merging them would have produced a
  property whose failure message could not say which invariant broke. The count-of-`1` form is also
  strictly better than the "resolves" form `TSPEC` could have been read as licensing.
- **PROP-WIRE-12 made a deletion visible instead of asserting a value.** Its stated purpose — "so
  deleting the arm deletes the field's only proof, which is what this property exists to make
  un-deletable" — is the right instrument for a sole-evidence site, and it is grounded: `FSPEC`
  really does contain zero mentions of `report.decisionLedger`, so the arm really is sole evidence.
- **The three-way agreement on FX-BASELINE's non-referent status** (PROP-OFF-05, PROP-WIRE-12,
  §FX-BASELINE's *Feeds* note) closes the exact trap `TSPEC` §7.2 flags as "easy to get wrong". A
  single site would have been enough to be correct; three is what makes it hard to get wrong at
  implementation time.
- **Counts were re-derived, not adjusted.** 101 → 103 propagated to the family table, the partition
  sum, the pyramid restatement and the module manifest in the same round, and both arithmetic forms
  check out independently.

## Recommendation

**Approved with minor changes**

Both High findings from my v3 confirmation are resolved, and I verified the repair against
`orchestrate-dev.js`, `loopEconomicsAnchorGuard.test.js` and `TSPEC` HEAD rather than against the
changelog's account of it. PROP-INV-06 now names a mechanism that can actually slice a constant;
PROP-INV-07 asserts the partition rather than the form `TSPEC` §7.3 rejects; PROP-INV-11 and
PROP-WIRE-12 give the two orphaned conjuncts owning properties; PROP-INV-09's hand-off lands on a
property that exists. Nothing in the changed regions broke anything I had previously approved.

The two open findings are non-gating and both are one-clause edits: **F-01** (Medium) scope
PROP-OFF-05's empty-notice-set conjunct to the well-formed not-enabled case, so it does not read as
contradicting `TSPEC` §6's F-4/F-5 notices; **F-02** (Low) correct the routed `PLAN` item's site
count to six and name `PLAN`:158's T-18 row, which carries the operative form of the divergence.

The `PLAN` v0.7 / `TSPEC` v1.0 contradiction is upstream-vs-upstream and is not a defect of this
document. I re-raise it as an `ERRATUM: PLAN` in my trailer so the route does not rest on this
document's §Gaps entry alone, and I note that until `PLAN` converges, an implementer working from
`PLAN`'s T-11 and T-18 rows will write a partition that cannot close — this document's properties are
the ones to follow.

## Verdict
