# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (bytes unchanged since v4 approval)
**Upstream that moved:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.10 → v0.12)
**Date:** 2026-08-20
**Iteration:** 5 (upstream-cascade confirmation)

## Overview

**Question answered.** PLAN's own bytes have not moved since the v4 approval anchor (`a7aa181e`).
FSPEC moved twice under it — the v0.11 and v0.12 erratum rounds, ten commits, +54/−26 lines. I read my
v4 cross-review, diffed FSPEC across `a7aa181e..HEAD`, and measured only the PLAN material that leans on
the changed FSPEC text. I did not re-open the batch DAG, the file-ownership manifest, the expected-red
ledger, or the three Medium/Low findings v4 left open — none of them touches FSPEC's changed sections.

**What FSPEC now says that it did not say at approval time.**

| FSPEC section | Before (v0.10) | After (v0.12) |
|---|---|---|
| BR-1 | "consumes the pipeline's classification, it does not restate the membership" — one conjunct | Two conjuncts: authoring-classified **and** target document among REQ C-1's six types |
| D-2 | "Is this an authoring dispatch? yes / no" | Three branches, the third being authoring-classified with a non-C-1 target |
| AT-02 | universe fixtures: no-DECISIONS run, creatorless Phase R, five optimizer rounds | plus a run carrying an authoring-classified dispatch with **no C-1 target**; reverting BR-1's second conjunct must red |
| AT-03 / AT-29 | "every **non-authoring** dispatch prompt is byte-identical to baseline" | "every dispatch **outside BR-1's rule**" — strictly wider |
| BR-15 | expected read set = corpus-root enumeration **plus** per-document open attempts | enumeration and candidate paths **contribute no member**; expected set is exactly the per-document attempts |

**Direction of travel is toward PLAN, not away from it.** Both v0.11/v0.12 corrections land the two
defects PLAN itself routed as unresolved errata (§Errata rows). LI-11's AT-02 and AT-33 rows were written
to TSPEC's reading; FSPEC now agrees with TSPEC on both. So no task row's oracle changes, no fixture is
invalidated, no batch moves. What does not survive the edit is PLAN's **description of upstream**: two
errata rows assert a defect "still lives at HEAD" that no longer does, and one DoD clause compresses the
old, narrower byte-identity promise. Three Mediums, no High. PLAN still holds as approved.

## Batches

**Three task rows lean on the changed FSPEC text. I measured each against FSPEC at HEAD.**

| Row | What it owes the changed upstream | Result |
|---|---|---|
| LI-02 (fixture helper, batch 2) | AT-02's new fourth universe member — a run containing an authoring-classified dispatch whose target is none of the six C-1 types | ✅ available without a new fixture. The named case is Phase CR's optimizer round, which reaches the composition site with `docType: null`; LI-11's composition-site probe already declares that value in its expected set (`LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}`), so the dispatch exists in the universe LI-11 runs. No new corpus, no new helper spec, no new row |
| LI-11 (RED dispatch-universe suite, batch 5) | `LI-AT-02`, `LI-AT-03`, `LI-AT-29`, `LI-AT-33` — all four AT ids whose FSPEC text changed | ✅ still owned, and owned **by id**, not by transcribed AT prose. The suite is authored from FSPEC at batch 5, so it picks up the widened AT-03/AT-29 wording and AT-02's fourth fixture without a PLAN edit. AT-33's row already reads "hand-transcribed from the fixture's scripted `ls-files` stdout minus the self paths — never derived from `gatherLearningsCorpus`", which is now exactly what BR-15 says |
| LI-20 (GREEN attachment, batch 12) | BR-1's second conjunct as production behavior | ✅ already the two-conjunct form: `injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`. PLAN was ahead of FSPEC here; FSPEC has caught up. The `_recordDocType(docType)` call on **both** arms is what makes AT-02's new "reverting the second conjunct reds the test" mutation check falsifiable — the probe sees the rejected `null` dispatch, so deleting the conjunct moves a member from the rejected set into the accepted set and the equality reds |

**AT-02's new mutation clause has a live killer under PLAN's construction.** FSPEC now requires that
reverting BR-1's second conjunct red the test. That is not automatic from a block-presence assertion —
if the fixture universe carried no non-C-1 authoring dispatch, both implementations would agree. It works
here because LI-11 asserts the accepted set **equal** to `LEARNINGS_TARGET_DOCTYPES`, never containment,
over a universe that includes the `null`-target round. Relaxing that equality is already named as the one
forbidden repair (§Halt conditions H-5). Nothing in this edit weakens that.

**No row acquires or loses a test, a file, or a `[Fake first]` obligation.** TDD order, the same-batch
same-new-file guard, and the red-before-green pairing are untouched: this edit added no task and moved no
symbol. The three rows above absorb the change inside prose they already carry.

## Dependencies

**The batch column cannot have moved, and I confirmed rather than assumed it.** An upstream FSPEC edit
changes no `Deps` cell by itself; it can only move a batch if it forces a new task, a new file, or a new
symbol. It forced none of the three:

- **AT-02's fourth fixture is not a new fixture.** It is the `docType: null` optimizer-round dispatch
  already present in LI-11's universe and already named in LI-20's plumbing row ("Phase CR's `null`
  reaches the composition site through this path **and no other**"). No `LI-02` spec addition, so no
  `LI-11 → LI-02` edge changes weight and no batch-2 authoring collision is created.
- **The widened AT-03/AT-29 byte-identity claim reuses one instrument.** It is the same committed
  pre-feature baseline LI-06 captures at batch 4 and guards there; widening *which dispatches* are
  compared against it adds no capture, no manifest entry, and no new `{caseId}` — the baseline is
  captured per dispatch index over whole runs, not per classification.
- **BR-15's narrowed expected set removes a member, never adds one.** AT-33's oracle gets strictly
  smaller (enumeration excluded), which cannot introduce a dependency; and PLAN already excluded it.

**My v2/v3/v4 re-derivation therefore still stands unamended**: 23 unique ids, every dependency resolving
to a declared row, the graph acyclic, and `batch == max(dep batch) + 1` for every row. I re-checked the
three rows this confirmation touches (LI-02 batch 2 deps LI-01; LI-11 batch 5 deps LI-02, LI-06; LI-20
batch 12 deps LI-19, LI-11) and each still satisfies the column arithmetic.

**Downstream gates are undisturbed.** LI-14's batch-6 green-terminal suite-map closure keys on registered
`LI-AT-` test titles, not on AT prose, so a reworded AT-02/AT-03/AT-29 leaves its 35-member partition
literal exactly as transcribed. The expected-red ledger's batch-11/12 rows name `LI-AT-22`'s run-level
half only; none of the four re-worded ATs is a ledger entry, so the ledger's arithmetic is unchanged.

## Verification

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_
