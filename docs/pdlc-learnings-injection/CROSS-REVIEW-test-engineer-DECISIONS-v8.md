# Cross-Review: test-engineer — DECISIONS (revision round, frozen)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.4, sha256:7dda3534…, commit `6f28eded`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v7.md` (v0.3, sha256:56617f5a…, commit `e29a296e`)
**Date:** 2026-08-21
**Iteration:** 8

## Context

The delta under review is three commits, `e29a296e` → `6f28eded`, +24/−6 lines, all of it aimed at
the two Mediums I carried unlanded from v6 into v7:

| Commit | Substance | Answers |
|---|---|---|
| `b909ead8` | `DEC-LI-08` gains a **What the caps bound (FSPEC v0.13)** paragraph: the three thresholds bound *material*, framing is charged to none of them, the shipped renderer agrees, and framing's measured cost is recorded as a pair of numbers | v7 F-01 |
| `f75140e3` | `D-O-3` gains an explicit zero-bound conjunct; `D-O-4` is split into realised **material** bytes and realised **block** bytes so the C-8 gap's closing condition compares commensurable quantities | v7 F-02, v7 F-01 |
| `6f28eded` | Version bumped 0.3 → 0.4, round-6 changelog prepended | — |

Both v7 findings are substantively landed. The zero-bound conjunct is correct against the shipped
code: `extractInjectableMaterial` short-circuits on `maxBytes <= 0` returning
`{material: "", bounded: false, bytes: 0, sections: []}` before any cut, and `selectLearnings`
routes `sections.length === 0` to `RSN-NO-MATERIAL` consuming no slot
(`pdlc/workflows/orchestrate-dev.js`, `extractInjectableMaterial` / `selectLearnings`). Every
upstream anchor the new text cites resolves: FSPEC §"The byte-accounting basis" (FSPEC:489),
§"How the per-document bound binds" (FSPEC:500), `E-36` (FSPEC:798), `AT-30` (FSPEC:967-971),
BR-8's *bytes injected* row (FSPEC:560) and its run-level scalar (FSPEC:563), REQ AC-2.3's "the
material taken" (REQ:291-294), and REQ §4.1's 5 / 6,000 / 20,000 (REQ:224-226), which match
`LEARNINGS_DEFAULTS` in the shipped module exactly.

What the delta also introduced is a **quantitative** claim — framing's measured cost, stated as a
pair of numbers and a derived cap-overrun figure — and that claim does not survive re-measurement
on the shipped renderer. That is the whole of this round.

Upstream moved underneath this document since v7 (FSPEC v0.13 → **v0.14**, REQ v0.9 → **v0.10**).
I re-derived both deltas; neither invalidates anything this document asserts. Details below.

## Options Considered

**(a) Approve — the delta lands both carried Mediums and the decision itself is untouched.**
Tempting, and correct about the decision: *which* quantities bound is what `DEC-LI-08` decides,
and that is unchanged. Rejected because the delta did not only restate the accounting basis —
it added a measurement, presented as fact about HEAD ("Measured on the shipped renderer at
HEAD"), and the measurement is wrong in a way a downstream test author can transcribe. This is
squarely a defect the revision introduced (freeze criterion (i)) and a contradiction with the
repository at HEAD (criterion (ii)).

**(b) File the measurement as Medium — "numbers are illustrative, the obligation stands."**
Rejected on the transcription hazard. Team rule: *expected values are literal transcriptions from
the spec, never derived from the code under test*. A PROPERTIES or DoD author writing `D-O-4`'s
report assertions has exactly two literals to transcribe from a governing document — 694 and
1,012 — and both are presented as measured constants. Transcribing them produces an oracle that
is either red against the real corpus or, worse, green against a synthetic fixture chosen to make
them true. The derived headroom figure ("roughly **21,012** bytes against a `maxTotalBytes` of
20,000") is the number an operator would read as the size of the acknowledged C-8 gap, and it
understates that gap on the actual corpus by ~600 bytes. That is load-bearing.

**(c) Block on the stale header pin (FSPEC v0.13 / REQ v0.9 vs v0.14 / REQ v0.10 at HEAD).**
Rejected. I re-derived both upstream deltas rather than trusting the version numbers. FSPEC v0.14
restates BR-6's *total* bound over the window the count bound leaves and states the mixed
count/byte attribution (FSPEC:83-90); REQ v0.10 carries the matching AC-2.4 attribution clause.
Neither touches the byte-accounting **basis** (still material-only, FSPEC:489, landed in v0.13),
`E-36`/`AT-30`, or anything `D-O-3`/`D-O-4`/`DEC-LI-08` assert. The pin is stale, not false in
substance — Medium, non-gating, and the kind of staleness this document has now absorbed twice.

**(d) Block on the grounding pin's scope.** The pin says every code claim below was read
*before any production edit for this feature had landed* (§Scope). The delta's new claims are
explicitly read on **post-implementation** HEAD ("the shipped renderer", "shipped
`extractInjectableMaterial`'s `maxBytes <= 0` early return"). The claims are true; the pin that
governs them is now over-broad. Recorded as Medium — it misdescribes provenance, it does not make
a design claim false.

## Decision

**Needs revision**, on one High finding introduced by this delta: the framing measurement in
`DEC-LI-08` (and repeated in `D-O-4`) is not reproducible on the shipped renderer, and the two
numbers cannot both come from the same fixture.

**How I measured.** `renderLearningsBlock({selected})` at HEAD
(`pdlc/workflows/orchestrate-dev.js`) with `material: ""` for every selected document, so the
rendered length *is* the framing cost. Framing is not a constant: it is a fixed block term plus a
per-document term that scales with the document's path length, its extracted feature name, its
`orderKey`, and the `ABRIDGED` annotation when present — which is exactly what TSPEC §D.5 already
says ("a framing constant **plus one opener/closer pair per selected document**",
TSPEC:989). Measured:

| Fixture | 1 document | 5 documents |
|---|---|---|
| `docs/{f}/LEARNINGS-{f}.md`, `f = "pdlc-learnings-injection"` | **694** | **1,562** |
| `docs/{f}/LEARNINGS-{f}.md`, `f = "alpha"` | 599 | 1,087 |
| `docs/{f}/LEARNINGS-{f}.md`, `f = "f1"` | 584 | **1,012** |
| The real corpus at HEAD (`git ls-files 'docs/**/LEARNINGS-*.md'`, first five) | 684 | **1,607** |
| Floor (1-char paths, empty `orderKey`) | 528 | 732 |

So both numbers are individually reachable — 694 from a 24-character feature name at one
document, 1,012 from a **two**-character feature name at five — but no single fixture yields the
pair. Under the fixture that produces 694, five documents cost **1,562**; under the fixture that
produces 1,012, one document costs **584**. On the corpus this feature will actually inject in
this repository, five documents cost **1,607**, so the headroom sentence should read ~21,607, not
"roughly **21,012**". The document states the pair as one measurement of one system at HEAD, and
calls the resulting gap "a known constant"; on the shipped renderer it is neither one measurement
nor a constant.

**Why this is inside the freeze.** It is not a preference, a restructuring, or a decision I would
have taken differently. It is (i) a defect this delta introduced — the numbers did not exist in
v0.3 — and (ii) a claim about the repository at HEAD that re-measurement falsifies, load-bearing
because `D-O-4`'s obligation is *the* closing condition for the acknowledged C-8 gap and the
21,012 figure is that gap's stated size.

**What must change (smallest edit that resolves it).** Keep the decision, the accounting basis,
and both obligations exactly as they are. Replace the two bare numbers with the shape the cost
actually has, stated over a named fixture — e.g. "framing is a **block constant of 477 bytes**
plus, per selected document, `49 + 2·len(path) + len(feature) + len(orderKey)` bytes (plus the
`ABRIDGED` annotation when present); on this
repository's corpus at HEAD that is 684 bytes at one document and 1,607 at five, so a
fully-conforming block at REQ §4.1's defaults occupies up to roughly 21,600 bytes against a
`maxTotalBytes` of 20,000" — and make `D-O-4`'s parenthetical cite the same fixture. Any
arithmetic that is internally consistent and reproducible from a named fixture clears this.

## Consequences

**What the delta got right, and what it changes for a test author.** Two things improved, both
toward tests that can fail:

1. **`D-O-3` now has a bound domain.** v7's F-02 was that the obligation's
   `extractInjectableMaterial` clause ("byte bound, whole-character prefix, `bounded` exactly at
   the cut") quantified over a domain that silently excluded zero, while FSPEC v0.13 had decided
   zero the other way. The new conjunct states it: `maxBytesPerDocument: 0` yields no material,
   sets no `bounded` flag, drops the document with `RSN-NO-MATERIAL`, and consumes no slot —
   which is what the shipped code does on both arms (`maxBytes <= 0` early return; the
   `sections.length === 0` branch). A property author now knows the bound domain includes 0 and
   that 0 is **not** a cut-and-flag case, so the generator will not be written over `maxBytes >= 1`
   and quietly leave `AT-30`'s arm to example coverage alone.
2. **`D-O-4` now names two quantities instead of one.** The pre-delta obligation asked for
   "realised prompt sizes measured against REQ §4.1's caps", which under material-only accounting
   compares incommensurable quantities: every conforming block would read as over-cap by framing.
   The split — material bytes (commensurable with the caps, equal to BR-8's *bytes injected*,
   FSPEC:560/563) and block bytes (the growth term a future displacement decision acts on) — is
   the right shape, and it is what makes the C-8 gap closable rather than perpetually "over".

**What the High costs.** Only the numbers, but they sit in the one place a downstream author will
reach for literals. `D-O-4` is a PROPERTIES/report obligation; the two figures it repeats are
presented as measured constants of the shipped renderer, and an expected value transcribed from a
governing document is precisely what our expectation rule says to trust. Nothing else in the delta
depends on them: strike or restate the arithmetic and the accounting paragraph, the split
obligation and the zero-bound conjunct all stand unchanged.

**Upstream motion, re-derived rather than assumed.** Since v7 the document's upstream advanced —
FSPEC v0.13 → v0.14 (BR-6's total bound restated over the count-bound *window*; mixed count/byte
attribution to `RSN-COUNT`; FSPEC:83-90) and REQ v0.9 → v0.10 (matching AC-2.4 attribution
clause). I checked each against what this document asserts: the byte-accounting basis is untouched
(FSPEC:489 still material-only), `E-36` still decides `maxBytesPerDocument: 0` as no-material /
no-slot (FSPEC:798), `AT-30` still carries all three zeros (FSPEC:967-971). So the header's
"grounded on upstream **at HEAD**: TSPEC v0.9, FSPEC v0.13, REQ v0.9" is stale as a version pin
while remaining true in substance — Medium, and a third consecutive round in which a version
cascade underneath this document had to be re-derived by hand. I keep the `Process` finding from
v7 open for that reason.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **Delta-introduced: framing's "measured" cost is not reproducible, and the two figures cannot come from one fixture.** `DEC-LI-08` states "Measured on the shipped renderer at HEAD: framing costs **694 bytes** for a one-document block and **1,012 bytes** for a five-document block, so … a fully-conforming block occupies up to roughly **21,012** bytes"; `D-O-4` repeats "(measured 694 bytes at one document, 1,012 at five)". Re-measured on `renderLearningsBlock` at HEAD with empty `material`: 694 is the one-document cost for a 24-character feature name (`docs/pdlc-learnings-injection/LEARNINGS-pdlc-learnings-injection.md`), whose five-document cost is **1,562**; 1,012 is the five-document cost for a **two**-character feature name (`docs/f1/LEARNINGS-f1.md`), whose one-document cost is **584**. On this repository's real corpus (`git ls-files 'docs/**/LEARNINGS-*.md'`, first five) the costs are **684** and **1,607**, so the derived headroom is ~21,607, not 21,012. Framing is also not "a known constant": it is a block constant plus a per-document term scaling with path length, feature name, `orderKey` and the `ABRIDGED` annotation — which TSPEC §D.5 already states (TSPEC:989). Downstream hazard is concrete: `D-O-4` is the obligation a PROPERTIES/report author reads, and 694 / 1,012 are the only literals it offers to transcribe. Fix: state framing as constant-plus-per-document over a **named** fixture (block constant 477 bytes; per document `49 + 2·len(path) + len(feature) + len(orderKey)`), and make the headroom sentence follow from that same fixture. Decision, accounting basis and both obligations need no other change | `DEC-LI-08` §"What the caps bound (FSPEC v0.13)"; obligations table `D-O-4` |
| F-02 | Medium | Local | **The grounding pin no longer covers the delta's code claims.** §Scope pins "Every code claim below was read on `feat-pdlc-learnings-injection` at HEAD on 2026-08-19, before any production edit for this feature had landed — so every citation describes the *pre-feature* codebase". The new paragraph cites post-implementation code by design ("The shipped renderer agrees — `renderLearningsBlock` …", "shipped `extractInjectableMaterial`'s `maxBytes <= 0` early return and `selectLearnings`'s `sections.length === 0` branch"). Both claims are true at HEAD; the pin that governs them is now over-broad, so a reader cannot tell which citations are pre-feature evidence for a design choice and which are post-hoc confirmation that the code matches. Fix: one clause in the pin distinguishing pre-feature grounding citations from shipped-code confirmations added in later rounds | §Scope, grounding pin; `DEC-LI-08`; `D-O-3` |
| F-03 | Medium | Local | **Header pin is stale against HEAD: FSPEC is v0.14 and REQ is v0.10.** The Upstream row and §"Upstream version note" both pin FSPEC v0.13 / REQ v0.9 / TSPEC v0.9 and assert "No live upstream gap remains". I re-derived both upstream deltas: FSPEC v0.14 restates BR-6's total bound over the count-bound window and states the mixed count/byte attribution (FSPEC:83-90); REQ v0.10 carries the matching AC-2.4 clause. Neither contradicts anything here — the accounting basis (FSPEC:489), `E-36` (FSPEC:798) and `AT-30` (FSPEC:967-971) are unchanged — so this is a stale pin, not a false design claim. Non-gating, but the present-tense "at HEAD" wording is what makes it read as a live assertion. Fix: re-pin, and note in `DEC-LI-08` that FSPEC v0.14's window restatement leaves the byte-accounting basis untouched | Header Upstream row; §"Upstream version note" |
| F-04 | Low | Process | **Third consecutive round turning on a version cascade re-derived by hand.** v6, v7 and now v8 each spent their re-review budget confirming whether present-tense claims about sibling documents still hold, and each time the check was manual. A mechanical sweep (grep present-tense sibling citations, diff the cited anchors' current text against the quoted bytes) would surface F-03 without a reviewer re-reading three upstream documents. Recorded for harvest, not re-filed against this document | §Scope, grounding pin; process |

**DEFERRED items** (freeze scope — observations, not blocking findings, and not decisions to reopen):

DEFERRED: `DEC-LI-08`'s "That gap is a known constant, not a leak" would read more precisely as "a known, bounded growth term" once F-01's arithmetic is restated.
DEFERRED: `D-O-4`'s two quantities are named but not given report field names; the field-naming question belongs to the report contract, not this document.
DEFERRED: `D-O-3`'s zero-bound conjunct now carries a code citation inside an obligation row; the row is long enough that a reader may miss the `AT-30` anchor at its end.
DEFERRED: `DEC-LI-08`'s §"Stated honestly" now distinguishes material-crowding from block-crowding, which arguably makes the C-8 gap a two-trigger re-evaluation rather than one; the trigger list still names one.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does `D-O-4`'s realised-**block**-bytes quantity want a falsifying test at all, or is it purely an operator report field? If a property is expected to pin it, that property is the one place where framing's constant-plus-per-document shape must be transcribed correctly — which is why F-01's arithmetic matters beyond prose. |
| Q-02 | (Carried from v7, still open.) `D-O-6` is now the sole falsifier of a wrongly-`null` `corpusOutcome`. Should PROPERTIES additionally carry a *mutation* check on it — revert the `RSN-UNLISTABLE` record on the failing dispatch and expect RED — given that no other obligation would see the regression? |

## Positive Observations

- The accounting paragraph fixes the real problem behind v7's F-01, which was never the wording:
  the caps and the reported quantity had different referents, so the C-8 gap could never be
  reported as closed. Splitting `D-O-4` into commensurable and growth-term quantities is the
  correct structural fix, and it is stated in the vocabulary FSPEC already uses (*bytes injected*,
  FSPEC:560).
- `D-O-3`'s zero-bound conjunct is exactly the anti-vacuity the obligation needed. It names the
  bound domain, states the outcome on both arms, and cites the code that implements each arm — so
  a property author cannot write the generator over `maxBytes >= 1` and believe the obligation is
  discharged.
- Every non-numeric claim the delta added checks out byte-for-byte against HEAD: the renderer's
  concatenation order, the `maxBytes <= 0` short-circuit's exact return literal, the
  `sections.length === 0` branch, and all five upstream anchors.
- The delta is small, surgical, and touched nothing it did not need to. Nothing that was approved
  in v7 regressed.

## Recommendation

**Needs revision** — one High (F-01), delta-introduced and falsified by re-measurement on the
shipped renderer. The fix is arithmetic in two places; the decision, the accounting basis, and
both restated obligations are correct and should not change. F-02 and F-03 are Medium and
recorded; F-04 is routed to harvest.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
