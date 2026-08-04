# POSTMORTEM — Phase T (erratum channel to FSPEC) — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | `TSPEC-pdlc-advisory-tier.md` (v1, HEAD `ae55f25`) → **POSTMORTEM-T** |
| Downstream | `LEARNINGS-pdlc-advisory-tier.md`, `docs/_queue/QUEUE.md` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v4.md` (the erratum delta-confirmation round) |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |
| Author | se-author (Claude) |
| Date | 2026-08-03 |
| Version | 1.0 |
| Scope | Non-convergence of the FSPEC **erratum** delta-confirmation dispatched from Phase T. Not a re-review of the TSPEC or FSPEC; not a technical-design record. |

---

## Phase

**Phase T — TSPEC authoring and cross-review**, feature `pdlc-advisory-tier`, branch
`feat-pdlc-advisory-tier`. The halt is not in the TSPEC review loop itself — that loop **converged**:
pm-review, se-review and te-review all approved TSPEC v3 (`5f280c5`, `b5b9708`, and the pm/te/se v3
files). The halt is in the **erratum channel** Phase T opened against the *upstream* FSPEC.

While authoring the TSPEC, the author found what looked like four defects in
`FSPEC-pdlc-advisory-tier.md` and — per the erratum protocol (CLAUDE.md, "Errata are a first-class
signal") — emitted `ERRATUM: FSPEC: …` lines rather than editing the FSPEC or mis-filing the findings
in the TSPEC. After the phase converged, the orchestrator routed those errata to the FSPEC's author,
who applied a single targeted versioned edit (commit `3bbf934`, FSPEC v1.2 → v1.3), and then
dispatched the FSPEC's own two approvers — se-review and te-review — to write the **delta-confirmation**
as the next append-only cross-review round (`-v4`).

That confirmation did not pass. Per the bounded rule — **one erratum round per upstream doc per
phase** (CLAUDE.md, "Bounded: … a failed confirmation … halts to the current phase's POSTMORTEM") —
Phase T halts here rather than opening a second erratum round.

The single most important fact in this document: **two of the four erratum items were false.** They
rest on the premise that default-branch commit `26c3f1c` *predates* Phase PUB's file-creating code
`raisePrAndVerifyCi`. It does not — `26c3f1c` already carries it. The confirmation reviewer's own
grounding discipline caught this, withdrew the erratum, and refused the edit that acted on it. The halt
is therefore the protocol working, not misfiring: it stopped a regression from landing on the FSPEC.
This is developed in Root Cause 1.

## Iterations

The erratum channel ran its **one** permitted round: one FSPEC edit, one dual delta-confirmation.

| Step | Actor | Commit | Result |
|---|---|---|---|
| Errata emitted | se-author (Phase T) | — | 4 items routed against FSPEC: two D-6 (created-file baseline), one A2-6/R-2 (ordering), one C-2 (degraded-key report) |
| Targeted edit | se-author (FSPEC owner) | `3bbf934` — "erratum round — decouple D-6 baseline citation pin, decide A2 record/commit order, gate C-2 report on enabled" (v1.2 → v1.3) | 3 regions touched: §3.2/§5 C-2, §4.1 step-order, §12.1 D-6 / §12.2 T-10-3 |
| Confirmation — se-review | se-review (`-v4`) | `f3b9a94`/`90bb82f`/`f1e9b8f` | **Approved minor changes** — `{high:0, medium:0, low:0}` |
| Confirmation — te-review | te-review (`-v4`) | `ae55f25` | **Needs revision** — `{high:1, medium:0, low:0}`, F-01 High |

The routed erratum items, verbatim, and their fate in the confirmation:

| # | Item (as routed) | Confirmation verdict |
|---|---|---|
| 1 | D-6 pins the disabled-run created-file baseline to `26c3f1c`, which "predates" `raisePrAndVerifyCi`/Phase PUB, so a branch-HEAD disabled run is compared against a stale literal; baseline should be the pre-feature branch tip | **Premise disproved** — not a defect |
| 2 | D-6 (se-author variant of the same claim) | **Premise disproved** — same false "predates" claim |
| 3 | A2-6 (re-grounding durable before invocation end) vs R-2 (failed record write un-takes the action) — FSPEC never reconciles the ordering | **Resolved** (both reviewers) |
| 4 | C-2 unconditionally reports a degraded config key, contradicting D-5/S-4/T-10-4's "a disabled run carries no advisory content" | **Resolved** (both reviewers) |

So the round is **2-of-4 sound, 2-of-4 false-premise**. The two sound errata (items 3, 4) were applied
correctly and both reviewers confirm them. The two D-6 errata (items 1, 2) share one false factual
premise; the edit that acted on them replaced a *correct* baseline (`26c3f1c`) with a fork-point
baseline on a reversed, unverified rationale, and te-review's grounding check caught it.

**A note on the halt roster.** The dispatching orchestrator recorded non-approving `[se-review,
te-review]`. On disk only **te-review** blocks: its `VERDICT: Needs revision` carries the lone High.
se-review's `-v4` verdict is `VERDICT: Approved minor changes`, which is an **accepted approval token**
(`orchestrate-dev.js:3513` — `verdict === "Approved" || verdict === "Approved minor changes"`), so the
confirmation is non-unanimous, not doubly-refused. The distinction matters for the Recommendation: only
the D-6 half needs another turn; se-review's approval of the whole edit stands and need not be re-run.

## Reviewers

| Role | Skill | Lens in the delta-confirmation | `-v4` verdict |
|---|---|---|---|
| Software Engineer | `pdlc:se-review` | Does the delta resolve the four routed items at FSPEC altitude without pulling an implementation contract up, and without regressing anything approved at v3? | **Approved minor changes** (`{0,0,0}`) |
| Test Engineer | `pdlc:te-review` | Same delta question, plus the skill's standing obligation: **every "X does / does not exist at commit C" claim is verified against the git object, not the prose** | **Needs revision** (`{1,0,0}`) |

Both reviewers scoped strictly to the erratum delta (`git diff 502c070 HEAD -- FSPEC…`, the single
commit `3bbf934`), did not re-litigate sections the edit did not touch, and both opened with a
disposition table for the four routed items — the round-2+ delta discipline the review loop mandates.

They **agree** on three of the four items:

- Item 3 (A2-6/R-2 ordering) — **both resolved.** §4.1's step-7 paragraph now names A2 alongside A5 as
  a seam whose action is made durable through git, so R-2 governs A2 on the same revert-before-durable
  terms it governs A5; consistent with §6.4 A2-6 (`FSPEC:454`) and R-2 (`FSPEC:690`). The apply/verifyGate
  split that the routed item flagged as unreconciled lives TSPEC-side (§4.4, `TSPEC:404`/`TSPEC:430`) and
  was correctly *not* pulled up into the FSPEC.
- Item 4 (C-2 vs D-5/S-4/T-10-4) — **both resolved.** §5 C-2 (`FSPEC:145`) now gates the substitution
  notice on the resolved config leaving the tier *enabled*; a malformed `advisory.enabled` resolves the
  tier disabled and carries no advisory content, matching D-5 (`FSPEC:834`), S-4 (`FSPEC:718`) and
  T-10-4 (`FSPEC:856`). The emit-side suppression the routed item pointed at (TSPEC §3.2) is honoured.

They **diverge** only on the D-6 pair — and the divergence is not between the two reviewers over a
judgement call. se-review accepted the D-6 edit as a plausible FSPEC-altitude clarification without
re-running the underlying `git grep`; te-review ran it, found the premise false, and blocked. The
disagreement is between the edit and the repository, surfaced by the one reviewer whose skill requires
it to check.

## Pattern of Disagreement

**1. Three of four errata converged; the halt is entirely the D-6 pair.** This is not a loop that
churned. Two routed items were genuine FSPEC defects (the A2-6/R-2 ordering gap and the C-2 report
contradiction), both were fixed cleanly in one edit, and both reviewers confirm them. If the D-6 items
had never been routed, this erratum round would have passed on the first confirmation. The failure is
localized to one factual claim, not diffuse across the document.

**2. The blocking finding is a self-withdrawn erratum.** te-review's F-01 (High) does not ask the
author to add or change anything the author got wrong — it retracts the reviewer's *own* erratum.
te-review states it plainly: "This is my error to withdraw, not the author's to carry." The D-6 erratum
was co-raised by te-review and se-author; on grounding it against the object, te-review found the shared
"predates" premise false and blocked the confirmation to prevent the edit that implemented it. The
disagreement is between the v1.3 edit and the git history, not between people.

**3. The false premise is disproved by one command, and the TSPEC already carried the disproof.**
The D-6 errata assert `26c3f1c` predates `raisePrAndVerifyCi`/Phase PUB. The check:

```
git grep -c 'raisePrAndVerifyCi' 26c3f1c -- pdlc/workflows/orchestrate-dev.js   ⇒ 4
```

`26c3f1c` already carries the symbol (te-review also cites its appearances across the test suite at
that commit — `__tests__/dodPhase.test.js`, `forcePhases.test.js`, `haltAndQueue.test.js` — and the
tracked PLAN row for it). `26c3f1c` is an ancestor of the default branch and carries every merged
pipeline change including Phase PUB's file-creating path, so its created-file set **equals** a disabled
branch-HEAD run's — exactly what D-6 requires. Strikingly, the *TSPEC itself* had already established
this: §1.1 (`TSPEC:38-50`) states "`26c3f1c` already carries every symbol this TSPEC cites — Phase PUB's
`raisePrAndVerifyCi` included … `git grep -c … 26c3f1c …` ⇒ 4." The erratum contradicted a fact the
same author had verified one document over.

**4. The edit degraded a correct baseline.** Because the premise was false, the v1.3 edit did harm, not
good: it swapped D-6/T-10-3's correct `26c3f1c` baseline for a "fork point / pre-feature base" baseline
justified by the reversed, unverified claim that `26c3f1c` "may sit ahead of the branch's pre-feature
base." te-review's remedy is therefore not "revise the new text" but "**withdraw both D-6 errata and
restore D-6/T-10-3 to `26c3f1c`**," keeping items 3 and 4. The approval bar (any open High ⇒ Needs
revision) then correctly refuses the confirmation.

**5. se-review and te-review do not contradict each other — one checked and one did not.** se-review's
approval is not wrong about items 3 and 4, and its acceptance of the D-6 edit is the predictable result
of taking the edit's stated rationale at face value: as an FSPEC-altitude clarification it reads fine.
Only the git-object check falsifies it, and only te-review's skill compels that check. This is the
review loop's grounding clause doing exactly its job — one reviewer's mandated verification catching a
claim the prose made plausible.

## Best-Guess Root Cause

**Root cause 1 (primary) — a factually false erratum was routed and acted on.** The D-6 erratum
asserted a git-history fact ("`26c3f1c` predates `raisePrAndVerifyCi`") that is false and was
falsifiable by a single `git grep`. The originating author had, in the *same feature*, already run that
exact grep and recorded the opposite in TSPEC §1.1. The erratum was therefore an internal
contradiction, not new information: the author held both "`26c3f1c` carries `raisePrAndVerifyCi`"
(TSPEC) and "`26c3f1c` predates `raisePrAndVerifyCi`" (erratum) simultaneously. The proximate failure is
that the erratum was emitted, and then implemented in commit `3bbf934`, without re-grounding its factual
premise against the object — a grounding lapse of exactly the kind the reviewer-side grounding clause
exists to backstop. It did backstop it: te-review is the safety net closing.

**Root cause 2 (why it halted rather than silently regressing) — the erratum protocol is bounded and
confirmation-gated, and it worked as designed.** The protocol grants exactly one erratum round per
upstream doc per phase and requires the upstream doc's *own approvers* to confirm the edit as an
append-only review round before the upstream approval is allowed to stand. Both properties fired
correctly: te-review — an original FSPEC approver — was asked to confirm, applied its grounding duty,
refused, and the "one round" bound turned that refusal into a halt instead of an unbounded
re-edit/re-confirm spiral. Nothing here is a harness defect. The halt is the mechanism preventing a
false-premise edit from silently re-baselining D-6/T-10-3 and weakening the disabled-run oracle.

**Root cause 3 (contributing) — "route it as an erratum" is cheaper than "verify it's a defect," so an
unverified suspicion can enter the channel.** The erratum channel is designed to be low-friction so real
upstream defects are not swallowed or mis-filed. The cost is that the *emitter* carries the burden of
having grounded the claim, and nothing mechanical enforces that a routed erratum's factual premises were
checked before routing. When the emitter's own upstream artifact already contains the disproof, the
contradiction is only caught downstream, at confirmation, by whichever approver re-runs the check. Here
that was one of two approvers; had the FSPEC's approvers both taken the rationale at face value, the
regression would have landed. The grounding clause held, but it held on a one-reviewer margin.

## Recommendation

<!-- body -->
