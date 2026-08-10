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

## Recommendation

## Verdict
