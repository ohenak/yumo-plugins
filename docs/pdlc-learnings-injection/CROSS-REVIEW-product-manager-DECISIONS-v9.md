# Cross-Review: product-manager — DECISIONS (delta re-review, frozen round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 9
**Scope:** Local

## Context

My v8 review returned **Needs revision** on one High finding: `DEC-LI-08`'s two framing literals
(694 bytes at one document, 1,012 at five, ceiling "roughly 21,012") were not reproducible on the
renderer they named, and `D-O-4` restated them. Everything else in that round's delta verified
clean. Four commits have landed on the document since the bytes I reviewed (`6f28eded`):
`dbbfcb07` (restate the framing cost as a formula over a named fixture), `79675345` (`D-O-4` cites
the formula instead of restating literals), `6548c08a` (scope the grounding pin; re-pin upstream on
FSPEC v0.14 / REQ v0.10), `a370ba06` (bump to v0.5 with the round-7 changelog) and `9baf60b5` (note
that FSPEC v0.14 leaves the accounting basis untouched). The delta is 36 insertions and 11
deletions in one file: the header `Upstream` row and changelog cell, a new paragraph in §"Scope,
grounding pin, and how to read this document", the rewritten **Upstream version note**, the
rewritten framing passage inside `DEC-LI-08`, and the rewritten `D-O-4` row. Nothing else moved, so
per the delta protocol I scanned only those passages.

Upstream at HEAD has moved since v8, exactly as v8 predicted it would: REQ is now **v0.10**
(`REQ-pdlc-learnings-injection.md:18`), FSPEC **v0.14** (`FSPEC-pdlc-learnings-injection.md:18`),
TSPEC unchanged at **v0.9** (`TSPEC-pdlc-learnings-injection.md:18`). The document's re-pinned
header row matches all three. The freeze standard applies: I judged each delta passage only on
whether it broke something that worked at `6f28eded` and whether it contradicts the repository at
HEAD. Every numeric claim in this round was checked by executing the shipped renderer, not by
reading prose.

## Options Considered

Three readings of this delta were open when I started. Each was settled by executing the shipped
code or reading the upstream bytes at HEAD, never by comparing prose to prose.

**Reading A — the new framing formula is a plausible-looking rewrite that has not actually been
checked against the renderer.** Rejected; it is exact. The document now states framing as a
**block constant of 477 bytes** plus `49 + 2·len(path) + len(feature) + len(orderKey)` per selected
document, plus `30 + len(String(bytes))` when the document is `bounded`. I re-derived this from
`renderLearningsBlock` (`pdlc/workflows/orchestrate-dev.js`, the exported function whose body
concatenates `"\n\n"`, `LEARNINGS_BLOCK_HEADER`, `"\n"`, `LEARNINGS_BLOCK_PREAMBLE`, `"\n\n"`, the
`"\n\n"`-joined per-document units, `"\n"` and `LEARNINGS_BLOCK_TRAILER`) and then tested it: for
`n ∈ {1,2,3}` over synthetic paths and for `n ∈ {1,5}` over the named fixture, in both the abridged
and unabridged case, the formula reproduces the rendered block's framing byte-for-byte at every
point — six of six synthetic cases exact, no residual. The two component literals the passage names
also check out directly: `LEARNINGS_BLOCK_HEADER` is 50 bytes and `LEARNINGS_BLOCK_TRAILER` is 35
(`pdlc/workflows/orchestrate-dev.js`, the two `const` declarations immediately above the preamble).
Note that the partition differs from the one my v8 finding proposed — 477 + 49/doc rather than
479 + 47/doc — because this version charges the `"\n\n"` join to the document rather than to the
block. The two agree at every `n` (477 + 49n ≡ 479 + 47n + 2(n−1)), and the document's partition is
the one that composes correctly per document, so this is a better answer than the one I suggested,
not a divergence from it.

**Reading B — the worked example's figures are still not reproducible, only differently wrong.**
Rejected. The fixture is now *named*, which is what makes the check mechanical: "this repository's
own corpus at HEAD, the first five of `git ls-files | grep -E 'LEARNINGS-.*\.md$'`, with a
ten-character `orderKey`". Running that literal command yields twelve paths; taking the first five
and rendering them through HEAD's `renderLearningsBlock` with a ten-character `orderKey` gives
framing of **684 bytes** at one document, **1,607** at five, **718 / 1,777** when every selected
document is abridged — all four figures exactly as the document states them, and all four matching
what my v8 review measured independently. The v8 High finding is resolved on the merits, not
papered over: the unreachable literals are gone, the surviving numbers are labelled as one
corpus's evaluation of a stated formula, and the text says outright that the cost is "a **function
of the corpus**, not a fixed number".

**Reading C — the upstream re-pin and the new grounding-pin paragraph claim more than HEAD
supports.** Rejected; both are accurate. FSPEC v0.14's own erratum note
(`FSPEC-pdlc-learnings-injection.md:83-90`) says exactly what this document attributes to it —
BR-6's total bound "stated over **the window** the count bound leaves", and "a document past the
window carries `RSN-COUNT` whatever the window's byte outcome" — and REQ v0.10's AC-2.4 carries the
matching clause, "**attributed to the bound that actually removed it**: a document the count bound
(AC-2.2) already cut is reported under that cause" (`REQ-pdlc-learnings-injection.md`, AC-2.4). The
document's load-bearing negative claim — that neither change touches what `DEC-LI-08` restates — is
confirmed positively at HEAD: FSPEC §"The byte-accounting basis" still reads "a document's
**contributed bytes** are its **material** … Framing carries no byte charge", `E-36` still reads
"No document yields material: every one carries `RSN-NO-MATERIAL` and consumes no slot", and
`AT-30` still names it. The new grounding-pin paragraph's distinction — pre-feature reads ground
decisions, post-implementation reads only *confirm* them — is honoured in the two places it names:
`DEC-LI-08` says "Read off the shipped `renderLearningsBlock` at HEAD" and `D-O-3` says "shipped as
`extractInjectableMaterial`'s `maxBytes <= 0` early return and `selectLearnings`'s
`sections.length === 0` branch", and both branches exist at the lines claimed
(`pdlc/workflows/orchestrate-dev.js`, the `maxBytes <= 0` early return in
`extractInjectableMaterial` and the `sections.length === 0` rejection in `selectLearnings`).

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

