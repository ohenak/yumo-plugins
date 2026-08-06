# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 5
**Scope:** Local (Scope tags per finding below)
**Delta base:** `170573c` (the tree v4 reviewed) → HEAD

Delta re-review. v4's findings F-29…F-32 are dispositioned in §Prior findings; new findings are
numbered F-33 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `170573c` were read for new issues; unchanged sections approved in v1–v4 were not revisited.

## Prior findings

All four v4 findings are resolved. Each disposition was checked against the code the revision cites,
not against its prose.

| v4 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-29 | Medium | **Resolved** | The disjointness claim is gone and replaced by the right rule: the split is "**per file, not a fixed partition of the catalogue**, and row 3 takes precedence over every other statement here", with the union set-equal to the catalogue *for every file* — which is what keeps the mapping total without asserting a false property. The supporting claims all check out: `POSTMORTEM-${phaseId}-${feature}.md` is built at `orchestrate-dev.js:5429` (verified — `const postmortemPath = \`docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md\``); Phase CR runs that loop (`const crResult = await reviewLoop({` at `:10255`, `phase: "CR"` at `:10257`); and the halt path builds the same name from whatever phase halted (`const candidate = \`docs/${featureName}/POSTMORTEM-${haltPhase}-${featureName}.md\`` at `:10603` — a citation this round added, and it resolves). The closing sentence "a set-equality test transcribed from this paragraph must be written per file" is the part that makes it testable: the oracle is now stated at the granularity the rule actually holds at. |
| F-30 | Medium | **Resolved as decided** | AC-1.3's Commits cell for `refused` now reads "**yes** — its AC-7.2 row, and that row only", AC-7.2's Given clause names `refused` inline, AC-4.2 gives that row's `credential:` value (`absent`, with the closed set explicitly covering "terminated before reading one"), and the `failed` cell is flattened to plain `yes` with the reason. The three-place contradiction (AC-1.3 / AC-7.2 / REQ-CONS-01's "a `refused` row is not a datum") is settled in the direction the other two already assumed, and the exemption set stays a single member. The fixture now has one expected value. Two consequences of this decision were not carried through, however — see F-33 and F-34; both are in the *ripple*, not in the decision. |
| F-31 | Low | **Resolved in substance** | The cited range is now `:3337-3437`, which contains all eight keys (`R:` opens at `:3337`, `DOD:` at `:3431`, the object closes at `:3437` — all verified), so the set-equality source is fully recoverable from the cited bytes. The parenthetical still labels `:3337` the "declaration", which is off by one (`export const PHASE_DISPATCH = {` is `:3336`; `:3337` is `R: {`) — restated as F-35, Low. |
| F-32 | Low | **Resolved** | The `CODE_REVIEW` naming authority moved to `orchestrate-dev.js:7911`, which is the dod-verify prompt's `docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md` interpolation and is taken on every DoD round (verified), with the classifier `:6423` (`if (/\/CODE_REVIEW-[^/]*$/.test(name)) return "code-review";`) cited alongside. Both are unconditional, so all three rows of the mapping table now carry the same evidentiary weight. |

Q-10 is answered by REQ-CONS-01's new two-clause construction: clause **(a)** makes the
`<!-- pdlc:consumed {passId} -->` pair unconditional — "even when its consumed set is empty" (the
pair is then empty), so the boundary is frozen by the *first* marker-holding pass rather than by the
first one that happened to consume something — and NFR-5 carries the same clause. That is the
answer I was fishing for, and it is stated as a requirement rather than left to be inferred from a
table cell.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
