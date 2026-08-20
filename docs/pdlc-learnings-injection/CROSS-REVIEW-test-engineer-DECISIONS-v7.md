# Cross-Review: test-engineer — DECISIONS (revision round, frozen)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.3, sha256:56617f5a…, commit `e29a296e`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v6.md` (reviewed v0.2, sha256:85888c03…, commit `8f3db3d8`)
**Date:** 2026-08-20
**Iteration:** 7

## Context

The document's own bytes moved this round, for the first time since v4: six commits took it from
v0.2 (`8f3db3d8`, sha256:85888c03…) to v0.3 (`e29a296e`, sha256:56617f5a…), +58/−25 lines. Every one
of them names a finding from my v5 or v6 review or the PM's:

| Commit | Substance | Answers |
|---|---|---|
| `1eb66bdb` | Header re-pinned on TSPEC v0.9 / FSPEC v0.13 / REQ v0.9; the "upstream version note" rewritten to say **no live upstream gap remains** | v6 F-05 |
| `0e1a3edf` | `DEC-LI-03`'s re-evaluation trigger re-grounded on `BR-1`'s **two** conjuncts, with `A-2` quoted verbatim and the second exclusion shape (authoring-classified, target outside REQ C-1's six) named | v6 F-07 |
| `3293ade4` | `DEC-LI-06`'s Hard reversibility re-grounded on **E-32 + `D-O-6`'s counts**, and explicitly *not* AC-5.2 | v6 F-06 |
| `5423f0b1` | `DEC-LI-07`'s divergence paragraph rewritten past tense: DEC-ERR-01 **landed** at TSPEC v0.9 | v6 F-03 |
| `483a9de0` | §Decisions-deliberately-NOT-taken row 4 restated on REQ v0.9's settled two-locus answer; `ERR-6` CLOSED | v6 F-04 |
| `e29a296e` | `DEC-LI-10` gains a "what the completeness tests do not falsify" paragraph; `D-O-6` records its role as **sole falsifier** of a wrongly-`null` corpus outcome | v6 F-08 |

Upstream state at HEAD, re-measured rather than copied forward: REQ sha256:ff605dd3… (v0.9,
unchanged since v6), FSPEC sha256:ae75fa62… (v0.13, **unchanged** — identical to the sha my v6
`UPSTREAM-STATE` recorded), TSPEC sha256:22dee8ce… (**moved**, v0.7 → v0.9). The TSPEC move is not
incidental to this round: four of the six commits assert something about TSPEC at HEAD, so every one
of those assertions had to be checked against the new bytes, not against v6's recorded state.

Scope of attention, per the freeze: the changed hunks, the upstream sections they now claim things
about, and the two v6 findings the delta did not touch. I did not re-read the unchanged decision
entries, did not re-derive settled code-level claims, and opened no new decision question.

## Options Considered

**(a) Block on the two unlanded v6 Mediums.** `F-01` (DEC-LI-08's "bound the addition" framing and
`D-O-4`'s caps comparison, both written against pre-v0.13 byte accounting) and `F-02` (`D-O-3`'s
cut-and-flag clause not covering the zero bound) are the only v6 findings this revision did not
address. Both were filed Medium and both remain Medium: neither invalidates a decision, neither voids
an obligation, and under a decision freeze neither qualifies as a defect *this* delta introduced.
`F-02` is materially *less* dangerous than it was a round ago — TSPEC v0.9 §I.3 now spells the zero
case out in the signature contract itself (`maxBytes <= 0` short-circuits **before** the cut and
returns `{material: "", bounded: false, bytes: 0, sections: []}`, caller drops the document
`RSN-NO-MATERIAL`, E-36/§D.5), and PROPERTIES authors read TSPEC. The stale paraphrase in `D-O-3`
survives as a reader hazard, not as a false-green generator. Rejected as a blocking reading.

**(b) Block on a citation the delta introduced.** `DEC-LI-03`'s new paragraph cites `(G-C)` — not a
FSPEC or REQ identifier, which is what made me check it. `G-C` is defined **inside this document**,
in the grounding-pin table at line 63, and I re-derived its measurement at HEAD rather than trusting
it: `pdlc/workflows/orchestrate-dev.js:14695-14698` calls the shared `reviewLoop` with
`doc: \`docs/${featureName}/\``, `phase: "CR"`, `docType: null`, and line 7306's
`roundDocType = docType === undefined ? docTypeFromPath(doc) : docType` preserves `null` (explicit
`null` is not `undefined`), which then reaches `dispatchAndVerify` via lines 7347/7541. The citation
is internal and current, and the mechanism it names is live at HEAD. No finding.

**(c) The delta is faithful — approve, two inherited Mediums recorded.** Every claim the six commits
introduced re-derives correctly against upstream at HEAD, including the four TSPEC claims that had to
survive a v0.7 → v0.9 move underneath them. Nothing the revision touched broke anything that worked
in v0.2, and no decision's chosen shape moved. This is the reading I took.

## Decision

**Approved with minor changes.** Six of my eight v6 findings are landed and verified at HEAD; the two
that remain are the pre-existing Mediums, non-gating by the freeze rules and by the ordinary approval
bar alike. No High finding, old or new.

Verification of each landed finding, re-derived against the repository and upstream at HEAD — not
against the revision's own account of them:

| v6 finding | What the revision now says | Checked against HEAD | Verdict |
|---|---|---|---|
| **F-03** — `DEC-LI-07` asserted a *live* TSPEC disagreement that TSPEC had already closed | "The divergence … **has landed**", all four DEC-ERR-01 edits named as made at TSPEC v0.9 | TSPEC §I.3's gate is `config.enabled` **alone** and the doc states "There is no `!sectionMalformed` conjunct either" (`TSPEC` §I.3 preamble, line 505-506); `OQ.2` settled (line 1524); "**ERR-4 (REQ G-1 / AC-1.1 / AC-5.1a) CLOSED, resolved REQ v0.9**" (line 1577); `LEARNINGS_DEFAULTS.enabled` is `true` with an absent section leaving it there (lines 479, 497) | **Resolved**, all four sub-claims true |
| **F-03 (cont.)** — `D-O-9` | Struck through, marked **DISCHARGED at TSPEC v0.9**, row retained for trace | Same four edits; nothing in the row over-claims | **Resolved** — and retaining the row rather than deleting it is the right call: a deleted obligation leaves no evidence the erratum ever ran |
| **F-04** — §Decisions-NOT-taken row 4 routed AC-3.3's locus to a CLOSED `ERR-6` and described a run-level record TSPEC no longer keeps | Row restated: REQ v0.9 settled it; **two** loci, **two** completeness tests, one per locus; `dispatches[i].corpusOutcome` is the oracle locus and the run-level mirror is additive, explicitly not an oracle, last-write-wins, "no fixture may assert on" it | REQ `AC-3.3` (REQ lines 342-345): ordering key per document **per authoring dispatch**, §4.1 thresholds **once per run**, "two completeness tests assert set equality, one per locus"; TSPEC §D.2 line 380 "the run-level mirror is carried but unasserted", line 391 "**carried, additive, not the oracle** … **nothing asserts on the value**", line 425 "asserts **nothing** about the run-level mirror"; `ERR-6 … CLOSED, resolved REQ v0.9` (TSPEC line 1594) | **Resolved** — and this was v6's highest-consequence carried item; the PROPERTIES author now reads the settled two-locus answer from the document that routes it |
| **F-05** — version pins six checked diffs stale (TSPEC v0.5 / FSPEC v0.7 / REQ v0.7) | Header upstream row and the version note both re-pinned: TSPEC v0.9, FSPEC v0.13, REQ v0.9; `DEC-LI-07`'s inline "FSPEC v0.7 `BR-14`" corrected to "FSPEC `BR-14` (v0.13 at HEAD)" | Header row matches HEAD shas exactly (REQ ff605dd3…, FSPEC ae75fa62…, TSPEC 22dee8ce…); FSPEC `BR-14` at v0.13 does carry **five** states, "Five states, five behaviours" | **Resolved** |
| **F-06** — `DEC-LI-06`'s Hard reversibility grounded on AC-5.2, which a memo would not red | Re-grounded on **E-32 + `D-O-6`'s counts**, with the reason AC-5.2 cannot detect a memo spelled out, and the cache-*file* case explicitly kept with AC-5.2 | FSPEC `BR-15` line 709 verbatim: "Both sides are compared as **sets of paths**, not as counts, so a document opened more than once neither adds a member nor changes the verdict" — the quote in `DEC-LI-06` is byte-faithful; FSPEC `E-32` line 786 verbatim: "Each dispatch selects over the state **it** observed" | **Resolved**, and this is the strongest of the six edits: it converts a reversibility claim that rested on an oracle structurally unable to falsify it into one resting on the two oracles that can |
| **F-07** — `DEC-LI-03`'s trigger cited `A-2` as covering "authoring in spirit but not classified", narrower than `BR-1`'s two-conjunct rule | Rewritten to name **both** exclusion shapes, with `A-2` quoted verbatim for the first and `BR-1`'s own sentence for the second | FSPEC `A-2` line 1029 verbatim match; FSPEC `BR-1` states the second conjunct "load-bearing, not defensive — an authoring-classified dispatch whose target is none of those six document types (the code-review phase's optimizer round at HEAD) is outside the rule"; the `G-C` witness re-measured live at `orchestrate-dev.js:14695-14698` and `:7306` | **Resolved** |
| **F-08** — TSPEC §D.1's `null`-scoped membership test leaves `D-O-6` the sole falsifier, recorded nowhere | New `DEC-LI-10` paragraph states the gap and its owner; `D-O-6` gains "**load-bearing twice over** … the **sole falsifier** … neither conjunct may be dropped as redundant" | TSPEC §D.1 (lines 680-691): domain test reads "`v === null \|\| catalogue.includes(v)`", `null` is "the healthy value" and "deliberately **not** a member of `LEARNINGS_CORPUS_OUTCOMES`", mirror's domain test "does not turn the mirror into an oracle" | **Resolved** — the dependency is now stated in both directions, which is what stops a future PROPERTIES trim from silently unguarding it |

Unlanded, carried at Medium: v6 **F-01** (`DEC-LI-08` / `D-O-4` byte accounting) and v6 **F-02**
(`D-O-3`'s zero bound). FSPEC's bytes did not move this round (sha256:ae75fa62… both rounds), so both
findings stand exactly as measured, neither strengthened nor weakened by anything upstream — except
`F-02`'s downstream risk, which TSPEC v0.9 §I.3 has now absorbed independently.

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
