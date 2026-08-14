# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 6
**Scope:** Delta re-review of the round-4 revision. Testing lens only. Sections approved in rounds 1–5 are not re-read for their own sake; every claim below is re-measured against HEAD rather than read off the revision's prose.

## Method

`git diff 4097aec7..HEAD` over the PLAN, `4097aec7` being the commit pinned in v5's `REVIEWED-COMMIT`. One commit (`df4d1c44`), and the diff touches exactly six regions: the version cell, a new `0.6` changelog row, §1.2's AC-4.4 paragraph, T50's Description cell, §4's kind-1 paragraph (one added) and kind-3's T05 note, and DoD items 14 and 15. No batch cell, no `Deps` cell, no ownership-manifest row, no §2.1 row is in the diff.

Re-measured at HEAD rather than taken from the revision:

- §2.1's `Carried by` cells for all five AT-2 criteria, enumerated and compared against item 14's new sentence (`PLAN:207-212`).
- T59's row in full — subject, legs, file, batch, deps (`PLAN:160`) — against the new §4 paragraph's claims about it.
- §3's ownership row for `fixture-machine.test.js` (`PLAN:326`), for the single-owner claim.
- DoD item 16's content (`PLAN:472`), for the corrected pointer.
- §5's point 4 (`PLAN:415`), for the cross-reference the new §4 paragraph makes.
- T14/T46's legs against the "hermetic carriers" wording.

## Previous findings

Round 5 was an erratum-confirmation round that raised nothing and carried forward round 4's two Lows unaddressed. Both are addressed here, and both discharges are real:

**F-01 (DoD item 14/15's "no other observer" overstated) — resolved, and resolved by measurement rather than by hedging.** v0.5 said AT-2.1, AT-2.3, AT-2.4, AT-2.5 and AT-2.6 "have no other observer", which §2.1 contradicted for three of the five. Item 14 now splits the claim: AT-2.3 and AT-2.6 have no observer outside T50's gated legs; AT-2.1, AT-2.4 and AT-2.5 lose only their machine-level conjunct and retain the carriers §2.1 names. I enumerated §2.1's cells rather than trusting the restatement, and the transcription is exact in both directions:

| Criterion | §2.1 `Carried by` (`PLAN:207-212`) | Item 14's claim | Agrees |
|---|---|---|---|
| AT-2.1 | T11, T14, T41, T46, T53, T34, T50 | non-T50 carriers retained; machine-level conjunct lost | ✓ |
| AT-2.3 | T50 (second leg) | no observer outside T50 | ✓ |
| AT-2.4 | T53, T34, T59, T50 | non-T50 carriers retained | ✓ |
| AT-2.5 | T13, T25, T34, T45, T50 | non-T50 carriers retained | ✓ |
| AT-2.6 | T50 | no observer outside T50 | ✓ |

Item 14 additionally transcribes those carrier lists inline and names item 9 as AT-2.5's local-suite observation in its own right — item 9 does state the below-floor behaviour (`PLAN:462`), so that pointer holds too. Item 15's tail is narrowed the same way rather than left contradicting item 14. The gate itself is untouched, which is what I asked for: the fix tightens the sentence and does not relax the check.

**F-02 (T50's capability predicate had no stated discriminator) — resolved.** The predicate now names what decides: the probe process's exit status. Executes and exits non-zero ⇒ capability absent ⇒ registered skip, and item 15's evidence obligation fires. Cannot execute at all (spawn error, `ENOENT`, timeout, any outcome with no exit status to read) ⇒ unprobeable ⇒ workflow failure. That is a total classification over the outcome space with a named residual arm, which is exactly the shape the round-3 High needed and the shape v0.5 left for an implementer to invent. It also states the interaction with item 14 correctly: on `ubuntu-latest` both branches are off the expected path because all three probes exit 0, and a skip there reddens item 14 regardless, because that item asserts the recorded set is **empty** — a positive set assertion, not an absence.

**Q-01 (T59 → T50's eight-batch red interval) — answered, and answered as a plan decision rather than deferred to the implementer.** §4 now states the interval is genuinely red and never `test.todo`, with the reason that a `test.todo` here would reproduce, inside the suite meant to catch it, the exact "skipped and forgotten" failure mode T50 exists to prevent. Both mitigations check out at HEAD: T59's subject is hermetic (injected-spawn recorder, pure `(records, inventory)` comparator — `PLAN:160`), and `fixture-machine.test.js` is a new file with T59 as its only owner in §3 (`PLAN:326`), so `node --test __tests__/fixture-machine.test.js` names one failing file and one closing task. The batch arithmetic in the sentence is right: T59 is batch 2, T50 is batch 10, eight batches.

## Delta scan

The two edits outside my findings, checked for breakage rather than re-reviewed:

**(a) §1.2's AC-4.4 reason restated as one of degree** (PM F-01). The revision concedes that machine-global mutation is within T50's reach — its AT-2.3 leg drives two consumer repos through a machine-level upgrade, its AT-2.6 leg makes a different plugin version current — and narrows the remaining reason to the **revert**: a third sequential run restoring the prior plugin root. I checked the plan for a leg that installs an older plugin version over a newer one and there is none; T50's AT-2.6 pairing walks one direction only. So the narrowed claim is true of this plan's task table, not merely asserted. The paragraph then does something I want to see more of: it states its own expiry — the moment a revert leg exists on the fixture machine, the reasoning lapses and AT-4.4 should move onto T50. That converts a standing exclusion into a scheduling decision with a named trigger, which is testable in the only sense a `[manual]` row can be. No testing objection.

**(c) §4's T05 note points at DoD item 16, not item 12** (PM F-03). Confirmed at HEAD: item 16 carries the licence record, the `LICENSE` file and the `package.json` SPDX field (`PLAN:472`); item 12 is the AT-2.1/2.3/2.4/2.6 fixture-machine observation, and the 85% branch floor is item 4. The old pointer was wrong and the new one is right.

**Nothing previously approved is broken.** The graph is untouched in every cell that defines it: no row added, removed, re-batched or re-scoped, `Deps` cells byte-identical, ownership manifest untouched, §2.1's 35-id set-equality untouched (no `AT-` id appears or disappears in the diff). No same-batch same-new-file collision is introduced, because no `Files` cell changed. T50's row is the only task row edited and only its Description cell moved.

## Findings

Three, none blocking. All three are one-passage edits against text this round introduced.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The newly named discriminator has no named red leg.** Edit (d) introduces a two-branch classification with a fail-closed arm — probe exits non-zero ⇒ registered skip; probe cannot execute (spawn error, `ENOENT`, timeout) ⇒ workflow failure. T59 is the one hermetic test task for `scripts/fixture-machine.mjs`, and its row enumerates its legs explicitly: recorder produces a record per leg, comparison fails on equality of either field, a leg that produced no record fails distinguishably; comparator yields a violation for an unregistered name, an unknown capability key, a duplicate name and an empty `unverifiedInvariants`, and none for the all-registered case. **Neither discriminator branch is in that enumeration.** The gap is not covered elsewhere: item 14(b) fails only on skips *absent from the inventory*, and an unprobeable capability mis-implemented as a skip would be a *registered* skip and pass the comparator; item 14(c)'s empty-set assertion on `ubuntu-latest` never exercises the branch, because all three probes exit 0 there by construction. So the arm that makes the predicate opt-out rather than opt-in is the one arm no stated assertion pins. The seam already exists — T59 injects the spawn function — so the leg is cheap: feed an injected result with no readable exit status and assert the classification is `unprobeable` and the run fails; feed a non-zero exit and assert a registered skip is recorded naming the capability. Both are positive assertions on the classification, not "does not skip". Medium rather than High because the fallout is bounded — a mis-implementation degrades to registered-skip-plus-item-15-evidence, not to silent green — and because DoD item 4's 85% branch floor on this module makes the branches *executed*, just not *asserted*. | T59; T50 (d); DoD items 4, 14 |
| F-02 | Low | Local | **The v0.6 changelog says the task table is "byte-unchanged", and it is not.** The row's own item (d) is an edit to T50's Description cell, which lives in §2's task table. What is byte-unchanged is narrower and is what v0.5's row said precisely: no row added, removed, re-batched or re-scoped, and every batch, `Deps` and `Files` cell identical. The overclaim matters because a reviewer or implementer who trusts "task table byte-unchanged" will not diff §2 and will miss the round's one substantive task-row edit. Fix is to restate the scope sentence in v0.5's terms — batch arithmetic, ownership manifest and §2.1's set-equality byte-unchanged; one Description cell edited. | Changelog 0.6 |
| F-03 | Low | Local | **"Hermetic carriers" is slightly too strong for two of the retained carriers.** Item 14 says AT-2.1, AT-2.4 and AT-2.5 "retain only the hermetic carriers §2.1 names". For AT-2.4 (T53, T34, T59) and AT-2.5 (T13, T25, T34, T45) that is exact. For AT-2.1 it is not quite: T14 and T46 both live in `launcher.test.js`, and T14's real-spawn pass-through and signalled-child legs are precisely the legs T50 declares capability-gated under `real-spawn` and keeps out of the local suite. So a runner without `real-spawn` loses part of T14/T46 too, and AT-2.1's genuinely hermetic residue is T11, T41, T53, T34 plus T14's non-spawning S-3 descriptor leg. This errs in the safe direction — it understates the loss rather than overstating the observation — and does not touch the gate, but it is the same kind of imprecision F-01 of round 4 asked to be removed from this passage. One clause fixes it. | DoD item 14; §2.1 AT-2.1; T14, T46, T50 |

## Questions

None. Round 4's Q-01 is answered in §4 and I have no successor to it.

## Positive Observations

- **The item-14 narrowing was done by transcription, not by hedging.** The easy repair for "no other observer" was to soften it to "little other observation" and move on. Instead the revision went to §2.1, split the five criteria into the two that genuinely have no outside observer and the three that lose only a conjunct, named the lost conjunct for each — clean-machine install, byte-identical tree and index, the container floor — and transcribed §2.1's carrier lists inline so the next reader can check the claim without a second lookup. It then declares §2.1 the authority and instructs a future reader who finds a discrepancy to tighten the sentence and never relax the gate. That is the right precedence to write down, because the failure mode of a justification drifting from its evidence is that someone eventually "fixes" it by deleting the check.
- **Item 15's tail moved with item 14 rather than being left behind.** The skip-coverage obligation now says a later runner or image change must not silently drop "the **only** observation of AT-2.3 and AT-2.6, or the **machine-level** observation of AT-2.1, AT-2.4 and AT-2.5". Two passages stating the same fact are two passages that can disagree later; this round they were edited as one unit. That is the discipline that keeps a DoD checkable instead of merely long.
- **The discriminator is stated as a total classification with a named residual.** "Exit non-zero ⇒ absent; no readable exit status ⇒ unprobeable ⇒ failure" leaves no third outcome for an implementer to route by taste, and it puts the residual on the failing side. Naming `ENOENT` and timeout explicitly matters — those are the two outcomes most likely to be caught and reported as "capability missing" by someone writing the probe in a hurry, which is exactly how an opt-out predicate quietly becomes opt-in.
- **The AC-4.4 argument now carries its own expiry condition.** Stating "the moment a revert leg exists, this paragraph's reasoning expires and AT-4.4 should move onto T50" turns a scheduling decision into something a later reader can *check* rather than inherit. Deferrals that name their own trigger are the only kind that reliably get revisited.
- **The Q-01 answer refused the cheap fix.** An eight-batch red interval invites `test.todo`, and the revision names why it won't: that is the failure mode T50's gate exists to catch, and reproducing it inside the suite meant to catch it is the worst possible place for it. It then earns the tolerance with two checkable properties — hermetic subject, single-owner new file — and cross-references §5's point 4 as the mirror case (tolerable there because the failure is unrelated to the change; tolerable here because the failure *is* the change). I verified §5 point 4 does say exactly that.
- **The scope discipline held again.** Five stated edits, six diff regions, no round-4 finding swept in opportunistically, no batch or `Deps` cell touched, no `Files` cell touched. Three rounds running now, this document has been edited to the size of its findings.

## Recommendation

**Approved with minor changes**

All three of my round-4 items are resolved, and resolved at the source rather than annotated around. F-01's repair was verified by enumerating §2.1's five AT-2 rows and comparing them cell by cell against item 14's new sentence — the transcription is exact in both directions, item 9's pointer holds, and item 15 was narrowed in the same edit rather than left to contradict it. F-02's repair gives the capability predicate a total, positively-stated classification whose residual arm fails the workflow, which is what the round-3 High needed and what v0.5 left unstated. Q-01 is answered as a plan decision with two properties I could check at HEAD — T59's subject is hermetic, `fixture-machine.test.js` has exactly one owner in §3 — and the batch arithmetic in the answer is right.

Nothing previously approved is broken. The graph is untouched in every cell that defines it, §2.1's set-equality is untouched because no `AT-` id appears or disappears in the diff, the ownership manifest is untouched, and no same-batch same-new-file collision can have been introduced because no `Files` cell moved.

The three findings are all against text this round wrote, and none gates. F-01 is the one worth doing before implementation starts: the discriminator's fail-closed arm is now specified but no named leg asserts it, and it is the one arm neither item 14(b) nor item 14(c) can reach — 14(b) admits a registered skip, and 14(c) never runs the branch because `ubuntu-latest`'s probes all exit 0. T59 already injects the spawn function, so two legs close it: an injected result with no readable exit status asserted to classify `unprobeable` and fail the run, and a non-zero exit asserted to record a registered skip naming its capability. Both are positive assertions on the classification rather than "does not skip", which is the shape this plan has been careful about everywhere else. F-02 and F-03 are one-sentence corrections — the changelog's "task table byte-unchanged" is contradicted by its own item (d), and "hermetic carriers" is slightly too strong for T14/T46, whose real-spawn legs are themselves capability-gated.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
