---
Status: Draft
Author: se-author
Version: 1.0
Feature: pdlc-loop-economics
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md |

# PLAN — pdlc-loop-economics

## 1. Summary

Seventeen tasks across ten batches, all production changes in one file
(`pdlc/workflows/orchestrate-dev.js`, TSPEC §1 / DEC-LOOPECON-08). M1a is an absence pin with
no production change; M1b is a one-assignment fix; M1c/M1d add pure functions and one seam;
M2 and M3 add config-gated behaviour whose disabled state is proven byte-identical against a
committed pre-feature fixture baseline captured in batch 1.

Because every implementation task writes the same physical source file, implementation tasks
are **serialised one per batch** (se-author batch-safety rule 2). Test files are one per task
and the red-test batch runs fully parallel.

## 2. Ordering constraint that is not a code dependency

`T-02` captures the **pre-M2/M3** dispatch bytes. It must complete before any task that can
change a dispatch stream, so `T-14` and `T-15` carry an explicit `Deps` edge on it even though
neither imports anything from it. That edge is the whole mechanism — a prose note would not
stop the dispatcher.

---

## 3. Task list

Status key: ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-00 | Pre-flight baseline-symbol gate: assert the seven HEAD symbols this feature builds on are importable and callable — `parseLearningsConfig`, `readLearningsConfigSafely`, `parseConfirmationFindings`, `appendApprovalAnchors`, `deriveRoundWindow`, `dodVerifyLoop`, `defaultListFiles`. Existence only; asserts nothing about shapes this feature creates. | `pdlc/workflows/__tests__/loopEconomicsPreflight.test.js` | — | 1 | — | ⬚ |
| T-01 | `[Fake first]` Shared sync test doubles for this feature: `makeLoopEconomicsSeams(overrides)` (the `baseSeams` shape from `loopQueueDriver.test.js`, extended with `_listFiles`, `_probeDoc`, `_hashFile`, `_hashNormalizedFile`, `_appendFile`), re-exporting `makeGitFn` from `helpers/loopDoubles.js`, plus `assertNoLiveGitWrites(calls)` for the mandatory `afterEach` leak check (TSPEC §10, commit `f325016`). | `pdlc/workflows/__tests__/helpers/loopEconomicsDoubles.js` | — | 1 | — | ⬚ |
| T-02 | Capture the pre-feature baseline fixtures from the merge-base worktree (cases `CASCADE-DOWNSTREAM-REDISPATCH`, `PHASE-T-REVIEW-ROUNDS`) via the shipped `scripts/capture-learnings-baseline.mjs` harness, and author the guard with hand-transcribed `EXPECTED_DIGESTS`, set equality on case ids, digests asserted against both recomputed files and `MANIFEST.json`, merge-base sha recorded in the header, three-step mutation proof transcribed in the completion note. No red predecessor by construction (TSPEC §9). | `pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js` + `pdlc/workflows/__tests__/fixtures/loop-economics-baseline/**` | — | 1 | — | ⬚ |
| T-03 | M1a absence pin: prompt-builder source census with set equality on the 30 HEAD builder names, zero occurrences of `APPROVAL-HASH`/`REVIEWED-COMMIT`/`UPSTREAM-STATE` in any builder body, exactly one anchor-template emission site (inside `appendApprovalAnchors`, into `_appendFile`), plus the behavioural conjunct that `appendApprovalAnchors` uses the seam values at call time. Passes at HEAD by design — it pins an absence (DEC-LOOPECON-07). | `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js` | — | 1 | — | ⬚ |
| T-04 | `[red]` `parsePinCheckConfig` / `parseDerivativeStopConfig`: defaults, absent file, non-JSON, absent block, non-object block at each of the two nesting levels, per-key invalid types, `rounds` positive-integer validation (`0`/`-1`/`"2"` invalid), block independence (a malformed `cascade` leaves `review.derivativeStop` at defaults), plus a `fast-check` totality property over arbitrary JSON. | `pdlc/workflows/__tests__/loopEconomicsConfig.test.js` | — | 2 | T-00, T-01 | ⬚ |
| T-05 | `[red]` `deriveDodRoundIndex` over crafted listings (empty ⇒ 1; `v1` ⇒ 2; `v1`+`v3` ⇒ 4; `v9`+`v10` ⇒ 11 not 10; other-feature and non-CODE_REVIEW noise ignored; regex metacharacters in `feature` escaped), and `dodVerifyLoop` wiring: a `_listFiles` double reporting `v1`,`v2` makes the captured verify prompt and `codeReviewPath` name `v3`; a throwing `_listFiles` falls back to `iteration`; `DOD_MAX_ITERATIONS` still bounds the loop. | `pdlc/workflows/__tests__/loopEconomicsDodRoundIndex.test.js` | — | 2 | T-00, T-01 | ⬚ |
| T-06 | `[red]` `normalizeFindingText`, `findingIdentityKey`, `classifyRoundFindings`: round/version and hash token stripping, whitespace collapse, case-insensitivity; severity and section never normalised (two findings differing only in section anchor are distinct; only in severity are distinct); carried/added/resolved partition; order-independence property (`fast-check` shuffle); REQ-LOOPECON-02 dedup — a carried staleness finding mints no second entry while a new finding always does. | `pdlc/workflows/__tests__/loopEconomicsFindingIdentity.test.js` | — | 2 | T-00, T-01 | ⬚ |
| T-07 | `[red]` M1b: with a probe/hash double returning `A` before the erratum author dispatch and `B` after, the confirmer prompt text carries `B` and never `A`; the anchor written on approval records `B`; the confirmation-window drift check and its single re-dispatch at the next derived round index still behave as today; `cascadeDownstream`'s existing per-downstream re-derivation is pinned unchanged. | `pdlc/workflows/__tests__/loopEconomicsAnchorFreshness.test.js` | — | 2 | T-00, T-01 | ⬚ |
| T-08 | `[red]` M2: disabled/absent/malformed key ⇒ no `PIN-CHECK` dispatch and the walk's dispatch sequence unchanged; enabled ⇒ own-bytes-unchanged candidates batch into one dispatch per reviewer role while an own-bytes-changed candidate always takes the full path; `parsePinCheckVerdicts` grammar (case-sensitive `PASS`/`FAIL`, fence-aware, one line per doctype, duplicate ⇒ FAIL); absent/malformed/partial reply ⇒ FAIL; PASS re-anchors via `appendApprovalAnchors` and advances neither `window.startIndex` nor the lifetime count; FAIL produces the byte-identical ordinary re-confirmation dispatch. | `pdlc/workflows/__tests__/loopEconomicsPinCascade.test.js` | — | 2 | T-00, T-01 | ⬚ |
| T-09 | `[red]` M3: disabled ⇒ `reviewerPrompt` byte-identical to HEAD and no `converged-by-derivative-stop` outcome reachable; enabled ⇒ `findingGrammarClause()` appended; flat-round predicate per TSPEC §8.2 (new Low does not break flatness; new Medium does; carried High does; unreadable verdict, malformed `FINDING:` line, and the counts-above-zero-with-empty-finding-set case are all unevaluable); `derivativeStopReached` consecutiveness and reset; **enabled ⇒ the high-only shortcut is suspended** (a round with zero Highs and open Mediums does *not* converge, it accumulates as flat; convergence only on a literal approving verdict or on the derivative stop — DEC-LOOPECON-10, TSPEC §8.3), and disabled ⇒ the gate decision is identical to `isPassResult` for every input; outcome detail string distinct from `Approved (...)`; no POSTMORTEM; rounds still count toward `MAX_LIFETIME_ROUNDS`; the three round constants keep their HEAD values. | `pdlc/workflows/__tests__/loopEconomicsDerivativeStop.test.js` | — | 2 | T-00, T-01 | ⬚ |
| T-10 | `[green]` Config: `PIN_CHECK_DEFAULTS`, `DERIVATIVE_STOP_DEFAULTS`, `descendSection`, `parsePinCheckConfig`, `parseDerivativeStopConfig`; thread both through `main()` off the single existing `readLearningsConfigSafely` read; add the four `notices` ids, emitted only on malformed/invalid-key. | `pdlc/workflows/__tests__/loopEconomicsConfig.test.js` | `pdlc/workflows/orchestrate-dev.js` | 3 | T-04 | ⬚ |
| T-11 | `[green]` M1b: re-derive the confirmers' upstream state from disk immediately before the first `dispatchConfirmers` call (`deriveUpstreamState(target, null)`), leaving the drift check, the freeze re-dispatch and every prompt grammar byte-identical. | `pdlc/workflows/__tests__/loopEconomicsAnchorFreshness.test.js` | `pdlc/workflows/orchestrate-dev.js` | 4 | T-07, T-10 | ⬚ |
| T-12 | `[green]` M1c: add `deriveDodRoundIndex`; add the `_listFiles` seam to `dodVerifyLoop` and thread `listFilesFn` from `main()`; derive `version` per round and use it (not `iteration`) in `dodVerifyPrompt`, `dodReVerifyPrompt`, `codeReviewPath` and every CODE_REVIEW-naming log/remediation string; fail open to `iteration`. | `pdlc/workflows/__tests__/loopEconomicsDodRoundIndex.test.js` | `pdlc/workflows/orchestrate-dev.js` | 5 | T-05, T-11 | ⬚ |
| T-13 | `[green]` M1d: add `normalizeFindingText`, `findingIdentityKey`, `classifyRoundFindings`; apply the carried/new dedup to round finding accounting (REQ-LOOPECON-02). Pure functions plus accounting only — no dispatch, prompt or file-write change, so no baseline movement. | `pdlc/workflows/__tests__/loopEconomicsFindingIdentity.test.js` | `pdlc/workflows/orchestrate-dev.js` | 6 | T-06, T-12 | ⬚ |
| T-14 | `[green]` M2: split `cascadeDownstream` into collect/dispatch passes with the disabled path byte-identical; add `pinCheckPrompt`, `parsePinCheckVerdicts`, the eligibility predicate (`record.hash === docHash`), the batched dispatch over the union of reviewer roles through `parallelFn`, PASS re-anchoring with no round consumed, FAIL fall-through, and one `notices` line per PASS. | `pdlc/workflows/__tests__/loopEconomicsPinCascade.test.js` | `pdlc/workflows/orchestrate-dev.js` | 7 | T-02, T-08, T-13 | ⬚ |
| T-15 | `[green]` M3: add `findingGrammar` to `reviewerPrompt` (gated on the key); collect per-round findings in `reviewLoop`'s `roundHistory`; add `isFlatRound` and `derivativeStopReached`; add the gated wrapper `loopPassResult(parsed, { strictVerdict })` and switch **only** `reviewLoop`'s `gatePass` to it, leaving `isPassResult` and its six other call sites (erratum re-confirm, phase-gate approval search, tier predicates) untouched (TSPEC §8.3.2, DEC-LOOPECON-10); return `derivativeStop: true` and have `converge()` record `converged-by-derivative-stop (...)` on the `✅` row; append approval anchors on that path; leave `checkConverged`, the POSTMORTEM lifecycle and the lifetime counter untouched. | `pdlc/workflows/__tests__/loopEconomicsDerivativeStop.test.js` | `pdlc/workflows/orchestrate-dev.js` | 8 | T-02, T-09, T-14 | ⬚ |
| T-16 | Documentation: add the two config blocks and their defaults to `.claude/pdlc.config.example.json`; extend `pdlc/OPERATIONS.md`'s review-loop-mechanics section with the anchor-provenance rule (DEC-ANCHOR-01 / DEC-LOOPECON-02), the DoD round-index derivation, the pin-check round and its verdict grammar, and the `converged-by-derivative-stop` outcome; update the `pdlc/README.md` config table if one is present. No SKILL.md edits (REQ NG-2). | `pdlc/workflows/__tests__/documentOracles.test.js` (existing) | `pdlc/OPERATIONS.md`, `.claude/pdlc.config.example.json` | 9 | T-14, T-15 | ⬚ |
| T-17 | Landing: run `node pdlc/workflows/build-runtime.mjs`, confirm `--check` is clean, stage `pdlc/workflows/dist/`, and bump `pdlc/.claude-plugin/plugin.json` `version` from `0.23.5` in the same commit. Re-run `npm run test:coverage` in `pdlc/workflows` and `npm test` in `pdlc/engine`. | — | `pdlc/workflows/dist/pdlc-cli.mjs` (generated), `pdlc/.claude-plugin/plugin.json` | 10 | T-16 | ⬚ |

Batch column re-derivation (`batch == max(batch of deps) + 1`, sources batch 1): T-00/T-01/T-02/T-03
have no deps ⇒ 1. T-04…T-09 depend on T-00(1), T-01(1) ⇒ 2. T-10 on T-04(2) ⇒ 3. T-11 on
T-07(2), T-10(3) ⇒ 4. T-12 on T-05(2), T-11(4) ⇒ 5. T-13 on T-06(2), T-12(5) ⇒ 6. T-14 on
T-02(1), T-08(2), T-13(6) ⇒ 7. T-15 on T-02(1), T-09(2), T-14(7) ⇒ 8. T-16 on T-14(7),
T-15(8) ⇒ 9. T-17 on T-16(9) ⇒ 10.

---

## 4. Per-phase file-ownership manifest

| File | Owning task(s) |
|---|---|
| `pdlc/workflows/__tests__/loopEconomicsPreflight.test.js` | T-00 |
| `pdlc/workflows/__tests__/helpers/loopEconomicsDoubles.js` | T-01 |
| `pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js` | T-02 |
| `pdlc/workflows/__tests__/fixtures/loop-economics-baseline/` | T-02 |
| `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js` | T-03 |
| `pdlc/workflows/__tests__/loopEconomicsConfig.test.js` | T-04 |
| `pdlc/workflows/__tests__/loopEconomicsDodRoundIndex.test.js` | T-05 |
| `pdlc/workflows/__tests__/loopEconomicsFindingIdentity.test.js` | T-06 |
| `pdlc/workflows/__tests__/loopEconomicsAnchorFreshness.test.js` | T-07 |
| `pdlc/workflows/__tests__/loopEconomicsPinCascade.test.js` | T-08 |
| `pdlc/workflows/__tests__/loopEconomicsDerivativeStop.test.js` | T-09 |
| `pdlc/workflows/orchestrate-dev.js` | T-10, T-11, T-12, T-13, T-14, T-15 — **serialised**, one per batch (3, 4, 5, 6, 7, 8); no two share a batch |
| `pdlc/OPERATIONS.md` | T-16 |
| `.claude/pdlc.config.example.json` | T-16 |
| `pdlc/workflows/dist/pdlc-cli.mjs` | T-17 (generated by `build-runtime.mjs`; never hand-edited) |
| `pdlc/.claude-plugin/plugin.json` | T-17 |

Disjointness premise: within every batch, the set of files written is pairwise disjoint. The
only multi-owner file is `orchestrate-dev.js`, whose six owners sit in six distinct batches
connected by real `Deps` edges (T-10 → T-11 → T-12 → T-13 → T-14 → T-15).

---

## 5. Task dependency notes

- **T-00 gates every green.** It asserts only the *existence* of HEAD symbols; it never asserts
  a shape this feature creates. If it reds, the branch is on a stale base and no dependent task
  should run.
- **T-01 is `[Fake first]`.** The doubles land before every red test that uses them; nothing
  downstream constructs its own live-defaulted seam set.
- **T-02's edge into T-14/T-15 is an ordering constraint, not an import.** See §2.
- **Red-before-green is an explicit edge on every pair:** T-04→T-10, T-05→T-12, T-06→T-13,
  T-07→T-11, T-08→T-14, T-09→T-15.
- **Batch 2 is RED-terminal.** Its gate wording is: *the new tests in T-04…T-09 fail for the
  named reason (missing export / unimplemented behaviour), and every pre-existing test stays
  green.* A blanket "full suite green after the batch" is unsatisfiable for this batch and must
  not be applied to it.
- **Batch 1 is not RED-terminal.** T-00, T-02 and T-03 are guards with no red predecessor by
  construction (they pin properties true at HEAD); T-01 is a helper. Batch 1's gate is the
  ordinary full-suite-green gate.

---

## 6. Integration points

| Existing symbol / site | How this feature touches it |
|---|---|
| `parseLearningsConfig`, `readLearningsConfigSafely`, `MERGE_CONFIG_PATH` | Structural precedent cloned for the two new parsers; the read is reused, not duplicated (T-10) |
| `main()`'s `notices` array | Four additive ids; nothing smuggled into a phase row's `detail` (T-10, T-14) |
| `deriveUpstreamState`, `erratumDocHash`, `snapshotErratumDocs` | Re-derivation site changed; the mint-time snapshot's drift-detection role is unchanged (T-11) |
| `erratumSupersetClause`, `upstreamHeadClause`, `cascadeConfirmPrompt` | Grammar untouched; only the values they render change (T-11) |
| `appendApprovalAnchors` | Pinned as sole writer (T-03); re-invoked on the pin-check PASS path with the existing call shape (T-14) |
| `dodVerifyLoop`, `dodVerifyPrompt`, `dodReVerifyPrompt`, `defaultListFiles` | New `_listFiles` seam and derived `version` (T-12) |
| `parseConfirmationFindings`, `findingGrammarClause`, `scanLines` | Reused unchanged as the one finding grammar (T-13, T-15) |
| `cascadeDownstream`, `tier1ApprovalRecord`, `phaseWindow`, `lifetimeCapReached`, `parallelFn` | Collect/dispatch split; eligibility reads `record.hash`; lifetime-cap notice and `continue` byte-identical (T-14) |
| `reviewLoop`, `reviewerPrompt`, `converge`, `recordPhase`, `checkConverged` | `findingGrammar` flag, `roundHistory`, `derivativeStop` return field, distinct `✅` detail; `checkConverged` untouched (T-15) |
| `isPassResult`, `isPass` | Not modified. New sibling wrapper `loopPassResult`; only `reviewLoop`'s `gatePass` call site switches to it, and only the `enabled` path reads differently (T-15, DEC-LOOPECON-10) |
| `MAX_REVIEW_ROUNDS`, `MAX_LIFETIME_ROUNDS`, `MAX_ERRATUM_FOLLOWUP_ROUNDS` | Not changed (REQ NG-4); values pinned by assertion in T-09 |
| `pdlc/engine/` | Not touched (REQ NG-3). The engine vendors `orchestrate-dev.js` at pack time and picks this up automatically |
| `pdlc/skills/**/SKILL.md` | Not touched (REQ NG-2) |

---

## 7. Obligations that are not PLAN tasks

- **PROPERTIES.** `docs/pdlc-loop-economics/PROPERTIES-pdlc-loop-economics.md` and the `AT-`/
  `PROP-` identifiers it defines are authored by `te-author` in Phase PR, not by any task here.
  The test files above are the oracles those properties will be numbered against; each red task
  names the FSPEC clause it falsifies so the mapping is mechanical.
- **Wave-gate build step.** `implementation.postWaveCommand`
  (`node pdlc/workflows/build-runtime.mjs`) and `postWavePathspecs` (`["pdlc/workflows/dist/"]`)
  already regenerate and stage `dist/` after every wave that touches `pdlc/workflows/*.js`.
  T-17 is the explicit final verification of that invariant, not a substitute for it.
- **`.claude/pdlc.config.json`** in this repo is gitignored. Its absence disables the wave gate's
  `testCommand` (self-report degradation) and stops the per-wave `dist/` rebuild, which is a
  known cause of stale-bundle wave halts. Confirm it exists locally before Phase I.

---

## 8. Risk register

| Risk | Mitigation | Depends on what |
|---|---|---|
| Baseline fixtures captured after an M2/M3 change has already landed ⇒ the byte-identity claim proves nothing | T-02 in batch 1 with explicit `Deps` edges from T-14/T-15; the guard records the merge-base sha it was captured at | T-02 |
| A new prompt builder added later escapes the anchor census | Set equality on the builder-name census, never containment | T-03 |
| Finding-identity normalisation over-merges (REQ R-3) | Exact match on severity and section anchor; only free text normalised; DEC-LOOPECON-06 | T-06, T-13 |
| Derivative-stop fires on a round whose findings simply failed to parse | Unevaluable ⇒ not flat; malformed-line and counts-vs-empty-set guards | T-09, T-15 |
| Pin-check under-triggers on a false-negative hash match (REQ R-1) | Two independent signals required (own bytes unchanged **and** an upstream pin actually moved) | T-08, T-14 |
| A new test file leaves `_git` at its real default and commits junk (`f325016`) | `assertNoLiveGitWrites` in every new file's `afterEach`; `_git` stub mandatory | T-01 |
| Per-file c8 `--branches 85` red on `orchestrate-dev.js` from new uncovered branches | Every added branch reachable from a driver-level or pure-function test; no `c8 ignore` introduced | T-10…T-15 |
| An untracked local file fails a document oracle (`coveredViolations` walks the whole tree) | Check for untracked files before assuming a code defect when an oracle is red locally but green in CI | T-16 |

---

## 9. Definition of Done

- [ ] REQ-LOOPECON-01a — anchor absence pinned by the census oracle, set equality on 30+1 builders (T-03)
- [ ] REQ-LOOPECON-01b — every anchor value a dispatch quotes as current is re-derived at dispatch-construction time (T-11)
- [ ] REQ-LOOPECON-02 — a carried staleness finding mints no second entry (T-13)
- [ ] REQ-LOOPECON-03 — carried/new classification is exact-triple, order-independent (T-13)
- [ ] REQ-LOOPECON-04 — pin-check disabled ⇒ dispatch stream byte-identical, proven against committed fixtures (T-02, T-14)
- [ ] REQ-LOOPECON-05 — own-bytes-unchanged documents batch; own-bytes-changed always get a full review; PASS re-anchors, FAIL re-confirms (T-14)
- [ ] REQ-LOOPECON-06 — derivative-stop converges on N flat rounds, never over an open High, records `converged-by-derivative-stop`, writes no POSTMORTEM, consumes lifetime rounds normally (T-15)
- [ ] REQ-LOOPECON-07 — derivative-stop disabled ⇒ convergence decision and `reviewerPrompt` bytes identical to baseline (T-02, T-15)
- [ ] REQ-LOOPECON-08 — per-key independent fail-open across both blocks and both nesting levels (T-10)
- [ ] REQ-LOOPECON-09 — DoD round index derived from disk each round, resume-safe, fail-open to `iteration` (T-12)
- [ ] Every injected IO/git/agent seam call added by this feature is `await`ed
- [ ] No test in this feature touches live git or a live filesystem; every new file asserts no unscripted git write
- [ ] `cd pdlc/workflows && npm run test:coverage` green — aggregate branches ≥ 85 / lines, functions, statements ≥ 90, and stage-2 per-file `--branches 85` on `orchestrate-dev.js`
- [ ] `cd pdlc/engine && npm test` green
- [ ] `node pdlc/workflows/build-runtime.mjs --check` exits zero; `pdlc/workflows/dist/` staged in the same commit as the last workflow-source change (T-17)
- [ ] `pdlc/.claude-plugin/plugin.json` `version` bumped in the landing commit (T-17)
- [ ] No file under `pdlc/engine/`, `pdlc/skills/` or `pdlc/hooks/` modified
- [ ] `pdlc/OPERATIONS.md` and `.claude/pdlc.config.example.json` describe both new config blocks and the two new outcomes (T-16)
- [ ] All four required CI checks green on the PR
