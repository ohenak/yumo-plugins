# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.9, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 6

**Scope:** Delta confirm of v0.8 → v0.9 (`f89736fb..fb6e58cf`: baseline corrections
`f82b8e29`, REQ `165fcf7d`, POSTMORTEM-R `fb6e58cf`). The round-5 review approved v0.8
(0 High) and `POSTMORTEM-R-pdlc-plugin-retirement.md` records `RESOLVED: yes`; this round
confirms the prescribed revision landed and re-derives the numbers at HEAD. Nothing settled in
rounds 1–5 is reopened. The diff touches docs only — five files, no code.

## Round-5 disposition

| Round-5 ID | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-29 (`orchestrate-queue.js`'s banner carried no edit obligation) | Medium | **Resolved as prescribed** | M-11i now reads as two obligations: the drift gate plus the banner at `:5`–`:6`. Verified in the tree: `pdlc/workflows/orchestrate-queue.js:5`–`:6` is `Built artifact:          pdlc/workflows/dist/orchestrate-queue.bundle.js` / `Consumer runtime copy:   installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh`, the same two lines as `orchestrate-dev.js:5`–`:6` and `consolidate-learnings.js:5`–`:6`. Ownership stayed single rather than widening M-11o: M-11o names the file only to hand it to M-11i, M-11k's superseded "header prose in the workflow modules" phrase is gone and M-11k now enumerates its four swept paths instead. All three banners carry an obligation and `orchestrate-queue.js` still has exactly one owning class — the choice I recommended, made the way I recommended it. |
| F-30 (`driftGenerators.js`: seven importers, two-class cell) | Low | **Resolved and independently re-measured** | `grep -rn 'driftGenerators' pdlc/workflows/__tests__ \| grep import` returns 14 importing modules; six are M-8 members (`driftBackups`, `driftBaseline`, `driftFault`, `driftHook`, `driftOrdering`, `queueDriftGate`), leaving **eight** survivors — `approvalHash`, `completeness`, `consolidationPreflight` (dynamic import at `:173`), `forcePhases`, `pacingWrapper`, `roundDerivation`, `scanLines` and `helpers/mergeDoubles.js:14`. That is exactly the set M-8 now names, and the row explains why the eighth was missed. The removed surface re-checks: `enumerateLeaves` (`:158`) ← `queueDriftGate` only; `enumerateEvidenceVectors` (`:305`) ← `driftBaseline` only; `genId` (`:351`) ← `driftFault`, `driftBackups`; `genStamp` (`:391`) ← `driftBackups`; `readFaultTokens` (`:495`) ← `driftFault` — every consumer inside M-8's deleted set, as claimed. `C1_PATH` (`:64`) and `MANIFEST_CHAIN_VECTORS` (`:268`) are module-internal, consumed only by `readFaultTokens` (`:500`, `:506`) and `enumerateEvidenceVectors` (`:308`), which is why "removed **surface**" is the right word for the list. The list is marked explicitly non-exhaustive with the TSPEC deriving the reduction from a fresh consumer scan, and the cell in the closure table now reads `M-11p` alone. The three surviving primitives are correct: the only names the eight survivors import are `seeded`, `resolveSeed`, `shrink`. |
| TE F-01 (High) — AC-1.2's term set contradicted AC-1.1 | High (TE) | **Resolved; does not break my v5 verification** | See the partition re-derivation below. Dropping `build-runtime.mjs` and `pdlc/workflows/dist/` removes TE's 12 unowned paths from the criterion's reach without loosening it, because those two names only ever pointed at survivors (M-7 reduced, M-9 required to exist by AC-1.1). |

## Re-derivation at HEAD (`fb6e58cf`)

**AC-1.2's seven-term search.** Run verbatim as the baseline's new section states it:

```sh
grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled' $(git ls-files)
```

returns **132** paths. I rebuilt the claimed union from the M-rows, the M-11 rows and A-1's globs
and diffed both directions: the unclassified remainder is **empty**, so every hit of the reduced
term set is owned. The eight-alternation sweep recipe returns **136**; `comm -23` against the
same claimed union is likewise **empty**. The delta between the two commands is exactly the four
paths the baseline names, and no others — `.claude/pdlc.config.example.json`,
`pdlc/workflows/__tests__/waveExecution.test.js`,
`pdlc/workflows/__tests__/consolidationPreflight.test.js` (all M-11h) and
`pdlc/workflows/dist/consolidate-learnings.bundle.js` (M-10). The "documented superset" claim is
therefore measured, not asserted.

**Partition, 136/136/0/0.** Reconstructed row by row at HEAD, not read off the document: M-rows
**9**; M-8 **24** (18 regex-matched `*.test.js` in the sweep + the 6 dedicated helper files, with
`driftGenerators.js` no longer counted here); M-11a…M-11n **30**, whose per-row breakdown
reproduces the baseline's new line exactly — M-11a 1, M-11b 1, M-11c **0**, M-11d 1, M-11e 10
(6 `consumer-ac12/` + 4 `covered-violations/`), M-11f 1, M-11g 1, M-11h **3**, M-11i 2, M-11j 1
(`.gitignore`; `.worktreeinclude` returns zero hits under both commands), M-11k **4**, M-11l 1,
M-11m 1, M-11n 3; M-11o **2**; M-11p **7**; A-1 the residual **64**. Total 136, remainder 0, no
path claimed twice. The two rows the round moved (M-8 25→24, M-11p 6→7) and the two per-row
figures that swapped (M-11h 4→3, M-11k 3→4) all re-derive, and the total is conserved.

**A-1's growth is the stated one.** The feature directory holds **12** swept files at HEAD
against 9 at `0e86f11a` — the round-5 cross-review pair, the post-mortem, and this feature's own
prior artifacts — all inside `docs/pdlc-plugin-retirement/**`. The REQ's move to pin the **empty
remainder** rather than a total is the right response: the total is a function of how many review
rounds the feature ran, which is not a property of the sweep. `133` survives in the REQ only
inside v0.8's changelog entry, where it is correct as history.

**Fixture extents survive the term-set change.** AC-1.2's "(6 hits, tree-wide)" and "(4 hits,
tree-wide)" annotations at `REQ:308`–`:309` still measure 6 and 4 under the seven-term set, so
TE's round-5 F-02 concern about extents shifting with the terms does not bite.

**Engine gate.** `env -u NODE_TEST_CONTEXT npm test` in `pdlc/engine` prints
`tests 842 / pass 840 / fail 0 / skipped 2` — unchanged from round 5, as expected for a docs-only
diff.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-31 | Low | Local | **One instance of the stale banner count survived the fix.** §2's dependent-set sentence still reads "…the release checklist, the skills, **two live workflow modules** and the instructional docs". Everywhere else the round corrected it — §2's own M-11o parenthetical ("two of the three surviving workflow modules' header banners (the third, `orchestrate-queue.js`'s, sits under M-11i)"), C-5 ("the three workflow modules' header banners (M-11o, M-11i)"), R-2 ("the banners inside three live workflow modules (M-11o and M-11i)") and O-5 ("the three workflow modules' header banners"). The sweep reaches three live workflow modules and all three are owned, so nothing is unassigned — this is the last copy of a number the rest of the document has already moved. Fix: "three". | §2 (dependent-set paragraph) |
| F-32 | Low | Local | **`CLAUDE.md` changed owning row without the disambiguating clause M-11h uses elsewhere.** The per-row line moved M-11h 4→3 and M-11k 3→4, which is correct — M-11k now says "Its four swept paths are `CLAUDE.md`, `README.md`, `pdlc/README.md` and `pdlc/RELEASE-CHECKLIST.md`". But M-11h's prose is unchanged and still reads that the retired values are "documented in CLAUDE.md", with no counterpart to the clause M-11h already applies to `orchestrate-dev.js` ("named here only as the mechanism's location, so no path has two owners"). Ownership is still recoverable, but only from M-11k's side and only by noticing that M-11h enumerates no paths of its own; the measurement backs M-11k, since the run reports zero multi-owned paths. Fix: one clause in M-11h saying `CLAUDE.md` is named there as the values' documentation site and owned by M-11k — the same sentence pattern that already settles `orchestrate-dev.js`. | `baseline` M-11h / M-11k |
| F-33 | Low | Local | **AC-1.2's set-equality is stated over artifact names, but the normative command is over alternations, and the two do not map 1:1.** The criterion now says the term set "**is exactly** … the three retired scripts, the three retired **bundles**, `distribution-manifest`, the drift-state record, and the `distribution.checkEnabled` key" — nine named things — while the command the baseline labels "AC-1.2 term set" carries seven alternations, because the three bundles are reached by the single generic `\.bundle\.js`. Since the point of the rewrite is that adding *or removing* a term fails the criterion, an FSPEC author transcribing the prose literally would pin `orchestrate-{dev,queue}.bundle.js` and `consolidate-learnings.bundle.js` as three terms and get a strictly narrower set than the command that produced the 132/empty result. (No survivor matches `\.bundle\.js` today, so this is a fidelity gap, not a red-search risk.) Fix: name the baseline's fenced seven-alternation command as the literal the FSPEC transcribes, and mark the prose as its gloss. | AC-1.2, `baseline` §"The sweep recipe and AC-1.2's search term" |

## Delta tags

FINDING: Low | delta | local | §2 dependent-set paragraph | "two live workflow modules" is the last uncorrected copy of the count this round moved to three in §2's parenthetical, C-5, R-2 and O-5
FINDING: Low | delta | local | `baseline` M-11h / M-11k | the per-row reassignment of `CLAUDE.md` from M-11h to M-11k landed in M-11k's text only; M-11h still names `CLAUDE.md` without the "named here only as location" clause it gives `orchestrate-dev.js`
FINDING: Low | delta | local | AC-1.2 | the set-equality is stated over nine artifact names while the normative command carries seven alternations (three bundles → one `\.bundle\.js`), so a literal transcription of the prose yields a different set

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- **The prescribed fix was taken, not negotiated.** F-29 offered two ways to give the third
  banner an owner; the revision took the one that preserves single ownership rather than the one
  that widens M-11o, and then propagated the consequence into C-5, R-2 and O-5 rather than
  patching the row alone. F-30's ask for a non-exhaustive marker came back as a rule — the TSPEC
  derives the reduction from a fresh consumer scan — which is a better answer than the corrected
  list I asked for, because it survives an export losing its last consumer between now and the
  sweep.
- **Pinning the empty remainder instead of the total is the durable call.** A-1's
  feature-directory glob grows by one file per review round, so a pinned total was a number
  guaranteed to go stale while the property it stood for stayed true. The document now says so
  explicitly and keeps the commit-anchored totals as evidence rather than as the expectation.
- **The two-command split beats collapsing to one.** TE's round-5 F-02 asked for a single
  command; the revision kept both and made the recipe a *documented superset* with its four
  delta paths and their owners named. That is the stronger resolution: the inventory control
  keeps the widest reach it can get, while the required-empty gate keeps the only property that
  can be enforced without redding on a surviving engine-channel module.

## Recommendation

**Approved with minor changes**

Both round-5 items landed as prescribed and both re-measure independently at HEAD: three
identical banners now carry three edit obligations across exactly two rows with no path owned
twice, and `driftGenerators.js` has eight surviving importers, a non-exhaustive removed-surface
list and a single owning class. The v0.9 term-set change does not disturb what I verified in
round 5 — the seven-term search returns 132 paths with an empty remainder, the eight-alternation
recipe returns 136 with an empty remainder, the delta between them is exactly the four owned
paths the baseline names, and the partition re-derives 136/136/0/0 with the per-row breakdown
matching line for line. The engine gate is unchanged at 842/840/0/2.

The three findings are one stale word, one missing disambiguating clause, and one prose/command
mapping to name. None reopens a settled decision, changes a count, or blocks FSPEC authoring;
all three can land as errata alongside the FSPEC rather than costing another REQ round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
