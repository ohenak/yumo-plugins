# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.2)
**Date:** 2026-08-19
**Iteration:** 3
**Scope:** Delta re-review of v1.2 against my v2 findings. Changed material only: the v1.2 changelog
row, the Overview's file-count sentence, §1.3's four-site paragraph, tasks A6-03, A6-04, A6-06,
A6-18, batch 1's gate row, and the DoD transcription checkbox. Testing lens: transcription-surface
completeness, oracle falsifiability, ownership/commit reachability, coverage claims. Every
existing-behaviour claim below re-checked at HEAD.

## Round-2 resolution

| v2 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The `pdlc/README.md` clause is gone from A6-06; the replacement says "the affordance is carried by the key pairing alone; **no `pdlc/README.md` edit is in scope**" (PLAN:97). All four supporting reasons re-verified at HEAD: `grep -c advisory pdlc/README.md` = 0 (no section to join); the task's manifest row is `.claude/pdlc.config.example.json` alone (PLAN:141); the wave loop commits exactly `task.files` (`orchestrate-dev.js:14396`–`:14406`, `paths = Array.isArray(task.files) ? task.files : []` then `commitPaths({paths, …})`); and `docs-uniqueness.test.js:122`–`:123` does pin `pdlc/README.md:139` and `:145` to `claude plugin install`, both of which read as claimed today. |
| F-02 | Low | **Resolved** | A6-18's warning now reads "or any `.enabled` token at all, comments and strings included, since the oracle matches `/\.enabled\b/g` over raw source text with only `parseAdvisoryConfig`'s body excised" (PLAN:112). Matches the oracle exactly: `advisoryDisabled.test.js:653`–`:657` builds `combined` from `sourceExcludingParser(DEV_SOURCE)` + `sourceExcludingParser(QUEUE_SOURCE)`, runs `combined.match(/\.enabled\b/g)`, `toHaveLength(3)`; the excision is brace-matched over the parser declaration only (`:636`–`:650`), so comments and string literals are inside the counted set. |
| F-03 | Low | **Resolved** | A6-04's justification is now what the file shows: "It does already read the example config (`ci-arrangement.test.js:39`) and assert `implementation.testCommand` on it (`:799`–`:825`, annotated in-file as unrelated to §5.1), so the reason to open a purpose-named file is not that the file never reads this config" (PLAN:93). Re-verified: `configPath` is built at `:39`, the `implementation.testCommand` test runs `:799`–`:825` under the in-file banner "unrelated to §5.1; unchanged by this task", and `grep -c advisory ci-arrangement.test.js` = 0, so the "zero occurrences of `advisory` today" clause still holds. |
| F-04 | Low | **Partly resolved** | The DoD row no longer implies `ci-arrangement.test.js` carries this feature's expectation, but the replacement sentence is ungrammatical — see F-01 below. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The DoD's engine row is a garbled sentence, and the clause it lost is the one an implementer needs.** PLAN:331–333 reads: "`cd pdlc/engine && npm ci && npm test` green, covering A6-04's example-config expectation in its own `advisory-config-example.test.js`, with `ci-arrangement.test.js` untouched that the wave gate never runs." The trailing clause has lost its head — presumably "…untouched, and run out of band because the wave gate never runs it". As written the checkbox still checks the right things (engine suite green, expectation in its own file, `ci-arrangement.test.js` untouched), so nothing becomes unverifiable; but the *reason* the command is run by hand — `.claude/pdlc.config.json`'s `testCommand` is `cd pdlc/workflows && npm test …` with no engine leg (verified at `.claude/pdlc.config.json:3`) — is exactly what stops an implementer assuming the batch gate covered it. One sentence, not a revision. | Definition of Done |
| F-02 | Low | Local | **A6-03's "Both are folded into this existing batch-1 task" is stale two-site wording under a now-four-site list.** The row enumerates four sites and then says "**Both** are folded into this existing batch-1 task rather than given a sixth batch-1 task of their own" (PLAN:90). The batch-cap argument it makes is correct and still load-bearing — batch 1 is exactly five tasks against `computeTopologicalBatches`' five-task sub-batch cap (`orchestrate-dev.js:10805`), and a sixth task would shift every downstream `Batch` — but "Both" now names a set of four. Read literally, an implementer could take two of the four as separately homed. "All four" removes the ambiguity. | A6-03 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v1/v2 and still not gating: does `citesGateOutput`'s negative arm (A6-07) explicitly name the false case where the quoted region is present in the *dispatch prompt* but absent from `gateResult.output`? The PLAN says "true only for a region actually present in `gateResult.output`" (PLAN:99), which admits that reading but does not pin it. If the answer is "yes, it is one of the named cases", nothing needs to change in the PLAN — it lands in the test. |

## Positive Observations

- **The four-site claim is not just true, it is set-complete — I checked the closure, not the list.** Grepping the suite for `advisory.rows).toHaveLength` returns exactly the four sites the revision names, at exactly the named lines: `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571`, `advisoryHarvest.test.js:726`. I then widened to every `toHaveLength(5)` / `toBe(5)` in the suite to look for a fifth cardinality coupling under a different shape, and both candidates are false positives: `advisoryRecord.test.js:441`'s `expect(tableRowCount).toBe(5)` counts a rendered entry's five *field* rows (`Seam|Confidence|Envelope|Disposition|Model`, `:440`), not seams, and `pipelineWiring.test.js:499`'s `expect(addedSeams).toHaveLength(5)` counts the five injected *IO* seams (`_listFiles`, `_writeFile`, `_appendFile`, `_git`, `_recordQueueRow`, `:472`–`:478`), which A6 does not touch. Neither moves when `ADVISORY_SEAMS` gains a member.
- **The revision found the site that its own stated rule was written to catch.** `advisoryHarvest.test.js:726`'s neighbourhood is `result.advisory.rows.find((r) => r.seam === "A1")` (`:727`) — a member *lookup*, no member list anywhere near it — so an instruction phrased as "retarget the seam literals" genuinely never reaches it, exactly as PLAN:59–63 argues. That is §1.3's transcription-*sites*-not-member-*literals* bar doing real work on its second application, which is the difference between a rule and a snapshot.
- **The two new sites sit inside an already-owned file, so the fix costs no batch churn.** `advisoryHarvest.test.js` appears in the ownership manifest under A6-03 and nowhere else (whole manifest re-read, PLAN:134–156), so naming `:571` and `:726` adds no row, no task, no dependency edge and no `Batch` shift. Batch 1 stays at five tasks. Re-derived `batch == max(dep batch) + 1` across all twenty-two rows after the edit: consistent, ids unique, graph acyclic, no same-batch same-new-file collision.
- **The Overview's file arithmetic now reconciles with the manifest.** Twelve distinct paths under `pdlc/workflows/__tests__` in the manifest, eleven of them `*.test.js` and the twelfth `helpers/advisoryDoubles.js` — which is what PLAN:30 now says. I confirmed the ten "already exist" by `ls`, and that `advisoryWaveGate.test.js` and `pdlc/engine/__tests__/advisory-config-example.test.js` are both genuinely absent at HEAD.
- **A6-06's four reasons are independent and each separately falsifiable.** No section to join, no upstream row asking for one, uncommittable under `task.files`, and line-pinned by a delivery-blocking check — an unusually durable shape for a scope-exclusion clause, because a future reader can kill any one reason without the exclusion silently evaporating.

## Recommendation

**Approved with minor changes**

Both v2 Lows are resolved, the v2 High is resolved by removal with a verified four-reason
justification, and the new four-site enumeration survives an independent set-equality sweep of the
whole workflows suite. The two Low findings are wording only — a truncated DoD sentence and a stale
"Both" — and neither changes what gets built, tested or gated. Fold them into any later edit; they
do not warrant a round of their own.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f
APPROVAL-HASH-NORMALIZED: sha256:ec835eb6623d8fd50edb4cdfd2134def0edb8e7083ae04eee5fb1c1c62c0d2f3
REVIEWED-COMMIT: c8981e48bfe6e2fa400a33718dbcd9cc1e86bd0a
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:0610e311f5e0b206c7781e3d75e00fa70799ad013c6b219d7cac87afab0e9bba
UPSTREAM-STATE: DECISIONS sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
