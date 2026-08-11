# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.7, 2026-08-11)
**Date:** 2026-08-11
**Iteration:** 4
**Scope:** Delta re-review. Technical feasibility, implementability, completeness of error
handling, architectural compatibility. Product framing, UX and test-pyramid choices are out of
scope.

## Method

Delta protocol. Diffed `6d356584..HEAD` on the REQ (219 lines changed) plus the 62 added lines in
`docs/_constraints/pdlc-engine-baseline.md`, which is where this round's largest movement went.
Every `file:line` in the changed text — including the text relocated out of the REQ, which counts
as changed for this purpose — was re-verified against HEAD on `feat-pdlc-headless-engine`.
Sections approved in rounds 1–3 were not re-litigated.

## Round-3 Findings Disposition

| ID | v3 Severity | State | Evidence in v0.7 |
|----|----------|-------|------------------|
| F-17 | High | **Resolved** | AC-1.1 clause 1(ii) now carries a rule per run-dependent member: `DECISIONS-{f}.md`, the `CROSS-REVIEW-*` set, `CODE_REVIEW-{f}-v{N}.md` (one per recorded DoD round, with the correct reason — the gate is a module constant, `PHASE_DOD_ENABLED = true`, `orchestrate-dev.js:23`, not a consumer-config switch; the verifier is told to write that exact path at `:7947` and the orchestrator reads it back at `:10385`), `POSTMORTEM-{phase}-{f}.md` iff the report records a halt of that phase, and `ADVISORY-{f}.md` iff the tier is enabled. I re-derived the closure independently rather than trusting the list: every literal path any module writes under the feature directory is `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS`, `LEARNINGS`, `CROSS-REVIEW-*`, `CODE_REVIEW-*`, `POSTMORTEM-*`, `ADVISORY-*`, and the only dynamic feature-dir paths (`orchestrate-dev.js:9279`, `:9447`, the erratum route) interpolate `${target}` from the same six-member DOCTYPE set. The enumeration is now total. |
| F-18 | High | **Resolved** | The `haiku` row is split into two rows naming distinct sites and distinct provocations — verdict recovery (`:7463`, inside `recoverVerdict`, whose own header comment scopes it to a missing or malformed trailer, `:7441-7443`) and PLAN-DAG extraction (`:9968`, the `else` branch taken when `parsePlanTasks` yields no tasks, `:9958-9962`) — and each is assigned corpus run v(a)/v(b), whose fixtures supply exactly those provocations. The label defect is fixed with the row split rather than by rewording. |
| F-19 | Medium | **Resolved** | The corpus is recounted as five configurations, with run iv ("run iii repeated, `fable` model resolution forced to fail") promoted to a named member, so the fallback row's corpus cell is now a member of the declared set instead of a variant described only in the cell. Q-07 is answered in the same table: run iii names the seam (Phase-DOD A3/A4 sufficient, any seam satisfies the row). |
| F-20 | Medium | **Resolved** | AC-1.1's preamble now fixes the observation window once for the whole oracle: clauses 1–3 assert over creation events, a harvested file's later absence is not a failure, and the reason is stated (Phase H deletes harvested `CROSS-REVIEW-*` / `CODE_REVIEW-*` after the LEARNINGS commit is confirmed on remote — `harvestPrompt` steps 5–6, `orchestrate-dev.js:7607-7608`). Placing it in the preamble rather than per-clause is the better of the two fixes I offered. |
| F-21 | Low | **Resolved** | `retryable, timeout, timeout` → 3 attempts, terminal `timeout` is now a table row, and the cap clause is rewritten to explain the table ("this clause explains the table rather than extending it"). Arithmetic re-checked across all seven rows against the §4.1 default of 3 retries: no row exceeds 4 attempts and the non-terminal row is the only one that owes a further attempt. |
| TE v3 F-01 | — | **Resolved (verified)** | AC-2.4's *Given* now pins logged-in settings state with `CLAUDE_CODE_OAUTH_TOKEN` absent, which is the state AC-2.1's ordered list resolves to row 4. Walked the list again: row 1 fails (no token), row 2 fails (key present), row 3 fails (flag not passed), row 4 matches. The two ACs agree. |

## Findings

No High findings. Both round-3 blockers are resolved at the mechanism, and I could not find a
citation in the changed text — REQ or relocated baseline — that fails to hold at HEAD. What
remains is one governance consequence of *where* this round put the fixture, and one legibility
cost of the same move.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-22 | Medium | Process | **AC-3.3's normative fixture now lives in a document the review loop declares out of scope for itself.** M-ENG-07 is not a measured fact in the sense M-ENG-01…05 are; it is the *literal expected value* of a set-equality oracle, and AC-3.3 now holds no transcribable content at all — it delegates both the map and the corpus by id. The host file's own header says "Read-only reference, not a reviewed pipeline artifact. No cross-review is written against it and nothing gates on it. Cite it; do not re-litigate it here." Taken together: the one artifact whose drift AC-3.3 exists to catch sits where no reviewer is asked to look and where the next author is told not to re-open it. I reviewed M-ENG-07 here anyway (all seven rows verified: `MODEL_DEFAULT` `:1603`, `MODEL_IMPLEMENTATION` `:1646`, `MODEL_ADVISORY = "fable"` `:1652` dispatched `:1851`, `MODEL_ADVISORY_FALLBACK` `:1653` dispatched `:1861`, `MODEL_QUEUE` `orchestrate-queue.js:70`, `haiku` at `:7463` and `:9968`) — so the content is sound today and this is not a correctness finding. Fix (cheap, no relocation needed): have AC-3.3 name M-ENG-07 as **normative for PROPERTIES transcription** and state that a change to a pinned model updates M-ENG-07 in the same commit as the module — the second half is currently asserted inside M-ENG-07, i.e. inside the unreviewed file, where it binds nobody. Better still, PROPERTIES should carry the seven rows verbatim, so the reviewed layer holds the fixture body and the baseline holds the provenance. | AC-3.3; `docs/_constraints/pdlc-engine-baseline.md` M-ENG-07 |
| F-23 | Low | Local | **§1.2a now reports only the red set, so the REQ alone cannot distinguish green from partially-green.** The compressed §1.2a lists the red ACs and points at M-ENG-06 for the rest. The relocation is faithful — I diffed the moved table cell by cell and re-verified the evidence (`adapter.mjs:320` single `lastApiKeySource`, `report.mjs:51`, `bin/pdlc.mjs:227`, `startup.mjs:20`/`:102` frozen `EXPECTED_SKILLS` containment, `smoke.test.js:294` halt test, 7 `lib/*.mjs` and 9 `__tests__/*.test.js` present) — but AC-1.4/4.3/6.1's *partially green* state is exactly the distinction §1.2a existed to make, and it is the one a planner most needs (a partially-green AC needs a guard added, not a suite written). Fix: keep one sentence in §1.2a naming the partially-green ACs, and let the evidence stay in M-ENG-06. | §1.2a |
| F-24 | Low | Local | **AC-3.3 asserts a property of M-ENG-07 that M-ENG-07 must keep true, with no pointer back.** AC-3.3 says "seven map rows over a corpus of five named configurations". That count is correct at v0.7, but if a future edit to the baseline adds a row (a new model tier), the REQ silently becomes wrong and nothing reads it. Either drop the counts from AC-3.3 or add a line to M-ENG-07 saying its row/corpus counts are cited in AC-3.3 and must be updated together. | AC-3.3 |

## Questions

Q-06 is carried unchanged and remains a TSPEC decision, not a REQ gap. Q-07 is answered by
M-ENG-07's corpus run (iii), which names the seam and states that any seam satisfies the row.

| ID | Question |
|----|---------|
| Q-06 | *(carried)* How does AC-6.2's opt-in live smoke coexist with AC-6.1's hermeticity guard, given AC-6.1 states the guard "fails the suite on any attempt to construct a real transport"? Presumably the guard is armed per-suite rather than per-process, but who owns that switch is a TSPEC decision AC-6.1's wording currently forecloses. |
| Q-08 | Corpus run iv reaches `MODEL_ADVISORY_FALLBACK` by forcing `fable` resolution to fail. At HEAD the fallback is guarded by `isModelResolutionError` (`orchestrate-dev.js:1861`), so the fixture must raise an error that predicate accepts — a shape detail, hence TSPEC's, not this REQ's. Naming it there would keep the corpus row from being satisfiable only by trial. |

## Positive Observations

- **F-17 was fixed by making the enumeration derivable, not by appending two names.** Each new
  member arrives as an iff-rule keyed to something the run report records, which is the same form
  `DECISIONS` already used — so the set stays closed under runs the author did not imagine. I
  tried to break it by enumerating every feature-dir write path in both modules, including the
  erratum route's interpolated `${target}`, and the rules cover all of them.
- **The `CODE_REVIEW` clause states the *reason* the gate cannot be configured off.** "Not a
  consumer-config switch this AC's *Given* can disable" is the precise fact (`PHASE_DOD_ENABLED`
  is a module constant), and carrying it inline means the next reader cannot re-file the finding
  by reasoning from the AC's config-driven phrasing.
- **F-18's split is the structural fix, not the cosmetic one.** Two rows, two sites, two named
  provocations, two corpus cells — a transcriber can now provoke each row without reading
  `orchestrate-dev.js`, which is the whole point of a literal fixture.
- **Defining the corpus over *recorded dispatch descriptors* rather than executed calls closes
  the loop with AC-6.1.** It was the unstated assumption that made the previous corpus look like
  it needed live runs; stating it makes every row satisfiable hermetically, and it is the kind of
  clarification that removes a future TSPEC argument rather than deferring one.
- **The round is size-negative while widening two enumerations.** The change note claims it and
  the diff bears it out (+109/−110 in the REQ). Getting stricter and smaller in the same round is
  the hard direction.

## Recommendation

**Approved with minor changes**

Both round-3 High findings are resolved, both round-3 Mediums and the Low are resolved, and the
TE-side AC-2.4 pin lands consistently with AC-2.1's row 4. I re-verified every citation in the
changed text against HEAD — including all of M-ENG-06 and M-ENG-07, which are new text this round
even though they read as relocation — and found none that fails.

Nothing blocks. F-22 (the oracle body now lives in a file the loop declares unreviewed) is the one
worth acting on before PROPERTIES is authored, because the cheapest fix is to have PROPERTIES
carry the seven rows verbatim; F-23 and F-24 are one-line edits. All three can be taken in the
next document rather than in another REQ round.

No erratum: this REQ is the root of the chain, and `docs/_constraints/pdlc-engine-baseline.md` is
a REQ-owned extraction reviewed here rather than routed.

## Verdict

VERDICT: Approved with minor changes
{"high":0,"medium":1,"low":2}
