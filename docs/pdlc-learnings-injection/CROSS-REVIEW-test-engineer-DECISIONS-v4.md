# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (bytes unchanged since the v2 approval; sha256:85888c03…)
**Upstream re-read:** FSPEC `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (sha256:fb18dbda…, v0.12)
**Date:** 2026-08-20
**Iteration:** 4 (upstream-cascade confirmation)

## Context

My v3 approval of DECISIONS recorded `UPSTREAM-STATE: FSPEC sha256:a4f775bd…` (commit `9a4b7593`,
FSPEC **v0.10**). FSPEC at HEAD is sha256:fb18dbda… (commit `c1d7218e`, **v0.12**). Nine commits
landed on that path in between, in two erratum rounds:

| Commits | FSPEC version | Substance |
|---|---|---|
| `4e5d8081`, `4e8e684b`, `c9f672c3`, `1b4dc3de` | v0.11 | **`BR-1` gains its second conjunct.** The block rule becomes *authoring-classified **and** target document among REQ/FSPEC/TSPEC/PLAN/DECISIONS/PROPERTIES* (REQ C-1), so an authoring-tagged dispatch with no C-1 target — Phase CR's optimizer round — is outside the rule. `BR-15`'s expected read set drops the corpus enumeration and is stated as an enumerable equality. `AT-02`/`AT-33` track both. |
| `3f21bd3b`, `97dd9d52`, `79e8621a`, `b054b5a7`, `e305a297`, `c1d7218e` | v0.12 | **`BR-1`'s complement carried through.** `BR-11`, `AT-03`, `AT-29` now quantify over dispatches *outside `BR-1`'s rule* rather than over "non-authoring" ones. `D-2` becomes a three-branch decision naming the authoring-classified-non-C-1 branch; `AT-02` gains a fixture that reds when the second conjunct is reverted. Overview and **`A-2`** are rewritten to stop restating one conjunct. `BR-15` is compared as **sets of paths, not counts**. Header Cross-Reviews row de-enumerated. |

DECISIONS' own bytes did not move (sha256:85888c03… equals the v3 `APPROVAL-HASH`), so everything
v3 left open is still on disk and is `inherited` in this round's grammar.

**Where this delta actually touches DECISIONS.** `DEC-LI-03` is the entry that lives on `BR-1`, and
it is the reason this cascade is interesting rather than routine. `DEC-LI-03` decided, at v2, to gate
on **two conjuncts** in `dispatchAndVerify`:

```js
const injectHere =
  dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType);
```

and rejected the single-conjunct alternative *on measured grounds* — Phase CR calls the shared
`reviewLoop` with `docType: null`, that `null` survives to `dispatchAndVerify`, so classification
alone admits `se-author` remediating shipped code with no target document.

At v0.10, FSPEC `BR-1` still read "**if and only if** the pipeline classifies it as authoring" — a
one-conjunct rule. DECISIONS was therefore carrying an engineering gate **narrower than the
behaviour rule it claims not to re-decide**, a latent tension I did not have to call at v3 because
`G-C` recorded the `docType: null` measurement and REQ C-1/AC-1.2 backed the narrowing. FSPEC v0.11
closed that gap from the upstream side: `BR-1` now states both conjuncts and names the code-review
optimizer round explicitly as outside the rule.

So the direction of this delta is **toward** DECISIONS, not away from it. The document did not
become a less faithful compression of its upstream; it became a more faithful one, and `D-O-8`'s
producer-set guard and `D-O-6`'s per-dispatch counts both gained upstream backing they did not have
when I approved them. The confirmation question is consequently not "is a decision invalidated" —
it plainly is not — but the narrower one this protocol exists to catch: **does anything DECISIONS
quotes now read differently upstream, and did any oracle DECISIONS leans on lose falsifying power
in the move.** One item in each category is what this round records.

## Options Considered

Three readings of the delta were live.

**(a) The delta invalidates a decision — non-approving, `delta/local` High.** This is the reading a
`BR-1` rewrite would normally earn: `BR-1` is the rule `DEC-LI-03` attaches to, and `DEC-LI-03` is
the entry whose whole content is *where* and *on what condition* the injector fires. Had v0.11 moved
`BR-1` the other way — pinning the block rule to the authoring classification **alone** — then
`DEC-LI-03`'s gate would inject strictly less than the behaviour rule requires, `D-O-8`'s
producer-set guard would be pinning the wrong set, and every AT that asserts set equality over "the
subset carrying a block" would red against a correct implementation. That is the halting shape, and
it is worth naming precisely because it is what I checked for first.

It did not happen. `BR-1` at HEAD is `dispatchKind === "authoring" && docType ∈ C-1's six` stated in
prose — the same conjunction, in the same order, with the same load-bearing status ("the second
conjunct is load-bearing, not defensive"), and it names the same measured witness `DEC-LI-03` used
to justify the narrowing (Phase CR's optimizer round at HEAD). `BR-1`'s **Excluded** list survives
intact, so `DEC-LI-03`'s fourth alternative ("gate on `docType` alone … violates `BR-1`'s exclusion
list") still cites a list that exists and still says what it is quoted as saying. Reading (a) has no
support in the bytes.

**(b) Nothing to say — approve silently.** Also wrong, for two reasons of different weight.

The lighter one is citation currency. `DEC-LI-03`'s re-evaluation trigger cites FSPEC `A-2` by
paraphrase — "*the pipeline introduces a dispatch kind that is authoring in spirit but not so
classified (FSPEC `A-2`'s stated default is that it is excluded)*". `A-2` at v0.10 said exactly
that. `A-2` at HEAD was rewritten and now quantifies over a dispatch that "satisfies **neither**
conjunct in the pipeline's own terms yet is authoring in spirit". The default `DEC-LI-03` leans on
still holds — `BR-1` requires both conjuncts, so failing either excludes — but it no longer holds
*by the sentence DECISIONS attributes to `A-2`*: a dispatch that is authoring in spirit, not
authoring-classified, yet carrying a C-1 target document satisfies one conjunct and is therefore
outside `A-2`'s HEAD wording while still being excluded by `BR-1`. The trigger's mechanism is
undamaged; its quoted authority narrowed underneath it.

The heavier one is an oracle-power question, and it is the finding I would not want a PROPERTIES
author to inherit silently. `DEC-LI-06` (no cache, no run-scoped memo) states its reversibility as
**Hard** and grounds that hardness upstream: "*a cache changes observable behaviour that oracles
depend on. Adding one later means revisiting `E-32` and `AC-5.2` upstream first*", with
"`AC-5.2` (positive-membership filesystem oracle)" listed among the constraints that forced the
shape. `BR-15` is `AC-5.2`'s instrument. At v0.10 its expected set was "*the corpus-root enumeration,
plus **one open attempt for every** corpus document the report names*" — attempt-shaped, and
therefore an instrument a memo could move. At HEAD both sides are "*compared as **sets of paths**,
not as counts, so a document opened more than once neither adds a member nor changes the verdict*",
and the enumeration "contributes **no** member". A per-dispatch read memo now leaves `BR-15`'s
verdict bit-for-bit identical: same paths, fewer opens. `AC-5.2` has stopped being an instrument a
cache must break.

**(c) Faithful-but-drifted — approve with tagged non-gating findings.** This is what the bytes
support. No decision is invalidated; no obligation in `D-O-1`…`D-O-9` becomes unfalsifiable; the
compression still holds everywhere it makes a behavioural claim. What drifted is one quoted
authority (`A-2`) and one stated reversibility ground (`AC-5.2`), plus the three items v3 already
recorded and the author has not yet landed. All are `Medium`/`Low`, all route to the erratum that
lands alongside whatever else this phase is carrying, and none blocks PROPERTIES authoring.

## Decision

## Consequences

## Delta-Confirmation Findings

## Recommendation

## Verdict
