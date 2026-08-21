# Cross-Review: product-manager — DECISIONS (delta re-review, frozen round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 8
**Scope:** Local

## Context

My v7 review approved the DECISIONS bytes at `REVIEWED-COMMIT: e29a296e` (`APPROVAL-HASH:
sha256:56617f5a…`) with two Low findings and no High. Three commits have landed on the document
since: `b909ead8` (restate `DEC-LI-08`'s caps as bounding material, not the rendered block),
`f75140e3` (add `D-O-3`'s zero-bound conjunct, split `D-O-4` into material bytes and block bytes),
and `6f28eded` (bump to v0.4 with the round-6 changelog). The delta is 24 insertions and 6
deletions in one file — the header changelog row, one new paragraph plus a rewritten **Stated
honestly** paragraph inside `DEC-LI-08`, and rewritten `D-O-3` / `D-O-4` obligation rows. Nothing
else in the document moved, so per the delta protocol I scanned only those sections.

Upstream state at HEAD is unchanged from what v7 recorded and verified: REQ `sha256:ff605dd3…`
(v0.9), FSPEC `sha256:ae75fa62…` (v0.13), TSPEC `sha256:22dee8ce…` (v0.9). The document's header pin
therefore still matches HEAD. Note for the orchestrator, not a finding against this document: the
**working tree** (uncommitted) carries in-flight errata that bump REQ to v0.10 and FSPEC to v0.14
(`RSN-COUNT` versus `RSN-BYTES` attribution, DoD round 1 / CODE_REVIEW v1 F11). Those edits change
the *count/total interaction*, not BR-6's byte-accounting basis, so they do not contradict anything
in this delta — but they will make this document's header pin stale the moment they commit.

Because the round is frozen, I judged each delta passage on two questions only: did it break
something that worked at `e29a296e`, and does it contradict the repository at HEAD? I verified
every claim by running the shipped renderer and reading the shipped selection code, not by
re-reading the prose.

## Options Considered

Three readings of the delta were open when I started. Each was settled by executing or reading the
shipped code, not by comparing prose.

**Reading A — the `DEC-LI-08` accounting-basis paragraph merely restates FSPEC and is safe.**
Partly true, and the qualitative half checks out exactly. FSPEC `BR-6` §"The byte-accounting basis"
at HEAD reads "a document's **contributed bytes** are its **material** … Framing carries no byte
charge: the identification line, the document's delimiters and source-path label, and the block's
preamble (BR-7) count toward none of the three quantities" (`FSPEC` §BR-6, "The byte-accounting
basis"), and the shipped `renderLearningsBlock` agrees: it wraps `doc.material` in
`LEARNINGS_BLOCK_HEADER`, `LEARNINGS_BLOCK_PREAMBLE`, a per-document `<<< path — feature f,
completed date >>>` / `<<< end path >>>` pair and `LEARNINGS_BLOCK_TRAILER`, and never recomputes
`bytes` (`pdlc/workflows/orchestrate-dev.js` at HEAD, `renderLearningsBlock`, and the `bytes` field
set only inside `extractInjectableMaterial`). The entry's own conclusion — that *which* quantities
bind is what it decides, and a static bound stays static under either basis — is sound. What is not
safe is the quantitative half the same paragraph adds; see Reading B.

**Reading B — the two measured framing figures are reproducible constants of the shipped
renderer.** Rejected, and this is the delta's one defect. Framing is not a constant: every
per-document frame contains the document's own path **twice** (opener and closer) plus its feature
name and order key, so framing scales with corpus path lengths, and a `bounded` document adds a
further ` (ABRIDGED: bounded at N bytes)` clause. I ran the HEAD renderer directly. Its fixed part
— `"\n\n"` + header (50 B) + `"\n"` + preamble (388 B) + `"\n\n"` + `"\n"` + trailer (35 B) —
is 479 bytes, and each document adds `2×len(path) + len(feature) + len(orderKey) + 47` bytes
(+ ~34 when abridged). Measured against this repository's **actual** LEARNINGS corpus (ten files,
paths 61–81 bytes, `ls docs/*/LEARNINGS-*.md docs/completed/*/LEARNINGS-*.md`), the shipped renderer
produces **684 bytes** of framing at one document (718 abridged) and **1,607 bytes** at five (1,777
abridged) — not the document's 1,012 at five. The two figures the document states are also mutually
unreachable: 694 is reproduced only by a one-document block whose feature name is ~23–24 characters
(the shape of every real feature dir here), while 1,012 is reproduced only by five documents whose
paths are ~22 bytes each — a two-character feature name. On the document's own one-document basis,
five documents cost ~1,562 bytes, not 1,012.

**Reading C — `D-O-3`'s new zero-bound conjunct and `D-O-4`'s split overstate what the code and
FSPEC guarantee.** Rejected; both are accurate and well-grounded. `extractInjectableMaterial` at
HEAD opens with `if (typeof maxBytes !== "number" || maxBytes <= 0) return { material: "", bounded:
false, bytes: 0, sections: [] };`, so bound 0 yields no material and no `bounded` flag exactly as
`D-O-3` now says; `selectLearnings` then rejects on `if (extraction.sections.length === 0)` with
`reason: "RSN-NO-MATERIAL"` and `continue`s **before** `eligible.push`, so the document consumes no
`maxDocuments` slot — again as claimed (both in `pdlc/workflows/orchestrate-dev.js` at HEAD). The
cited upstream anchors all exist and say this: FSPEC `BR-6` §"How the per-document bound binds"
("Where the bound is **zero**, no material is admissible from any document: each yields nothing, is
dropped before the total bound with `RSN-NO-MATERIAL` (BR-9) and consumes no slot"), edge case
`E-36` (`maxBytesPerDocument: 0` → "every one carries `RSN-NO-MATERIAL` and consumes no slot"), and
`AT-30`. `D-O-4`'s premise is equally checkable: FSPEC `BR-8`'s row field *bytes injected* is "The
document's contributed bytes, as BR-6 defines them", and BR-6 defines those as material — so
material bytes are indeed the only quantity commensurable with REQ §4.1's caps
(`maxBytesPerDocument` 6,000, `maxTotalBytes` 20,000, `maxDocuments` 5 at REQ §4.1). The split into
(a) material bytes and (b) block bytes is the right product answer and closes the C-8 gap's
reporting condition.

## Decision

**One High finding, delta-introduced, category (ii): the framing figures contradict the shipped
renderer at HEAD.** The freeze permits blocking only on a defect this revision introduced or a
factual contradiction with the repository that makes a load-bearing claim false. This is both. The
sentence "Measured on the shipped renderer at HEAD: framing costs **694 bytes** for a one-document
block and **1,012 bytes** for a five-document block, so at REQ §4.1's defaults a fully-conforming
block occupies up to roughly **21,012** bytes against a `maxTotalBytes` of 20,000. That gap is a
known constant" did not exist at `e29a296e`; it arrived with `b909ead8`, is restated inside `D-O-4`
by `f75140e3` ("measured 694 bytes at one document, 1,012 at five"), and is false as stated against
the renderer it names. On this repository's real corpus the five-document figure is **1,607**
(1,777 with abridgement), so the stated ceiling of "roughly 21,012" understates the real one by
~600–800 bytes, and framing is not a constant at all but a function of each selected document's
path length, feature name and `bounded` flag. The decision `DEC-LI-08` records is untouched by this
— static caps stay static — which is why the fix is a wording fix, not a re-decision, and why the
finding is scoped `Local`.

Prior-finding status at HEAD:

| v7 finding | Status | Evidence |
|---|---|---|
| F-01 (Low) — `D-O-9`'s row attributes the TSPEC erratum's discharge to "TSPEC v0.9", the version it was *observed* at rather than landed at | **Still open, still non-gating.** The delta did not touch `D-O-9`; the discharge itself remains real, so no reader is misled about *whether* it landed. Carried forward as F-02 below | `D-O-9` row unchanged in `git diff e29a296e..HEAD` |
| F-02 (Low) — `DEC-LI-03`'s re-evaluation trigger cites `G-C` without signalling it is this document's own ground rather than FSPEC's | **Still open, still non-gating.** Unchanged section, not re-litigated. Carried forward as F-03 below | Section absent from the delta |

Delta passages verified clean, with no finding:

- `DEC-LI-08`'s qualitative accounting-basis claim, against FSPEC `BR-6` §"The byte-accounting
  basis" and `renderLearningsBlock`'s construction at HEAD.
- The claim that `bytes` was only ever measured over material — `extractInjectableMaterial` is the
  sole writer of `bytes`, and `renderLearningsBlock` never touches it.
- `D-O-3`'s zero-bound conjunct in all four of its parts (no material, no `bounded` flag,
  `RSN-NO-MATERIAL`, no slot), against the `maxBytes <= 0` early return, the `sections.length === 0`
  branch, FSPEC `BR-6` §"How the per-document bound binds", `E-36` and `AT-30`.
- `D-O-4`'s (a)/(b) split and its premise that BR-8's *bytes injected* is material, against FSPEC
  `BR-8`'s field table and REQ §4.1's three defaults.
- The **Stated honestly** rewrite's structure: material bounded a priori, framing a separate term,
  both channels named as O-1 triggers. Only its parenthetical dependence on the false constant is
  affected by F-01.
- The v0.4 changelog row's description of what round 6 changed matches the three commits that
  landed it.

## Consequences

**PLAN and PROPERTIES are blocked on this document only through `D-O-4`'s parenthetical.** The
obligation itself — report material bytes and block bytes as two quantities — is correct and
downstream-usable today; a property or acceptance test written against it would not go wrong. What
would go wrong is a test that transcribed "694 / 1,012" as an expected literal, since neither is
reproducible from a realistic fixture and the five-document figure is not reproducible from any
fixture this repository's corpus can supply. That is precisely the implementation-echo trap in
reverse: a spec literal that no fixture can honour forces the test author either to derive the
expectation from the renderer (an echo) or to invent a fixture that exists nowhere. Fixing the
sentence removes the trap before PROPERTIES reaches it.

**The operator-facing consequence is the C-8 gap's size.** `DEC-LI-08` exists to state honestly how
far the caps fall short of bounding what the author actually receives. Understating the
five-document overshoot by ~600–800 bytes understates exactly the number REQ O-1's measurement is
supposed to close on. The honest replacement is cheaper than the wrong constant: framing is
`479 + Σ(2×len(path) + len(feature) + len(orderKey) + 47)` bytes, plus ~34 per abridged document —
a formula the reader can evaluate against their own corpus, with this repository's corpus as the
worked example (684 at one document, 1,607 at five; 718 / 1,777 abridged).

**The round-6 pattern is worth naming.** All three of round 5's and round 6's revisions improved
grounding by adding *measured* evidence, and this is the first one whose measurement was not
reproducible. Numbers stated as measurements are the one class of claim in this document that no
upstream re-read can falsify — only re-running the code catches them. That is a durable process
signal for harvest, not a finding here.

**Deferred items** — recorded, not opened, per the freeze:

DEFERRED: `D-O-9`'s "DISCHARGED at TSPEC v0.9" still attributes the discharge to the version it was observed at, not the version the four edits landed at (carried from v7 F-01).

DEFERRED: `DEC-LI-03`'s re-evaluation trigger cites `G-C` without signalling that `G-C` is this document's own ground rather than an FSPEC id (carried from v7 F-02).

DEFERRED: The header pin (REQ v0.9 / FSPEC v0.13 / TSPEC v0.9) matches HEAD today but goes stale the moment the working tree's REQ v0.10 / FSPEC v0.14 errata commit; a re-pin will be due in the next round regardless of this review's outcome.

DEFERRED: `DEC-LI-08` now carries both a qualitative accounting-basis paragraph and a quantitative measurement; a future pass may want the measurement to live in `D-O-4` alone, where the reporting obligation that consumes it lives.

DEFERRED: The three `Process` candidates filed at v6 (unfalsifiable header pins, discharge-without-routing, dated claims in timeless voice) remain unaddressed and now have a fourth sibling — measured constants no document gate re-derives; all belong to harvest.

## Findings

## Questions

## Positive Observations

## Recommendation
