# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation, round 9)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 9
**Scope:** Upstream-cascade confirmation only. The FSPEC's own bytes have not moved since the v8
approval. The REQ moved: v0.11 (`01c27ee4`) → v0.12 (`20c87cd3`), a single-row erratum edit to
**O-B**. One question is answered here — does the FSPEC still hold against the REQ as it now
stands? Settled sections are not re-litigated; no fresh review of unchanged FSPEC text.

## 1. Upstream delta read

`git show 20c87cd3` touches the REQ only, 8 insertions / 2 deletions, in exactly two places:

- the version cell and a new changelog paragraph (`REQ:15-24`): `0.11` → `0.12`, dated 2026-08-16,
  recording the erratum and its reason;
- the **O-B** row of the shipped-behaviour table (`REQ:86`), rewritten.

O-B previously read "The PR gate is **five** required checks … on ubuntu-latest × Node 20 only."
It now reads that membership is **trigger-derived, not a fixed count** — a required check is
whatever a PR-triggered workflow file renders, and the count moves whenever such a file is added,
removed or re-triggered, *including by this feature's own work*. The old five-name list survives
as a **dated observation** ("at the 2026-08-13 measurement that was one file, `pr-tests.yml`,
carrying …"), explicitly de-authorised ("no number stated here is authoritative"), and the row's
Source cell gains `FSPEC §5.1` alongside `M-ENG-10`, naming §5.1 the authority on membership.

This is precisely the erratum I raised at the end of v8 (`CROSS-REVIEW-…-FSPEC-v8.md:117-118`).
Nothing else in the REQ moved: `T-7` (`REQ:258`), `AC-3.2`/`AC-3.4`, `M-ENG-10`'s citation and the
per-criterion Source cells are byte-identical to the version I approved against.

## 2. Does the FSPEC still compress this REQ faithfully?

Yes, on the substance. Checked against current upstream text, not against the item list.

**No fixed check count exists anywhere in the FSPEC to be contradicted.** `grep -n "five|Five"`
over the FSPEC returns nothing. §5.1 (`:465-524`) states the set by **enumeration** — six rows,
two alphabets — and BR-7.1 (`:498-501`) derives even the *file* scope rather than listing it: the
carrier enumerates `.github/workflows/` and set-equals the PR-triggered files against §5.1's file
column. BR-7.5 (`:526-531`) makes the membership test the file's `on:` trigger, not its filename.
That is the same doctrine the new O-B now states in prose. Before this edit the REQ's gloss and
the FSPEC's set disagreed on cardinality; after it they agree on cardinality *and* on the rule that
generates it.

**The new REQ→FSPEC pointer lands.** O-B's Source cell now cites `FSPEC §5.1` as the authority on
membership. §5's preamble (`:458-460`) claims exactly that ownership — "these three sets are the
change-control points the REQ parked here (T-7, AC-1.3, AC-5.3)" — and §5.1's heading (`:465`) is
tagged `(T-7, AC-3.4, C-5)`. The citation is not aspirational; the section it names does own the
set, under the id O-B invokes.

**The dated observation O-B keeps is the one the FSPEC seeded from.** O-B's surviving measurement
is "2026-08-13, one file, `pr-tests.yml`, five legs". §5.1's seed line (`:467`) reads "Seeded from
M-ENG-10's measurement (2026-08-13 at `89babe8e`, re-measured review round 2; **row 6 added
2026-08-16**)", and rows 1–5 carry `pr-tests.yml` while row 6 carries `fixture-machine.yml`. The
REQ's observation and the FSPEC's seed record are the same measurement, and the FSPEC's own
provenance note already explains why the live set is larger than the seed. No divergence.

**Internal REQ coherence improved, and the FSPEC sat on the correct side of it already.** T-7
(`REQ:258`) has said "an enumeration, not a count" since before my approval; the FSPEC was written
to T-7, not to the old O-B gloss. The edit removes a REQ-internal inconsistency rather than moving
the contract the FSPEC compresses — which is why nothing downstream needs rewriting.

**Nothing else the FSPEC leans on moved.** Every FSPEC citation of upstream that touches this area
(`:467`, `:524`, `:906` — all `M-ENG-10`) points at the constraints file, not at O-B, and
`M-ENG-10` is untouched by this commit. The FSPEC never cites `O-B` at all.

One provenance line does go stale as a mechanical consequence of the edit (F-01 below): the header
still names REQ `v0.11`/`01c27ee4`. That is a pointer, not a claim about behaviour, and it does not
put the FSPEC out of step with anything the REQ now says.

## 3. Findings

No High findings. The approval stands. One Low provenance item, mechanically created by this
round's edit.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Low | Local | **The upstream re-grounding line now names a superseded REQ version.** The header reads REQ `v0.11`, `01c27ee4`, "re-grounded 2026-08-14 erratum round" (`FSPEC:9`), while upstream HEAD is `v0.12`, `20c87cd3`, 2026-08-16. Nothing in the body depends on the stale pointer — the FSPEC cites `M-ENG-10` rather than `O-B` everywhere the required-check set is discussed — so this is a bookkeeping lag, not a contract drift. Fold the bump into the next FSPEC touch; the engine's `UPSTREAM-STATE` anchors, not this cell, are what actually gate staleness. Same line as v8 `F-06`, now stale for a second reason. | `FSPEC:9` |

Carried forward unchanged from v8, all non-gating and all outside this confirmation's question:
`F-01` (AT-1.6 banner-triple comparison), `F-02` (two new obligations without their own AT row),
`F-03` (row-6 edit landed without a version bump/changelog entry), `F-04` (BR-7.7 numbered out of
order), `F-05`–`F-07` (v7 carry-forwards). None of these were touched by the upstream edit and none
are re-litigated here.

## 4. Questions

None arising from the upstream delta. v8's `Q-01` (whether Phase PUB's poll treats an
absent path-filtered row-6 check as "not yet green" or "not applicable") remains open and remains
owned by the FSPEC's own revision loop, not by this confirmation.

## 5. Positive Observations

- **The erratum fixed the rule, not just the number.** Bumping "five" to "six" would have bought
  one round of quiet and then gone stale again the next time a workflow file was added. Restating
  membership as trigger-derived makes the REQ's gloss un-stale-able by construction, which is the
  same move §5.1's BR-7.1 made for the file scope.
- **"Including by this feature's own work" is the right sentence to have written down.** The old
  gloss was authored before this feature added `fixture-machine.yml`; naming the feature as a cause
  of its own drift is the honest account of why the count could not have been authoritative.
- **Authority is now pointed one direction only.** O-B glosses, `M-ENG-10` measures, §5.1 owns.
  Three roles, three homes, and the row says which is which — a reader who finds a disagreement now
  knows which document to correct.
- **De-authorising the retained number explicitly** ("no number stated here is authoritative")
  keeps the useful dated observation without letting it re-acquire contract force by proximity.

## 6. Recommendation

**Approved with minor changes** — the v8 approval holds against REQ v0.12.

The upstream edit is the erratum this review raised, and it moves the REQ *towards* the FSPEC rather
than away from it: the contradiction between O-B's fixed count and §5.1's six-row derived set is
gone, O-B's new pointer to §5.1 is accurate, and the dated measurement it retains is the same seed
§5.1 already records. No FSPEC sentence cites text the REQ no longer says, and no FSPEC claim is
now a false compression of upstream. One Low bookkeeping item (`F-01`, the stale re-grounding
pointer at `:9`) plus v8's untouched carry-forwards; none costs a round.

FINDING: Low | delta | nonlocal | Front-matter upstream cell (`FSPEC:9`) | Re-grounding line still names REQ v0.11 / `01c27ee4` (2026-08-14) after the erratum moved upstream to v0.12 / `20c87cd3` (2026-08-16); pointer-only lag, no body claim depends on it

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
