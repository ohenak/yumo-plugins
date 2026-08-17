# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.7, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 4
**Scope:** delta re-review of `13cf04b2..20276f36` (REQ v0.6 → v0.7) plus the baseline's
round-3 corrections in `e4caf85e`. Confirms round-3 disposition and looks for new testability
defects inside the changed material only. Unchanged, already-approved sections are not
re-litigated.

Every existing-behaviour claim below was re-derived at HEAD `20276f36`; commands are quoted so
the author can reproduce them.

## Round-3 disposition

| Round-3 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | Medium | **Resolved** | AC-1.4 (`REQ:259-266`) now requires the check rows described in CLAUDE.md's `### Continuous integration` (`CLAUDE.md:66`) and `pdlc/OPERATIONS.md`'s `## Continuous integration` (`pdlc/OPERATIONS.md:57`) to **set-equal** the post-sweep required-check set. Both sections do enumerate rows in extractable form — a six-row table in CLAUDE.md, six backticked bullet leads at `OPERATIONS.md:61-66` — so the set-equality is mechanizable rather than aspirational. Residual, non-gating: F-03 below. |
| F-02 | Medium | **Resolved** | AC-1.7 (`REQ:290-296`) and AC-3.3 (`REQ:335-340`) now name both the mechanism ("transcribed at C-6 re-measurement time… each entry by event and script name") and the referent ("from the sweep's base commit"), and C-6 (`REQ:195-206`) carries the matching obligation for AC-1.3/AC-1.7/AC-3.3 literals with "pre-sweep means that commit, not whatever HEAD is mid-sweep". This is exactly the fix requested and it settles round-3 Q-02 as well. |
| F-03 | Low | **Resolved** | `baseline:72` replaced the prose placeholder with the literal `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` and states why a `docs/*/PLAN-*.md` wildcard was rejected (a future feature's PLAN re-introducing a retired name). Re-derived: the four planning documents in the cell are exactly the four the sweep returns under `docs/PLAN-*`, `docs/design/**` and that literal path. |
| F-04 | Low | **Resolved** | All six `pdlc/OPERATIONS.md` headings in `baseline:50` now match the file byte-for-byte at the quoted line numbers (`:5`, `:57`, `:72`, `:85`, `:128`, `:136` — verified against `grep -n '^## ' pdlc/OPERATIONS.md`). A-1's "Files it covers today" column re-derives exactly: 39 under `docs/completed/**`, 3 under `docs/discarded/**`, 1 decision doc, 7 feature artifacts, and no `LEARNINGS-*`/`POSTMORTEM-*` hit outside the archive. |

Independent re-derivations of new v0.7 material:

- **C-7's green start still reproduces.** `env -u NODE_TEST_CONTEXT npm test` in `pdlc/engine`
  at HEAD: `# tests 842`, `# pass 840`, `# fail 0`, `# skipped 2`, exit 0 — the same numbers the
  REQ cites, and BL-08's new transcript requirement is the right shape to preserve them.
- **M-11n reproduces line-for-line.** Every cited anchor is a real hit at the quoted line:
  `orchestrate-queue/SKILL.md:142,161,165,230,231,240,241`; `orchestrate-dev/SKILL.md:93,97`;
  `consolidate-learnings/SKILL.md:11`. `pdlc/skills/*/SKILL.md` matches exactly three files
  under the sweep's term set, so "the three" is a measured set-equality, not a sample.
- **AC-1.7's hook arithmetic still holds.** `pdlc/hooks/hooks.json` registers five entries
  (`PreToolUse:Bash` harvest guard; `PostToolUse:Write|Edit` scope-field and REQ-size; two
  `SessionStart`), so "minus exactly one entry" leaves four, with the consolidation nudge
  surviving under `SessionStart` — the regression US-04 exists to prevent.
- **AC-1.1 / O-3 no longer disagree about the document of record.** AC-1.1 (`REQ:236-237`)
  pins the branch in the TSPEC and leaves AC-1.3's literal count FSPEC-pinned; O-3
  (`REQ:459-461`) routes the same decision to the TSPEC. One residual wording snag, F-04 below.

## Findings (this round)

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **C-6's new exhaustiveness clause is a good oracle and it is red today: the remainder is 24 paths, not empty.** C-6 (`REQ:199-202`) now requires every path the dependent sweep returns to be classified into an M-row, an M-11 row or an A-1 glob "with the unclassified remainder empty". I ran the baseline's own sweep at HEAD (131 tracked files) and subtracted M-1…M-10 (including all 21 M-8 modules), every M-11 row read at its stated extent, and every A-1 glob. **24 paths survive unclassified**, and they are not exotic: nine `pdlc/workflows/__tests__/*.test.js` modules outside M-8's enumeration that name retired machinery (`advisoryBundle`, `advisoryDisabled`, `consolidationBuild`, `consolidationIdentity`, `consolidationPreflight`, `orchestrateDevSkill`, `runtimeProvenanceWiring`, `waveExecution` — `documentOracles` is M-11f), four `__tests__/helpers/drift*.js` modules and three `__tests__/helpers/bin/*.sh` probes, five fixture files (`fixtures/CODE_REVIEW-pdlc-consolidation-agent-v{5,6}.md`, `fixtures/planParse/plan-workflow-distribution.excerpt.md`, plus the M-11e overflow in F-02), and `pdlc/workflows/{orchestrate-dev,consolidate-learnings}.js`. Reading M-11k's "header prose in the workflow modules" generously to cover the last two still leaves 22. None of these is allow-listed, so each is inside AC-1.2's required-empty search and must be edited or deleted by the sweep. The clause is not wrong — it is the control that catches exactly this — but §1.2 still presents M-11a…M-11n as "the dependents" and R-2 still sizes the risk as "five easy to miss", and a PLAN sized off that framing under-scopes the sweep by roughly two dozen files. Fix: either state in §1.2/C-6 that the M-11 set is the *named* subset and the remainder is enumerated at C-6 time (so the PLAN's task count comes from the sweep, not from M-11's row count), or extend the inventory now. Either way, the re-measurement should emit one path list per row, because M-8's prose enumeration and M-11k's "both READMEs / header prose" cannot be mechanically differenced against the sweep as written. | C-6, §1.2, R-2, M-8, M-11k |
| F-02 | Medium | Local | **M-11e's measured extents are understated, and AC-1.2 leans on them.** AC-1.2 (`REQ:252-254`) argues the two fixture trees need no allow-list because "each is deleted or re-fixtured by the sweep" — a claim whose cost depends on the row's measured size. `baseline:43` records `consumer-ac12/.claude/workflows/` (5 files) and `covered-violations/.claude/workflows/` (1 file). At HEAD the sweep returns **6** files in the consumer-ac12 tree and **4** in the covered-violations tree: `consumer-ac12/README.md` carries `sync-workflows.sh` at `:7` and the bundle/manifest/drift-state names at `:12-14`, and covered-violations also matches at `docs/design/distribution-manifest.json`, `pdlc/workflows/dist/distribution-manifest.json` and `pdlc/workflows/dist/orchestrate-queue.bundle.js`. The three extra covered-violations files matter most: that fixture serves the *surviving* `coveredViolations` oracle, so they are re-fixtured rather than deleted, and a re-fixturing task scoped to "1 file" will leave three retired names behind and red AC-1.2. Fix: re-measure M-11e as tree-wide sweep hits (6 and 4) rather than the `.claude/workflows/` subtree, and say which of the two dispositions applies per tree. | AC-1.2, M-11e |
| F-03 | Low | Local | **AC-1.4's new set-equality binds the rows but not the count word beside them.** `OPERATIONS.md:59` opens "The required-check table — **six checks** across `pr-tests.yml` and `fixture-machine.yml`…" before the six bullets. AC-1.4's conjunct covers "the check rows described"; a sweep that drops a job, updates the six bullets and leaves "six" would pass the row set-equality. This is precisely the failure mode M-11c documents for CLAUDE.md, where the prose **count word** is separately oracle-covered — but OPERATIONS.md has no oracle, so the AC is its only guard. Fix: extend AC-1.4's conjunct to the section's count word and its named workflow files, matching what M-11c already asserts one file over. | AC-1.4, M-11c, M-11l |
| F-04 | Low | Local | **O-3's closing sentence re-opens the document-of-record question AC-1.1 just closed.** AC-1.1 (`REQ:236-237`) says the branch is "pinned in this feature's **TSPEC** … (AC-1.3's literal count stays FSPEC-pinned)". O-3 (`REQ:460-461`) says "Resolved in this feature's TSPEC; AC-1.1's branch is then pinned alongside AC-1.3's literals" — but AC-1.3's literals are, by AC-1.1 and C-6, in the FSPEC, so "alongside" names the wrong document. A test author reading O-3 alone looks for the branch in the FSPEC and finds nothing. Fix: drop "alongside AC-1.3's literals" from O-3, or restate it as "pinned in the TSPEC, while AC-1.3's literals stay in the FSPEC". | AC-1.1, O-3 |
| F-05 | Low | Local | **"Classified into exactly one of" makes a clean partition impossible under A-1 as written.** C-6 (`REQ:200-201`) requires each swept path to fall in *exactly one* bucket, but A-1's globs deliberately overlap: `**/LEARNINGS-*.md`/`**/POSTMORTEM-*.md` is documented at `baseline:69` as covering "none beyond `docs/completed/**`", and at HEAD **4** archived files match both that glob and `docs/completed/**`. Implemented literally, the partition check reds on a clean tree. Fix: state the requirement as "classified by at least one" with an empty unclassified remainder — which is the property that actually matters — and leave the disjointness claim out. | C-6, A-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | BL-08 now requires the transcript to record each suite's counts, which closes round-3 Q-01's substance. Does "each suite" mean a pinned pair (the workflows suite and the engine suite), or whatever the operator happens to run? A transcript naming only one suite satisfies the wording as read. Naming the two suites, and requiring `tests run > 0` and `fail == 0` for each, makes it checkable by someone who was not there. |
| Q-02 | Does the honest engine-suite invocation belong in BL-08 as well as in the FSPEC's AC-1.8 replay set? At HEAD a bare `npm test` in `pdlc/engine` under an inherited `NODE_TEST_CONTEXT` runs zero files and reds the suite-wide assertion; `env -u NODE_TEST_CONTEXT npm test` is the honest one. BL-08 now guards the zero-tests-exit-0 direction but not the polluted-shell red. |

## Positive Observations

- **The round-3 High-risk item — an unfalsifiable "pre-sweep listing" — was closed on both
  axes at once.** AC-1.7 and AC-3.3 now name the transcription mechanism *and* the base commit,
  and C-6 was extended to carry all three literal sets rather than only AC-1.3's. That is the
  stronger of the two fixes I offered, and it means no test author ever derives an expected
  value from an artifact the same sweep is changing.
- **C-6's exhaustiveness clause is the most valuable sentence added this round.** It replaces a
  curated inventory with a set-equality over the sweep's whole output, and it states its own
  evidence ("three review rounds each found a file the curated inventory had missed"). F-01
  reports it red today, which is the clause working as designed — it found 24 files in its first
  exercise, one round after finding three.
- **BL-08 stopped a green from being an absence.** "A run that executed zero tests and exited 0
  is not a green start" is a positive-mechanism conjunct on a gate that would otherwise be
  satisfied by exit status alone; it is also a direct, correct read of a defect first reported as
  a local caveat rather than a REQ finding.
- **M-11n is a measured row, not a sample.** Ten cited anchors across three files, every one
  reproducing at its quoted line, and `consolidate-learnings/SKILL.md`'s disposition stated as a
  rewrite rather than a deletion — the one case where NG-1 and AC-1.2 could otherwise have been
  read as conflicting.

## Recommendation

**Approved with minor changes**

All four round-3 findings are resolved, both round-3 questions are answered inside the document,
and nothing in the v0.7 delta weakened an already-approved criterion: AC-1.1's, AC-1.3's,
AC-1.7's, AC-3.3's and AC-5.2's set-equalities all survive, and AC-1.2's allow-list reasoning
survives the move of its must-survive paragraph into the baseline. The five findings here are
all inside material this round added or amended. F-01 and F-02 are sizing defects rather than
correctness defects — C-6's own re-measurement is the control that resolves them, so they belong
to the FSPEC/PLAN horizon and should be addressed before the PLAN counts tasks, not before the
REQ is approved.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
