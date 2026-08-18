# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.10, sha256:90464289a6f32ed39f13ffe30aca693f7d033e96c0bc1a08311a53b964b876e4 — bytes unchanged since the v10 approval)
**Upstream at dispatch:** REQ sha256:41fb21e82be8b5c5622da7638abde6694890703ec72bf257fbefa7f52dda9c51 (v0.12); FSPEC sha256:dccb45d6fb253d197b7a197288a3381b330903fc4ac49efbf0c99b410c79ade0 (unchanged from the v10 `UPSTREAM-STATE` anchor)
**Date:** 2026-08-18
**Iteration:** 11

## Overview

This is an upstream-cascade confirmation, not a re-review. The TSPEC's own bytes are byte-identical to the version approved at v10 (`REVIEWED-COMMIT: f6643915`). The REQ moved from v0.11 to v0.12 in erratum commit `cc009367`, a 16-insertion/1-deletion edit that (a) bumps the header row and adds a v0.12 changelog line and (b) appends one paragraph, **"Held classes and the interim state"**, to constraint C-7.

The single question answered here: **does the TSPEC still hold against the REQ as it now stands?**

Answer: **yes.** The C-7 addition is additive and clarifying; it names a discipline the TSPEC already spells out per-commit under BR-SWEEP-3 and BR-SWEEP-4, and it changes no clause the TSPEC compresses. One Medium is filed against a wording collision the erratum introduces with the REQ's own AC-1.3 registered-skip exemption, which the TSPEC leans on directly for TT-1b — the TSPEC is right and the erratum's absolute phrasing is the loose end, so nothing in the TSPEC needs to change.

FSPEC bytes did not move, so no FSPEC-derived citation in the TSPEC is at risk this round.

## Architecture

**What the erratum actually says.** C-7 previously constrained repo CI to be green at *every* commit, with the pre-sweep green baseline measured under BL-08. The appended paragraph dispositions the case the constraint left open: while a deletion class is held pending an upstream disposition, AC-1.1 being unsatisfied is an incomplete feature on an unmerged branch — not a C-7 red, not registered anywhere as an expected or tolerated failure, and no bar to the ungated classes landing as their own commits. Where a check that observes a held class would otherwise run red in repo CI before its class lands, **the resolution is ordering — the check becomes live with the class it covers — never registration.** The branch does not merge on a green subset.

**Why the TSPEC survives it unchanged.** The ordering rule is the TSPEC's existing per-commit design, restated upstream:

- §2.9's class-7 row already deletes `pipelineWiring.test.js`'s `DEV_META` comparison **in the class-7 commit**, citing BR-SWEEP-4 by name ("gate-read reference never lags subject"). That is the erratum's rule applied to a concrete gate.
- §5.4's hazard list holds the same shape three more times: `ci-arrangement.test.js` reds on class 1 unless both workflow files, both documents' count words and the oracle's own prose move in that one commit — "the reason C-7 outranks C-5 for class 1 (BR-SWEEP-3)"; `pipelineWiring.test.js` and `consolidationPreflight.test.js` are corrected "in the commit that deletes the symbols they name, never after"; `documentOracles.test.js`'s D-1/D-2 move with the prose in class 9 (BR-SWEEP-4's prose exception).
- Nothing in the TSPEC parks a criterion behind a register. There is no expected-failure inventory, no tolerated-red list, no `it.skip` used to hold a class open. C-8 and AT-1.3 are enforced in the TSPEC's direction, not relaxed.

**The AC-1.1 pin is untouched.** The erratum leans on AC-1.1's *given* ("the sweep is complete at HEAD") to argue completion criteria are not per-commit CI checks. That reading is faithful: AC-1.1 at HEAD still opens *"Given the sweep is complete at HEAD"*, still says set-equality not containment, and still delegates the branch choice to this feature's TSPEC. §2.2's decision — `pdlc/workflows/dist/` survives with tracked entry set set-equal to `{pdlc-cli.mjs}`, AC-1.1's **first** branch — is exactly what AC-1.1 still asks the TSPEC to pin, and §4.1's five-entries-today measurement is unaffected. No compression in §2.2 or §4.1 has gone stale.

## Interfaces

Every upstream seam the TSPEC leans on was re-read in its current version, not assumed from the item list:

| Upstream clause the TSPEC compresses | State at REQ v0.12 | TSPEC dependency | Verdict |
|---|---|---|---|
| AC-1.1 (`dist/` set-equality, branch pinned in TSPEC) | unchanged bytes; erratum only *cites* its *given* | §2.2 branch decision, §4.1 set-equality table, AT-1.1 | holds |
| C-7 (repo CI green at every commit) | unchanged prose + one appended paragraph | §5.4 hazard list, §2.9 class rows, BR-SWEEP-3/-4 ordering | holds, and is now upstream-backed |
| C-8 (no skipping tests deleted with their subject) | unchanged; now cross-referenced by C-7's new paragraph | §5.5 orphan-freedom and skip-join oracles | holds |
| AC-1.3 / AT-1.3 (no skipped or pending test; registered-record exemption) | unchanged | TT-1b's `itOrSkip` + `SKIP_INVENTORY` row; §5.5's fifteen added rows | holds — see F-01 for the wording collision |
| AC-5.2 allowed-difference set, AC-4.3 post-refusal state (v0.11 errata) | unchanged this round | §5.2, §4.3 | holds |

The class-6 and class-3 capability conversions are the only place the erratum's new sentence brushes against the TSPEC, and it does so at the level of words, not mechanism: `SKIP_INVENTORY` registers *capability gaps in the host environment*, and `validateSkipRecords` checks each record against its declared row. It does not register a failing criterion or tolerate a red, which is the shape C-7's paragraph forbids.

## Data Model

No data-model surface moved. The erratum adds no acceptance criterion, no business rule, no term to FSPEC L-2's closed retired-term set, and no entry to any enumerated set the TSPEC transcribes literally:

- §4.1's `{pdlc-cli.mjs}` survivor set and the five-entries-today baseline are unchanged.
- §4.3's nine expected cleanup names and TT-4's property strategy over their subsets are unchanged.
- §5.2's TT-3(b) five-member shipped-script enumeration and its `git ls-files -s` set-equality companion are unchanged.
- §5.5's nine post-sweep skip-join contributors, the eight-module green child and the fifteen `SKIP_INVENTORY` rows (one class-3, ten class-6 `bash`, four class-6 `python`) are unchanged, as is `KNOWN_CAPABILITY_KEYS`'s four-key value plus the added `python` key.

The v10 arithmetic that these numbers agree with each other therefore stands without re-derivation, because neither side of the equation moved.

## Test Strategy

Testing-lens consequences of the erratum, which is what this confirmation exists to judge:

- **No test becomes unwritable, and no oracle becomes unfalsifiable.** The erratum constrains commit *ordering* on a branch, which is a process obligation carried by BR-SWEEP-3/-4 and verified by the AC-1.8 replay harness (§5.1's replay level, run from `git worktree add` of each commit rather than the working tree). That harness is precisely the mechanism that would catch an ordering violation, and it already exists in the approved TSPEC.
- **No new obligation lands on any AT.** "Ordering, never registration" creates no assertion the TSPEC lacks; it forbids a construct the TSPEC never proposed. Had the TSPEC contained a skip-list or a red-tolerating gate, this erratum would have invalidated it — it does not.
- **The held-class carve-out does not weaken any completion oracle.** The paragraph is explicit that the branch does not merge on a green subset and that completion is all criteria satisfied at HEAD, held classes included. That strengthens, not relaxes, AT-1.1/AT-1.2/AT-1.3's standing as end-state oracles, and it forecloses the obvious false-green ("ship the green subset, register the rest").
- **The one live risk is misreading, not misdesign.** An implementer reading C-7's new "no skip-list … in this feature" as an absolute could delete or refuse TT-1b's registered `itOrSkip` row and the fourteen class-3/class-6 rows that go with it — which would either bare-skip the root/`chmod 000` case (an AT-1.3 red) or drop row 4b's exit-status coverage entirely. F-01 records that, against the REQ; the TSPEC needs no edit.

## Open Questions

None. The v10 Low (F-01, the four `SKIP_INVENTORY` rows not naming their `unverifiedInvariants` strings) remains open and remains non-gating; the erratum neither fixes nor worsens it.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **C-7's new absolute — "There is no skip-list, no expected-failure inventory and no tolerated-red register in this feature: C-8 already forbids that shape" — reads wider than C-8 and wider than the REQ's own AC-1.3, which the TSPEC depends on.** AC-1.3/AT-1.3 as approved (FSPEC v0.7 folding §6.1 erratum 9) exempt a skip that reaches the run's skip sink **as a registered record**, and the TSPEC spends TT-1b plus fifteen `SKIP_INVENTORY` rows (class 3's root/`chmod 000` row, class 6's ten `bash` and four `python` rows) taking that exemption deliberately — a *skip ledger* is exactly the artifact C-7's sentence now says does not exist "in this feature". The paragraph's own subject makes the intent clear (a *criterion* allowed to be red by registration stops being a criterion; capability gaps are not criteria), so the TSPEC is not wrong and needs no edit. But the sentence as written is the kind an implementer resolves by deleting the registration, which lands either a bare `it.skip` (AT-1.3 red) or the loss of row 4b's only exit-status coverage. Suggested upstream repair in the next REQ touch: scope the sentence to *failing criteria and CI reds* and add "capability-gap records registered under AC-1.3's exemption are not such a register." | REQ C-7 ("Held classes and the interim state"); TSPEC §5.2 TT-1b, §5.5 |
| F-02 | Low | Local | **The erratum's completion argument rests on AC-1.1's *given*, and the TSPEC's §2.2 branch pin is now load-bearing for it in a way the TSPEC does not say out loud.** C-7's paragraph reasons that AC-1.1 is evaluated "when the sweep is complete (AC-1.1's *given* says so)" — verified, AC-1.1 still opens *"Given the sweep is complete at HEAD"*. Since §2.2 chose the **first** branch (directory survives holding `{pdlc-cli.mjs}`), the held classes 7–12 are exactly the ones that empty `dist/` of its three bundles and the manifest, so §2.2's pin is what makes the interim state legible. A one-clause note in §2.2 or §5.4 pointing at C-7's held-class paragraph would save the next reader the reconstruction. Documentation nicety, not a defect. | TSPEC §2.2, §5.4; REQ AC-1.1, C-7 |

## Questions

None.

## Positive Observations

- **The erratum closes the exact hole a test engineer worries about on a long deletion branch** — "we'll register this red and come back to it" — and closes it in the strongest direction available: ordering, never registration, with an explicit statement that the branch does not merge on a green subset. That is the same standard §5.5's orphan-freedom and skip-join oracles enforce mechanically inside the suite, now stated for the branch as a whole.
- **It ratifies rather than disturbs the TSPEC's per-commit discipline.** BR-SWEEP-3's "C-7 outranks C-5 for class 1" and BR-SWEEP-4's "gate-read reference never lags subject" were previously local engineering decisions defending an upstream constraint that did not quite say this; after v0.12 they are direct compressions of C-7. Faithfulness went up this round, not down.
- **The distinction it draws is the right one for oracle health**: an incomplete feature on an unmerged branch is not a red, and calling it one would have created pressure to invent a tolerated-failure register — the precise construct that turns criteria into decoration.

## Recommendation

**Approved with minor changes** — the TSPEC still holds against REQ v0.12. Its bytes need no edit this round: the erratum is additive, its AC-1.1 citation is faithful to the current text, and the discipline it imposes is one the TSPEC already implements per class. F-01 is routed at the REQ's wording, not at this document; F-02 is a readability nicety.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

FINDING: Medium | delta | local | REQ C-7 "Held classes and the interim state" | The new "no skip-list … in this feature" absolute reads wider than C-8 and collides on its face with AC-1.3's registered-record exemption, which the TSPEC's TT-1b and fifteen `SKIP_INVENTORY` rows rely on; intent is clear from the paragraph's subject, but the sentence invites an implementer to delete the registration.
FINDING: Low | delta | nonlocal | TSPEC §2.2 / §5.4 | §2.2's first-branch pin is now load-bearing for C-7's held-class reasoning without the TSPEC saying so; a one-clause cross-reference would spare the next reader the reconstruction.
