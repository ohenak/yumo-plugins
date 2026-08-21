# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** delta re-review of the v1.3 → v1.4 revision (`005dc47d..f256d767`), testing lens

## Verification Method

Same evidentiary base as round 2: this branch is 1,637 commits behind the default branch and
predates the mechanism, so every code claim was re-read from `git show origin/main:...` rather
than from this tree — which is exactly what the v1.4 header now instructs a reader to do. Six
claims the delta newly rests on, each re-derived rather than believed:

- **The ledger write's guard.** In `origin/main:pdlc/workflows/orchestrate-dev.js` the
  `writeWaveLedger` call sits nested inside the wave loop's `if (waveGit)` branch — the same
  branch that opens `// Only now — verified — does anything get committed`, holds the per-task
  `commitPaths` loop, and stamps `head` from `rev-parse HEAD`. The `if (scriptGate)` block is a
  sibling that has already closed. The code's own comment states the same guard the REQ now
  states: *"The ledger records COMMITTED waves only … without a git transport this run made no
  commits."* Precondition 1 as rewritten is true.
- **The decision ladder, one branch per IG row.** The ladder is `ledger.reason` → feature
  mismatch → `planHash` mismatch → `headCorroborated` → `lastGreenWave > waves.length` →
  `=== waves.length` → resume. Five distinct rejection mechanisms, each with its own `ignore(…)`
  notice, plus the silent `{}`/absent case in `parseWaveLedger`. Six rows, six mechanisms.
- **`explicitPointer` precedes the clamp.** `const explicitPointer = startWave > 1;` is the
  statement immediately above the `startWave > waves.length` clamp, and the ledger read is guarded
  by `if (!explicitPointer)`. A past-the-end pointer therefore still suppresses the ledger, as §1's
  correction and OB-1 both now say.
- **The phase row.** `allWavesRecorded` selects `recordPhase("I", "Implementation", "⏭", "Skipped
  — all N waves previously committed and recorded green (wave ledger)")`; the executed path selects
  the same `"I"` row with `"✅"`. One row, two statuses — which is the reading REQ-WVR-08 now pins.
- **Nothing clears the record.** No `unlink`/delete of `WAVE_STATE_PATH` exists anywhere in the
  file; the only occurrences besides read/write are the two banner strings. The superseded-position
  block's account of why self-clearing was rejected is accurate.
- **The baseline file.** `origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` carries
  `Version | 1.2 · 2026-08-20`, sections through `## 4.`, ids through `M-WG-14`, and the control
  rule *"A consumer cites this file at its `Version`"*. OB-2's restated recipe (next unoccupied
  section `## 5.`, bump 1.2 → 1.3, never a fixed number) matches the file.

Two further checks: the live `.claude/pdlc-wave-state.json` still reads
`{feature: "pdlc-advisory-wave-gate", lastGreenWave: 7, head: "8b13bd41…"}` and `git ls-files`
does not list it, so §1's re-verified observation and REQ-WVR-10's untrackedness both hold;
`origin/main:.gitignore:41` still carries the root-anchored `/.claude/pdlc-wave-state.json`, so
C-1 is unchanged. `waveExecution.test.js` carries the wave-ledger describe block OB-1 now cites by
name rather than by line.

## Round-2 Findings — Disposition

| ID | Round-2 finding | Sev | Status | Evidence |
|----|-----------------|-----|--------|----------|
| G-01 | §1's operational-finding block was falsified by the tree: precondition 1 named `scriptGate` as the write's guard, and the headline claimed the mechanism "has never once fired here" | High | **Resolved** | Both halves fixed on the merits, not narrowed away. Precondition 1 now reads *"The write is guarded by the **git transport**, not by the gate mode … A self-report-gate run *with* a transport records normally"* — which is what the code does and what its own comment says. The headline is re-dated ("re-verified 2026-08-21") and replaced by the live observation: the untracked record for `pdlc-advisory-wave-gate` with seven waves green and a `head` stamp. The list drops from four preconditions to three, and the surviving three are each true at the default branch. Critically, the derived FSPEC instruction survives on the right argument: the oracle must be an observed resume *"because a code path is never an oracle"*, not because the path never fired. That instruction is now writable as a test and cannot be false-greened by grepping for the write. |
| G-02 | IG-4 bundled two independent guards, so the set-equality check REQ-WVR-02 asks for could not falsify deletion of the ancestry probe | Medium | **Resolved** | Split: IG-4 is over-range, IG-5 is the unreachable recorded commit, IG-6 is the silent absent case, and downstream references (REQ-WVR-05's `IG-1..5`, REQ-WVR-06's carve-out, R-1) are all renumbered consistently. The REQ additionally states *why* they are separate rows — *"fusing them would let the ancestry guard be deleted without the enumeration changing"* — so a later editor cannot re-fuse them without contradicting the text. Six rows now stand one-to-one against six shipped mechanisms. |
| G-03 | §5/OB-2 pinned the wave-gate baseline at v1.0, two versions stale, making OB-2's "bump to 1.1" a downgrade instruction | Medium | **Resolved** | §5 cites `Version | 1.2 · 2026-08-20`; OB-2 is restated as a *recipe* rather than a number — re-read at the version current when promotion runs, append the next unoccupied section, bump to the next version above the one found, *"never to a fixed number written here, which would be a downgrade if the file has moved again"*. That is version-drift-proof, which the previous form was not. M-WG-6 is likewise downgraded from an assumed correction to a required re-check that must record the version it was checked against. |
| G-04 | Every new code citation was a raw `orchestrate-dev.js:NNNN` anchor, all stale by ~2,200–3,000 lines | Low | **Resolved** | `grep -n '\.js:[0-9]'` over the current REQ returns nothing: every anchor is now a symbol name (`WAVE_STATE_PATH`, `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`, `headCorroborated`, `allWavesRecorded`, `writeWaveLedger`, `explicitPointer`) or a banner string. All of them resolve by grep at the default branch. One residual reproducibility defect in the OQ-1 recipe is filed below as H-01 — the fix, not the direction, is what is incomplete. |
| G-05 | REQ-WVR-08's "own phase row" admitted two incompatible ATs | Low | **Resolved** | Now explicit: *"the run report's **Phase I row** carries a skip status and a reason naming the record … this is one row with a distinguishing status, not a second row; the hatch is owed on the run-log message only, not on the report row."* That matches `recordPhase("I", …, "⏭", …)` versus `"✅"` exactly, and it separates the two channels so the AT asserts the banner on the log and the status on the row rather than conflating them. |

## Findings

New findings only; round-2 findings are dispositioned above and not restated here. All three are
delta-introduced and non-gating.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| H-01 | Low | Process | OQ-1's replacement citation prescribes `grep`ping `orchestrate-dev.js` for the banner string `"to force a full run"` and promises two hits. The default branch returns **one**: the complete-record skip banner is split across a template-literal line break (`to force a ` + `full run.`), so only the mid-plan resume banner matches. The claim (two hatches, both announced) is true; the recipe that was added so a reader could check it does not reproduce. | §9 OQ-1 |
| H-02 | Medium | Local | §10's registration note still reads *"`ready: true` — BL-01..03 are all resolved, v1.3"*, but §5 now carries **four** rows and BL-04 (branch onto the current default-branch base) is unresolved right now — this branch is 1,637 commits behind. The readiness claim is an enumeration over a set that this revision extended, so it silently under-covers. | §10 registration line, §5 BL-04 |
| H-03 | Low | Local | §1's headline says *"three shipped preconditions **discard** the record"*, but precondition 1 is not a discard — it is a record that is never written (halt before commit, or no transport). Preconditions 2 and 3 discard. The two shapes yield different acceptance tests (assert no file exists vs. assert a file exists and is announced-ignored), so the collective noun blurs a distinction the list itself keeps sharp. | §1 operational finding, headline sentence |

### H-01 — the banner grep returns one hit, not two (Low, Process)

OQ-1 now reads: *"announced in both banners (grep `orchestrate-dev.js` for the banner string 'to
force a full run' — one under the complete-record skip, one under the mid-plan resume)."* Run it
at `origin/main` and exactly one line matches, because the skip banner is built as
`` `…Delete ${WAVE_STATE_PATH} to force a ` + `full run.` `` — the string the REQ names never
occurs contiguously in that banner's source. A reader following the instruction finds half the
evidence and has to decide whether the REQ is wrong or the code changed; that is precisely the
cost G-04 was raised to remove.

This is the right *kind* of citation — banner strings are stable where line numbers are not — so
the fix is small: name a substring that survives the line break (`to force a`), or better, cite the
two banners by their distinctive openings, `Skipping Phase I (wave ledger` and `Resuming at wave`,
both of which are contiguous, unique, and already cited elsewhere in the document. The same care
applies to any future banner citation: template literals in this file wrap at ~90 columns, so a
quoted fragment longer than a few words is a coin flip.

### H-02 — the readiness enumeration did not follow BL-04 into §5 (Medium, Local)

BL-04 is a good addition and correctly scoped ("Checked at FSPEC authoring"). But §10 still
certifies readiness over `BL-01..03`, and the frontmatter carries `ready: true`, which is what the
queue's auto-pickup reads. Two readings are now possible and the document does not choose: either
BL-04 does not gate pickup (in which case say so — it is discharged inside Phase F, not before it),
or it does (in which case `ready: true` and the note are both overstated while the branch sits
1,637 commits behind).

By this REQ's own standards this is the containment-vs-set-equality problem one level up: an
enumeration that names a subset of a table passes review while the table grows underneath it.
The cheapest fix is to make the note enumerate the whole table and state each row's status —
"BL-01..03 resolved; BL-04 open, discharged at FSPEC authoring and not a pickup gate" — so that
adding BL-05 later forces the note to change too. Non-gating because the substance of BL-04 is
stated correctly where it lives, in §5.

### H-03 — "discard" over-generalises precondition 1 (Low, Local)

Apply the write-the-test-right-now check to the headline. "Three preconditions discard the record"
implies three fixtures of one shape: write a record, meet the condition, assert the next run
announces an ignore and runs from wave 1. That shape is right for preconditions 2 and 3 and wrong
for precondition 1, whose test is *"halt at wave 1, or run with no git transport, then assert no
`.claude/pdlc-wave-state.json` exists"* — a no-write oracle, not an ignore oracle, and the one that
REQ-WVR-09 is built on. The list body draws the distinction correctly; only the summarising sentence
flattens it. Suggest: "one prevents the record from ever being written, and two discard what was
written". This matters slightly more than a word choice because the FSPEC author sizes the gap from
this sentence.

## Questions

## Positive Observations

## Recommendation

## Verdict
