# Cross-Review: product-manager — Final Codebase Review

**Reviewer:** product-manager
**Document reviewed:** the implementation diff `git diff main...HEAD` at HEAD `ae406c6`, branch `feat-pdlc-merge-phase`
**Date:** 2026-08-02
**Iteration:** 1
**Scope:** Product-lens review of the shipped **code** against approved FSPEC v1.3 / REQ v1.1 — the six safety pillars spot-run and read in source (`guardVerdict`, `mergeCandidates`, `ciRule`, `decideMerge`, `phaseMerge`, `runPicked`, the queue write-back), the operator experience actually emitted (notices, escalation lines, the ahead-of-remote note, the merge-deferred note, queue row + Evidence cell), FSPEC behaviour silently missing or extra, and a US-01…US-05 landing check. Code quality, test-harness design and runtime/bundle mechanics are the SE/TE lenses. Verification run: `npm test -- mergeGuard mergeDecision mergePhase mergeQueueWriteback mergeQueueDriver` → **5 suites, 1 306 tests, all green**; the suite-wide red is `documentOracles` AT-22, confirmed environmental (`git status --porcelain --ignored` shows `!! .tokensave/`, the case CLAUDE.md documents).

## Findings

### 1. [blocking] The FSPEC §8.2 ahead-of-remote note is emitted on three paths where its sentence is false

`phaseMerge` pushes the note whenever M4's disposition is `recorded` (`pdlc/workflows/orchestrate-dev.js:1439`–`:1443`), which is TSPEC §7.1's gate transcribed faithfully. But the disposition alone does not establish the fact the sentence asserts — "Local {defaultBranch} is ahead of its remote **by the queue-row commit** for {feature}" (`orchestrate-dev.js:1198`). I reproduced all three cases against the shipped module with doubles:

| Case | Emitted | Why it is false |
|---|---|---|
| **M3 failed** (dirty tree). `_git status` returns modified files, so `updateDefaultBranch` reports `{ok:false}` and the run escalates `working tree not updated … tree is on unknown` | *"Local main is ahead of its remote by the queue-row commit for featX…"* | M4 ran on whichever branch `HEAD` was left on (FSPEC §8.3 requires exactly that), so the commit is **not** on `main`. The same report tells the operator both that the tree never reached the default branch and that the default branch is ahead by a commit |
| **§2.5 non-overwrite** (row reads `blocked`). `rewriteStatus` returns `{queueRow:"recorded", detail:"row … left unchanged"}` (`pdlc/workflows/orchestrate-queue.js:1128`–`:1131`) — nothing written, nothing committed | *"Local main is ahead … by the queue-row commit"* **plus** *"row for featX left unchanged: found status \"blocked\""* | The two notes contradict each other in the same report; no queue-row commit exists |
| **Row 3 with `O4` unknown.** `defaultBranch` is `null` by design (TSPEC §5.5) and the run escalates `default branch name unavailable` | *"Local **null** is ahead of its remote…"* | A `null` interpolated into an operator-facing sentence |

The write path is correct in every one of these cases — this is purely the notice. It matters because that sentence is the *only* place an operator learns where their queue-row commit lives, and on the two degraded paths it now points them at the wrong branch while a neighbouring escalation says the opposite. No test pins it either way on the degraded paths: `pdlc/workflows/__tests__/mergePhase.test.js:531` asserts its presence on row 3, and the row-22 case (`:381`–`:387`) asserts escalations only.

**Fix (one condition, plus two assertions):** move the note below M3's result and gate it on the facts it claims — `tree.ok && defaultBranch && !(rec && rec.detail)` — then assert its **absence** in the existing row-22 and non-overwrite cases and its presence in the clean row-18 case. That keeps FSPEC §8.2's "once per merged run" true on every run that can honestly make the claim, which is what §7.1's suppression list was already reaching for.

### 2. [advisory] `decideMerge` reverses TSPEC §5.3's guards 22/23 — and the code is right, the table is wrong

`orchestrate-dev.js:977`–`:996` checks "the last attempt succeeded" **before** "an untried candidate remains", with the reasoning in a comment: under the TSPEC's stated order a success with an untried candidate still in the chain would trigger a second `gh pr merge`. The shipped behaviour matches FSPEC §6.2 ("The first candidate that succeeds ends the chain") and NFR-2; the TSPEC §5.3 table is the artefact that is wrong. Raise it as a TSPEC erratum so the two agree — the comment is the right place for the *reason*, but the table is what the next author will transcribe.

### 3. [advisory] The internal-catch path returns `refused` with no notes at all

`orchestrate-dev.js:1463`–`:1475` returns `notes: []`, so the one `refused` outcome that can carry no §9.4 merge-deferred note is `row: "internal"` — and any note already accumulated (notably §10.3's malformed-`merge`-section note) is dropped with it. FSPEC §9.4 says "every `deferred` and `refused` run" emits the note; `"internal"` is not an FSPEC row and is unreachable in a correct implementation, so this is advisory rather than blocking. Hoisting `notes` above the `try` and returning `notes` from the catch costs one line and keeps the operator's config warning visible on the one path where something has already gone wrong.

### 4. [advisory] Row ids ship as strings; three approved documents say otherwise

Every resolution carries a string (`row: "2"`, `"3"`, `"11a"`, and `String(row)` at `orchestrate-dev.js:1299`), while TSPEC §2.4 declares `row: number | string` with `1…23` and PROPERTIES PROP-M-17 writes `row === 3`. Code and tests are internally consistent — `mergePhase.test.js` asserts `"3"`, `"18"`, `"4"` — so nothing is broken, but a reader diffing PROPERTIES against the suite will stop here. One line in TSPEC §2.4 ("row ids are strings throughout") retires it; I would not change the code.

### 5. [advisory] US-05's guarantee has a sanctioned hole worth naming for harvest

US-05 asks that the queue row and the merge always agree. The §2.5 non-overwrite case is precisely the state US-05 excludes — the PR is merged, the row is not `done` — and the operator's only signal is a **plain note**, not an escalation (`orchestrate-dev.js:1443`), whereas AC-5.2's escalation exists because "merged, queue not updated" blocks the serial queue. FSPEC §7.4 and §11 row 18 sanction this deliberately (the row describes work this run did not drive, and overwriting would destroy the operator's own record), so it is **not** a code defect and I am not asking for a change. It belongs in LEARNINGS as the one residual gap between US-05's promise and the shipped behaviour, so the next queue stall on a `blocked` row is diagnosed in seconds rather than rediscovered.

### 6. [advisory] Safety pillars — verified, with what I checked

Recorded so the DoD phase can re-run the same checks rather than re-derive them. **Guard dominance / no override:** `guardVerdict` (`orchestrate-dev.js:651`) takes exactly two arguments, fails closed on anything that is not `{ok:true}` (`:652`–`:653`), and `effectiveGuardPaths` (`:628`–`:634`) unions the frozen defaults first with no filter or subtraction; a repo-wide scan for `force`/`bypass`/`override`/`skipGuard` in the new code returns only unrelated pre-existing hits (`forcePhases`, ship-pr's `--force-with-lease`). **No-bypass:** `decideMerge` branches on `mergeMode === "off"` only (`:757`); `"gated"` and `"on"` reach identical code. **Squash unreachability:** `mergeCandidates` (`:728`–`:734`) appends squash only under `config.allowSquashMerge === true` **and** `caps.squash` — a strict `=== true`, so `"true"`, `1` and truthy shapes cannot reach it. **Fail-closed:** every guard resolves `refused` at its own named row (8 / 11 / 11a / 13a / 15 / 5), and `ciRule` (`:679`–`:690`) relaxes exactly the `none` cell. **Merged never downgraded:** M2/M3/M4 failures push notes and escalations but the return at `:1453`–`:1462` is unconditionally `"merged"`. **Queue evidence round-trip:** the Status cell takes the bare token `done` with evidence in the sixth cell, and `runPicked` (`orchestrate-queue.js:1026`–`:1043`) derives `done` from `mergeStatus === "merged"` defensively and suppresses the "merge the PR, then set it to done" sentence on that path. US-01 lands in `phaseMerge` + `runPicked` + AT-M5, US-02 in `mergeCandidates`, US-03 in the guard, US-04 in `ciRule`, US-05 in the write-back (subject to finding 5).

## Verdict

VERDICT: REVISE
{"high": 1, "medium": 0, "low": 5}
