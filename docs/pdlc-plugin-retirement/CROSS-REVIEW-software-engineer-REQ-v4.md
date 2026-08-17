# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.7, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 4

**Scope:** Delta re-review of the v0.6 → v0.7 diff (`cd3d9046..HEAD`: REQ at `20276f36`,
baseline corrections at `e4caf85e`). Round-3 findings re-checked against the tree, not against
prose. The one new finding is the first execution of the partition clause this round added.

## Round-3 Disposition

| Round-3 ID | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-22 (three `pdlc/skills/*/SKILL.md` outside the inventory) | High | **Resolved** | Baseline gains **M-11n**, and every line number in it re-derives at HEAD: `orchestrate-queue/SKILL.md` `:142`, `:161`, `:165`, `:230`, `:231`, `:240`, `:241`; `orchestrate-dev/SKILL.md` `:93`, `:97`; `consolidate-learnings/SKILL.md` `:11` — seven + two + one, matching the sweep's 7/2/1 hit counts exactly. AC-1.2 now states the sweep edits all three and that none is allow-listed; C-5 adds "the skill files (M-11n)" as a commit class; AC-2.1's instructional set names them; O-5 carries them; R-2 reads "five" easiest to miss. Q-10 answered explicitly: `consolidate-learnings/SKILL.md:11` is **rewritten** to name the surviving execution path — not allow-listed, not deleted with the skill. |
| F-23 (no clause asserting the sweep's output is fully partitioned) | Medium | **Landed, not yet exercised** | C-6 now reads "**exhaustive, not curated**: every path the dependent sweep returns is classified into exactly one of an M-row, an M-11 row or an A-1 glob, with the unclassified remainder empty". The clause is exactly the right shape. Nobody ran it: at HEAD the remainder is 24 paths — see F-27. |
| F-24 (AC-1.1's `dist/` branch pinned in two documents) | Medium | **Resolved** | AC-1.1 now pins the branch in the **TSPEC** where O-3 resolves it, and leaves only AC-1.3's literal count FSPEC-pinned. One owner per fact. |
| F-25 (pre-sweep green asserted with no committed transcript) | Low | **Resolved** | BL-08 now requires both the engine-path run report **and** a transcript of C-7's green gate-command run, and requires the transcript to record counts because "a run that executed zero tests and exited 0 is not a green start". C-7 cites it. Re-measured under `env -u NODE_TEST_CONTEXT npm test` in `pdlc/engine`: `# tests 842 / # pass 840 / # fail 0 / # skipped 2` — C-7's green-start claim holds at HEAD. |
| F-26 (A-1's "Files it covers today" column wrong) | Low | **Resolved** | Column re-derived and now correct: `docs/completed/**` 39 sweep hits (verified 39), `docs/discarded/**` 3 (verified 3), `docs/pdlc-plugin-retirement/**` 7 (verified 7), the four planning documents enumerated literally. The `docs/{other feature}/PLAN-*.md` prose placeholder is replaced by the literal `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` with a stated reason for not wildcarding — better than what was asked for. A-1's "exactly nine other tracked documents" also re-derives (3 discarded + 1 decision + this baseline + 4 planning docs). |

Q-11 is answered by AC-1.7 and AC-3.3, which now both compare against listings "transcribed at
C-6 re-measurement time, pinned to the sweep's base commit" rather than against replayed history.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-27 | High | Local | **C-6's new exhaustive-partition clause fails on its first run: 24 of the sweep's paths classify into no M-row, no M-11 row and no A-1 glob, and two of them are code that the wave-gate-key deletion class must edit.** Running the baseline's own dependent sweep at HEAD (131 paths) and subtracting every named M-row artifact, M-8's 21-file regex, every M-11 row's named paths and every A-1 glob leaves 24: `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/consolidate-learnings.js`, eight `__tests__/*.test.js` files outside M-8's regex (`advisoryBundle`, `advisoryDisabled`, `consolidationBuild`, `consolidationIdentity`, `consolidationPreflight`, `orchestrateDevSkill`, `runtimeProvenanceWiring`, `waveExecution`), seven M-8 helper modules (`helpers/drift{Fixtures,Generators,Harness,Probe}.js`, `helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh`), four tracked fixture files, and three fixture documents. The consequence is not paperwork. M-11h retires the wave-gate keys and C-5 makes them a commit class, but the keys are *implemented* in `pdlc/workflows/orchestrate-dev.js` — `postWavePathspecs` at `:168` (defaults), `:218`–`:245` (parse and validate) and `:14416` (the only consumer) — and pinned by `__tests__/waveExecution.test.js` (`:182`, `:208`–`:216`, `:260`–`:277`, and the `Phase I: postWaveCommand and postWavePathspecs` block at `:813`). No row names either file, so a maintainer working the inventory deletes the example-config keys, leaves live parsing code and a green suite asserting the retired keys still parse, and AC-1.2's required-empty search then fails on a *surviving engine-channel module* — this is the module vendored into `@kaneho/pdlc-engine`, not a doc. `pdlc/workflows/consolidate-learnings.js:5`–`:6` is the same shape at smaller scale. Also falsified as written: AC-1.2's "A-1 is complete over the tracked documents carrying these names at the 2026-08-17 measurement" — `pdlc/engine/__tests__/fixtures/consumer-ac12/README.md`, `__tests__/fixtures/CODE_REVIEW-pdlc-consolidation-agent-v{5,6}.md` and `__tests__/fixtures/planParse/plan-workflow-distribution.excerpt.md` are tracked, carry the names, and are neither allow-listed nor named by any row. Fix: run the partition once now and land its result — the code-bearing paths as inventory rows (at minimum `orchestrate-dev.js` and `waveExecution.test.js` under M-11h, since they change what that commit class costs), the fixture paths under M-11e or A-1 — so that C-6's remainder is empty at the commit the REQ ships against rather than first measured mid-sweep. | C-6, AC-1.2, C-5, §1.2 (M-11h) |
| F-28 | Medium | Local | **M-8's measured size and M-11e's tree scoping both undercount their own classes, so two C-5 commits are larger than the REQ says.** M-8 is measured as "21 files / 15,109 lines" of `*.test.js`, but those 21 files do not run alone: `helpers/drift{Fixtures,Generators,Harness,Probe}.js` and `helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh` exist only to serve them and all seven carry retired names — they die with M-8 and are outside its stated count. M-11e names "tracked trees … `consumer-ac12/.claude/workflows/` (5 files)" and "`covered-violations/.claude/workflows/` (1 file)", but the sweep also returns `consumer-ac12/README.md` and three files under `covered-violations/` outside `.claude/workflows/` (`docs/design/distribution-manifest.json`, `pdlc/workflows/dist/distribution-manifest.json`, `pdlc/workflows/dist/orchestrate-queue.bundle.js`) — the fixtures are *repo-shaped*, so scoping the row to the `.claude/workflows/` subtree leaves the rest of each fixture asserting a world that no longer exists. Fix: restate M-8's size to include its helper set, and scope M-11e to the fixture roots rather than the `.claude/workflows/` subtree. This is a subset of F-27's remainder, filed separately because it is a measurement correction with no branch-choice in it. | §1.2 (M-8, M-11e), C-5 |

## Delta Tags

FINDING: High | delta | local | C-6 / AC-1.2 | this round's partition clause, run at HEAD, leaves 24 unclassified sweep paths; two are code the wave-gate-key class must edit (orchestrate-dev.js postWavePathspecs, waveExecution.test.js)
FINDING: Medium | inherited | nonlocal | baseline M-8 / M-11e | M-8's 21-file size excludes its 7 helper modules; M-11e scopes to the `.claude/workflows/` subtree while 4 more fixture files outside it carry retired names

## Questions

| ID | Question |
|----|---------|
| Q-12 | Is `postWavePathspecs` in scope at all? It is a generic "stage these pathspecs after the wave command" mechanism whose only *current* value is `["pdlc/workflows/dist/"]`. M-11h retires it as a wave-gate key, but a mechanism with no remaining caller is a different disposition from a mechanism whose caller went away — and if the probe-CLI build step survives under O-3, it may have a caller again. The answer decides whether F-27's `orchestrate-dev.js` edit is a deletion or a no-op. |

## Positive Observations

- M-11n is the strongest row in the baseline: every one of its ten line references re-derives at
  HEAD, and its hit counts match the sweep exactly. It also states a disposition rather than a
  location, which is what made Q-10 answerable in one sentence.
- C-6's partition clause is the right durable fix, and its wording ("classified into exactly one
  of…, with the unclassified remainder empty") is a check, not an intention. F-27 exists *because*
  the clause works — it named 24 files three rounds of manual reading did not.
- BL-08's transcript requirement now encodes the vacuous-green hazard directly ("a run that
  executed zero tests and exited 0 is not a green start") instead of trusting an agent's report.
  That is the measurement lesson landing in an artifact obligation.
- A-1's refusal to wildcard `docs/*/PLAN-*.md`, with the reason written into the cell, is a
  deliberate narrowing that keeps a future feature's PLAN from being silently exempted.

## Recommendation

**Needs revision**

The round-3 High is genuinely closed, and closed in the tree rather than in prose — M-11n's line
numbers, hit counts and the `consolidate-learnings` disposition all re-derive. Both Mediums and
both Lows are closed too, and C-7's green-start claim now verifies at 842/840/0/2 under a clean
environment. Strategy, sequencing and the evidence gates remain out of question and are not
re-litigated.

The one High is the partition clause's first result. It is a different finding from F-22's class,
not a fourth repetition of it: the mechanism now exists and it fired. What it found is that the
sweep reaches surviving *code* — the engine-channel `orchestrate-dev.js` and the `waveExecution`
suite that pins the wave-gate keys — which changes what the M-11h commit class costs and makes
AC-1.2 unsatisfiable if that class is worked from the inventory as written. Running the partition
once now, and landing its 24 rows, closes this permanently; the remaining rounds should not need
to look for a twenty-fifth file by hand.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
