# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.6)
**Date:** 2026-08-21
**Iteration:** 5 (delta confirmation, Phase F erratum round)

## Problem / Context

I approved this REQ at round v4 (anchor `sha256:1c05f511…`, commit `a2d89a1d`). A Phase F
erratum round has since landed seven commits against it (`aea4d92e` … `7660f1ed`), bumping the
document to v1.6 and touching four places: §1's replay-cost narrative, §7 REQ-WVR-02's IG-label
note, §7 REQ-WVR-08's no-commit clause, and §10's BL-04 record. Total delta: 26 insertions,
13 deletions in one file.

This round answers one question — does that delta resolve the eight routed items without breaking
what v4 approved — and, per DEC-ERR-03, whether the REQ is still a faithful compression of its
upstream *at that upstream's current version*. The REQ's upstream is not another document: it is
the shipped pipeline (`pdlc/workflows/orchestrate-dev.js` on the default branch) plus
`docs/_constraints/pdlc-wave-gate-baseline.md`. Both were re-read at their current state for this
round rather than trusted from v4.

One structural fact frames everything below: this branch is **1,637 commits behind the default
branch** and the mechanism under specification does not exist in the authoring tree at all. Every
code claim in this REQ is therefore a claim about `origin/main`, and I verified it there.

## Goals

This confirmation set out to establish three things, in this order:

1. **Landing.** Each of the eight routed items is present in the delta, in the section that owns
   it, and says what the item asked it to say.
2. **Correctness of what landed.** The delta replaced two disputed *numbers* (wave count, replay
   cost) and one disputed *claim* (BL-04's discharge). Numbers substituted for other numbers are
   only an improvement if the new ones are right, so each was re-derived from primary sources
   rather than read off OF-1 and checked for internal agreement.
3. **Non-regression against upstream at HEAD (DEC-ERR-03).** The delta adds new load-bearing
   citations — to `FSPEC §2`, `FSPEC §3.2` and `EC-20` — and asserts three fresh facts about the
   default branch. Each was checked against the cited text and the cited code as they stand today.

## Non-Goals

- Re-reviewing sections the erratum did not touch. §§2, 3, 6, 8 and the ACs other than REQ-WVR-02,
  -03 and -08 were approved at v4 and are not re-litigated here.
- Re-opening settled decisions. OQ-1's deletion-only hatch, REQ-WVR-05's retention-with-invalidation
  restatement, and the closed IG-1..6 / three-outcome catalogues are ratified and out of scope.
- Reviewing the FSPEC. FSPEC text is read here only as the upstream-at-HEAD referent for the REQ's
  new citations; findings about the FSPEC itself belong to the FSPEC's own review rounds.
- Product-lens and testing-lens judgements. Whether the replay-cost narrative is the right *story*
  is pm-review's call; whether OF-1 is oracle-shaped is te-review's.

## Constraints

Verification performed for this round, with the command and the observed result, so a later reader
can re-run rather than believe. Every code claim is measured against `origin/main`, never against
this branch's tree.

| # | Claim under check | Command | Result |
|---|---|---|---|
| V-1 | Branch is 1,637 commits behind default | `git rev-list --count origin/main ^HEAD` | `1637` — exact, §1-note / §10 / BL-04 all agree |
| V-2 | Mechanism absent from authoring tree | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | `0` at HEAD; present on `origin/main` |
| V-3 | Baseline file absent from authoring tree | `ls docs/_constraints/` vs `git ls-tree origin/main docs/_constraints/` | absent at HEAD, present on `origin/main` |
| V-4 | OF-1's plan geometry | `parsePlanTasks` + `parsePlanOwnership` + `computeWaves` from `origin/main`'s workflow, run over `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md` | **34 tasks, 16 waves**, `W1=[T00]`, `W2=[T01..T05]`, `W3=[T06]`, waves 1–3 = **7 tasks** |
| V-5 | V-wave is unguarded by `allWavesRecorded` | read `origin/main` `orchestrate-dev.js` around the `allWavesRecorded` if/else and the `Phase PT` dispatch | the `if (allWavesRecorded) { … } else { … }` block closes **before** `phaseFn("Phase PT: …")`; the V-wave is outside it and runs on every invocation |
| V-6 | V-wave gates and commits | same region | dispatch via `agentFn("se-implement", propertiesTestPrompt(…))`, then `runCommandFn(implConfig.testCommand)`; the surrounding comment states the V-wave "still commits its OWN work" and that the gate runs "AFTERWARDS as verification rather than as permission" |
| V-7 | `FSPEC §3.2` ratifies ancestry-before-over-count | read FSPEC §3.2 | its ordered table places the reachability question (IG-5) at position 5 and the over-count question (IG-4) at position 6, and states in terms that "the IG labels name causes, not precedence" |
| V-8 | `FSPEC §2` / `EC-20` scope the no-commit claim | read FSPEC §2 Vocabulary, EC-20, BR-11 | §2 scopes every "produces no commit" clause to implementation waves; EC-20 records the V-wave replaying on every invocation and refers the recordability question upstream to REQ-WVR-08 |
| V-9 | Baseline file's version and occupancy, as OB-2 asserts | `git show origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` | `Version | 1.2 · 2026-08-20`, sections `## 1.`–`## 4.`, ids through `M-WG-14`; `M-WG-4`, `M-WG-6`, `M-WG-12` all present as cited in §4 |

**On V-4.** This is the one that mattered most, because the erratum swapped one contested number
for another. I did not take OF-1's word for the new figures: I ran the default branch's own
`computeWaves` over the actual PLAN and got the geometry independently. The 16 and the 7 are both
right, and — importantly — the 7 is not an arbitrary constant but exactly `|W1|+|W2|+|W3|` =
1 + 5 + 1. §1's "seven no-op agent dispatches (waves 1–3)" and "wave-2 re-entry replayed wave 1
only, a single task" are both derivable from that geometry. This closes the two §1 items properly
rather than by assertion.

## Acceptance Criteria

The bar for this round: every routed item landed, in the owning section, saying what it was asked
to say — *necessary but not sufficient* — and nothing v4 approved has regressed.

| Item (as routed) | Landed where | Disposition |
|---|---|---|
| §10 records BL-04 as "discharged at FSPEC authoring" but it is unmet (se-review) | §10, commit `d1dfbd20` | **Resolved.** §10 now reads "BL-04 is **open and unmet** — not discharged at FSPEC authoring", and names all three grounds: 1,637 commits behind, no resume mechanism, no baseline file in the authoring tree. All three re-verified (V-1, V-2, V-3). The "not a pickup gate → `ready: true` is accurate" conclusion is retained and remains sound: BL-04 gates FSPEC authoring, not queue pickup. |
| §1 says 15 waves, OF-1 says 16 (se-review, pm-author) | §1, commit `aea4d92e` | **Resolved.** §1 now reads "a 16-wave plan"; OF-1 unchanged at 16 (17 with the V-wave). Independently re-derived as 16 (V-4). The two figures now agree *and* are both correct — the erratum did not simply align §1 to a wrong OF-1. |
| §1's "each re-invocation paid seven no-op dispatches" contradicts OF-1's non-uniform cost (se-review) | §1, commit `aea4d92e` | **Resolved.** §1 now attributes the seven dispatches specifically to the wave-4 re-entry, records the wave-2 re-entry as "wave 1 only, a single task", and replaces the false uniformity with the correct rule: "Each halt costs the task count of every wave below it, so the tax grows with the plan." That rule is exactly what V-4's geometry produces. |
| REQ-WVR-08's "no gate runs and Phase I produces no new commit" is falsified by the V-wave (te-review ×2, pm-author) | §7 REQ-WVR-08, commit `2c2efb74` | **Resolved.** The clause is now scoped to the **implementation wave loop** ("no wave of the **implementation wave loop** executes, so that loop runs no gate and **lands no new commit**"), and the V-wave is named explicitly as outside the resume record's scope, continuing "to dispatch, gate and commit on every invocation (FSPEC §2, EC-20)". The closing sentence is re-scoped in step ("lands a wave-loop commit"). Verified against the shipped chain (V-5, V-6) and against the cited FSPEC text (V-8). This also answers the upstream question EC-20 explicitly referred back here — the V-wave is out of scope for the record — so the FSPEC's open referral is discharged, not left dangling. |
| REQ-WVR-02's IG-4/IG-5 order vs the normative evaluation order (pm-author) | §7 REQ-WVR-02, commit `e029fc59` | **Resolved.** The table is left intact (correct — the enumeration is a closed set, and renumbering it would break the set-equality obligation and every downstream `IG-n` citation) and a note is added: "The IG labels name **causes, not precedence**", deferring order to FSPEC §3.2. FSPEC §3.2 does ratify ancestry before over-count and uses the same "causes, not precedence" formulation (V-7), so the two documents now say one thing in one voice. |

**Non-regression against v4.** The delta is additive and local: it touches the version cell, adds
one erratum banner, and rewrites four passages. No AC was renumbered, no enumeration lost or
gained a member (IG-1..6 and the three-outcome catalogue are byte-identical), no `Source:` line
changed, and §10's traceability matrix rows are untouched. The set-equality obligations the
PROPERTIES document inherits are therefore unchanged, which is what I care about most from this
lens — a silently resized enumeration is the failure mode that would have cost a phase.

**Citation hygiene (DEC-DOC-01).** The delta's new citations are `FSPEC §2`, `FSPEC §3.2`,
`EC-20`, `OF-1` and `BL-04` — section ids and spec ids, not raw `file:line` anchors. Code is
referenced by symbol (`WAVE_STATE_PATH`, `allWavesRecorded`) as the v1.4 grep-stability
convention requires. No new positional anchors were introduced, which is the right call on a
branch whose tree does not contain the file being anchored into. Nothing to file.

## Risks

Three residual risks, none blocking, recorded so the next round can price them.

- **RR-1 — the V-wave scoping is now stated in three places and only two of them are scoped.**
  REQ-WVR-08 (§7) is scoped by this delta; FSPEC §2 and BR-11 are scoped upstream of it. But
  REQ-WVR-03's own **Then:** clause still reads "the full test suite verifies the whole tree
  before any new commit lands", unqualified, and the V-wave commits *before* its gate by design
  (V-6 — the code's own comment calls the gate "verification rather than as permission"). The
  same defect the erratum fixed in REQ-WVR-08 therefore survives one AC over. It is not a new
  break — it predates this round and the FSPEC already handles it — but leaving it means a
  PROPERTIES author reading REQ-WVR-03 alone would write an oracle the shipped pipeline fails.
  Filed as F-01.

- **RR-2 — hard-coded distance to the default branch.** "1,637 commits behind" now appears in
  three places (§1's branch-base note, §10, and the reasoning behind BL-04). It is exactly right
  today (V-1) and it is genuinely load-bearing evidence, so I would not remove it. But it decays
  every time `origin/main` moves, and BL-04's own resolution — rebasing — sets it to zero and
  falsifies all three sentences at once. Whoever performs the rebase owes a sweep of those three
  passages in the same commit. Recorded here rather than filed as a finding, because the fix
  belongs to BL-04's discharge and not to this document's current version.

- **RR-3 — a REQ leaning on its own downstream.** REQ-WVR-08 and REQ-WVR-02 now cite `FSPEC §2`,
  `FSPEC §3.2` and `EC-20` for facts the REQ declines to state itself. In both cases this is the
  right routing — evaluation order and V-wave replay are contract-altitude material and belong
  downstream, so the REQ deferring to the FSPEC is the Altitude Rule working, not a violation.
  The residual risk is ordinary co-editing risk: the REQ is now brittle against renumbering of
  FSPEC sections. Both anchors are verified live for this round (V-7, V-8). No finding.

## Obligations

- **OB-A (owner: se-author, next ordinary REQ round).** Scope REQ-WVR-03's "before any new commit
  lands" to the implementation wave loop, in the same words REQ-WVR-08 now uses, or state the
  V-wave's commit-then-verify order as the named exception. See F-01. This is a routed-back item,
  not an erratum for this round — it was not in the routed set and the fix touches an AC the
  erratum did not open.
- **OB-B (owner: se-author, next ordinary REQ round).** Reconcile §9 OB-2's bare "exists at HEAD"
  with §10's new statement that the authoring tree carries no baseline file. §4 and §5 already
  disambiguate ("present at HEAD of the default branch", "already exists on main"); OB-2 is the
  one place left where "HEAD" is unqualified and now reads as a contradiction. See F-03.
- **OB-C (owner: whoever discharges BL-04).** Sweep the three "1,637 commits behind" passages in
  the rebase commit itself. See RR-2.
- **Unchanged and still owed:** OB-1 (TSPEC ratifies the shipped contract), OB-2's promotion of
  OF-1..3 into the baseline as `M-WVR-*` in a new section with a version bump, OB-3's advisory
  wave-gate interaction note. This round changes none of them. OB-2's promotion now has a
  materially better source: OF-1's figures are re-derivable by one command (V-4), which is exactly
  the "Measured-by command" shape the baseline file's own control rule demands.

## Positive Observations

- The erratum fixed the *reasoning*, not just the number. §1 could have been made consistent by
  editing OF-1 down to 15 waves; instead the wrong figure was corrected upward to the measured one
  and the false uniformity claim was replaced with the correct cost rule. That rule survives
  independent re-derivation (V-4).
- REQ-WVR-02's fix left the closed IG-1..6 table byte-identical and added a precedence disclaimer
  instead of renumbering. Renumbering would have silently broken the set-equality obligation and
  every downstream `IG-n` citation; this is the cheap, correct edit.
- REQ-WVR-08's new text discharges the question EC-20 explicitly referred upstream, rather than
  merely hedging the clause. The FSPEC's open referral now has an answer in the document that owns
  it.
- §10's BL-04 correction is unusually honest: it records the prerequisite as open and unmet, names
  the three grounds, and still defends `ready: true` on the correct basis (BL-04 gates FSPEC
  authoring, not queue pickup) instead of quietly flipping the readiness flag.

## Recommendation

**Approved with minor changes**

The delta lands all eight routed items, each in the section that owns it, and each survives
verification against upstream at its current state. No High finding — the two Medium items are a
sibling AC the erratum did not open (F-01, inherited: route to the ordinary revision loop, not a
halt) and one stale sentence inside the rewritten passage (F-02), and neither weakens a guarantee
or resizes an enumeration. The v4 approval stands.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | REQ-WVR-03's **Then:** clause still reads "the full test suite verifies the whole tree before any new commit lands", unqualified. Phase PT's V-wave commits its own work and gates afterwards ("verification rather than as permission"), so the clause is falsified at HEAD by exactly the mechanism REQ-WVR-08 was just scoped around. Pre-round bytes; this edit did not touch the AC. Fix: apply REQ-WVR-08's "implementation wave loop" scoping here too. | §7, REQ-WVR-03 |
| F-02 | Medium | delta | local | Inside the passage this round rewrote, the sentence "The tree's most recent whole-tree verification is the one performed by the last wave of the run that wrote the record" now sits two sentences below the new admission that the V-wave "continues to dispatch, gate and commit on every invocation". Under outcome (c) the most recent whole-tree verification is the V-wave's, from *this* invocation. The paragraph's conclusion (later phases run their own gates) is unaffected; only the intermediate claim is now stale against its own neighbour. | §7, REQ-WVR-08 |
| F-03 | Low | inherited | nonlocal | §9 OB-2 states the baseline file "exists at HEAD" with "HEAD" unqualified, while §10's new BL-04 text states the authoring tree carries no such file. Both are true under different readings of "HEAD" (default branch vs. this tree), and §4 and §5 disambiguate explicitly; OB-2 is the one place that does not, so the delta makes it read as a contradiction. Fix: "exists at HEAD of the default branch". | §9, OB-2 |

FINDING: Medium | inherited | nonlocal | §7 REQ-WVR-03 | "the full test suite verifies the whole tree before any new commit lands" is unqualified and is falsified by Phase PT's V-wave, which commits before its gate; the erratum scoped REQ-WVR-08 but left the identical defect in REQ-WVR-03 — route to the ordinary revision loop
FINDING: Medium | delta | local | §7 REQ-WVR-08 | the rewritten passage still asserts "the tree's most recent whole-tree verification is the one performed by the last wave of the run that wrote the record", which its own new V-wave sentence contradicts under outcome (c)
FINDING: Low | inherited | nonlocal | §9 OB-2 | OB-2's bare "exists at HEAD" now reads as a contradiction of §10's new "the authoring tree carries neither the resume mechanism nor the baseline file"; §4 and §5 qualify "HEAD of the default branch" and OB-2 does not

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
