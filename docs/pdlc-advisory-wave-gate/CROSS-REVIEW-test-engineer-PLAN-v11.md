# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 11 (upstream-cascade confirmation; PLAN bytes unchanged since `b902f40b`)

## Overview

**Scope of this round.** PLAN's own bytes have not moved since `b902f40b`, the commit my v10 approval
was recorded against. One upstream document moved: TSPEC, in the Phase-P erratum `1f2a4fbf`
(*"size PROP-SWEEP-2(b) residue in 1.3 and route it to PLAN"*), +18/-1. I read my v10 review, read the
erratum diff, re-read the TSPEC text PLAN now leans on at its current bytes, and re-measured every
figure the two documents now share against HEAD. The single question answered here is whether PLAN is
still a faithful compression of its upstream as that upstream now stands — not whether the routed
item landed.

**Upstream hashes verified at dispatch.** `shasum -a 256` over the four upstream documents reproduces
all four dispatch hashes exactly: REQ `817b6745…`, FSPEC `82f74a2d…`, DECISIONS `25f8e954…`, TSPEC
`1531143c…`. TSPEC is the only one that moved since my v10 UPSTREAM-STATE line, which recorded TSPEC
at `4a092e85…`; REQ, FSPEC and DECISIONS are byte-identical to what I approved against.

**What the erratum did.** It added one paragraph to TSPEC §1.3 (*"Sizing the hygiene residue, and
where it is owned"*) and one sentence to the §0 changelog. The paragraph stops sizing `e3b9d5a3`'s
residue as the `.bak` blobs alone; it now states `PROP-SWEEP-2(b)`'s residual as **28 tracked paths in
three classes at PLAN's dated 2026-08-19 measurement**, names the classes (14 `.bak` blobs; four
consumer-runtime artifacts; this feature's own tracked documents), states that untracking the `.bak`
class closes **14 of the 28**, and then explicitly disclaims ownership: *"The partition, the owners,
the disposition of each class and the figures themselves are owned by PLAN's Overview HEAD-drift note
and A6-00's Edit 1."* No design claim moved and the disposition is not re-litigated.

**Why that is a cascade and not a no-op for PLAN.** Before this erratum, the 28/14 figures lived in
PLAN alone, and my v10 recorded — as a non-gating DEFERRED — that PLAN's dated integer had already
drifted (28→30, class 3 10→12) on the very day it was measured, reconciled only by PLAN's own
"+1 per committed cross-review file" rule. The erratum promotes those figures into upstream prose and
names PLAN as their sole owner, so the dated integer is no longer a local imprecision: it is now the
authority an upstream document defers to. That converts the DEFERRED into a finding (F-01), which is
why this confirmation is *Approved with minor changes* rather than a clean re-approval.

**Direction of the compression is still correct.** Everything TSPEC's new paragraph asserts, PLAN
already says, and says in more detail — three classes, the same class membership, the same owners,
the same 14-closable numerator, the same growth rule. Nothing in the new upstream bytes contradicts a
PLAN claim, forecloses a PLAN task, or moves a batch, wave, dependency edge or ownership cell.

## Batches

The task table, the `Batch` column, the wave map and the file-ownership manifest are untouched by this
round — PLAN's bytes did not move — so the batch-DAG check is not re-run from scratch. What I did
re-check is the only place the erratum could have reached: the two task-bearing sites TSPEC now names
as owners of the residue figures.

| Site | What TSPEC now defers to it for | Holds at HEAD? |
|---|---|---|
| Overview HEAD-drift note (three-class partition table) | the partition, the per-class counts, the owners | Partition and owners **yes**; the class-3 count and the 28 total **no longer reproduce** (F-01) |
| A6-00 Edit 1 (untrack + ignore) | the 14-closable numerator and the ignore-rule form | Numerator **yes** — exactly 14 `.bak` blobs are tracked and all 14 are in the residual today; rule form is stated three ways in PLAN and a fourth site still spells the retired anchored form (F-02) |

**Re-measurement.** I ran the oracle itself rather than trusting either document:
`NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/documentOracles.test.js -t "unfiltered sweep"`.
`PROP-SWEEP-2(b)` prints **34 residual paths** at HEAD, partitioned 14 / 4 / 16:

- **Class 1 — 14 `.claude/workflows/.pdlc-backups/*.bak` blobs.** Exactly the count A6-00 Edit 1
  claims, and `git ls-files .claude/workflows/` confirms 14 tracked `.bak` paths, no more. The
  "closes 14" numerator is intact, and no `.bak` blob has left the residual, so A6-00's step is still
  falsifiable in the direction it needs to be.
- **Class 2 — exactly the four artifacts PLAN names**, `.pdlc-drift-state.json`,
  `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `pdlc-cli.mjs`. `.pdlc-sync-manifest.json`
  is tracked in the same directory and still correctly absent, since it carries no L-2 term. The DoD's
  set-equality leg on this class therefore still passes for the right reason.
- **Class 3 — 16 feature documents**, against PLAN's dated `10`. All 16 match
  `docs/pdlc-advisory-wave-gate/**` and none is a `.bak` blob, so the DoD's *membership* predicate on
  this class — the round-9 fix I approved in v10 — still holds. That fix is exactly what keeps this
  drift non-gating: had round 9 left set-equality here, the ship boundary would be red today.

So the arithmetic PLAN owns is 14 + 4 + 16 = **34**, not 28, on the same calendar day PLAN dates its
measurement to. PLAN's own growth rule reconciles it; the printed integer does not.

**Provenance of class 2, re-run against the erratum's new wording.** TSPEC now says the four are
"all four branch-introduced by the same commit". `git log --diff-filter=A` per path returns `e3b9d5a3`
(2026-08-19) for all four — plus, for the two bundles only, the older `3991b4d5` (2026-07-27), which
`git ls-tree 1efb9a3b` shows absent from the merge-base tree. PLAN's provenance note already names
`ls-tree`-at-merge-base as the deciding leg and already carries the two-adding-commits caveat, so
PLAN is *more* precise than the new upstream sentence, not in conflict with it. No finding.

## Dependencies

**Upstream→PLAN dependency edges touched by this erratum: one.** TSPEC §1.3's hygiene paragraph now
cites PLAN's Overview HEAD-drift note and A6-00's Edit 1 by name. Both citation targets exist, are
uniquely identifiable, and carry the content TSPEC attributes to them — the citation is a heading- and
task-id anchor, not a `file:line` anchor, so DEC-DOC-01 is satisfied on both sides.

**Ordering unchanged.** The erratum routes *sizing and naming*, not work. It creates no new task, no
new precondition on A6-00, and no new consumer of A6-00's output. A6-00 remains at batch 1 with zero
dependencies, and the seven-wave map is untouched. I re-ran the shipped parser over the unmodified
document to confirm the dispatcher still sees what it saw at approval: `parsePlanTasks` → **11 tasks**,
`parsePlanOwnership` → **11 manifest rows**, `computeWaves` → **7 waves**. Identical to v10.

**One inherited internal desync, surfaced by re-reading the routed target (F-02).** TSPEC now points
implementers at A6-00's Edit 1 for the ignore rule's form. Edit 1 is unambiguous and well-argued: add
the **bare** rule `.pdlc-backups/`, *"that exact literal, not an anchored path"*, because (i)
`documentOracles.test.js`'s T21 case asserts `expect(gitignore).not.toEqual(expect.stringContaining(".claude/workflows/"))`
and is green at HEAD, so an anchored spelling reddens a passing oracle, and (ii) an anchored spelling
carrying an L-2 term would make `.gitignore` itself a new `PROP-SWEEP-2(b)` residual path. The Overview's
Dispositions bullet and both DoD bullets repeat the bare form with the same justification — four sites
agreeing. The fifth site does not: the wave-1 *(specifics)* gate paragraph still narrates *"the same
step adds `.claude/workflows/.pdlc-backups/` to `.gitignore`"* — the anchored literal Edit 1 retires by
name. This is inherited (it predates the erratum; the rule flipped to the bare form in v1.8 and this
recap was not swept) and nonlocal to the changed sections, and it did not matter much while the
paragraph was one narration among five. It matters more now that upstream forwards readers into this
document for the rule's form: an implementer who copies the anchored literal reddens T21, a
currently-green oracle, and the wave gate would report that red as drift rather than as a self-inflicted
edit.

**Nothing upstream was foreclosed.** No DECISIONS entry, REQ AC or FSPEC flow that PLAN depends on
changed bytes this round, and the new TSPEC paragraph opens no testing approach that PLAN's PROPERTIES
would now need and lack.

## Verification

Every claim below was re-derived at HEAD this round; nothing is carried on the strength of v10.

| Check | Command / oracle | Result |
|---|---|---|
| Upstream bytes match dispatch | `shasum -a 256` over REQ/FSPEC/TSPEC/DECISIONS | All four match; only TSPEC differs from my v10 UPSTREAM-STATE |
| Erratum extent | `git show 1f2a4fbf -- TSPEC` | +18/-1, confined to §0 changelog and §1.3; no table, seam list or oracle name touched |
| PLAN bytes frozen | `git log -- PLAN` | Unchanged since `b902f40b` (my v10 REVIEWED-COMMIT) |
| Residual size | `PROP-SWEEP-2(b)` run at HEAD | **34** paths, 14 / 4 / 16 — PLAN prints 28 with class 3 at 10 (**F-01**) |
| Closable numerator | `git ls-files .claude/workflows/` | Exactly 14 tracked `.bak` blobs, all 14 in the residual — "closes 14" holds |
| Class-2 set-equality | residual output | Exactly the four named artifacts; `.pdlc-sync-manifest.json` correctly excluded |
| Class-3 membership predicate | residual output | All 16 under `docs/pdlc-advisory-wave-gate/**`, no `.bak` member — DoD leg survives the growth |
| Class-2 provenance | `git log --diff-filter=A` per path, `git ls-tree 1efb9a3b` | All four added by `e3b9d5a3`; bundles also by ancestor `3991b4d5`; merge-base tree empty — PLAN's caveat still exact |
| Dispatcher contract | shipped parser over PLAN | 11 tasks, 11 manifest rows, 7 waves — identical to v10 |
| T21 still green | `documentOracles.test.js` T21 | Green at HEAD, so the anchored spelling in the wave-1 recap is live risk (**F-02**) |

**Why F-01 is Medium and not High.** The falsifiability of the DoD does not depend on the integer.
The round-9 split I approved in v10 put set-equality only on the class that is closed (class 2, four
named paths, exactly reproduced today) and a membership predicate on the class designed to grow
(class 3), so the day-scale drift 28→34 passes through the gate without false-greening or
false-redding anything. What breaks is the reader's contract, and now upstream's: TSPEC defers to a
figure that does not reproduce on the date it is stamped with. The fix is the one my v10 DEFERRED
already described — state class 3 as `10 + one per cross-review file committed since {date}` rather
than as a dated integer, and let the total follow — and it is cheap, local, and touches no task row.

**Why F-02 is Medium and not High.** Four of the five sites carry the correct bare rule, and the two
that instruct the implementer — A6-00's Edit 1 and the DoD checklist — are among them, each with the
T21 rationale attached. The fifth site is narration inside the wave-1 gate paragraph. An implementer
following the task row lands the right rule; only one reading the gate recap in isolation lands the
wrong one. Real, cheap to fix, not a reason to hold the plan.

**Mutation spot-check on the load-bearing oracle.** The claim A6-00 Edit 1 rests on is that the
`.bak` class is closable. I checked the guard can still fail: all 14 blobs are present in today's
residual output, so untracking them is observable as a 14-path reduction, and a no-op edit cannot
false-green it. The complementary claim — that the other paths are *not* closable here — is likewise
still true: 4 branch-introduced runtime artifacts plus 16 feature documents remain, and the document
class provably grows with this very file once committed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | PLAN's Overview HEAD-drift note prints `28` residual paths with class 3 at `10`, "measured 2026-08-19"; re-running `PROP-SWEEP-2(b)` at HEAD on that same date returns **34**, class 3 at **16**. This was a non-gating DEFERRED in v10, when the figure lived only in PLAN. TSPEC's erratum now states the 28 and the three-class partition itself and names PLAN's note as the owner of "the figures themselves", so a stale dated integer here is now the authority an upstream document defers to. Restate class 3 as `10 + one per cross-review file committed since 2026-08-19` (PLAN's own growth rule, already written two lines below) and let the total follow, instead of a dated integer that is wrong the day it is written. The 14-closable numerator is unaffected and needs no change. | Overview → HEAD-drift note, three-class partition table |
| F-02 | Medium | Local | The wave-1 *(specifics)* paragraph still narrates that A6-00's step *"adds `.claude/workflows/.pdlc-backups/` to `.gitignore`"* — the anchored literal that A6-00's Edit 1 explicitly retires (*"that exact literal, not an anchored path"*) because `documentOracles.test.js`'s T21 asserts `not.toEqual(expect.stringContaining(".claude/workflows/"))` and is **green at HEAD**. Four sites carry the bare `.pdlc-backups/` rule; this fifth contradicts them. An implementer who follows the recap reddens a currently-passing oracle, and the wave gate would surface that as drift. Sweep the recap to the bare literal. Inherited from v1.8's rule flip, but newly load-bearing because TSPEC now forwards readers into A6-00's Edit 1 for the rule's form. | Batches → wave 1 (specifics), inherited-red paragraph |
| F-03 | Low | Process | TSPEC's new paragraph restates the very figures it declares PLAN owns (`28`, `14 of the 28`, the three class members). Single-owner discipline — the principle round 9 applied when it stripped the duplicate figures out of PLAN's DoD — argues the upstream restatement should carry the classes and the owner but point at PLAN for the integers, or it will desync the next time the residual is re-measured. Not PLAN's defect and not actionable in PLAN; recorded so harvest can route it, since this is the third round in which a duplicated count has drifted between documents. | TSPEC §1.3 *"Sizing the hygiene residue"* ↔ PLAN Overview |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None. F-01 and F-02 both have a single obvious fix already written elsewhere in this document; neither needs an author decision. |

## Positive Observations

- **The compression survived the cascade in the direction that matters.** Everything the erratum
  added, PLAN already said and said more precisely — same three classes, same members, same owners,
  same closable numerator, same growth rule, plus a provenance caveat upstream does not carry. There
  is no claim in PLAN that TSPEC no longer supports, which is the failure mode this confirmation
  exists to catch.
- **Round 9's class-split is why today's 28→34 drift costs a Medium instead of a red ship gate.**
  Set-equality was placed only on the closed class and membership on the growing one. I confirmed
  empirically that class 2 is still exactly four and class 3 has already moved by six — under the
  round-8 shape, this branch would be blocked at the boundary right now. Choosing the strongest oracle
  each class can actually carry, rather than the strongest oracle available, is what kept the gate
  falsifiable and passing at once.
- **The erratum disclaims ownership instead of forking it.** TSPEC sizes the residue only so a reader
  cannot mistake the `.bak` blobs for the whole of it, and says in terms that the disposition is not
  re-litigated there. That is the right boundary between a test-strategy document and a plan, and it
  is why this round needed no PLAN edit to the task table.
- **The 14-closable numerator holds exactly, and is still falsifiable.** `git ls-files` returns 14
  tracked `.bak` blobs and the oracle prints all 14 as residual, so A6-00's step will be observable as
  a 14-path reduction and cannot be false-greened by a no-op.
- **Class-2 provenance reproduces to the commit.** All four artifacts are added by `e3b9d5a3`, the
  bundles carry the older `3991b4d5` add whose tree is empty at merge-base `1efb9a3b`, and PLAN names
  `ls-tree`-at-merge-base as the deciding leg rather than claiming the legs merely agree.

## Recommendation

**Approved with minor changes**

PLAN still holds as approved against TSPEC as it now stands. The erratum moved sizing and routing
only; it contradicts nothing in PLAN, forecloses no task, and moves no batch, wave, dependency edge or
ownership cell — the shipped parser reads the same 11 tasks, 11 manifest rows and 7 waves it read at
approval. Two Medium findings, neither gating: the residue figures PLAN now owns on upstream's behalf
no longer reproduce on their own measurement date (F-01), and one inherited recap still spells the
retired anchored `.gitignore` literal that a green oracle forbids (F-02). Both fixes are already
written elsewhere in this document and touch no task row.

