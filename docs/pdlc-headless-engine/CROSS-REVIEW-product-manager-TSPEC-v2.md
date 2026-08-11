# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.1)
**Upstream read:** `REQ-pdlc-headless-engine.md` v0.9; `FSPEC-pdlc-headless-engine.md` v1.3
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v1.md` (4 High, 2 Medium, 1 Low)
**Diff reviewed:** `27e77f93..HEAD` on `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (+551/−90)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** Local

## Disposition of v1 findings

Delta scope: only the sections the diff touched were re-read. Every v1 finding was answered in the
document; two of the answers do not yet hold up against HEAD, and those are re-raised below as new
findings against the *new* text rather than as unresolved old ones.

| v1 | Subject | v1.1's answer | Status |
|---|---|---|---|
| F-01 High | AC-1.3's two stop reasons had no carrier | §4.5's `loop` sub-block with `stopReason: "exhausted" \| "bound-reached"`, the two catalogue ids in §3.5, and §5.4's new paragraph stating that the exit code deliberately cannot carry the distinction | **Resolved.** The `run.mjs` citations check out: the `idle`/`no-queue` return is `:279-281` and `max-passes` is `:282`. One completeness gap remains on a path AC-1.3 does not cover — F-03 below |
| F-02 High | §4.5's `engine` block not checkable against FSPEC §12.2 | row-by-row table, nine rows, three marked "added in v1.1" (`startupAuth`, `retries[]`, `tunables`, `permissionMode`) | **Resolved as an enumeration.** I checked it against `FSPEC:1149-1160` row by row and the mapping is faithful and complete, including the six/three split. One row — per-phase dispatch counts — is not yet *satisfiable*, which is F-02 below |
| F-03 High | AC-3.3 had no owning mechanism, only verbatim pass-through | a fourth §7.4 harness row: the adapter records each descriptor's `{skill, label, model}`; observed `(phase, model)` pairs ≡ M-ENG-07's seven rows, both directions | **Not resolved.** The harness is the right shape but keys on a field no module supplies — F-01 below |
| F-04 High | AC-1.2 mapped to a section that observes nothing | new §7.7: an in-process `fs` recorder installed by the bootstrap, three clauses over one recording, two falsifying controls, a *populated* `.claude/workflows/` fixture | **Resolved, and well beyond the minimum.** See Positive Observations |
| F-05 Medium | §8.1's AC-1.5 row pointed at the CI job | repointed to §2.4 with `run.mjs:52`, `:58` and the two test citations; AC-1.2's row rewritten to §7.7 | **Resolved.** `WORKFLOW_MODULE_URLS` is at `run.mjs:52` as cited |
| F-06 Medium | two of REQ §4.1's five tunables never named | new §4.6: all five, with defaults, owner, resolution point, and three rules | **Resolved.** I re-checked each HEAD column: `adapter.mjs:57-60` (3 / 30 s / 15 min / 1 s jitter), `bin/pdlc.mjs:305` (`Infinity` when the flag is omitted), `run.mjs:273` (`maxPasses = 100` as a parameter default). The table is accurate. One reporting detail — F-04 below |
| F-07 Low | `transport` scalar vs AC-4.5's per-dispatch wording | §3.4 rewritten: no selector, `kind` constant, `"cli"` reachable only by direct unit construction, `R-TRANS-1` renamed as TSPEC-introduced after `BR-TRANS-6` was found not to exist upstream | **Resolved.** `FSPEC:193-196` says exactly what §3.4 now says |

## Findings

Two Highs, and they are the same root cause seen from two acceptance criteria. Stating it once here
so neither finding has to re-argue it:

> **No module dispatch anywhere supplies `opts.label`.** §4.1 declares `label: string|null // the
> module's phase label` and §7.4 and §4.4 both build on it. At HEAD, every `_agent` call site passes
> either nothing or `{ model }`: the general dispatcher passes `model ? { model } : undefined`
> (`orchestrate-dev.js:7124`), the seam wrapper passes `{ model: MODEL_DEFAULT, ...opts }`
> (`:8971`), and the four specially-pinned sites pass `{ model }` alone (`:1841` advisory, via
> `dispatchAt` reached again for the fallback at `:1861`; `:7463` verdict recovery; `:9968` PLAN-DAG
> extraction). The queue is the same (`orchestrate-queue.js:1053`). Grepping `orchestrate-dev.js`
> for `label:` returns 13 hits and **none** of them is an argument to a dispatch: eight are
> `PHASE_DISPATCH` row fields (`:3340`–`:3433`), the rest are git-helper seam options (`:8710`,
> `:8730`) and JSDoc. The adapter's own comment — "`opts.model` and `opts.label` are the two fields
> the modules actually pass" (`adapter.mjs:266-268`) — is stale, which is why `const tag = label ||
> skill` (`:274`) exists and why `tag` is *always* the skill today. So `label` is `null` on every
> dispatch, and any oracle or report field keyed on it carries the skill or nothing.
>
> The mechanism to fix it is already in the design: the modules **do** announce the phase, through
> the `_phase` seam (`phaseFn("Phase I: Wave …")` `orchestrate-dev.js:10136`, `:9516`, `:9951`,
> `:10066`, `:10289`), which the adapter currently only logs (`adapter.mjs:357-359`). Holding the
> last `_phase` label as run state and stamping it on each descriptor supplies the phase without
> touching a module — which matters, because §8.3 closes with "No other file under
> `pdlc/workflows/` is modified" and lists only the export/constant change.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§7.4's model-map harness asserts over a key the run cannot produce, so AC-3.3's reverse direction is still unowned.** The new row reads "the observed `(phase, model)` pairs ≡ M-ENG-07's seven rows, in both directions". Per the root cause above, `phase` is `null` on every dispatch, so the observed set is four pairs — `(null, opus)`, `(null, sonnet)`, `(null, fable)`, `(null, haiku)` — against seven rows. The reverse direction fails permanently and the only available repair is loosening the oracle, which is the exact vacuity trap §3.3 argues against so well two sections earlier. Two further problems survive even if the label is supplied: (a) M-ENG-07 row 1 is *"every phase except Phase I"* (`pdlc-engine-baseline.md:131`) — not a `(phase, model)` pair but a quantified statement over a dozen of them, so "observed pairs ≡ seven rows" is not yet a well-typed set-equality and needs a stated normalisation from pair to row; (b) rows 1 and 4 collide in descriptor terms even with a phase — the advisory fallback dispatches `ADVISORY_RUNG_SKILL` (`se-review`) on `opus` from inside `runAdvisorySeam`, indistinguishable from an ordinary `opus` `se-review` reviewer dispatch, so corpus run iv can pass while the fallback branch never executed. That is precisely the "a phase silently stopped pinning" failure AC-3.3 names. **Fix:** state where the phase comes from (the `_phase` seam is the cheap answer), give the descriptor a site discriminator for the two rows a phase cannot separate, and state the pair→row normalisation for row 1 — e.g. record `{ site, phase, skill, model }` and assert set-equality over `site`, with M-ENG-07's seven site ids transcribed literally as §7.4 already requires. | AC-3.3, AC-3.5 |
| F-02 | High | Local | **FSPEC §12.2's per-phase dispatch counts row is enumerated in §4.5 but not satisfiable, and §8.3 excludes the change that would make it so.** §4.4 correctly diagnoses the v1.0 gap — "FSPEC §12.2 asks for **per-phase** counts, and HEAD's `{[skill]: number}` cannot answer that, since one skill is dispatched from several phases" — and specifies `DispatchCounts` as `{ bySkill, byPhase: { [label]: number } }`. With `label` always `null`, `byPhase` is `{ "null": N }` for the whole run: a single bucket that answers the FSPEC row with less information than `bySkill` already carries, while §4.5's row-by-row table records it as satisfied. The same field is load-bearing in three more places the same way — `RetryRow`'s and `PauseRow`'s `label` (§4.4), and `authSources: [{ skill, label, attempt, apiKeySource }]` (§4.5), which is the per-dispatch record AC-2.4 and AC-4.5 both read. HEAD already shows the shape of the consequence: pause rows are pushed with `label: tag` (`adapter.mjs:305`) and denial rows with `label: tag` (`:340`), and `tag` is the skill. **Fix:** name the phase's source (per F-01) and add the resulting module-side or adapter-side change to §8.3's changed-files table, since "no other file under `pdlc/workflows/` is modified" is currently asserted alongside a report field that needs the modules to say which phase they are in. | AC-4.5, FSPEC §12.2 |
| F-03 | Medium | Local | **`loop.stopReason`'s two-value enumeration is not total over the loop's actual exits.** §4.5 says `pdlc queue --loop` "ends for exactly two declared reasons" and gives `stopReason` two values, and `loop` is `null` only "for `pdlc dev` and for a single-pass `pdlc queue`, which is the one place an absent value is meaningful: no loop ran". But `runQueueLoop` has a third exit the document knows about: a refusal returns `{ passes, outcome: "refused" }` (`run.mjs:277-278`), and §5.4 relies on that fact in the same revision ("since a refusal stops the loop, the worst is always the last iteration's"). A fourth exists — `outcome || "unknown"` on the non-`ran` path (`:280`). A loop that stopped on a refusal must carry *some* `stopReason`, and the design does not say which. This is not an AC-1.3 gap: AC-1.3 scopes its two reasons to the loop that "then exits 0" (`REQ:379-387`), and a refusal exits non-zero. It is a report-completeness gap on a field the operator reads to decide whether a queue is drained. **Fix:** either add the third member (`"refused"`) or state that `stopReason` is defined only for a zero-exit loop and say what the field carries otherwise — one sentence either way. | AC-1.3, AC-4.5 |
| F-04 | Low | Local | **`loop.maxIterations` reports `null` when unbounded, but the value in flight is `Infinity`, and the report is JSON.** §4.6 establishes that an omitted `--max-iterations` yields `Infinity` (`bin/pdlc.mjs:304-305`, verified) and §4.5 says `loop.maxIterations` is "`null` when unbounded". Those agree only by accident: `JSON.stringify(Infinity)` is `null`, so the file lands correct while an in-memory reader of the report object sees `Infinity`. The report is the operator-facing artifact and this repo's convention is that a report field's value is stated, not left to serialiser behaviour. **Fix:** state the conversion explicitly — the loop block records `null` for an unbounded run, converted at the point the block is built, not at serialisation. | AC-1.3, AC-4.5 |

## Questions

<!-- filled below -->

## Positive Observations

<!-- filled below -->

## Recommendation

<!-- filled below -->

## Verdict

<!-- filled last -->
