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

**What the revision changed for the test author, concretely.** Three of the six edits change what a
PROPERTIES or PLAN author will write, and all three change it toward a test that can fail:

1. **`D-O-6` is now unshrinkable.** Before this round, an author trimming properties could read the
   count conjunct and the behavioural conjunct as two views of one invariant and drop either. The
   revision names the exact reason both must live: the count conjunct is the only thing a run-scoped
   memo reds (`BR-15` cannot see one), and the behavioural conjunct is the only falsifier of a
   `corpusOutcome` that is `null` where `RSN-UNLISTABLE` was required (TSPEC §D.1 scopes the
   membership test to non-`null`). That is a genuine anti-vacuity guard on an obligation that would
   otherwise have false-greened in two independent ways.
2. **The AC-3.3 locus question no longer has two answers in circulation.** v6's F-04 was the one
   carried finding that could have produced a *wrong* test rather than a misdirected reader: a
   completeness assertion aimed at the run-level mirror is green on a single-dispatch fixture and
   silently wrong on `AT-18`'s divergent run. The row now says so in those words, and adds the
   positive instruction (assert per dispatch, one completeness test per locus). Set-equality over the
   full enumeration at each locus is preserved, so a deleted field still reds.
3. **`DEC-LI-03`'s trigger is now stated over the rule that actually gates injection.** The old
   citation covered one exclusion shape of two; the `D-O-8` source-level producer-set guard is
   written against `BR-1`, so a trigger stated over a narrower rule than the guard was a mismatch
   waiting to be inherited by the guard's expected set.

**What did not move, and what that costs.** `DEC-LI-08`'s "bound the addition" framing and `D-O-4`'s
"realised prompt sizes against REQ §4.1's caps" still describe a quantity FSPEC v0.13 no longer
defines that way: under material-only accounting the block's framing (identification line,
per-document delimiters, source-path label, preamble) is charged to no threshold, so a conforming
block can exceed `maxTotalBytes` without any threshold binding. The consequence is confined to
`DEC-LI-08`'s own acknowledged C-8 gap and the report obligation that is supposed to close it: an
operator reading `D-O-4`'s report and comparing one number to §4.1's caps sees an overrun that is not
one. No test goes wrong; a closing condition stays imprecise. Both items are carried below and both
belong to the *next* revision of this document, not to a frozen round.

**Process note.** Two consecutive rounds now (v6, v7) have turned entirely on whether present-tense
claims about a sibling document's state are still true. This round's six commits are the cure applied
by hand; the durable version is a cascade-round grep over present-tense sibling claims, which would
have surfaced F-03, F-04, F-05 and F-07 mechanically. Recorded rather than re-filed, and tagged
`Process` below so harvest can route it.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | *(carried from v6 F-01, unlanded — this delta did not touch these bytes.)* `DEC-LI-08`'s decision text says the caps "bound the addition" and §Stated-honestly says injection is "bounded a priori"; `D-O-4` asks for realised prompt sizes measured **against REQ §4.1's caps**. FSPEC v0.13 charges the block's framing — identification line, per-document delimiters, source-path label, preamble — to **no** threshold, so the caps bound *material only* and a conforming block can exceed `maxTotalBytes` with nothing binding. The caps' shape (static, no dynamic budget) is unaffected; the imprecision lands on the one gap this document admits and the obligation meant to close it. Fix: say the caps bound *material*, and split `D-O-4` into realised **material** bytes (comparable to §4.1) and realised **block** bytes (the growth term a displacement decision would act on) | `DEC-LI-08` §Decision, §Stated honestly; obligations table `D-O-4` |
| F-02 | Medium | Local | *(carried from v6 F-02, unlanded.)* `D-O-3`'s `extractInjectableMaterial` clause — "byte bound, whole-character prefix, `bounded` exactly when cut" — does not cover the zero bound FSPEC v0.13 decided: at `maxBytesPerDocument: 0` the document yields nothing and is dropped `RSN-NO-MATERIAL` (E-36, AT-30), so it is not "0 bytes carrying `bounded`". Downstream risk is now **lower** than at v6: TSPEC v0.9 §I.3 states the short-circuit in the signature contract (`maxBytes <= 0` returns `{material: "", bounded: false, bytes: 0, sections: []}` *before* the cut) and PROPERTIES authors read TSPEC. The stale paraphrase remains a reader hazard in the document that owns the obligation. Fix: add the zero-bound conjunct and state the property's bound domain | Obligations table `D-O-3` (FSPEC `BR-6`, E-36, AT-30; TSPEC §I.3) |
| F-03 | Low | Process | Two consecutive cascade rounds have found only stale present-tense claims about sibling documents. A mechanical sweep of present-tense sibling claims at the top of each cascade round would have surfaced four of this round's six edits without a reviewer re-deriving each one. Not a defect of this document; routed to process learnings | §Scope, grounding pin, and how to read this document |

**DEFERRED items** (freeze-scope: observations, not blocking findings, not decisions to reopen):

DEFERRED: `DEC-LI-07` now says "No live upstream gap remains" as a present-tense claim about TSPEC's bytes — the class of sentence that has caused the last two rounds' findings; consider phrasing it as "as of TSPEC v0.9, sha256:22dee8ce…" so it dates itself.
DEFERRED: `D-O-9`'s row is retained struck-through with "TSPEC (closed)" in the Owner column; a future reader scanning the Owner column for open obligations must read the strikethrough to know it is discharged — a `Status` column would make the discharge machine-readable.
DEFERRED: `DEC-LI-10`'s new "what the completeness tests do not falsify" paragraph is the pattern the other catalogue-transcription entries would benefit from; consider generalising it once, rather than per entry.
DEFERRED: the §Decisions-deliberately-NOT-taken row 4 cell now carries the settled contract in full; that content is arguably PROPERTIES-facing guidance that would be read more reliably from a `D-O` obligation row than from a non-decision table cell.

## Questions

| ID | Question |
|----|---------|
| Q-01 | `D-O-6` is now the sole falsifier of a wrongly-`null` `corpusOutcome`. Should PROPERTIES additionally carry a *mutation* check on it — revert the `RSN-UNLISTABLE` record at dispatch 5 and expect RED — given that a single obligation now guards an invariant no other test can see? Not a finding: the obligation as written is sufficient; the question is whether the sole-falsifier status earns explicit mutation coverage at final codebase review. |

## Positive Observations

- The `DEC-LI-06` re-grounding (v6 F-06) is the round's best edit. It replaces a reversibility claim resting on `BR-15` — an oracle structurally unable to falsify it, since set-of-paths comparison is blind to repeat opens — with one resting on `E-32` and `D-O-6`'s counts, and it says *why* `BR-15` cannot see a memo, quoting FSPEC verbatim. It also keeps the cache-*file* case with AC-5.2, where it does belong. That is the distinction between "which oracle would red" applied correctly in both directions.
- `D-O-6`'s "load-bearing twice over … neither conjunct may be dropped as redundant" is exactly the anti-trim guard an obligation carrying two independent falsifiers needs, and `DEC-LI-10` states the dependency from the other side too, so a reader arriving from either document finds it.
- The AC-3.3 non-decision row now names the false-green mechanism in the words a test author needs — "green on a single-dispatch fixture and silently wrong on `AT-18`'s divergent run" — rather than only naming the correct locus.
- Every quotation the delta introduced is byte-faithful to its source at HEAD: FSPEC `A-2` (line 1029), `E-32` (line 786), `BR-15` (line 709). Verbatim quoting rather than paraphrase is what made this round's verification cheap.
- `D-O-9` retained as a struck-through row rather than deleted: the erratum's trace survives, which is the difference between an obligation that was discharged and one that was never written.

## Recommendation

**Approved with minor changes**

Six of eight v6 findings landed and verify against upstream at HEAD, including four TSPEC-facing
claims that had to survive a v0.7 → v0.9 move underneath them. The two unlanded items are the
pre-existing Mediums; neither invalidates a decision, voids an obligation, or produces a wrong test.
No High finding, old or new. Nothing this delta introduced contradicts the repository at HEAD or an
upstream document.

## Verdict
