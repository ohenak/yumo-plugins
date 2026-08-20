# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 12 (delta confirmation of the Phase-P erratum edit, commit `1f2a4fbf`)
**Scope:** Local unless tagged otherwise

## Scope

Delta confirmation only. Prior rounds approved this TSPEC; this round reads the erratum
edit `1f2a4fbf` ("size PROP-SWEEP-2(b) residue in §1.3 and route it to PLAN") plus a
re-grounding of every upstream claim the edited paragraph leans on, at HEAD, per DEC-ERR-03.

Routed item under confirmation (raised by se-author): §1.3's repository-hygiene note sized
the residue `e3b9d5a3` left as the tracked `.pdlc-backups/*.bak` blobs alone, which
under-states `PROP-SWEEP-2(b)`'s measured residual and routes it to no owner.

The edit is additive: 18 insertions, one sentence extended in the §1.10 changelog row, one
new paragraph in §1.3. No design claim, no interface, no data type, no test obligation moves.

## Design

The routed item lands. The new §1.3 paragraph states the measured residual (28 tracked
paths), partitions it into three classes (14 `.bak` blobs; four consumer-runtime artifacts;
this feature's own tracked documents), names what A6-00 closes (14 of 28), and routes the
partition, owners, dispositions and figures to **PLAN's Overview HEAD-drift note and A6-00's
Edit 1**. It closes with an explicit non-restatement/non-re-litigation clause, so TSPEC does
not become a second home for figures PLAN owns. That is the right ownership split: the
disposition is a PLAN/Phase-I decision, and §1.3 already routed it there.

Nothing previously approved is disturbed: the surrounding required-end-state table, the A6
seam design, §3.2's queue conjunction and §5.1's manifest status are byte-unchanged.

## Interfaces

Citation hygiene checked against DEC-DOC-01. The new text pins the oracle by file path plus
verbatim case title — `pdlc/workflows/__tests__/documentOracles.test.js`, *"the unfiltered
sweep minus A-1's frozen glob list is empty"* — which resolves at HEAD (the case exists under
the `PROP-SWEEP-2/PROP-SWEEP-3` describe block). No raw `file:line` anchor is introduced.
Downstream pointers are section/task names (`Overview HEAD-drift note`, `A6-00's Edit 1`),
both of which exist in PLAN at HEAD.

## Data

Figures re-derived at HEAD rather than taken on trust.

| Claim in the new paragraph | Re-derived at HEAD | Verdict |
|---|---|---|
| residual = 28 at PLAN's dated 2026-08-19 measurement | PLAN's HEAD-drift table: 14 + 4 + 10 = 28, same date | matches |
| untracking the `.bak` class closes 14 of 28 | PLAN A6-00 Edit 1: "closes 14 of 28" | matches |
| class 2 = the four named `.claude/workflows/` runtime artifacts | PLAN class-2 row names the same four | matches |
| class 3 grows by one per *committed* cross-review file | PLAN: "+1 per committed cross-review file" | matches |
| the other 14 are not closable on this branch | PLAN dispositions (2) | matches |

Live re-measurement of the oracle's own sweep at HEAD returns **32** residual paths, not 28 —
14 `.bak`, 4 runtime artifacts, 14 feature documents. That is 28 plus the four cross-review
files committed since PLAN's measurement, i.e. exactly what the paragraph's own growth rule
predicts. The figure is attributed and date-scoped ("at PLAN's dated 2026-08-19
measurement"), so this is not drift and is not a finding; a reader can reconcile 32 against
28 from the text as written.

## Verification

`PROP-SWEEP-2(b)` remains red at HEAD and is expected to remain red after A6-00 — the
paragraph does not promise otherwise, and PLAN's DoD (round 9) already carries the positive
residual check rather than a green-suite promise. No test obligation is created, moved or
weakened by this edit, so nothing in PROPERTIES or PLAN's wave map needs to follow it.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | The new §1.3 paragraph says class 3 enters the sweep "while A-1's frozen glob list exempts only `LEARNINGS-*` and `POSTMORTEM-*`". A-1 is fifteen globs (`docs/completed/**`, `docs/discarded/**`, `docs/_decisions/**`, `docs/_queue/QUEUE.md`, `docs/pdlc-plugin-retirement/**`, `docs/PLAN-*.md`, `docs/design/**`, two `__tests__/fixtures/` globs, two named script/test paths, and the retirement baseline, besides the two named). Read literally the sentence is false about A-1, and it is the one clause a reader would use to decide whether some other doc class is exempt. Fix: state the true reason — A-1 exempts `LEARNINGS-*` and `POSTMORTEM-*` **but covers neither `docs/{feature}/` specs nor `CROSS-REVIEW-*`** — which is exactly PLAN's wording and preserves the conclusion unchanged. | FSPEC L-2/L-3 sweep (coupled feature); PLAN Overview HEAD-drift note |
| F-02 | Low | Local | "four consumer-runtime artifacts …, all four branch-introduced by the same commit" compresses away the caveat PLAN's provenance note was corrected to carry: the deciding leg is `git ls-tree` at merge-base `1efb9a3b`, and `git log --diff-filter=A` prints a *second, superseded* older add (`3991b4d5`, 2026-07-27) for the two `.bundle.js` artifacts. The conclusion (branch-introduced) is right; the evidence as compressed would mislead a reader who re-runs the log. Fix: say "branch-introduced (deciding measurement: `git ls-tree` at the merge-base; see PLAN's provenance note for the log's superseded add)". | PLAN "Provenance of class 2, corrected (TE v8 F-01)" |

FINDING: Medium | delta | local | §1.3 hygiene-residue paragraph | "A-1's frozen glob list exempts only `LEARNINGS-*` and `POSTMORTEM-*`" mis-describes A-1's fifteen globs; restate as PLAN does (covers neither feature specs nor `CROSS-REVIEW-*`)
FINDING: Low | delta | local | §1.3 hygiene-residue paragraph | "all four branch-introduced by the same commit" drops PLAN's corrected caveat that `ls-tree`-at-merge-base is the deciding leg and the log shows a superseded older add for the two bundles

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Class 3 grows by one per committed cross-review file, and this pipeline keeps writing them. Is anyone tracking the ask to the coupled sweep's owner (extend A-1 to `docs/{feature}/**` and `CROSS-REVIEW-*`), or does it live only in PLAN's disposition (2) prose? A one-line pointer from PLAN to where that ask was filed would close the loop for a later reader. |

## Positive Observations

- The figure is *dated and attributed*, not asserted as an invariant, and the growth rule is stated inline — which is why the live 32 at HEAD reconciles cleanly against the quoted 28 instead of reading as drift. That is the right way to quote a moving measurement.
- Ownership is routed explicitly and the paragraph refuses to re-litigate: "the partition, the owners, the disposition of each class and the figures themselves are owned by PLAN". No duplicate source of truth is created.
- The oracle pin uses a quoted case title rather than a line number, so it survives edits to that test file — DEC-DOC-01 applied without being asked.
- Scope discipline: sizing and routing only, with the design claim explicitly held constant. The edit does exactly what the routed item asked and no more.

## Recommendation

**Approved with minor changes.**

The routed item is resolved: the residue is sized, partitioned and given an owner, and nothing
previously approved is broken. Upstream (REQ `sha256:817b6745…` v1.9, FSPEC `sha256:82f74a2d…`
v1.4) is byte-identical to the state TSPEC v1.10 re-grounded on, so no absorption is owed.
F-01 and F-02 are prose-fidelity corrections inside the new paragraph; neither gates the phase
and neither changes a figure, an owner or a design claim.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:1531143c923857242241c61a35d43fc9677e152d6cca1162533778bb0c30c004
APPROVAL-HASH-NORMALIZED: sha256:32012dabd60a7257cd2f3c3e199a06276b3f3ee6567fc97a3b0b2aac4a4656e5
REVIEWED-COMMIT: 1f2a4fbfcd8588f0b7a5bc25265c02b8d3aa8ea1
UPSTREAM-STATE: REQ sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
