# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (v1.2)
**Date:** 2026-08-23
**Iteration:** 5
**Round type:** Delta confirmation (erratum round, Phase PR)
**Scope:** the v1.2 erratum edit (`6676deed..423d6802`), plus a DEC-ERR-03 re-read of the PLAN
against upstream at the dispatched versions.

**Upstream versions verified.** All four dispatched hashes match this tree byte-for-byte, so the
fidelity findings below are against the versions the dispatch named, not a drifted copy:
REQ `17e83bfc…`, FSPEC `9a6be7b5…`, TSPEC `4b5f7f5b…`, DECISIONS `37b3684d…`.

## What was checked mechanically

This round's claims are measured claims, so they were measured rather than read. Every parser check
below was run against `git show origin/main:pdlc/workflows/orchestrate-dev.js`, which is the harness
§4.6 itself nominates.

| Claim under test | Method | Result |
|---|---|---|
| §4.6 `parsePlanTasks(PLAN)` → 9 tasks, `warnings` undefined, the stated id and dependency lists | ran the shipped parser | **Confirmed exactly**, including `T-11`/`T-12` as isolated sources |
| §4.6 `planBatch` vs `max(dep batches) + 1` → `1,2,2,2,3,3,4,1,1` | re-derived per row | **Confirmed**, every row |
| §4.6 `computeTopologicalBatches` → `[[T-01,T-11,T-12],[T-02,T-03,T-04],[T-07,T-08],[T-10]]` | ran the shipped function | **Confirmed**, identical to the `Batch` column |
| §4.6 `parsePlanOwnership(PLAN)` → 9 rows, **zero near misses**, `T-12` parses as the empty path list | ran the shipped parser | **Confirmed**; `nearMisses: []`, `T-12 → []` |
| §4.6 `computeWaves` → four ownership-disjoint waves, wave 1's three path sets pairwise disjoint | ran the shipped function | **Confirmed**; no wave contains a duplicated path |
| §3.3's AT-17 safety claim — `WAVE_STATE_PATH` in no wave's owned set (TSPEC:768) | scanned every wave's owned paths | **Confirmed**; the ledger is named in no owned set |
| T-11's premise — `PROP-SWEEP-2(b)` is red *before* any task runs | ran `documentOracles.test.js` on a pristine tree | **Confirmed red** |
| T-11's measured residual — "ten paths … `TSPEC-`, `PLAN-`, `PROPERTIES-` and seven cross-review files" | read the failure's actual diff | **Confirmed exactly**: 10 paths, that exact composition |
| T-11's `PROP-SWEEP-3` coupling — a one-sided edit trades one red for another | read `documentOracles.test.js:804`ff | **Confirmed**; the oracle asserts each `A1_GLOBS` entry appears in the baseline |
| T-11's precedent — `docs/pdlc-advisory-wave-gate/**` on `A1_GLOBS`, with a baseline row recording rationale, scope justification and hit count | read both | **Confirmed**; the precedent row records all three, and the "empty remainder, never a total" reasoning verbatim |
| T-12's premise — the three paths are in the index | `git ls-files` | **Confirmed**: both `.claude/` files tracked, 94 tracked files under `pdlc/workflows/coverage/` |
| T-12's oracle names, and that its two named oracles are red | ran them | **Confirmed**, both red, and the DoD's *set-equality* wording matches the oracle's `toEqual` exactly |
| T-12's sufficiency — untracking those two `.claude/` paths greens both oracles | read the oracle's expected set | **Confirmed**; the remaining tracked set is exactly the two shared files |
| T-12's "no `.gitignore` edit needed" | ran the third `.claude/` oracle | **Confirmed green already** |
| T-04's retirement premise — the opt-out is inert | `git grep parseDistributionCheckEnabledOptOut origin/main` | **Confirmed**: resolves only under `docs/completed/**` |
| T-04's second citation — `orchestrateQueue.test.js` asserts the source carries neither term | read `orchestrateQueue.test.js:919-920` | **Confirmed verbatim** |
| The §5.7 `numRuns` item the dispatch routed | read TSPEC §5.7 at the dispatched hash | **Resolved upstream**: TSPEC now pins `numRuns: 500`, so "absorbed, not applied" is the correct disposition |

Three document oracles are red on a pristine tree, and they are **exactly** the three the PLAN
names. The erratum's diagnosis is accurate, and its two precondition tasks are correctly scoped,
correctly batched and correctly justified.

## Routed items — disposition

| Routed item | Landed? |
|---|---|
| §5.7 `numRuns` divergence (TSPEC:830 vs T-08's `numRuns: 500`) | **Yes.** TSPEC v1.4 pins 500; PLAN, TSPEC and PROPERTIES now agree. "Absorbed, not applied" is right, and no PLAN edit was owed. |
| No task owns `docs/pdlc-wave-resume/**` on A-1's frozen glob list (raised by se-review, te-author, pm-review) | **Yes.** T-11 lands both halves — `A1_GLOBS` and the baseline row — and the two-sided requirement is correctly derived from `PROP-SWEEP-3`. |
| T-04's retired `distribution.checkEnabled` rationale | **Yes.** The fixture is correctly demoted from "required, because otherwise the queue blocks" to "inert and optional", with both citations checked and both true. |
| `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json`, `pdlc/workflows/coverage/**` tracked | **Yes**, as an action — T-12 untracks all three with `git rm --cached`, and the T-01 read-boundary caveat is correct. See F-02 for the one rationale sentence that does not survive measurement. |

All four routed items are resolved. The findings below are the DEC-ERR-03 re-read: three items the
edit did not touch and that upstream no longer supports, plus two introduced by the edit itself.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.6 records the residual as "ten paths" at v1.2 authoring time, and T-11 says the baseline row should record "the measured hit count at promotion time". Since the set grows by one file per cross-review round — this file included — is the intent that the implementer re-measures at implementation time rather than transcribing ten? `PROP-SWEEP-3` only asserts the glob string is present, so no oracle pins the number either way; stating which is intended would stop a reviewer reading a stale count as a defect. |

## Positive Observations

- **§4.6 is the strongest part of this document, and it survived re-measurement.** Nine independent
  parser claims were re-run against the harness §4.6 nominates, and every one held — including the
  two most easily got wrong: `nearMisses: []` and `T-12 → []`. A plan that publishes its parse
  results and then actually parses that way is rare.
- **The T-12 backtick near miss was caught by the author, not by a reviewer.** §4.6's new row records
  that the manifest cell first read ``index-only `git rm --cached` `` and that the ownership parser
  would have read the command string as an owned path. That is exactly the failure mode the manifest
  exists to prevent, found by re-running the check rather than by re-reading the prose.
- **T-12's zero-path manifest row is correct, and provably so.** The claim that keeping the paths in
  §2.1 rather than in §3.3 keeps AT-17 (TSPEC:768) true was checked by walking every wave's owned
  set: the ledger is named in none. D-9 is strengthened, as the PLAN says, not merely preserved.
- **The batch-1 gate reasoning is the right reasoning.** §2.2's "why this batch grew" note rejects
  weakening the gate to "green except for the three known reds" on the ground that the gate is
  script-owned and the runtime compares an exit code, so there is no wording the runtime reads. That
  is a testability argument, and it is correct: a whole-suite gate cannot be told which reds to
  ignore.
- **T-11's two-sided requirement is derived, not asserted.** `PROP-SWEEP-3` really does assert every
  `A1_GLOBS` entry carries a baseline row, so the "one-sided edit trades one red for another" claim
  is a real coupling the task correctly refuses to split.
- **T-04's demotion is the honest fix.** An oracle resting on a retired opt-out guards nothing, and
  the row now says so rather than quietly dropping the fixture.

## Recommendation

**Needs revision**

One open High (F-01), tagged `inherited`: it is the unaddressed High from round 4, carried in
pre-round bytes that this edit did not touch. The erratum itself is sound — all four routed items
landed and every measured claim in it checks out — but the document still enumerates four mutations
where TSPEC §5.5 names five, so mutation 5 reaches implementation with no owner, no observation duty
and no DoD checkbox. The remedy is unchanged from round 4 and remains small: one row in §4.3 naming
AT-05's write-side conjunct as its oracle and T-07 as its owner, `rows 1–4` → `rows 1–5` in T-07's
mutation-duty cell, and "four mutations" → "five" at §1.2:175, §4.3:376, §4.4 RK-5:409 and §4.5:430.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | inherited | local | TSPEC §5.5 names **five** mutations; the fifth — "suppressing the record write while `explicitPointer` is true" — is killed only by AT-05's write-side conjunct. The PLAN still enumerates **four** in five places (§1.2:175, §4.3:376's table, T-07's "Mutation duty (§4.3 rows 1–4)", RK-5:409's "four mutation runs", §4.5:430's DoD checkbox). An implementer stops at four, leaving the one oracle TSPEC says nothing else catches unproven: without mutation 5, AT-05, AT-07, AT-15 and AT-18 all stay green while the operator-pointed recovery path §2.5 ratifies the write for is silently unrecoverable. Unchanged from round-4 F-01; the v1.2 edit did not touch these bytes. | §4.3 mutation table, T-07 mutation-duty cell, §4.5 DoD mutation checkbox |
| F-02 | Medium | delta | local | T-12's row states `pdlc/workflows/coverage/**` "reds no oracle today and is included anyway for a stated reason, not for tidiness", and gives that reason as diff noise. Measured, the stronger reason is true and the stated one understates it: 94 files under `coverage/` are tracked, and running `npm run test:coverage` — the exact command T-10 must run for batch 4's gate — deletes the tracked `coverage/tmp/*.json` files, which makes the sweep's `grep` error out and reds **`PROP-SWEEP-2(a)`** as well. Verified both ways in this tree: pristine tree → 3 reds; after one `npm run test:coverage` → 4 reds, the extra one being 2(a). So the coverage half of T-12 is load-bearing for batch 4's own gate, not tidiness. T-12's action and DoD are already correct and need no change; the rationale sentence is what is wrong, and it matters because a reader could descope the coverage paths as cosmetic and make batch 4's gate flaky. | §2.1, T-12 task row |
| F-03 | Medium | inherited | nonlocal | §3.4's "Coverage floor" row and §4.4's RK-2 still describe the PLAN as diverging from TSPEC and raising an erratum about it ("the difference from TSPEC's wording is raised as an erratum", RK-2 citing "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`"). TSPEC §5.8 at the dispatched hash no longer says that: it now names the floor as "a named obligation on the **last implementation task** (PLAN T-10, RK-2)" and explicitly contrasts that with the per-wave `postWaveCommand`. Upstream absorbed the erratum; the PLAN describes a disagreement that no longer exists, so its self-description is false. No gate, task, oracle or batch derivation depends on it. Carried from v3 F-01/F-02 and round-4 F-03. | §3.4 integration-points "Coverage floor" row; §4.4 RK-2 mitigation cell |
| F-04 | Medium | inherited | local | T-10's oracle (i), §2.2's batch-4 gate and §4.5's DoD all bind "`npm run test:coverage` exits 0" unconditionally, but TSPEC §5.8 discloses that `c8.include` carries a fourth, external entry (`**/scripts/capture-learnings-baseline.mjs`, with `allow-external: true`) and warns that `--per-file` applies the floor independently, so the command can red on a file this feature does not touch. Measured today the margin is real but thin — branch coverage is 89.47% for that file and 88.23% for `build-runtime.mjs` against an 85 floor — so the bind holds now, but a drift of four points in an unrelated module blocks T-10 with a failure it cannot fix and misattributes it to this feature. Scoping oracle (i) to `orchestrate-dev.js`'s per-file number, with the whole-command exit reported rather than asserted, keeps the oracle falsifiable by this feature's own work. Unchanged from round-4 F-02. | §2.1 T-10 oracle (i); §2.2 batch-4 gate; §4.5 coverage DoD line |
| F-05 | Low | delta | local | §4.6's "Retired ids" row still reads "the parser sees seven tasks and no dangling dependency". The edit two rows above correctly changed the count to nine, but this row was not carried. Measured, the parser sees **nine**. The row's substantive claims are both true and were verified (`T-05`, `T-06`, `T-09` appear in no `#` or `Deps` cell; no dangling dependency), so nothing downstream is affected — but §4.6 is presented as a re-run verification record, and a record that contradicts itself two rows apart is weaker evidence than it should be. One word. | §4.6 parse-verification table, "Retired ids" row (`PLAN:493`) |

FINDING: High | inherited | local | §4.3 mutation table, T-07 mutation-duty cell, §4.5 DoD mutation checkbox | TSPEC §5.5 names five mutations; the PLAN's four-mutation enumeration leaves mutation 5 (suppressing the record write while `explicitPointer` is true, killed only by AT-05's write-side conjunct) with no owner, no observation duty and no DoD coverage.
FINDING: Medium | delta | local | §2.1 T-12 task row | T-12's rationale claims `pdlc/workflows/coverage/**` "reds no oracle today"; measured, running `npm run test:coverage` (which T-10 must run for batch 4's gate) deletes tracked `coverage/tmp/*.json` and reds PROP-SWEEP-2(a), so the coverage half of T-12 gates batch 4 rather than being tidiness.
FINDING: Medium | inherited | nonlocal | §3.4 "Coverage floor" row; §4.4 RK-2 mitigation | The PLAN still describes itself as diverging from TSPEC §5.8 and raising an erratum, but TSPEC at the dispatched hash already names the floor as an obligation on the last implementation task (PLAN T-10, RK-2).
FINDING: Medium | inherited | local | §2.1 T-10 oracle (i), §2.2 batch-4 gate, §4.5 coverage DoD line | T-10 binds `npm run test:coverage` to exit 0 unconditionally, though TSPEC §5.8's four-entry `c8.include` applies the per-file floor to an external module this feature cannot fix (measured margin today: 89.47% vs an 85 floor).
FINDING: Low | delta | local | §4.6 parse-verification table, "Retired ids" row | The row still reads "the parser sees seven tasks"; the same table now correctly reports nine, and nine is what the parser returns.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 1}
