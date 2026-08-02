# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/TSPEC-pdlc-merge-phase.md` (v1.1, commits through `e579640`)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** line

Delta re-review per protocol: round-1 review re-read, `git diff 656f8cf..HEAD` on both documents,
then the redesigned seams verified against the code they cite. I did **not** re-litigate unchanged
sections. Every new code citation was checked against the file.

## Round-1 finding dispositions

| ID | Sev (v1) | Disposition | Evidence checked |
|----|----------|-------------|------------------|
| F-01 | High | **Resolved.** §2.1 (`:82`–`:87`) withdraws the "pure-function suite" claim outright and states why three of §11's four columns are `phaseMerge`'s. The 25-row `it.each` moves to `mergePhase.test.js` (§13.2 `:1295`), driven by `passingGh`; `mergeDecision.test.js` (`:1294`) keeps only what a pure function can answer — guard order, row ids, the two tie-breaks, short-circuit, termination. §13.3's constraints are now expressed as `fakeGhRun` command-traffic assertions, which `phaseMerge` can actually produce | §2.1, §13.2, §13.3 |
| F-02 | High | **Resolved.** `MERGE_MAX_RETRIES = 10` (§2.2 `:102`); §3.1 bounds the domain to `0…10` (`:230`) with an out-of-domain value taking the default, which is FSPEC §10.3's own rule rather than a new one. §5.2's derivation table (`:507`–`:513`) totals 19 and I re-derived it independently: `1 + 10` `O1` + 4 others + 3 attempts + 1 resolving step = 19 ≤ 24. The boundary pair (`10` accepted / `11` defaulted) and the row-13-at-cap case are in §13.2. See N-04 for one residual | §2.2, §3.1, §5.2, §13.2 |
| F-03 | High | **Resolved, and the diagnosis is now stronger than my finding.** §10.4's table derives the classification step by step and I confirmed each: `moduleFunctionParams` `:787`–`:793` matches only `function NAME(`; `moduleValueInit` `:797`–`:801`; `looksLikeFunction` `:803`; `exempt = Boolean(exemption && exemption.resolved)` `:1005`. The TSPEC goes further than I did and is right to: a wired-and-exempt seam is not merely unguarded but a **failure** of anti-rot clause 1 — `classified.filter(c => c.wired && c.exempt)` at `:1027`, inside the `it` spanning `:1025`–`:1028`. The v1.0 shape was red, not just unprotected. `defaultGhRun` as `export async function defaultGhRun(command, { execFn } = {})` matches the E-3 candidate regex, declares no `_agent`, so E-3 is `resolved: false` → not exempt; wired in `rtDevInjections` → both clauses pass, and RLH-AT-64 genuinely reds if the key is dropped. `_phaseMergeEnabled` is E-1-exempt and unwired, exactly `_phaseDodEnabled`'s shipped-green shape. See N-03 for a one-line citation slip | §10.4, `runtimeBundle.test.js` |
| F-04 | High | **Resolved by design change, not by wording.** The single `_ghRun` transport removes the contradiction rather than answering it: `exportedNames` gains nothing (§11.2 `:1165`), the adapter holds no `gh` catalogue, and every command string lives once in `mergeCommandFor` (§4.1). There is now no module/adapter copy pair to drift, so the "diff the two copies" assertion I asked for is correctly replaced by `mergeAdapter.test.js` (§13.2 `:1299`) with the four assertions the finding asked for — injection key, fixed-command prompt, both prompt clauses, and the reply-mapping pair. Built on `helpers/adapterHarness.js`, which exists and is already used by `adapterProbe.test.js` | §2.3, §4.1, §11.2, §11.3, §13.2 |
| F-05 | Medium | **Resolved.** `_enabled = PHASE_MERGE_ENABLED` is in §2.3's `phaseMerge` signature (`:135`), and `:137`–`:140` fixes the two-scope naming (`_enabled` in the callee, `_phaseMergeEnabled` on `main()`). §13.1 lists `_enabled: false` as a double and §13.3's row-1 case reaches row 1 through it | §2.3, §13.1, §13.3 |
| F-06 | Medium | **Resolved.** `mergeConfig.test.js` added (§13.2 `:1293`) covering E1–E5, the four parse steps, the seven-key fallback table, `sectionMalformed` scoping, a throwing read, and a totality property (every returned key within its accepted domain, `MERGE_DEFAULTS` never mutated) | §13.2, §13.5 |
| F-07 | Medium | **Resolved.** §11.3 `:1202`–`:1207` withdraws the `rtMergeWorktree` claim in terms and cites `:935` alone. Re-verified: `grep` finds exactly one occurrence of the clause in `runtime-adapter.js`, at `:935`, inside `rtGit`. The consequence is drawn correctly — `rtGhRun` establishes the at-most-once sentence, so §13.2 asserting it directly matters more, not less | §11.3 |
| F-08 | Medium | **Resolved.** §13.2 `:1300` restates AT-M5's precondition as a drift-state record with `checkEnabled: false` and empty `writeFailures`, and cites the right mechanism. All four citations verified: `orchestrate-queue.js:1081`, `:1260`, `readDriftStateSafely:1354`, `queueDriftGate.test.js:107` | §13.2 |
| F-09 | Medium | **Resolved.** §7.5 `:823`–`:833` pins `parsePrRef(prUrl).number` as primary with `record.o1.number` as fallback, and skips the write with a plain note rather than emitting `#null` when neither resolves — new catalogue row E16. Three arms tested in `mergeQueueWriteback`. One consequence to pin in fixtures: see N-02 | §7.5, §12, §13.2 |
| F-10 | Medium | **Resolved.** §6.3 `:679`–`:694` replaces the unscoped scan with a decidable one: arity (`guardVerdict.length === 2`, `effectiveGuardPaths.length === 1` — both correct for the declared signatures) plus a token scan over the two extracted function bodies only, and a positive case calling `guardVerdict` with a `config`-shaped third argument and asserting the verdict is unchanged. That last conjunct is the falsifiable one | §6.3, §13.2 |
| F-11 | Medium | **Resolved.** §13.5 `:1345`–`:1350` names the circularity explicitly and replaces the self-comparison with committed goldens captured from `updateQueueStatus` at HEAD **before** the change, one per `QUEUE_STATUSES` member | §13.5, §8.4 |
| F-12 | Low | **Resolved.** §13.4 `:1330` adds `:383` and `:428`, and replaces `:428`'s inline four-literal catalogue with the `QUEUE_ROW_DISPOSITIONS` export — which is the right fix, since a fixture-fed literal there stays green while asserting the retired catalogue | §13.4 |
| F-13 | Low | **Resolved.** 25 rows throughout (FSPEC v1.3 adds 13a; 1–23 plus 11a and 13a), and §13.3 `:1305` has the suite assert its own case count so a dropped row fails rather than vanishes | §2.1, §13.3 |
| F-14 | Low | **Resolved.** §13.2 `:1298` names the three positive conjuncts — queue bytes unchanged, `fakeGit` recorded **zero** argv, `detail` names the status found | §13.2 |
| Q-01 | — | Answered by F-01's redesign: `phaseMerge` drives the table, `mergeDecision` keeps the pure properties, and §2.1's claim is withdrawn |  |
| Q-02 | — | Answered: `parsePrRef` primary, `O1.number` fallback, neither ⇒ skipped with a note (§7.5) |  |
| Q-03 | — | Answered: `mergeObservations.test.js` now declares two explicitly separate blocks, pure and transport-level, with E6/E7 in the second (§13.2 `:1296`) |  |

All fourteen are genuinely resolved — none by restatement, and F-03 by a correction that goes beyond
what the finding claimed. The three FSPEC errata (E-1 squash member, E-2 row 13a via the 7d split,
E-3 row-5 `O4` observation) are all accepted in FSPEC v1.3 (`7028537`), so the provisional
`"7d-unknown"` designator is gone and §5.3 guard 17 / §12 E9 / §13.3 all use `13a`. I checked
FSPEC §11's table directly: 25 rows, with 13a `refused`, no escalation, resolving at 7d.

## New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| N-01 | Medium | Local | **The single-transport redesign drops `stderr`, so `attempts[].detail` is unobtainable and FSPEC §6.3's exhaustion reason cannot be asserted.** §2.3, §4.1's `defaultGhRun` and §11.3's `rtGhRun` all return `{ ok, stdout }` — stderr is discarded in every one of the three. But §4.7 `:452` still specifies `executeMerge`'s failure shape as `{ ok: false, reason, detail }` "where `detail` is the first line of **stderr**", §2.4 `:161` declares `attempts: Array<{ method, ok, detail }>`, and FSPEC §6.3 requires each attempt to record "method **and failure detail**" with row 17's reason "naming attempted method and failure". Under the new seam there is no text to put in `detail`: a non-zero `gh pr merge` yields `{ ok: false, stdout: "" }` and `rtGhRun` collapses the failure to `RT_MISSING`. An implementer following §4.7 writes `firstLine(r.stderr)` and gets `undefined`; §13.2's row-17 case ("reason naming each attempt") then has nothing falsifiable to assert. The house idiom already solves this — §1 `:61` cites `defaultGit`'s `{ ok, stdout, stderr }` and `rtGit` (`:932`–`:933`) already returns stderr in its JSON reply — so the fix is to give `_ghRun` the same three-field contract and have `rtGhRun`'s non-zero branch mirror `rtGit`'s reply instead of returning `RT_MISSING`. Then add a row-17 assertion on the detail text to §13.2. (If the intent is instead that `detail` becomes method-plus-fixed-token, say so in §4.7 and drop the stderr sentence — either resolution is fine, but the three sections must agree) | §4.7, §2.3, §2.4, §4.1, §11.3, §13.2 |
| N-02 | Low | Local | **E16 makes a `merged` run skip the queue write, which §11 rows 3 and 18 record as "queue written: **yes**".** That is the right behaviour (better a note than `#null`), but the 25-row suite asserts the *queue written* column per row, so rows 3 and 18 are only unambiguous if their fixtures guarantee a resolvable `prNumber`. Add to §13.3's fixture-constraint list: the row-3 and row-18 fixtures supply a `parsePrRef`-parseable `prUrl`, and E16's own case lives in `mergeQueueWriteback` where §13.2 already puts it | §13.3, §12 E16, §7.5 |
| N-03 | Low | Local | §10.4's derivation table cites `isAbsenceDefault` at `runtimeBundle.test.js:816`; the predicate is declared at **`:817`** (`:816` is the closing line of its docblock). The regex quoted is exact and the derivation is unaffected — a one-character citation fix | §10.4 |
| N-04 | Low | Local | **`MERGE_MAX_DECISION_STEPS` is the literal `24` while §5.2 *derives* 19 from `MERGE_MAX_RETRIES`.** §2.2 `:103` calls it "derived", but a literal is not derived: raising `MERGE_MAX_RETRIES` later re-opens exactly the F-02 defect silently. Write it as the expression (`1 + MERGE_MAX_RETRIES + 4 + 3 + 1`, plus whatever slack is wanted) and have §13.2's termination test assert the *relation* — that the bound exceeds the worst-case sum computed from the constants — rather than the literal `24`. This is a mutation target in the same class as the ones §13.5 already names | §2.2, §5.2, §13.2 |

## Positive Observations

- F-03's disposition is the model for how to answer a review finding: rather than accept the claim, the author re-derived it from the classifier source and found the situation *worse* than reported (red under anti-rot clause 1, not merely unguarded), then chose a seam shape — a function declaration with no `_agent` — that lands on the blessed `_recordHalt`/`defaultRecordHalt` pattern the test at `:1038`–`:1060` already documents. The independent pin in `mergeAdapter.test.js` means the guarantee no longer rests on one derivation.
- Collapsing six seams to one `_ghRun` transport dissolved F-04 rather than patching it: with `mergeCommandFor` as the single home of every `gh` string there is no copy to diff, no adapter catalogue to drift, and the export surface question disappears. That is a smaller design than v1.0's, which is the right direction at this stage.
- §5.2's termination table is the kind of argument a reviewer can re-derive in thirty seconds, and I did. Pairing it with a config-domain bound turns "reaching the bound is a coding defect" from an assertion into something true.
- §5.3's row-id correction (guard 2 → §11 row 6, guard 4 → row 8, guards 7/8 split into rows 4/5) matters for testability beyond PM's lens: under v1.0's numbering two rows were unreachable and two were double-claimed with conflicting escalation expectations, which would have made the parameterised suite self-contradictory. The suite asserting its own case count of 25 closes the other half.
- §12 shrank by dropping rows that only restated §5.3 and §11, and every surviving row now names a §13.2 file that covers it. E1–E5 and E6/E7, the two gaps I raised, both have homes.

## Recommendation

**Needs revision**

Every round-1 finding is genuinely resolved, and no round-1 blocking finding survives. One new
Medium remains: the single-transport redesign that fixed F-04 dropped `stderr`, leaving §4.7's
`detail`, §2.4's `attempts` record and FSPEC §6.3's exhaustion reason with no obtainable value and
no falsifiable assertion. It is a one-line contract change with an in-repo precedent (`rtGit`
already returns stderr), plus three Low citation/fixture nits. Nothing else blocks; I expect v1.2 to
be approvable on inspection of §4.7, §2.3, §4.1 and §11.3 alone.

## Verdict

VERDICT: REVISE
{"high": 0, "medium": 1, "low": 3}
