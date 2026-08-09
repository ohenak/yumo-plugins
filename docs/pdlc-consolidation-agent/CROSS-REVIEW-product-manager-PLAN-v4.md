# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-09
**Iteration:** 4
**Scope:** delta re-review of PLAN v1.4 against my v3 findings, changed sections only.
Baseline diff: `d929aab2` (the commit v3 reviewed, PLAN v1.3) → HEAD `d57808ba` (PLAN v1.4),
across two commits — `c323ef05` (ownership, split, serialisation, DoD) and `d57808ba` (§5's
writer-count sentence). Sections unchanged since v1.3 are not re-litigated.

## 1. Disposition of v3 findings

| v3 ID | Severity | Status | Re-measured at HEAD |
|---|---|---|---|
| F-09 | **High** | **Resolved** | §5's manifest now names `pdlc/workflows/__tests__/consolidationBuild.test.js` in the rows for T07 (`:330`), T08 (`:331`) and T33 (`:336`), so the pathspec-scoped wave commit (`pdlc/workflows/orchestrate-dev.js:10187` — `const paths = Array.isArray(task.files) ? task.files : []`, handed to `commitPaths` at `:10194`) now carries each un-skip. Parsed, not read: `parsePlanOwnership` returns `{"taskId":"T07","files":["pdlc/skills/consolidate-learnings/SKILL.md","pdlc/workflows/__tests__/consolidationBuild.test.js"]}` and the same shape for T08 and T33. The resulting same-batch collision is resolved by real edges — `T07.dependencies = ["T12"]`, `T08.dependencies = ["T07"]` — which is the first of the three repairs I named as acceptable. `computeWaves` over the parsed tasks and ownership yields **15 waves with 0 intra-wave file collisions**; T07 lands in wave 8 (with T26), T08 in wave 9 (with T27), T33 alone in wave 15. |
| F-10 | Medium | **Resolved** | §5's `Batch` cells for T07 and T08 now read 5 and 6, and §4's rows read 5 and 6 — I checked both columns by parse, not by eye. §2's derivation rule (`Batch == max(batch of Deps) + 1`) holds for **all 34 tasks with zero mismatches** when evaluated over the parsed graph, which is stronger than the two cells the finding named. |
| F-11 | Low | **Resolved** | §5's cluster row for `consolidationBuild.test.js` now reads `T03 → T10 → T12 → T07 → T08 → T32 → T33` (`:343`) and names the two new serialising edges and the batch sequence 2, 3, 4, 5, 6, 11, 12. Set-equal, both directions, to the seven writers the ownership manifest actually declares for that file. |
| Q-07 | (question) | **Answered** | The `[Docs, review-gated]` label is gone from T07 and T08 (`:286`, `:287`); both now read `[Docs]`. The v1.4 header note states the reason in the terms the question asked: "the label named the *absence* of a test, which no longer holds." |

## 2. Re-measurement of the revision's own claims

The v1.4 note claims "no design change" — only ownership, batching and DoD wording carried forward
from v1.3's discovery. Every load-bearing claim in the changed sections was re-measured before I
accepted it.

| v1.4 claim | Re-measured at HEAD |
|---|---|
| §6.1's self-parse: 34 tasks, 34 ownership rows, `{"ok":true}`, 15 ready-sets, 0 batch mismatches, 0 same-batch collisions | Ran all six. `parsePlanTasks` → **34**; `parsePlanOwnership` → **34**; `validatePlanContract` → `{"ok":true}`; `computeTopologicalBatches` → **15**; §2's batch rule → **0** mismatches over all 34; same-batch file collisions over the declared `Batch` column → **0**. |
| §6.1: `T07.dependencies = ["T12"]` at batch 5, `T08.dependencies = ["T07"]` at batch 6 | Exact, from the parser: `T07 ["T12"] planBatch=5`, `T08 ["T07"] planBatch=6`. T12 is batch 4, so both derive. |
| §6.1: "at v1.3 the same zero was returned over rows that under-declared" | True, and it is the honest way to state it. A collision count over a manifest that omits the file is a zero about nothing; the sentence says so rather than presenting the unchanged number as unchanged evidence. |
| Header note (i): the wave commit is pathspec-scoped and never `-a`, citing `orchestrate-dev.js:10186-10194` | `:10187` is `const paths = Array.isArray(task.files) ? task.files : []`; `:10194` is the `await commitPaths({ paths, … })` it feeds. The cited range contains both ends of the mechanism. The consequence the note draws for T33 — alone in the last wave, so no co-batch owner's pathspec would rescue the edit — matches `computeWaves`, which puts T33 alone in wave 15. |
| Header note (ii): a `describe.skip(` token cannot be half-removed, so one block per green owner | Structurally true of the token, and T03's row now says "**Seven** blocks" and enumerates `T07 — skill prompt` and `T08 — skill prompt` separately (`:248`). The split is what makes §9.4's "a partial un-skip is visible by grep" true rather than aspirational. |
| §8.3's DoD greps "the **sixteen** suites" | Independently re-counted: `grep -o 'consolidation[A-Za-z]*\.test\.js'` over the PLAN, de-duplicated, gives exactly **16** distinct suites. None exists at HEAD (`ls pdlc/workflows/__tests__/ \| grep -c consolidation` → 0), consistent with every one being marked **(new)**. |
| Upstream citations added this round: `TSPEC:166-167`, `TSPEC:2449-2450`, `TSPEC:169` | `TSPEC:166` and `:167` are the two `SKILL.md` rows of §3.2; `:2449` is §12.2's two-`SKILL.md` case, `:2450` the `CLAUDE.md` ↔ manifest case; `:169` is §3.2's `CLAUDE.md` row. All four land where the PLAN says. `skillFiles.test.js:13-17` still declares the hard-coded three-member list (`se-review`, `te-review`, `pm-review`), so §1's "the nearest shipped candidate does not reach them" remains true as stated in the past tense. |
| Every non-**(new)** file named in the changed rows exists at HEAD | Checked each: `.gitignore`, `CLAUDE.md`, `pdlc/RELEASE-CHECKLIST.md`, both `SKILL.md`s, `build-runtime.mjs`, `orchestrate-dev.js`, `nudge-consolidation.sh`, `runtimeBundle.test.js` — all present. `pdlc/workflows/consolidate-learnings.js` is absent, which is correct: T02 declares it **(new)**. |

## 3. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-12 | Low | Local | **§5's re-counted writer census is one file short, and it is the one file the sentence was rewritten to get right.** `d57808ba` corrected "Three further test files carry two or three writers each" to "**Eleven** further test files carry two to four writers each" (`:347`), and re-derives the enumeration that follows. Enumerating multi-writer files from the parsed ownership manifest gives **sixteen**: four in the cluster table above it (`consolidate-learnings.js` 8 writers, `consolidationBuild.test.js` 7, `consolidationRoute.test.js` 4, `runtimeBundle.test.js` 2) and **twelve** below it. The sentence names eleven — `consolidationHookParity`, `consolidationPass`, `consolidationCredential`, `consolidationReport`, `consolidationRung`, `consolidationPredicate`, `consolidationIdentity`, `consolidationParse`, `consolidationEffectiveness`, `consolidationAdvisory`, `consolidationProperties` — and omits `consolidationLifecycle.test.js` (T23 → T31, batches 3 → 10). The omission predates v1.4; what is new is that this round re-derived the count and still returned eleven, so the number now carries the authority of a re-measurement it did not survive. No batch risk follows: T23 and T31 are four batches apart and the collision count is zero either way, which is why this is Low and not gating. The fix is one name and one digit: "Twelve further test files … `consolidationLifecycle` (T23 → T31)". Worth doing because this paragraph is the PLAN's only prose census of shared files, and a containment-shaped census is exactly the oracle shape the rest of this document refuses everywhere else — §5's own cluster table, T03's `T33` block and T05 all insist on set equality. | PLAN §5; PLAN §2 batch-safety rule 2 |

Nothing else in the diff produced a finding. I looked specifically for the two ways a repair of this
shape breaks something adjacent — a batch pushed past a task that depends on it, and a DoD row
rewritten past what the tests actually establish — and found neither.

## 4. Questions

None. Q-07 from v3 is answered in §1 and I have nothing new to ask of this document.

## 5. Positive Observations

- **The repair went to the mechanism, not to the cell I pointed at.** F-09 could have been closed by
  pasting one filename into three manifest rows and arguing about the collision later. Instead v1.4
  took all four consequences the ownership change implies — ownership, block split, serialisation,
  DoD wording — and landed them together. The block split in particular was not in my finding: I
  named the collision, and the author found the deeper one underneath it, that a single
  `describe.skip(` token with two green owners cannot be half-removed, so the first owner to run
  would either red the other's not-yet-landed conjuncts or leave its own case skipped. That defect
  would have surfaced mid-wave, as a red gate with a confusing cause.
- **The serialisation is stated as serialisation and nothing else.** §6.2's new row for `T07 → T12`
  and `T08 → T07` says outright that neither prompt needs anything from the adapter or from the other
  prompt, and that the edges exist to satisfy rule 2 — recorded "rather than left to be re-derived as
  a semantic dependency that does not exist." That is the same courtesy the existing `T12 → T10` row
  extends, and it is what stops a future editor deleting an edge that looks gratuitous.
- **The DoD stopped mis-stating itself, in both directions.** §8.3's heading was "Reviewer-read (no
  executable oracle exists — see §9)" while three of its four rows had gained executable oracles two
  TSPEC versions ago. It now reads "the semantic half, **in addition to** the executable case each
  row already carries", and — this is the part I did not ask for and would have accepted its absence
  — it keeps T12's two rows as the honest exception and says why, and it splits T33's row into the
  half a test decides (the artifact enumeration, by set equality against the manifest) and the half
  no case reads (`RELEASE-CHECKLIST.md`). A DoD that over-claims coverage is worse than one that
  under-claims it, and this revision moved off both errors at once.
- **The self-parse was re-run, and the previous zero was retired rather than reused.** §6.1 could
  have left v1.1's numbers standing — they were still literally true. Instead it re-runs at v1.4 and
  says explicitly that the earlier zero collision count "was returned over rows that under-declared."
  Naming why an old green was uninformative is the same discipline the PLAN applies to vacuous test
  assertions throughout, applied to its own evidence.
- **Scope held in both directions across the diff.** Task count is still 34, ownership is still one
  row per task, `validatePlanContract` is still `{"ok":true}`, and no task in the diff implements
  behaviour REQ does not ask for or drops a P0/P1 obligation. T07 and T08 moved from batches 2 and 3
  to 5 and 6, which costs nothing on the critical path — T33 remains at 12 and the wave count is
  unchanged at 15.

## 6. Errata for upstream documents

**None.** Everything this round touches is PLAN-internal. The three upstream citations added in the
diff (`TSPEC:166-167`, `:2449-2450`, `:169`) were re-read at HEAD and are accurate, and `§9.1`'s
errata table now describes landed state rather than open state, which is what it should say.

## 7. Recommendation

**Approved with minor changes.**

The one High of v3 is closed at the mechanism, not at the symptom: the three un-skipping tasks now
own `consolidationBuild.test.js`, the block they un-skip is split one-per-green-owner, the resulting
collision is serialised by real `Deps` edges, and the whole graph re-parses clean — 34 tasks, 15
waves, 0 batch mismatches, 0 same-batch and 0 intra-wave file collisions, all measured here rather
than read. F-10 and F-11 are closed with them, and Q-07 is answered. Nothing in the diff added
behaviour REQ does not ask for or dropped an obligation.

The single remaining item is Low and does not gate:

1. **F-12 (Low)** — §5's writer census says "Eleven further test files" and names eleven; twelve
   multi-writer files sit below the cluster table. Add `consolidationLifecycle` (T23 → T31) and read
   "Twelve". One name, one digit; the batch-safety property is unaffected either way.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
