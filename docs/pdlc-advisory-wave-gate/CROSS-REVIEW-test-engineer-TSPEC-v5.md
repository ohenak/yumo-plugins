# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.4)
**Date:** 2026-08-20
**Iteration:** 5
**Scope:** Local
**Delta base:** `6cfdf746` (my v4 review's HEAD) → `d55f4496`, 193 insertions / 78 deletions, TSPEC only

## Round-4 findings: disposition

| Prior finding | Verdict | Evidence |
|---|---|---|
| F-26 (High) — round 3's suffix check was satisfied by the wave's own pre-A6 pass, so §5.5's mutation fixture could not fail | **Resolved** | §3.2 step 6 replaces the suffix check with growth measured from an anchor: `sameSequence(invocations.slice(ledgerAtLastApply), gateSequence)`. The revision states the defect in my own terms — the ledger is non-empty at dispatch precisely because A6 is only entered on a red first pass — and adds the sentence that makes it decidable: "growth measured from an anchor cannot be satisfied by tokens that lie below the anchor" (§3.2). `gateSequence` is read from `implConfig`, never a hard-coded 2, which also answers Q-01 |
| F-26's *proposed operand* (`length × (attempts + 1)`) | **Correctly refused, with the counterexample I missed** | §3.2 records that `attempts` is incremented on three paths that never gate — preemption, dispatch error, malformed verdict. I checked all three in the shipped driver: `attempts += 1` at `orchestrate-dev.js:3421` (preempted, `:3420` guard), `:3428` (dispatch-error, then `continue`), `:3459` (malformed verdict, then `continue`). A run whose first reply is malformed and whose second repairs and greens ends `attempts: 1` having run one sequence, so my quantity denies resolution to a green wave — the same false-negative class as v1.2. The rejection is right and the reason is on the page |
| F-27 (High) — §5.2's two-attempt companion carried §2.4's *one-attempt* four-token literal | **Resolved** | §5.2 now reads six tokens, `["post-wave", "test", "post-wave", "test", "post-wave", "test"]`, and names the three sequence runs that produce them (first pass, attempt 1, attempt 2). Cross-checked against §2.4's table (line 240): the four-token row is captioned "One attempt, red re-gate", so the six-token literal is the one this run produces. §5.5's companion bullet carries the same six tokens — no stale copy left |
| F-28 (Medium) — only one mutation shape fixtured; attempt-2 drop is the one that discriminates | **Resolved, and pinned to the rule** | §5.5 is now a two-row fixture table, and the second row states exactly why it is the discriminating one: after attempt 2's `apply` re-anchors, the slice is empty *even though the ledger grew by one clean sequence and ends in one*, so suffix, non-empty-growth and whole-multiple all pass and only the anchored rule refuses |
| Q-01 (no-post-wave configuration) | **Answered with a fixture** | §5.2 adds a `testCommand`-only run asserting `["test", "test"]` and a resolution — §2.4's third row, and an implementation that hard-codes 2 fails only this case (§6 OQ-15… OQ-14) |
| Q-02 (Disposition cell alongside `Model`) | **Answered** | §6 OQ-15: both cells are pinned on the same capture-failure run — Disposition as a bare `escalated` with no refusal reason, `Model` as the literal `n/a` |

The finding below is in this round's new content — specifically in the mechanism F-26's fix introduced.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-29 | High | Local | **§3.2 step 6's anchor has no seam: `apply` physically cannot write the variable the call site reads, and §3.3's signature does not carry it.** The rule is now `sameSequence(invocations.slice(ledgerAtLastApply), gateSequence)`, evaluated in `runWaveGateSeam`'s step 6, where `ledgerAtLastApply` appears as a bare identifier alongside `ledgerAtDispatch` — which step 4 does declare in that scope. But the writer is `buildA6SeamOps`' `apply` (§3.3), and `buildA6SeamOps` is a **top-level export** whose parameter list is given in full at §3.3: `{feature, waveNum, waves, waveIndex, tasks, gateOutput, implConfig, scriptGate, invocations, snapshot, _git, _runCommand}`. Nothing in it can reach a variable in the caller's scope, and no returned member exposes one. `invocations` works precisely because it is a **live array passed in and mutated in place** — the same idiom §3.3's `declaredScope` row documents as *required* ("a live array, mutated in place, never reassigned … because the driver captures the reference once at GATE and the test doubles shallow-copy the SeamOps object"). A number cannot be plumbed that way, and the natural improvisations both fail quietly: a scalar property assigned on the returned SeamOps object is lost whenever a fixture spreads `{...seamOps, verifyGate: fake}` — which is what §5.5's mutation fixtures do — and the shipped driver reads members off the object it was handed (`orchestrate-dev.js:3499`, `:3503`, `:3521`, `:3546`), so which object holds the mutation is decided by the test's copy, not by the design. When the anchor is not observed, `invocations.slice(undefined)` is the whole ledger and the check silently inverts to a *tail* read — round 3's defect, restored by an implementation detail rather than by the rule. Give the anchor the `declaredScope` treatment: pass a mutable carrier into `buildA6SeamOps` (`ledgerAnchor` object, or a one-element array) that `apply` writes in place and step 6 reads, name it in §3.3's signature and its `apply` row, and state it in §3.2's code block so Phase P has one spelling to transcribe. This is the one mechanism AC-4.1 conjunct (iii) now rests on entirely | §3.2 step 6, §3.3 (signature, `apply`, `verifyGate` rows) |
| F-30 | Medium | Local | **Neither §5.5 mutation fixture asserts that the anchor was recorded, so both pass against a build that never records one.** Both fixtures assert the same threefold negative-shaped conclusion — disposition not `resolved`, halt on AT-05-3's literal, `0` waves resolved — and every one of those is *also* what an implementation with a broken or absent anchor produces, since a missing anchor fails the check for everything. That is a fixture pair whose green says "the check refused" without distinguishing "refused for the right reason" from "refuses always". The positive companions in §5.2 do carry the discriminating half, but only if they exercise the **real** `apply` — and §5.5 does not say whether the fixtures drive `buildA6SeamOps` with one member replaced or fabricate a SeamOps object wholesale, which under F-29 is the difference between a real anchor and none. Two cheap additions close it: state that the mutation fixtures build the real seam ops and replace `verifyGate` only, and have the attempt-2 fixture assert positively that attempt 1's genuine sequence *did* land (ledger reads four tokens at halt) — so the fixture proves the ledger grew and the resolution was still refused, which is the whole content of the anchored rule | §5.5, §5.2 |
| F-31 | Low | Local | **`ledgerAtLastApply`'s pre-`apply` value is unstated, and the guard that depends on it is exercised by no fixture.** The check's first conjunct is `ledgerAtLastApply >= ledgerAtDispatch`, which can only ever be false before any `apply` has run — a state the shipped driver never reaches at step 6, since `resolved` follows a successful ACT (`orchestrate-dev.js:3521`). So the conjunct is today unfalsifiable, and its behaviour depends on an initial value the document does not name: `undefined` fails closed, `-1` fails closed, and `invocations.length` at build time is exactly the wrong choice (it equals `ledgerAtDispatch`, making the guard vacuous and the slice a growth-since-dispatch read). Name the initial value in §3.3 — the fail-closed one — and say in §3.2 that the guard is a defensive conjunct with no fixture rather than leaving Phase P to hunt for the case that falsifies it | §3.2 step 6, §3.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Under F-29's carrier, is the anchor reset per wave or per run? A carrier built inside `runWaveGateSeam` is naturally per-wave, but if PLAN hoists `buildA6SeamOps` construction, a wave-2 seam could start holding wave 1's anchor — which, since `invocations` is also per-wave (§2.4: "one per wave, lives in the wave loop's own scope"), would read as a large positive offset into a short ledger and refuse every resolution. Worth one sentence in §3.3 tying the carrier's lifetime to `invocations`' lifetime. |

## Positive Observations

- The response to F-26 is the best kind: the fix took my *diagnosis* and refused my *prescription*, with the counterexample stated on the page — a malformed first reply consuming an attempt without gating. I verified all three non-gating increment sites (`:3421`, `:3428`, `:3459`) and the rejection is exactly right. A document that argues back with a checkable counterexample is worth more than one that complies.
- §5.5's two-row fixture table now states, per row, *what only the real rule refuses* — the attempt-2 row explicitly enumerates the weaker quantities (suffix, non-empty growth, whole multiple) that admit it. That is a mutation test that documents its own discriminating power, and it is what F-28 asked for.
- §5.2's over-budget case is a proper positive-plus-negative on one run: escalation with `reason: "budget-exhausted"`, snapshot still taken (`commit-tree === 1` plus the `update-ref`), and **no** `_agent` call — with the round-3 claim that AT-02-6 already covered it withdrawn in both halves rather than quietly dropped. Withdrawing a false coverage claim in writing is rarer than fixing one.
- PM F-03's wave-scoped ref is right for testability too: `refs/pdlc/a6-snapshot-{waveNum}` makes a multi-wave run's snapshot assertions independent, where the fixed name made them order-dependent. All ten references in the document were updated — I grepped; no stale `refs/pdlc/a6-snapshot` without the suffix survives.
- Citations continue to check out exactly, including the fussy ones: `:3544` is `log("VERIFY")` and `:3521` is `const applyResult = await seamOps.apply(verdict)` — the APPLY-before-VERIFY ordering the whole anchor argument rests on, cited to the line.

## Recommendation

**Needs revision**

One High, and it is narrow: F-26 and F-27 are properly resolved, and the anchored-growth rule is the right rule. F-29 is about the rule's plumbing rather than its content — `apply` lives in a top-level export that cannot write into `runWaveGateSeam`'s scope, and §3.3's signature carries no carrier for it, so the one mechanism AC-4.1 conjunct (iii) rests on is not implementable as written. The document already contains its own fix in the `declaredScope` row; applying that idiom to the anchor and naming it in §3.3 should be a small edit. F-30 and F-31 harden the fixtures around it.

No upstream defects found this round; OQ-7's BR-9 `.gitignore` boundary remains the one open erratum and is already routed.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
