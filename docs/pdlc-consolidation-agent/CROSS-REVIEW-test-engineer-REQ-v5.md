# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 5
**Scope:** Local (Scope tags per finding below)
**Delta base:** `170573c` (the tree v4 reviewed) → HEAD

Delta re-review. v4's findings F-29…F-32 are dispositioned in §Prior findings; new findings are
numbered F-33 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `170573c` were read for new issues; unchanged sections approved in v1–v4 were not revisited.

## Prior findings

All four v4 findings are resolved. Each disposition was checked against the code the revision cites,
not against its prose.

| v4 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-29 | Medium | **Resolved** | The disjointness claim is gone and replaced by the right rule: the split is "**per file, not a fixed partition of the catalogue**, and row 3 takes precedence over every other statement here", with the union set-equal to the catalogue *for every file* — which is what keeps the mapping total without asserting a false property. The supporting claims all check out: `POSTMORTEM-${phaseId}-${feature}.md` is built at `orchestrate-dev.js:5429` (verified — `const postmortemPath = \`docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md\``); Phase CR runs that loop (`const crResult = await reviewLoop({` at `:10255`, `phase: "CR"` at `:10257`); and the halt path builds the same name from whatever phase halted (`const candidate = \`docs/${featureName}/POSTMORTEM-${haltPhase}-${featureName}.md\`` at `:10603` — a citation this round added, and it resolves). The closing sentence "a set-equality test transcribed from this paragraph must be written per file" is the part that makes it testable: the oracle is now stated at the granularity the rule actually holds at. |
| F-30 | Medium | **Resolved as decided** | AC-1.3's Commits cell for `refused` now reads "**yes** — its AC-7.2 row, and that row only", AC-7.2's Given clause names `refused` inline, AC-4.2 gives that row's `credential:` value (`absent`, with the closed set explicitly covering "terminated before reading one"), and the `failed` cell is flattened to plain `yes` with the reason. The three-place contradiction (AC-1.3 / AC-7.2 / REQ-CONS-01's "a `refused` row is not a datum") is settled in the direction the other two already assumed, and the exemption set stays a single member. The fixture now has one expected value. Two consequences of this decision were not carried through, however — see F-33 and F-34; both are in the *ripple*, not in the decision. |
| F-31 | Low | **Resolved in substance** | The cited range is now `:3337-3437`, which contains all eight keys (`R:` opens at `:3337`, `DOD:` at `:3431`, the object closes at `:3437` — all verified), so the set-equality source is fully recoverable from the cited bytes. The parenthetical still labels `:3337` the "declaration", which is off by one (`export const PHASE_DISPATCH = {` is `:3336`; `:3337` is `R: {`) — restated as F-35, Low. |
| F-32 | Low | **Resolved** | The `CODE_REVIEW` naming authority moved to `orchestrate-dev.js:7911`, which is the dod-verify prompt's `docs/${featureName}/CODE_REVIEW-${featureName}-v${version}.md` interpolation and is taken on every DoD round (verified), with the classifier `:6423` (`if (/\/CODE_REVIEW-[^/]*$/.test(name)) return "code-review";`) cited alongside. Both are unconditional, so all three rows of the mapping table now carry the same evidentiary weight. |

Q-10 is answered by REQ-CONS-01's new two-clause construction: clause **(a)** makes the
`<!-- pdlc:consumed {passId} -->` pair unconditional — "even when its consumed set is empty" (the
pair is then empty), so the boundary is frozen by the *first* marker-holding pass rather than by the
first one that happened to consume something — and NFR-5 carries the same clause. That is the
answer I was fishing for, and it is stated as a requirement rather than left to be inferred from a
table cell.

## Findings

Both blocking findings are ripples of the F-30 decision, not disagreements with it. Admitting
`refused` as a **row-writing, committing** status changed two enumerations the REQ had already
frozen against the old assumption that `refused` wrote nothing, and neither was updated. Both are
one-cell fixes and both are reachable on the *canonical* AC-1.3 fixture ("two `/loop` ticks race"),
which is what makes them blocking rather than cosmetic.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-33 | Medium | Local | **§4b's `no-cadence-datum` row omits `refused`, which its own composition rule requires — and the omission fires on the first-run race fixture, on this repo, today.** §4b states the rule as "a code is legal with every terminal status still reachable after the point in the pass at which the code is recorded", and the prose now justifies the row as permitting "all four **marker-holding** statuses". But `no-cadence-datum` is not recorded at a marker-holding point: it is decided in **step 3** of REQ-CONS-01's tick order (the cadence test), and AC-1.3 says the marker line is written "**after** the trigger decision of steps 1–4". So the ordering is: cadence test → `no-cadence-datum` decided → marker check → `refused`. `refused` is therefore reachable after the code is recorded, and by the stated rule it belongs in the row. This is not a theoretical composition: REQ-CONS-01's own "on this repo today" paragraph establishes that the datum set **is** empty at HEAD (Pass 1 predates the status convention), and AC-1.3's fixture is two concurrent ticks. Both ticks find an empty datum set, both record `no-cadence-datum`, one takes the marker, the loser exits `refused` — and its AC-7.2 row now carries a reason code §4b forbids for that status. A set-equality test transcribed from §4b (the section's whole stated purpose: "adding a value above without a row here is a defect") fails on the first fixture anyone writes for AC-1.3. Note the asymmetry that shows the rule is being applied correctly elsewhere: `reclaimed-stale-lock` correctly excludes `refused`, because a pass that reclaims goes on to hold the marker; and `writes-uncommitted` was correctly extended to `refused` this round. Fix: add `refused` to the `no-cadence-datum` row and drop "marker-holding" from the justifying sentence — the four-status list there is now a coincidence of two different rules, not a category. | §4b (`no-cadence-datum` row and the composition-rule paragraph), AC-1.1, AC-1.3 |
| F-34 | Medium | Local | **A `refused` pass that commits `.consolidation-log.md` necessarily commits the *winner's* live in-progress marker, falsifying the REQ's twice-stated "the marker is never committed".** The REQ asserts non-commitment in two places: REQ-CONS-01 clause (b) — the marker "is never committed" (`:123`) — and AC-3.8b — "the AC-1.3 marker is written and removed inside the pass and is **never committed**" (`:336`). Both were true while `refused` wrote nothing. They are no longer. The marker is a line **inside** `docs/_decisions/.consolidation-log.md` (AC-1.3, `:188`), that file is in AC-3.8b's pathspec set, and AC-3.8b's mechanism is `git add -- {paths}` then `git commit -m {msg} -- {paths}` — a pathspec stages the **whole file's working-tree content**, not a hunk. On the AC-1.3 race the winner's `IN-PROGRESS: {passId} {ISO-8601}` line is live in the working tree and uncommitted at exactly the moment the loser writes and commits its row. The loser's commit therefore contains the winner's marker. Note that AC-1.3's own weaker wording survives this ("never a commit **of its own**", `:190`) — it is the two absolute statements that break, which is why this reads as an un-updated leftover rather than a design choice. The consequence is testable and not merely stylistic: the assertion for the race fixture is "after the refused tick, `git show HEAD:docs/_decisions/.consolidation-log.md` contains no `IN-PROGRESS:` line", and that assertion fails; and if the winner then dies, the marker is now on the branch's history rather than only in a working tree, so a fresh clone or a reset inherits a marker no live pass holds (bounded by `staleLockMinutes`, so recoverable — which is why this is Medium, not High). Fix: state which it is. Either the refused pass's commit is scoped so the marker cannot ride along (and say how, since a pathspec cannot do it), or the two absolute claims are softened to AC-1.3's "never a commit of its own" and the REQ states positively what a refused pass's commit may contain — with the stale-marker-in-history consequence named, since `staleLockMinutes` is what bounds it. | AC-1.3 (Commits column and marker paragraph), AC-3.8b, REQ-CONS-01 clause (b) |
| F-35 | Low | Local | **§4b still mislabels the `PHASE_DISPATCH` declaration line by one.** The row now reads "`orchestrate-dev.js:3337-3437` — declaration `:3337`, last key `DOD:` `:3431`, close `:3437`". The range is right and now contains all eight keys (F-31's substantive half is fixed), and `:3431`/`:3437` are exact. But `:3336` is `export const PHASE_DISPATCH = {`; `:3337` is `R: {`. Only the parenthetical label is wrong, and the enumeration is fully recoverable from the range either way — hence Low. `:3336`. | §4b phase-catalogue row |
| F-36 | Low | Local | **AC-5.2's `phase: "CR"` citation truncates the line it is cited for.** The paragraph cites "Phase CR runs that loop with `phase: "CR"` (`:10255-10256`)". At HEAD `:10255` is `const crResult = await reviewLoop({` and `:10256` is the `doc:` argument; `phase: "CR"` is at **`:10257`**. The cited range proves the call exists but not the property it is cited to prove. (This one is mine — v4's finding used the same range — which is why it is filed rather than left: the REQ now ships it as an authority.) `:10255-10257`. | AC-5.2, mapping-precedence paragraph |
| F-37 | Low | Local | **"Every other record this feature introduces lands after the boundary" is now false for one reachable record.** REQ-CONS-01 clause (b) names the AC-1.3 marker as "the **one** exempt record" written before the consumed block. Since F-30, a second one exists: a `refused` row. The winner takes the marker at t0 and appends its block at t1; a tick that is refused in between writes its AC-7.2 row into the log before any block exists, i.e. into the legacy region. The **hazard** does not materialise — a refused row carries a status, a trigger, `credential: absent` and a reason code, no basename, so the legacy-region substring test cannot match it — but that safety argument is exactly what is missing, and the sentence as written is an enumeration a test would transcribe ("no record other than the marker precedes the first block"). NFR-5 already acknowledges that basenames appear elsewhere in the log (a PR title, a failure record) and relies on block-scoping to be safe; the legacy region has no such scoping, so "which records may precede the first block, and why none of them can carry a basename" is the load-bearing claim. State it as a second exemption with that one-clause reason. | REQ-CONS-01 (legacy-region clause (b)), AC-7.2, NFR-5 |

## Questions

v4's Q-10 is answered in full (see §Prior findings). One new question, non-blocking.

| ID | Question |
|---|---|
| Q-11 | NFR-4 now keys duplicate suppression on a sources trailer carried by a PR in state **open or merged**, and states the exclusion positively ("a **closed-unmerged** PR is *not* a key — the operator rejected that promotion, and a later pass re-proposing it is intended behaviour"). That is the right call and it is testable as three fixtures. The one it does not name is **closed-then-reopened**: `gh pr list --state open` returns it, so it suppresses — which I read as correct and consistent — but a reopened PR is also the one case where "the operator rejected it" and "the key is live" are both true of the same PR at different times. Is the intended rule simply "current state at read time", with no memory of prior states? If so, one clause saying so would make the three-state set closed under transitions, and would tell a fixture author that the oracle reads state at poll time rather than deriving it from history. |

## Positive Observations

- F-29's fix is better than either option I offered. I proposed moving `CR` or stating a precedence
  rule; the revision found the actual defect underneath both — that the split was never a property
  of the *catalogue* at all, but of **one file's `Harvested from` row** — and re-stated it at that
  granularity. The result is total without being disjoint, and it closes the class rather than the
  instance: a future phase id that starts halting cannot re-open this, because nothing enumerates
  the decidable half in advance any more. The added `:10603` citation (the halt path builds
  `POSTMORTEM-${haltPhase}-…` from *whatever* phase halted) is the evidence that makes "any halting
  phase, not only a converge phase" a verified claim rather than an inference from CR alone.
- The closing sentence of that paragraph — "a set-equality test transcribed from this paragraph must
  be written per file" — is the sentence a test author needs, and it is unusual to find it in a REQ.
  It names the *quantifier* the oracle has to carry. Without it the natural transcription is a
  single global set-equality assertion, which is precisely the test that was passing for the wrong
  reason in v4's reading.
- F-30 was decided in the direction the rest of the document already assumed, and the decision is
  argued from evidence rather than convenience: the `refused` row "is the only evidence a tick was
  refused", and REQ-CONS-01's cadence rule "already presupposes it". The three ripples that follow
  (AC-7.2's Given clause, AC-4.2's value for that row, §4b's `writes-uncommitted` row) were carried
  in the same revision rather than left for a reviewer to chase. Two more were missed (F-33, F-34) —
  but three of five carried, unprompted, is the pattern that keeps a document converging.
- AC-4.2's `absent` definition is the right shape for a closed-set oracle: rather than adding a
  fourth "not reached" member, it widens the *meaning* of an existing member and says so ("no
  credential was in hand when the row was written — which covers both a pass that looked and found
  none (AC-4.3) and a pass that terminated before reading one"), then states the negative
  explicitly: "The set needs no fourth member". A three-value set-equality test still holds and now
  covers a fifth status. Growing the set would have silently invalidated every existing fixture.
- NFR-4's `open or merged` key is a genuine correctness fix, not a tidy-up, and the revision says
  *why* merged is in the set: "it is what survives when the invoking branch carrying the log record
  is abandoned". That ties NFR-4 to AC-3.8b's newly-separated PR-route abandonment paragraph, and
  the accepted loss is named rather than glossed ("what is *not* recovered is the effectiveness
  record — that promotion re-enters the AC-5.2 table as if first made — and that loss is accepted
  here, not closed"). A stated non-closure is worth more to a test author than a closure that is not
  real: it tells them not to write the oracle.
- Clause (a)'s unconditional consumed block (empty pair allowed) removes a conditional from the one
  invariant everything else in REQ-CONS-01 rests on. The boundary is now frozen by the first
  marker-holding pass, full stop — no case analysis on whether that pass consumed anything. That is
  the difference between an invariant a property test can assert over all passes and one that needs
  a guard clause in the test itself.
- Compression again cost nothing checkable. ~100 lines were reflowed to hold the 700-line / 60 KB
  budget (697 lines, 60,246 bytes at HEAD — inside both), and I re-verified every `file:line` in the
  changed text: `:5429`, `:6423`, `:7911`, `:10255`, `:10603`, `:3337`/`:3431`/`:3437`, and the five
  `recordPhase` literals. Two are imprecise by one line (F-35, F-36) and neither changes a claim;
  the two citations this round *replaced* (`:10349` → `:7911`, and the range truncating `DOD`) are
  both strictly better than what they replaced.

## Recommendation

## Verdict
