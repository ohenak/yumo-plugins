# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.6, 2026-08-11)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** Delta re-review. Technical feasibility, implementability, completeness of error
handling, architectural compatibility. Product framing, UX and test-pyramid choices are out of
scope.

## Method

Delta protocol. Diffed `b0437963..HEAD` on the REQ (8 commits, `a0cf3aa9`…`cffd701b`; 256 lines
changed) plus the new `docs/_constraints/pdlc-engine-baseline.md`. Every `file:line` in the
changed text was re-verified against HEAD on `feat-pdlc-headless-engine`. Sections already
approved in rounds 1–2 were not re-litigated.

## Round-2 Findings Disposition

| ID | v2 Severity | State | Evidence in v0.6 |
|----|----------|-------|------------------|
| F-12 | High | **Resolved** | AC-3.3 now carries the `MODEL_ADVISORY` = `fable` row and scopes set-equality to a named three-run corpus. Citations verified verbatim: `MODEL_ADVISORY = "fable"` (`orchestrate-dev.js:1652`), dispatched `dispatchAt(MODEL_ADVISORY)` (`:1851`); `MODEL_ADVISORY_FALLBACK = "opus"` (`:1653`), reached only at `:1861` behind `isModelResolutionError`; `MODEL_DEFAULT` (`:1603`), `MODEL_IMPLEMENTATION` (`:1646`), `MODEL_QUEUE` (`orchestrate-queue.js:70`). The corpus device is the right fix. It is applied to the advisory rows only — see F-18. |
| F-13 | High | **Resolved** | AC-1.2(c) is now an unqualified empty read-set and every re-cite checks out: `parseDistributionCheckEnabledOptOut` is exported at `orchestrate-queue.js:2068` and called at `:1072` (comment block `:1066-1071`), the drift-state read sits in the ternary's else-branch (`:1074`) over `DRIFT_STATE_PATH` (`:64`), and `:1947`'s `record.checkEnabled === false` is correctly identified as `mapDriftState` row 2. The config read that *does* occur (`readAdvisoryConfigSafely(…, ADVISORY_CONFIG_PATH)`, `:1071`) is `.claude/pdlc.config.json`, which the AC's last sentence already permits — so the empty-set claim is exact, not approximate. |
| F-14 | High | **Resolved** | AC-2.1 is now an ordered first-match list with row 4 `auth.session-key-ignored` (API key present, flag not passed, logged-in settings present). Walked the AC-2.4 state through the list: rows 1–3 fail, row 4 matches, and row 6 makes the list total. AC-2.4 was updated in the same edit to name row 4, so the two ACs no longer disagree. |
| F-15 | Medium | **Resolved** | AC-4.2's sixth row now reads `timeout, retryable, retryable` → 3 attempts, non-terminal, one retry owed, with a seventh row carrying the terminal 4-attempt sequence. Arithmetic checks against the §4.1 default of 3 retries after the first attempt. The added `timeout`-cap clause resolves Q-04/TE Q-02 in the same place. |
| F-16 | Low | **Resolved** | The 0.6 change note enumerates only what changed and closes with "nothing outside these findings changed"; the diff bears that out — no goal, constraint or AC outside the named set was touched. Prior change notes were compressed rather than dropped, so lineage survives. |

## Findings

Two of the three new findings are the same shape as F-12: a literal oracle whose enumeration
does not close over what a correct run at HEAD actually produces. Both are mechanical to fix.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-17 | High | Local | **AC-1.1 clause 1's closed filename set omits artifacts a correct run creates, so a passing pipeline fails the oracle.** The new rules declare `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `LEARNINGS` (i) plus `DECISIONS-{f}.md` and `CROSS-REVIEW-*` (ii), then close the set: "No filename outside (i) and (ii) may appear". At HEAD a default run creates at least two further families under `docs/{f}/`. **`CODE_REVIEW-{f}-v{N}.md`**: Phase DOD is on by default (`PHASE_DOD_ENABLED = true`, `orchestrate-dev.js:23`, threaded as `_phaseDodEnabled` at `:8937`), it is a module constant with no consumer-config channel — so "the phases enabled by that repo's config" cannot switch it off — and the verifier is told to write that exact path (`:7947`), which the orchestrator then reads back (`:10385`). **`POSTMORTEM-{phase}-{f}.md`**: clause 4 of this same AC admits `halted` as a passing lifecycle value, and a halt writes `docs/{feature}/POSTMORTEM-{phaseId}-{feature}.md` (`:5458`, `:6680`, `:9234`). (`ADVISORY-{f}.md`, `:2687`, is a third family, reachable only with the tier enabled — worth naming for completeness even though it ships off.) Fix: add `CODE_REVIEW-{f}-v{N}.md` as a run-dependent member under (ii) with the same iff-rule form used for `DECISIONS` (exists iff the run report records DoD rounds; one file per round), and either admit `POSTMORTEM-{phase}-{f}.md` under a halt-conditioned rule or narrow clause 4 to the non-halt lifecycle values. The two-rule structure TE F-06 asked for is right; only its membership is short. | AC-1.1 clause 1; AC-1.1 clause 4 |
| F-18 | High | Local | **AC-3.3's `haiku` row is exercised by zero dispatches in the declared corpus — F-12's failure mode, left in place on the row F-12 did not touch.** The corpus is now fixed as the union of exactly three dry runs, and the `haiku` row is assigned to run (i), "`pdlc dev` over the full phase graph, advisory tier disabled". Neither cited site is on the unconditional path of such a run: `:7463` is inside `recoverVerdict`, dispatched only when a reviewer's VERDICT trailer is missing or malformed (`:7440-7462` documents it as "cheap trailer recovery … re-asks the same reviewer"), and `:9968` fires only in the `else` branch after `parsePlanTasks` fails to parse the PLAN table (`:9958-9963`) — the script's own comment says the LLM is reached "only if the table is not parseable". A dry run whose reviewers emit well-formed trailers and whose PLAN parses in-script — i.e. the healthy run the corpus describes — dispatches `haiku` never, and the "every map row is exercised" direction fails exactly as it did for `MODEL_ADVISORY_FALLBACK`. Two related defects on the same row: the label "verdict-recovery re-read dispatches" describes `:7463` only, while `:9968` is PLAN-DAG extraction — a different trigger, so a transcriber cannot tell from the row what to provoke. Fix: split the row in two (verdict recovery; PLAN-DAG extraction fallback) and give each a corpus entry that names the provocation, the way the fallback row now names "with `fable` resolution forced to fail". | AC-3.3 |
| F-19 | Medium | Local | **AC-3.3's corpus is declared as three runs but the map needs four configurations.** The prose fixes the corpus as "the union of three dry runs" and enumerates (i), (ii), (iii); the fallback row's *Corpus run* cell then reads "iii, with `fable` resolution forced to fail", which is not run (iii) as defined — run (iii) with `fable` resolving normally exercises `MODEL_ADVISORY` at `:1851` and never reaches `:1861`. A test engineer transcribing the table can recover the intent from the cell, so this is not blocking, but the count and the cells contradict each other. Fix: say "four dry runs" and promote the forced-failure variant to a named corpus member (iv), or state that (iii) is run twice under both resolution outcomes. | AC-3.3 |
| F-20 | Medium | Local | **AC-1.1 clause 1 observes files *created*; clauses 2–3 observe files *present* — and Phase H deletes the difference.** Clause 1's new wording is "the artifact **filenames** created under `docs/{f}/`", while clause 2 ("every `CROSS-REVIEW-*` file carries a parseable `VERDICT:` line") and clause 3 ("approval anchors … are present") read a surviving tree. At HEAD the harvest dispatch instructs the agent to "delete the harvested CROSS-REVIEW-* and CODE_REVIEW-* files" once the LEARNINGS commit is confirmed on remote (`orchestrate-dev.js:7605`, `:7609`) — a deletion the repo's own `guard-harvest-before-delete` hook exists to permit rather than prevent. So on a run that reaches Phase H, the created set and the end-state set differ by every cross-review, and clause 1's (ii) set-equality holds only under the creation reading while clauses 2–3 are satisfiable only under the survival reading. Fix: state once, for the whole oracle, that the observation is over creation events recorded during the run (filesystem observation is already AC-1.2's method), and mark clauses 2–3 as assertions over each file's content *at creation time*. | AC-1.1 clauses 1–3 |
| F-21 | Low | Local | **AC-4.2's `retryable`, `timeout`, `timeout` case lives in prose under a table that otherwise enumerates every transcribable sequence.** The new cap clause is correct and needed, but it introduces a seventh observable sequence ("terminal `timeout` at 3 attempts") outside the table a test is told to transcribe. Fix: add it as a row; the clause then explains the table rather than extending it. | AC-4.2 |

## Questions

Round-2 Q-05 is answered — AC-1.1's *Given* now carries the `distribution.checkEnabled: false`
posture, and AC-1.2 no longer contradicts it. Q-06 is unchanged and still open; it is a TSPEC
decision, not a REQ gap.

| ID | Question |
|----|---------|
| Q-06 | *(carried)* How does AC-6.2's opt-in live smoke coexist with AC-6.1's hermeticity guard, given AC-6.1 states the guard "fails the suite on any attempt to construct a real transport"? Presumably the guard is armed per-suite rather than per-process, but who owns that switch is a TSPEC decision AC-6.1's wording currently forecloses. |
| Q-07 | Corpus run (iii) enables the advisory tier to exercise the `fable` rung. Which seam is the intended provocation — an A3/A4 Phase-DOD assist, or A5 in Phase PUB? A dry run that never reaches DOD dispatches no advisory agent at all, so the corpus entry may need the phase named as well as the config flag. Not blocking: any of them satisfies the row, and TSPEC can pick. |

## Positive Observations

- **The three round-2 High findings were fixed at the mechanism, not at the wording.** AC-1.2(c)
  did not merely delete the carve-out; it re-derived why no read occurs, cited the ternary that
  short-circuits it, and kept the wrong-citation correction visible in parentheses so the next
  reader does not re-file `:1947`. That parenthetical is the cheapest possible defence against a
  finding recurring, and it costs three lines.
- **The corpus device in AC-3.3 is a genuinely better answer than the one F-12 asked for.** I
  asked for a `fable` row plus a named configuration; the author generalised to a dispatch corpus
  with a per-row provenance column, which makes the *next* unexercised row visible by inspection.
  That the `haiku` row (F-18) is now legibly wrong is a property of the new structure working —
  under v0.5's phrasing the same defect was invisible.
- **Relocating the measured facts to `docs/_constraints/pdlc-engine-baseline.md` is the right
  home and the extraction is faithful.** Spot-checked every relocated citation at HEAD: `agent()`
  throws at `orchestrate-dev.js:8458`, `parallel`/`pipeline`/`phase` have plain-Node bodies at
  `:8464`/`:8469`/`:8474`, `defaultReadFile` → `fs.readFileSync` at `:8492`, `orchestrate-queue.js:948`
  carries its own `fs`-backed default, `rtSkillPrompt` is `runtime-adapter.js:47`, and the file is
  exactly 53,056 bytes. The baseline file's own header ("read-only, not a pipeline artifact …
  re-baselining is a mechanical fix, not a finding") pre-empts the drift argument that would
  otherwise recur every round.
- **§1.2a's red/green table stayed honest under pressure to shrink.** The edit that trimmed the
  REQ for size moved AC-4.5's per-dispatch auth clause from green to red rather than leaving a
  flattering row intact, and cites the reason precisely — `adapter.mjs:320` keeps a single
  `lastApiKeySource` surfaced as one scalar. Downgrading your own green row while cutting bytes
  is the hard direction to cut in.
- **AC-2.1's shift from "total mapping" to an ordered first-match list is the correct repair of a
  taxonomy, not a patch.** Adding row 4 alone would have left rows 2 and 4 overlapping; declaring
  first-match makes the overlap harmless and row 6 makes the list total, so the table is now
  transcribable as written.

## Recommendation

**Needs revision**

All three round-2 High findings are resolved, and I could not find a citation in the changed
text that does not hold at HEAD — the re-verification claim in the 0.6 change note is accurate.
The document is close.

What blocks approval is the same class as last round, now down to two instances, both in
enumerations that declare themselves closed:

1. **F-17** — AC-1.1's closed filename set omits `CODE_REVIEW-{f}-v{N}.md`, which a default run
   always creates (Phase DOD is a module constant, `orchestrate-dev.js:23`, not consumer config),
   and `POSTMORTEM-{phase}-{f}.md`, which clause 4 of the same AC implicitly admits by accepting
   `halted`. Add them as run-dependent members under rule (ii), or narrow clause 4.
2. **F-18** — AC-3.3's `haiku` row is exercised by no dispatch in the three-run corpus: both cited
   sites are contingent recovery paths (`:7463` malformed trailer, `:9968` unparseable PLAN table),
   and the row's label describes only the first. Split the row and name each provocation, exactly
   as the fallback row now does.

F-19 (corpus counted as three, needs four), F-20 (created-vs-surviving observation window under
Phase H's harvest deletion) and F-21 (AC-4.2's seventh sequence in prose) are recorded and not
gating.

No erratum: the REQ is the root of this chain, and I found no defect in the DECISIONS or
DOMAIN-CONSTRAINTS material it cites. `docs/_constraints/pdlc-engine-baseline.md` is new this
round and is a REQ-owned extraction, reviewed here rather than routed.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 2, "low": 1}
