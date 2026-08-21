# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** Technical lens — delta re-review of the v1.3 revision against my v1 findings.
**Base verified:** branch `feat-pdlc-wave-resume` @ `005dc47d` (24 commits ahead of merge-base
`c8aa22a4`, still 1,637 behind `main`); all code claims cross-checked against `main`
(`pdlc/workflows/orchestrate-dev.js`, 16,336 lines) since the mechanism does not exist in this tree.
**Delta base:** v1 reviewed the document at `d1ebb22f`; the revision is commits
`835ea011 → 005dc47d` (7 commits touching the REQ).

## Prior Findings — Disposition

Every v1 finding was addressed. Verification is against `main`, not this tree, per the REQ's own
v1.3 note; each row below states the check I ran.

| v1 | Sev | Disposition | Evidence |
|----|-----|-------------|----------|
| F-01 | High | **Resolved (document)** | `835ea011` restores the v1.2 base from the default branch and the v1.3 header states the v1.2 amendments are *not* withdrawn. The document no longer regresses settled ground. The branch-base half survives as G-01 below — a Medium, not a document defect. |
| F-02 | High | **Resolved** | §1's stale "exists at HEAD of the pdlc-consolidation-agent branch" paragraph now carries its 2026-08-13 correction, §5 carries the BL-01/BL-02/BL-03 correction, and frontmatter flips `ready: true`. Both depended-on features are archived (`main:docs/completed/pdlc-consolidation-agent/`, `main:docs/completed/pdlc-advisory-wave-gate/`). |
| F-03 | High | **Resolved** | REQ-WVR-05 is restated as *retention with invalidation*, matching `main:pdlc/workflows/orchestrate-dev.js:15607-15613` ("The record is KEPT — … so a later invocation of this same plan … skips Phase I"). G-4 is re-worded to match ("the record may survive a completed Phase I"). The residual tense problem is F-03 below, Low. |
| F-04 | High | **Resolved** | REQ-WVR-06 is narrowed to "the presence, absence, or message of a task's commit", gains a positive conjunct (the no-commit wave is treated as complete and the *next* wave is announced — no absence-only oracle), and adds an explicit carve-out for ancestry corroboration. That matches `headCorroborated` at `:15280`, applied at `:15307`. R-1 (§8) is re-attributed to IG-4 and downgraded to Low. |
| F-05 | Medium | **Resolved** | §4 now cites `M-WG-4`, `M-WG-6`, `M-WG-12` instead of restating them. All three exist: `main:docs/_constraints/pdlc-wave-gate-baseline.md` rows for M-WG-4, M-WG-6 (§1/§2) and M-WG-12 (§3). OB-2 is narrowed to the two genuinely new observations. Version-citation residue is G-02 below. |
| F-06 | Medium | **Resolved** | REQ-WVR-08 adds the all-green outcome, states its announcement, its own `⏭` phase row, and — the part I asked for — *how* REQ-WVR-03 is discharged when no wave runs. Both halves verify: the skip emit at `:15318-15334`, the `⏭` `recordPhase("I", …)` at `:15615-15621`, distinct from the `✅` row at `:15623-15630`. The three-outcome catalogue is closed with a set-equality obligation on PROPERTIES. |
| F-07 | Medium | **Resolved** | OQ-1 resolves to record deletion as the sole hatch, with the `startWave: 1` non-expressibility argument recorded. Corroborated: `const explicitPointer = startWave > 1` at `:15236`, and the ledger read is gated `if (!explicitPointer)` at `:15263`, so `startWave: 1` provably defers to the ledger. |
| F-08 | Low | **Resolved** | C-1 now cites the root-anchored ignore rule and its comment, and REQ-WVR-10 turns C-1 into a failing observable rather than an unverifiable constraint. |
| F-09 | Low | **Resolved** | OF-1 and OF-2 carry *Re-derive* commands; OF-3 is replaced by an `M-WG-*` citation, whose own baseline row carries a Measured-by command. |

My v1 questions are also answered in the revision: Q-01 by OB-1's "queue parity is free and TSPEC
owes only a test" plus REQ-WVR-07's new same-working-directory observable; Q-02 by the shipped
per-wave skip emit at `:15373-15380`, which does announce each skipped wave (my v1 premise was
wrong, and the REQ's original wording was right); Q-03 by REQ-WVR-08's explicit discharge
paragraph; Q-04 by R-1's re-attribution to IG-4 as *required*, not merely permitted; Q-05 by OB-3's
answer against the shipped A6 seam.

## Findings

No High findings. Three new Mediums and one Low, all in sections this revision changed; none
contests a contract, and none blocks FSPEC on its own.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-01 | Medium | Process | The branch-base obligation is recorded only in a dated header note, not as a prerequisite row or an obligation with an owner — so nothing gates FSPEC authoring on it, and FSPEC will be authored in a tree where neither the mechanism nor the cited baseline file exists. | v1.3 header note, §5, §9 |
| G-02 | Medium | Local | Every inline `orchestrate-dev.js:NNNN` line anchor in §1, §7 (WVR-05 note), §9 OB-1 and §9 OQ-1 is stale by ~2,200 lines and resolves to unrelated code at the default branch's HEAD, although every claim's *substance* verifies. The v1.3 note's assertion that "the code claims in this REQ are verified against the default branch" does not hold for the anchors. | §1, §7, §9 |
| G-03 | Medium | Local | OB-2's promotion recipe is concretely unexecutable: the baseline is at `Version 1.2 · 2026-08-20` with a §3 and a §4 already present, but OB-2 instructs adding "a new §3" and "bumping the baseline to 1.1", and §5's correction cites it as "v1.0, 2026-08-09". The baseline's own rule is that a consumer cites it *at its Version*. | §5 correction, §9 OB-2 |
| G-04 | Low | Local | REQ-WVR-05's preserved "Decided 2026-08-13" block still states in the present tense that "WVR-05 requires self-*clearing*", directly above/below the AC that no longer does. It is history, but it does not read as history. | §7 REQ-WVR-05 |

### G-01 — the branch-base step has no gate (Medium, Process)

The v1.3 header records it honestly: this branch is 1,637 commits behind the default branch,
"the code claims in this REQ are verified against the default branch, not against this branch's
tree, where the mechanism does not exist at all", and bringing the branch onto the current base is
"owed before FSPEC authoring". I agree that is a branch-management step and not a document change,
and I do not hold the revision responsible for performing it.

What is missing is the *gate*. Confirmed in this tree at `005dc47d`:

- `grep -c startWave pdlc/workflows/orchestrate-dev.js` → **0** (this tree's file is 11,003 lines);
- `docs/_constraints/pdlc-wave-gate-baseline.md` does not exist here, so §4's newly-added
  `M-WG-4` / `M-WG-6` / `M-WG-12` citations point at a file the next author cannot open.

§5 is where this REQ puts things that must be true before FSPEC authoring, and each row there
carries an explicit *Gating logic* column. The branch-base step meets that description exactly and
belongs there — as a BL-04 row whose gating logic is "checked at FSPEC authoring; the mechanism
and the baseline must be readable in the authoring tree" — rather than in a dated note that no
phase reads. Without it, R-4 (interim/final divergence) is the live risk: an se-author grounding
claims in *this* tree finds no ledger at all and can only conclude the wiring is missing, which is
precisely the "new code alongside" outcome BL-03 exists to forbid.

**Required change (non-blocking):** add the branch-base step as a §5 prerequisite row with gating
logic, or as an obligation in §9 with a named owner. Either makes it a checked precondition rather
than a remembered one.

### G-02 — the inline line anchors are stale at the branch they claim to cite (Medium, Local)

I checked each anchor against `main:pdlc/workflows/orchestrate-dev.js` (16,336 lines):

| REQ cites | What is actually there | Where the claim really lives |
|---|---|---|
| `:12171-12177` (§1 — `startWave` clamped to 1 with a notice) | an ownership-violation loop | `:15237-15243` |
| `:12128` (§1 — `scriptGate` requires `testCommand` + `_runCommand`) | a per-task `for` loop | `:15067`; the guard around the write is `if (scriptGate)` at `:15432` |
| `:12345-:12429` (§1 — the write inside `if (scriptGate)`) | halt-handling prose, then `approvalHashOf` | `:15528-15605` |
| `:12252-12267` (§7 — complete-record skip) | `parseWaveLedger`'s doc comment | `:15318-15334` |
| `:9976`, `:9992`, `:10029`, `:10087` (OB-1 — `WAVE_STATE_PATH`, `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`) | unrelated review-loop code | `:12214`, `:12230`, `:12267`, `:12325` |
| `:12191-12280` (OB-1 — read/decide) | mostly `parseWaveLedger`'s body | `:15228-15346` |
| `:12265`, `:12276` (OQ-1 — the two delete-to-force-a-full-run banners) | comment text and a bare `catch` | `:15331` and `:15341-15342` |

The good news is the part that matters most: **every one of these claims is substantively true.**
I re-verified the whole mechanism independently — `WAVE_STATE_PATH` (`:12214`), the `!explicitPointer`
gate (`:15263`), the four announced ignore reasons and the silent absent case, the complete-record
skip, the per-wave skip emit, the `⏭` row, and the ledger write nested inside `if (waveGit)` under
`if (scriptGate)`. The contract the REQ describes is the contract that ships. Only the coordinates
have drifted, because these numbers were measured on 2026-08-13 and the file has grown since.

Two things follow. First, the v1.3 note over-claims: the anchors were inherited, not re-verified,
and the note should say so. Second — and this is the durable fix — the REQ altitude bar is that a
REQ carries shipped-behaviour facts as **`M-*` ids cited from a constraints file**, not as inline
line-cited code claims, precisely because line numbers rot and `M-*` rows carry re-derivation
commands instead. §4 now does this correctly; §1, §7 and §9 do not. The right resolution is not to
renumber the anchors (they will rot again) but to move these facts into the wave-gate baseline
under OB-2 and cite them by id, or to anchor them by **symbol name** (`WAVE_STATE_PATH`,
`parseWaveLedger`, `formatWaveLedger`, `explicitPointer`, `headCorroborated`, `allWavesRecorded`),
which is grep-stable. A TSPEC author told to "ratify or revise this shipped contract, not invent
one" will find every one of those symbols in seconds; they will not find `:9976`.

**Required change (non-blocking):** re-anchor by symbol name or by `M-*` id, and soften the v1.3
note to say the code claims' *substance* is verified against the default branch while their line
anchors date from 2026-08-13.

### G-03 — OB-2's promotion recipe is written against a superseded baseline version (Medium, Local)

`main:docs/_constraints/pdlc-wave-gate-baseline.md` is at `Version | 1.2 · 2026-08-20`, and it
already carries `## 3. Facts added for the v1 cross-review round (measured 2026-08-18)` and
`## 4. The catalogue after pdlc-advisory-wave-gate shipped (measured 2026-08-20)`, ids running to
`M-WG-14`. OB-2 instructs the se-author to promote by "adding a new §3 … bumping the baseline to
1.1", and §5's correction describes the file as "v1.0, 2026-08-09". Executed literally, that
collides with an occupied section number and numbers the version backwards.

The file states the rule OB-2 is trying to honour: "A consumer cites this file **at its `Version`**;
a content change unaccompanied by a version bump" is the failure mode it guards. So the citation
version is load-bearing, not decorative — and citing 1.0 means the REQ is reasoning about a
snapshot two revisions old. Note this also interacts with OB-2's own live claim that "`M-WG-6` is
now false at HEAD": M-WG-6 survived the 1.1 and 1.2 revisions unchanged, so that observation is
still correct and still owed a correction in the baseline — worth stating against 1.2 so the next
editor knows the row was reviewed and left, not merely missed.

**Required change (non-blocking):** cite the baseline at `1.2`, and restate OB-2's recipe as "a new
`## 5.`, ids `M-WVR-1..2`, bumping to 1.3".

### G-04 — the WVR-05 decision record reads as current requirement text (Low, Local)

REQ-WVR-05's body is now correct (retention with invalidation). Immediately below it, the preserved
"Decided 2026-08-13" block opens: "The shipped interim ledger conflicts with this requirement as
written and is not being changed here. WVR-05 requires self-*clearing*: after Phase I completes, no
resume state survives." It closes with "The first is chosen below; WVR-05 above is already restated
accordingly", so a careful reader gets there — but three paragraphs of present-tense text asserting
the *rejected* requirement sit inside the AC section, and this is the exact place I flagged in v1 as
"the single most likely place for the FSPEC to implement a regression while believing it is
satisfying the REQ".

**Suggested change:** past-tense the block and label it explicitly as a superseded position (e.g.
"**Superseded — the position considered and rejected on 2026-08-13 was:** …"), or move it under a
`### Decision history` sub-heading. Content-preserving; it only changes what a skimmer takes as
operative.

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ-WVR-04's out-of-range boundary says a manual point past the last wave "is treated as a request for a full run, announced as such". Shipped behaviour is subtler and I think better: `explicitPointer` is computed **before** the clamp (`:15236` precedes `:15237-15243`), so an out-of-range pointer clamps to 1 *and still suppresses the ledger* — the operator gets a genuine full run rather than a silent auto-resume. That is the outcome the AC wants, reached by an ordering that is easy to "fix" into a regression. Should the AC say so explicitly, so a TSPEC that reorders the clamp above the `explicitPointer` computation fails an acceptance test rather than passing one? |
| Q-02 | REQ-WVR-08 says the all-green skip is announced "naming the reason and the force-a-full-run hatch". Shipped emit at `:15328-15334` names both. But the `⏭` phase row at `:15615-15621` names only the reason, not the hatch. Is the hatch required in *both* surfaces, or is the run-log banner sufficient? As written the AC is ambiguous about which surface carries what, and PROPERTIES will have to guess. |
| Q-03 | REQ-WVR-10 ("the record never becomes tracked content") is anchored to a `.gitignore` rule in the *consuming* repo. In a Claude-created worktree, `.worktreeinclude` governs what the tree carries and OB-1 already notes the ledger is absent there. Does REQ-WVR-10's guarantee need a worktree clause, or is "fails open to a full run, no record written, therefore nothing to track" the complete answer? I believe the latter, but the AC does not say it. |
| Q-04 | REQ-WVR-07's queue observable is "the record must resolve against the same working directory on both paths". Given OB-1's finding that the queue delegates in-process and forwards no implementation config, is there any way for this to fail other than a future change that gives the queue its own cwd? If not, PROPERTIES should own it as a regression guard and PLAN should budget a test, not work — worth saying which. |

## Positive Observations

- **The revision converged on evidence, not on argument.** Every one of my four Highs was resolved
  by moving the requirement to match a shipped behaviour that was independently verified, and in
  the one case where my premise was wrong (Q-02 in v1, per-wave skip announcements) the author kept
  the original wording rather than deferring to the reviewer. That is the right instinct.
- **REQ-WVR-06's rewrite fixes exactly the oracle problem, not just the wording.** The old text was
  an absence-only requirement ("does not consult commit presence"). The new one pairs the negative
  with a positive on the same path — the no-commit wave is treated as complete and the *next* wave
  is announced as the resume point — and then names that announcement as the oracle. A test written
  against it fails when the determination regresses, which a test written against the old wording
  could not.
- **REQ-WVR-02's IG-1..5 catalogue is set-equal to the shipped branch ladder**, which I checked
  arm by arm: `ledger.reason` (IG-1), feature mismatch (IG-2), `planHash` mismatch (IG-3),
  `!headCorroborated` and `lastGreenWave > waves.length` (IG-4, correctly fused since both are
  "the record describes a tree this isn't"), and the `{state: null, reason: null}` fall-through
  for absent/empty/`{}` (IG-5, correctly identified as the *silent* one). Five causes, four
  announced, one silent — and the AC says out loud that deleting one is a deliberate change and
  demands set-equality rather than containment in PROPERTIES. This is the strongest section of the
  document.
- **REQ-WVR-09 is grounded in the shipped guard rather than inventing one.** The ledger write sits
  inside `if (waveGit)` (`:15528`, write at `:15599`) with a comment giving the same reason the AC
  gives — "without a git transport this run made no commits, and recording the wave green would
  strand that wave's uncommitted work". Promoting R-2 from a deferred FSPEC concern to a P0 AC with
  a traceable acceptance test is the correct response to my v1 note.
- **REQ-WVR-08's discharge paragraph answers the hard half of the question.** It would have been
  easy to add the all-green AC and leave REQ-WVR-03 vacuously satisfied. Instead it states *why*
  the guarantee holds when no gate runs — the phase lands no commit, so there is nothing for a
  verification to precede — and names the violating implementation ("an implementation that commits
  anything in Phase I under this outcome violates REQ-WVR-03"). That is a testable statement.
- **The altitude discipline held through a large revision.** Ten ACs, three new, and not one of
  them names a seam signature, a file format, or an algorithm. OB-1 still carries all of that. It
  is unusual for a REQ to grow by 40% without leaking contract material downward.

## Recommendation

**Approved with minor changes**

All four of my v1 High findings are resolved, and I verified each resolution against the shipped
code on the default branch rather than against the document's own account of it. The requirement
set now matches the mechanism that ships: retention with invalidation (WVR-05), commit-presence
narrowed with an ancestry carve-out (WVR-06), the all-green skip as its own outcome with an
explicit REQ-WVR-03 discharge (WVR-08), and a closed five-member ignore catalogue that is set-equal
to the shipped branch ladder (WVR-02). Nothing in the revision broke a section I approved in v1.

The four findings above are all non-gating and can be addressed in the FSPEC round or as a small
follow-up edit to this REQ:

1. **G-01** — give the branch-base step a gate (a §5 prerequisite row), so FSPEC is not authored in
   a tree where the mechanism and the cited baseline are both absent. This is the one I would fix
   first, not because the document is wrong but because the next phase is where it bites.
2. **G-02** — re-anchor the inline code citations by symbol name or `M-*` id rather than by line
   number, and soften the v1.3 note's verification claim to match what was actually re-checked.
3. **G-03** — cite the wave-gate baseline at `1.2` and restate OB-2's promotion recipe against the
   sections that now exist.
4. **G-04** — mark the superseded WVR-05 position as history so it cannot be read as operative.

I have raised no `ERRATUM` lines: this REQ is the upstream-most artifact of its feature, and the
only external document it depends on — `docs/_constraints/pdlc-wave-gate-baseline.md` — is a
constraints file rather than a pipeline document type, with its known defect (`M-WG-6` is false
since the ledger merged) already recorded inside this REQ's OB-2 for promotion time.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}
