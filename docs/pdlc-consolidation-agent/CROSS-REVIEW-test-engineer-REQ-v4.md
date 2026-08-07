# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 4
**Scope:** Local (Scope tags per finding below)
**Delta base:** `0b03f4d` (the tree v3 reviewed) → HEAD

Delta re-review. v3's findings F-23…F-28 are dispositioned in §Prior findings; new findings are
numbered F-29 onward so ids never collide across rounds. Only the eight commits that touched the REQ
since `0b03f4d` were read for new issues; unchanged sections approved in v1–v3 were not revisited.

## Prior findings

All six v3 findings are resolved. Each resolution was re-verified against the code the revision now
cites, not against its prose.

| v3 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-23 | High | **Resolved** | REQ-CONS-01 now carries "What is in that file at HEAD, and the migration rule" and states the predicate over **two** regions: inside a `<!-- pdlc:consumed {passId} -->` block, **or** anywhere in the *legacy region* — the text preceding the file's first `<!-- pdlc:consumed` marker. Every factual claim in that paragraph checks out: `docs/_decisions/.consolidation-log.md` exists, its `## Pass 1 — 2026-07-29` records the consumed set as a two-column table of full paths (`docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md \| 2026-06-02` and the same shape for `docs/pdlc-workflow-distribution/…`), it carries no `<!-- pdlc:consumed` marker and no row status ("Promoted" appears only as a section heading). The rule is **total** over any log (a log with no block is legacy region entire), and the boundary is frozen by construction because NFR-5 now requires the consumed block to be appended *before* any other record the pass writes — so no record this feature introduces can ever land in the legacy region. That closes the hazard the delimited block was introduced for without reopening the substring hazard. Migration needs no transcription and no parse of Pass 1's prose. |
| F-24 | High | **Resolved** | "The empty-datum case, decided" names both empty states (no log file; a log like HEAD's whose rows predate the status convention), picks **elapsed**, and states the observable trio: the pass runs, trigger `cadence`, reason code `no-cadence-datum`, and that row becomes the datum. AC-1.1 carries the branch inline, §4b carries the code with its permitted-status set, and the rejected reading is stated with its consequence ("empty-means-not-elapsed makes cadence unreachable"). A fixture author now has one expected value for the most common initial state. |
| F-25 | Medium | **Resolved** | Step 1's corpus is now `docs/*/LEARNINGS-*.md` **and** `docs/completed/*/LEARNINGS-*.md`, with the depth-1 limitation of `nudge-consolidation.sh:28` named as the reason, and `docs/discarded/*/` excluded on a stated ground ("abandoned work is not evidence about a delivered pipeline"). §5 adds `:28` to the in-scope edits, which is exactly the consequence the finding asked to be carried. The "on this repo today" arithmetic is correct as written: the widened glob matches **5** files (`docs/orchestrate-dev-workflow/…`, `docs/pdlc-advisory-tier/…`, `docs/completed/{pdlc-merge-phase,pdlc-review-loop-hardening,pdlc-workflow-distribution}/…`), two of which are named in the legacy region, leaving 3 un-consolidated — below the `volumeThreshold` of 5 at `nudge-consolidation.sh:25` (verified: `THRESHOLD = 5`), so the first tick does reach the cadence test and then the F-24 bootstrap. The two `docs/discarded/` LEARNINGS are correctly outside the count. |
| F-26 | Medium | **Resolved as scoped** | §4b now carries a pipeline-phase-id row enumerating 13 ids, and every citation in it resolves: `PHASE_DISPATCH` holds exactly `R, F, T, D, P, PR, CR, DOD` (verified by key scan), and the five `recordPhase` literals are at the lines given — I `:10020`, PT `:10250`, H `:10407`, PUB `:10462`, MERGE `:10568`. AC-5.2's partition is stated and its union is set-equal to that catalogue. The residual is that the two halves are **not** disjoint as claimed — see F-29. That is a narrower defect than F-26 was, and inside F-26's own answer. |
| F-27 | Medium | **Resolved** | The permitted-status sets are now derived from a stated rule — "a code is legal with every terminal status still reachable after the point in the pass at which the code is recorded" — rather than from the status the code was first introduced under. `duplicate-suppressed` gains `promoted-degraded` with the composed scenario spelled out; `no-advisory-corpus` / `advisory-corpus-empty` gain `failed` with the ordering argument (corpus read before AC-3.5's or AC-1.6's failure is decidable). I re-derived every row against the rule: the four AC-3.5 codes correctly stop at `promoted-degraded`/`no-op` (AC-3.8b says `writes-uncommitted` never changes the terminal status, so no `failed` is reachable after a fallback), and `refused`/`skipped-cadence` are pinned explicitly. The rule is the durable part — it is what makes a future row derivable rather than guessed. |
| F-28 | Low | **Resolved** | AC-3.5 row 1 now records `credential: absent`, set-equal to AC-4.2/NFR-2/§4b's closed three-value set. |

Q-09 is answered by AC-3.8b's rewrite: the pass retries the `index.lock` class as `commitPaths` does
(`gitWithLockRetry`, `orchestrate-dev.js:8670` — verified), a commit that still fails leaves the writes
uncommitted, **does not change the terminal status**, and records reason code `writes-uncommitted`
(new §4b row). That is a positive observable, not a silence.

## Findings

Both blocking findings are in text this round introduced, and both are of a class §5a names as
belonging **here**: F-29 is a claim about code at HEAD that the shipped code falsifies; F-30 is two
ACs naming contradictory observations for the same reachable run, which fails §5a's own bar ("every
acceptance criterion names *what is observed and where*"). Neither is a fixture or oracle-mechanics
question, and neither re-opens a settled point. Both are one-line fixes.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-29 | Medium | Local | **`CR` is in both halves of AC-5.2's phase partition, so the "disjoint" claim is false against shipped code and one reachable fixture has two expected values.** The new partition sentence reads: "**decidable** = R, F, T, D, P, PR (row 1), DOD (row 2), plus whatever `{phase}` row 3 names verbatim; **undecidable** = I, PT, CR, H, PUB, MERGE. The two sets are disjoint and their union is set-equal to the catalogue." Row 3 is `POSTMORTEM-{phase}-{feature}.md` → "that `{phase}` verbatim", cited to `orchestrate-dev.js:5429`. That path is `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md` inside the shared review loop, and **Phase CR runs that loop with `phase: "CR"`** — `reviewLoop({ doc: docs/${featureName}/, phase: "CR", … })` at `orchestrate-dev.js:10255-10256`, halting through the same non-convergence path. So `POSTMORTEM-CR-{feature}.md` is a producible artifact, and harvest folds POSTMORTEM basenames into the `Harvested from` row the mapping reads (`orchestrate-dev.js:7570`; CLAUDE.md, "LEARNINGS-{feature}.md — … the record of which `CROSS-REVIEW-*` / `CODE_REVIEW-*` / `POSTMORTEM-*` files harvest deleted"). Consequence, stated as the fixture: a consumed LEARNINGS whose `Harvested from` names `POSTMORTEM-CR-{feature}.md`, and a promotion recorded against `phase: CR`. Row 3 decides CR **exercised** → the verdict is `prevented` or `recurred`; the partition sentence puts CR in the undecidable half → "counts as **not** exercised" → `insufficient-evidence`, which AC-5.5 then ages into `unmeasurable` after 3 passes. A set-equality test transcribed from this paragraph (decidable ∩ undecidable = ∅) fails on the real catalogue. The other five undecidable ids are safe — I, PT, H, PUB and MERGE reach `recordPhase` but never `reviewLoop`, so no POSTMORTEM can name them — which is why CR is a genuine defect and not a general infelicity. Fix: move CR out of the undecidable list and say it is decidable **only** via row 3 (a `POSTMORTEM-CR-*`), undecidable otherwise; or state the precedence (row 3 wins over the undecidable list) and drop the disjointness claim in favour of "union set-equal, row 3 takes precedence". Either makes the partition checkable. | AC-5.2 ("The phase observable, named"), §4b phase-catalogue row |
| F-30 | Medium | Local | **AC-1.3's new Commits column says a `refused` pass "wrote nothing"; AC-7.2 says it writes a log row. The concurrent-tick case — the one AC-1.3 exists for — therefore has two expected values.** The new column reads `\| refused \| no \| no \| **no** — it wrote nothing \|`. But AC-7.2's exemption set is exactly one member: "Given a pass completes on any path **other than `skipped-cadence`**, Then exactly one report is emitted … written as the pass's row in `docs/_decisions/.consolidation-log.md`". `refused` is such a path — AC-1.3 itself says the second pass "exits with status `refused`". The REQ asserts the row's existence in a third place: REQ-CONS-01's cadence-datum paragraph says "A `refused` row is not a datum (that pass did no work)", which presupposes the row. And `.consolidation-log.md` is inside AC-3.8b's commit pathspec set (it is listed there, citing AC-7.2 among others), so if the row is written it is committed. Two further cells inherit the contradiction: §4b's `credential:` row permits "any status that writes a row" and AC-4.2 requires "every pass's log row carries exactly one `credential:` field" — a `refused` pass never read a credential, so that field has no defined value; and §4b's trigger row has the same shape. This is not cosmetic: the test is "two `/loop` ticks race, the loser exits `refused`", and the assertion is either (a) the log gained exactly one row with `status: refused`, `consolidation-in-progress`, some `credential:` value, and one new commit touching `.consolidation-log.md`, or (b) the log and the index are byte-identical to before. Those are incompatible, and an implementer picks one silently. Decide it in AC-1.3's Commits cell and, if `refused` does write a row, give AC-4.2 the value that row's `credential:` field carries. (The `failed` cell's "yes, if it wrote anything; otherwise nothing to commit" has the same origin — under AC-7.2 a completed `failed` pass always wrote its row, so the hedge is unreachable and the cell should be plain `yes`.) | AC-1.3 (Commits column), AC-7.2, AC-4.2, §4b |
| F-31 | Low | Local | **§4b's `PHASE_DISPATCH` line range is off at both ends and truncates the last key it is cited for.** The catalogue row cites "`PHASE_DISPATCH` (`orchestrate-dev.js:3337-3431`) for R/F/T/D/P/PR/CR/DOD". At HEAD the declaration is `export const PHASE_DISPATCH = {` at `:3336` and the object closes at `:3437`; `DOD:` opens at `:3431`, so the cited range excludes the declaration line and cuts DOD off at its first line. A reviewer re-deriving the eight-key set from the cited bytes reads seven complete keys and a fragment. The eight ids are named in the same cell, so the enumeration is recoverable — hence Low, not Medium — but this is the one citation in the row that does not survive checking, and the row's whole purpose is to be the set-equality source. `:3336-3437`. | §4b phase-catalogue row |
| F-32 | Low | Local | **The `CODE_REVIEW` naming citation moved from an always-live classifier to a failure-path line inside the advisory-tier block.** AC-5.2's mapping row 2 now cites `orchestrate-dev.js:10349` as the "Shipped naming" authority for `CODE_REVIEW-{feature}-v{N}.md`. That line does construct the path verbatim, but it sits inside `if (!dodResult.passed)` (`:10339`) as the A3 advisory seam's preamble (`:10345-10348`: "A3 fires immediately before the pre-existing halt"), i.e. it is reached only when the DoD loop has already failed, and its purpose is a feature the REQ itself documents as shipping **disabled** (REQ-CONS-06's availability paragraph). Its two sibling rows cite unconditional construction sites (`reviewTargetPath` `:5799`, `postmortemPath` `:5429`), and the previous revision cited `artifactClassOf`'s `/\/CODE_REVIEW-[^/]*$/` test at `:6423`, which also always runs. The always-taken construction site is the dod-verify prompt, `:7911` (and `:7941`, `:7951`). Cite one of those so all three rows in the table have the same evidentiary weight. | AC-5.2 mapping table, row 2 |

## Questions

v3's Q-09 is answered in full (see §Prior findings). One new question, non-blocking, and deliberately
*not* filed as a finding because AC-1.3's Commits cell appears to settle it already:

| ID | Question |
|---|---|
| Q-10 | NFR-5 requires the consumed block to name "**exactly** the consumed set — neither more nor fewer" and to be appended before any other record, which is what freezes the legacy-region boundary. AC-1.4's first cause is a pass whose un-consolidated set is **empty**, and AC-1.3's Commits row for `no-op` says "the log row **and consumed block** are still writes" — which I read as: an empty consumed set still emits an empty `<!-- pdlc:consumed {passId} -->` block. That reading matters, because if the first pass on a repo is an empty `no-op` and it writes *no* block, its log row (and any AC-5.1 failure-mode record whose `artifact` field is a LEARNINGS path) lands in the legacy region and falsely marks that file consolidated — precisely the hazard the block exists to prevent. Is the empty-block emission intended, and is it worth one clause in NFR-5 rather than being inferred from AC-1.3's table cell? |

## Positive Observations

- The legacy-region rule is a better answer than F-23 asked for. Every option I offered required
  either a migration write or a parse of Pass 1's prose; the revision found a third that requires
  neither and is **total** over any log, then made it self-maintaining by ordering the block write
  first. "Frozen by construction" is doing real work there — the boundary cannot drift because
  nothing this feature writes can precede it.
- The empty-datum decision was made in the direction that keeps the mechanism reachable, and the
  rejected alternative is stated with the failure it produces. A REQ that records why it did *not*
  choose the other branch is one a later reader cannot silently reverse.
- §4b's composition rule is the durable half of F-27's fix. The finding asked for corrected cells;
  the revision supplied the rule that derives them ("legal with every terminal status still reachable
  after the point at which the code is recorded"), which means the next reason code added does not
  need a reviewer to catch the same error again. I re-derived all fourteen reason-code rows against
  it and only the `refused`-writes-a-row question (F-30) is unsettled — and that is an AC-1.3/AC-7.2
  disagreement, not a §4b one.
- The corpus widening carried its own consequence into §5 without being asked twice: `:28` is now an
  in-scope edit, `docs/discarded/` is excluded on a stated ground rather than by oversight, and the
  "on this repo today" paragraph gives a first-run test its expected values — 5 matched, 2 legacy-
  consolidated, 3 pending, below threshold, cadence path. I verified all four numbers against the
  tree; every one is right.
- AC-3.8b's `commitQueueRow`-over-`commitPaths` argument is the strongest piece of new reasoning in
  this round. It does not merely pick a precedent — it says why the obvious one is wrong (`commitPaths`
  commits with no pathspec, `orchestrate-dev.js:8690`, which would sweep a mid-pipeline staged index
  into the pass's commit) and cites the two-call shape that does hold (`orchestrate-queue.js:1576`,
  add `:1577`, commit `:1580-1585`, mirrored at `:1615`). Verified line by line; all four resolve.
- "Where those commits go, stated" closes the abandonment hazard **by construction rather than by
  policy** — promotions and the consumed block in one commit, so a discarded branch loses both
  together and "consumed while the promotion is lost" is unreachable. That is a structural argument a
  test can be written against, not an assurance.
- Compression did not cost citations. This round removed ~200 lines of prose to get under the size
  budget, and I re-checked every `file:line` in the changed text (`resolveAdvisoryRung` `:1833` and
  its doc comment `:1800`, `orchestrate-queue.js` `:1243-1244`/`:1245-1256`, `gitWithLockRetry`
  `:8670`, `commitPaths` `:8669`/`:8690`, `nudge-consolidation.sh` `:25`/`:28`/`:41`, the five
  `recordPhase` literals, `checkPostmortem` `:5429`). Only two are imprecise (F-31, F-32) and neither
  changes a claim. Nothing was quietly dropped to make room.

## Recommendation

**Needs revision** — 0 High, 2 Medium, 2 Low. All six v3 findings are resolved, including both
Highs, and the two remaining blockers are one-line corrections inside the structures this round
added.

I applied §5a's stopping rule as written. It does not license approval, but it is close: there are no
Highs left, no claim about the shipped architecture is wrong, and neither Medium contests user need,
scope, priority or phasing. F-29 is the second bullet of §5a's belongs-here list — a false claim
about code at HEAD: `POSTMORTEM-CR-{feature}.md` is producible (`orchestrate-dev.js:5429` reached
from the Phase CR `reviewLoop` call at `:10255-10256`) and is harvested into `Harvested from`, so
row 3 of AC-5.2's own mapping decides `CR`, while the partition sentence three lines below declares
`CR` undecidable and the two sets disjoint. F-30 is the same defect class turned inward: AC-1.3's new
Commits column and AC-7.2 give opposite answers for the `refused` pass, and REQ-CONS-01's
cadence-datum paragraph sides with AC-7.2 ("a `refused` row is not a datum"), so the document
outvotes itself two to one. Neither is a fixture question — an FSPEC author facing "two ticks race"
or "a consumed LEARNINGS names `POSTMORTEM-CR-*`" must invent the answer, and inventing it downstream
is how a REQ's enumeration stops being normative.

What must change:

1. **F-29** — make AC-5.2's partition true. Either move `CR` out of the undecidable list and say it
   is decidable only via a `POSTMORTEM-CR-*` (row 3), or keep the list and state that row 3 takes
   precedence, replacing the disjointness claim with a precedence rule. I, PT, H, PUB and MERGE need
   no change — none of them can appear in a POSTMORTEM name.
2. **F-30** — decide whether a `refused` pass writes its AC-7.2 log row. If it does, the AC-1.3
   Commits cell reads `yes` and AC-4.2 must say what `credential:` value that row carries; if it does
   not, AC-7.2's exemption set gains a second member and REQ-CONS-01's "a `refused` row is not a
   datum" needs rewording. Also flatten the `failed` cell to plain `yes` — under AC-7.2 the hedge is
   unreachable.

F-31 (`PHASE_DISPATCH` is `:3336-3437`, not `:3337-3431` — the cited range truncates `DOD`) and F-32
(cite `:7911` or `:6423` for `CODE_REVIEW` naming rather than the DoD-failure-path line `:10349`) are
citation corrections, not blockers.

No upstream defects were found this round. Every `MASTER-PLAN`, `pdlc-advisory-tier`,
`pdlc-merge-phase`, `DOMAIN-CONSTRAINTS`, `harvest-learnings/SKILL.md`, `orchestrate-queue.js`,
`nudge-consolidation.sh` and `orchestrate-dev.js` citation in the changed text resolves to a real
authority saying what the REQ attributes to it. No ERRATUM lines are emitted.

## Verdict

VERDICT: Needs revision
