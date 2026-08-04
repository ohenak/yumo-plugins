# POSTMORTEM — Phase PR (erratum channel to PLAN) — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | `PROPERTIES-pdlc-advisory-tier.md` → **POSTMORTEM-PR** |
| Downstream | `LEARNINGS-pdlc-advisory-tier.md`, `docs/_queue/QUEUE.md` |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v6.md` (the erratum delta-confirmation round) |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |
| Author | te-author (Claude) |
| Date | 2026-08-04 |
| Version | 1.0 |
| Scope | Non-convergence of the **PLAN erratum** delta-confirmation dispatched from Phase PR. Not a re-review of the PROPERTIES or the PLAN; not a technical-design record. |

---

## Phase

**Phase PR — PROPERTIES authoring and cross-review**, feature `pdlc-advisory-tier`, branch
`feat-pdlc-advisory-tier`. The halt is **not** in the PROPERTIES review loop: that loop converged, and
the PLAN itself was already approved at v5 by both of its approvers (`CROSS-REVIEW-product-manager-PLAN-v5.md`
and `CROSS-REVIEW-test-engineer-PLAN-v5.md`, both `VERDICT: Approved minor changes`, both anchored to
`REVIEWED-COMMIT: bc6dccf` with the same `APPROVAL-HASH: sha256:8e777d90…`). The halt is in the
**erratum channel** Phase PR opened against the *upstream* PLAN.

While authoring and reviewing PROPERTIES, three roles emitted `ERRATUM: PLAN: …` lines rather than
editing the PLAN directly or mis-filing the findings inside PROPERTIES. The orchestrator routed them to
the PLAN's author, who applied four targeted versioned edits (`1bd7268`, `c5c3b4c`, `deada89`,
`43e1c3a`, plus the changelog commit `7097b57`, PLAN v1.5 → v1.6), and then dispatched the PLAN's own
two approvers — pm-review and te-review — to write the **delta-confirmation** as the next append-only
cross-review round (`-v6`).

That confirmation was **non-unanimous**: pm-review approved, te-review returned `Needs revision` with
one High. Per the bounded rule — one erratum round per upstream doc per phase (CLAUDE.md, "Bounded: …
a failed confirmation … halts to the current phase's POSTMORTEM") — Phase PR halts here rather than
opening a second erratum round against the PLAN.

The single most important fact in this document: **every routed erratum item was sound and every one of
them was resolved.** te-review verified all four dispositions against the documents they had to agree
with and re-ran the PLAN contract gate mechanically (`parsePlanTasks` ⇒ 36 tasks,
`validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ 20 batches). The blocking finding
is a **new defect introduced by the fix**: the A1 reconciliation was applied to A1 only, while the
TSPEC erratum round that motivated it changed **A1 and A3** together. One seam was left behind. That,
and an unreconciled FSPEC↔TSPEC divergence underneath it, is the whole of the halt.

## Iterations

The erratum channel ran its **one** permitted round: one batch of PLAN edits, one dual
delta-confirmation.

| Step | Actor | Commit(s) | Result |
|---|---|---|---|
| Errata emitted | pm-review / se-review / te-review (Phase PR) | — | **10 routed lines** against the PLAN, collapsing to **4 distinct defects** (each raised independently by two or three roles) |
| Targeted edits | se-author (PLAN owner) | `1bd7268`, `c5c3b4c`, `deada89`, `43e1c3a`, `7097b57` (v1.5 → v1.6) | 4 content edits + 1 changelog row; no task row, dependency edge, batch number or ownership row moved except the one addition item 3 required |
| Confirmation — pm-review | pm-review (`-v6`) | `2391f4c`, `ddf703c` | **Approved** — `{high:0, medium:0, low:2}` |
| Confirmation — te-review | te-review (`-v6`) | `f3d523a`, `8af6b5a`, `c03c770`, `3030307`, `b98c17e` | **Needs revision** — `{high:1, medium:0, low:2}`, F-01 High |

Diff under confirmation: `bc6dccf..7097b57`.

### The routed items and their fate

The ten routed lines are duplicates of four defects. All four are resolved; te-review checked every
citation rather than trusting the changelog.

| # | Distinct defect (raisers) | Routed as | Disposition |
|---|---|---|---|
| 1 | §8.2 and the §3 A-07/A-31 rows say A1 "declares no gate, so its case asserts `verifyGate == null`", contradicting TSPEC §5.5/§6.3 (`TSPEC:723`) which declared A1's `verifyGate` as `async () => ({ passed: true })` — pick one representation | 4 of the 10 lines (PM, SE, TE) | **Resolved**, and in the direction that keeps the mutation falsifying: TSPEC v1.3 (`TSPEC:655`, `:740`) now declares A1's gate `null`, "deliberately not `async () => ({ passed: true })`"; PLAN `:258`/`:282`/`:869` say the same and state the mutation in both directions (replace, for a seam that declares a gate; install, for one that declares none) |
| 2 | §6.5's P-4 closure conjunct is stated over the eight-member `ADVISORY_REFUSAL_REASONS`, weaker than TSPEC §5.1's declared `classifyEnvelope` return enum of three reasons plus `null` — it cannot falsify a classifier returning `low-confidence` or `budget-exhausted` | 3 of the 10 lines (PM, SE, TE) | **Resolved at both sites.** `TSPEC:532`'s JSDoc declares the three-member enum; PLAN `:779` (P-4) and `:257` (A-06's row) transcribe exactly those three and cite it, and re-home the eight-member set-equality assertion in T-03-8 (§8.2) so no coverage is traded away |
| 3 | `pdlc/workflows/__tests__/fixtures/scanFixtures.js` — the module holding PROP-INFRA-01's and PROP-REG-08's forbidden-shape controls — has no file-ownership manifest row; A-01 is the natural owner and `validatePlanContract` enforces the row before Phase I | 2 of the 10 lines (TE, SE) | **Resolved and mechanically verified.** The path is in A-01's Test File cell (`:252`) and in §4's manifest (`:308`), justified by the mechanism (the wave commit stages only `task.files`, `orchestrate-dev.js:8143-8159`). Gate re-run on the current bytes: 36 tasks, `{"ok":true}`, 20 batches |
| 4 | §8.3 note 2 claims TSPEC §7.4 names a case id outside FSPEC's T-06-1…T-06-6 catalogue, but TSPEC §7.4 no longer does — the note describes a discrepancy that no longer exists | 1 of the 10 lines (TE) | **Resolved by re-reading, not by deletion.** `TSPEC:937-938` states the A4 no-`testCommand` test carries no FSPEC case id; PLAN `:880-886` records the erratum closed and tags the obligation by task id (A-10 unit → A-23; A-10 → A-25) instead of by an invented `T-06-7`/`T-06-8` |

So the round is **4-of-4 sound and 4-of-4 resolved** — the inverse of the Phase T halt recorded in
`POSTMORTEM-T-pdlc-advisory-tier.md`, where two of four errata rested on a false premise. Nothing here
was mis-routed and nothing was applied wrongly at the site it was raised against. The halt comes
entirely from **under-application**: fix 1 was applied to the one seam the erratum line named, while
the TSPEC change it reconciles with covers two.

## Reviewers

The PLAN has two approvers, and both were dispatched for the delta confirmation.

| Role | Skill | Lens in the delta-confirmation | `-v6` verdict |
|---|---|---|---|
| Product Manager | `pdlc:pm-review` | Does the erratum edit resolve the routed items without changing a requirement, acceptance criterion, task, dependency edge, batch label or phase boundary — and does the task↔manifest bijection still hold? | **Approved** (`{0,0,2}`) |
| Test Engineer | `pdlc:te-review` | Same delta question, plus the standing testability obligation: does every case §8.2 instructs A-07 to author actually **fail against a wrong build and pass against a correct one**? | **Needs revision** (`{1,0,2}`) |

Both scoped strictly to `bc6dccf..7097b57`, opened with a disposition table for the routed items, and
did not re-litigate sections the edit did not touch — the round-2+ delta discipline the loop mandates.
Neither found any regression in what v5 approved.

They **agree** on far more than they differ on:

- All four distinct defects are resolved. pm-review confirms no product-contract element moved;
  te-review re-derived the batch DAG and the ownership bijection mechanically and agrees.
- **Both** flag the same Low citation slip: `PLAN:869` cites "TSPEC §5.4's five `verifyGate` rows", but
  §5.4 is *Prohibitions — structural, not asserted* (`TSPEC:630`); the five-row gate table is **§5.5**
  (`TSPEC:650-660`), which `PLAN:258` and `:282` already cite correctly. pm F-01 and te F-02 are the
  same finding, independently found.
- **Both** noticed the A3 seam. This is the crux: it is not that one reviewer saw a problem the other
  missed.

They **diverge** on one thing only — **which document is wrong about A3's gate**, and therefore what
severity the A3 observation carries:

| | te-review F-01 (**High**, blocking) | pm-review F-02 (**Low**, non-blocking, routed onward) |
|---|---|---|
| Authority taken as settled | **TSPEC v1.3** — `TSPEC:434`, `:657`, `:865` give A3 `verifyGate: null`, "same shape as A1" | **FSPEC §5.4** — the approved product contract, whose gate table gives A3 "Phase DOD's verify step / no findings remaining" |
| Therefore the defect is | in the **PLAN**: §8.2 was updated for A1 only and still tells A-07 to stub a gate A3 does not have | in the **TSPEC**: v1.3 diverged from an approved FSPEC row; emitted as an `ERRATUM: TSPEC` line, not as a PLAN blocker |
| Consequence if unfixed | A3's gate-exclusivity case is authored **red against a correct build** in batch A-07, undiagnosed until A-23 — or silently written vacuous, losing AC-4.6's mutation control at one of five seams | A PLAN that faithfully follows FSPEC is not itself defective; if A3 genuinely has no gate, that is an **FSPEC** change first |

Both readings are internally coherent. They are irreconcilable only because the documents they each
cite disagree with each other — see Pattern of Disagreement 3.

## Pattern of Disagreement

**1. Every routed item converged; the halt is a defect the fix itself introduced.** This is not a loop
that churned over disputed content. All four distinct defects were genuine, all four were fixed at the
site they were raised against, and both reviewers confirm all four. Had fix 1 covered the second seam
its own motivating TSPEC change covers, this confirmation would have passed unanimously on the first
round. The failure is localized to one clause of one table cell (`PLAN:869`).

**2. The blocking finding is the same defect class the round just closed, one seam over.** The routed
item said: *A1's gate has two representations across TSPEC and PLAN; pick one.* The TSPEC erratum round
picked one — and picked it for **A1 and A3 together** (`TSPEC` v1.3 changelog: "A1 and A3 declare
**`verifyGate: null`**"). The PLAN edit reconciled A1 and stopped. `PLAN:869` now asserts three things
that are false for A3: that the per-seam mutation is to *replace* that seam's gate (A3 has none to
replace); that "**A1 is the direction that runs backwards**" (A1 *and* A3 are); and that "A-23 lands
both gates" (A-23 lands A4's gate and A3's gateless seam — the PLAN's own §3 row at `PLAN:274` already
describes it that way). The fix was scoped to the *words of the erratum line* rather than to the
*extent of the change it reconciles with*.

**3. Underneath the reviewer split is a real, unreconciled FSPEC ↔ TSPEC divergence about A3.** This is
the part that must not be papered over:

- **FSPEC §5.4** (approved, unchanged) gate table: `| A3 | Phase DOD's verify step | no findings remaining |`
- **TSPEC v1.3** `:657`: `| A3 | **null** — same shape as A1: permittedActions: [], step 6 unreachable, resolved never reached | — |`

Both are defensible. FSPEC describes what re-runs *after* an A3 resolution; TSPEC observes that A3
has `permittedActions: []` (`TSPEC:863`, A3-6), so the driver never reaches step 6 and there is no
applied resolution for a gate to follow — A3's product is a classification only (FSPEC §7.2 A3-6,
`FSPEC:1058`). If TSPEC is right, FSPEC's A3 row describes an unreachable state and should say so as
A1's row does ("**none.** … A1 has no independent post-action gate"). If FSPEC is right, TSPEC v1.3
silently weakened an approved product contract during an erratum round. **Nothing in the three
documents currently reconciles them**, which is exactly why the two reviewers reached opposite
severities from the same observation.

**4. The two reviewers do not contradict each other — they resolve a document conflict in opposite
directions, and each is right about its own lens.** pm-review's lens is the product contract: a PLAN
that follows an approved FSPEC row is not a PLAN defect, and it correctly refuses to block on it,
routing the divergence upstream as an `ERRATUM: TSPEC` line. te-review's lens is testability: whichever
document wins, `PLAN:869` as it stands instructs A-07 to author a case that cannot both exist and pass
against a correct build, and that is blocking *under either resolution*. Note the asymmetry — pm's
reading makes the PLAN correct-but-pending-upstream; te's makes it wrong today. te's is the safer
reading because the PLAN text is inconsistent with itself: `PLAN:274` (A3 = `permittedActions: []`,
throwing `apply`/`revert` stubs, no gate) and `PLAN:869` ("A-23 lands both gates") cannot both be true.

**5. PROPERTIES predicted this exact failure mode before it happened.** `PROPERTIES:568` states:
"Asserting conjunct 1 at A3 would require stubbing a gate A3 never reaches and observing a disposition
A3 cannot produce — it would fail against a correct build, in the RED batch (A-07) that authors it,
and not be diagnosed until A-23." PROPERTIES §6 (PROP-GATE-01…05, `PROPERTIES:559-568`) already states
the correct gateless form for both seams verbatim. The remedy is a transcription, not a design
decision — the downstream document had already done the thinking, and the erratum channel did not
carry it up.

**6. One further piece of drift, recorded rather than routed.** te F-03 notes that `PROPERTIES:1045`
and §13.1 item 5 (`PROPERTIES:1126-1129`) still list `fixtures/scanFixtures.js` as "A-01 proposed — no
PLAN ownership row yet" and still route it as an open erratum — a note that item 3 above has already
closed. te-review deliberately did **not** emit a fresh `ERRATUM: PROPERTIES:` line for it. That is the
right call under a one-round bound, but it means a closed erratum is still live text in PROPERTIES and
would otherwise be preserved by harvest as durable signal.

## Best-Guess Root Cause

**Root cause 1 (primary) — an erratum fix was scoped to the erratum's wording, not to the extent of the
upstream change it reconciles with.** The routed line named A1, because A1 is where the two
representations visibly collided. The TSPEC edit that settled it covers A1 **and A3** — they are one
sentence in TSPEC v1.3's changelog and one shared statement at `TSPEC:434` ("Those two seams also
supply `verifyGate: null`"). The PLAN author applied the reconciliation to the named seam and did not
ask *what else does the document I am now agreeing with say*. This is a general hazard of the erratum
channel: an erratum line is a **pointer to a symptom**, and a fix that treats it as the full
specification of the defect will under-apply whenever the upstream correction is broader than the
sentence that surfaced it. Nothing mechanical checks fix extent against change extent.

**Root cause 2 (contributing, and the deeper one) — the errata were routed to the PLAN when the
unresolved conflict lives between FSPEC and TSPEC.** A3's gate is described one way in an approved
FSPEC §5.4 row and the opposite way in TSPEC v1.3 §5.5/§7.2, and neither document acknowledges the
other. The PLAN cannot be simultaneously consistent with both, so *any* PLAN text about A3's gate is
defensible-or-defective depending on which parent you read — which is precisely the split between pm
F-02 and te F-01. Routing an erratum to the **child** of a conflict cannot resolve the conflict; it can
only relocate it. The correct target for the A3 half is the FSPEC/TSPEC pair, and the PLAN edit follows
from whichever way that lands.

**Root cause 3 (why it halted rather than shipping a red-against-correct test) — the erratum protocol
is bounded and confirmation-gated, and it worked as designed.** The protocol requires the upstream
document's own approvers to confirm the edit as an append-only round before the upstream approval is
allowed to stand, and grants exactly one such round per doc per phase. Both properties fired: te-review
— an original PLAN approver — was asked to confirm, applied its testability duty, refused, and the
one-round bound converted that refusal into a halt instead of an unbounded re-edit/re-confirm spiral.
The concrete regression it prevented is specific and expensive: A-07 authoring an A3 gate-exclusivity
case that fails against a correct build (a red RED batch, misdiagnosed for four batches until A-23) or,
worse, is written vacuous and silently drops AC-4.6's mutation control at one of five seams. Nothing
here is a harness defect.

**Root cause 4 (contributing) — the downstream document already held the answer, and the channel is
one-way.** PROPERTIES §6 states the correct gateless form for both A1 and A3, and `PROPERTIES:568`
names the exact failure mode that would follow from getting A3 wrong. That analysis existed *before*
the PLAN edit was made and was not consulted while making it. Errata flow child → parent as findings;
there is no reciprocal convention for a parent's fix to be checked against the child text that
motivated it. Consulting `PROPERTIES:559-568` while editing `PLAN:869` would have produced the correct
both-seams sentence on the first attempt.

**A note on what is *not* a root cause.** Unlike the Phase T halt (`POSTMORTEM-T`), no routed premise
here was false, no reviewer withdrew a finding of their own, and no edit degraded something correct.
The four fixes are all improvements — item 1's is stronger than the erratum asked for (it turns a
naming reconciliation into a testability rule stated in both mutation directions), and item 2's
preserves the eight-member set-equality assertion rather than trading it away. The defect is one of
**reach**, not of judgement.

## Recommendation

---

RESOLVED: no
