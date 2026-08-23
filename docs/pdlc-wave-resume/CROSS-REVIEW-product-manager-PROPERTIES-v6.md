# Cross-Review: product-manager — PROPERTIES (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md
**Date:** 2026-08-23
**Iteration:** 6

## Overview

**Scope of this round.** I re-reviewed only the delta. My v5 was a delta confirmation against
TSPEC v1.4 and returned **Needs revision** on one High (F-01) plus two Mediums and two Lows.
PROPERTIES has moved 1.3 → 1.5 since the bytes I reviewed (`91ce118c`); the diff is
`git diff 91ce118c..HEAD -- docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`, 158 lines,
touching the front-matter, two revision-history rows, PROP-OVERRIDE-01, PROP-OVERRIDE-05,
PROP-COV-03, two oracle rows, the mutation → oracle map, the run-depth paragraph, § 11's local-red
table, the PLAN-task trace and the routed-errata ledger. I did not re-read the sections that did not
move.

**Verdict of the delta: every v5 finding is resolved, and I verified each one against the upstream
document at HEAD rather than against the revision-history claim.**

| v5 finding | Sev | State | Evidence checked at HEAD |
|---|---|---|---|
| F-01 write-side conjunct + fifth mutation missing | High | **Resolved** | PROP-OVERRIDE-01 now carries the conjunct in both the property row and the oracle row; PROP-COV-03 counts five; the mutation → oracle map has the fifth row with T-07 as the task that runs it |
| F-02 §5.7 run-count row asserts "still open" | Medium | **Resolved** | The row now reads "**Closed by the owner** … routed at v1.1, landed at TSPEC v1.4", the `ERRATUM: TSPEC` routing is dropped, and the run-depth paragraph is restated as three-way agreement |
| F-03 §5.8 c8-include row asserts "open" | Medium | **Resolved** | The row reads "**Closed by the owner** … routed at v1.3 (PM F-02), landed at TSPEC v1.4"; § 11's measured baseline untouched, as I said it should be |
| F-04 PROP-OVERRIDE-05 rationale on the rejected-value conjunct | Low | **Resolved** | Restated on the discriminating conjunct — "emitted **before any resume decision runs**" — and it now names PROP-OVERRIDE-03's clamped past-the-end case as the counter-example, which is exactly TSPEC §2.4's argument |
| F-05 raw `TSPEC:838` anchor | Low | **Resolved** | No `TSPEC:838` remains anywhere in the file (`grep -nE '\.(md|js|mjs|json):[0-9]+'`) |

**What the revision also did, unprompted and correctly.** v1.5 is a second, self-initiated pass that
re-verified the routed-errata ledger against **PLAN** at HEAD, closing the two `ERRATUM: PLAN` halves
that had landed and adding the two missing PLAN-task trace rows (T-11, T-12). That work was not asked
for by any v5 finding and it closes a gap I would otherwise have raised this round — see
`## Fixtures`.

**What I found new.** Three Lows, all record-accuracy rather than substance: one mis-attributed PLAN
version in the revision history, one stale "this round" in a ledger row, and one new raw `file:line`
anchor. No property, oracle, fixture or requirement mapping is wrong. Nothing blocks.

**Lens note.** This is the product lens: requirement traceability, acceptance-criterion fidelity,
scope. Test-design depth and engineering feasibility stay with te-review and se-review.

## Properties

### PROP-OVERRIDE-01 now owns AT-05 whole (v5 F-01, High — resolved)

The property row at HEAD adds:

> **Write-side conjunct (AT-05, TSPEC v1.4):** the operator-pointed run must itself **write** a
> record — `ledgerWrites(writes)` is non-empty and the written `lastGreenWave` is the
> **plan-absolute** number of the last wave this run completed, never a run-relative count — so a
> build that suppresses the write while `explicitPointer` is true reds here rather than nowhere
> (TSPEC §5.5 mutation 5).

That is a faithful transcription of upstream, not a paraphrase: TSPEC §5.4's AT-05 row carries
"**Write-side conjunct (PM):** … `ledgerWrites` is non-empty and the written `lastGreenWave` is the
**plan-absolute** number of the last wave this run completed, not a run-relative count", and TSPEC
§5.5's fifth mutation says it is "Killed **only** by AT-05's write-side conjunct" (TSPEC
§5.4 AT-05 row; §5.5 mutation 5). The `Traces` cell grew to
`AT-05 (TE F-05), BR-04, REQ-WVR-04, REQ-WVR-09, TSPEC §5.5 row 5` — REQ-WVR-09 is a real
requirement (`REQ-pdlc-wave-resume.md` § "REQ-WVR-09 — a wave that was verified but not committed is
never recorded complete (P0, Phase 1)"), and it is the right one: the failure this conjunct now
catches is precisely "the operator's recovery run leaves no record to recover from next time",
which is the REQ-WVR-04 + REQ-WVR-09 pairing I argued for in v5. The product-level hole I named —
a build that passes every property while removing resume from the operator's recovery path — is
closed.

### PROP-COV-03 now counts five, and the count's owner is named (v5 F-01, second half — resolved)

PROP-COV-03 reads "Each of TSPEC §5.5's **five** mutations … TSPEC §5.5 owns the count and PLAN §4.3
agrees with it at HEAD: PLAN v1.4's §4.3 carries the fifth row (suppressed write under
`explicitPointer`, oracle `AT-05's **write-side** conjunct only`, owner T-07)". Verified against the
document, not the claim: PLAN §4.3 is headed "Mutation resistance — **five** mutations, each with an
owner who **runs** it" and its fifth row is
`| Suppress the record write while explicitPointer is true (write only on automatic runs) | AT-05's **write-side** conjunct only … | T-07 |`. PLAN T-07's task row carries the matching duty
("**Mutation duty (§4.3 rows 1–5, including row 5's suppressed write on operator-pointed runs, whose
only oracle is AT-05's write-side conjunct)**"), and PLAN §4.5's DoD checkbox and RK-5's sizing both
say five. The three-way agreement PROP-COV-03 asserts is real. My v5 Q-01 — should PROP-COV-03 trace
to TSPEC §5.5 as the count's owner — is answered in the document rather than deferred.

**One record-accuracy slip in the same material (F-01, Low).** The v1.5 revision-history row says
"PLAN §4.3 landed its fifth mutation row at **PLAN v1.4**". PLAN's own revision history files that
landing at **v1.3** ("| 1.3 | … **F-01 (High, both reviewers, unlanded since v4) landed:** §4.3 gains
a **fifth** mutation row"); PLAN v1.4 is the round-6 pass that corrected RK-5's sizing from four to
five. PROP-COV-03's own wording ("PLAN v1.4's §4.3 carries the fifth row") is *true* — it carries it
at v1.4 — so no property text is wrong; only the revision history mis-cites the landing version. This
is the same class of defect as my v5 F-02/F-03, where I asked for the landing version to be recorded,
so it is worth getting right: change "at PLAN v1.4" to "at PLAN v1.3 (carried unchanged at v1.4)".

### PROP-OVERRIDE-05's rationale now matches TSPEC's discriminator (v5 F-04, Low — resolved)

The rejected-value framing is gone. At HEAD the property says the notice "is emitted **before any
resume decision runs**, so no provenance has been resolved when it is written — TSPEC §2.4 names this
first conjunct as the discriminating one. Being 'about a rejected value' does not discriminate: a
clamped past-the-end pointer is also a rejected value yet its notice **does** carry the token
(PROP-OVERRIDE-03's own case)." That is TSPEC §2.4's exclusion column restated, including the
counter-example TSPEC uses. The oracle is unchanged, as I said it should be, so the announcement
catalogue's count of three changed shipped assertions is undisturbed.

### Properties confirmed unaffected

No other property row moved in this diff. PROP-OVERRIDE-02/-03/-04, the PROP-RECORD, PROP-DISREGARD,
PROP-SKIP, PROP-SAFETY, PROP-REPO, PROP-LAW and PROP-PRE families are byte-identical to the set I
approved at v4 and re-confirmed at v5; I did not re-litigate them.

## Oracles

### The write-side oracle is an assertion, not new machinery — as forecast

PROP-OVERRIDE-01's oracle row gains:

> Write-side conjunct: `expect(ledgerWrites(writes)).not.toEqual([])` and the last written record
> parses to `lastGreenWave: 3` — the plan-absolute last wave — on the `startWave: 2` fixture.

Three things I checked, in the order that matters for my lens:

1. **No implementation echo.** The expected value is the literal `3`, transcribed from the fixture's
   shape (`PLAN_THREE_WAVES`, `configWithStartWave(2)`), not read back out of the module. A
   run-relative implementation would write `2` — the mutation TSPEC §5.5 row 3 already covers — and a
   suppressed write would leave `ledgerWrites` empty. Both fail this row.
2. **No absence-only oracle.** `not.toEqual([])` is a negative form, but it is paired **in the same
   conjunct** with the positive `lastGreenWave: 3` parse on the last write. The positive half is what
   carries the claim; the negative half is redundancy, not the oracle. This is the discipline the rest
   of the document already applies (PROP-SKIP-04, PROP-OVERRIDE-03).
3. **It reuses existing fixture support.** `ledgerWrites(writes)` is declared in `## Fixtures` and
   already used by PROP-RECORD-01's `expect(ledgerWrites(writes)).toEqual([])`. The oracle's own
   rationale says so ("Same fixture, same `writes` capture — the cost is one assertion, not new
   machinery"), which is exactly the resolution I recorded in v5.

The rationale cell also states why this conjunct is load-bearing rather than decorative: "a write
suppressed while `explicitPointer` is true leaves AT-07, AT-15 and AT-18 green because those drive
automatic-provenance runs". TSPEC §5.5's fifth mutation says the same in the same terms ("Without
this mutation leaves AT-05, AT-07, AT-15 and AT-18 green"). Consistent.

### PROP-COV-03's oracle row updated with the mutation the count added

The oracle row moved from "For each of the four mutations" to "For each of the five mutations", and
its rationale now names **two** rows as the ones that most need an observed run rather than a
predicted one — the eager probe and the suppressed operator-pointed write, "killed only by
PROP-OVERRIDE-01's write-side conjunct". The "apply / run only the named oracle's file / paste the
failure header / `git checkout --`" mechanics are unchanged, so the evidence obligation is uniform
across all five.

### The mutation → oracle map is complete against upstream

The map's preamble is now "Five mutations, each with the property that must red and the task that
must **run** it (TSPEC §5.5, which owns the count; PLAN §4.3 at v1.4 carries the same five rows with
the same owners, so this map, TSPEC and PLAN agree)", and the fifth row reads:

> | Suppress the record write while `explicitPointer` is true (write only on automatic runs) |
> PROP-OVERRIDE-01's write-side conjunct only — `ledgerWrites` non-empty with the plan-absolute
> `lastGreenWave` on the `startWave: 2` fixture (TSPEC §5.5 row 5); every automatic-provenance
> property stays green under it | T-07 |

The "property that must red" column is populated, which was the precise defect in v5 (adding the row
with an empty column would have produced a mutation the implementer applies and watches stay green).
Owner T-07 matches PLAN §4.3's owner cell and PLAN T-07's mutation duty. The set of five rows here is
row-for-row the set of five in PLAN §4.3 — I compared them as sets, not by count, so a substituted row
would have shown up.

### Oracles confirmed unaffected

No other oracle row moved. PROP-SKIP-04's flattened `add`-list oracle, PROP-DISREGARD-07/-08's
`toEqual` call-list oracles, PROP-OVERRIDE-04(iii)'s `IMPLEMENTATION_DEFAULTS` set equality,
PROP-DISREGARD-11's six-row table case and PROP-LAW-01…04's `{ numRuns: 500 }` sites are unchanged
and remain aligned with TSPEC v1.4.

## Fixtures

Nothing in the fixture machinery moved this round — `makeLedgerArgs`, `ledgerWrites`,
`PLAN_THREE_WAVES`, `CONFIG_WITH_TEST_COMMAND`, `configWithStartWave(n)`, the invalid-`startWave`
fixture, the H-1/H-2 harness extensions and the six generators are byte-identical. What moved is the
ledger material that lives in and around this section, and that is where my two remaining Lows sit.

### The run-depth paragraph now records agreement (v5 F-02 — resolved)

The paragraph that read "**Note the divergence, and it is routed rather than resolved here**" now
reads "All three documents now agree: TSPEC v1.4 §5.7 pins `numRuns: 500` on this same precedent,
matching PLAN T-08 and PLAN §4.5 — the divergence this paragraph recorded through v1.3 was closed by
the owner when the routed erratum landed, and no run-depth decision remains open." Verified: TSPEC's
v1.4 revision row records "§5.7: generative count **pinned `numRuns: 500`** on the
`advisoryHelperProperties.test.js` precedent". The `advisoryHelperProperties.test.js` precedent file
exists in the tree (`pdlc/workflows/__tests__/advisoryHelperProperties.test.js`), so the citation
resolves.

### The routed-errata ledger now describes HEAD (v5 F-02, F-03 — resolved; and more)

Both rows I flagged are re-labelled and de-routed, and the `**What this document does with the open
items**` paragraph is rewritten from "following PLAN T-08 **rather than** TSPEC §5.7" to agreement
with both. Two `ERRATUM: TSPEC` items remain routed, and I re-verified each against upstream at HEAD
rather than taking the row's word:

| Remaining routed item | Still genuinely open? |
|---|---|
| TSPEC §5.4 AT-12's fourth conjunct asserts a commit this suite cannot observe | **Yes.** TSPEC's AT-12 row at HEAD reads "*Fourth conjunct:* Phase PT dispatches exactly **one** agent and invokes the gate exactly **once**, and its commit is the only Phase-I-adjacent commit" — the round-5 erratum reworded it without removing the unobservable half, exactly as the row now says. The row's re-quotation of the v1.4 wording is accurate. |
| TSPEC §5.4 AT-16 / the queue-fixture rationale rests on the retired `distribution.checkEnabled` drift gate | **Yes for the TSPEC half.** The `ERRATUM: PLAN` half is correctly closed: PLAN T-04 at HEAD re-files the opt-out as "**inert and optional**: the distribution drift gate that opt-out addressed has been retired from `orchestrate-queue.js`", and PLAN's v1.2 revision row records the correction. |

The self-initiated PLAN re-verification is the substantive addition here, and it is right on both
counts. PLAN v1.2's revision row states T-11 and T-12 were added as batch-1 precondition tasks and
that "**T-11** promotes `docs/pdlc-wave-resume/**` onto A-1's frozen glob list — `A1_GLOBS` in
`documentOracles.test.js` plus the matching row in `docs/_constraints/pdlc-retirement-baseline.md`".
§ 11's local-red row is correspondingly restated from "**No PLAN task owns it**" to "**PLAN T-11 owns
it** … the entry is still absent at HEAD". I confirmed the residual red is real: `A1_GLOBS` in
`pdlc/workflows/__tests__/documentOracles.test.js` lists `docs/pdlc-plugin-retirement/**`,
`docs/pdlc-advisory-wave-gate/**` and `docs/pdlc-learnings-injection/**` and no
`docs/pdlc-wave-resume/**` entry. Recording the owner *and* keeping the red is the correct pairing —
a closed routing with the red silently dropped would have been the worse outcome.

**F-02 (Low).** The AT-16 row's state cell still opens "**Open, and newly raised this round.**" That
sentence was written for the v1.2 round; this is v1.5, and the row was edited in this very pass (its
closing clause now records the PLAN half as closed). A reader at HEAD takes "this round" as round 6.
Restate as "Open; raised at v1.2, unchanged at TSPEC v1.4" — the same treatment the A-1 glob row
already received ("**Raised at v1.3 (SE F-07); closed by the owner since.**").

**F-03 (Low, Process).** The revision replaced my v5 F-05 anchor `TSPEC:838` and introduced a new raw
`file:line` anchor in its place elsewhere: § 11's local-red row and the A-1 glob routed-errata row
both cite `documentOracles.test.js:712`. The line is currently accurate — `A1_GLOBS` is declared
there — but position is not the claim under test (the claim is that a glob entry is *absent* from the
list), so DEC-DOC-01 applies exactly as it did to `TSPEC:838`: cite the symbol, `A1_GLOBS` in
`documentOracles.test.js`, which the same sentence already names. Process scope per
`docs/_decisions/DECISIONS-review-severity-bars.md` DEC-DOC-01, whose own context paragraph cites
`orchestrate-dev.js:1842` as the archetype, so code anchors are in scope, not just document ones.

### The PLAN-task trace is now complete — a gap I would have raised

The trace table grew rows for **T-11** and **T-12**, PLAN v1.2's two precondition tasks, both
correctly property-free with the reason stated rather than assumed. I checked the claim in each row
against PLAN: both T-11 and T-12 carry the literal `**ATs:** none; this is a wave-gate precondition.`
The table now covers all nine live PLAN tasks (T-01, -02, -03, -04, -07, -08, -10, -11, -12) with
`T-05`/`T-06`/`T-09` explicitly recorded as retired and unreused — a set-equality read against PLAN
§4.6's measured nine, not a containment read. T-12's row makes the sharpest point in the addition:
it is distinct from PROP-REPO-01/-03 because "neither can falsify a path that was tracked before
those rules existed", which is the honest reason an index-only task carries no property.

Every test file named in the trace is either present or explicitly marked new:
`waveExecution.test.js` and `documentOracles.test.js` exist under `pdlc/workflows/__tests__/`;
`waveResume.test.js`, `waveResumePreflight.test.js`, `waveResumeRepoState.test.js`,
`waveResumeQueueParity.test.js` and `waveResumeProperties.test.js` are each marked *(new)*.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | The v1.5 revision-history row says "PLAN §4.3 landed its fifth mutation row at **PLAN v1.4**". PLAN's own history files that landing at **v1.3** ("§4.3 gains a **fifth** mutation row"); v1.4 is the round-6 pass that corrected RK-5's sizing. PROP-COV-03's body ("PLAN v1.4's §4.3 carries the fifth row") is true and needs no change. Restate the history row as "landed at PLAN v1.3, carried unchanged at v1.4". | TSPEC §5.5 / PLAN §4.3 (record accuracy) |
| F-02 | Low | Local | The AT-16 routed-errata row still opens "**Open, and newly raised this round.**" — phrasing written for the v1.2 round, in a document at v1.5 whose row was edited in this pass. Restate as "Open; raised at v1.2, unchanged at TSPEC v1.4", matching the treatment the A-1 glob row already received. | TSPEC §5.4 AT-16 |
| F-03 | Low | Process | § 11's local-red row and the A-1 glob routed-errata row cite `documentOracles.test.js:712` as a raw `file:line` anchor. Position is not the claim under test (the claim is that a glob entry is absent), so DEC-DOC-01 applies as it did to the `TSPEC:838` anchor this round removed. Cite the symbol `A1_GLOBS` in `documentOracles.test.js`, which the same sentence already names. | DECISIONS-review-severity-bars.md DEC-DOC-01 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | § 11's local-red table records the `PROP-SWEEP-2(b)` red as owned by PLAN T-11 and still present at HEAD. T-11 is a batch-1 precondition and the wave gate runs the whole suite — is there anything this document should say about the *ordering* consequence (batch 1's gate is unsatisfiable until T-11 lands), or is that entirely PLAN's to carry? I read it as PLAN's, and raise it only so the answer is on the record rather than inferred. |

## Positive Observations

- **The High closed exactly as scoped, and no wider.** PROP-OVERRIDE-01 gained one conjunct,
  PROP-COV-03 one number, the mutation map one row. No property was deleted, weakened or reworded
  around the edges — which is what makes a delta re-review cheap and is worth saying out loud.
- **The revision verified upstream rather than trusting it.** The write-side conjunct is transcribed
  in TSPEC's own words, the fifth mutation's owner matches PLAN's owner cell, and the `Traces` cell
  picked up REQ-WVR-09 — the requirement that actually explains why a suppressed write is a product
  failure and not just a missing assertion.
- **v1.5 is unprompted correctness work.** No v5 finding asked for the PLAN re-verification or the
  T-11/T-12 trace rows; the author went and checked the ledger against PLAN at HEAD anyway, closed
  the two landed `ERRATUM: PLAN` halves, and kept the still-real red recorded with its owner. Closing
  a routing while keeping the red is the harder, right call.
- **The two remaining `ERRATUM: TSPEC` items are genuinely open.** I re-read both against TSPEC at
  HEAD. Neither is a re-raise of a settled question, which is the DEC-ERR-01 trap this ledger is most
  exposed to.

## Recommendation

**Approved with minor changes**

Every v5 finding — the High and both Mediums and both Lows — is resolved and verified against the
upstream document at HEAD, not merely asserted in the revision history. The three findings above are
record-accuracy nits (one mis-cited PLAN version, one stale "this round", one raw line anchor); none
touches a property, an oracle, a fixture or a requirement mapping, and none blocks. They can be folded
into the next edit this document takes for any reason, or landed as a single Low pass.

## Delta-Confirmation Findings

## Verdict
