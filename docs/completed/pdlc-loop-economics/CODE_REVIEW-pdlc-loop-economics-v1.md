---
Feature: pdlc-loop-economics
Author: dod-verify
Version: 1
Date: 2026-08-28
Branch: feat-pdlc-loop-economics
Scope: Local
---

# CODE REVIEW — pdlc-loop-economics (v1)

| Field | Value |
|---|---|
| Verdict | **Findings** |
| Findings | 8 (High 2, Medium 1, Low 5) |
| Branch coverage (aggregate) | 88.92% |
| Branch coverage (lowest module) | 87.73% (`pdlc/workflows/lib/escalation-view.mjs`) — every module ≥ 85 |
| Requirements traced | 8/10 acceptance criteria delivered; 2 gaps |
| Suites | `pdlc/workflows`: 153 suites, 4994 passed / 0 failed / 70 skipped (one suite excluded, see F-4); `pdlc/engine`: 889 pass / 0 fail |
| `build-runtime.mjs --check` | exit 0 — `pdlc/workflows/dist/pdlc-cli.mjs` in sync |

**Scope note.** This verification re-ran every command itself against the working tree
(`git diff pdlc/workflows/orchestrate-dev.js`, the eight untracked `loopEconomics*` test files,
`pdlc/OPERATIONS.md`, `.claude/pdlc.config.example.json`, `pdlc/.claude-plugin/plugin.json` → 0.23.6,
regenerated `pdlc/workflows/dist/`). No prior-agent report was used as evidence.

**Guard rows that pass cleanly** (no finding raised): no file under `pdlc/engine/`,
`pdlc/skills/` or `pdlc/hooks/` is modified (REQ NG-2/NG-3 hold); every seam call the diff adds
(`_listFiles`, `probeDocFn`, `hashNormalizedFileFn`, `appendFileFn`, `gitFn`, `agentFn`,
`parallelFn`) is `await`ed; the production diff contains no `TODO`/`FIXME`/`HACK`/`XXX`, no
`not implemented` throw, no `placeholder`/`stub`/`dummy` identifier, no `Math.random()`, no
hardcoded sample data, no `c8 ignore` or coverage pragma, and no `localhost`/`example.com`
client target (criteria 1–3 clean).

---

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| F-1 | 5 (delivery) | **high** | `pdlc/workflows/orchestrate-dev.js:15365` (call) → `:9804` (no-op) | Pin-check **PASS never re-anchors**. `appendApprovalAnchors` short-circuits on `if (existing[0] === hash) continue;` (line 9804) whenever the file's single recorded `APPROVAL-HASH` equals the `hash` argument. Pin-check eligibility is *defined* as `c.record.hash === c.docHash` (line 15299) and the PASS path passes `hash: c.docHash` — so the two are equal **by construction on every PASS**, the append is always skipped, and the updated `UPSTREAM-STATE` line is never written. The document therefore keeps its stale upstream pin, and the very next erratum round on the same upstream re-flags it and dispatches another pin-check — the re-file loop this feature exists to remove, preserved in a cheaper form. Verified by reading both bodies; the operator-visible notice at `:15379` nonetheless asserts the re-anchor happened. | Refresh the anchor on the PASS path. Either extend `appendApprovalAnchors`'s idempotence check to compare the `UPSTREAM-STATE` block as well as `APPROVAL-HASH` (so a same-hash / different-upstream call appends), or give the PASS path a dedicated re-stamp writer. Pin the fix with a test that reads the cross-review file bytes after an all-PASS reply and asserts the new upstream digest is present. | Local |
| F-2 | 5 (delivery) | **high** | production: none; oracle at `pdlc/workflows/__tests__/loopEconomicsFindingIdentity.test.js:432` | **REQ-LOOPECON-02 has no production implementation.** FSPEC §2.4 / TSPEC §6.3 require a carried finding to mint no second entry in the round's finding list. Production has no cross-round open-finding list: `reviewLoop`'s `roundHistory.push` (`orchestrate-dev.js:9549`) records each round's **full** finding set, deduplicating only the two reviewers *within* one round. The dedup contract is proven exclusively against `simulateOpenFindingList`, a helper **defined inside the test file** (line 432, consumed at 453 and 492) — a test-local model, not the shipped path. Compounding this, REQ G-1 declares M1 "always-on, no config gate", yet `roundHistory` is only populated when `derivativeStopEnabled` (M3, default **off**), so even the accounting M1 owns never runs on a default-config run. | Either implement the open-finding-list accounting in `reviewLoop` (ungated, per G-1) and re-point PROP-LOOPECON-06/07 at it, or amend REQ/FSPEC to state that REQ-LOOPECON-02 is discharged by `classifyRoundFindings` as a pure input to M3 and delete the "mints no second entry" obligation. Do not leave a P0/M1 criterion whose only oracle is a test-file simulation. | Local |
| F-3 | 6(a) | medium | `pdlc/OPERATIONS.md:21` | The shipped prose states a document that PASSes "gets its approval anchors re-appended by the engine's own writer (`appendApprovalAnchors` …) with the now-current upstream pin(s)". F-1 shows the code never appends on that path, so this sentence is false as shipped. It is the operator-facing contract for the whole M2 feature. | Correct the sentence when F-1 is fixed (or, if F-1 is deferred, state the actual behaviour). Same for the run notice at `orchestrate-dev.js:15379`. | Local |
| F-4 | 4 / 6(a) | low | `pdlc/workflows/__tests__/waveResumePreflight.test.js:45,138` | `EXPECTED_TEST_COMMAND` is a transcribed literal that omits the `(cd pdlc/engine && npm test) && ` prefix, while `.claude/pdlc.config.example.json` — the config this repo ships for consumers to copy — **carries** that prefix (unchanged by this diff). Any consumer whose `.claude/pdlc.config.json` matches the shipped example reds this suite; it went red on this verification run and had to be excluded to obtain coverage. It passes in CI only because the file is untracked and the test vacuously asserts `GITHUB_ACTIONS === "true"` when absent. Pre-existing, not introduced here, but this feature's own PLAN §7 makes that config file load-bearing for the wave gate. | Derive `EXPECTED_TEST_COMMAND` from `.claude/pdlc.config.example.json` instead of transcribing it, so the two cannot disagree. | Cross-Feature |
| F-5 | 4 | low | `loopEconomicsConfig.test.js`, `loopEconomicsFindingIdentity.test.js`, `loopEconomicsPreflight.test.js`, `loopEconomicsAnchorGuard.test.js` | PLAN §9 requires "every new file asserts no unscripted git write"; 4 of the 8 new test files never import `assertNoLiveGitWrites` (`__tests__/helpers/loopEconomicsDoubles.js:202`). Three are pure-function suites with no git seam and `loopEconomicsAnchorGuard.test.js` passes an explicit `fakeGit`, so no leak is reachable today — but the PLAN row is a *blanket* guard precisely so a later edit cannot introduce one silently (the `f325016` shape). | Add the `afterEach` guard to the four files, or narrow the PLAN row to seam-driving suites. | Local |
| F-6 | 6(a) | low | `pdlc/README.md:74-83`, `CLAUDE.md:104` | Stale-disclosure family sweep: both documents enumerate the pdlc config surface by naming `learningsInjection` under `.claude/pdlc.config.json` as *the* configurable block. Two new blocks (`cascade.pinCheck`, `review.derivativeStop`) ship with this feature and appear in neither. `pdlc/OPERATIONS.md` and the example config were updated (T-16); these two family members were not. | Add a one-line pointer for the two new blocks in both files, or explicitly state that OPERATIONS.md is the sole config catalogue. | Local |
| F-7 | 1 / 5 | low | `pdlc/workflows/orchestrate-dev.js:15264` → `:15397` | REQ-LOOPECON-01b requires an anchor quoted as "current" to be re-derived at **dispatch-construction** time. The cascade re-confirm dispatch renders `c.upstreamState`, derived in pass 1 (line 15264); with `cascade.pinCheck.enabled` true there is now an `await parallelFn(...)` round-trip (line 15327) **between** derivation and dispatch, widening the staleness window the feature closes elsewhere. Benign today (the pin-check prompt instructs "Write nothing to disk" and the PASS path touches only cross-review files), and the pin at `loopEconomicsAnchorFreshness.test.js:448` exercises only the disabled path. | Re-derive `upstreamState` inside the pass-2 loop, immediately before `cascadeConfirmPrompt`, and extend the freshness pin to the pin-check-enabled path. | Local |
| F-8 | 6(b) | low | working tree | The entire change set is **uncommitted**. `main..HEAD` carries exactly one commit (`146e2b3ba`, the PROPERTIES doc), and that document has itself been modified since (PROP-LOOPECON-16 added, PROP-LOOPECON-13/14 corrected) without a following review round. PLAN §9's rows "`dist/` staged in the same commit as the last workflow-source change" and "`plugin.json` `version` bumped in the landing commit" are therefore not yet verifiable — only that `--check` is clean and `plugin.json` reads 0.23.6 in the tree. | Land the change set as commits before Phase PUB; re-assert the two PLAN §9 commit-shape rows against the landed history. | Local |

---

## §2 Requirements Traceability

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ-LOOPECON-01a | No dispatch prompt instructs anchor transcription; absence pinned by a set-equality census | `orchestrate-dev.js:9818` (`appendApprovalAnchors` sole writer) | `loopEconomicsAnchorGuard.test.js:134,138,160,171,197` — 31-name frozen census, set equality (not containment), zero anchor tokens in any builder body, sole-writer fragment count `=== 1`, `_appendFile` not `_agent` | No | — | Local |
| 2 | REQ-LOOPECON-01b | Anchor quoted as "current" re-derived at dispatch-construction time | `orchestrate-dev.js:15768` (`confirmState`, replacing the carried `upstreamState`) | `loopEconomicsAnchorFreshness.test.js:252,270,316,448` | Partial — see F-7 (pin-check-enabled pass-2 path) | low | Local |
| 3 | REQ-LOOPECON-02 | A carried staleness finding mints no second entry | **Not found** — no production open-finding list; `roundHistory` (`:9549`) records the full set and is M3-gated | `loopEconomicsFindingIdentity.test.js:449,457` — asserts against `simulateOpenFindingList`, defined at line 432 in the test file | **YES** | **high** | Local |
| 4 | REQ-LOOPECON-03 | Carried/new classification exact-triple, order-independent | `orchestrate-dev.js:188` `normalizeFindingText`, `:210` `findingIdentityKey`, `:230` `classifyRoundFindings` (diff offsets) | `loopEconomicsFindingIdentity.test.js` — both-direction normalisation property, shuffle-invariance at :411, resolved-bucket at :512 | No | — | Local |
| 5 | REQ-LOOPECON-04 | Pin-check disabled ⇒ dispatch stream byte-identical, against committed fixtures | `orchestrate-dev.js:15296-15302` (empty `pinCheckEligible` when disabled) | `loopEconomicsBaselineGuard.test.js` (fixtures `MANIFEST.json`, `mergeBaseSha 95005dad8`, ancestry-checked); `loopEconomicsPinCascade.test.js:411,419,428,436` (absent / false / wrong-typed / unparseable) | No — fixture merge-base is 3 commits behind the current merge-base `9dfaef197`, but `git diff 95005dad8 9dfaef197 -- pdlc/` is empty, so the baseline is still faithful | — | Local |
| 6 | REQ-LOOPECON-05 | Own-bytes-unchanged batch; changed always full review; **PASS re-anchors**; FAIL re-confirms | Batching `:15299-15340` ✔; FAIL fall-through `:15348` ✔; **PASS re-anchor `:15365` is a guaranteed no-op** (F-1) | `loopEconomicsPinCascade.test.js:532` asserts only absences (no v2 file, no ordinary dispatch); no assertion reads the cross-review bytes for the refreshed pin | **YES** (re-anchor half) | **high** | Local |
| 7 | REQ-LOOPECON-06 | Derivative-stop on N flat rounds, never over an open High, distinct outcome, no POSTMORTEM, rounds still count | `isFlatRound` + `derivativeStopReached` (diff `:275`/`:324`), `derivativeStopFired` `:9576`, outcome string `:16465` | `loopEconomicsDerivativeStop.test.js:115,237,274,308,333,637` (`detail` contains `converged-by-derivative-stop (2 iterations)`, POSTMORTEM-write spy at zero, `MAX_LIFETIME_ROUNDS === 15` pinned) | No | — | Local |
| 8 | REQ-LOOPECON-07 | Disabled derivative-stop ⇒ convergence decision and prompt bytes identical | `loopPassResult` strict/lenient limbs `:365`; conditional spread of `derivativeStop` key `:520`; `findingGrammarPart` empty when off | `loopEconomicsDerivativeStop.test.js:390,439,492`; `loopEconomicsBaselineGuard.test.js` PHASE-T-REVIEW-ROUNDS fixtures | No | — | Local |
| 9 | REQ-LOOPECON-08 | Per-key independent fail-open across both blocks, two nesting levels | `descendSection` `:32`, `parsePinCheckConfig` `:51`, `parseDerivativeStopConfig` `:102` (`rounds` requires positive integer), notices `NTC-PINCHECK-*` / `NTC-DSTOP-*` | `loopEconomicsConfig.test.js` (PROP-LOOPECON-12 cross-product incl. corpus-level unparseable JSON) | No | — | Local |
| 10 | REQ-LOOPECON-09 | DoD round index disk-derived, resume-safe, fail-open to `iteration` | `deriveDodRoundIndex` `:682`, `dodVerifyLoop` `:12670-12729`, `_listFiles` threaded from `main()` `:17706` | `loopEconomicsDodRoundIndex.test.js:39,82,89,157` (PROP-08/09, incl. desynced in-memory counter and regex-metacharacter feature names) | No | — | Local |

---

## §3 Integration-Boundary Notes

- **Adjacent-surface falsification:** F-3 (`OPERATIONS.md:21`), F-6 (`pdlc/README.md`, `CLAUDE.md`).
- **Sibling-surface sweep:** the second `reviewLoop` call site (`orchestrate-dev.js:17616`, Phase CR) is deliberately not threaded with `derivativeStop`; `pdlc/OPERATIONS.md` declares Phase CR out of scope, so this is a declared omission, not a gap.
- **Census siblings updated correctly:** `dispatchableSkills.test.js` 15→16 indirect-dispatch sites, `documentOracles.test.js` `loopEconomics*` namespace note. Both re-run green.
- **Deferral binding:** REQ NG-2's deferral (deleting three vestigial SKILL.md sentences) is named as "a permitted follow-up outside this feature" with **no queue row and no successor REQ**. It is scoped-out in the REQ rather than deferred-with-a-successor, which the criterion accepts; flagged here for visibility only, not counted as a finding.

---

## Handoff

Two High findings block `DOD_STATUS: passed`. F-1 is the sharper of the two: it is a
one-condition defect in `appendApprovalAnchors`' idempotence guard whose effect is that the M2
feature's PASS path silently accomplishes nothing durable. F-2 is a scope/spec mismatch that may
be closed either by implementing the accounting or by amending the REQ — that call belongs to
`pm-author`/`se-author`, not to the remediator alone.

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 88, "req_gaps": 2, "boundary_gaps": 3}
