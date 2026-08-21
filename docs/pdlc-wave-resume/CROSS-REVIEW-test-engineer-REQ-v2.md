# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review of the v1.0 → v1.3 revision (`0ed6a731..005dc47d`), testing lens

## Verification Method

The v1.3 amendment relocates the REQ's evidentiary base: code claims are declared verified
against **the default branch**, not this branch, which is 1,637 commits behind
(`git rev-list --count HEAD..origin/main` → `1637`). I re-verified every code claim in the delta
against `origin/main` at `345ae358`, reading `git show origin/main:pdlc/workflows/orchestrate-dev.js`
rather than this branch's tree — the same base the document asks its reader to use.

Two mechanical checks worth naming, because they are what the delta's new claims turn on:

- **`.gitignore` anchor (C-1, REQ-WVR-10).** `origin/main:.gitignore:41` carries
  `/.claude/pdlc-wave-state.json`, root-anchored, directly below `/.claude/workflows/` at `:40`,
  with the comment at `:23-:35` explaining why the anchor matters for the checked-in
  covered-violations fixture tree. The claim is exactly true as scoped.
- **The resume decision block.** `origin/main:pdlc/workflows/orchestrate-dev.js` — `WAVE_STATE_PATH`
  is defined near the top of the ledger section, `parseWaveLedger` returns the three-outcome shape
  the REQ describes, and the read/decide ladder runs feature → planHash → ancestry →
  `lastGreenWave > waves.length` → `=== waves.length` → resume, each rejection an `emit` notice and
  a full run. Every branch the REQ's IG catalogue names is present and each announces, and the
  absent/empty/`{}` case is genuinely silent. The catalogue matches the mechanism.

One live-tree observation matters to the delta and is recorded here rather than inferred:
`.claude/pdlc-wave-state.json` **exists in this working copy right now** (161 bytes, mtime
2026-08-21 00:41), recording `feature: "pdlc-advisory-wave-gate"`, `lastGreenWave: 7`, with a
`head` sha. `git ls-files` does not list it, so the untrackedness half of C-1/REQ-WVR-10 holds in
practice as well as by rule.

## Disposition of Round-1 Findings

All ten round-1 findings are closed. The two blocking ones are closed on their merits, not by
restatement.

| Round-1 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 — REQ-WVR-04 unwritable when the manual point is its default | High | **Resolved** | §7 REQ-WVR-04 gains the *Boundary* paragraph: a manual point equal to the plan's first wave is **defined as not an explicit setting**, the automatic determination is consulted, provenance announces as automatic. This matches the shipped ladder exactly (`explicitPointer = startWave > 1`, ledger read guarded by `if (!explicitPointer)`), and the third reading I flagged — a point past the last wave — is now stated too, as a full run announced as such, which is also what the clamp does (the clamp runs *after* `explicitPointer` is computed, so the ledger stays unconsulted). The AT's *When* is now writable in all three cases. |
| F-02 — R-2's strand-prevention property was a risk with no AC | High | **Resolved** | §7 REQ-WVR-09 promotes it to a P0 acceptance criterion with a positive oracle: implementation starts at *that same wave*, not after it, and announces it as not previously completed. §8 R-2 is re-attributed to it ("the acceptance test traces to REQ-WVR-09 rather than being deferred to the FSPEC"). The *Given* is reachable at HEAD — the ledger write is downstream of the commit step, so a run that verifies without committing records nothing. |
| F-03 — OF-1's "15-wave plan" did not reproduce | Medium | **Resolved** | §4 OF-1 now reads **16** waves (17 counting Phase PT's appended V-wave) and carries the re-derivation command. Matches my own derivation. |
| F-04 — "each re-invocation paid seven no-op dispatches" overgeneralised | Medium | **Resolved** | §4 OF-1 now distinguishes the wave-4 halt (seven) from the wave-2 halt (one task, `T00`) and restates the cost as "the task count of every wave below the halted one". |
| F-05 — REQ-WVR-06 was an absence-only oracle | Medium | **Resolved** | REQ-WVR-06 keeps the negative clause but pairs it on the same path with a positive conjunct — the no-commit task's wave is treated complete and the re-invocation announces the **next** wave — and names that announcement as the oracle. The SE F-04 carve-out correctly excludes ancestry corroboration from "archaeology", which is the right line: falsifying a record is not deriving completion from commits. |
| F-06 — REQ-WVR-02's rejection reasons were open-ended | Medium | **Resolved** (one residual, G-02 below) | REQ-WVR-02 now carries the closed IG-1..5 table and explicitly owes PROPERTIES a set-equality check rather than containment. The five rows do cover every rejection branch in the shipped ladder. |
| F-07 — C-1 had no acceptance criterion | Medium | **Resolved** | REQ-WVR-10 is the observable, and C-1's precedent claim is now true rather than borrowed: the resume record has its own root-anchored ignore rule at `origin/main:.gitignore:41`, not merely a sibling's. |
| F-08 — REQ-WVR-05's clearing lifecycle contradicted the shipped ledger | Low | **Resolved** | Restated as retention-with-invalidation, with the decision and its accepted cost recorded. The "staleness is a property the reader proves, not one the writer promises" framing is the testable one — it puts the burden on three checks a test can drive. |
| F-09 — "exists at HEAD" was ambiguous about which HEAD | Low | **Resolved** | The v1.3 header note states plainly that claims are verified against the default branch and not against this branch, "where the mechanism does not exist at all". A reader now knows which tree to grep. |
| F-10 — REQ-WVR-07 was a restatement, not an oracle | Low | **Resolved** | REQ-WVR-07 now names the queue-specific observable that can fail while REQ-WVR-01..05 pass: same working-directory resolution on both paths, so a resume point that differs between a direct and a delegated run of the same feature and plan fails the AC. That is a differential oracle a test can drive. |

## Findings

New findings only — round-1 findings are dispositioned above and are not restated here.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-01 | High | Local | §1's operational-finding block routes four "shipped preconditions" to the FSPEC as the concrete gap this feature closes. Precondition 1 is false at the default branch: the ledger write is gated on the **git transport** (`if (waveGit)`), not on `if (scriptGate)`, so a self-report-gate run with a git transport records normally. The block's headline conclusion — the ledger "has never once fired here" — is also falsified by the live tree, which carries a written record. An FSPEC oracle derived from this list would pin a defect that does not exist. | §1 operational finding, items 1 and the two "consequences" |
| G-02 | Medium | Local | IG-4 bundles two independent rejection mechanisms into one catalogue row (over-range `lastGreenWave`, and a recorded commit not reachable from HEAD). The set-equality check REQ-WVR-02 owes PROPERTIES is over the five *rows*, so deleting the ancestry check alone leaves the enumeration intact and the test green — precisely the regression R-1 now leans on IG-4 to prevent. | §7 REQ-WVR-02 (IG-4), §8 R-1 |
| G-03 | Medium | Local | §5's correction and OB-2 both state the wave-gate baseline is "v1.0, 2026-08-09". At the default branch it is **v1.2, 2026-08-20**. OB-2's promotion instruction — "bumping the baseline to 1.1" — would therefore be a version *downgrade*, and its instruction to re-check M-WG-6 was written against a two-versions-old file. | §5 correction, §9 OB-2 |
| G-04 | Low | Process | Every code citation added in this revision is a raw `orchestrate-dev.js:NNNN` line anchor, and every one of them is stale against the default branch it claims to cite (e.g. the clamp cited as `:12171-12177`, the ledger constants as `:9976`/`:9992`/`:10029`/`:10087`, the read/decide block as `:12191-12280`). Per DEC-DOC-01 a raw line anchor is a Low `Process` finding on its own; stale ones additionally make the claims uncheckable by the reader they were added for. | §1 correction, §9 OB-1, OQ-1 |
| G-05 | Low | Local | REQ-WVR-08 requires the full-skip outcome be "recorded as its **own** phase row, visibly distinct from a Phase I that executed". The shipped behaviour records the *same* row id `I` with a distinct `⏭` status. Two ATs can be written from this sentence — one asserting a second row, one asserting a status glyph on the existing row — and only one can pass. | §7 REQ-WVR-08 |

## Finding Detail

### G-01 — the FSPEC-bound "shipped preconditions" list contains a false precondition (High, Local)

§1's operational-finding block is not background prose. The REQ says of it: *"Four shipped
preconditions explain it, and each fails routinely — this list is the concrete gap this feature
closes, and it belongs in FSPEC as such."* It then draws two consequences that reach directly into
downstream oracle design: *"what is being formalized is a mechanism that has never once fired here,
so the FSPEC's oracle must be an observed resume, not the presence of the code path"*, and *"a
record that is never written cannot fail to be cleared."* Everything downstream of this block is
sized by it. It has to be true.

**Precondition 1 is false at the default branch.** The REQ states: *"The write sits inside the
`if (scriptGate)` branch, and `scriptGate` requires both `implementation.testCommand` and a
`_runCommand` seam, so a self-report-gate run records nothing, ever."* On `origin/main` the
`if (scriptGate)` block opens and closes entirely above the commit step — it holds the gate
sequence and its `else` arm falls through to `evaluateBatchGate`. The commit loop that follows
opens a **sibling** `if (waveGit)` at the same indentation, and the ledger write sits inside *that*
block, two statements after the per-task commits and the `rev-parse HEAD` that stamps `head`. The
code's own comment states the actual guard: *"The ledger records COMMITTED waves only, which is why
it is written here and not next to the gate: without a git transport this run made no commits."*

The consequence is the opposite of the REQ's: the write is gated on the **git transport**, not on
the script-owned gate. A self-report-gate run *with* a git transport commits its waves and records
them normally. The second half of the sentence — "so a self-report-gate run records nothing, ever"
— has no mechanism behind it at HEAD.

**The block's headline conclusion is falsified by the tree.** The block opens: *"the interim ledger
is merged but is not, in practice, resuming anything… no `.claude/pdlc-wave-state.json` exists
anywhere in this repo, including its worktrees."* That was a dated observation, but the REQ carries
its conclusion forward as a live directive. In this working copy the file exists now and is
well-formed:

```
{ "version": 1, "feature": "pdlc-advisory-wave-gate", "planHash": "3237cc92",
  "lastGreenWave": 7, "head": "8b13bd41…" }
```

Seven waves recorded green, with the `head` stamp that only the ancestry-corroborating writer
produces. The mechanism has fired, and recently. The record is untracked (`git ls-files` does not
list it), which is the good half — but "never once fired here" is no longer a statement about this
repository.

**Why this is a testing finding rather than a correction of fact.** Apply the write-the-test-right-
now check to precondition 1. The AT it implies is *"given a wave-mode run with a git transport and
no `implementation.testCommand`, assert no ledger write occurs."* Written against HEAD that test
goes **red on arrival**, and the honest fix is to delete the requirement, not the code. Worse, the
block is what tells the FSPEC author how much of the mechanism to treat as broken; a fabricated
quarter of the gap invites a remediation task with no defect under it, and the AT for that task can
only be satisfied by *introducing* the `scriptGate` coupling — a real regression, since it would
stop recording waves that were genuinely committed, which is exactly what REQ-WVR-09 forbids in the
other direction. The two requirements would be in direct conflict.

**What must change.** Re-verify the four preconditions against the default branch as of this
revision and rewrite the block to what survives. Precondition 1 should either be deleted or
restated as the true guard (*the write requires a git transport; a run without one verifies but
does not commit and therefore records nothing* — which is REQ-WVR-09's premise, already correct
elsewhere in the document). Preconditions 2, 3 and 4 I re-checked and they hold: the write is
downstream of the commit step so a halted wave records nothing; a `planHash` mismatch is ignored
with an announced reason; and a recorded commit that is not an ancestor of HEAD is ignored with an
announced reason, which Phase DOD's rebase can produce. The "has never once fired here" sentence
needs re-dating or replacing with the current observation, and the derived instruction — that the
FSPEC's oracle must be an observed resume rather than the presence of the code path — is worth
keeping on its own merits, but it should rest on the argument that a code path is not an oracle,
not on a claim about the tree that the tree now contradicts.

### G-02 — IG-4's bundling defeats the set-equality check REQ-WVR-02 asks for (Medium, Local)

REQ-WVR-02 does the right thing in closing its catalogue and in naming set-equality rather than
containment as the check PROPERTIES owes. The residual is granularity. IG-4 reads: *"it records
more waves complete than this plan has, **or** names a commit no longer reachable from the current
branch tip"*. Those are two independent guards in the shipped ladder — an integer range test and an
ancestry probe — with different failure modes and different fixtures. A set-equality assertion over
`{IG-1, IG-2, IG-3, IG-4, IG-5}` is satisfied while only one of IG-4's two halves survives, so the
one regression the ancestry check exists to catch (a re-cut or rebased branch, which §8 R-1 now
explicitly delegates to IG-4 and calls its "first-line mitigation") is invisible to the very check
designed to make deletions fail.

Split IG-4 into IG-4 (over-range record) and IG-5 (unreachable recorded commit), renumbering the
silent case to IG-6, so the enumeration is one row per mechanism and set-equality is falsifying for
each. The cost is one row; the benefit is that R-1's Low rating stays earned.

### G-03 — the wave-gate baseline is two versions past what §5 and OB-2 describe (Medium, Local)

§5's correction and OB-2 both pin `docs/_constraints/pdlc-wave-gate-baseline.md` at "v1.0,
2026-08-09". On the default branch that file's version table records **1.2, dated 2026-08-20**. Two
concrete downstream effects, which is why this is not a date nit:

1. OB-2 instructs the se-author to promote the two genuinely-new observations by "bumping the
   baseline to 1.1". Executed literally that is a version regression on a file whose own control
   rule requires a bump on any content change — the successor edit would land as 1.3.
2. OB-2's correction that "M-WG-6 is now false at HEAD" was reasoned against 1.0. It happens to
   still hold — M-WG-6 at 1.2 still reads that a re-invocation re-enters Phase I at wave 1 and
   re-dispatches every wave — so the finding survives, but it was luck rather than verification,
   and the promoted section must say which baseline version it was checked against.

Restate both references as "at the version current when promotion runs" and have OB-2 name the
re-check rather than the number.

### G-04 — stale raw line anchors throughout the new material (Low, Process)

Per DEC-DOC-01 (`docs/_decisions/DECISIONS-review-severity-bars.md`), a citation written as a raw
`file:line` anchor rather than a symbol, heading, or verbatim quote is a Low `Process` finding.
This revision adds a large number of them and every one I checked is off by roughly 2,200–3,000
lines against the default branch it claims to cite: the `startWave` clamp is cited as
`:12171-12177`, `WAVE_STATE_PATH` as `:9976`, `computePlanHash` as `:9992`, `parseWaveLedger` as
`:10029`, `formatWaveLedger` as `:10087`, the read/decide block as `:12191-12280`, the complete-record
skip as `:12252-12267`, the writes as `:12284`/`:12429`, and the `scriptGate` definition as `:12128`.

The behaviours behind those anchors are, with G-01's exception, correct — so this is precision, not
correctness. But the anchors were added specifically so a reviewer could check rather than believe,
and in their current state they cannot serve that purpose. Cite the exported symbol names
(`WAVE_STATE_PATH`, `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`) and the distinctive
banner strings ("Skipping Phase I (wave ledger", "Delete … to force a full run"), which are stable
under the line drift that 1,637 commits produce. §4's OF-1 already models this well with its
*Re-derive:* command.

### G-05 — REQ-WVR-08's "own phase row" admits two incompatible ATs (Low, Local)

REQ-WVR-08 requires the full-skip outcome be "recorded as its **own** phase row, visibly distinct
from a Phase I that executed". Shipped behaviour records the same phase id `I` with the label
`Implementation`, a `⏭` status, and a "Skipped — all N waves previously committed and recorded
green (wave ledger)" detail. Read one way the AC asks for an additional row; read the other it asks
for a distinguishable status on the existing one. Since the REQ's job here is the observable, say
which: "the run report's Phase I row carries a skip status and a reason naming the ledger, distinct
from the status an executed Phase I carries" is testable and matches HEAD. The rest of REQ-WVR-08 —
particularly the explicit reasoning about how REQ-WVR-03 is discharged when no gate runs — is
unusually well constructed and needs no change.

## Questions

## Positive Observations

## Recommendation

## Verdict
