# Cross-Review: test-engineer — PLAN (v2)

**Reviewer:** test-engineer
**Document reviewed:** docs/harden-harvest-guard/PLAN-harden-harvest-guard.md (v1.1)
**Date:** 2026-07-02
**Iteration:** 2

## Verification performed (mechanical re-derivation, not prose trust)

### Iteration-1 finding resolution

| v1 finding | Status | Verification |
|---|---|---|
| F-01 (Medium) — TASK-09/10 unfalsifiable checkpoints | **Resolved** | Fixed via option (a) exactly as specified. TASK-08 lands the conjunction gate + `run_self_test()` + tokenizer/segmenter/heredoc families (11+11+5 = 27 cases; § 6.6 calls the § 3.5 functions directly — no JSON envelope, no git, no fs — so these are genuinely runnable before the decision engine exists). TASK-09 appends the verb-identifier family (11 cases → 38 = full floor) as its own directly invocable green gate. TASK-10 is explicitly declared the only checkpoint-less chain task, with a falsifiable enumerated regression gate as its exit criterion. TASK-12 is recast as completion + audit. Dependency notes 1–2 realigned (TASK-09/10 correctly stated as having no matrix-row ATs of their own). The 27→38 case progression is internally consistent across TASK-05/08/09/12, note 2, and the DoD. |
| F-02 (Medium) — B3 execute-while-write races | **Resolved** | TASK-06 now depends on TASK-05 (the exact single-edge fix suggested); B3 = {TASK-05, TASK-07} with write AND execute targets pairwise disjoint (TASK-05 writes guardMatrix.test.js and spawns the still-unmodified guard; TASK-07 writes check-scope-field.sh and executes hookCompatibility.test.js). The serial chain shifts to B4–B9; the same-batch rule is restated to cover Test-File execute targets and checkpoint-spawned scripts, not just write targets. No remaining cross-edge in any batch. |
| F-03 (Low) — "entire suite 🔴" overclaim | **Resolved** | Red verification restated per row class. Verified against the current script: it emits `pdlc guard:` (never the `pdlc-guard[<REASON>]` prefix), so every BLOCK-expected row is guaranteed red by the `expectBlock` prefix oracle even where the old script also blocks (e.g. M01 blocks with the wrong message → red). The named pre-pass examples check out: the current script fails open on missing interpreter and unparseable JSON, so M43/M69/M72 (degraded ALLOWs) and most D1 rows pre-pass vacuously. "No artificial redness forced" is the correct instruction. |
| F-04 (Low) — vacuous `SELF_TEST_MIN_CASES` floor | **Resolved** | Floor bound to the § 6.6 corner-class enumeration: 38 = tokenizer 11 + segmenter 11 + heredoc 5 + verb-identifier 11. Segmenter arithmetic re-derived from § 6.6: 7 connectors (`;` `&&` `\|\|` `\|` `\|&` `&` newline) + quoted operators as data + nested quotes + 2 group openers = 11 ✓. Heredoc: quoted + unquoted delimiters + `<<-` + body lookalikes + `<<<` = 5 ✓. Verb identifier: the 11-item TASK-09 list ✓. Tokenizer 11 is one consistent reading of § 6.6's class list (which gives classes, not counts). Crucially the derivation comment is mandatory at the declaration, so the constant is auditable and an emptied-down table fails loudly — the F-04 intent is met. |
| F-05 (Low) — meta-test count inconsistency | **Resolved** | CFD-7 key-equality split into standalone meta-test (4) — the alternative shape CFD-7 explicitly sanctions ("fourth conjunct of meta-test 1, or a meta-test 4"). TASK-03 (meta-tests 1, 2, 4), TASK-04 (meta-test 3), the DoD bullet, and TASK-14 now all count four distinct, mechanically countable test titles. Consistent everywhere. |
| Q-01 | **Answered** | Interim intake scaffold spelled out in TASK-08: zero segments → allow (greens M81), every non-empty parse falls through to the fail-closed placeholder. |
| Q-02 | **Accepted disposition** | The wrapper's no-interpreter `--self-test` branch stays unpinned — three-line branch, unreachable from production wiring (hooks pass no argv, C16), outside matrix accounting. Reasonable. |

### Batch-DAG re-derivation (v1.1, `batch == max(dep batch) + 1`)

- TASK-01 (—) → B1 ✓; TASK-02 (—) → B1 ✓
- TASK-03 (01,02) → B2 ✓; TASK-04 (01,02) → B2 ✓
- TASK-05 (03) → B3 ✓; TASK-07 (04) → B3 ✓
- TASK-06 (03, **05**) → max(B2,B3)+1 = B4 ✓ (the new F-02 edge; the TASK-03 edge is now transitively redundant but harmless)
- TASK-08 (06) → B5 ✓; TASK-09 (08) → B6 ✓; TASK-10 (09) → B7 ✓; TASK-11 (10) → B8 ✓
- TASK-12 (11, 05) → max(B8,B3)+1 = B9 ✓ (TASK-05 edge transitively redundant, harmless)
- TASK-13 (12) → B10 ✓; TASK-14 (13) → B11 ✓

**All 14 rows match the Batch column; graph acyclic; ids unique; every dependency resolves; 11 batches as claimed.** Same-batch same-file check under the strengthened rule: B1 disjoint (guardRowIds.js / guardFixtures.js), B2 disjoint (guardMatrix.test.js / hookCompatibility.test.js), B3 disjoint in both write and execute dimensions, B4–B11 singletons. No collision, no execute-while-write edge anywhere.

### Checkpoint achievability spot-checks (new v1.1 checkpoints)

- **TASK-08:** the self-test gate runs before intake, `run_self_test()` calls only § 3.5 functions — the 27-case direct invocation is achievable with no decision engine. M41/M78/M81 achievable via the stated interim scaffold. ✓
- **TASK-09:** verb-identifier cases call `identify_verb` directly (no git); 38-case direct invocation achievable. ✓ Falsifiable (a wrong classification fails a structural-tuple expectation immediately, not two batches later — the F-01 cascade problem is gone).
- **TASK-10:** regression gate enumerates a concrete re-runnable set (M41/M78/M81, M42–M43/M68–M72, S01–S07 + PROP-COMPAT-04, self-test ≥ 38) — falsifiable. ✓ (But see F2-02 on the enumeration's completeness.)
- **P-QUOTE static-operand list** in TASK-05 is character-identical to TSPEC § 6.6 (M01, M04–M07, M47–M51, M53–M54, M60–M63, M90). `M33_RERUN_IDS` unchanged and still character-identical to REQ v1.7 row M33. ✓

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F2-01 | Low | Local | **The blanket rule "A chain task must never make a previously-green row red" (note 2, retained from v1.0) now contradicts the v1.1 acknowledgment of vacuous ALLOW pre-passes.** Rows like M03 and most of the D1 group pre-pass against the current fail-open guard during TASK-05's B3 red-verification run, then necessarily go **red at TASK-06** when the Python body becomes a fail-closed placeholder, staying red until TASK-11 — the plan's own design violates the rule as literally stated. A literal-minded se-implement could stall at TASK-06's checkpoint or misreport a regression. The enumerated gates already carry the correct semantics (TASK-06's checkpoint excludes those rows; TASK-10's regression gate enumerates exactly the checkpoint-asserted green sets). Fix: one clause scoping "previously-green" to **checkpoint-asserted green sets** (rows greened at a prior task's checkpoint), explicitly excluding vacuous pre-passes observed in B3. | Dependency note 2 (last sentence) vs TASK-03 red-verification wording / TASK-06 |
| F2-02 | Low | Local | **First-green points for the jest self-test binding and the CFD-8 gate pin are mispredicted.** TASK-08 says "the jest binding test stays red until the TASK-12 floor is met" and note 2/TASK-12 place both rows' greening at TASK-12 — but the floor (38) is reached at **TASK-09**, where the binding (exit 0 + count ≥ 38, all machinery present since TASK-06/08) mechanically greens; the CFD-8 pin (`stdinRaw: "--self-test"` + env → `PARSE_ERROR`/`unparseable`) greens by **TASK-08** at latest (wrapper env-strip lands at TASK-06, the § 3.7 `PARSE_ERROR` template with M41 at TASK-08). Harmless direction (green earlier than declared, and TASK-12's checkpoint remains true when checked), but the consequence is that **TASK-10's enumerated regression gate omits two rows that are actually green by then** — an intake/wrapper regression at TASK-10 breaking CFD-8 or the binding would slip past the enumerated gate and surface only at TASK-12. Fix: add "jest self-test binding + CFD-8 pin" to TASK-10's enumerated previously-green set (or reword to "green **no later than** TASK-12" and gate TASK-10 on "the full currently-green set"). | TASK-08 (parenthetical), TASK-10 regression-gate enumeration, TASK-12, dependency note 2 |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- Every task on the serial chain now has a falsifiable, per-task exit criterion — the incremental `--self-test` landing is exactly the right use of the § 6.6 architecture, and the one genuinely checkpoint-less task (TASK-10, git-dependent and self-test-excluded by design) says so explicitly instead of hiding behind vague wording.
- The B3 race fix is minimal and complete: one dependency edge, one batch of added latency, and the strengthened same-batch rule is restated in three places (task-table preamble, batch overview, closing invariant) so the dispatcher and se-implement read the same contract.
- The batch column survives full mechanical re-derivation after the re-batching — no desync introduced by the B3→B4 shift or the two redundant-but-harmless transitive edges (both are load-bearing for readability: TASK-06←05 is the race fix, TASK-12←05 names where its checkpoint's test was written.)
- `SELF_TEST_MIN_CASES = 38` with a mandatory derivation comment converts CFD-6 from a letter-of-the-law floor into a real tripwire: dropping any § 6.6 family now fails the jest binding loudly.
- The red-guarantee argument is now honest *and* verified: the current script's `pdlc guard:` message can never satisfy the `pdlc-guard[<REASON>]` prefix oracle, so BLOCK-row redness is structural, not assumed.
- The iteration-1 disposition table is complete and accurate — all six items (5 findings + Q-02) dispositioned, and each disposition matches what the document body actually does.

## Recommendation

**Approved with minor changes**

Both findings are one-clause wording fixes to the chain-invariant prose (scope "previously-green" to checkpoint-asserted sets; correct the first-green predictions and widen TASK-10's enumerated regression set accordingly). Neither changes any task, dependency edge, batch, test, or oracle, and every checkpoint is falsifiable as written — they may land in the PROPERTIES-phase touch or a v1.2 editorial pass without re-review.
