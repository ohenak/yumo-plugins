# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/FSPEC-pdlc-rcv-budget-stop.md` (v1.1, 949 lines)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Not product strategy, not test-pyramid choices, not fixture construction.

## Review basis (this is not a delta re-review)

The orchestrator marked this iteration 2 and directed the delta protocol against
`CROSS-REVIEW-software-engineer-FSPEC-v1.md`. **That file does not exist** — not on the branch, not
in `git log --diff-filter=D` on any ref. The only FSPEC cross-review of round 1 is the test
engineer's. So there is no prior software-engineer position to diff against and no "commit I last
reviewed"; a delta pass would have silently reviewed nothing.

**I therefore reviewed the whole document at HEAD (`096b64d`), first pass, and numbered it v2** as
instructed. Findings below are stated against v1.1 in full, not against the v1.1 revision record's
seven te-driven edits — though I did read those edits and they are noted where they bear on a
finding. The approval bar is the same either way.

## Existing-code claim verification

Batched in one pass, per the cross-cutting rule. Every claim this FSPEC makes about *existing* code
was checked against the working tree, not against the `M-*` row that carries it. **All of them
hold.** Recording the checks so no later round re-does them.

| Claim | Where | Verified |
|---|---|---|
| Phase DOD's bound and the post-ship budget are **both 3**, from **two distinct declarations** — the premise of B-BUD-3's whole structural observable | §3.1 | ✅ `DOD_MAX_ITERATIONS = 3` (`orchestrate-dev.js:25`) and `MAX_REVIEW_ROUNDS = 5` (`:52`) are separate module-scope consts; `dodLoop` defaults `maxIterations = DOD_MAX_ITERATIONS` (`:3833`) and never reads the review constant. The coincidence B-BUD-3 is built to survive is real |
| The suite keeps its **own copy** of the width, so AC-1.2/O-13(b)'s blast radius is not hypothetical | §3.2 (B-BUD-5) | ✅ `__tests__/pacingWrapper.test.js:77` `const MAX_REVIEW_ROUNDS = 5;` and `__tests__/roundDerivation.test.js` `EXPECTED_WINDOW_WIDTH = 5`, both hand-maintained, both invisible to the module. The constant is unexported |
| `D` is *"of the document type under review, never the whole directory"* — stated as normative in §4.1/§4.2 | §4.1 | ✅ **already true at HEAD**, not a change: `deriveRoundWindow` drops well-formed basenames of a different doc type before building `present` (`:2448`, `if (result.docType !== docType) continue;`), and `startIndex` is `max(indices)+1` over that filtered map (`:2470-2473`) |
| An **unreadable-but-present** post-mortem reads `status: "none"` | §5.3 (B-REG-6), E-8 | ✅ `checkPostmortem` (`:2738`) returns `{status: "none"}` when `_readFile` yields `null` or blank, before any marker parse. **But see F-01** — the reading is right and its consequence is unspecified |
| A **duplicated** unfenced marker reads unresolved | §6.1 (B-CLR-5), E-5 | ✅ `parseResolvedMarker` returns `{ok:false, reason:"duplicated"}` on more than one; `checkPostmortem` maps everything but `ok && resolved` to `unresolved` |
| The shipped step-G text is `Refused — unresolved POSTMORTEM at {path}` | §4.3 (B-WIN-7), §8.3 | ✅ `:4501` literal, exact |
| The shipped Iterations literal is `Iterations ({N} — limit reached)` and is **the agent's**, emitted through the post-mortem prompt's section list | §8.1 | ✅ `:1965`, inside `postmortemPrompt`. Nothing in the loop writes or reads that heading today, which is what makes clause 3 a new loop-owned write rather than an edit |
| `iterations` returned is the **budget**, not the rounds run | §8.1 (B-RPT-3) | ✅ `:2011` `iterations: MAX_REVIEW_ROUNDS` |
| A halt currently returns the **previous round's** reviewer verdicts | §8.2 (B-RPT-5) | ✅ `:2003-2006` builds `lastResults` from `result1`/`result2`, which are `undefined` on a loop-top halt — so B-RPT-5 is a real change and its defect is real |
| The halt path dispatches the authoring agent **unconditionally**, with no existing-file check | §7.4 (B-HALT-2) | ✅ `:1974` dispatches `postmortemPrompt` before any probe; the only `_checkFile` is the post-write confirmation (`:1990`). The no-re-author rule is a genuine new branch |
| `E-1b`'s claim that this repo's own `POSTMORTEM-R-pdlc-rcv-budget-stop.md` **is exactly the pre-feature shape** | E-1b, AT-CLR-08 | ✅ `## Iterations (5 — limit reached)` at line 48, `RESOLVED: yes` unfenced at line 373, **no** `## Reset Region` anywhere. The migration case is this branch's own next entry, which is the right way to pick a fixture |
| Catalogue §4's `{which}` enum is exactly the three literals §8.3 quotes, and the S-16 enum is closed at three | §8.3, BR-16 | ✅ catalogue §4 *❌ phase-row text* row: `answering line`, `halt line`, `iterations section`; §2 S-16: `{invalid-window-start, invalid-window-resumed, counts-mismatch}` |
| `DC-01`, `DC-03`, `DC-05`, `DC-08`, `DC-10` exist and say what they are cited for | §5.4, §11, §13 | ✅ all five present in `DOMAIN-CONSTRAINTS.md` |

**Nothing in the *"the existing code already does X"* class is unverified.** The one claim I could
not confirm from the module — that a Phase CR halt reaches the same post-mortem-writing path
(B-HALT-8, M-7f) — is carried by the baseline with a line citation (`:4721-4733`), and Phase CR does
enter `reviewLoop` with `phase: "CR"` (`:4980`), whose loop-top halt writes
`POSTMORTEM-CR-{feature}.md` by the same template. Consistent.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
