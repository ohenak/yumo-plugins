# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3
**Scope:** Technical lens, delta re-review of v1.4 against my v2 findings (G-01..G-04).

## Prior Findings Disposition

**Delta base:** v2 reviewed `005dc47d`; this revision is `115019b6..f256d767` (6 commits touching
the REQ), document version 1.3 → 1.4. Every check below was re-run against `main`
(`pdlc/workflows/orchestrate-dev.js`, the tree this branch does not yet carry — BL-04).

| v2 | Sev | Disposition | Evidence |
|----|-----|-------------|----------|
| G-01 — branch-base step has no gate | Medium | **Resolved** | §5 gains row **BL-04** with an explicit *Gating logic* cell ("Checked at FSPEC authoring: the resume mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` must both be readable in the authoring tree"), and the base note now ends "it is BL-04 (§5)" instead of trailing off into prose no phase reads. This is exactly the shape I asked for: a prerequisite row, not a dated remark. |
| G-02 — stale inline line anchors | Medium | **Resolved** | `grep -n ':[0-9]\{3,\}' REQ-pdlc-wave-resume.md` now returns **zero** hits; §1, §7 and §9 cite by symbol (`WAVE_STATE_PATH`, `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`, `writeWaveLedger`, `explicitPointer`, `headCorroborated`, `allWavesRecorded`) and by banner string. Every symbol resolves on `main`: `WAVE_STATE_PATH` `:12214`, `computePlanHash` `:12230`, `parseWaveLedger` `:12267`, `formatWaveLedger` `:12325`, `explicitPointer` `:15236`, `headCorroborated` `:15280`, `allWavesRecorded` `:15262`, `writeWaveLedger` `:15350`. The test citation also resolves: `waveExecution.test.js:2239` `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")`. The base note's verification claim is correctly softened to "**substance** verified … while any positional anchor … is not re-verified". One residue only, F-02 below. |
| G-03 — OB-2 recipe written against a superseded baseline | Medium | **Resolved, and improved past what I asked** | The baseline is cited at `Version | 1.2 · 2026-08-20` (matches `main:docs/_constraints/pdlc-wave-gate-baseline.md:7`), sections through `## 4.` are acknowledged as occupied (they are) and ids through `M-WG-14` (correct — `M-WG-14` is the last row). Rather than hard-coding "§5 / bump to 1.3", the recipe now says *re-read at the version current when promotion runs, append the next unoccupied section, bump to the next version above the one found* — which is robust to the baseline moving again before promotion. M-WG-6 is downgraded from "is now false" to "needs a re-check, not an assumed correction", which is the honest reading. |
| G-04 — WVR-05's rejected position read as operative | Low | **Resolved** | The block is now headed "**Superseded — decision history, 2026-08-13 (SE G-04)**", written in the past tense throughout ("The position considered and *rejected*"), and closes "Nothing in this block is operative; WVR-05 above is the requirement." A skimmer can no longer take the rejected requirement for the live one. |

My v2 questions are answered by the revision as well: Q-01 by OB-1's new sentence that `explicitPointer`
is computed *before* the out-of-range clamp (verified: `:15236` precedes `:15237-15243`, so a
past-the-end pointer does still suppress the ledger); Q-02 by REQ-WVR-08's new surface split (the
hatch is owed on the run-log message only, not on the report row).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | §1's rewritten operational finding deletes a true precondition and replaces it with a false claim about shipped behaviour: the ledger write **is** guarded by the gate mode. A self-report-gate run records nothing, transport or not. | §1, "Operational finding, 2026-08-13, re-verified 2026-08-21", item 1; also §9 OB-1's `writeWaveLedger` sentence |
| F-02 | Low | Local | OQ-1's replacement re-derivation command — grep for the banner string `to force a full run` — returns **one** hit, not the two the sentence claims, because the skip banner's literal is line-wrapped in source. | §9 OQ-1 |
| F-03 | Low | Local | The same §1 list is introduced as "three shipped preconditions **discard** the record", but item 1 describes a record that is never written, not one that is discarded. | §1, list preamble |

### F-01 — "guarded by the git transport, not by the gate mode" is false at HEAD (High, Local)

v1.3's item 1 read: *"The write sits inside the `if (scriptGate)` branch … so a self-report-gate run
records nothing, ever."* That sentence was correct. v1.4 deletes it and asserts the opposite:

> The write is guarded by the **git transport**, not by the gate mode: a run with no transport
> verifies but commits nothing and therefore records nothing, which is REQ-WVR-09's premise. A
> self-report-gate run *with* a transport records normally.

Both guards are in force at HEAD of the default branch, nested one inside the other:

| Line (`main:pdlc/workflows/orchestrate-dev.js`) | Source |
|---|---|
| `:15432` | `        if (scriptGate) {` — opens; closes at `:15605` |
| `:15531` | `        if (waveGit) {` — opens *inside* it; closes at `:15604` |
| `:15600` | `          await writeWaveLedger(` — inside both |

Brace-depth check (mechanical, not by eye): depth from `:15432` to `:15600` is `+1`, and from
`:15531` to `:15600` is `+1`, so the write is lexically inside **both** blocks. `scriptGate` itself
is `Boolean(implConfig.testCommand) && typeof runCommandFn === "function"` (`:15067-15068`), and
wave mode still runs when it is false — `:15196-15204` emits *"the script-owned test gate is
unavailable … Falling back to the agents' self-reported test results for every wave of this run"*
and proceeds. In that mode the whole `:15432` block is skipped, so the run performs **no per-task
commits either** (all three `commitPaths` call sites — `:15540`, `:15558`, `:15571` — are inside
it) and writes no ledger. The claim's corollary, "a self-report-gate run *with* a transport records
normally", is therefore false: with a transport and no `testCommand`, nothing is committed and
nothing is recorded.

Why this is High rather than a wording nit. §1 states this list "is the concrete gap this feature
closes, and it belongs in FSPEC as such" — it is scope-defining input to the next phase, and it is
now enumerated as a closed count ("**three** shipped preconditions"). An FSPEC author grounding on
v1.4 would (a) not specify behaviour for the self-report-gate mode at all, and (b) if they did,
specify that a transport-carrying self-report run records normally — which is the shipped
behaviour's opposite, so the property test written from it fails against HEAD or, worse, passes
against a fake that reproduces the REQ rather than the code. This is the exact class of defect the
existing-code-claim check exists to catch, and unlike the v1.3 anchors (whose *substance* held),
here the substance is what changed.

The fix is small and does not undo the good part of the rewrite: keep the transport half (it is
true and it is REQ-WVR-09's premise), restore the gate-mode half as its own numbered precondition,
and re-count. Suggested replacement for item 1:

> 1. The write is guarded twice over. It sits inside the script-owned-gate branch, so a run whose
>    gate has degraded to the agents' self-report scan (`implementation.testCommand` or the
>    `_runCommand` transport absent) commits nothing and records nothing, ever; and inside that
>    branch it sits under the git-transport guard, so a run that verifies but has no transport to
>    commit through records nothing either — which is REQ-WVR-09's premise.

with the preamble's count moved from "three" to "four" (or, better, left uncounted — see F-03).
Note this also restores the reading that reconciles §1 with the §9 sentence "a run with no
transport … fails open to a full run", and OB-1's own description ("nested inside the wave loop's
git-transport branch") should gain "inside the script-owned-gate branch" for the same reason.

### F-02 — OQ-1's grep recipe reproduces one of the two banners it claims (Low, Local)

OQ-1 now reads: *"announced in both banners (grep `orchestrate-dev.js` for the banner string
`to force a full run` — one under the complete-record skip, one under the mid-plan resume)"*. The
substance is right — both banners do name the hatch — but the command does not demonstrate it:
`grep -c "to force a full run"` returns **1**. Only the mid-plan resume banner (`:15341-15342`)
carries the phrase on one line; the complete-record skip banner breaks it across a string
concatenation (`:15331` ends `` `…to force a ` `` and `:15332` opens `` `full run.` ``). A reader
following the recipe finds one banner and may conclude the other lacks the hatch. A recipe that
survives the wrap: `grep -n "force a$\|force a full run\|^ *\`full run" pdlc/workflows/orchestrate-dev.js`,
or anchor on the two symbols instead — the skip banner is the `allWavesRecorded` emit, the resume
banner the `ledgerResume` emit. This is the same class as G-02 (a citation that does not resolve),
which is why it is Low and not a nit: the whole point of moving to greppable anchors was that the
grep runs.

### F-03 — "discard" mis-describes one member of the list (Low, Local)

The preamble reads "three shipped preconditions **discard** the record under conditions this
pipeline meets routinely". Items 2 and 3 (planHash change, non-ancestor commit) do discard a record
that exists. Item 1 describes a record that is never written in the first place — nothing is
discarded. The distinction matters downstream because discarding is a *reader* behaviour
(REQ-WVR-02's IG catalogue owns it) while never-writing is a *writer* behaviour (REQ-WVR-09 owns
it), and the FSPEC will assign them to different flows. "…preconditions keep the record from
reaching the next run — some by never writing it, some by discarding what was written…" separates
them without lengthening the paragraph.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Once F-01's gate-mode precondition is restored, does it stay in FSPEC scope as a *behaviour to change* or only as a *condition to state*? "Formalize and replace, never duplicate" (BL-03) leaves both readings open: a resume mechanism that records nothing under a self-report gate may be acceptable (that mode commits nothing either, so there is nothing to resume past), in which case the FSPEC should say so explicitly rather than leave the reader to infer it from the absence of an AC. |
| Q-02 | REQ-WVR-02's table lists IG-4 (over-range) before IG-5 (ancestry); the shipped ladder tests ancestry first (`:15307`) and over-range second (`:15315`). A record that is both non-ancestral and over-range therefore announces the ancestry reason, not the over-range one. The AC does not claim an order — should PROPERTIES pin the shipped precedence for the overlapping case, or is the announced reason free to be either? Left unstated, a test author will guess, and either guess pins something the REQ did not decide. |
| Q-03 | §1 now cites this working copy's own untracked record (`pdlc-advisory-wave-gate`, `lastGreenWave: 7`, `head` stamped) as evidence the mechanism fires — I verified it, it is exactly as described and untracked. Is that observation owed to the wave-gate baseline as an `M-WVR-*` fact under OB-2 (it is the first positive evidence of a write in this repo), or does it stay a REQ-local observation? It is the kind of fact that will be re-measured by whoever reads this next. |

## Positive Observations

- **The correction to §1 was made on evidence, and it corrects the right thing.** The 2026-08-13
  finding ("no `.claude/pdlc-wave-state.json` exists anywhere in this repo") had become false, and
  the revision does not paper over it: it names the surviving record, its feature, its seven green
  waves and its `head` stamp, and re-frames the finding from "never fires" to "fires narrowly". I
  checked the file — `feature: "pdlc-advisory-wave-gate"`, `lastGreenWave: 7`,
  `head: 8b13bd41…`, untracked (`git ls-files --error-unmatch` fails on it). Retiring your own
  headline observation when the tree stops supporting it is the harder half of re-verification.
- **The IG-4/IG-5 split makes the catalogue set-equal to the shipped ladder, arm for arm.** I
  re-walked `:15296-15346`: `ledger.reason` (IG-1), feature mismatch (IG-2), `planHash` mismatch
  (IG-3), `lastGreenWave > waves.length` (IG-4), `!headCorroborated` (IG-5), and the
  `{state: null, reason: null}` fall-through covering absent/empty/`{}` (IG-6, silent). Six causes,
  five announced, one silent — and the AC's new sentence names *why* the split matters ("fusing
  them would let the ancestry guard be deleted without the enumeration changing"), which is a
  set-equality argument stated in prose, not just an instruction to write one.
- **REQ-WVR-08's surface split is now precisely what ships.** "One row with a distinguishing
  status, not a second row" matches `:15614-15630` exactly: a single `recordPhase("I",
  "Implementation", …)` call in either arm, `⏭` with "Skipped — all N waves previously committed
  and recorded green (wave ledger)" against `✅` with "All N waves complete (wave mode, …)". The
  hatch really is on the run-log emit only (`:15329-15334`), never on the row — the AC now says so,
  so PROPERTIES will not go looking for it in the report.
- **OB-2's recipe is now version-robust rather than version-correct.** Telling the promoter to bump
  to "the next version above the one found — never to a fixed number written here" is a better
  answer than the one I asked for, and it will not rot the way "bump to 1.3" would have.
- **Still no contract material leaked downward.** Ten ACs across four revisions and not one names a
  seam signature, a file format, or an algorithm; everything mechanical remains in OB-1 where the
  TSPEC will find it.

## Recommendation

**Needs revision**

All four of my v2 findings (G-01..G-04) are resolved, and I verified each against the code rather
than against the document's account of itself. The revision is a net improvement: the citations are
greppable, the branch-base step has a gate, OB-2's recipe is executable, and the superseded WVR-05
position can no longer be misread as operative.

One new **High** blocks approval, and it is a delta defect, not an inherited one: §1's rewrite of
the operational finding deleted a *true* precondition (the write is inside the script-owned-gate
branch) and replaced it with its negation ("guarded by the git transport, **not** by the gate
mode … a self-report-gate run *with* a transport records normally"). At HEAD of the default branch
the write at `orchestrate-dev.js:15600` is nested inside `if (scriptGate)` (`:15432`) *and*
`if (waveGit)` (`:15531`), and a wave-mode run with a degraded gate (`:15196`) commits nothing and
records nothing. Because §1 declares that list the concrete FSPEC scope, shipping it as written
hands the next phase a false premise about the mechanism it is meant to formalize.

What must change to reach approval:

1. **F-01** — restore the gate-mode precondition alongside the transport one, and re-count the
   list. Suggested text is in the finding; it keeps every other improvement in the rewritten
   paragraph. OB-1's `writeWaveLedger` sentence needs the same conjunct.

Non-gating, addressable in the same edit:

2. **F-02** — replace OQ-1's grep recipe with one that finds both banners, or anchor on the
   `allWavesRecorded` / `ledgerResume` emits.
3. **F-03** — separate "never written" from "discarded" in the §1 preamble.

No `ERRATUM` lines: this REQ is the upstream-most pipeline artifact for the feature, and the only
external document it depends on (`docs/_constraints/pdlc-wave-gate-baseline.md`) is a constraints
file, whose owed correction is already carried as OB-2 rather than as an erratum.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}
