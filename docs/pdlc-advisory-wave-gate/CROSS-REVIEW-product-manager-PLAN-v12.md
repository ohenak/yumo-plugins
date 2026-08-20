# Cross-Review: product-manager — PLAN (upstream-cascade confirmation, round 12)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (unchanged since round 10)
**Date:** 2026-08-20
**Iteration:** 12
**Scope:** Upstream-cascade confirmation only. PLAN's own bytes are unchanged since the round-11 approval (`df90d1f8`). DECISIONS moved `25f8e954` → `84deee10` via one erratum commit (`8a44b84b`, +20/−3). Question answered: does PLAN still hold as approved against DECISIONS as it now stands?

## Overview

**What moved upstream.** Exactly one commit has touched DECISIONS since round 11's approval was
recorded: `8a44b84b` *"docs(decisions): v1.9 drop relocated integer, record round-9 erratum
re-grounding (TE v9 F-01)"*, +20/−3 across two hunks, both in the document's front matter — the
Cross-Reviews cell gains the round-9 files, the version cell moves 1.8 → 1.9, one word changes
inside the v1.8 relocation paragraph, and a new *"On v1.9 (Phase-P erratum round)"* paragraph is
appended below it. **No `### DEC-A6-0N` entry is touched**: the diff's two hunks sit at lines 4 and
27, and `DEC-A6-01`…`DEC-A6-04` (headings at 144, 185, 226, 252) are byte-frozen across the delta.
REQ, FSPEC, TSPEC and the `SIZING` appendix are byte-identical to what round 11 approved against —
verified both against the dispatch shas and by an empty `git diff df90d1f8..HEAD` over all four.

**What the edit does.** Two current-state repairs, no design change. (1) The v1.8 paragraph
describing the sizing-block relocation quoted the moved bullet by its cardinality — "the *twelve*
already-migrated sites". v1.9 drops the integer and names the bullet by subject
("the already-migrated-sites bullet"), on the ground that a HEAD measurement should not sit in the
one document whose stated purpose is to carry none, even as a quotation. (2) The Cross-Reviews cell
records round 9. The new paragraph also records a re-grounding pass on upstream and states that the
TSPEC erratum absorbed in that round is a recorded no-op for DECISIONS.

**Why this is benign for PLAN.** The integer that was dropped is not one PLAN sources from
DECISIONS. PLAN's Overview HEAD-drift note gets column (2)'s **twelve** from
`SIZING-pdlc-advisory-wave-gate.md`, which it cites by name and which still carries it
(`### Column (2) … **twelve**`). The edit therefore removes a *duplicate* of a figure PLAN reads
elsewhere, moving the tree toward the one-measurer-two-pointers shape my own DECISIONS v9 F-01 asked
for — it cannot make PLAN's citation dangle, because PLAN never pointed here for it. The one
sentence in PLAN that makes a claim *about* DECISIONS' contents — "DECISIONS now keeps only column
(1)'s four" — I re-read against DECISIONS at HEAD and it is still exactly true.

## Batches

PLAN's task table, batch composition and wave map are untouched by this cascade, and the upstream
edit imposes no change on them. Re-verified mechanically at HEAD rather than asserted:

| Check | Result at HEAD |
|---|---|
| `parsePlanTasks` over PLAN | **11 tasks** (`A6-00, A6-01, A6-04, A6-05, A6-06, A6-08, A6-10, A6-12, A6-14, A6-18, A6-21`) |
| `validatePlanContract` | `{"ok": true}` |
| `computeWaves` | **7 waves** |
| PLAN bytes vs. round-11 reviewed commit `df90d1f8` | identical |

Same four numbers as round 11, replayed through the shipped parsers.

**The batches that lean on a DECISIONS entry still lean on unchanged bytes.** Four task rows cite a
decision by id: A6-10 cites `DEC-A6-01` (dangling snapshot commit, never `git stash`) and
`DEC-A6-03` (wave-scoped ref, no run discriminator); A6-21 cites `DEC-A6-02` (an E-6 promotion gets
its own `commitPaths` call with the `chore({feature}): wave {N} promotion ({taskId})` message);
A6-04/A6-06's engine-channel expectation rests on `DEC-A6-04` (`waveBudgetPerRun: 0` as a supported
affordance validated by `nonNegativeInt`). I re-read all four headings and bodies at HEAD against
the sentences the task rows compress. None moved in this delta, and none says anything the task row
does not still say the same way. No task row, batch assignment, wave number, ownership cell or
`files` list needs to move.

**Sizing direction is unchanged, and the one figure PLAN restates from DECISIONS still agrees.**
A6-05's "verification, not editing" budget is sized off the three columns. All three restatements in
PLAN's Overview check out against the appendix at HEAD: column (1) **four** (`SIZING` §"Column (1)");
column (2) **twelve**, of which ten oracles and two green inputs (§"Column (2)"); column (3)
**twenty-five** (§"Column (3)"). DECISIONS at HEAD still carries column (1)'s four and nothing else
numeric from the block — "The number an implementer must not get wrong is **four**" survives the
delta verbatim. No scope creep entered PLAN from this edit, and no P0/P1 obligation was added,
narrowed or withdrawn upstream by it.

## Dependencies

**Upstream dependency edges re-walked at HEAD.** This confirmation's question is not "did the routed
item land" but "is PLAN still a faithful compression of the upstream it now leans on". Every edge
PLAN draws on DECISIONS, re-read against `84deee10`:

| PLAN site | Upstream it leans on | State at `84deee10` |
|---|---|---|
| Overview HEAD-drift note, "the three-column size … is in a PLAN appendix, not in DECISIONS" | DECISIONS `## Consequences`, "The sizing of that co-movement lives in `SIZING-…`, not here" | Byte-unchanged. Still says exactly this. |
| Overview HEAD-drift note, "DECISIONS now keeps only column (1)'s four" | DECISIONS `## Consequences`, "The number an implementer must not get wrong is **four**" | Byte-unchanged, and now *more* true: the delta removed the last other integer (the quoted "twelve") from the document. |
| Changelog 1.6, "DECISIONS v1.8 relocated its three-column A6 sizing block … per POSTMORTEM-D §6 steps 1–2 and PM v8 Q-01" | DECISIONS v1.8 relocation paragraph | The paragraph survives; only its quotation of the moved bullet's cardinality changed. PLAN's row is a historical statement about *which revision performed the move*, which v1.9 does not disturb — the relocation still happened at v1.8. |
| A6-10 steps | `DEC-A6-01`, `DEC-A6-03` | Byte-unchanged. |
| A6-21 promotion commit | `DEC-A6-02` | Byte-unchanged. |
| A6-04 / A6-06 engine-channel steps | `DEC-A6-04` | Byte-unchanged. |

**One version-pin worth naming, and why it is not a finding.** PLAN's Upstream cell reads
`REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` without a version pin, so the header cannot go stale on
a DECISIONS revision bump. The only DECISIONS version number PLAN carries is in changelog row 1.6,
and it is tense-correct as written ("DECISIONS v1.8 relocated …") — an account of a past event, not
a claim about HEAD. This is the shape the earlier rounds pushed PLAN into, and it is why a version
bump upstream costs PLAN nothing.

**Ordering and wave map.** Wave 1's inherited-red framing, the class-1/2/3 residue partition, and
the DoD's class-split full-suite leg all take their figures from TSPEC §1.3 and PLAN's own dated
measurement, neither of which this delta touches. The dependency graph (`computeWaves` → 7 waves,
boundaries green) is unchanged, and no new dependency edge is created or removed by an edit that
touches only DECISIONS' front matter.

## Verification

Every claim in this confirmation is measured, not inferred. Commands and results:

| # | I checked | How | Result |
|---|---|---|---|
| V-1 | The delta is exactly one commit | hashed every DECISIONS blob in `git log -20` and matched the dispatch shas | `25f8e954` (round-11 approval) → `84deee10` (HEAD) is the single commit `8a44b84b`, +20/−3 |
| V-2 | The delta touches no decision entry | `git show 8a44b84b -- DECISIONS`, hunk headers `@@ -4` and `@@ -27` | `DEC-A6-01`…`DEC-A6-04` (headings 144/185/226/252) are outside both hunks; byte-frozen |
| V-3 | PLAN's own bytes unchanged | `git diff df90d1f8..HEAD -- PLAN` | empty |
| V-4 | Other upstreams unchanged | `git diff df90d1f8..HEAD` over REQ, FSPEC, TSPEC, SIZING **and** dispatch shas vs. round 11's `UPSTREAM-STATE` trailer | empty diff; REQ `817b6745`, FSPEC `82f74a2d`, TSPEC `1531143c` all identical |
| V-5 | The dropped integer is not one PLAN sources from DECISIONS | grepped PLAN for `twelve` / `already-migrated`; read its Overview citation | PLAN cites `SIZING-pdlc-advisory-wave-gate.md` for column (2); the DECISIONS occurrence removed was a quotation inside a relocation rationale, cited by nobody |
| V-6 | The appendix still carries the figures PLAN restates | read `SIZING` headings at HEAD | Column (1) **four**, column (2) **twelve** (ten oracles + two green inputs), column (3) **twenty-five** — all three match PLAN's Overview |
| V-7 | PLAN's claim *about* DECISIONS still true | read DECISIONS `## Consequences` at HEAD | "The number an implementer must not get wrong is **four**" present; no other numeric from the block remains |
| V-8 | PLAN's structural contract still holds | replayed the shipped parsers (`parsePlanTasks`, `validatePlanContract`, `computeWaves`) against PLAN at HEAD | 11 tasks, `{"ok": true}`, 7 waves — same as round 11 |

**On V-5, the one thing that could have made this cascade non-benign.** The failure mode to look for
in a "figure deleted upstream" delta is a downstream document that reads the figure *from* the
deleted site. PLAN does not: the consolidation done in PLAN v1.6 pointed the Overview at the
appendix and left DECISIONS out of the read path for every column but (1). So the delete removes a
copy, not a source. That property was designed two rounds ago and is what this round observes
working.

**Verification legs PLAN promises are undisturbed.** The DoD's full-suite leg (set-equality on the
two expected-failing test titles plus the positive check on `PROP-SWEEP-2(b)`'s printed residual)
and the class-split membership predicate take their inputs from TSPEC §1.3 and PLAN's own dated
measurement. Neither is sourced from DECISIONS, and neither moved.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **Column (1)'s four is still stated in three documents, and this delta narrowed the gap by one without closing it.** DECISIONS (`## Consequences`, "The number an implementer must not get wrong is **four**"), `SIZING` §"Column (1)", and PLAN's Overview HEAD-drift note ("column (1), the **four** gate-demanded edits") each carry it. All three agree at HEAD — re-checked this round — so this is not a live contradiction, and POSTMORTEM-D §6 step 1 explicitly directs DECISIONS to keep the number. The cheap fix stays the one I named in my DECISIONS v9 F-01: have PLAN's Overview cite the appendix for the count instead of restating it, so the tree has one measurer and two pointers. Not gating; not a faithfulness defect, since the restatement is accurate. | POSTMORTEM-D §6 step 1 |
| F-02 | Low | Local | **DoD's inherited-residual bullet still inlines `28 total / 14 closable`** rather than pointing at the Overview's HEAD-drift note, which is the single declared owner of the residue figures. Carried unchanged from rounds 10 and 11 (PLAN bytes have not moved). Same shape as F-01 one level down: a dated measurement restated at a second site. Deferred tidy-up for whenever PLAN is next edited for a substantive reason. | PLAN Definition of Done |
| F-03 | Low | Cross-Feature | **Upstream TSPEC §1.3 still says A-1's frozen glob list "exempts only `LEARNINGS-*` and `POSTMORTEM-*`"; the shipped `A1_GLOBS` carries sixteen globs.** Unresolved from round 11 and re-verified open (TSPEC byte-identical at `1531143c`). The claim's conclusion holds — this feature's docs and `CROSS-REVIEW-*` files are genuinely unexempted — but "only" under-states what is already exempt, and a reader sizing a future feature's residue off it would under-count. **PLAN is not in error**: its own covers/does-not-cover wording is accurate at HEAD. The fix belongs in TSPEC §1.3, not here. | TSPEC §1.3; PLAN Overview HEAD-drift note, class-3 row |
| F-04 | Low | Process | **The cross-review dispatcher supplied PLAN's authoring headings (`## Overview` / `## Batches` / `## Dependencies` / `## Verification`) as the completeness gate for this *review* artifact.** Carried unchanged since round 5. Harmless to a reader, but it is a mis-dispatch in the workflow's completeness gate, not a defect in the document under review. Routed to harvest, not actioned here. | Workflow completeness gate (not PLAN) |

**Round-11 findings disposition.** Round 11 raised two Lows, both non-PLAN or deferred. Its F-01
(TSPEC's "only" overclaim) is unresolved upstream and re-filed here as F-03 with the same
`Cross-Feature` tag — I checked the round-11 file before re-tagging rather than re-deciding, per the
tag-selection discipline. Its F-02 (the DoD inline figure) is re-filed here as F-02, `Local`,
unchanged. No round-11 finding was closed by this delta, and none is worsened by it. F-01 in this
round is new to the PLAN series but not new signal: it is my own DECISIONS v9 F-01 surfacing on the
PLAN side, tagged `Local` to match the tag it carries there.

**Nothing rose above Low.** No High or Medium finding exists in this confirmation: no P0/P1
obligation entered, moved or vanished upstream; nothing PLAN cites was withdrawn, narrowed or
renumbered; every pointer resolves; and PLAN's compression of DECISIONS at `84deee10` is faithful
sentence by sentence.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from rounds 3–11, still non-blocking: this feature ships no operator-facing documentation for the `{"advisory": {"enabled": false, "waveBudgetPerRun": 1}}` example beyond the example file itself. That is an explicit upstream decision, correctly followed; this cascade does not disturb it. Worth one LEARNINGS line so a future operator-documentation pass picks it up. |
| Q-02 | Carried from rounds 7–11: A6-00's untrack step is a non-file act (index-only removal of 14 `.bak` paths) while the wave commit arm iterates exactly `task.files`. Answered in prior rounds as safe — the `.gitignore` edit is in the ownership manifest and the removal is staged in the same step. No new evidence this round. Recorded for continuity, not re-opened. |
| Q-03 | New, informational: DECISIONS v1.9 established the principle "a HEAD measurement should not sit in the document whose purpose is to hold none, even as a quotation." Applied consistently, that principle also argues for F-01 and F-02 here — PLAN restating figures the appendix owns. Is it worth promoting the principle to `docs/_constraints/DOMAIN-CONSTRAINTS.md` at harvest, rather than re-deriving it per document? Not a requested change to PLAN. |

## Positive Observations

- **The cascade cost PLAN nothing because a prior round moved the read path.** PLAN v1.6 pointed the
  Overview at the `SIZING` appendix instead of DECISIONS. Two revisions later, DECISIONS deleted an
  integer — and the delete could not reach PLAN, because PLAN had stopped reading it from there.
  That is the consolidation paying off exactly as designed, observed under load rather than argued
  in the abstract.
- **The delta moves in the right direction for a downstream reader.** The failure mode to fear is an
  upstream document quietly becoming the source of truth for a number a downstream document owns.
  This edit does the opposite: it removes upstream's last copy of a downstream-owned figure and
  names `SIZING` as the sole carrier. The tree has fewer places to drift than it did before.
- **The decision entries stayed byte-frozen through a ninth revision.** `DEC-A6-01`…`DEC-A6-04` have
  not moved while the surrounding front matter churned through relocation and erratum rounds. That
  is what makes a cascade confirmation cheap: the four sentences PLAN's task rows compress are
  provably the same four sentences.
- **The machine-checkable surface is identical and was re-measured, not assumed.** 11 tasks,
  `{"ok": true}`, 7 waves, replayed through the shipped parsers. A prose-only cascade that leaves the
  parsed contract bit-identical lets the next reviewer trust this confirmation without redoing it.

## Recommendation

**Approved with minor changes** — the round-11 approval of PLAN stands against DECISIONS at
`84deee10`. PLAN remains a faithful compression of its upstream at HEAD. The single upstream edit
deletes a duplicated integer from a rationale paragraph and records round-9 reviews; no decision
entry moved, nothing PLAN cites was withdrawn, narrowed or renumbered, no new P0/P1 obligation
entered, and no task, batch, wave, dependency edge or ownership cell needs to move. The four Lows
are all non-gating and none requires a PLAN edit to preserve faithfulness: F-01 and F-02 are
deferred single-site tidy-ups for whenever PLAN is next edited substantively, F-03 belongs in
TSPEC §1.3, F-04 in the workflow's completeness gate.

FINDING: Low | inherited | nonlocal | PLAN Overview HEAD-drift note, "column (1), the four gate-demanded edits" | Column (1)'s four is stated in DECISIONS, SIZING and PLAN. All three agree at HEAD; POSTMORTEM-D §6 step 1 directs DECISIONS to keep it. Cheapest fix is for PLAN's Overview to cite the appendix rather than restate the count. Not a faithfulness defect — the restatement is accurate.
FINDING: Low | inherited | nonlocal | PLAN Definition of Done, inherited-residual bullet | Still inlines `28 total / 14 closable` instead of pointing at the Overview's HEAD-drift note, the declared single owner of the residue figures. Carried unchanged from rounds 10 and 11; PLAN bytes did not move. Deferred tidy-up.
FINDING: Low | inherited | nonlocal | TSPEC §1.3 "Sizing hygiene residue" / PLAN Overview HEAD-drift note, class-3 row | Upstream TSPEC still says A-1's frozen glob list "exempts only LEARNINGS-* and POSTMORTEM-*"; shipped A1_GLOBS carries sixteen globs. Conclusion holds, but "only" under-states what is already exempt. PLAN's own covers/does-not-cover wording is accurate at HEAD; fix belongs in TSPEC §1.3, not PLAN.
FINDING: Low | inherited | nonlocal | Workflow completeness gate (not PLAN) | The dispatcher supplied PLAN's authoring headings as the completeness gate for this review artifact. Carried since round 5. Mis-dispatch in the workflow, not a defect in the document under review; routed to harvest.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 4}

APPROVAL-HASH: sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48
APPROVAL-HASH-NORMALIZED: sha256:852d84755e8643c5312d58baa778e50476c118744f019850e6389c92cef38c69
REVIEWED-COMMIT: 570fbe11cd8261478dd62735d3f99c0da2f450e2
UPSTREAM-STATE: REQ sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:1531143c923857242241c61a35d43fc9677e152d6cca1162533778bb0c30c004
UPSTREAM-STATE: DECISIONS sha256:84deee10d5c5743a60ac0279bf3135f67e1430d4e9976176f6b2691adf5833dc
