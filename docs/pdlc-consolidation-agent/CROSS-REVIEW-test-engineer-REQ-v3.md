# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 3
**Scope:** Local (Scope tags per finding below)
**Delta base:** `d2b93d7` (the tree v2 reviewed) → `0b03f4d` (HEAD)

Delta re-review. v2's findings F-14…F-22 are dispositioned in §Prior findings; new findings are
numbered F-23 onward so ids never collide across rounds. Only the six commits that touched the REQ
since `d2b93d7` were read for new issues; unchanged sections approved in v1/v2 were not revisited.

## Prior findings

All nine v2 findings are resolved. Each resolution was re-verified against the code the revision
now cites, not against its prose.

| v2 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-14 | High | **Resolved** | The tick order is now stated as four numbered steps (enumerate → volume → cadence → `skipped-cadence`), and AC-1.1's cheap-exit clause is restated as "having read **no LEARNINGS body** — only basenames were enumerated". That is a true and separately testable claim: `nudge-consolidation.sh:41` is `os.path.basename(p) not in logtext` over a glob (`:28`), and reads no body. AC-1.2's count is explicitly sourced to step 1, so the two ACs no longer demand opposite fixtures for `(interval not elapsed, ≥threshold pending)` — that fixture now has one expected value, `volume`. |
| F-15 | High | **Resolved as scoped** | The datum is named: the most recent row with status in `promoted` / `promoted-degraded` / `no-op` / `failed`, and `skipped-cadence` writes no log row at all (AC-7.2, NFR-3a). The circularity is gone — a tick can no longer advance its own datum. The residual is the *empty* case, which the fix does not cover: see F-24. That is a new gap in the new text, not a survival of F-15. |
| F-16 | High | **Resolved** | The phase observable is named twice over: a new `Phases exercised` row in the harvest metadata table (`pdlc/skills/harvest-learnings/SKILL.md:70-78` — verified: the table runs `:70`–`:78`, `Harvested from` at `:77`), plus a total fallback mapping from `Harvested from` for pre-convention files, with an explicit "any phase the mapping cannot decide counts as **not** exercised → `insufficient-evidence`, never a guessed `prevented`". Both inputs are file text, so the determinism AC-5.2 claims now holds for all three branches. The mapping's own enumeration is incomplete (F-26), which is a narrower defect than F-16 was. |
| F-17 | High | **Resolved** | The availability paragraph now states the precondition and every claim in it checks out: `docs/_queue/` holds `QUEUE.md` alone (verified), `git log --all -- docs/_queue/ESCALATIONS.md` is empty (verified), `advisoryTierOn = advisoryConfigResult.config.enabled` is at `orchestrate-dev.js:9653`, `parseAdvisoryConfig` at `:1682`, `enabled: false` at `:1663`, and this repo's `.claude/pdlc.config.json` carries an `implementation` section only (verified — three keys, no `advisory`). AC-6.1's three-state table makes absence first-class, AC-6.3 now requires a non-empty corpus **and** at least one other seam escalating, and BL-01a records the corpus as not-met. The "first pass proposes widening all five `ADVISORY_SEAMS`" hazard is closed; `ADVISORY_SEAMS` is at `:1669` as cited. |
| F-18 | Medium | **Resolved** | AC-1.3 now carries a six-row take/release table set-equal to AC-7.1's status set, with `refused` (never takes, never releases — "the loser never unlocks the winner") and `skipped-cadence` (terminates before the marker is written) both explicit. The marker is now written *after* the trigger decision, which removes the wedge the v2 reading produced. A per-status fixture table is writable directly from the table, and a deleted row fails set-equality. |
| F-19 | Medium | **Resolved** | §4b gathers every enumerated value with its category, the statuses it may accompany, and its defining AC. The reason-code set I enumerated in v2 is present in full, plus the two new corpus codes. Two joins previously undetermined are settled explicitly. Two residuals in the new table are filed as F-26 and F-27 — neither is a re-litigation of F-19's ask, which was the table itself. |
| F-20 | Medium | **Resolved** | The ladder is reused, not restated: `resolveAdvisoryRung` is exported at `orchestrate-dev.js:1833` and its doc comment at `:1800` reads "TSPEC §3.4's model-rung ladder, and the **one** ladder the tier ships … there is no second, private copy of this ladder anywhere" — exactly what the REQ attributes to it. The queue precedent checks out (comment at `orchestrate-queue.js:1243-1244`, dispatch `:1245-1251`). And the fallback branch now demands a named drift observable (a set-equality test against `:1652-1653`) instead of a "named risk". |
| F-21 | Low | **Resolved** | All three references now attribute the trailers to the REQ-CONS-03 preamble; AC-3.5's `duplicate-suppressed` row cites NFR-4 rather than AC-3.1. |
| F-22 | Low | **Resolved** | AC-5.3 requires the AC-7.1 report to name the chosen alternative over the closed set `revision` / `retirement`, with the choosing *rule* correctly left to FSPEC. §4b carries the pair as its own row. |

## Findings

Every finding below is in text this round introduced, and every one is of a class §5a names as
belonging **here**: an under-stated claim about state at HEAD, or an enumerated contract whose
completeness cannot be checked by set-equality. None is a fixture or oracle-mechanics question,
and none re-opens a settled point.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-23 | High | Local | **The new delimited-block predicate silently un-consolidates everything the existing log records, and the REQ never says so.** REQ-CONS-01 now specifies that consumption is recorded only inside `<!-- pdlc:consumed {passId} -->` blocks and that "the predicate matches a basename **only within** such blocks". `docs/_decisions/.consolidation-log.md` **exists at HEAD** and contains no such block: Pass 1 (2026-07-29) records its consumed set as a two-row markdown table of full paths (`\| \`docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md\` \| 2026-06-02 \|`). Under the shipped predicate (`nudge-consolidation.sh:41`, `basename not in logtext`) that file **is** consolidated today; under the new predicate it is not. So the first pass after this feature ships re-consumes a LEARNINGS a prior pass already promoted from, and the un-consolidated count that feeds AC-1.2's volume test goes from 1 to 2 on this repo with no new work having happened. The consequences are all testable and all unspecified: NFR-4's idempotence is keyed on `failure-mode-id`, which pre-convention LEARNINGS do not carry, so a re-consumed corpus cannot be relied on to suppress the duplicate promotion; AC-5.2 recomputes verdicts over a corpus that includes an already-consumed feature. A test writer given "log at HEAD, one basename present outside any block" has no expected value to assert. State the migration: either the pass writes a one-time block transcribing the existing consumed set, or the predicate is `basename inside a block **or** in a log written before {passId}`, or the REQ states outright that re-consumption is intended and NFR-4 covers it. Any of the three is fine; the document must pick one, because it is the *only* case the shipping repo will exhibit on first run. | REQ-CONS-01 preamble ("The predicate's corpus is a delimited region"), NFR-5, AC-1.2 |
| F-24 | High | Local | **The cadence datum has no defined value when no qualifying row exists — which is the state of the log at HEAD and of every fresh repo — so the cadence trigger is undecidable exactly where F-15 said it must be decidable.** AC-1.1 measures the interval "since the cadence datum (the most recent log row with status `promoted` / `promoted-degraded` / `no-op` / `failed`)". The existing `.consolidation-log.md` predates this feature and carries **no status field** on its one pass row (verified — Pass 1 records a boundary, a consumed-set table and prose promotion sections; the word "Promoted" appears only as a section heading, never as a row status a parser could read), and a repo that has never consolidated has no log file. In both states the set is empty and "elapsed since ∅" is undefined. Two implementations diverge in opposite directions on the most common initial state: treat an absent datum as *elapsed* (the pass runs on the very first tick) or as *not elapsed* (cadence never fires until someone runs a manual pass, which is precisely the never-fires failure F-15 was raised about). The REQ was careful to make the analogous emptiness first-class for the advisory corpus — AC-6.1's three-state table distinguishes absent / present-and-empty / populated. The log deserves the same treatment and does not have it. Add the branch to AC-1.1: given no log row with a datum status (file absent, or present with none), Then {stated behavior}, and say which trigger value NFR-3a records for that first pass. | AC-1.1 ("The cadence datum, named"), AC-7.2, NFR-3a |
| F-25 | Medium | Local | **Step 1's corpus is depth-1 only, and 3 of the 5 LEARNINGS files at HEAD are outside it — including one this repo's own convention put there.** The tick order says "Enumerate `docs/*/LEARNINGS-*.md` basenames … which is all `nudge-consolidation.sh:41` does", and that is an accurate reading of `:28` (`glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))`). But the repo archives completed features one level deeper: `docs/completed/pdlc-merge-phase/`, `docs/completed/pdlc-review-loop-hardening/`, `docs/completed/pdlc-workflow-distribution/` each hold a LEARNINGS, and the REQ itself cites that convention (BL-02, "archived to `docs/completed/pdlc-workflow-distribution/`"). The glob matches none of them. This is not cosmetic for testing: AC-5.2's `prevented` branch is decided by whether **at least one consumed LEARNINGS** exercised the promotion's phase, so systematically excluding archived features depletes the evidence population and biases every verdict toward `insufficient-evidence`, which AC-5.5 then ages into `unmeasurable` after 3 evaluated passes. A fixture author following the REQ places files at `docs/{feature}/` and never discovers that the majority of the real corpus is invisible. Either state that archived LEARNINGS are deliberately out of corpus and why (a defensible answer — they were consolidated before archival), or widen the enumeration and say so, since widening also changes `nudge-consolidation.sh:28`, which is currently out of §5's in-scope edit list (`:41` and `SKILL.md:35` are named; `:28` is not). | REQ-CONS-01 tick order step 1, AC-5.2, §5 Scope |
| F-26 | Medium | Local | **The phase catalogue AC-5.1 keys on is never enumerated, and the new mapping table's "undecidable" list is missing a real phase.** AC-5.1 defines `phase` as "a member of the pipeline's phase catalogue" — an enumerated contract with no enumeration, in a REQ whose §4b explicitly promises "every enumerated value this REQ uses, in one place" and that "adding a value anywhere above without a row here is a defect". §4b has no phase-catalogue row. The new mapping table then decides six phases from cross-review docTypes (REQ→R, FSPEC→F, TSPEC→T, DECISIONS→D, PLAN→P, PROPERTIES→PR) plus DOD, and declares the rest undecidable as "(I, CR, H, PUB, MERGE)" — but the shipped catalogue also contains **PT**, a distinct reported phase: `recordPhase("PT", "PROPERTIES Tests", …)` at `pdlc/workflows/orchestrate-dev.js:10250`, gated at `:10035`/`:10238`, and named as a separate report row in CLAUDE.md ("PT is I's V-wave"). PT is neither in the decidable mapping (PR is the PROPERTIES *authoring* phase, a different id) nor in the undecidable list, so a promotion recorded against `phase: PT` falls through a mapping the REQ calls total. This is the exact discipline v2's F-19 asked for, applied to the table this round added: completeness must be checkable by set-equality over the full catalogue, and it cannot be until the catalogue is written down. Add the phase-id set to §4b and make the decidable ∪ undecidable partition set-equal to it. | AC-5.1, AC-5.2 ("The phase observable, named"), §4b |
| F-27 | Medium | Local | **§4b's "May accompany status" column is not closed under composition, so a legal run is rejected by the table that is supposed to validate it.** §4b closes with "A pass may carry more than one reason code; each must be legal for the status it accompanies", and settles the join "a pass that promoted something and also hit an AC-3.5 fallback class is `promoted-degraded`". Compose the two: a pass that lands one promotion, suppresses a second as a duplicate, and hits `api-failure` on a third has status `promoted-degraded` and carries `duplicate-suppressed` — but `duplicate-suppressed`'s row permits only `promoted`, `no-op`. Every other AC-3.5 code lists `promoted-degraded`; this one is the sole omission and it is reachable, not hypothetical. The same shape applies to the corpus codes: `no-advisory-corpus` / `advisory-corpus-empty` are recorded when the pass reads the corpus (AC-6.1), which happens before a later `failed` outcome is possible (e.g. AC-1.6's `advisory-model-unresolved`), yet neither row permits `failed`. Because §4b is the normative enumeration a downstream set-equality test is written from, an under-permissive cell produces a test that fails a correct implementation — worse than the scattering F-19 complained about. Re-derive each row's permitted-status set by composition rather than by the status the code was first introduced under. | §4b, AC-3.5, AC-6.1, AC-1.6 |
| F-28 | Low | Local | **One value escapes §4b's closed `credential:` set by a word.** AC-3.5's first failure-class row records `credential: absent (redacted)`; AC-4.3 (`:313`), NFR-2's restatement (`:488`) and §4b (`:564`) all give the closed three-value set as `present (redacted)` / `absent` / `local-gh`. `absent (redacted)` is a fourth value. The intended member is obvious, but §4b's own completeness claim ("adding a value anywhere above without a row here is a defect") is falsified by a line above it, and a set-equality assertion transcribed from §4b would fail against a log row transcribed from AC-3.5. One-word fix. | AC-3.5, AC-4.2, §4b |

## Questions

v2's Q-07 (invoking-tree observable) is answered directly by AC-3.8's rewrite — "no branch operation
of any kind: no `checkout`, no `switch`, no `stash`, no `reset`, no `rebase`, no fetch into its refs
… its HEAD must be identical before and after the pass" — which is a positive, assertable pair, and
AC-3.8b names where the writes do land and who commits them. Q-08 (substring vs delimited field) is
answered by the delimited consumed block; F-23 is the migration half of that same answer, not a
restatement of the question. One new question, non-blocking:

| ID | Question |
|----|---------|
| Q-09 | AC-3.8b requires the pass to commit its consuming-repo writes "itself, exactly once, at its terminal outcome, pathspec-scoped … never `-a`", citing `commitPaths` (`pdlc/workflows/orchestrate-dev.js:8669` — verified: `git add -- <paths>` via `gitWithLockRetry`, then a plain `git commit -m`). `commitPaths` also carries an index.lock retry because the pipeline can be committing concurrently in the same tree. Since AC-3.8 permits the pass to run while the invoking tree is mid-pipeline on a `feat-*` branch, does the REQ intend the same lock-contention tolerance here, and is a failed commit after all retries the "terminates before its commit → leaves the writes uncommitted and records that in its report" branch, or a `failed` status? The AC states the leave-uncommitted outcome but not which terminal status accompanies it, and §4b has no reason code for it. |

## Positive Observations

- The two structural fixes are the right ones and were done at the right altitude. The tick order is
  now four numbered steps a fixture table maps onto one-for-one, and the cadence datum is a named
  subset of statuses rather than "the last logged pass". Both replaced a contradiction with a
  mechanism, which is more than the findings asked for.
- AC-1.3's take/release table is the model of what v2's F-18 wanted: six rows, one per terminal
  status, both columns filled, and the two hard cases (`refused` never releases — "the loser never
  unlocks the winner"; `skipped-cadence` terminates before the marker is written) carry their
  reasoning inline. Set-equality against AC-7.1 is checkable by inspection, and a deleted row fails.
- §4b is a genuine enumeration, not a gesture at one — 22 rows, each with a category, a permitted-
  status set and a defining AC, plus two explicitly settled joins. F-26 and F-27 are corrections
  *within* that structure; the structure itself converted the "scattered across six sections"
  problem into one a test can be written from.
- `promoted-degraded` is a better answer than the one F-11/AC-4.3 strictly required. Making the
  degradation visible in the **status** rather than only in a route field means an oracle that
  asserts `status == "promoted"` now fails on a degraded run instead of silently passing — the
  difference between a falsifiable and an unfalsifiable success assertion.
- AC-6.1's three-state corpus table is exactly the shape F-17 asked for, and the closing sentence —
  "Absence of the file is never read as absence of escalations: a tier that could not escalate is
  not a tier whose seams worked" — states the oracle hazard in one line. BL-01a's "**Not met, and
  not expected to be**" is unusually honest for a dependency row.
- Citation discipline held through a large revision. I checked every new `file:line`
  (`resolveAdvisoryRung` `:1833` and its doc comment `:1800`, `commitPaths` `:8669`,
  `advisoryTierOn` `:9653`, `parseAdvisoryConfig` `:1682`, `enabled: false` `:1663`,
  `ADVISORY_SEAMS` `:1669`, `artifactClassOf`'s `CODE_REVIEW` test `:6423`, `reviewTargetPath`
  `:5799`, `postmortemPath` `:5429`, `harvest-learnings/SKILL.md` `:70-78`/`:77`/`:105`,
  `orchestrate-queue.js` `:1243`/`:1245-1251`, `nudge-consolidation.sh` `:25`/`:32`/`:41`/`:47-48`)
  and every one resolves and says what the REQ attributes to it. The `git log --all` and
  `.claude/pdlc.config.json` claims in the BL-01a rationale are true as stated.
- The revision volunteered a scope addition nobody asked for and that is clearly right: §5 now
  records that the pass ships as a bundled workflow, making it a new `build-runtime.mjs` artifact
  and a new `distribution-manifest.json` row. That is the kind of self-falsification DC-03 is about.

## Recommendation

## Verdict
