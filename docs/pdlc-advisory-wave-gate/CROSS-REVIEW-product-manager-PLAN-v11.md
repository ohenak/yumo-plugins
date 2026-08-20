# Cross-Review: product-manager — PLAN (upstream-cascade confirmation, round 11)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (unchanged bytes since round 10)
**Date:** 2026-08-19
**Iteration:** 11
**Scope:** Upstream-cascade confirmation only. PLAN's own bytes are unchanged since the round-10 approval at `b902f40b`. TSPEC moved `4a092e85` → `1531143c` via one erratum commit (`1f2a4fbf`, +18/−1). Question answered: does PLAN still hold as approved against TSPEC as it now stands?

## Overview

**What moved upstream.** Exactly one commit touched TSPEC after round 10's approval was recorded:
`1f2a4fbf` *"docs(tspec): size PROP-SWEEP-2(b) residue in §1.3 and route it to PLAN (Phase P
erratum)"*, +18/−1 across two hunks — a sentence appended to the §1 changelog's Phase-P erratum note,
and a new paragraph in §1.3 titled *"Sizing the hygiene residue, and where it is owned."* No other
TSPEC section changed; REQ, FSPEC and DECISIONS are byte-identical to the versions round 10 approved
against (their dispatch hashes match this file's `UPSTREAM-STATE` trailer from round 10).

**What the edit does.** It corrects an under-sizing in TSPEC's own prose. §1.3 previously named only
the 14 tracked `.pdlc-backups/*.bak` blobs as what `e3b9d5a3` left behind. It now states the measured
residual — **28 tracked paths in three classes at PLAN's dated 2026-08-19 measurement, of which
untracking the 14 `.bak` blobs closes 14** — and explicitly routes the partition, the owners, the
dispositions and the figures themselves to **PLAN's Overview HEAD-drift note and A6-00's Edit 1**,
stating that TSPEC "does not restate further and does not re-litigate" them.

**Why this direction of travel is benign for PLAN.** The edit moves ownership *toward* this document,
not away from it. PLAN was already the sole owner of these figures — round 9 consolidated them into
the Overview's HEAD-drift note precisely so one site carries them, and round 10 approved that. TSPEC
now names that site as the owner. Nothing PLAN cites upstream was withdrawn, narrowed or renumbered;
nothing PLAN must now say was added to its obligations.

**The one thing I checked hardest.** A routing edit that also *restates* the routed figures can drift
from the owner it routes to. I therefore re-read the new paragraph against PLAN's HEAD-drift note
clause by clause, and against the shipped oracle, rather than accepting that the numbers "look the
same". They agree on every figure and every class; they diverge on one subordinate clause about A-1's
glob list, recorded below as F-01 (Low, upstream's to fix, not PLAN's).

## Batches

PLAN's task table, batch composition and wave map are untouched by this cascade, and the upstream
edit imposes no change on them. Re-verified mechanically at HEAD rather than asserted:

| Check | Result at HEAD |
|---|---|
| `parsePlanTasks` over PLAN | **11 tasks** (`A6-00, A6-01, A6-04, A6-05, A6-06, A6-08, A6-10, A6-12, A6-14, A6-18, A6-21`) |
| `validatePlanContract` | `{"ok": true}` — 11 ownership rows, 0 unknown ids, 0 near-misses |
| `computeWaves` | **7 waves**, every boundary green |
| PLAN bytes vs. the round-10 approval commit `b902f40b` | identical |

**The one batch the erratum bears on is A6-00, and it holds unchanged.** TSPEC now names *"A6-00's
Edit 1"* as co-owner of the residue figures. A6-00's Edit 1 exists at HEAD, is spelled exactly that
way in the task row, and carries the same arithmetic TSPEC now points at: untrack the 14 tracked
`.claude/workflows/.pdlc-backups/*.bak` blobs (`git rm --cached`) **and** add the bare rule `.pdlc-backups/`
to `.gitignore` in the same step, which "closes **14 of `PROP-SWEEP-2(b)`'s 28 residual paths**; the
other 14 are not closable here". TSPEC's new sentence — "Untracking the `.bak` class closes **14 of
the 28**; the other 14 are not closable on this branch" — is the same claim in the same direction.
The pointer resolves; it does not dangle.

**No scope entered PLAN through this edit.** TSPEC added no requirement, no surface and no task: the
paragraph closes with "Sizing and routing only; the disposition is not re-litigated here and no
design claim moves", and the §1.3 end-state surface table below it is byte-unchanged (the eight
transcription surfaces, the `.enabled` occurrence count of three). So there is no new P0/P1 obligation
for PLAN's batch list to absorb, and no batch that should have gained a task and did not.

**No batch lost its basis, either.** The completeness direction matters as much as the scope-creep
direction: every A6 task still traces to a §1.3 surface or a §5.1 manifest row that survives at
`1531143c`. I re-read the surface table and the `.enabled` row at HEAD against A6-05's and A6-18's
task text; the transcription targets and the three-occurrence `.enabled` constraint are unchanged, so
the two tasks most tightly coupled to §1.3 are still faithful compressions of it.

## Dependencies

**Upstream dependency edges re-walked at HEAD.** This confirmation's question is not "did the routed
item land" but "is PLAN still a faithful compression of the upstream it now leans on". The edges PLAN
draws on TSPEC are these, each re-read at `1531143c`:

| PLAN site | Upstream it leans on | State at `1531143c` |
|---|---|---|
| Overview HEAD-drift note, class-1/2/3 partition | §1.3's hygiene-residue prose | **Changed by this edit** — now sizes the residue at 28/3 classes and routes ownership *to* this note. Agrees with it. |
| Overview HEAD-drift note, "keep and re-derive" decision | §1.3 + §6's routed fork ("a repo and PLAN decision, not a TSPEC one") | Unchanged. The routing sentence survives verbatim; the appended erratum note sits after it and does not re-open it. |
| A6-00 Edit 1 (untrack + ignore) | §1.3 hygiene note | **Changed** — now names A6-00's Edit 1 as owner. Agrees with A6-00's text. |
| A6-05 transcription steps | §1.3's eight-surface end-state table | Byte-unchanged. |
| A6-18 `.enabled` gate | §1.3's `.enabled` occurrence row (three) | Byte-unchanged. |
| A6-04 / A6-06 example-config and engine-channel steps | §4.4, §5.1 | Byte-unchanged since round 10's approval. |

**Ordering is unaffected.** The erratum adds no artifact, no surface and no owner, so no task acquires
a new predecessor and none loses one. `computeWaves` returns the same 7 waves over the same 11 tasks,
and the wave-1 inherited-red rule — which is where a residue-sizing change *could* have bitten, since
batch 1's gate wording enumerates the expected failing set — still names the same set: 27 failed / 8
suites clean, 28 / 9 dirty with AT-4.1 as the extra member. TSPEC's new paragraph makes no claim about
suite counts and therefore cannot contradict that wording.

**Direction-of-ownership check.** The edit is the *good* direction for a PLAN: an upstream document
that was restating a downstream-owned figure now defers to the downstream owner. The failure mode I
looked for is the opposite one — upstream quietly becoming a second source of truth for a number PLAN
owns, so the two drift on the next measurement. TSPEC guards against that explicitly ("at PLAN's dated
2026-08-19 measurement", "the figures themselves are owned by PLAN's Overview HEAD-drift note and
A6-00's Edit 1, which this document does not restate further"). Tying the figure to *PLAN's dated
measurement* rather than to HEAD is the load-bearing choice: class 3 grows by one per committed
cross-review file, so a HEAD-anchored restatement upstream would have been stale within this very
round. It is not.

## Verification

Every claim in this confirmation was measured, not inferred. The commands and their results:

| # | What I checked | How | Result |
|---|---|---|---|
| V-1 | The delta is exactly one commit | hashed every TSPEC blob in `git log -12` and matched the dispatch shas | `4a092e85` (round-10 approval) → `1531143c` (HEAD) is the single commit `1f2a4fbf`, +18/−1 |
| V-2 | PLAN's own bytes are unchanged | `git diff b902f40b..HEAD -- PLAN` | empty |
| V-3 | Other upstreams unchanged | dispatch shas vs. round 10's `UPSTREAM-STATE` trailer | REQ, FSPEC, DECISIONS identical |
| V-4 | The routed pointers resolve | grepped PLAN for the two named owners | Overview HEAD-drift note present; A6-00's "Edit 1" present and spelled as TSPEC names it |
| V-5 | The restated figures agree | clause-by-clause read of the new paragraph against PLAN's class table | 28 total, 14 `.bak`, 4 runtime artifacts, class 3 = this feature's docs, 14 closable, dated 2026-08-19, +1 per *committed* cross-review file — all six agree |
| V-6 | The cited oracle exists and is titled as quoted | grep of `documentOracles.test.js` | `test("PROP-SWEEP-2(b): the unfiltered sweep minus A-1's frozen glob list is empty — AC-1.2's required-empty gate", …)` at the shipped site |
| V-7 | PLAN's structural contract still holds | replayed the shipped parsers at HEAD | 11 tasks, `validatePlanContract` `ok: true`, 7 waves, 0 ownership near-misses |
| V-8 | A-1's glob list, as both documents describe it | read `A1_GLOBS` in the shipped oracle | **16 globs**, not two — the basis for F-01 below |

**On V-8, the only disagreement I found.** TSPEC's new paragraph says class 3 enters the sweep
because the documents quote L-2's grep terms "while A-1's frozen glob list exempts **only**
`LEARNINGS-*` and `POSTMORTEM-*`". The shipped list carries sixteen globs, including
`docs/pdlc-plugin-retirement/**`, `docs/_decisions/**`, `docs/completed/**`, `docs/PLAN-*.md` and
five more. PLAN's own wording does not make this error: it says the list "covers
`docs/pdlc-plugin-retirement/**`, `**/LEARNINGS-*.md` and `**/POSTMORTEM-*.md` **but not**
`docs/{feature}/` specs and **not** `CROSS-REVIEW-*`" — a covers/does-not-cover statement whose
operative half (this feature's docs and its cross-reviews are unexempted) is exactly right at HEAD.
So the defect is upstream's overclaiming "only", not PLAN's compression of it, and PLAN's text is the
one a reader should act on — which is what TSPEC's own routing sentence instructs. That is why F-01 is
Low and not gating: it cannot mislead an implementer working from PLAN, and PLAN needs no edit to
stay faithful.

**Verification legs PLAN promises that this delta does not disturb.** The DoD's full-suite leg still
names its two expected-failing test titles verbatim, and still splits the `PROP-SWEEP-2(b)` positive
check by class (set-equality on class 2's four named runtime artifacts, *membership* on class 3's
`docs/pdlc-advisory-wave-gate/**`). That class-split is what keeps the ship-boundary gate correct as
class 3 grows — and it is now the thing TSPEC defers to. Re-measured at HEAD, class 3 has grown as
predicted since the dated measurement, which the membership predicate absorbs and a set-equality would
have false-red'd. The design holds under exactly the pressure this cascade applies to it.

## Findings

No High, no Medium. Two Lows, neither gating, neither an edit this PLAN must make to remain approved.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Cross-Feature | **Upstream's new paragraph says A-1's frozen glob list "exempts only `LEARNINGS-*` and `POSTMORTEM-*`"; the shipped list carries sixteen globs.** `A1_GLOBS` in `documentOracles.test.js` includes `docs/pdlc-plugin-retirement/**`, `docs/_decisions/**`, `docs/completed/**`, `docs/discarded/**`, `docs/PLAN-*.md`, `docs/design/**`, `docs/_queue/QUEUE.md` and more. The claim's *conclusion* is sound — this feature's docs and `CROSS-REVIEW-*` are genuinely unexempted — but the "only" makes a narrower statement than the artifact supports, and a reader sizing a future feature's residue off it would under-count what is already exempt. PLAN does not inherit the error: its own wording is a covers/does-not-cover statement that is accurate at HEAD. Fix belongs in TSPEC §1.3 (drop "only", or say "does not exempt `docs/{feature}/` specs or `CROSS-REVIEW-*`"). No PLAN edit required. | TSPEC §1.3; PLAN Overview HEAD-drift note, class-3 row |
| F-02 | Low | Process | **The cross-review dispatcher again supplied PLAN's authoring headings (`## Overview` / `## Batches` / `## Dependencies` / `## Verification`) as the completeness gate for a *review* artifact.** Carried unchanged from rounds 5–10 as a Process finding; it recurs in this dispatch, so this file carries both the PLAN heading set and the cross-review schema. Harmless to the reader, but it is a standing mis-dispatch in the workflow's completeness gate, not a defect in any document under review. Routed to harvest, not actioned here. | Workflow completeness gate (not PLAN) |

**Round-10 findings disposition.** Round 10 raised two Lows and deferred both by design. F-01 (the
DoD bullet's inline `28 total / 14 closable` parenthetical duplicating the Overview's dated figure)
is **still open and still non-blocking** — PLAN's bytes did not change, so nothing could have closed
it. This cascade slightly *raises* its value: with TSPEC now deferring to PLAN as the single owner of
those figures, the one-site rule matters more, and the deferred tidy-up is worth taking whenever PLAN
is next edited. Round-10 F-02 is this round's F-02, unchanged. Neither was a condition of approval
then and neither becomes one now.

**Scope-tag reconciliation.** F-01 is tagged `Cross-Feature`, not `Local`: it restates a shared
artifact (`A1_GLOBS`, owned by the coupled `pdlc-plugin-retirement` sweep), the mis-sizing is reusable
harm regardless of which document carries it, and the same glob list has been cited across TSPEC, PLAN
and both reviewers' files. Per the tag-selection discipline, a finding that references a sibling
feature's frozen artifact and recurs at more than one phase is `Cross-Feature`. F-02 stays `Process`,
matching its tag in rounds 5–10; I checked the prior files rather than re-deciding it.

DEFERRED (unchanged from round 10): replace the DoD bullet's inline `28 total / 14 closable`
parenthetical with a pointer to the Overview's HEAD-drift note, so exactly one site ever carries the
number.

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

