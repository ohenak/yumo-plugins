# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.1)
**Date:** 2026-08-19
**Iteration:** 2
**Scope:** Delta re-review of the v1.1 revision — round-1 finding resolution plus new issues in changed
sections only. Testing lens: red-before-green ordering, batch/DAG mechanics, manifest ownership,
oracle falsifiability, coverage claims. Every existing-behaviour claim below re-checked at HEAD.

## Round-1 finding resolution

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | `advisoryQueueSeams.test.js` now in A6-03's `Test File` cell and in the manifest (PLAN:88, :129); §1.3's enumeration reads "Eight shipped surfaces" and states the derivation rule (grep `advisory.rows`/`toHaveLength`, not only member literals) |
| F-02 | High | **Resolved** | `advisoryDisabled.test.js` folded into the same batch-1 task, not a sixth task; batch 1 still exactly five tasks, so no downstream `Batch` value shifts. A6-20 still owns the file's batch-13 work; batch-1/batch-13 is not a same-batch collision (PLAN:88, :105, batch-safety rule 2 updated at :183) |
| F-03 | High | **Resolved** | `pathsCollide` dropped from A6-00's list with the reason recorded (PLAN:85). Re-verified all thirteen remaining symbols are `export`ed from `orchestrate-dev.js` — the pre-flight is green at HEAD as the batch-1 gate requires |
| F-04 | Medium | **Resolved** | A6-09 now pins `test.todo` and names the mechanism (`scanSkipTokens`'s `/\b(describe\|test\|it)\.skip\s*\(/` at `orchestrate-dev.js:11146`, re-verified) |
| F-05 | Medium | **Resolved** | `cd pdlc/engine && npm ci && npm test` is now an explicit obligation in A6-04 and A6-06, in the batch-2 gate row (PLAN:114) and in the Verification table (PLAN:229). Re-verified `.claude/pdlc.config.json`'s `testCommand` is `pdlc/workflows`-only, so the "not observed by the wave gate" premise is true of the *active* config |
| F-06 | Medium | **Resolved** | A6-04 re-homed to a new `pdlc/engine/__tests__/advisory-config-example.test.js`; manifest and batch-safety rule 4 updated. Discovery is directory-based (`node --test __tests__/`, `_run-suite.mjs:51`), so a new `*.test.js` is collected automatically — no silently-never-run false green |
| F-07 | Low | **Resolved** | A6-07's `Deps` now reads `A6-00, A6-05`; re-derived `max(1, 2) + 1 = 3` equals its `Batch` column |
| F-08 | Low | **Resolved** | The "no floor will fail" claim is withdrawn and replaced with a dilution argument plus A6-21's per-file branch-percentage record. Re-verified `orchestrate-dev.js` is in `c8.include` and `test:coverage` really carries `--per-file --branches 85` (`pdlc/workflows/package.json:9,:19`) |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **A6-06's new `pdlc/README.md` clause names a file no task owns and a section that does not exist, and the obvious insertion point reddens a shipped line-pinned engine oracle.** The revision added: "the affordance is carried by the key pairing plus one line in `pdlc/README.md`'s advisory section" (PLAN:91). Three problems, all mechanical. (a) **No advisory section exists** — `grep -i advisory` over `README.md`, `pdlc/README.md` and `pdlc/engine/README.md` returns zero hits at HEAD, so the line has no home and the writer must invent one. (b) **The file is unowned.** A6-06's `Source File` cell and manifest row name `.claude/pdlc.config.example.json` only (PLAN:91, :132). The wave commit loop commits **exactly** `task.files` (`orchestrate-dev.js:14398`–`:14406`: `paths = Array.isArray(task.files) ? task.files : []`, then `commitPaths({paths, …})`), so a README edit is never committed by any task in the wave and survives only as an uncommitted working-tree change through Phase DOD's rebase — a silently dropped deliverable that no gate detects. (c) **The likely insertion point breaks a delivery-blocking check.** `pdlc/engine/__tests__/docs-uniqueness.test.js:122`–`:123` asserts `pdlc/README.md`'s **line 139** and **line 145** contain `claude plugin install`, by exact index (`lines[lineNo - 1]`, `:112`–`:118`). Every plausible home for advisory prose is above 139 (`## Convention contract` at :58, `## Operator conventions` at :74), so inserting one line shifts both pins and reddens `Engine tests (ubuntu-latest)` — invisible to the `pdlc/workflows`-scoped wave gate and surfacing twelve batches later in Phase PUB. That is precisely the mystery-red class §1.3's enumeration exists to prevent. TSPEC's §5.1 file map carries no `pdlc/README.md` row either (TSPEC:1090–1098), so this is PLAN-introduced. Fix: either drop the README clause (the key pairing already carries the affordance, and TSPEC does not ask for it), or add `pdlc/README.md` to A6-06's `Source File` cell **and** manifest row, name an insertion point strictly **below** line 145, and add `docs-uniqueness.test.js`'s two line pins to §1.3's transcription-surface enumeration so the coupling is stated rather than discovered. | A6-06; manifest; §1.3 |
| F-02 | Low | Local | **PROP-DIS-06's oracle is source *text*, so a comment defeats A6-18's "no new `.enabled` read" reasoning.** A6-18 argues that receiving the resolved `advisoryTierOn` keeps the count at three (PLAN:103) — correct, and the citation is exact (`orchestrate-dev.js:13678`, the "read once, reused everywhere" comment at `:13675`–`:13677`, and `orchestrate-queue.js:1318`, all verified). But the oracle is `combined.match(/\.enabled\b/g)` over raw source with only `parseAdvisoryConfig`'s body excised (`advisoryDisabled.test.js:653`–`:657`) — it does not mask comments or strings. A doc comment in `runWaveGateSeam` reading "the tier's `.enabled` is resolved by the caller" makes the count four and reddens batch 12 for a non-behavioural reason. Fix: extend A6-18's warning from "a literal `config.enabled === false`" to "any `.enabled` token, comments and strings included". | A6-18 |
| F-03 | Low | Local | **A6-04's stated reason for avoiding `ci-arrangement.test.js` is not what the file shows.** The new cell argues the file's own header scopes it to FSPEC §5.1's CI arrangement (PLAN:89). It in fact already carries a config-example assertion — `ci-arrangement.test.js:799`–`:825`, reading `.claude/pdlc.config.example.json` (`:39`) and asserting `implementation.testCommand`, annotated in-file as "unrelated to §5.1; unchanged". The *decision* to open a purpose-named file is still right (a config-schema red should not block delivery on the §5.1 oracle's check), but the justification as written is falsifiable by one grep and will read as an error to the implementer who opens the file. Fix: restate as "the file's §5.1 charter should not grow a second unrelated tenant — `:799`'s existing one is the precedent this plan declines to extend". | A6-04 |
| F-04 | Low | Local | **The DoD checkbox for the engine channel reads as a broken merge.** PLAN:321–323: "`cd pdlc/engine && npm ci && npm test` green, covering A6-04's example-config expectation in its own `advisory-config-example.test.js`, with `ci-arrangement.test.js` untouched that the wave gate never runs." The trailing "that the wave gate never runs" is stranded from the pre-revision wording and leaves the checkbox ambiguous about what is being verified. Fix: split into two clauses — the expectation lives in the new file; `ci-arrangement.test.js` is untouched by this feature. | Definition of Done |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Both v1 questions (Q-01 on `GATE_EXCLUSIVITY_REGISTRY`'s generated A6 row, Q-02 on `citesGateOutput`'s prompt-echo arm) are unanswered in v1.1 and neither was raised as a finding, so neither gates. Q-02 in particular still matters for A6-07's negative arm: is a reply that quotes a region present in the *dispatch prompt* but absent from `gateResult.output` an explicitly named false case? |

## Positive Observations

- **The delta was verified, not taken on trust.** Every round-1 fix was re-checked against HEAD rather than against the changelog: thirteen pre-flight symbols confirmed exported, `scanSkipTokens`'s regex re-read, `c8.include` and the `--per-file --branches 85` invocation re-read, `.claude/pdlc.config.json` re-read to confirm the workflows-only scoping the whole engine-verification argument rests on, and the two `toHaveLength(5)` sites re-confirmed at `advisoryDisabled.test.js:622` and `advisoryQueueSeams.test.js:627`.
- **The §1.3 enumeration now states its own bar.** The added paragraph ("transcription *sites*, not *member literals*", with the grep recipe) converts a list that happened to be complete into a rule that can be re-run — the difference between a snapshot and an oracle. F-01 above is an application of exactly that rule to a surface the revision itself introduced.
- **Batch/DAG integrity survived the revision.** Re-derived `batch == max(dep batch) + 1` across all twenty-two rows after the A6-07 edge and the A6-03 fold: all match, batch 1 is still exactly five tasks (under `computeTopologicalBatches`' five-task sub-batch cap), ids are unique, the graph is acyclic, and no file has two writers in one batch — `advisoryDisabled.test.js` in batches 1 and 13, `advisoryQueueSeams.test.js` in batch 1 alone.
- **A6-15's new arm (iv) is the right shape.** Adding the zero-count discriminator to AC-1.5's three disjunction arms is what makes the other three falsifiable: without it, a carrier emitting the notice unconditionally passes (i)–(iii). Counting statements over the *whole notice surface* rather than over A6-authored notices keeps the oracle positive rather than absence-only.
- **The coverage paragraph now says what it can prove.** "A dilution argument, not a guarantee", plus A6-21 recording pre/post per-file branch percentages, replaces a claim the gate command contradicts. The branch inventory stays where it belongs — in the enumerated cases, not the percentage.

## Recommendation

**Needs revision**

One High finding, and it is a one-row fix: A6-06's `pdlc/README.md` clause either goes away or comes with an owner, an insertion point below `pdlc/README.md:145`, and a line in §1.3's surface enumeration. All eight round-1 findings are resolved, and the DAG, manifest and AT coverage held up under mechanical re-derivation. The three Low findings are wording repairs and do not gate.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 3}
