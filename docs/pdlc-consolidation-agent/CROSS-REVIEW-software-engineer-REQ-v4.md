# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 4
**Scope:** Local (delta re-review — v3 findings + changed sections only)
**Baseline diffed:** `8c20b4e..HEAD` (8 revision commits, +252/−199; REQ v1.2 → v1.3, 693 lines)

## Prior-Finding Disposition

All seven v3 findings, checked against the revision. Nothing below is re-litigated.

| v3 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-3.8b now names `commitQueueRow` (`pdlc/workflows/orchestrate-queue.js:1576`, add `:1577`, commit `:1580-1585`) and the advisory-record commit that mirrors its two-call shape (`:1615`) as the precedent, requires **the pathspec on both git calls** in the AC text itself, and states explicitly that the mechanism is *not* `commitPaths` — with the reason (`orchestrate-dev.js:8690` is a plain `git commit -m`, which would sweep a staged index, and AC-3.8's shipping tree is precisely one that may carry one). The lock-retry claim is re-anchored to `gitWithLockRetry` at `:8670`, which is where `commitPaths` actually wraps its `add`. All four citations verified below; `:1615` is the better anchor than the `:1605` I suggested (that is the doc-comment head; `:1615` is `commitAdvisoryRecord` itself). |
| F-02 | High | **Resolved — and my premise was wrong** | I stated that `docs/_decisions/.consolidation-log.md` "is a single-line JSON array". That is false: the file at HEAD is a markdown pass log — `# Consolidation Log` (`:1`), `## Pass 1 — 2026-07-29` (`:8`), a two-column consumed table of **full paths** (`:14-17`), then prose promotion sections. The revision checked the file rather than taking my claim, corrected the description, and then answered the finding that survived the correction — the predicate is now stated over **two regions** (delimited block, or the legacy region preceding the file's first `<!-- pdlc:consumed` marker; a log with no block is legacy region entire), which is total over any log, needs no parse of Pass 1's prose, and re-uses the shipped substring test for exactly the pre-feature text. NFR-4 gains the stated limit (`failure-mode-id` cannot key a pre-convention LEARNINGS) with the legacy region named as what prevents the re-consumption rather than NFR-4 absorbing it. The concrete first-run assertion is exact on this repo — verified row-by-row below. The residue is v4 F-02, a new finding about *freezing* the boundary, not this one reopened. |
| F-03 | Medium | **Resolved** | All three ACs are now keyed on consumed-set emptiness, never on the `no-op` label, and each says so in those words. AC-1.4: "Which streaks it advances is decided by consumed-set emptiness, never by the `no-op` label", with both causes routed (empty ⇒ neither evaluated nor counted; duplicate-suppressed ⇒ counts in both populations). AC-5.3 and AC-5.5 carry the reciprocal sentence. The three now agree on the case AC-1.4 introduced. |
| F-04 | Medium | **Resolved as to the destination; one consequence is mis-generalised** | AC-3.8b's new "Where those commits go, stated" paragraph makes the invoking branch the accepted destination and says the uncomfortable part out loud — the promotions ride an unrelated feature's PR, pushed by Phase PUB — and AC-7.1 reports the branch. That is what I asked for. The abandonment half is answered by construction (promotions and the NFR-5 consumed block are one commit) and the answer is right *for the consuming-repo route*; it is stated as if it covered both routes, which is v4 F-01. |
| F-05 | Low | **Resolved** | §4b's `no-advisory-corpus` and `advisory-corpus-empty` rows now read `promoted`, `promoted-degraded`, `no-op`, `failed`, and the closing paragraph derives that by composition ("the corpus is read before AC-3.5's or AC-1.6's failure is decidable") rather than by listing. |
| F-06 | Low | **Resolved, all three** | (a) the doc-comment quote is now `:1800` and the export `:1833` — both exact; (b) the queue anchors are `:1243-1244` (comment) and `:1245-1256` (dispatch) — both exact; (c) `CODE_REVIEW-{feature}-v{N}.md` is now cited at `orchestrate-dev.js:10349`, which **is** the construction site (`` const codeReviewPath = `docs/${featureName}/CODE_REVIEW-${featureName}-v${dodResult.iterations}.md` ``), so all three rows of the AC-5.2 mapping table are construction sites. |
| F-07 | Low | **Resolved, and over-delivered** | PT is added to the undecidable set, and §4b gained a phase-catalogue row enumerating all thirteen ids with per-id anchors (`PHASE_DISPATCH` for R/F/T/D/P/PR/CR/DOD, `recordPhase` literals for I/PT/H/PUB/MERGE). Every anchor verified. The set is now enumerated in the document, which was the standard §4b sets for itself. |

Seven of seven resolved. The three findings below are **new** and all arise in text this revision
added.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AC-3.8b's abandonment argument is stated universally but holds only for the consuming-repo route; on the AC-3.1 PR route the failure inverts, and NFR-4's PR identity cannot suppress the result.** The new paragraph closes abandonment "by construction, not policy: the promotions **and** the NFR-5 consumed block are one commit, so a discarded branch loses both together … making 'consumed while the promotion is lost' unreachable." That is correct for the writes AC-3.8b enumerates. But a pass makes promotions on **two** routes, and the same AC says so ("These writes never travel through the AC-3.1 PR, which carries only guard-set edits"). The guard-set edit is pushed from a **separate clone cut from the fetched default branch** (AC-3.8) to `consolidation/{passId}` and lives or dies independently of the invoking branch. So the reachable case is the mirror image of the one closed: pass P on `feat-X` opens the promotion PR, the operator merges it, `feat-X` is later abandoned. The guard-set promotion **survives on the default branch**; the consumed block, the AC-5.1 `failure-mode-id` record and the AC-3.4 PR URL all die with `feat-X`. A later pass re-consumes the same LEARNINGS and re-derives the same promotion, and neither suppression key fires: `failure-mode-id` (NFR-4) was in the lost commit, and the sources-trailer key suppresses only against an **open** PR (NFR-4: "A pass that finds an **open** PR carrying an identical sources trailer") — the first PR is merged, hence closed. The pass therefore opens a second PR re-applying an edit already in `pdlc/skills/`, which is precisely what NFR-4 exists to prevent, and it does so on the route where a duplicate is *visible to the operator as work to review*. One sentence fixes it: scope the closure claim to the consuming-repo writes, and say what the PR route does under abandonment (the honest answer looks like "a merged promotion PR is durable evidence in its own right; a later pass keys duplicate suppression on merged as well as open PRs carrying the trailer" — but the choice is the REQ's, not mine). | AC-3.8b, NFR-4, AC-3.5 |
| F-02 | Low | Local | **The legacy-region boundary is claimed to be frozen by write ordering, but AC-1.3 writes a record into the log *before* that ordering starts, and no rule says what a pass with an empty consumed set writes.** REQ-CONS-01: "It is frozen by construction: the first pass appends its `<!-- pdlc:consumed -->` block **before** any other record it writes, so every record this feature introduces lands after the boundary and none can be read as legacy consumption." AC-1.3 contradicts the universal directly: the `IN-PROGRESS: {passId} {ISO-8601}` marker is a record this feature introduces, written into the same file "**after** the trigger decision of steps 1–4 and before any other pass work" — i.e. before the block. Consequence today is nil (the marker carries a passId and a timestamp, no basename), so this is Low rather than Medium, but the claim as written is false and the second gap has teeth: **a pass whose consumed set is empty (AC-1.4's first cause) has no basenames to append, and the REQ never says whether it writes an empty block anyway.** If it does not, the boundary stays unfrozen and every record that pass writes — its AC-7.2 row, and on a later empty-set pass its AC-5.1 failure-mode records, whose `artifact` field the REQ itself notes "may legitimately be a LEARNINGS path" — lands *inside* the legacy region, where the bare substring test matches it. That is exactly the false-positive class the delimited block was introduced to kill, re-entering through the bootstrap window. Two sentences: exempt the marker explicitly (it is never committed and carries no basename), and require every pass that takes the marker to emit the block marker pair even when the consumed set is empty, so the boundary is frozen by the first pass unconditionally. | REQ-CONS-01, AC-1.3, NFR-5 |
| F-03 | Low | Local | **AC-5.2 asserts the decidable/undecidable split is a disjoint partition; row 3 of its own table makes the two sets overlap.** "**decidable** = R, F, T, D, P, PR (row 1), DOD (row 2), plus whatever `{phase}` row 3 names verbatim; **undecidable** = I, PT, CR, H, PUB, MERGE. The two sets are disjoint and their union is set-equal to the catalogue." Row 3 is `POSTMORTEM-{phase}-{feature}.md` → "that `{phase}` verbatim", and the phase in a POSTMORTEM basename is **not** restricted to the converge phases: the halt path constructs `` `docs/${featureName}/POSTMORTEM-${haltPhase}-${featureName}.md` `` (`pdlc/workflows/orchestrate-dev.js:10603`) from whatever phase halted, and CLAUDE.md documents the artifact as `POSTMORTEM-{phase}-{feature-name}.md` generally. A `Harvested from` naming `POSTMORTEM-DOD-…` or `POSTMORTEM-PUB-…` therefore decides a phase the sentence lists as undecidable, so the sets are not disjoint. The rule stays **total and safe** — a phase the mapping cannot decide *for that file* still counts as not exercised, and the overlap can only move a promotion from `insufficient-evidence` toward a real verdict — which is why this is Low. But §4b makes enumerated exactness this REQ's own standard, and the fix is to state the split per-file (decidable = what this file's `Harvested from` decides; undecidable = the catalogue minus that) rather than as a fixed partition of the catalogue. | AC-5.2 |

## Existing-Code Claim Verification (changed sections)

Every `file:line` claim the revision added or changed, plus the two whose truth v3 disputed, checked
against HEAD on `feat-pdlc-consolidation-agent` in a single pass. v2's and v3's already-confirmed
rows are not re-checked.

| # | New/changed REQ claim | Section | Verdict | Evidence |
|---|---|---|---|---|
| 1 | `commitQueueRow` is at `orchestrate-queue.js:1576`, `git add -- {path}` at `:1577`, `git commit … -- {path}` at `:1580-1585` | AC-3.8b | **Confirmed, all three** | `:1576` `async function commitQueueRow(queuePath, feature, status, gitFn)`; `:1577` `gitFn(["add","--",queuePath])`; `:1580-1586` the commit array carrying `"--", queuePath` |
| 2 | The advisory-record commit "mirrors its exact two-call shape" at `:1615` | AC-3.8b | **Confirmed** — better than my own v3 suggestion of `:1605` (that is the doc-comment head) | `:1615` `async function commitAdvisoryRecord(recordPath, feature, gitFn, emit)`, add `:1616`, commit `:1622-…`; the doc comment at `:1604-1606` says "Mirrors `commitQueueRow`'s exact two-call shape … so the pathspec rides the commit call itself, not only the add" |
| 3 | `commitPaths` (`orchestrate-dev.js:8669`) commits with a plain `git commit -m` and no pathspec (`:8690`) | AC-3.8b | **Confirmed** | `:8669` signature; `:8690` `gitWithLockRetry(["commit","-m",message], …)` |
| 4 | …and retries the lock class via `gitWithLockRetry` (`:8670`) | AC-3.8b | **Confirmed** | `:8670` `const add = await gitWithLockRetry(["add","--",...paths], {` |
| 5 | `.consolidation-log.md` at HEAD is a markdown pass log: `## Pass 1 — 2026-07-29`, consumed set as a two-column table of **full paths**, then prose promotion sections | REQ-CONS-01 | **Confirmed** — and it corrects my v3 F-02, which called the file a JSON array | `docs/_decisions/.consolidation-log.md:1` `# Consolidation Log`, `:8` `## Pass 1 — 2026-07-29`, `:14-17` the table with `docs/orchestrate-dev-workflow/LEARNINGS-…` and `docs/pdlc-workflow-distribution/LEARNINGS-…`, `:27`ff prose |
| 6 | It carries **no** `<!-- pdlc:consumed -->` block and no row status of any kind | REQ-CONS-01 | **Confirmed** | no `pdlc:consumed` substring in the file; the consumed table's only columns are `LEARNINGS` / `Date Completed` |
| 7 | On this repo, step 1's enumeration (`docs/*/` ∪ `docs/completed/*/`) matches **5** LEARNINGS | REQ-CONS-01 | **Confirmed, exactly 5** | depth-1: `docs/orchestrate-dev-workflow/`, `docs/pdlc-advisory-tier/`; depth-2: `docs/completed/{pdlc-merge-phase,pdlc-review-loop-hardening,pdlc-workflow-distribution}/` |
| 8 | `…-orchestrate-dev-workflow` and `…-pdlc-workflow-distribution` are named in the legacy region and are therefore consolidated; the other 3 are not | REQ-CONS-01 | **Confirmed by substring count** | basename occurrences in the log: orchestrate-dev-workflow **1**, pdlc-workflow-distribution **2**, advisory-tier **0**, merge-phase **0**, review-loop-hardening **0** |
| 9 | …so 3 un-consolidated, below the default `volumeThreshold` of 5, and the first tick reaches the cadence test | REQ-CONS-01, AC-1.2 | **Confirmed** — 3 < 5, and `THRESHOLD = 5` is at `nudge-consolidation.sh:25` as claimed | `nudge-consolidation.sh:25` |
| 10 | The shipped glob is depth-1 only (`nudge-consolidation.sh:28`) and hides 3 of the 5 | REQ-CONS-01 step 1 | **Confirmed** | `:28` `glob.glob(os.path.join(proj,"docs","*","LEARNINGS-*.md"))` |
| 11 | `docs/discarded/*/` is deliberately excluded | REQ-CONS-01 step 1 | **Confirmed as a live decision, not a hypothetical** — 2 LEARNINGS exist there | `docs/discarded/pdlc-rcv-budget-stop/LEARNINGS-…`, `docs/discarded/pdlc-review-convergence/LEARNINGS-…`; both depth-2, so neither glob reaches them and the exclusion is consistent with the stated corpus |
| 12 | `resolveAdvisoryRung` exported `:1833`, doc comment "the **one** ladder the tier ships" at `:1800` | AC-1.5 | **Confirmed, both** — v3 F-06a closed | `:1833`, `:1800` |
| 13 | Queue comment `:1243-1244`, dispatch `:1245-1256` | AC-1.5 | **Confirmed, both** — v3 F-06b closed | `:1243-1244` "…the advisory driver resolves its own model rung."; `:1245` `const advisoryDisposition = await runAdvisorySeamFn({`, through `_log: emit` `:1256` |
| 14 | `CODE_REVIEW-{feature}-v{N}.md` shipped naming at `orchestrate-dev.js:10349` | AC-5.2 | **Confirmed as a construction site** — v3 F-06c closed | `:10349` `` const codeReviewPath = `docs/${featureName}/CODE_REVIEW-${featureName}-v${dodResult.iterations}.md` `` |
| 15 | §4b phase catalogue: `PHASE_DISPATCH` (`:3337-3431`) covers R/F/T/D/P/PR/CR/DOD | §4b | **Confirmed** — every key's opening line is inside the range (`R:3338, F:3352, T:3365, D:3378, P:3391, PR:3405, CR:3418, DOD:3431`); the object itself closes at `:3437`, so the cited range ends at DOD's opening line rather than its end — an anchor, not an error | `:3337` `export const PHASE_DISPATCH = {` … `:3437` `};` |
| 16 | `recordPhase` literals: I `:10020`, PT `:10250`, H `:10407`, PUB `:10462`, MERGE `:10568` | §4b | **Confirmed, all five** | `:10020` `recordPhase("I","Implementation",…)`; `:10250` `("PT","PROPERTIES Tests",…)`; `:10407` `("H","Harvest",…)`; `:10462` `("PUB","Raise PR & Verify CI",…)`; `:10568` `("MERGE","Merge PR",…)` |
| 17 | The undecidable set for a pre-convention file is I, PT, CR, H, PUB, MERGE, disjoint from the decidable set | AC-5.2 | **PT added (v3 F-07 closed); disjointness false** (F-03) | `:10603` `` `docs/${featureName}/POSTMORTEM-${haltPhase}-${featureName}.md` `` — `{phase}` in row 3 is any halting phase, not only a converge phase |
| 18 | `harvest-learnings/SKILL.md` metadata table `:70-78`, `Harvested from` `:77`, `## 6. Approval Record` `:105` | AC-5.2 | **Confirmed, restated exactly** | `:70` `| Field | Detail |`, `:77` `Harvested from`, `:105` `## 6. Approval Record` |
| 19 | `hooks.json` registers only `PreToolUse` `:3`, `PostToolUse` `:14`, `SessionStart` `:29` | REQ-CONS-01 | **Confirmed, and set-equal** — those are the only three event keys in the file | `pdlc/hooks/hooks.json:3`, `:14`, `:29` |
| 20 | `consolidate-learnings/SKILL.md` — boundary `:35`, pass record `:43`, proposal name `:49`, four-column table `:54` | §1, REQ-CONS-01, AC-2.4 | **Confirmed, all four** | `:35` the `Date Completed` boundary rule this feature replaces; `:43` step 6; `:49` `CONSOLIDATION-PROPOSAL-{date}`; `:54` the header row |
| 21 | `QUEUE.md:11` "this queue is the pipeline's own queue"; `:279` every PR trips the self-modification guard | §1 | **Confirmed, both** | `:11`, `:279` |
| 22 | DC-09 at `docs/_constraints/DOMAIN-CONSTRAINTS.md:245` | §5a | **Confirmed** | `:245` `## DC-09: A REQ stays at requirements altitude, and carries its own stopping rule` |

## Questions

Only questions arising from the changed sections. v3's Q-01…Q-04 are answered by the revision (Q-01
and Q-02 by the legacy-region rule and the empty-datum decision, Q-03 by AC-3.8b's "Where those
commits go", Q-04 by AC-1.3's new Commits column) and are not re-asked.

| ID | Question |
|----|---------|
| Q-01 | For F-01: is duplicate suppression intended to key on **merged** PRs as well as open ones? NFR-4's current wording ("an **open** PR") is a deliberate-looking choice — an interrupted pass's partial PR is left alone — but it means a merged promotion offers no suppression key at all once its log record is gone. If the answer is "the log record is the durable key and its loss is accepted", say that; the finding is about the closure claim being stated universally, not about which answer is right. |
| Q-02 | For F-02: does a pass with an empty consumed set write an empty `<!-- pdlc:consumed {passId} --> … <!-- /pdlc:consumed -->` pair? NFR-5's "exactly the consumed set — neither more nor fewer" is satisfied by an empty block, and writing one unconditionally is what makes the legacy-region freeze true for every first pass rather than only for one whose consumed set happens to be non-empty. |
| Q-03 | AC-3.8b commits "exactly once, at its terminal outcome", and AC-1.3's Commits column says a `failed` pass commits "if it wrote anything". A `failed` pass reached through AC-1.6 (neither rung resolves) has taken the marker and written nothing else — so it must still *remove* the marker line, which is a modification of `.consolidation-log.md` in the working tree with no commit. Is leaving that uncommitted modification behind intended (it is a deletion, so the tree returns to its prior content and nothing is lost), or should the row for a `failed` pass be written before the marker is released so there is always something to commit? |

## Positive Observations

- **The revision checked my claim instead of accepting it, and was right to.** My v3 F-02 asserted
  `.consolidation-log.md` was "a single-line JSON array"; it is a markdown pass log with a
  `## Pass 1` section and a full-path consumed table. A REQ author under time pressure with a High
  finding in hand has every incentive to write to the reviewer's description of the file. This one
  opened the file, described what is actually there (`:8`, `:14-17`), and then answered the part of
  the finding that survived — that a block-only predicate would re-consume an already-promoted
  corpus. That is the behaviour §5a's "the truth of a claim about existing code" is supposed to
  protect, working in the direction nobody designs for.

- **The legacy-region rule is a better answer than the seeding migration I proposed.** Seeding
  `<!-- pdlc:consumed -->` blocks from Pass 1 would have required parsing prose written before any
  convention existed — a one-shot transcription with no test that could ever fail again. Defining
  the predicate over two regions instead makes the shipped substring test *the* legacy semantics by
  construction, needs no migration step, is total over any log including a fresh repo's absent one,
  and is verifiable today: 5 enumerated, 2 in the legacy region, 3 pending, below the volume
  threshold, cadence test reached. Every one of those five numbers checks out against the tree.

- **AC-3.8b now argues from the difference between two shipped mechanisms rather than naming one.**
  The v3 text cited `commitPaths` and inherited a guarantee it does not provide. The revision cites
  `commitQueueRow`, states the pathspec-on-both-calls requirement in the AC's own words, and then
  explains why `commitPaths` is *correctly* different where it lives ("there the `git add` scopes a
  set the wave already verified") instead of treating it as a bug. Distinguishing a precedent you
  reject from a precedent that is wrong is the harder write-up and the more useful one.

- **§4b absorbed the phase catalogue rather than leaving it implicit.** F-07 asked for one missing
  member. The delivery is a thirteen-id row with a per-id anchor split across `PHASE_DISPATCH` and
  the five `recordPhase` literals — which is how I verified it in one pass, and how a downstream
  PROPERTIES author will get set-equality over the phase enumeration for free instead of
  reconstructing it from CLAUDE.md prose.

- **Length went down while claims went up.** The document is 693 lines after adding a migration rule,
  a destination paragraph, a phase catalogue and three streak clarifications — the four tightening
  commits gave that back out of prose. I re-checked the sections those commits touched (§1,
  REQ-CONS-01/03/04/05/06, §4a/§4b/§5/§5a) against v3 and found no claim or citation dropped in the
  compression.

## Recommendation

**Needs revision.** 0 High, 1 Medium, 2 Low. All seven v3 findings are resolved — including both
Highs — and no new High exists. One Medium blocks.

The trajectory: v1→v2 closed 8 High, v2→v3 closed 2 High + 5 Medium, v3→v4 closed 2 High + 2 Medium
+ 3 Low and introduced no High. The remaining Medium is not a new problem area — it is the last
uncovered corner of the answer to v3 F-04, in text that did not exist a round ago.

### The stopping rule, applied against itself

§5a names four classes that must be fixed at the REQ layer and directs everything else downstream.
Applying it honestly to my own three findings:

- **F-01 (Medium)** belongs here. It is not an oracle question and not a testability question: two
  requirements disagree about a reachable case. NFR-4 promises "no duplicate PR"; AC-3.8b says
  abandonment makes the lost-work case "unreachable" **by construction**; on the AC-3.1 route the
  construction does not hold and the duplicate NFR-4 forbids is the outcome. Deciding which
  guarantee gives way is a requirements decision, not an FSPEC one — FSPEC cannot pick between "a
  merged PR is a suppression key" and "the log record is the only key and its loss is accepted"
  without inventing scope.
- **F-02, F-03 (Low)** would not hold the REQ on their own. F-02 is a write-ordering statement
  contradicted by AC-1.3 with a currently-nil consequence plus one unstated bootstrap case; F-03 is
  a partition claim that is safe in every direction it can be wrong. Both are cheap and both are
  worth fixing in the same pass as F-01, but neither is a blocker by the approval rules and neither
  would justify a further round alone.

Nothing in this round contests user need, scope, priority, phasing, or the truth of a claim about
existing code — the 22 verified citations are the strongest set this document has carried, and the
one factual dispute from v3 was resolved **against** the reviewer.

### What must change for approval

1. **F-01** — scope AC-3.8b's abandonment closure to the consuming-repo writes it enumerates, and
   state what the AC-3.1 PR route does when the invoking branch is abandoned after that PR merged.
   If the answer is that NFR-4's suppression keys on merged PRs too, say so in NFR-4; if it is that
   the loss is accepted, say that instead. One or two sentences either way.
2. **F-02** — exempt the AC-1.3 marker from "before any other record it writes" (it carries no
   basename and is never committed), and require the block marker pair to be written even when the
   consumed set is empty, so the legacy-region boundary is frozen by the first pass unconditionally.
3. **F-03** — restate AC-5.2's split per file (decidable = what that file's `Harvested from`
   decides; undecidable = the catalogue minus that) instead of as a fixed disjoint partition, since
   `POSTMORTEM-{phase}` can name any halting phase (`orchestrate-dev.js:10603`).

## Verdict

VERDICT: Needs revision
