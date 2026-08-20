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

## Decision

## Consequences

## Delta-Confirmation Findings

## Recommendation

## Verdict
