# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.3)
**Date:** 2026-08-11
**Iteration:** 4
**Scope:** delta re-review of the v1.3 revision — whether v3's four findings are resolved and
whether the revision broke anything. Diffed `041d865b..HEAD` (the commit carrying the v3 review);
unchanged sections are not re-reviewed. Every claim below is grounded in HEAD source on
`feat-pdlc-headless-engine` at a cited `file:line`.

## Prior findings disposition

All four v3 findings were addressed. I checked each against HEAD rather than against the changelog.

| v3 finding | Disposition | Verification |
|---|---|---|
| F-22 High — §7.4 rows 1/2 quantified on the normalised phase, so Phase I's V-wave (announced `"Phase PT"`, pinned `sonnet`) made row 1 red on correct code, and run i's Phase-I mode was unstated | **Resolved, both halves.** Rows 1/2 now partition on a defined *Phase-I wave set* (`phase === "Phase I"` plus the V-wave descriptor `phase === "Phase PT" && skill === SKILL_SE_IMPLEMENT`), §4.1's normalisation is left honest, and run i is pinned to wave mode with the mode **asserted** (≥1 `"Phase I"` and ≥1 V-wave descriptor) rather than assumed | V-wave banner `orchestrate-dev.js:10248`, dispatch `"se-implement"` `:10251`, `{ model: MODEL_IMPLEMENTATION }` `:10253`, `MODEL_IMPLEMENTATION = "sonnet"` `:1646`; wave selection `:9995`; the two Phase-PT sites are genuinely branch-exclusive — legacy `:10066`–`:10068` sits inside `if (!waveMode)` (`:9997`), the V-wave in the `else`, so a fixture drifting into legacy mode turns row 2 red rather than reinterpreting it, exactly as §7.4 claims |
| F-23 Medium — row 4's run-wide `seq` adjacency conjunct was a flakiness source the row did not need | **Adjacency removed as asked; the replacement discriminator is not mechanised — new High F-26.** The ambiguity half *is* fixed: the spec now says the `fable` dispatch raises the error (`:1861` is reached only behind `isModelResolutionError`), which is correct | `resolveAdvisoryRung` `:1798`; memo `:1844`–`:1845`; `dispatchAt(MODEL_ADVISORY)` → fallback at `:1861` |
| F-24 Low — §4.1's 13-`label:` enumeration was one row short | **Resolved.** `:9574` is now listed as `routeErrata`'s options-object argument | `orchestrate-dev.js:9574` is `label: dispatch.label` inside the `routeErrata({...})` call, not an `_agent` argument |
| F-25 Low — `SKILL_HARVEST`'s comment undercounted its dispatch sites | **Resolved.** `:10448` moved from `SKILL_SE_IMPLEMENT` to `SKILL_HARVEST`, both sites annotated, and the lists are now stated as load-bearing for §8.3's edit surface | `skill: "harvest-learnings"` at `:10448` (Phase H `wrappedDispatch`), `agentFn("harvest-learnings", …)` at `:10542` (advisory distil) |

v3's two questions are answered in the design: Q-09 (§3.4's presence half is key-presence, with the
`cwd` *value* owned by AC-2.5's test) and Q-10 (the `"(no phase)"` bucket is now asserted, not just
reported). Both answers are the right shape.

## Findings

Scoped to text added or changed in v1.3. Nothing already approved is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-26 | High | Local | **Row 4's replacement discriminator is backed by no recorded field, and the resulting witness is a false green.** The row now reads "≥1 descriptor with `skill === ADVISORY_RUNG_SKILL` and `model === "opus"` **recorded within the same advisory-seam invocation whose `fable` descriptor raised the model-resolution error**". Neither conjunct is computable from what the harness records: §4.1's `DispatchDescriptor` carries `{skill, label, phase, seq, prompt, model, cwd, timeoutMs, attempt}` — no seam-invocation identity and no dispatch outcome/error — and §7.4's accumulator tuple is narrower still, `{corpusRun, seq, skill, phase, model}` (TSPEC:1399). An implementer can therefore only write the computable residue: `∃ descriptor with skill === ADVISORY_RUNG_SKILL && model === "opus"`. **`ADVISORY_RUNG_SKILL` is `"se-review"`** (`orchestrate-dev.js:1797`), and run iv is a whole pipeline run, so every ordinary reviewer dispatch on Opus satisfies that predicate — TSPEC's own memoisation paragraph says as much ("ordinary reviewer dispatches share the identifier entirely", §7.4). Deleting the entire `:1851`→`:1861` fallback branch would leave row 4 green. v1.2's `seq` adjacency was flaky but real; removing it without landing the seam-scoped pairing left the row with no discriminator at all, which is a worse trade than the one F-23 asked for. Fix in the spec, not later in the assertion: add the provenance to the recorded record — e.g. an `advisoryRung`/`seamInvocation` field stamped by the seam and a recorded dispatch outcome (`ok`/`model-resolution-error`) — list them in §4.1's shape *and* in §7.4's accumulator tuple, and restate row 4's witness over those fields. | §7.4 row 4, §4.1, TSPEC:1399 |
| F-27 | Medium | Local | **§4.6's new effective-timeout oracle compares two surfaces fed by one source, so the failure it names is caught but the adjacent one is not.** "The `timeoutMs` observed at the transport boundary equals the reported `tunables.timeoutMinutes` × 60 000" is red if the stamp is dropped (good — that is the regression §3.4 introduces the stamp to prevent), but both sides read the same `resolveTunables` return, so a run whose config was never consulted reports 30 and stamps 30 and passes. The fixture makes the stronger oracle free: have run i's `.claude/pdlc.config.json` carry a non-default `dispatch.timeoutMinutes` (say 7) and assert the **literal** 420 000 at the boundary *and* 7 in the report — a transcription of a spec literal rather than a derivation from the code under test. Note the default is genuinely indistinguishable today: `DEFAULT_TIMEOUT_MS = 30 * 60 * 1000` (`transport.mjs:64`) equals the tunable's default. | §4.6, §3.4 |
| F-28 | Low | Local | **The quoted wave-mode predicate is not HEAD's.** §7.4 writes `waveMode = Boolean(iOwnership) && iContract.ok === true`; HEAD is `Boolean(iOwnership) && iContract !== null && iContract.ok === true` (`orchestrate-dev.js:9995`). The elided conjunct is implied by the first (`iContract` is non-null exactly when `iOwnership` is), so nothing downstream changes — but §7.4 is the section whose whole point is that transcriptions are exact, and a reader re-checking the citation finds a mismatch. Transcribe the line. | §7.4 |
| F-29 | Low | Local | **§7.4's own framing still says "four properties" while the section now carries five suite-wide assertions.** The `"(no phase)"` bucket assertion is introduced in prose below the table (and §8.3 already describes `_assert-suite-wide.mjs` as "the four set-equality assertions plus the `"(no phase)"` bucket assertion"), but the table it belongs to lists four rows and the lead sentence counts four. A fifth row (property: pre-phase window; seam: the `byPhase` accumulator; assertion: `byPhase["(no phase)"]` absent or `0`) makes the enumeration match the module, which matters because this table is the checklist an implementer builds the assertion step from. | §7.4, §8.3 |

## Questions

| ID | Question |
|----|---------|
| Q-11 | §3.4 now asserts `timeoutMs` present on **every** dispatch, and the adapter is the stamper. Where does the adapter receive the resolved value? `resolveTunables` does not exist at HEAD (grep over `pdlc/engine` finds no definition) and `createAdapter` is constructed in `run.mjs` (`:72`, `:182`), so the stamp needs either a constructor option or a per-run seam. §8.3 lists both `adapter.mjs` and `run.mjs` in the edit surface, so the work is scoped — one clause naming the injection point would let the §4.6 test be written without a design decision made at implementation time. |
| Q-12 | Row 7's `haiku` PLAN-DAG dispatch (`orchestrate-dev.js:9968`) is composed *after* `phaseFn("Phase I: Implementation")` (`:9951`), so in run v(b) it records `phase === "Phase I"` with `model === "haiku"`. Rows 1/2 are explicitly scoped "in run i", so there is no contradiction today — but a later author who widened them to the whole corpus would be red on correct code. Worth one sentence beside the wave-set definition, in the same spirit as the memoisation note that pre-empts the same mistake for rows 3/4. |

## Positive Observations

- **F-22's fix went at the root rather than at the symptom.** The tempting repair was to bend §4.1's
  normalisation so the V-wave banner folds into `"Phase I"`; the revision explicitly declines it
  ("the announcement is honest run provenance and `byPhase` should keep reporting it as
  `"Phase PT"`") and instead defines a wave *set* over recorded fields. That keeps §4.4's per-phase
  report faithful to what the run announced while making the model assertion writable — two
  properties that the easy fix would have traded against each other.
- **"The mode is asserted, not assumed" is the paragraph I most wanted and did not ask for by name.**
  Run i's fixture selecting wave mode is a premise the whole of rows 1/2 rests on, and a premise a
  fixture can silently lose. Asserting ≥1 `"Phase I"` and ≥1 V-wave descriptor makes the drift loud,
  and I verified the branch exclusivity it depends on (`:9997` `if (!waveMode)` vs the `else` arm)
  rather than taking it on the document's word.
- **The memoisation paragraph pre-empts a plausible future strengthening.** `_state.resolved`
  (`:1844`–`:1845`) really does make a quantifier over `ADVISORY_RUNG_SKILL` descriptors red on
  correct code. Naming the shape of the wrong repair, next to the row it would be applied to, is the
  kind of thing that stops a reviewer two rounds from now from filing a confident bad finding.
- **The `"(no phase)"` bucket became an assertion instead of a number.** It is stated as
  "absent or `0`", which is absence-shaped on its own, but it sits beside the reverse-direction
  witnesses that positively require each phase's descriptors — so the pair is falsifiable in both
  directions, and the scoping to run-shaped tests (excluding unit tests that construct the adapter
  without announcing a phase) is the right exclusion, stated rather than left to discovery.
- **The `timeoutMs` contradiction was settled in the honest direction.** v1.2 said `timeoutMs` was
  conditionally assigned in §3.4 and always present in §4.1/§4.6. Keeping the always-present reading
  and making the adapter stamp it is what makes BR-CLI-3's reported tunable true; I confirmed the
  premise it rests on — no module passes `timeoutMs` (grep over `pdlc/workflows/*.js` returns
  nothing), so HEAD's `adapter.mjs:280` never fires and `transport.mjs:152`'s constructor default
  would otherwise decide every dispatch.

## Recommendation

**Needs revision** — one High, and it is a narrow one.

**F-26** is the only blocker, and it is a regression this round introduced rather than a leftover:
row 4 traded a flaky discriminator for none. As written the witness reduces to "some `se-review`
dispatch ran on Opus", which every pipeline run satisfies whether or not the fallback branch exists
— the exact false-green class §7.4 was built to prevent, in §7.4 itself for the second round running.
The fix is small and is a spec edit, not an implementation one: stamp seam provenance and dispatch
outcome onto the descriptor, add both to §4.1's shape and §7.4's accumulator tuple, and restate the
row over them.

Everything else is non-gating. F-27 buys a stronger oracle from a fixture value the run already
carries; F-28 and F-29 are one edit each. The three resolved findings are resolved for real — I
re-derived F-22's fix from the branch structure at `:9995`/`:9997`/`:10248`–`:10253` rather than
from the changelog, and F-24/F-25's line citations against the module. Nothing in v1.3 broke a
previously approved section: the wave-set definition, the `timeoutMs` stamp and the `"(no phase)"`
assertion all leave §8.3's "no file under `pdlc/workflows/` is modified beyond the declared exports"
claim intact, since every new obligation lands in `pdlc/engine`. One round should close this.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}
