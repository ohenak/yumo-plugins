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

The findings are small, bounded and already diagnosed by the confirming reviewer, who supplied the fix
text. Clearing this halt is one decision plus a prose edit and a re-confirmation — **not** a re-run of
Phase PR, and not a scope, batch or dependency change. te-review states it explicitly: "the fix is
confined to prose inside one §8.2 table cell, and the re-parse result will be unchanged."

**R-1 — Decide A3's gate once, at the level where the conflict lives (FSPEC ⟷ TSPEC).** This is the
only judgement call in the list; everything else follows from it. The evidence favours **A3 has no
post-action gate**: A3's `permittedActions` is `[]` (`TSPEC:863`, FSPEC §7.2 A3-6), so the driver never
reaches step 6, no resolution is ever applied, and there is nothing for a gate to verify — the same
argument FSPEC already accepts for A1 ("**none.** … A1 has no independent post-action gate; safety
rests on A1-3's escalate-when-unsettled rule"). If that is the resolution, **FSPEC §5.4's A3 row is
what changes**: restate it in A1's form (no independent post-action gate; A3's product is a
classification only; Phase DOD's verify step is the *next invocation's* input, not this seam's gate),
and TSPEC v1.3 needs no further edit. If instead A3 genuinely retains a gate, TSPEC §5.5/§7.2 revert to
that and the PLAN's A1-only edit was correct as written. **Record the decision explicitly** — in
`DECISIONS-pdlc-advisory-tier.md` or the amended §5.4 row itself — so the next reader does not re-open
it. Do not resolve this by editing the PLAN.

**R-2 — Apply te F-01's fix to `PLAN:869` (four clauses, one sentence each).** Under the R-1 = "no
gate" resolution, transcribe PROPERTIES §6's form (`PROPERTIES:559-568`) verbatim rather than
paraphrasing it:

1. Say **A1 and A3** declare no gate: for both, the mutation is to *install*
   `async () => ({ passed: true })` and the case must **fail** when it is installed; both assert
   `verifyGate === null`, that `resolved` is unreachable on every path, and that the seam terminates in
   `escalated` or `no-action` with its own O-1 triple.
2. Replace "A1 is the direction that runs backwards" with "**A1 and A3 run backwards**".
3. Correct "A-23 lands both gates" to "A-23 lands **A4's gate and A3's gateless seam**" — `PLAN:274`
   already describes A-23 that way, so this removes a self-contradiction inside the PLAN.
4. Repoint the citation in the same clause from TSPEC §5.4 to **TSPEC §5.5** (te F-02 = pm F-01; both
   reviewers raised it). pm F-01 prefers the fuller form: "FSPEC §5.4's gate table; TSPEC §5.5's five
   `verifyGate` rows" — adopt that, since the five-row *content* does come from FSPEC §5.4.

**R-3 — Close te F-03 in PROPERTIES on its next touch (no round of its own).** Strike the "A-01
proposed — no PLAN ownership row yet" note at `PROPERTIES:1045` and the open-erratum item 5 at
`PROPERTIES:1126-1129`: `PLAN:252`/`:308` now carry the row and `validatePlanContract` passes. te-review
deliberately did not route this as a new erratum; it must not be re-raised by a later reviewer, and
harvest must not preserve a closed erratum as durable signal.

**R-4 — Re-confirm as the next append-only round, one reviewer, delta-scoped.** After R-1/R-2 land as
PLAN v1.7 (plus whichever of FSPEC/TSPEC R-1 touches), dispatch **te-review** to write
`CROSS-REVIEW-test-engineer-PLAN-v7.md` confirming only that (a) §8.2 now states the gateless form for
A1 **and** A3, (b) the A-23 description and the §5.5 citation are corrected, and (c) nothing else
moved. pm-review already approved this delta at `-v6` (`VERDICT: Approved`, `{0,0,2}`) and its two Lows
are both addressed by R-2's clauses 3–4, so it need not be re-run for the PLAN; if R-1 amends FSPEC,
that document's own approvers confirm that edit separately. Re-append approval anchors on PASS so the
PLAN approval does not go stale, and re-run the contract gate (`parsePlanTasks` / `validatePlanContract`
/ `computeTopologicalBatches`) — the expected result is unchanged at 36 tasks, `{"ok":true}`,
20 batches.

**R-5 — Answer te-review's two open questions while editing §8.2; the second is a real oracle hole.**
Q-02 asks whether the generated per-seam case branches on gate-declared vs gateless by reading an
explicit registry column or by inspecting the shipped `SeamOps` at test time. Keying it off the shipped
object makes the test agree with whatever the implementation does — a seam that silently *lost* its
gate would take the gateless branch and pass, which is precisely the mutation T-03-6(b) exists to
catch. Name the explicit registry column (e.g. `gate: null`) in §8.2 before A-07 authors it. Q-01 asks
for a half-sentence recording *why* A1's and A3's now-identical case bodies live in different blocks
(`A-31` and `A-23`) — the un-skipper rule follows the last symbol the block's cases exercise, which for
A1 is A2's `verifyGate`. Cheap, and it stops a future reader deleting one as a duplicate.

**R-6 — This is the erratum protocol's one round for this document, so it must clear by verification,
not by re-opening the channel.** The bound is one erratum round per upstream doc per phase and it is
spent. The clearance path is the one this POSTMORTEM's lifecycle defines: land R-1–R-4 on the branch,
then flip this file's `RESOLVED:` marker to `yes` in a commit that names what addressed each finding —
the A3 gate decision and where it is recorded, the `PLAN:869` edit sha, and the te-review
re-confirmation sha. Do **not** route a fresh erratum to re-argue A3.

**R-7 (process, non-blocking) — two candidate LEARNINGS.** (a) *An erratum fix should be scoped to the
upstream change, not to the erratum's wording.* When a routed item is resolved by pointing at another
document's edit, read that edit's full extent — here, one sentence covering two seams — before writing
the fix. (b) *Read the child document that raised the erratum while writing the parent's fix.*
PROPERTIES §6 already stated the correct both-seams form and had predicted this exact failure at
`PROPERTIES:568`; consulting it would have produced the right sentence first time. Both belong in
`LEARNINGS-pdlc-advisory-tier.md`, alongside `POSTMORTEM-T`'s R-5 (errata should carry their
grounding at emission) — the three are the same theme from three angles: **the erratum channel is
low-friction by design, and every one of its failure modes so far has been a missing check at the
emission or application step, never at confirmation.**

---

<!-- RESOLVED marker: an operator or agent flips this to `yes` only after R-1–R-4 are on the branch and
this document's ## Recommendation findings are each addressed, in a commit that names what addressed
each. The workflow scripts never write `yes`. -->

RESOLVED: no

## Recommendation — addressal ledger (for the resolving commit)

| Finding | Addressed by (fill on resolve) |
|---|---|
| te F-01 (High) — §8.2 tells A-07 to stub a gate A3 does not declare | |
| R-1 — A3's gate decided once at FSPEC ⟷ TSPEC, and recorded | |
| te F-02 / pm F-01 (Low) — `PLAN:869` cites TSPEC §5.4 instead of §5.5 | |
| te F-03 (Low) — PROPERTIES §12.3 / §13.1 item 5 still route a closed erratum | |
| pm F-02 (Low, routed as `ERRATUM: TSPEC`) — A3 gate representation | |
| Q-02 — registry column, not shipped-object inspection, keys the gateless branch | |
| Re-confirmation of the corrected PLAN | |
