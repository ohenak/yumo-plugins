# Cross-Review: product-manager — PLAN (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.5)
**Date:** 2026-08-20
**Iteration:** 8

## Overview

PLAN moved: v0.4 -> **v0.5**, six commits (`96cf89a5` ... `7bcbce64`) since the bytes my v7
confirmation measured. This is a delta re-review scoped to those commits and to whether my five v7
findings closed.

| v7 finding | Sev | Status at v0.5 |
|---|---|---|
| F-01 — `LI-AT-30` commissions two cases; FSPEC v0.13's AT-30 has three, and no row owns the zero-bound production half | High | **Partly closed.** The three cases and a strong oracle landed (`96cf89a5`); the production half is still unowned — carried forward as this round's F-01, at **Medium** |
| F-02 — §Traceability's `RSN-NO-MATERIAL` branch states one cause and one AT | Medium | **Closed.** The arm-table row now carries both disjuncts, both ATs and both owner pairs (`3d6b0972`) |
| F-03 — errata section routes ERR-3/ERR-7 as live | Medium | **Closed.** Both recorded CLOSED with the FSPEC version that resolved each (`f6570869`) |
| F-04 — claim 4 scopes byte-identity to "non-authoring" dispatches | Medium | **Closed.** Restated as dispatches **outside BR-1's rule**, naming Phase CR's authoring-classified non-C-1 round as inside the promise (`af975290`) |
| F-05 — four stale version pins | Low | **Closed in substance.** The upstream matter row, §Overview and LI-01's edge rationale now read FSPEC v0.13 / TSPEC v0.9; the changelog's 0.1 row correctly keeps its historical pins |

The revision is accurate where it matters most. The zero-threshold case that blocked v7 is now
commissioned with an oracle **stronger** than the one I asked for: three positive conjuncts rather
than a widened enumeration, including the no-slot conjunct that kills the mutation. Checked against
upstream at HEAD, LI-12's new text is a faithful compression of TSPEC §I.2 (three zeros; the third
alone asserting reject rows; set equality over rejects, "not merely an empty `selected`") and of
FSPEC AT-30 (three cases, and in the `maxBytesPerDocument: 0` case every corpus document carrying
`RSN-NO-MATERIAL`, E-36).

Three Mediums remain, all bounded to sections this round touched, and none of them is a behaviour
this PLAN now fails to commission a test for — which is why none is High. The v7 High was "a
behaviour FSPEC guarantees and this PLAN commissions no test for"; that is closed. What is left is
*which task writes the production code*, and two precision holes inside the new text.

**Method.** Ran the delta (`git diff f08bfbf8..HEAD` on the PLAN), re-read v7, then verified every
new claim against upstream at HEAD and against code already landed on this branch: FSPEC AT-30 and
the E-36 edge row, TSPEC §I.2, §D.3, §D.5, §T.7 and ERR-8, and the landed
`pdlc/workflows/__tests__/learningsBlock.test.js` and
`pdlc/workflows/__tests__/helpers/learningsFixtures.js`.

## Batches

**LI-12 (batch 5) — v7's F-01 first clause, closed and then some.** The row now commissions
`LI-AT-30` as three cases, one per zero threshold, each an enabled run with BR-8's rows present and
empty, "never the absent key of a disabled run and never a refusal to run". Against FSPEC AT-30 at
HEAD ("`maxDocuments: 0`, separately `maxTotalBytes: 0`, and separately `maxBytesPerDocument: 0` …
*and* in the `maxBytesPerDocument: 0` case every corpus document carries `RSN-NO-MATERIAL` (E-36)")
this is an exact compression, and the three-conjunct oracle goes past it in the right direction:

- (i) key **present** with empty rows — the positive half that keeps this from being an absence-only
  oracle. A bare "selection is empty" would be satisfied by a disabled run, a refusal, or a crashed
  injector; the row says so in terms.
- (ii) `rejected[]` **set-equal** to every enumerated non-self corpus path at reason
  `RSN-NO-MATERIAL`, none `bounded` — set equality, "never 'at least one'". This is the enumerated-
  contract discipline stated where a test author reads it.
- (iii) **no** document carries `RSN-COUNT` — the no-slot conjunct. This is the one I did not ask
  for and the one that earns the round: it is exactly the assertion that falsifies an implementation
  taking a zero-byte first-section cut and burning `maxDocuments` slots, which is the shape TSPEC
  §D.5 carves out and FSPEC E-36 forbids.

**But conjunct (iii) is vacuous on a small fixture, and the row does not close that.** `RSN-COUNT`
rows only exist when the eligible set exceeds `maxDocuments`; REQ §4.1 sets that default at **5
documents per dispatch**. If the zero-bound fixture's eligible non-self corpus has five or fewer
documents, an implementation that applies the count bound *before* extraction — FSPEC Step 5's
literal item order, items 15–16 — still produces no `RSN-COUNT` row, and (iii) passes against the
very mutation it was written to catch. The fix is one clause: the third case's corpus must carry
**more** eligible non-self documents than `maxDocuments` in force, or configure `maxDocuments` below
the corpus size, so (iii) is a live assertion rather than a tautology. F-02 this round.

**LI-08 and LI-02 (batches 3 and 1) — F-O-1's second rule, well mapped, with two blemishes.** The
new `LI-AT-11` clause is a faithful transcription of TSPEC §D.3's matcher: "exactly two `#`, an
optional ordinal stripped and discarded (it is not the priority), an optional trailing gloss, and
otherwise exact case-sensitive comparison against `BR6_SECTION_NAMES`" — §D.3 says precisely that,
including that the ordinal "is *not* the priority" and that a `###` sub-heading is body text. The
named variants (un-numbered `## Cross-Feature Patterns`, un-glossed `## Rejected Proposals`, a `###`
sub-heading, near-miss `## Process Findings` that must not match) are the right four, and the
near-miss is the one §D.3 measured from E-33. Routing the shapes to LI-02's spec surface rather than
ad hoc into the suite keeps the no-ad-hoc-corpus-builder rule intact.

Two blemishes, both Low (F-04):

- The **amendment note is spliced into the middle of the AT enumeration**, so `LI-AT-12` now dangles
  after "Ownership does not move, so the single-writer manifest is unchanged, `LI-AT-12` (the
  character-safe cut …)". Nothing is lost — `LI-AT-12` is still named and still glossed — but the
  row is the artifact a test author works from, and its list of three ATs no longer reads as one.
- The note's factual claim is **narrower than stated**. It says the landed files "use the bare-title
  form only". True of the *fixtures*: `learningsBlock.test.js`'s `LI-AT-11` builds six sections with
  bare `name` values and no `ordinal`. Not true of the *helper*: `renderSection` in
  `__tests__/helpers/learningsFixtures.js` already takes `section.ordinal` and `section.gloss` and
  renders `## {ordinal}. {name} ({gloss})`, and `name` is free-form, so the near-miss title is
  already expressible. The only genuinely absent knob is the `###` sub-heading form. Saying so
  scopes the amendment to what it is — a fixture change plus one helper knob — instead of implying a
  larger edit to a file two later tasks depend on.

**The landed suites do honour what the row promises elsewhere.** `LI-AT-11` asserts
`result.sections` `toEqual(BR6_SECTION_NAMES)` — set-and-order equality over the full enumeration,
not containment — and pairs its one negative (`not.toContain("APPROVAL_MARKER")`) with five positive
marker assertions on the same call. `LI-AT-12`'s expected byte counts are committed as literal
integers with the arithmetic spelled out in a comment, never derived via `Buffer.byteLength` inside
an assertion. That is the standard this PLAN asked for and it is being met in the code.

## Dependencies

## Verification

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
