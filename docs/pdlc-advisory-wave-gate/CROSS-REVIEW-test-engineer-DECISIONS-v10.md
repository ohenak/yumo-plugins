# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.8, bytes unchanged, `sha256:25f8e954…`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v9.md` (Approved with minor changes, 0 High)
**Upstream delta reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`, `9a1934db..HEAD` (`sha256:4a092e85…` → `sha256:1531143c…`)
**Date:** 2026-08-19
**Iteration:** 10

## Context

This is an upstream-cascade confirmation, not a re-review. DECISIONS' own bytes have not moved since
my v9 approval — `sha256:25f8e954…` at HEAD is byte-identical to v9's `APPROVAL-HASH`. What moved is
TSPEC, which my approval was recorded against at `sha256:4a092e85…` and which now stands at
`sha256:1531143c…`. The single question in scope: is DECISIONS still a faithful compression of TSPEC
as TSPEC now reads?

The upstream delta is small and bounded. `git diff 9a1934db..HEAD -- TSPEC` is 19 changed lines in
exactly two hunks:

1. **Changelog, v1.10 entry** — a `**Phase-P erratum (this dispatch):**` sentence appended to the
   existing v1.10 paragraph, summarising the second hunk.
2. **§1.3, after the "revert vs. keep-and-re-derive is PLAN's call" paragraph** — a new paragraph,
   *"Sizing the hygiene residue, and where it is owned"*, which sizes what `e3b9d5a3` left behind at
   `PROP-SWEEP-2(b)`'s measured **28 tracked paths** in three classes (14 `.bak` blobs, four
   consumer-runtime artifacts, this feature's own tracked documents), states that untracking the
   `.bak` class closes **14 of the 28**, and routes the partition, owners and figures to **PLAN's
   Overview HEAD-drift note and A6-00's Edit 1**.

Both hunks are sizing and routing. No section DECISIONS cites for a *design* claim — §2.5, §3.2,
§3.6, §5.1's file-ownership map and status caveat, §5.2's budget-zero fixture, §5.6's restoration
oracle, §6's open questions OQ-2/OQ-5/OQ-6/OQ-7 — has a single changed byte in this interval. The
work of this round was therefore to check the two things a bounded upstream delta can still break:
whether any DECISIONS citation now points at text that reads differently, and whether the delta's
new routing target contradicts what DECISIONS says about the same territory.

## Options Considered

Three readings of "does DECISIONS still hold" were available, and only the third answers the
dispatch's DEC-ERR-03 framing:

- **Item-list only** — confirm the routed erratum items landed in TSPEC. Necessary, not sufficient,
  and explicitly rejected by the dispatch. It would pass a DECISIONS that cited a sentence the
  erratum rewrote.
- **Full re-review of DECISIONS** — rejected as out of scope and as re-litigation of settled
  decisions. DECISIONS' bytes did not change; nothing in it is newly wrong of its own accord.
- **Citation-fidelity sweep against upstream at its current version** (chosen) — enumerate every
  claim DECISIONS makes *about* TSPEC, re-read each cited passage at `sha256:1531143c…`, and ask
  whether the compression still holds. Then, separately, read the delta's own new text and ask
  whether it says anything about territory DECISIONS also speaks to.

Executing the chosen reading:

**Every TSPEC citation in DECISIONS, re-checked at HEAD.** A `grep -n 'TSPEC'` over DECISIONS
returns 17 sites. Fourteen name a section that the delta did not touch (§1.1 row O-8 at `:179`,
§2.5 at `:136` and `:222`, §3.2 step 3's capture-before-budget order at `:240`, §3.6's fixed message
literal at `:293`, §5.1's file-ownership map at `:321`, §5.2's argv-sequence fixtures at `:267` and
its budget-zero arm at `:349`, §5.6's restoration oracle at `:195`, §6 OQ-2/OQ-5/OQ-6/OQ-7 at
`:311`, `:283`, `:300`, `:81`/`:156`/`:164`). Each was verified unchanged by the diff being confined
to the changelog and to one insertion inside §1.3 — no hunk header in the interval reaches any of
them.

**The one citation that touches the changed section.** `:333` reads *"TSPEC §5.1's status caveat and
§1.3 are the carriers of repo state for this feature, and whether the early-landed edits are
reverted or PLAN's batches are re-derived around them is PLAN's call."* This is the single place
DECISIONS leans on §1.3, and it leans on §1.3's **role**, not on any figure inside it. The delta
makes §1.3 carry *more* repo state and re-affirms the same routing — its closing sentence says the
disposition "is not re-litigated here" and its predecessor paragraph still says the remedy choice
"is PLAN's and Phase I's to make". The compression is not merely still true; the delta moves in its
direction. Verified: §1.3's pre-delta paragraph at `TSPEC:290–304` still ends on "is a repo and PLAN
decision, not a TSPEC one", and §5.1's status caveat is untouched.

**The version-label citation.** DECISIONS `:5` and four prose sites name upstream as "TSPEC v1.10".
TSPEC's version cell still reads `1.10` at HEAD — the erratum appended to the existing v1.10
changelog entry rather than opening a v1.11. The citation is therefore accurate as written, and I
file no finding on it; see Q-01 for why I still think it is worth naming.

**Does the delta's new text collide with DECISIONS?** The new paragraph's routing targets both exist
and both carry what it says they carry: PLAN's Overview HEAD-drift note (which DECISIONS `:28` and
`:374` also cite, for the *sizing appendix* pointer) and A6-00's Edit 1, which states the same
"closes 14 of `PROP-SWEEP-2(b)`'s 28 residual paths" figure verbatim. DECISIONS makes no residue,
`.bak`, sweep or tracked-path claim of its own — `grep -nE 'bak|SWEEP|hygiene|residu'` over DECISIONS
returns zero hits — so there is no surface on which the two can disagree. DECISIONS' own relationship
to PLAN's HEAD-drift note is the sizing-appendix citation, and that still resolves: `PLAN:266` points
at `SIZING-pdlc-advisory-wave-gate.md` from inside the note, exactly as `DECISIONS:28` claims.

## Findings

**None.** No High, Medium or Low finding is raised by this confirmation.

The table is empty by measurement, not by deference. What I checked, and what would have produced a
finding had it failed:

| Check | Would have been | Result |
|---|---|---|
| Any DECISIONS citation naming a TSPEC section whose bytes changed in `9a1934db..HEAD`, where the changed text alters what the citation asserts | High, `delta`, `nonlocal` | One citation touches §1.3 (`DECISIONS:333`); it cites §1.3's **role** as repo-state carrier, which the delta enlarges rather than contradicts |
| The delta rewriting the "revert vs. keep-and-re-derive is PLAN's call" routing DECISIONS `:334` compresses | High, `delta`, `nonlocal` | Routing unchanged and restated ("the disposition is not re-litigated here") |
| DECISIONS stating a residue / tracked-path / sweep figure that the delta's 28-and-14 measurement now falsifies | High, `delta`, `nonlocal` | DECISIONS carries no such figure — zero hits for `bak\|SWEEP\|hygiene\|residu` |
| The version label DECISIONS cites (`TSPEC v1.10`) having moved | Medium, `delta`, `nonlocal` | Still `1.10` at HEAD; citation accurate as written |
| The delta's new routing targets (PLAN Overview HEAD-drift note, A6-00 Edit 1) being absent, or contradicting DECISIONS' own citation of that same note | Medium, `delta`, `nonlocal` | Both exist and carry the stated content; `PLAN:266` and `PLAN:309` confirm |
| A design claim moving in the delta and thereby reopening a decision entry `DEC-A6-01`…`DEC-A6-04` compresses | High, `delta`, `nonlocal` | The delta touches no §2/§3/§5.2/§5.6/§6 text; both hunks are sizing and routing |
| My v9 Low (the preamble's relocated integer at `DECISIONS:30`) — still open, and does the upstream move change its severity? | Low, `inherited`, `nonlocal` | Still open and still Low; **not re-filed** — it is a v9 finding already on the record, and re-filing it here would inflate this round's counts and misreport it as cascade-caused |

The last row is the only judgement call in the table. My v9 Low stands unaddressed at HEAD
(`DECISIONS:30` still quotes "the already-migrated-sites bullet folded into column (2)"), but this
round's question is whether the *upstream move* broke DECISIONS, and it did not. Carrying a prior
round's open non-blocking finding forward as a new finding of this round would make the erratum look
costlier than it was.

## Questions

| ID | Question |
|----|---------|
| Q-01 | **A byte change under an unchanged version label is what makes cascade confirmations necessary in the first place.** TSPEC's bytes moved from `4a092e85…` to `1531143c…` while its version cell stayed at `1.10` — the erratum appended to the v1.10 changelog entry rather than opening v1.11. Nothing downstream is wrong for it: DECISIONS cites "TSPEC v1.10" and that label is still literally correct. But four DECISIONS prose sites and PLAN's whole v1.4/v1.5 re-grounding narrative say "re-grounded on TSPEC v1.10", and there are now two distinct TSPECs that answer to that name. The `UPSTREAM-STATE` sha anchors on cross-review files are what actually caught this (mine at v9 recorded `4a092e85…`), which is the mechanism working — the question is for the author: should an erratum that adds a paragraph to a section, rather than only fixing a sentence, take a version bump so the human-readable label carries the same signal the sha anchor does? Not a DECISIONS defect; routed as a Process observation, not filed as a finding. |
| Q-02 | **The new §1.3 paragraph cites a live oracle by test title — who re-runs it?** It reports `PROP-SWEEP-2(b)` in `pdlc/workflows/__tests__/documentOracles.test.js` (case *"the unfiltered sweep minus A-1's frozen glob list is empty"*) as returning 28 residual paths "at PLAN's dated 2026-08-19 measurement", and names one of the three classes as *this feature's own tracked documents, which therefore grow by one per committed cross-review file*. This file is the 43rd such document and, by that paragraph's own mechanism, the residual is 29 the moment this review commits. The paragraph is honest about this — it dates the measurement and routes the figures to PLAN — and DECISIONS is untouched by it either way. The question is whether PLAN's A6-00 Edit 1, which states "closes 14 of the 28" as a bare figure, wants the same date-stamp, since the closable count (14) is stable while the total is not. PLAN-side, raised here only because this round is the first place both halves were read together. |

## Positive Observations

- **v1.8's relocation is what makes this confirmation cheap, and it paid off exactly where predicted.**
  The erratum that moved is a *measurement* paragraph — 28 tracked paths, three classes, 14 closable.
  Two rounds ago that is precisely the kind of content DECISIONS carried, and a TSPEC re-measurement
  would have cascaded into a stale integer in the decision record. Because v1.8 pushed every
  short-shelf-life number out to `SIZING` and PLAN, DECISIONS had **no surface** for this delta to
  falsify: `grep -nE 'bak|SWEEP|hygiene|residu'` returns nothing. That is the intended effect of the
  relocation, observed working on its first real test.
- **The delta routes rather than duplicates.** The new paragraph could easily have restated the
  partition and the disposition of each class in TSPEC; instead it states the size, says why it
  states only the size ("so that no reader of this paragraph mistakes the `.bak` blobs for the whole
  residue"), and names the owner. One home per figure is the rule the sizing postmortem produced,
  and TSPEC is now following it in the same direction DECISIONS did.
- **The erratum is self-describing in the changelog.** The appended sentence states what was
  under-stated, what replaces it, where it is routed, and — crucially for a cascade reviewer — that
  "no design claim moves". That claim was independently checkable against the diff in about a minute,
  and it held: both hunks are confined to the changelog and to one insertion inside §1.3.
- **The `UPSTREAM-STATE` sha anchors did their job.** My v9 file recorded `TSPEC sha256:4a092e85…`;
  the dispatch names `1531143c…`. The drift was detectable mechanically without reading either
  document, which is the whole point of writing those anchors, and it is why Q-01 is a question about
  labelling rather than a finding about a missed cascade.

## Decision

**DECISIONS still holds as approved against TSPEC as it now stands.**

The delta is sizing and routing inside TSPEC §1.3 plus its changelog summary. DECISIONS' only lean on
§1.3 is a role claim — that §1.3 and §5.1's status caveat are the carriers of repo state for this
feature, and that the revert-vs-re-derive remedy is PLAN's call — and the delta strengthens both
halves of that claim rather than disturbing either. Every other TSPEC section DECISIONS cites is
byte-unchanged in the reviewed interval. DECISIONS carries no figure, no repo-state measurement and
no residue claim that the new 28-and-14 measurement could falsify, because v1.8 deliberately removed
that class of content from the record. No decision entry is reopened, and no compression in the
document has become unfaithful.

Nothing in this confirmation gates. The two questions are routed to TSPEC's author (Q-01, a
labelling convention) and PLAN's (Q-02, a date-stamp on a figure PLAN owns); neither is a defect of
this document and neither is filed as a finding.

## Consequences

## Consequences

- **The approval anchor moves forward.** This round's `REVIEWED-COMMIT` and `UPSTREAM-STATE` re-bind
  DECISIONS' approval to TSPEC `sha256:1531143c…`. A future cascade dispatch measuring against
  `4a092e85…` would be reading a stale anchor; v10 is the current one.
- **DECISIONS' cascade exposure is now structurally small, and this round is the evidence.** With the
  volatile measurements relocated, the only ways a TSPEC edit can reach this document are (a) a
  design change in §2/§3/§5.2/§5.6/§6, or (b) a change to §1.3's or §5.1's *role* as repo-state
  carrier. Both are narrow and both are cheap to check. Future cascade confirmations on this document
  can reasonably be scoped to that pair rather than to a full citation sweep — which is a durable
  saving, not a one-round convenience.
- **The residual-count mechanism means TSPEC's 28 is stale on commit, by design.** The paragraph's
  own third class grows by one per committed cross-review file, so this file makes it 29. TSPEC
  date-stamps the figure and routes ownership to PLAN, which is the right handling — but any reader
  who quotes "28" without the date will be quoting a number that was never intended to be stable.
  DECISIONS is insulated from this and should stay that way: it should not acquire a residue figure
  in any future round.
- **Q-01 is unaddressed process risk, not feature risk.** Two byte-distinct TSPECs answer to the
  label "v1.10". Nothing downstream is wrong today, and the sha anchors catch it mechanically, but
  the human-readable label no longer distinguishes what the anchor does. If harvest wants one durable
  lesson from this round, that is the one.

## Recommendation

**Approved**

No High, Medium or Low finding is raised by this confirmation. DECISIONS' approval stands against
TSPEC at `sha256:1531143c…`. My v9 Low (`DECISIONS:30`'s relocated integer) remains open and remains
non-blocking; it is deliberately not re-filed here because it is not cascade-caused.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

UPSTREAM-STATE: REQ sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:1531143c923857242241c61a35d43fc9677e152d6cca1162533778bb0c30c004
