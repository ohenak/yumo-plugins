# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** delta re-review of PLAN v1.1 against my v1 findings (F-01 … F-07), plus a
changed-sections-only scan for new defects. Baseline for the diff: `abbc1f36`, the last commit to
the PLAN before v1 was written; head of the diff: `1682227b`. Unchanged sections approved at v1
were not re-litigated.

## 1. Disposition of the v1 findings

Every repair was re-measured on the working tree at `feat-pdlc-consolidation-agent`; none was
accepted on the revision's word.

| v1 | Severity | Status | Re-measured |
|----|----------|--------|-------------|
| F-01 | High | **Resolved** | `AT-M11` is assigned to T20 in **both** halves (`markerVerdict` returns `free` on the two `RELEASED:` fixtures in the `T28 — marker predicates` block; the pass-level arm beside AT-M3 in the `T31` block), and `AT-R7` / `AT-Q13` to T21's `T31 — routes end to end` block. I enumerated all **99** ids in FSPEC §13 (`:2041-2191`) and checked each against the PLAN: the 37 that do not appear literally are all interior members of the eight ranges the table already states (`AT-A1 … AT-A7`, `AT-C2 … AT-C8`, `AT-F6 … AT-F18`, `AT-K1 … AT-K7`, `AT-L1 … AT-L5`, `AT-M1 … AT-M6`, `AT-N1 … AT-N4`, `AT-R1 … AT-R5`). **No register id is now without a task.** The three new rows are faithful transcriptions, not placeholders: T20's "two fixtures, one seconds old and one older than `staleLockMinutes`, neither recording `reclaimed-stale-lock` nor `consolidation-in-progress`" is FSPEC `:2085` verbatim in substance; T21's AT-Q13 three body obligations over fixtures (a)/(b) match `FSPEC:2126`; T21's AT-R7 three fixtures — `promoted` with no §5.3 cause, `no-op` all-suppressed, and the degraded positive control — match `FSPEC:2106` including the reason (b) sits beside (a). |
| F-02 | High | **Resolved** | T21 no longer carries the two "(no FSPEC AT)" labels; it states the retirement and cites `FSPEC:19-20` (exact — the erratum note is at `:19`) and FSPEC §15's `:2320` / `:2312` (both exact). The three "(no FSPEC AT)" strings that remain in the PLAN are genuine: T04's pathspec case, T20's two enumerated obligations (i)/(ii), and T24's ER-6 discriminator — none has a register id. T05 is no longer self-contradictory against its own gate: it now reads the count rather than transcribing it, and the row states its precondition (see §4). |
| F-03 | Medium | **Resolved** | T05's hard-coded `96` is gone. The row now says "**The count is read, never hard-coded**", records **99** as the measurement of record at FSPEC v11.3, and adds a version pin (FSPEC `11.3`, TSPEC `1.7`) plus a non-vacuity floor. §8.3's DoD row follows suit. I re-enumerated FSPEC §13 `AT-…` tokens de-duplicated: **99** — exact. |
| F-04 | Medium | **Resolved** | §1 now reads "`git ls-files 'pdlc/workflows/__tests__/*.test.js' \| wc -l` returns **83** at HEAD (83 on disk too)" and "`ls … \| grep -c '^consolidation'` returns **0**". Both re-run: **83** tracked, **83** on disk, **0** consolidation matches. The load-bearing half is now stated as load-bearing. |
| F-05 | Medium (Cross-Feature) | **Resolved** | Both `DC-07` citations are gone. T25 and §6.3 item 1 now state the hazard directly — `fakeListFiles` returns whatever the fixture hands it while `rtListFiles` transports `ls -p -A \| grep -v '/$'` (`runtime-adapter.js:915`) and rejects any line carrying a separator (`:929-931`) — and explain the omission by naming this repo's DC-07 (`DOMAIN-CONSTRAINTS.md:184`, "Work that skips a pipeline phase inherits zero review coverage") and the header caveat at `:11-16`. Both citations re-read and exact. |
| F-06 | Low | **Resolved** | §1 now fixes the vocabulary once — `BUNDLES` two members today / three after T32, `ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]`, five `dist/` files, four manifest rows — and §8.3, §6.2, §9.4, T32 and T33 all use it. Re-measured: `git ls-files pdlc/workflows/dist/` returns **four** paths and `distribution-manifest.json` carries **three** `id` rows (`orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`), so "three at HEAD → four after T32" is exact; `runtimeBundle.test.js:26` and `:1584` are exact. |
| F-07 | Low | **Resolved** | `fakeSleep` now carries `:258` — exact (`mergeDoubles.js:258`), and the row's six names now map to six lines in order. T01's citation now reads `package.json:18`, "whose three members run `:19-21` and whose array closes at `:22`" — exact. |

## 2. New findings

Scope of this scan: the changed sections only — the header's upstream-version table, §1's rewritten
overview and vocabulary paragraph, T01, T04, T05, T09, T20, T21, T25, T32, T33, §4.2's preamble,
§6's gate-transcript paragraph, §6.1's two new edges, §6.2, §6.3, §7's new `BUNDLES`/`ARTIFACTS`
row, §8.1's counting paragraph, §8.3's five rewritten rows, §9.1's errata 2–5 and §9.4's two rows.
Every count and citation introduced by the revision was re-run.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-08 | Low | Local | **§8.1's new counting paragraph contradicts the table directly above it.** §8.1 (`:434-436`) closes "…+ `consolidationReport`, which is split across L1 and L2 and so **is named in neither row's list**". The table names it in **both** rows — L1 (`:428`) ends "(+ the L1 half of `consolidationReport`)" and L2 (`:429`) ends "(+ the L2 half of `consolidationReport`)". The arithmetic is right and I verified the total independently: `grep -o 'consolidation[A-Za-z]*\.test\.js'` over the PLAN, de-duplicated, returns exactly **16** distinct suites, and §5's manifest owns all sixteen. So the number is sound and the sentence explaining it is not; "named only parenthetically, and so counted in neither row's five" would say what is true. Worth repairing only because this paragraph exists to let a reader re-derive the 16 without trusting it, and as written the re-derivation stalls on a false premise. | — (method) |

Nothing else. In particular, the four claims a revision of this kind most often gets wrong were
re-measured and all hold:

- **The repo-state claim that justifies T04's rewrite.** §6.3 item 2 and T04 assert the old
  byte-identity oracle was vacuous *on this repository* — "HEAD pending 1 of 2, widened 3 of 5,
  both under `THRESHOLD = 5`". I re-ran the shipped hook's own predicate against
  `docs/_decisions/.consolidation-log.md`: HEAD's globs give **1 of 2** pending, the widened globs
  **3 of 5**. Both below 5, so both hooks print nothing and identity did hold for the wrong reason.
  The claim is exact, and it is the reason the replacement is a genuine strengthening rather than a
  restatement.
- **The Phase-P gate transcript (§6, answering my Q-04).** I imported the four exports from
  `pdlc/workflows/orchestrate-dev.js` and applied them to this PLAN:
  `parsePlanTasks` = **34**, `parsePlanOwnership` = **34**, `validatePlanContract` = `{"ok":true}`,
  `computeTopologicalBatches` = **15**, batch-column mismatches = **0**, same-batch file collisions
  across §5 = **0**, `T25.dependencies` = `["T09","T13","T14","T19"]`. Every figure in the new
  paragraph is exact.
- **The two new §6.1 edges.** T25 → T19: T25's pre-existing closure is `{T09, T13, T14, T04, T02,
  T01, T00}` — exactly the set the row names — and T19 is not in it, so the edge was genuinely
  undeclared. T31 → T06/T20/T21/T22/T24: each of the four stated paths (T30 → T11 → T06;
  T30 → T29 → T28 → T20/T21; T30 → T22; T29 → T24) resolves against the parsed graph.
- **T32's prelude arithmetic.** `build-runtime.mjs:87` declares `devModule`'s export list; it
  already publishes `resolveAdvisoryRung` and the queue prelude already re-binds it at `:119`, so
  "four prelude lines, three new export names (`MERGE_GUARD_DEFAULTS`, `mergeCommandFor`,
  `gitWithLockRetry`)" is right — none of those three is in the list today.

## 3. Questions

## 4. Positive Observations

## 5. Errata raised against upstream documents

## Recommendation

## Verdict
