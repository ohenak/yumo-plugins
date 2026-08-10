# Cross-Review: product-manager — IMPLEMENTATION

**Reviewer:** product-manager
**Document reviewed:** `pdlc/workflows/consolidate-learnings.js` and the diff `main...feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 2
**Scope:** Local
**Phase:** CR (final codebase review)

## Method

Delta re-review protocol. My v1 review landed at `aed31561` (three commits:
`cdde436a`, `5a8be438`, `aed31561`). The controlling fact of this round is that
**`aed31561` is still HEAD**:

```
$ git log --oneline aed31561..HEAD
(no output)
$ git status --porcelain
?? .claude/
?? .serena/
```

There is no revision to diff against. No commit has touched
`pdlc/workflows/consolidate-learnings.js` since `785099b8` ("T30/T31 — the driver,
landed for real"), which predates my v1 review. The two untracked entries are the
tool-cache directories CLAUDE.md already documents as the local-only cause of the
`documentOracles.test.js` false-red; neither carries source.

So rather than diff sections, I re-verified each v1 High finding directly against
the tree, on the principle that a finding is only open if the code still shows it.
All five re-confirmed at the same line numbers; the greps are quoted per finding
below. I did not re-open any section I approved in v1, and I found no new issues —
there are no changed sections in which new issues could arise.

One detail I did not have in v1 and want on the record, because it *narrows* F-04
rather than widening it: `state.deferred` does reach the returned result object at
`consolidate-learnings.js:1052`, alongside `effectiveness`, `proposals` and the rest.
The datum is assembled and carried; only the two rendered operator surfaces discard
it. That makes F-04 smaller than "the pass loses its deferrals" — it is strictly a
rendering defect, and the fix needs no new plumbing.

## Findings

Every v1 finding carries forward unchanged, with its v1 ID. Severity and Scope are
unchanged from v1; the reconciliation note in the SKILL about not shipping conflicting
tags applies, and I have changed none.

| ID | Severity | Scope | Finding | Status this round | Requirement ref |
|----|----------|-------|---------|-------------------|----------------|
| F-01 | High | Local | `effectivenessTable` called with a single-element pass list, so `ineffective`/`unmeasurable` are unreachable | **Open** — `:651-655` byte-identical | AC-5.3, AC-5.5, AC-1.4 |
| F-02 | High | Local | `remediationChoice` has zero production callers; the revision/retirement ladder never runs | **Open** — still only `:1510` (comment) and `:1631` (definition) | AC-5.3, AC-5.4 |
| F-03 | High | Local | `seamCandidates` has zero production callers; no candidate is ever derived | **Open** — still only `:1788` (definition) | AC-6.2, AC-6.3 |
| F-04 | High | Local | `deferred:` is a hardcoded literal `none` in both operator surfaces | **Open** — `:2008`, `:2065`; narrowed, see Method | AC-7.1, AC-2.4, AC-3.5 |
| F-05 | High | Local | Report item 7 is the literal `advisory: none`; `state.advisory` is discarded after `:638` | **Open** — `:2064` | AC-7.1, AC-6.1 |
| F-06 | Medium | Cross-Feature | PR base branch hardcoded `"main"` at the `consolidationCreate` call site | **Open** — `:833` | AC-3.6, AC-3.8 |
| F-07 | Medium | Process | `consolidate-learnings/SKILL.md` still reads "Cadence: Manually invoked" | **Open** | AC-1.1, REQ §5 |
| F-08 | Low | Local | Module's own `meta` diverges from the bundle's `CONS_META` | **Open** | AC-1.1 |

### Re-verification evidence

The three zero-caller findings, re-run this round against HEAD:

```
$ grep -n "remediationChoice" pdlc/workflows/consolidate-learnings.js
1510:  * neither `prStates` nor `headExists`, so choosing it is the caller's job (`remediationChoice`).
1631:export function remediationChoice(id, records, prStates, headExists) {

$ grep -n "seamCandidates" pdlc/workflows/consolidate-learnings.js
1788:export function seamCandidates(counts) {

$ grep -n "effectivenessTable" pdlc/workflows/consolidate-learnings.js
651:  state.effectiveness = effectivenessTable(
1514:export function effectivenessTable(records, consumedTexts, config) {
```

For F-02 and F-03 the single definition line with no call line is the whole finding:
a `grep` that returns the definition and nothing else *is* the zero-caller proof.
For F-01, `:651` is still the only call, and `:653` still passes the one-element
literal `[{ passId: state.passId, consumed: … }]`, so the streak folds still see
exactly one pass.

The two hardcoded operator surfaces, and the datum they ignore:

```
$ grep -n "deferred: none\|advisory: none" pdlc/workflows/consolidate-learnings.js
2008:  lines.push(`deferred: none`);
2064:  lines.push(`7. advisory: none`);
2065:  lines.push(`8. deferred: none`);

$ grep -n "state\.deferred\|state\.advisory" pdlc/workflows/consolidate-learnings.js
638:  state.advisory = escalations;
856:  state.deferred = deferred;
1052:    deferred: state.deferred,
```

`state.advisory` is written once and never read. `state.deferred` is written at
`:856`, carried into the result at `:1052`, and read by neither renderer. F-06's
literal is unchanged at `:833` (`base: "main"`).

Because nothing changed, none of v1's "What to change" prescriptions need restating;
they apply verbatim, and I have re-read them for staleness rather than re-derived
them. The v1 file remains the actionable text.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v1, and now the load-bearing one: were F-02 and F-03 conscious deferrals? A round has passed with no code change and no reply, which is itself ambiguous — it reads the same whether the deferral is intended or the round was lost. If intended, a D-CONS row bound to a successor closes this in one edit and I would drop both to Low. If not, the fixes remain small. |
| Q-02 | Carried from v1: for F-01's fix, is folding over all prior passes' LEARNINGS bodies an acceptable per-pass cost, or is persisting standing state as a ninth record field preferred? The second option needs a change-controlled edit to `pdlc-consolidation-vocabularies.md`, so it costs a document round; the first does not. I still have no product preference between them. |
| Q-03 | Carried from v1: on F-06, is AC-3.8's two-repo support meant to cover repos whose default branch is not `main`? |
| Q-04 | New, process-shaped: this round produced no diff. If the optimizer was dispatched and declined, its reasoning would settle Q-01 immediately; if it was not dispatched, that is worth knowing before a third round spends the same budget. |

## Positive Observations

v1's positives stand in full and I will not re-list them — the falsifiability
machinery, the set-equality discipline in `routeOf` and the PR trailer, the
credential that never becomes a string, and the `no-cadence-datum` bootstrap are all
unchanged on disk and all still good work. Re-reading them this round did not
weaken any.

Two things worth adding, both discovered while re-verifying rather than in v1:

- **The defect surface really is only five call sites.** Having now walked the same
  ground twice, I can say the gap between what this module computes and what it
  delivers is five lines of wiring, not a design problem. `state.deferred` reaching
  `:1052` is the clearest instance: the data is already assembled correctly and
  travels correctly, and one renderer change closes AC-7.1's half of F-04. That is a
  good position to be stalled in.
- **Nothing regressed.** The convergence question this round includes "did the
  revision break anything," and the honest answer is that it could not have — the
  tree is byte-identical. Every green suite is still green for the same reasons, and
  the one red suite is still the documented untracked-file false-red, not a code
  fault.

## Recommendation

**Needs revision.**

Five High findings are open, unchanged, and re-confirmed at the same line numbers.
Under the High-only bar that is decisive, and I want to be precise about *why* it is
decisive rather than merely arithmetic: the verdict is not a judgement that the
round was wasted or that the work is poor. It is that the product gap v1 named —
three ACs' worth of computed behaviour that never reaches the operator — is exactly
as wide today as it was then. REQ-CONS-05 is what makes this a consolidation *agent*
rather than a consolidation *script*; until the effectiveness ladder can be reached
and reported, the pass can promote forever and never once tell the operator that a
promotion did not work.

The path to Approved is unchanged and short. In priority order, and all five in
`pdlc/workflows/consolidate-learnings.js`:

1. **F-01** — at `:651`, build the prior-pass list from the log's
   `<!-- pdlc:consumed -->` blocks (oldest first, current pass last) so the streak
   folds can reach `ineffective` and `unmeasurable`. `effectivenessTable` itself
   needs no change.
2. **F-02** — for each `ineffective` row, call `remediationChoice`, write the
   `revision`/`retirement` onto the row, and route the resulting proposal like any
   other (AC-5.4).
3. **F-03** — call `seamCandidates(escalations.counts)` at `:637` and carry the
   result on `state.advisory`.
4. **F-04** — render `deferred:` from `state.deferred` at `:2008` and `:2065`. The
   datum already reaches `:1052`; keep `none` for the genuinely empty case.
5. **F-05** — render item 7 at `:2064` from `state.advisory`: corpus state always,
   candidate when F-03 produces one.

F-06 through F-08 remain non-gating and can travel in the same change or a later one.

The one request from v1 I want to repeat, because it is what would stop this
recurring: **each of F-01 through F-05 should land with a test that exercises
`main()`, not the helper.** Every one of these functions is already unit-tested and
every one of those tests is green — the functions are correct, the calls are absent,
so a helper-level oracle structurally cannot see the defect. A `main()`-level case
for F-04 that supplies a non-empty `state.deferred` and asserts the rendered field is
not `none` would have caught it at authoring time, and today no test asserts that
field's value at all, because FSPEC §10.3 classifies it free-form and
`consolidationReport.test.js:235` excludes the name from vocabulary comparison. That
exclusion is correct for vocabulary and wrong as a substitute for a value assertion.

If Q-01 is answered as "deferred by intent," say so in a D-CONS row bound to a named
successor and I will re-review against that framing in one round — F-02 and F-03
would drop to Low, and F-01, F-04 and F-05 alone would still be a short path to
Approved.

## Verdict

VERDICT: Needs revision
{"high": 5, "medium": 2, "low": 1}
