# Cross-Review: product-manager — REVIEW (final codebase review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/` artifacts and the shipped diff `main...feat-pdlc-wave-resume`
**Date:** 2026-08-24
**Iteration:** 1

## Scope and method

**Note on the file name.** The task names `…-REVIEW-v1.md` as this round's path. A
`CROSS-REVIEW-product-manager-REVIEW-v2.md` already exists on this branch (committed `9c415a75`…`97e783ca`)
with no v1 beneath it. I have written to the mandated v1 path and, per the tag-selection discipline,
reconciled my Scope tags against that file's findings rather than shipping conflicting tags for the
same defect. The overlap is called out per finding.

Product lens only. Method:

- Read `REQ-pdlc-wave-resume.md` §7 (REQ-WVR-01 … REQ-WVR-10) and `FSPEC` §6 (AT-01 … AT-18) first,
  then the shipped diff `main...feat-pdlc-wave-resume` (91 files, +21778/-297).
- For every AC claiming an operator-visible artifact, traced **AC → production caller → test that
  drives that caller**, not to a builder's own unit test.
- Ran the feature's suites to ground every claim about behaviour:
  `npm --prefix pdlc/workflows test -- __tests__/waveResume __tests__/waveExecution.test.js` →
  **6 suites, 177 tests, all passing**.
- Checked runtime drift: `node pdlc/workflows/build-runtime.mjs --check` → `in-sync`, exit 0. The
  generated `pdlc/workflows/dist/pdlc-cli.mjs` was rebuilt in the same feature branch as the source
  change, per this repo's standing rule.

**Production wiring — checked, and clean.** Every new export is reached from `main()`, not only from
tests:

| New seam | Production caller |
|---|---|
| `classifyWaveLedger` | `pdlc/workflows/orchestrate-dev.js:16266` (inside `main()`'s Phase I ledger branch) |
| `computePlanHash` | `orchestrate-dev.js:16227` |
| `parseWaveLedger` | `orchestrate-dev.js:16232` |
| `ANCESTRY_INDEPENDENT_CODES` | `orchestrate-dev.js:16272` (the lazy-probe short-circuit) |
| `WAVE_IGNORE_REASONS` / `PARSE_REASON_CODES` | inside `classifyWaveLedger`, `orchestrate-dev.js:12942`ff |
| `formatWaveLedger` / `writeWaveLedger` | `orchestrate-dev.js:16577`, inside the wave loop's `if (waveGit)` block |

There is **no zero-caller seam** in this feature and no dead config. The behavioural ACs are driven
through `main()` in `waveExecution.test.js` (96 `main(` call sites), not through the classifier alone
— the new `waveResume*.test.js` modules are deliberately unit-level and are the *supplement* to that
integration coverage, not a substitute for it. That is the right shape and I want to say so before
the findings.

## Requirement-by-requirement trace

| REQ | P | Production caller that satisfies it | Test that drives THAT caller | Verdict |
|---|---|---|---|---|
| REQ-WVR-01 automatic resume at the failed wave | P0 | `orchestrate-dev.js:16300`-ish `resume` branch sets `startWave = decision.startWave` and emits `Resuming at wave …` | `waveExecution.test.js:2279` "records each committed wave, and the next invocation resumes at the failed one" (drives `main()` twice) | ✅ met |
| REQ-WVR-02 closed disregard catalogue (IG-1..6) | P0 | `WAVE_IGNORE_REASONS` (7 codes) consumed by `classifyWaveLedger` | `waveResume.test.js:48` set-equality over `Object.keys(WAVE_IGNORE_REASONS)` against a **literal transcription** of the seven codes; announcements driven through `main()` at `waveExecution.test.js:2472`, `:2661`, `:2898` | ✅ met |
| REQ-WVR-03 verification independence | P1 | un-skip guard + gate run before any commit, `orchestrate-dev.js:16472`-ff ("A green gate is only worth something if the wave's tests actually ran") | `waveExecution.test.js:683`ff | ✅ met |
| REQ-WVR-04 operator override wins, with provenance | P1 | `explicitPointer` branch, `orchestrate-dev.js:16203`/`:16217`, both notices now suffixed `(provenance: operator-set)` | `waveExecution.test.js:2710` "an explicit implementation.startWave outranks the ledger"; boundary (`startWave: 1` ≡ omitted) at `:2913` | ✅ met |
| REQ-WVR-05 record retained, invalidated by the reader | P1 | record kept after the last wave (`orchestrate-dev.js:16583` comment + guard 4's `planHash` re-derivation at `:12978`) | `waveExecution.test.js:2803` "a matching record whose waves are all green skips Phase I whole, and the row says so" | ✅ met |
| REQ-WVR-06 completion is never commit archaeology | P1 | completion read only from `lastGreenWave`; ancestry is falsification only, one `merge-base --is-ancestor` probe at `orchestrate-dev.js:16276` | `waveExecution.test.js:2413` no-change wave still records green; `:2472`/`:2511` the probe is a real input (non-ancestor ignored **and** ancestor honoured) | ✅ met |
| REQ-WVR-07 unattended queue parity | P2 | `orchestrate-queue.js` leaves `_runPipeline` at its `realMain` default | `waveResumeQueueParity.test.js` — **structural only**; no test observes a delegated run's resume point | ⚠️ see F-04 |
| REQ-WVR-08 all waves recorded → Phase I skipped in full | P1 | `skip-phase` branch `orchestrate-dev.js:16313`-ff; distinct `⏭` report row at `:16598` reading `Skipped — all N waves previously committed and recorded green (wave ledger) (provenance: automatic)`; hatch named in the run-log line only, as the REQ requires | `waveExecution.test.js:2358` (complete ledger → zero implementation dispatches, V-wave still runs), `:2622` (honoured on a forced run, notice names the escape) | ✅ met |
| REQ-WVR-09 verified-but-uncommitted is never recorded | P0 | the ledger write at `orchestrate-dev.js:16576` sits **inside** the `if (waveGit)` block opened at `:16506` ("Only now — verified — does anything get committed (M-6)"), so a run with no git transport records nothing | `waveExecution.test.js:2679` "writes no ledger at all when there is no git transport", with a **paired positive** on the same path (`logs` must contain the `verified but NOT committed` notice — not an absence-only oracle), plus the companion arm at `:2699` proving the guard is the transport and not the gate mode | ✅ met (see F-06 for the missing second invocation) |
| REQ-WVR-10 record never becomes tracked content | P1 | `.gitignore:46` `/.claude/pdlc-wave-state.json`, root-anchored | `waveResumeRepoState.test.js:66-83` — asserts the exact line exists, that it is root-anchored, **and** that `git check-ignore -v` resolves to that exact line rather than a broader pattern. This is the ignore-rule anchoring the REQ asked for (C-1), not "nobody happened to stage it" | ✅ met |

**Closed-catalogue checks are genuine set-equality, not containment**, and the expected values are
literal transcriptions rather than derivations from the code under test:

- disregard codes — `waveResume.test.js:48`, `new Set(Object.keys(WAVE_IGNORE_REASONS))` vs a
  hand-written seven-element set;
- ancestry-independent codes — `waveResume.test.js:70`, `toEqual([null, "unreadable-json", …])`;
- the recognised `implementation.*` keys — `waveResume.test.js:83`, four-key set-equality (AT-08 iii);
- the announcement table — `waveExecution.test.js:2978`, five fixtures driven through `main()`, each
  asserted to emit **exactly one** `(provenance: …)` line, with the observed row-kind set compared
  by set-equality to a literal five-element list. A deleted announcement reds this test.

That is the standard I would ask for, and it was met without being asked.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | PLAN task **T-10 never ran**: §4.5.1's delta-scoped coverage map ships with `*(filled in by T-10…)*` placeholders and every §4.5 DoD box is unchecked, so the feature's own completeness oracle does not exist. | PLAN T-10, §4.5.1; TSPEC RT-7/§5.8 |
| F-02 | Medium | Local | TSPEC delta **D-1 ("remove the INTERIM commentary") is only partly landed** — `INTERIM` survives in production, in the shipped runtime, and in the integration suite's `describe` titles, so the DoD row "All eleven TSPEC delta rows D-1 … D-11 are landed" is false. | PLAN §1.1 D-1; REQ §1 |
| F-03 | Medium | Process | The `waveResume*.test.js` namespace is excluded from the `*.test.js` census on the stated ground that "that PLAN's §3.3 manifest owns their census" — but nothing mechanises that ownership, so deleting a whole suite reds no test. | REQ-WVR-07, REQ-WVR-10; PLAN §3.3 |
| F-04 | Medium | Local | The queue-parity suite attributes to FSPEC AT-16 a residual-gap sentence AT-16 does not contain, and AT-16's behavioural conjunct is unmet on the delegated path. | REQ-WVR-07 (P2), FSPEC AT-16, DEC-WVR-07 |
| F-05 | Medium | Local | The automatic resume, its five announcements and its **only** escape hatch (delete `.claude/pdlc-wave-state.json`) appear in no operator-facing document. | REQ-WVR-04, OQ-1 |
| F-06 | Low | Local | AT-09's re-invocation conjunct is not asserted in AT-09's own fixture; it holds only by composing two separate tests. | REQ-WVR-09 (P0), FSPEC AT-09 |
| F-07 | Low | Local | The D-10 / OB-F4 baseline oracle is a containment check (`includes("M-WVR-1")`), so it cannot detect a mis-scoped or emptied baseline row. | PLAN D-10, FSPEC OB-F4 |

*Tag reconciliation:* F-01 corresponds to `CROSS-REVIEW-product-manager-REVIEW-v2.md` F-01 (High, Local),
F-05 to that file's F-03 (Medium, Local), F-06 to its F-04 (Low, Local). I have kept those Scope tags
unchanged rather than shipping a conflicting tag for the same defect. F-03 is tagged `Process` because
the same census-exclusion precedent was already set for the `learnings*` namespace
(`documentOracles.test.js:376-384`) — the lesson is reusable regardless of where the fix lands.

### F-01 (High, Local) — PLAN T-10 never ran, so this feature's completeness oracle does not exist

PLAN §2.1's T-10 row owns two oracles (`PLAN-pdlc-wave-resume.md` §2.1, row `T-10`):

> (i) … per-file `orchestrate-dev.js` … `85`; … (ii) delta oracle — report c8's per-file **uncovered
> line list** for `orchestrate-dev.js` and assert no uncovered line falls inside the line ranges this
> feature introduced, against the transcribed mapping table in §4.5.1 … a deleted [row] fails
> set-equality.

Neither exists. Evidence, all in the tree at HEAD:

1. **§4.5.1's table is still a stub.** Its "Covering test named by T-10" column reads
   `*(filled in by T-10, one test name per arm, in `waveResume.test.js`)*` for the 8 classifier arms,
   `*(one per code, …)*` for the 7 renderers, `*(the `merge-base` call-count case, AT-03)*`,
   `*(in `waveExecution.test.js`, T-10's second owned file)*` for the 5 announcement branches, and
   `*(in `waveExecution.test.js`)*` for the 3 report-row branches. The PLAN itself says the table's
   "completeness — not a percentage — is the checkable thing". It is not complete, so nothing is checked.
2. **No coverage assertion was added.** `grep` for a per-file branch floor over `orchestrate-dev.js`
   in `waveResume.test.js` / `waveResumePreflight.test.js` returns nothing; the only change to
   `coverageInstrumentation.test.js` in this branch is a `spawnSync` retry loop for a
   `consolidationBuild.test.js` race, not a T-10 oracle.
3. **No T-10 commit.** `git log --oneline main..HEAD --format='%s' | grep '^feat(pdlc-wave-resume): T-'`
   lists T-01, T-02, T-03, T-04, T-07, T-08, T-11 — seven of the nine tasks §4.6 measures. T-12 is
   index-only and needs none; T-10 is the one task with owed work that did not land.
4. **Every §4.5 DoD box is `[ ]`.** Including "All eighteen FSPEC ATs have a passing owning test per
   §4.1" and "Each of §4.3's five mutations was applied, observed RED against its named oracle,
   reverted, and its failure output recorded".

Why this is High and not Medium, in product terms: PLAN §4.5.1 exists *because* round-1 F-05
established that the whole-file 85% floor cannot serve as this feature's oracle — the module is
~16,300 lines and this feature adds ~20 branches, "about one percent of the denominator, so every new
branch could be uncovered and `npm run test:coverage` would still exit 0". The delta map was the
compensating control. With it unfilled, the feature ships with **no mechanism that fails when one of
its own branches loses its cover** — which is the same class of gap as a builder with no production
caller, one level up. The 177 tests I ran are genuinely good; the point is that nothing detects their
erosion.

**To resolve:** run T-10 — fill §4.5.1's fourth column with one real test name per row, add the
delta oracle asserting no c8-uncovered line for `orchestrate-dev.js` falls inside this feature's
introduced ranges (set-equality over the table, so a deleted row reds), report the measured per-file
branch number, and tick §4.5's boxes against observed evidence. If T-10 is being deliberately
dropped, that is a scope decision and belongs in DECISIONS with a rejected-alternatives entry — not
in an unticked checkbox.

### F-02 (Medium, Local) — TSPEC delta D-1 is only partly landed; `INTERIM` survives in three places

PLAN §1.1 lists eleven TSPEC delta rows and assigns **D-1 "remove the INTERIM commentary, cite the
TSPEC"** to T-02, and §4.5's DoD asserts "All eleven TSPEC delta rows D-1 … D-11 are landed, each by
the task §1.1 names."

The banner comment was updated — `orchestrate-dev.js:12843` now reads `wave ledger, Phase I's
script-owned resume pointer (pdlc-wave-resume)` where `main` read `INTERIM: wave ledger, …`. But
three further occurrences were missed:

- `pdlc/workflows/orchestrate-dev.js:16224` — `// ── INTERIM wave ledger (see WAVE_STATE_PATH) — the automatic half of the`
- `pdlc/workflows/dist/pdlc-cli.mjs:16233` — the same line in the **shipped runtime artifact**
- `pdlc/workflows/__tests__/waveExecution.test.js:2197` and `:2278` — a section banner and, more
  visibly, the `describe` title `"Phase I — the INTERIM wave ledger resumes a halted run unattended"`,
  which is printed in CI test output

The product point is not comment hygiene. REQ §1 frames this feature as the formalisation of an
explicitly interim mechanism; `docs/_queue/QUEUE.md` row 20 was the promise. A maintainer reading
`main()`'s Phase I branch at HEAD, or a reviewer reading CI output, is told the mechanism is still
interim and still awaiting the feature that just shipped. Medium, not High: no user-visible behaviour
is wrong, and no requirement is unmet — but a stated DoD row is recorded as landed when it is not.

**To resolve:** replace the three remaining `INTERIM` mentions with the TSPEC citation D-1 asks for
(the `describe` title included), regenerate `pdlc/workflows/dist/` in the same commit, and re-tick
the D-1 half of §4.5's delta-row box.


### F-03 (Medium, Process) — the `waveResume*` census exclusion has no compensating enumeration

`pdlc/workflows/__tests__/documentOracles.test.js:373-386` counts `*.test.js` files and asserts
`102`, filtering out two namespaces:

```js
(name) => name.endsWith(".test.js") && !name.startsWith("learnings") && !name.startsWith("waveResume")
```

The comment at `:365` justifies the new exclusion: the suites "take the same treatment as
`learnings*`: excluded from the census, with that PLAN's §3.3 manifest owning their census."

That ownership is asserted nowhere. The only test that reads PLAN §3.3 is
`waveResumeRepoState.test.js:96-108`, and it checks a different property entirely — that no manifest
row names `WAVE_STATE_PATH` (AT-17/D-9). No test enumerates the five `waveResume*.test.js` files, so
the census is open on both sides: deleting `waveResumeQueueParity.test.js` — the **only** artifact
tracing to REQ-WVR-07 — reds nothing, and neither does deleting `waveResumeRepoState.test.js`, the
only artifact proving REQ-WVR-10's ignore-rule anchoring. This is exactly the completeness-by-
set-equality property the brief demands of enumerated contracts, and it is the second-order
consequence of F-01: §4.5.1 filled in would have covered part of it.

Tagged `Process` because the precedent, not this feature, is the durable signal: the `learnings*`
exclusion at `:376-384` carries the identical unmechanised claim. Two features have now widened the
census hole with the same sentence; a third will do it again unless the rule is "a namespace may be
census-excluded only if a named test set-equality-checks that namespace's own membership".

**To resolve:** add a set-equality assertion over
`readdirSync(testDir).filter(n => n.startsWith("waveResume"))` against a literal five-element list,
in this feature's own suite, and (as durable signal) raise the general rule during harvest.

### F-04 (Medium, Local) — the queue-parity suite cites a sentence FSPEC AT-16 does not contain

`waveResumeQueueParity.test.js:9-14` states:

> It does NOT observe a real delegated Phase I resolving a resume record end-to-end through the
> queue; **that gap is named in FSPEC AT-16's own text as structural**, not behavioural
> (REQ-WVR-07-structural) …

FSPEC AT-16 (`FSPEC-pdlc-wave-resume.md:406-411`) reads, in full:

> *Given:* the same feature, plan and record. *When:* run once directly and once through a
> queue-delegated iteration. *Then:* both resolve the same outcome, the same resume point and the
> same provenance, and the queue run's own report states them. *Discriminating arm:* the record
> resolves against the same working directory on both paths — a resume point differing between the
> two fails this test while AT-01..05 all still pass.

There is no residual-gap sentence, no "structural" qualifier and no token `REQ-WVR-07-structural`
anywhere in the FSPEC (`grep -n 'structural' FSPEC-…` returns nothing). `DECISIONS-…:437` makes the
same attribution — "AT-16 carries its own residual-gap sentence" — so the narrowing was decided
(DEC-WVR-07) and recorded, but the disclosure it depends on was never written into the FSPEC.

Two consequences, and only the second is this codebase's to fix:

1. **Upstream.** FSPEC AT-16's text and DEC-WVR-07 disagree about what AT-16 demands. That is a
   defect of the FSPEC, not of the implementation, and I am routing it as an erratum rather than
   folding it into my verdict.
2. **Local.** Shipped test code makes a false, checkable claim about a document in the same feature
   directory. A future reader who follows the citation finds the opposite of what the comment says
   and cannot tell whether the test or the spec is stale. Meanwhile REQ-WVR-07's stated observable —
   "a resume point that differs between a direct and a delegated run of the same feature and plan
   fails this AC" — is unobserved: `PROP-PARITY-01` asserts on the queue module's **source text** via
   regex, and `PROP-PARITY-02` asserts the delegation payload's key set through `queueMain` with a
   spy. Both are honest structural checks; neither runs a delegated Phase I.

REQ-WVR-07 is P2 and DEC-WVR-07 names a re-evaluation trigger, so I am not treating the narrowing
itself as a High gap. **To resolve locally:** rewrite the suite header to cite DEC-WVR-07 as the
source of the narrowing (which it is) rather than AT-16's text (which does not say it), and drop the
invented `REQ-WVR-07-structural` id.

### F-05 (Medium, Local) — the new resume behaviour and its only escape hatch are undocumented for operators

`git diff --stat main...HEAD -- pdlc/OPERATIONS.md CLAUDE.md pdlc/README.md pdlc/RELEASE-CHECKLIST.md`
is empty, and neither `pdlc/OPERATIONS.md` nor `CLAUDE.md` contains the string `pdlc-wave-state` or
`wave ledger`.

From an operator's seat, this feature changes Phase I's default behaviour: a re-invocation may now
silently start at wave 4, or skip Phase I entirely, on the strength of a machine-local file the
operator has never been told about. The recovery action exists and is correct — the run log emits
`Delete .claude/pdlc-wave-state.json to force a full run.` at `orchestrate-dev.js:16308` and `:16319`
— but it is discoverable only from a run that is already behaving unexpectedly, and `forcePhases`
cannot name Phase I at all (`waveExecution.test.js:2609`). An operator who reaches for the mechanism
they know is told it is rejected.

REQ-WVR-04 makes the hatch an owed observable and OQ-1 tracks it as open. `pdlc/OPERATIONS.md` is
this repo's stated home for "the artifact/queue parsing contracts" and Phase I mechanics, and
`CLAUDE.md` routes readers there.

**To resolve:** one paragraph in `pdlc/OPERATIONS.md` under the implementation-waves material — the
record's path, the three outcomes, the five announcement forms an operator will see, and the delete-
to-force-a-full-run hatch — plus a pointer from `CLAUDE.md`'s pdlc section.

### F-06 (Low, Local) — AT-09's re-invocation conjunct is proven by composition, not by its own fixture

REQ-WVR-09 is P0 and its *When/Then* is a **re-invocation**: "the pipeline is re-invoked over the
same feature and unchanged plan … [the wave is] never skipped". `waveExecution.test.js:2679` drives
`main()` once with no `_git`, asserts `ledgerWrites(writes)` is `[]`, and — correctly — pairs that
negative with a positive assertion on the same path (the `verified but NOT committed` notice), so it
is not an absence-only oracle. Good. But the second invocation is never run; the re-invocation half
holds only because `:2898` separately proves that no ledger is a silent full run (IG-6).

Composition is sound and the property is true. It is Low because a reader auditing the P0 AC cannot
see it discharged in one place, and a future edit that made an empty-transport run write a *cleared*
record rather than none would keep both tests green while breaking the AC. AT-18 already demonstrates
the two-invocation fixture shape (`:3060`ff), so the cost is small.

**To resolve:** extend the AT-09 fixture with a second `main()` call over the same record store and
assert the resume point is wave 1.

### F-07 (Low, Local) — the D-10 / OB-F4 baseline oracle is containment, not set-equality

`waveResumeRepoState.test.js:126-144` asserts
`baselineText.includes("M-WVR-1")` and `baselineText.includes("M-WVR-2")` against
`docs/_constraints/pdlc-wave-gate-baseline.md`. The suite labels this "presence-only", and PLAN D-10
does ask only for promotion — so this is within spec, not a violation of it.

The gap is that the check passes on a baseline row that has been emptied of its measured content, or
whose scope has been rewritten to describe a different measurement, as long as the two ids remain as
substrings. `docs/_constraints` baselines are measured records; a promotion oracle that cannot tell a
real row from a bare id gives less protection than its presence suggests.

**To resolve:** assert the two rows' measured fields (or the row's full cell set), not just the ids.

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
