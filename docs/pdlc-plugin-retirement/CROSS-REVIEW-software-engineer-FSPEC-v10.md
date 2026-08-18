# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-18
**Iteration:** 10 (upstream-cascade confirmation — FSPEC bytes unchanged)

## Overview

This is an **upstream-cascade confirmation**, not a re-review. My FSPEC approval was recorded at
`REVIEWED-COMMIT: fe306b11` with `UPSTREAM-STATE: REQ sha256:1038b816…` (v0.11). The REQ has since
taken an erratum edit — `cc009367`, REQ v0.12, now `sha256:41fb21e8…`, matching the dispatch hash —
so the approval was taken against a REQ version that no longer exists. FSPEC bytes are unchanged.

One question answered: **does the FSPEC still hold as a faithful compression of the REQ as it now
stands?** Substantively, yes — the v0.12 paragraph tightens C-7 in the direction the FSPEC already
implements, and two FSPEC passages that depend on it (BR-SWEEP-2/3/4 ordering, O-F's "AT-2.3 refuses
to pass") are *strengthened*, not contradicted. What does not hold is the FSPEC's own record of
which upstream version it traces, and one wording collision the new C-7 prose creates with
BR-SWEEP-6's registration-keyed skip exemption. No High. Approval stands with minor changes.

## Upstream delta examined

`git diff 68e72db2 cc009367 -- docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` — 16
insertions, 1 deletion, two hunks:

| Hunk | Location | Content |
|---|---|---|
| 1 | `REQ:15`–`:20` | Status row 0.11 → **0.12** (2026-08-18); changelog entry for the C-7 erratum |
| 2 | `REQ:264`–`:275` | New paragraph inside C-7: **"Held classes and the interim state."** |

The new paragraph asserts five things: (a) C-7 governs the repo's own CI checks at each commit and
**not** this REQ's completion criteria, which are evaluated when the sweep is complete (`REQ:264`–
`:266`, citing AC-1.1's *given*); (b) a held deletion class leaving AC-1.1 unsatisfied is an
incomplete feature on an unmerged branch, not a C-7 red (`:267`–`:269`); (c) it does not forbid the
ungated classes from landing as their own commits (`:269`); (d) there is no skip-list, no
expected-failure inventory and no tolerated-red register in this feature, because C-8 forbids that
shape and "a criterion that is allowed to be red by registration stops being a criterion"
(`:270`–`:272`); (e) where a check observing a held class would run red before that class lands,
**the resolution is ordering — the check becomes live with the class it covers — never
registration**, and the branch does not merge on a green subset (`:272`–`:275`).

Nothing else in the REQ moved. AC-1.1 (`:296`–`:300`), C-8 (`:276`–`:278`), AC-1.3, C-5, C-6 and
the M-11 rows are byte-identical to the version I approved against, so every FSPEC citation of them
still resolves to the same text.

I re-read, at the current version, each upstream passage the FSPEC leans on that the delta could
reach: C-7 in full, C-5's conflict rule, C-8, AC-1.1, AC-1.3, O-7/BL-05 and O-3. Verification of
the FSPEC's compression against each follows in Findings and Positive Observations.

## Findings

FINDING: Medium | delta | nonlocal | §0 header (`FSPEC:9`); §7.2 (`FSPEC:827`); O-C (`FSPEC:806`) | FSPEC's traced-upstream pin is stale — it names REQ v0.11 while approved upstream is v0.12
FINDING: Medium | delta | nonlocal | §4 BR-SWEEP-6 (`FSPEC:285`–`:294`); §7.3 (`FSPEC:843`) | New C-7 prose forbids "registration" as a resolution in blanket terms; BR-SWEEP-6's skip exemption is keyed to run-time sink registration and now reads as the shape C-7 forbids
FINDING: Low | delta | nonlocal | §4 BR-SWEEP list (`FSPEC:262`–`:279`); `REQ:272`–`:275` | The "resolution is ordering, never registration" invariant is now stated upstream but exists in FSPEC only implicitly, spread across BR-SWEEP-3 and BR-SWEEP-4

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | *(delta, nonlocal.)* The FSPEC's own record of which upstream it compresses is now false at HEAD. `FSPEC:9` pins `REQ-pdlc-plugin-retirement.md` **(v0.11)**; §7.2's lead-in (`FSPEC:827`) states "REQ v0.11 (2026-08-17) is the version this FSPEC now traces"; O-C (`FSPEC:806`) says "REQ v0.11 settles the manifest branch". Upstream is v0.12 (`REQ:17`, `:20`). The *content* each of these leans on is unchanged — O-3 and AC-1.1's set-equality are byte-identical — so this is a pointer defect, not a compression defect: no downstream reader is misled about behaviour, but a reader checking traceability finds the FSPEC claiming a version that is one erratum round behind, and §7.2's ledger of resolved upstream errata does not record the C-7 round at all. Fix is mechanical on the next unfrozen edit: bump the three version labels and add a §7.2 row for the v0.12 C-7 erratum. Not gating — no behavioural clause changes. |
| F-02 | Medium | Local | *(delta, nonlocal.)* `REQ:270`–`:272` now says, without qualification, "There is no skip-list, no expected-failure inventory and no tolerated-red register in this feature: C-8 already forbids that shape, and a criterion that is allowed to be red by registration stops being a criterion," and `:272`–`:274` that the resolution is "ordering … never registration." BR-SWEEP-6 (`FSPEC:285`–`:294`) exempts a skip precisely by **registration** — "no `skip` or pending marker survives that does not reach the run's skip sink as a registered record" — and §7.3's row (`FSPEC:843`) records that the exemption is deliberately keyed to sink records. The two are reconcilable and I believe both are correct as intended: C-7's new paragraph is about *this feature's completion criteria and held deletion classes* in repo CI, whereas the skip sink records a *runner capability limitation* inside a suite that is otherwise green — a registered `chmod 000` skip on a root runner is not a criterion allowed to be red. But the reconciliation lives only in my head and in this file. A TSPEC or implementation reader who takes `REQ:270`–`:274` at face value can read BR-SWEEP-6 as the forbidden shape and drop the exemption, which reds the gate on a root runner — the exact failure §7.3 erratum 9 was raised to prevent. One clause in BR-SWEEP-6 naming the distinction ("the sink records runner capability, not a tolerated criterion failure; C-7's prohibition on registration is about held classes") closes it. Not gating: the FSPEC as written still implements the correct behaviour. |
| F-03 | Low | Cross-Feature | *(delta, nonlocal.)* The invariant `REQ:272`–`:275` now states — a check that would observe a not-yet-landed class becomes live *with* that class, and a branch never merges on a green subset — is a general sweep/staged-deletion constraint, not a fact about this feature. The FSPEC implements it (BR-SWEEP-4's "gate-relevant dependents never lag their subject", `FSPEC:268`–`:279`; §3.1's dependents-before-subjects ordering, `FSPEC:147`–`:149`) but never states it as a rule, so the rationale for the ordering discipline is only recoverable from the REQ. Worth a harvest note for `docs/_constraints/DOMAIN-CONSTRAINTS.md`: staged deletion resolves premature-red checks by ordering, never by registering an expected failure. No FSPEC edit required for correctness. |

## Questions

| ID | Question |
|----|---------|
| Q-01 | `REQ:269` says a held class "does not forbid the ungated classes from landing as their own commits," but §3.1's ordering is a total order with hard dependencies (class 6 before 7, 7 before 9/10, 12 last). If the held class is an early one — class 1, the CI-jobs class that BR-SWEEP-3 forces to land whole — which later classes are actually still landable? The REQ's permission is general; the FSPEC's ordering table is the thing that decides it. TSPEC-level question, no FSPEC edit implied. |
| Q-02 | Does §7.2 want a row for the v0.12 C-7 erratum even though it produced **no** FSPEC edit? The section is titled "Upstream errata resolved" and reads as a ledger of upstream rounds this document traces; a round that required no edit is still a round. Flagged with F-01 rather than decided here. |

## Positive Observations

- **The delta confirms rather than disturbs the FSPEC's load-bearing ordering rules.** BR-SWEEP-2
  ("every commit passes the L-9 gate command set", `FSPEC:264`–`:266`) is scoped to the L-9 command
  set — the workflows suite, the engine suite, `bash -n` over tracked `*.sh` (`FSPEC:394`–`:398`) —
  which is exactly "the repo's own CI checks at each commit" that `REQ:264` now says C-7 governs.
  The FSPEC never asserted that this REQ's completion criteria hold at intermediate commits, so the
  narrowing lands on text that was already correct.
- **O-F was already written the way the new paragraph demands.** `FSPEC:809` states "AT-2.3 refuses
  to pass while the row still mandates the retired channel," and BR-DOC-3 (`FSPEC:475`–`:477`)
  leaves BL-05's disposition upstream and gating. That is `REQ:267`–`:272` verbatim in behaviour: an
  unsatisfied criterion on an unmerged branch, not registered anywhere as tolerated. Had the FSPEC
  ever written "AT-2.3 is skipped/waived until the row is dispositioned," this round would have been
  a High.
- **AT-1.1's *given* still matches AC-1.1's.** `FSPEC:602` reads "Given HEAD after the sweep";
  `REQ:296` reads "Given the sweep is complete at HEAD" — the very *given* `REQ:266` cites as the
  reason completion criteria are not C-7's business. The compression survives the delta unchanged.
- **No new upstream obligation is unowned.** Every clause of the new paragraph maps to existing
  FSPEC text (ordering → BR-SWEEP-3/4 and §3.1; no vacuous or skipped survivor → BR-SWEEP-6 and
  C-8's row at `FSPEC:90`; no green-subset merge → §6's criteria evaluated at HEAD). The gap is
  descriptive (F-01, F-03) and one wording collision (F-02), not a missing behaviour.

## Recommendation

**Approved with minor changes** — the prior FSPEC approval carries over to REQ v0.12.

The FSPEC remains a faithful compression of the upstream as it now stands: the v0.12 paragraph
constrains C-7 in the direction the FSPEC already implements, and no FSPEC clause cites upstream
text that has changed meaning. No High finding, so the decision freeze holds and I am not asking for
an unfreeze.

DEFERRED to the next unfrozen FSPEC edit: bump the three v0.11 labels to v0.12 and add the §7.2
ledger row (F-01); add one clause to BR-SWEEP-6 distinguishing sink-registered runner limitations
from the tolerated-red register `REQ:270`–`:272` forbids (F-02).
DEFERRED to harvest: promote "staged deletion resolves premature-red checks by ordering, never by
registering an expected failure" as a domain constraint (F-03).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

UPSTREAM-STATE: REQ sha256:41fb21e82be8b5c5622da7638abde6694890703ec72bf257fbefa7f52dda9c51
