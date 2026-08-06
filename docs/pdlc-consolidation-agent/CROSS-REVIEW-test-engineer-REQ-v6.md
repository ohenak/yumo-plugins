# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 6
**Scope:** Local (Scope tags per finding below)
**Delta base:** `610c19e` (the tree v5 reviewed) → HEAD

Delta re-review. v5's findings F-33…F-37 are dispositioned in §Prior findings; new findings are
numbered F-38 onward so ids never collide across rounds. Only the six commits that touched the REQ
since `610c19e` were read for new issues; unchanged sections approved in v1–v5 were not revisited.

## Prior findings

All five v5 findings are resolved — one of them by correcting *me*. Each disposition was checked
against the code the revision cites, not against its prose.

| v5 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-33 | Medium | **Resolved** | §4b's `no-cadence-datum` row now reads `promoted`, `promoted-degraded`, `no-op`, `failed`, `refused`, and the justifying paragraph replaces the "marker-holding" category with the ordering argument the composition rule actually needs: the code "is decided at step 3 of the tick order, and the marker check that yields `refused` comes after (AC-1.3 — the marker is written 'after the trigger decision of steps 1–4')". That is the derivation, not an assertion, so a set-equality test transcribed from §4b now passes on AC-1.3's two-tick race fixture instead of failing on it. `reclaimed-stale-lock` correctly still excludes `refused`. |
| F-34 | Medium | **Resolved, by the opposite decision — cleanly** | Rather than softening the two absolute "never committed" claims, the revision made them true: AC-1.3's Commits cell for `refused` is now "**no** — it writes its AC-7.2 row but commits nothing", and the reason is stated as the mechanism I raised ("a pathspec stages a whole file, so a refused commit would capture the winner's live `IN-PROGRESS:` line"). Both absolutes survive verbatim (`:334`, and AC-1.3's own `:191`). The ripple was carried in the same revision: §4b's `writes-uncommitted` row **drops** `refused` (a pass that commits nothing cannot lose an `index.lock` race), and AC-3.8b's "commits them itself, exactly once, at its terminal outcome" now defers to "(AC-1.3's Commits column)" rather than asserting universality. The new durability argument that replaces the commit has a gap — F-39 — but the decision itself is sound and the enumerations are consistent with it. |
| F-35 | Low | **Resolved — my finding was wrong** | I claimed `export const PHASE_DISPATCH = {` was `:3336`. It is **`:3337`**; `:3336` is the `// TSPEC-DISPATCH-01` comment and `:3338` is `R: {` (verified at HEAD). The REQ's original label was correct and my correction was off by one in the other direction. The revision did the right thing with a wrong finding: it kept `:3337` and *added* the disambiguating datum — "declaration `:3337`, first key `R:` `:3338`" — so the row can no longer be misread the way I misread it. `:3431` (`DOD: {`) and `:3437` (`};`) re-verified exact. |
| F-36 | Low | **Resolved** | The AC-5.2 citation is now `:10255-10257`. At HEAD `:10255` is `const crResult = await reviewLoop({`, `:10256` is `doc:`, `:10257` is `phase: "CR"` — the cited range now contains the property it is cited to prove. |
| F-37 | Low | **Resolved, and better stated than I asked** | REQ-CONS-01 clause (b) now names "exactly **two**" exempt records, and states the safety property *once* for both rather than twice: "neither is readable as legacy consumption because neither ever carries a basename", then gives each record's field list (marker: passId + ISO-8601; refused row: status, trigger, `credential:`, reason code). That is the shape a legacy-region test transcribes — a quantified claim over a two-member set with the discriminating field named — rather than two prose sentences a reader has to conjoin. |

## Findings

Both blocking findings are in material this round **introduced**, not in anything settled earlier.
Each is a guarantee the REQ states as achieved where the stated mechanism cannot achieve it — the
first defeats NFR-4's duplicate suppression, the second defeats the durability of the only evidence
a tick was refused. Neither is a fixture-mechanics question: both are answerable only by deciding
what the pass guarantees, which is this document's job.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-38 | Medium | Local | **NFR-4's new per-promotion key rests on an id-stability property AC-5.1's stated derivation cannot deliver, because one of the two derivation inputs is model-authored free text.** This round re-keyed duplicate suppression from the sources trailer to `failure-mode-id` (NFR-4, `:540-544`; AC-3.5's `duplicate-suppressed` row, `:298`; the new `PDLC-CONSOLIDATION-PROMOTIONS` trailer, `:267`). The re-keying is right — v5's sources key genuinely missed the case that matters — but the whole guarantee now hangs on AC-5.1's parenthetical: the id is "a slug derived deterministically from the failure mode itself — its `phase` and `symptom` — never from the pass or its consumed set, so a later pass re-deriving the same failure mode yields the same id" (`:392-395`). Determinism of the *function* is not stability of the *input*. `phase` is a closed 13-member catalogue (§4b), but `symptom` is "one line" of prose with no vocabulary, no template and no closed set, produced by the advisory-model pass — and the REQ says so by contrast: AC-5.2 carves out its verdict rule as "decided by a deterministic rule with **no model judgment**" (`:401`), which only means something if the promotion derivation that produces `symptom` is not. Two passes that recognise the same failure mode will word it differently and slug differently, so the load-bearing case NFR-4 names — "a later pass re-deriving the same promotion from a *larger* consumed set still records `duplicate-suppressed`" (`:352-354`), after the log record died with an abandoned branch — is exactly the case where the key silently misses. The test consequence is sharp: the only oracle writable from AC-5.1 as stated is `slug(phase, symptom) == slug(phase, symptom)`, a pure-function determinism test that is true of any hash and proves nothing NFR-4 needs; the oracle NFR-4 actually needs ("two independent derivations of the same failure mode collide") cannot be fixtured, because "the same failure mode" has no observable identity apart from the id it is supposed to determine. Fix (one clause, either way): either constrain the derivation to inputs that *are* stable — e.g. `phase` plus a closed `symptom-class` vocabulary, with the free-text line demoted to a non-keying field — or state that cross-pass id stability is **not** guaranteed and name the accepted consequence (a duplicate PR the operator closes) so NFR-4 stops asserting a suppression it cannot perform. | AC-5.1, NFR-4, AC-3.5 (`duplicate-suppressed` row), REQ-CONS-03 preamble |
| F-39 | Medium | Local | **"The two passes' concurrent writes need no lock" is false for the interleaving AC-1.3's own race fixture creates: the winner's marker *removal* is an in-place rewrite of the same file the loser appends its row to.** Having made a `refused` pass commit nothing, the REQ has to say what makes its row durable, and it says two things (`:207-209`): "the winner's own AC-3.8b commit covers the same path and sweeps the row up", and "the two passes' concurrent writes need no lock, the refused row is an **append of one whole record at end of file**". The append half is well grounded — the runtime does have a genuine append channel (`pdlc/workflows/runtime-adapter.js:863` `rtAppendFile`, dispatched as `cat >> "${path}"` at `:883`, explicitly *not* a read-modify-write per the doc comment at `:855-857`). But the winner does not only append. AC-1.3 requires the `IN-PROGRESS:` line to be "removed by the pass that wrote it" (`:190-191`) and AC-3.8b requires it "written and removed inside the pass" before the commit (`:334`) — and removing one line from the middle of a file is not an append. The only shipped non-append write seam is whole-file (`rtWriteFile`, the seam `rtAppendFile`'s comment contrasts itself against), so removal is necessarily read-snapshot → rewrite. A row the loser appends between the winner's read and its rewrite is silently gone, and with it both stated guarantees: nothing sweeps it up, and the no-lock claim is exactly what permits the loss. The oracle for AC-1.3's canonical fixture — "after the losing tick, `.consolidation-log.md` contains a `refused` row with reason `consolidation-in-progress`" — is therefore flaky by construction, and a flaky oracle on the one AC whose fixture is a race is worse than no oracle. Note this is *new* exposure, not a pre-existing race I let pass: while a `refused` pass committed, its row was on the branch and the winner's later rewrite could not un-commit it. Fix: state the removal mechanism or the accepted loss. Either the marker lives somewhere the log rewrite cannot touch (a separate file, so every log write is an append and the no-lock claim becomes true), or the REQ says a refused row may be lost to that window and names what survives instead — AC-7.1's in-session report already carries the status, so there is a positive fact to assert. | AC-1.3 (refused-row paragraph and marker lifecycle), AC-3.8b, AC-7.2 |
| F-40 | Low | Local | **AC-5.1 requires `failure-mode-id` to be both deterministically derived and "unique within the log", with no tie-break for the collision those two admit.** `:392-395` states both properties in one parenthetical. If two distinct failure modes in one pass — different `symptom`, same `phase` — slug identically, one of the two properties must yield, and the REQ does not say which. The case is small but fully fixturable (one pass, two promotions whose slugs collide), so a test author will hit it and have to invent the answer. One clause settles it: name the disambiguator (a `-2` suffix, which breaks derivation-purity and so must be said out loud) or state that a collision is a `failed` pass with a reason code. Filed Low rather than folded into F-38 because it survives whichever way F-38 is decided. | AC-5.1 |
| F-41 | Low | Process | **The REQ is 8 bytes inside its hard ceiling, so the next correction trips the size hook.** At HEAD the file is 698 lines / **61,432 bytes**; `pdlc/hooks/scripts/check-req-size.sh:41` sets `LINE_LIMIT=700` and the byte ceiling is 61,440 (60 KiB, `:40`). Two lines and eight bytes of headroom. Each of the last three rounds has been paid for by reflowing prose to stay under this ceiling, and the compression has cost nothing checkable so far (see §Positive Observations) — but the remaining budget is smaller than a single sentence, so the next round has no room to state F-38's or F-39's fix without cutting something else. This is a signal about the artifact's shape, not a defect in its content: pm-author's REQ Size Budget names phased REQs as the response, and REQ-CONS-05/06 are the natural seam. Raising it as `Process` because the recurrence — three consecutive rounds spending edit budget on reflow — is the durable signal, not this REQ's byte count. | Whole document; `pdlc/hooks/scripts/check-req-size.sh:40-41` |

## Questions

v5's Q-11 is answered in full and in the right register — NFR-4 now carries "State is read at poll
time with no memory of prior states: a reopened PR is open, hence a key" (`:546`), which is the
clause that tells a fixture author the oracle polls rather than reconstructs history, and closes the
three-state set under transitions. No new questions this round; both open items are findings, not
questions, because both have to be *decided* rather than clarified.

## Positive Observations

- F-34 was decided against my suggestion and the decision is better than either option I offered. I
  asked the REQ to soften two absolute claims or scope the commit; the revision instead removed the
  commit, which makes both absolutes true rather than merely consistent, and shrinks the `refused`
  status to the smallest disk effect that still carries evidence. The ripple was carried in the same
  revision and in the right direction — §4b's `writes-uncommitted` row **lost** `refused` — which is
  the tell that the decision was applied rather than asserted: a document that only adds is not
  re-deriving its enumerations.
- The v5 F-35 disposition is the more valuable one. My finding was wrong, and the revision neither
  accepted the wrong correction nor merely rejected it — it added `first key R: :3338` so the row now
  fixes the ambiguity that produced my error. A round that answers an incorrect finding by making the
  document harder to misread is doing something better than converging.
- The `no-cadence-datum` fix is stated as a **derivation from the tick order**, not as a corrected
  cell: "decided at step 3 … the marker check that yields `refused` comes after". That is what makes
  §4b's composition rule self-checking rather than a table someone maintains by hand — the next
  reason code can be placed by re-running the argument instead of by pattern-matching an existing
  row.
- NFR-4's re-keying names *why* the old key was wrong, in falsifiable terms: "a consumed set is
  time-dependent (REQ-CONS-01 step 1 enumerates whatever is un-consolidated *now*), so two passes
  proposing the same promotion normally consume different sets and a set key would miss exactly when
  suppression matters" (`:542-544`). That sentence is the fixture: same promotion, two different
  consumed sets, assert `duplicate-suppressed`. It is the test I would have had to invent, written
  into the requirement. (F-38 is about whether the *new* key can hold, not about this reasoning.)
- The three-trailer split at `:265-268` separates provenance from identity explicitly —
  `PDLC-CONSOLIDATION-SOURCES` is annotated "**not** a duplicate key" in the same breath as it is
  defined. An enumeration that says which of its members is load-bearing prevents the most common
  transcription error, which is keying a test on whichever field looks most specific.
- AC-5.2's `CODE_REVIEW` row now cites **both** dod-verify construction sites — `:7911` (round 1,
  inside `dodVerifyPrompt`, which begins at `:7873`) and `:7941` (rounds ≥2, inside
  `dodReVerifyPrompt` `:7924`) — both verified exact at HEAD. The v5 citation was true but partial:
  it proved the basename is produced on round 1 and left rounds ≥2 to inference, which for a
  set-equality claim over "every `CODE_REVIEW` file the pipeline can produce" is the half that
  matters. Widening a citation to close an inference is rarer than fixing a wrong one.
- Compression again cost nothing checkable. ~40 lines were reflowed to hold the budget, and I
  re-verified every `file:line` in the changed text: `:3337`/`:3338`/`:3431`/`:3437`, `:5429`,
  `:5799`, `:6423`, `:7911`/`:7924`/`:7941`, `:10255-10257`, `:10603`. All resolve to what the REQ
  attributes to them. The two claims removed by reflow (AC-5.2's "both inputs are file text…"
  sentence and AC-1.4's `no-op` restatement) are both still stated elsewhere — at `:401-402` and
  AC-1.4 respectively — so nothing checkable was dropped to buy the space.

## Recommendation

**Needs revision** — 0 High, 2 Medium, 2 Low. All five v5 findings are resolved, one of them by
correcting my own error. Both remaining blockers are in material this round introduced.

I applied §5a's stopping rule as written, and I want to be explicit about why neither Medium is the
"this cannot be tested as written" class §5a routes downstream. Neither asks for an oracle, a
property axis, a fixture or a coverage floor. Both say a **guarantee the REQ states as achieved is
not achieved by the mechanism the REQ states**:

- **F-38** — NFR-4 promises per-promotion duplicate suppression that survives the loss of the log
  record. AC-5.1 grounds that promise in id stability. Id stability is grounded in a `symptom` line
  the pass's own model writes, with no closed vocabulary. That is §5a's "a topology the shipped
  architecture cannot provide", and it decides whether `duplicate-suppressed` — a first-class member
  of §4b's closed reason-code set, permitted with three terminal statuses — can ever fire on the case
  NFR-4 exists for.
- **F-39** — AC-1.3 promises that a `refused` pass's row is durable without a commit and without a
  lock. The mechanism it cites (append-only writes) is real and I verified it at
  `runtime-adapter.js:863`, but it does not cover the winner's marker *removal*, which AC-1.3 and
  AC-3.8b both require and which no append can perform. That is §5a's "a false or under-stated claim
  about code at HEAD".

Re-opening: neither finding touches a settlement. F-38's key was introduced by `e75a115`, F-39's
no-commit decision by `4e2c002` — both this round, both new evidence at `file:line`.

What must change:

1. **F-38** — decide what `failure-mode-id` is a function of. Either narrow the derivation to inputs
   that are stable across passes (`phase` plus a closed symptom-class vocabulary, free text demoted
   to a non-keying field), or state that cross-pass stability is not guaranteed and name the accepted
   consequence, so NFR-4 stops promising a suppression it cannot perform.
2. **F-39** — say what makes a `refused` row durable across the winner's marker removal. Either move
   the marker out of `.consolidation-log.md` so every log write is an append and "need no lock"
   becomes true, or state the loss window and what survives it (AC-7.1's report carries the status —
   assert that positively rather than leaving the row's presence as the only oracle).

F-40 (`failure-mode-id` uniqueness vs. determinism has no tie-break) and F-41 (8 bytes of headroom
under `check-req-size.sh`'s ceiling; the recurrence is the signal, and REQ-CONS-05/06 is the phasing
seam) are corrections, not blockers.

No upstream defects were found this round. Every `orchestrate-dev.js`, `runtime-adapter.js`,
`orchestrate-queue.js`, `check-req-size.sh`, `nudge-consolidation.sh` and `MERGE_GUARD_DEFAULTS`
citation in the changed text resolves to a real authority saying what the REQ attributes to it. No
ERRATUM lines are emitted.

## Verdict

VERDICT: Needs revision
