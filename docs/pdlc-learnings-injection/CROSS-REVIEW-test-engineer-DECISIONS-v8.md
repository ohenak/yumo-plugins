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
actually has, stated over a named fixture — e.g. "framing is a **block constant of 528 bytes**
plus a per-document term of `51 + 2·len(path) + len(feature) + len(orderKey)` bytes; on this
repository's corpus at HEAD that is 684 bytes at one document and 1,607 at five, so a
fully-conforming block at REQ §4.1's defaults occupies up to roughly 21,600 bytes against a
`maxTotalBytes` of 20,000" — and make `D-O-4`'s parenthetical cite the same fixture. Any
arithmetic that is internally consistent and reproducible from a named fixture clears this.
