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

**DECISIONS still holds as approved against FSPEC v0.12.** Reading (c). Approved with minor changes,
three Medium and two Low findings, none gating.

Every claim DECISIONS makes that reaches into the sections this delta touched, re-derived against the
HEAD bytes rather than against my memory of v0.10:

| DECISIONS claim | FSPEC at HEAD | Verdict |
|---|---|---|
| `DEC-LI-03` decision: gate is `dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)` | `BR-1` v0.12 states the same conjunction in prose, second conjunct "load-bearing, not defensive" | **Holds, newly backed** — v0.10's one-conjunct `BR-1` was narrower than this gate; v0.11 closed the gap toward DECISIONS |
| `DEC-LI-03` alt. 2 rejected: classification alone admits Phase CR's `docType: null` optimizer, "which is exactly what REQ C-1 and NG-5 exclude" | `BR-1` names the same witness — "the code-review phase's optimizer round at HEAD" — and cites the same authorities, REQ AC-1.2 and NG-5 | Holds; upstream now names the case DECISIONS measured |
| `G-C`: `dispatchKind` alone is wider than REQ C-1; `reviewLoop({docType: null, phase: "CR"})` | Unchanged in kind and now mirrored by `BR-1` and by `D-2`'s third branch | Holds |
| `DEC-LI-03` alt. 3 rejected: gate on `docType` alone "violates `BR-1`'s exclusion list" | `BR-1`'s **Excluded** bullet survives the rewrite verbatim (review, implementation, DoD, remediation, harvest, ship, advisory seams) | Holds; cited list still exists |
| `DEC-LI-03` re-evaluation trigger cites `A-2`'s stated default for a dispatch "authoring in spirit but not so classified" | `A-2` rewritten: now quantifies over a dispatch satisfying "**neither** conjunct … yet is authoring in spirit" | Holds on substance (`BR-1` still excludes), **drifted on quotation** → F-02 |
| `D-O-8`: source-level guard pinning authoring-classified producers to the set reaching `dispatchAndVerify`, expected set hand-transcribed | Untouched by this delta; `BR-1`'s "read off the classification, not maintained here" is unchanged in force | Holds |
| `DEC-LI-06` alt. 2 rejected: "REQ NG-4 and FSPEC `BR-15` state that the run creates no index, cache or state file anywhere" | That sentence of `BR-15` is untouched — "no index, cache or state file is created anywhere (NG-1, NG-4)" | Holds |
| `DEC-LI-06` reversibility Hard, because "adding [a cache] later means revisiting `E-32` and `AC-5.2` upstream first"; `AC-5.2` listed as a forcing constraint | `BR-15` moved from attempt-counting to **set-of-paths** comparison; a repeat open "neither adds a member nor changes the verdict"; enumeration contributes no member | Substance of the decision holds, **`AC-5.2` half of the stated ground no longer bites** → F-01 |
| `D-O-6`: positive call-count oracle, `_git` enumeration calls **equal** the injecting dispatches, `_readFile` likewise, "counts asserted over the **injected Node-channel seams**, not the platform read cache" | Independent of `BR-15` by construction — DECISIONS already scoped these counts to its own seams | **Holds, and is now the sole falsifier** of the no-cache decision |
| `D-O-6` "`_git` enumeration calls equal the number of **injecting** dispatches" | Under two-conjunct `BR-1`, injecting ⊊ authoring-classified; `D-O-6` says *injecting*, not *authoring* | Holds — wording was already correct for the narrower set |
| `DEC-LI-04`: corpus enumeration through `_git` with a restated pathspec, not `_listFiles` | `BR-15` at HEAD asserts the enumeration "opens no file under `docs/`, so this instrument does not see it" — consistent with a `git ls-files`-shaped enumeration | Holds; upstream and DECISIONS agree on the mechanism |
| `DEC-LI-10`: `LEARNINGS_TARGET_DOCTYPES`' expected membership hand-transcribed from REQ C-1's six names | `BR-1` now restates those six names inline as the second conjunct | Holds, and the transcription target is now visible in FSPEC too |

**The one thing a reader should take from this table.** `DEC-LI-06`'s no-cache decision is now
defended by exactly one falsifiable instrument — `D-O-6`'s call-count oracle over the injected
Node-channel seams — where at v0.10 it could point at two (`D-O-6`, plus `AC-5.2`/`BR-15`'s
attempt-shaped footprint check). The decision is unchanged and correct; DECISIONS anticipated the
seam question well enough that its own obligation survived the upstream move untouched. But the
paragraph that tells the next reader *why reversal is Hard* now overstates its upstream half, and a
PROPERTIES author who reads "revisiting `AC-5.2` upstream first" as a safety net will find the net
has a hole in it. That is F-01, and it is a one-sentence fix in the erratum, not a reopened
decision.

## Consequences

**For this phase.** The confirmation is approving, so the cascade does not halt and DECISIONS does
not re-enter its ordinary revision loop. Nothing here blocks PROPERTIES authoring. Five findings are
recorded: two created by this delta (F-01, F-02), three carried unchanged from v3/v2 because
DECISIONS' bytes have not moved since (F-03, F-04, F-05). All five land as one erratum edit to
DECISIONS; none of them reopens a decision, and no `D-O` obligation changes shape.

**For PROPERTIES, the next reader of this document.** Three transcription notes, in the order they
will bite:

- **The no-cache decision has exactly one falsifier now.** `D-O-6`'s call-count oracle over the
  **injected Node-channel seams** (`_git` enumeration calls equal the injecting dispatches;
  `_readFile` likewise) is the whole proof that `DEC-LI-06` was honoured. `BR-15`/`AC-5.2` used to
  be a second, independent check — an attempt-shaped footprint set that a memo would visibly shrink.
  At FSPEC v0.12 it is a **set of paths**, and a memo changes no member of it. Do not write the
  no-cache property against `AC-5.2`; write it against `D-O-6`'s counts, and mutation-check it by
  introducing a per-run memo and requiring RED. If that mutation stays green, the property is
  vacuous and the decision is unguarded.
- **Take `BR-1`'s rule from FSPEC v0.12, both conjuncts, and treat the second as load-bearing.**
  A property that exercises only authoring-classified dispatches with a C-1 target document cannot
  distinguish the shipped two-conjunct gate from the one-conjunct gate `DEC-LI-03` rejected. The
  falsifying fixture is the one FSPEC now names: an authoring-classified dispatch with
  `docType: null` (Phase CR's optimizer round), asserted to receive **no** injection — a positive
  assertion on the served state, not merely "no error".
- **Take `BR-10`'s loci from FSPEC, not from §Decisions deliberately NOT taken.** This is v3's F-01,
  unlanded and therefore still live (F-03 below). Two completeness tests, one per locus: ordering key
  values per authoring dispatch, thresholds once per run. An assertion written over the run-level
  mirror is, in FSPEC's own words, an assertion over a non-oracle — green on a single-dispatch
  fixture, silently wrong on AT-18's divergent run.

**For the harvest phase.** F-01 is the reusable one and is worth a `Cross-Feature` note: *when an
upstream erratum makes an oracle cheaper or more robust, it can simultaneously make it a weaker
guard for a decision that leaned on its strictness.* `BR-15` moving from attempt-counts to a
path-set is an unambiguous improvement to `AC-5.2` as a footprint oracle, and precisely because of
that improvement it stopped being able to detect a cache. Nothing upstream is wrong; a downstream
document's stated reversibility ground quietly emptied. A cascade confirmation that only asks "does
upstream still say what this document quotes" would miss it — the sentence still parses, it just no
longer bites. That is a check worth adding to this role's cascade protocol: for every decision whose
reversibility is stated as Hard **because** an upstream oracle would break, re-derive whether the
oracle at HEAD still breaks.

**What this round did not do.** I did not re-read DECISIONS end to end, did not re-derive its code
claims at HEAD, and did not revisit any settled decision. FSPEC was read at HEAD in the sections
`9a4b7593..c1d7218e` touched, plus every section DECISIONS cites by id.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | `DEC-LI-06`'s reversibility is stated **Hard** on the ground that "adding [a cache] later means revisiting `E-32` and `AC-5.2` upstream first", with "`AC-5.2` (positive-membership filesystem oracle)" listed among the constraints forcing the no-cache shape. FSPEC v0.12 `BR-15` now compares expected and observed reads **as sets of paths, not counts** — a document opened more than once "neither adds a member nor changes the verdict" — and the corpus enumeration contributes no member. A per-dispatch or run-scoped read memo therefore leaves `BR-15`'s verdict identical, so `AC-5.2` no longer detects the reversal it is cited as guarding. The decision is unchanged and correct; its stated ground is now half-empty, and `D-O-6`'s seam call-counts are the sole falsifier. Fix: restate the ground as `E-32` + `D-O-6`, and note that `AC-5.2` is footprint-shaped, not cache-detecting | `DEC-LI-06` §Reversibility; §Constraints forcing the shape |
| F-02 | Medium | delta | local | `DEC-LI-03`'s re-evaluation trigger paraphrases FSPEC `A-2` as making the excluded-by-default case "a dispatch kind that is authoring in spirit **but not so classified**". `A-2` at HEAD was rewritten to quantify over a dispatch that "satisfies **neither** conjunct in the pipeline's own terms yet is authoring in spirit". The quoted authority is now narrower than the paraphrase: a dispatch that is authoring in spirit, is **not** authoring-classified, yet carries a C-1 target document satisfies one conjunct, falls outside `A-2`'s HEAD sentence, and is still excluded — by `BR-1`, not by `A-2`. The trigger remains observable, but a reader checking it against `A-2` will not find the sentence DECISIONS attributes to it. Fix: re-cite `BR-1`'s two-conjunct rule as the authority and keep `A-2` as the widening-is-explicit default | `DEC-LI-03` §Re-evaluation trigger |
| F-03 | Medium | inherited | nonlocal | v3's F-01, unlanded: row 4 of §Decisions deliberately NOT taken still presents AC-3.3's record locus as open and endorses TSPEC's run-level record, while FSPEC `BR-10` (v0.9, unchanged at v0.12) settled it — ordering keys per authoring dispatch, thresholds once per run, one completeness test per locus, run-level mirror "additive, not the oracle: nothing asserts on it". A PROPERTIES author following the row can assert over the non-oracle locus: green on a single-dispatch fixture, silently wrong on AT-18's divergent run. Not created by this delta and not gating it; recorded because DECISIONS' bytes have not moved and PROPERTIES is the next reader | §Decisions deliberately NOT taken, row 4 |
| F-04 | Low | inherited | nonlocal | v3's F-02, unlanded and now one version staler: `DEC-LI-07` cites "FSPEC **v0.7** `BR-14` carries the same five states" and the document header pins "FSPEC v0.7". HEAD is **v0.12**. `BR-14`'s five states are still unchanged, so the substantive claim is true, but a version-pinned citation naming a version two erratum rounds behind cannot be checked without redoing the diff | `DEC-LI-07` §Context; header Upstream row |
| F-05 | Low | inherited | local | v3's F-03, unlanded: `BR-10`'s completeness test is two tests, one per locus, and no `D-O` obligation owns either. `DEC-LI-10`'s DC-14 hand-transcription rule is scoped to the three `RSN-*` / corpus-outcome / `NTC-*` catalogues, so the per-locus tests inherit no anti-vacuity obligation from this document — nothing here stops them being written as `X === X` against the emitted record. `local` because `BR-10`'s two-locus closure is restated in the v0.12 header block this delta rewrote | `D-O-1`…`D-O-9` obligations table; `DEC-LI-10` |

FINDING: Medium | delta | local | DEC-LI-06 §Reversibility | Reversibility is stated Hard because "adding a cache later means revisiting E-32 and AC-5.2 upstream first", but FSPEC v0.12 BR-15 now compares reads as sets of paths rather than counts, so a read memo changes no member and AC-5.2 no longer detects the reversal it is cited as guarding; D-O-6's seam call-counts are now the only falsifier and the stated ground should say so
FINDING: Medium | delta | local | DEC-LI-03 §Re-evaluation trigger | The trigger paraphrases FSPEC A-2 as covering a dispatch "authoring in spirit but not so classified", while A-2 at HEAD quantifies only over a dispatch satisfying neither conjunct; the exclusion default still holds via BR-1's two-conjunct rule, but no longer via the sentence DECISIONS attributes to A-2
FINDING: Medium | inherited | nonlocal | §Decisions deliberately NOT taken, row 4 | v3 F-01 remains unlanded: the row still presents AC-3.3's record locus as open and endorses TSPEC's run-level record, while FSPEC BR-10 settled it at two loci with one completeness test each and declared the run-level mirror a non-oracle, so a PROPERTIES author can still be routed to assert over the mirror
FINDING: Low | inherited | nonlocal | DEC-LI-07 §Context and header Upstream row | v3 F-02 remains unlanded and is now one round staler: the document pins "FSPEC v0.7" while HEAD is v0.12; BR-14's five states are unchanged, so the claim is true but not checkable without re-deriving the diff
FINDING: Low | inherited | local | D-O obligations table / DEC-LI-10 | v3 F-03 remains unlanded: BR-10's two per-locus completeness tests are owned by no D-O obligation, and DC-14's hand-transcription rule covers only the three id catalogues, leaving the locus tests without an anti-vacuity obligation in this document

## Recommendation

## Verdict
