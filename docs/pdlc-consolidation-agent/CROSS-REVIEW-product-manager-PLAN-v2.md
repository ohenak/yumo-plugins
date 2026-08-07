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

Q-01 … Q-04 of v1 are all answered in the document: Q-01 by the header's upstream-version table,
Q-02 by T20/T21's assignments (the placement I proposed, and the row argues for it rather than
merely adopting it), Q-03 by §8.3's first row, which now says in terms that the grep matches
`describe.skip(` only and that T04's `PY_BIN`-gated `test.skip` is a runtime skip that "must not be
deleted to satisfy it", and Q-04 by §6's transcript, which I reproduced exactly. One question
remains, and it is not blocking.

| ID | Question |
|----|---------|
| Q-05 | T05 is now specified as **red at HEAD** and green only once TSPEC §12.3 gains the three ids (§9.1 erratum 4). I confirmed the premise: §12.3 (`TSPEC:2385-2441`) carries exactly **96** ids and none of `AT-M11`, `AT-Q13`, `AT-R7`. The row's reasoning — that the erratum channel repairs upstream documents after Phase P converges and before Phase I dispatches — is right for errata raised *in this phase*. But §9.1's errata 4 and 5 are raised by the PLAN against the **TSPEC**, which is an upstream document of the phase now converging, so they route this round; that is the ordinary path and it should hold. The question is only about the failure mode if it does not: T05's halt reports the three ids by name, which is the right behaviour — is anything needed beyond that, or is the §9.4 risk row the whole answer? I read it as the whole answer and raise this for the record, not as a change request. |
| Q-06 | When erratum 4 lands, TSPEC §12.3 must assign `AT-M11` → `consolidationPass.test.js` and `AT-Q13` / `AT-R7` → `consolidationRoute.test.js`, or T05's "exactly one file per register id" fails for a new reason. T20 anticipates half of this ("Both AT-M11 halves live in this one file, so T05's … is undisturbed"). Should the §9.1 erratum 4 row name the two target files, so the upstream author edits §12.3 to agree with the PLAN rather than guessing? |

## 4. Positive Observations

- **The revision closed the two High findings at the root rather than at the symptom.** v1.0's
  defect was a transcription of FSPEC v11.1; v1.1 does not merely patch the three ids in — it
  carries the upstream versions in the header, replaces the hard-coded register count with a *read*
  plus a version pin, and raises the two TSPEC defects as errata 4 and 5 instead of absorbing them.
  That is the difference between fixing this instance and making the class detectable, and the new
  §9.4 risk row ("the failure reads *the register moved*, not *the code is wrong*") states the
  intent explicitly.
- **T04's rewrite is the strongest single change in the diff, and it is exactly the oracle-quality
  repair a reviewer hopes for.** The old claim — output byte-identical to HEAD's with the debug
  variable unset — was absence-only *and* vacuous on this repository, and the revision says so with
  the measurement that proves it. The replacement pairs a **positive-identity** fixture (both hooks'
  `additionalContext` equal each other **and** equal the message transcribed from the shipped
  template at that `n`) with a **divergence** fixture (the two must differ, and the edited hook's
  text equals the transcribed message at the *new* `n`, "never whatever HEAD printed"), in one
  block so neither arm can pass vacuously. Expected values are transcribed from the shipped
  template, never read off the implementation.
- **The three newly assigned register ids are specified as pairs, not as extra happy paths.** AT-M11
  is placed beside AT-M3 precisely because the pair *is* the oracle; AT-R7 carries a positive
  control (the degraded promotion that must yield exactly one proposal file) against its two
  negative fixtures; AT-Q13's fixture (b) is named as the arm that stops an unconditional recurrence
  list, and its expected values are transcribed from the fixture LEARNINGS corpus rather than read
  off the produced record. Each of the three is the *negative half* of an acceptance criterion, and
  each is written so the negative cannot pass on an empty world.
- **§6's transcript converts §6's numbers from assertions into a reproducible measurement**, which
  was the point of Q-04, and it volunteers the parser hazard that produced a real defect this round
  (a raw `|` in a description cell shifting `Deps` into `Batch`). That is a process learning stated
  where the next editor will hit it.
- **The `dist/` vocabulary is now defined once and used unchanged in six places**, and it is the
  *shipped* vocabulary (`BUNDLES` / `ARTIFACTS` as `runtimeBundle.test.js` defines them) rather than
  a new one invented for the PLAN — so §8.3's checkbox is mechanically tickable against the suite.
  §9.1 erratum 3 went further than I asked and found that `CLAUDE.md:62`'s "Those three are the
  tracked, shipped outputs" is **already false at HEAD** because `pdlc-cli.mjs` is tracked; I
  confirmed it (`git ls-files pdlc/workflows/dist/` → four paths). T33 now repairs a live error, not
  only a coming one.
- **Scope is still respected in both directions.** No task implements behaviour the REQ does not
  ask for; §6.3 item 2 still holds the hook to advisory-only (env-gated, stderr, `:47-48`
  unchanged); the `plugin.json` version bump is still outside this PLAN's Done. The three new
  register assignments add coverage, not scope: all three land in files that already existed in the
  table, no new task, batch or ownership row appeared, and the gate re-derives 34 / 34 / `{ok:true}`
  with zero batch mismatches and zero same-batch collisions.

## 5. Errata raised against upstream documents

## Recommendation

## Verdict
