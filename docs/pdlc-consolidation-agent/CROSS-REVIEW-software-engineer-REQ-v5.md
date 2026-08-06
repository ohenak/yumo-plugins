# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 5
**Scope:** Local (delta re-review — v4 findings + changed sections only)
**Baseline diffed:** `3415420..HEAD` (5 revision commits, +105/−101; 697 lines)

## Prior-Finding Disposition

All three v4 findings, checked against the revision.

| v4 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Partially resolved** — the closure is scoped as asked, and a suppression key is supplied, but the key does not fire in the general case | AC-3.8b now scopes the abandonment closure "**for the consuming-repo writes this AC enumerates, and for those only**" (`:346-349`) and states the AC-3.1 PR route separately (`:351-358`). NFR-4 keys suppression on a trailer-carrying PR in state "**open or merged**" (`:543`), the AC-3.5 row matches (`:299`), and closed-unmerged is excluded with a reason (an operator rejection is not a duplicate). That is exactly the shape I asked for and the excluded case is the right one. What is not closed: the suppression key is the `PDLC-CONSOLIDATION-SOURCES` trailer, defined as `{sorted consumed basenames}` (`:268`) — an **exact set**. After the abandonment the REQ describes, the later pass's consumed set is the lost set *plus* whatever accumulated meanwhile, so the trailers differ and the merged PR is not a key at all. See v5 F-01. |
| F-02 | Low | **Resolved** | REQ-CONS-01 now states the freeze in two clauses (`:115-121`): (a) every marker-taking pass appends the `<!-- pdlc:consumed {passId} --> … <!-- /pdlc:consumed -->` pair before any other record **even when its consumed set is empty**, the empty pair satisfying NFR-5's "exactly the consumed set"; (b) the AC-1.3 marker is the one exempt record, with the reason stated (passId + ISO-8601, never a basename, never committed, removed by the pass that wrote it). NFR-5 carries the reciprocal clause (`:552-555`). Both halves of the finding are answered, and the universal is now true as written. |
| F-03 | Low | **Resolved, and over-delivered** | AC-5.2 no longer claims a fixed partition: "The split is **per file, not a fixed partition of the catalogue**, and row 3 takes precedence over every other statement here" (`:435-443`), with decidable = what that file's `Harvested from` decides and undecidable = the catalogue minus that. Union-set-equality per file is retained (which is what makes the rule total) and the disjointness claim is dropped explicitly ("Nothing here is a disjointness claim"). It goes further than I asked by showing `POSTMORTEM-CR-*` is *producible* — the shared review loop builds the name (`orchestrate-dev.js:5429`) and Phase CR runs that loop — instead of leaving it at the halt path. The instruction to a downstream test author ("a set-equality test transcribed from this paragraph must be written per file") is the right thing to have added. |

Three of three answered; one is answered only under a condition the REQ does not state. The three
findings below are **new** and all arise in text this revision added.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The merged-PR suppression key is keyed on an exact consumed set, so it does not fire in the abandonment case it was introduced to close.** AC-3.8b's new PR-route paragraph closes the case on PR identity: "NFR-4's suppression keys on any PR carrying an identical sources trailer that is **open or merged**, so the merged PR is itself the durable key and a later pass re-deriving the same promotion records `duplicate-suppressed` rather than opening a second PR." The trailer is defined two sections earlier as `PDLC-CONSOLIDATION-SOURCES: {sorted consumed basenames}` (`:268`) — the *whole* consumed set, sorted, not the promotion. Now replay the scenario the paragraph is about: pass P on `feat-X` consumes set S, opens the promotion PR (trailer = S), the PR merges, `feat-X` is abandoned, and the consumed block plus the AC-5.1 record die with it. A later pass Q enumerates un-consolidated LEARNINGS under the AC-1.1 predicate — S is un-consolidated again, and anything harvested since is un-consolidated too, so Q's consumed set is S ∪ N. Q's trailer is therefore **not** identical to P's whenever N ≠ ∅, and the merged PR is not a key. `failure-mode-id` (NFR-4's promotion identity) died with the branch. Neither key fires and Q opens a second PR re-applying an edit already in `pdlc/skills/` — the exact outcome the paragraph claims is closed, differing from the pre-revision state only in the narrow case where no new LEARNINGS appeared in the interim. Note this is not the same as N = ∅ being rare or common: the consumed set is *by construction* time-dependent (REQ-CONS-01 step 1 enumerates whatever is un-consolidated now), so set-identity across an abandonment interval is the exceptional case, not the ordinary one. Either the suppression key must be per-promotion (`failure-mode-id` in the PR body, which is a key that survives because it rides the PR rather than the log) or the closure must be stated with its condition ("suppression fires when the later pass's consumed set is identical; otherwise the duplicate PR is accepted and the operator closes it"). Which one is a requirements decision — FSPEC cannot invent a second trailer. | AC-3.8b, NFR-4, REQ-CONS-03 preamble |
| F-02 | Medium | Local | **Making a `refused` pass commit `.consolidation-log.md` falsifies AC-3.8b's "the marker is never committed", and puts an uncoordinated writer on the one file the marker exists to guard.** AC-1.3's Commits column now reads, for `refused`, "**yes** — its AC-7.2 row, and that row only", and the new paragraph adds that the row "is committed pathspec-scoped like any other consuming-repo write (AC-3.8b)". But by definition a `refused` pass runs **while another pass holds the marker** — that is what refused *means* — and the marker is "a single `IN-PROGRESS: {passId} {ISO-8601}` line in `docs/_decisions/.consolidation-log.md` … it lives in the working tree only" (AC-1.3). A pathspec-scoped `git add -- .consolidation-log.md` followed by `git commit … -- .consolidation-log.md` stages and commits the file **as it stands in the working tree**, marker line included. So AC-3.8b's stated consequence — "the AC-1.3 marker is written and removed inside the pass and is **never committed**" (`:336`) — is now reachably false, and it is falsified by a pass that never took the marker, i.e. the one pass that cannot honour the guarantee by construction. Two further consequences the REQ does not address: (a) the loser's commit captures the winner's log file at an arbitrary mid-pass instant, so a commit of a half-written consumed block or a partial row is reachable; (b) both passes now perform read-modify-write on the same file with no stated atomicity or append discipline, so a lost update between the loser's row append and the winner's block/row append is reachable — AC-3.8b's isolation argument covers a *pipeline* commit racing the pass, not two consolidation passes racing each other. This is a requirements-layer contradiction, not an FSPEC detail: AC-1.3 and AC-3.8b now assert incompatible things about the same file. The cheap resolutions are all REQ-level choices — the refused row is written but **not** committed (the winner's own commit picks it up, since it commits the same path); or the marker is excluded from the committed content explicitly; or the refused row goes somewhere that is not the marker-bearing file. | AC-1.3, AC-3.8b, NFR-5 |
| F-03 | Medium | Local | **§4b, whose stated purpose is set-equality checking, contradicts itself about `refused` in two places — the revision extended one reason-code row to `refused` but not the other, and then wrote a sentence denying the row it had just added.** §4b's preamble makes the table normative: "Downstream completeness is checkable by **set-equality against this table**, not by containment across six sections; adding a value above without a row here is a defect." Two defects now: (a) The closing paragraph says `writes-uncommitted` "additionally permits `refused` … **while its only *reason* code is `consolidation-in-progress`**" (`:627-629`). `writes-uncommitted` is categorised as a *reason code* in the very table (`:599`), so the clause denies the row two lines above it. A test transcribed from the paragraph and a test transcribed from the table disagree — which is precisely the failure mode set-equality-against-one-table exists to prevent. (b) `no-cadence-datum` still permits only `promoted` / `promoted-degraded` / `no-op` / `failed` (`:598`), justified in the same paragraph as "all four marker-holding statuses" — but the composition rule the paragraph states is "a code is legal with every terminal status still reachable after the point in the pass at which the code is recorded", and `no-cadence-datum` is recorded at **step 3 of the tick order**, before the marker check. `refused` is plainly still reachable after step 3: an empty datum set makes the cadence test fire (AC-1.1), the pass proceeds to the marker check, finds the marker, and exits `refused` — writing a row that, per AC-1.1, "records trigger `cadence` plus reason code `no-cadence-datum`". So AC-1.1 mandates a combination §4b forbids. Once `refused` became a row-writing status this row had to move for exactly the reason `writes-uncommitted` moved; it did not. Both are one-token fixes, but they are in the enumerated table this REQ nominates as the downstream oracle, so they are not cosmetic. | §4b, AC-1.1, AC-1.3 |
| F-04 | Low | Local | **Two citations changed this round are off the token they are cited for.** (a) AC-5.2 says "Phase CR runs that loop with `phase: \"CR\"` (`:10255-10256`)". `:10255` is `const crResult = await reviewLoop({` and `:10256` is `doc: \`docs/${featureName}/\``; the quoted `phase: "CR"` is at **`:10257`** — outside the cited range. The claim is true; the range names the dispatch, not the token in backticks. (b) The AC-5.2 mapping table's `CODE_REVIEW-{feature}-v{N}.md` row now cites "`orchestrate-dev.js:7911` (the dod-verify dispatch, **taken on every DoD round**)". `:7911` is inside `dodVerifyPrompt` (declared `:7873`), which is the **round-1** prompt only; round ≥2 goes through `dodReVerifyPrompt` (`:7924`), which names the same basename at `:7941`. So the parenthetical is false as written for rounds ≥2 — either cite both, or say "the round-1 dod-verify dispatch". Low because both anchors land within a few lines of the truth and neither changes a requirement; flagged because §4b and §5a make citation exactness this document's own standard, and because the v4 round closed three Lows of exactly this class. | AC-5.2 |

## Existing-Code Claim Verification (changed sections)

Every `file:line` claim this revision added or changed, checked against HEAD on
`feat-pdlc-consolidation-agent` in a single pass. The 22 rows verified in v4 are not re-checked;
only rows the diff touched appear here.

| # | New/changed REQ claim | Section | Verdict | Evidence |
|---|---|---|---|---|
| 1 | `CROSS-REVIEW-{role}-{docType}-v{N}.md` shipped naming at `orchestrate-dev.js:5799` (unchanged, but re-read because the row above it changed) | AC-5.2 | **Confirmed** | `:5799` `` const reviewTargetPath = (skill, round) => `docs/${feature}/CROSS-REVIEW-${reviewerRoleSlug(skill) \|\| skill}-${reviewFileType}-v${round}.md` `` |
| 2 | `CODE_REVIEW-{feature}-v{N}.md` at `orchestrate-dev.js:7911` — "the dod-verify dispatch, taken on every DoD round" | AC-5.2 | **Line confirmed; the parenthetical is wrong** (F-04b) | `:7911` is the basename inside `dodVerifyPrompt` (`:7873`), the **round-1** prompt. Round ≥2 is `dodReVerifyPrompt` (`:7924`), basename at `:7941`. The v4 citation (`:10349`) was the A3-advisory read site, so moving off it was right; the replacement is one of two dispatch sites, not both |
| 3 | …"classified at `:6423`" | AC-5.2 | **Confirmed** | `:6423` `if (/\/CODE_REVIEW-[^/]*$/.test(name)) return "code-review";` inside `artifactClassOf` (`:6420`) — a genuine classification site, and a better anchor than a naming string for "what the pipeline treats as a code review" |
| 4 | `POSTMORTEM-{phase}-{feature}.md` built by the shared review loop at `orchestrate-dev.js:5429` | AC-5.2 | **Confirmed** | `:5429` `` const postmortemPath = `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md` `` — parameterised on `phaseId`, which is what makes `POSTMORTEM-CR-*` producible |
| 5 | Phase CR runs that loop with `phase: "CR"` (`:10255-10256`) | AC-5.2 | **Claim true, range off by one** (F-04a) | `:10255` `const crResult = await reviewLoop({`, `:10256` `` doc: `docs/${featureName}/` ``, `:10257` `phase: "CR",` |
| 6 | The halt path builds the same name from whatever phase halted (`:10603`) | AC-5.2 | **Confirmed** — v4 row 17's evidence, now cited by the REQ itself | `:10603` `` const candidate = `docs/${featureName}/POSTMORTEM-${haltPhase}-${featureName}.md` `` |
| 7 | `PHASE_DISPATCH` range restated as `:3337-3437` — declaration `:3337`, last key `DOD:` `:3431`, close `:3437` | §4b | **Confirmed, all three** — this closes v4 row 15's noted imprecision without my having raised it as a finding | `:3337` `export const PHASE_DISPATCH = {`; `:3431` `DOD: {`; `:3437` `};` |
| 8 | `PDLC-CONSOLIDATION-SOURCES: {sorted consumed basenames}` is the PR-duplicate identity key | REQ-CONS-03 preamble, NFR-4 | **Internally consistent, and the source of F-01** — this is a REQ-internal definition, not a code claim; recorded here because F-01 turns on it | `:268` (definition), `:299` (AC-3.5 row), `:543` (NFR-4) all agree that the key is the trailer, hence the whole sorted consumed set |
| 9 | `nudge-consolidation.sh:41` is the shipped substring test the two-region predicate re-uses | REQ-CONS-01 | **Confirmed, unchanged** | `pdlc/hooks/scripts/nudge-consolidation.sh:41` — the consumed-substring test the legacy region is defined as |

No claim added or changed in this round is factually wrong about the codebase; the two defects in
rows 2 and 5 are an over-broad parenthetical and a range that stops two lines short of its own
quoted token.

## Questions

Only questions arising from the changed sections. v4's Q-01 and Q-02 are answered by the revision
(Q-01 by NFR-4's merged-PR key, Q-02 by REQ-CONS-01 clause (a)'s unconditional empty pair) and are
not re-asked. v4's Q-03 is answered in a direction that created F-02, so it reappears there rather
than as a question.

| ID | Question |
|----|---------|
| Q-01 | For F-01: would the PR body carrying the per-promotion `failure-mode-id`s (alongside, not instead of, the sources trailer) be acceptable as the durable duplicate key? It is the one identity that survives the abandonment — it rides the PR rather than the log — and it is already defined (AC-5.1). The sources trailer would then keep its current job, pass provenance, and stop doubling as a suppression key it can only serve when two passes consume byte-identical sets. |
| Q-02 | For F-02: was the intent that a `refused` pass commits, or only that it *writes*? AC-1.3's own justification for the row is evidentiary ("the only evidence a tick was refused") and REQ-CONS-01's cadence rule reads the row, not a commit of it — both are satisfied by a working-tree write that the winner's own AC-3.8b commit (same pathspec, same file) sweeps up moments later. If write-without-commit is acceptable, the Commits column for `refused` goes back to **no**, the "marker is never committed" guarantee survives intact, and §4b's `writes-uncommitted`/`refused` extension is unnecessary — three of the four things this round changed collapse into one. |
| Q-03 | Does anything serialise the two passes' writes to `.consolidation-log.md`, or is the marker the only mechanism? The marker prevents concurrent *work*, but with the refused pass now writing to the marker-bearing file, nothing in the REQ prevents two processes doing read-modify-write on it at once. If the answer is "the writes are appends and appends do not conflict", that should be stated as a requirement on the write, because "append a row" and "append inside the `<!-- pdlc:consumed -->` block" are not the same operation and the second is a mid-file edit. |

## Positive Observations

- **The two-clause freeze is a stronger answer than the two sentences I asked for.** I asked for the
  AC-1.3 marker to be exempted and for the block pair to be emitted unconditionally. The revision
  does both and gives each its own justification — the marker carries a passId and a timestamp and
  never a basename, so it cannot be *read* as legacy consumption even though it is written before
  the boundary; and the empty pair is shown to satisfy NFR-5's "exactly the consumed set" rather
  than being asserted as harmless. That second point is the one a reader would have challenged, and
  it is pre-empted in the same sentence.

- **AC-5.2's rewrite dropped a claim rather than defending it.** The easy fix to F-03 was to delete
  the word "disjoint". Instead the paragraph re-founds the split per file, states that row 3 takes
  precedence over everything else in the section, proves `POSTMORTEM-CR-*` is producible from two
  independent sites (`:5429` via the review loop, `:10603` via the halt path) rather than one, and
  then tells the downstream test author what shape the set-equality test must take. That last
  sentence is worth more than the correction: it is the difference between a spec that is right and
  a spec whose rightness survives transcription.

- **The AC-3.5 row and NFR-4 moved together.** When a key set widens, the usual failure is that one
  of the three places naming it is missed. Here the AC-3.5 table row (`:299`), NFR-4 (`:543`) and
  AC-3.8b's prose (`:354-355`) all say "open or merged", and NFR-4 additionally names the member
  that was *not* added and why — closed-unmerged is an operator rejection, so re-proposing is
  intended behaviour. Stating the excluded member is what makes the set checkable.

- **The `refused` change is the right instinct even though it broke two things.** TE's finding was
  correct: a refused tick that leaves no trace is unobservable, and REQ-CONS-01's cadence rule was
  already written as if the row existed ("a `refused` row is not a datum"), so the document was
  internally inconsistent before this round. F-02 and F-03 are about the *consequences* of the fix
  not being propagated — the commit semantics and two §4b rows — not about the fix being wrong.

## Recommendation

## Verdict
