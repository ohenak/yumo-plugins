# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.1, bytes unchanged since approval)
**Date:** 2026-08-21
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)
**Scope:** Product lens only — does PLAN still hold as approved against TSPEC as it now stands?

## Overview

This is a cascade confirmation, not a review round. My approval of PLAN v1.1 was recorded at
`REVIEWED-COMMIT: b8ddcc56` with `APPROVAL-HASH: sha256:5f5b50db…`. PLAN's bytes today hash to
`sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85` — identical, so nothing in
the document itself has moved. What moved is TSPEC: my approval carried
`UPSTREAM-STATE: TSPEC sha256:458e9ec6…`, and TSPEC at HEAD is `sha256:5ed76227…`. The single
question is whether PLAN is still a faithful compression of TSPEC as TSPEC now reads.

**The erratum that landed is the one my own approval routed upstream.** My v2 trailer emitted an
`ERRATUM: TSPEC` on §5.8: the coverage floor was specified there as an obligation of "the last
implementation **wave's** `postWaveCommand`", which is not expressible on a config surface TSPEC
V-13 itself closes at four keys with a single *global* `postWaveCommand`. PLAN had already declined
to implement the unimplementable reading — §3.4 and RK-2 assign the floor to **T-10**, the last
implementation task — and said so openly rather than quietly re-specifying. TSPEC v1.3 now says
exactly what PLAN does: §5.8 and RT-7 both read "the last implementation **task** (PLAN T-10,
RK-2)".

**Direction of travel: the gap closed toward PLAN, not away from it.** Product-substantively, PLAN
is *more* faithful to TSPEC at HEAD than it was to TSPEC at approval time. No requirement changed,
no acceptance criterion moved, no scope was added or dropped, and no task assignment in PLAN is
invalidated. T-10 still runs `npm run test:coverage` from `pdlc/workflows` with
`--per-file --branches 85` and still reports the measured per-file branch number; that is now the
upstream instruction verbatim rather than a documented deviation from it.

**What remains is narrower and it is real.** PLAN describes upstream in two places in the past
tense of a disagreement that no longer exists — §3.4's `Coverage floor` row speaks of "the erratum
this dispatch raises", and RK-2 says "TSPEC §5.8 asks for it as the last wave's `postWaveCommand`
… the difference from TSPEC's wording is raised as an erratum". Both sentences now assert that
upstream says something upstream does not say. Neither changes what gets built, which is why both
are Low; but under DEC-ERR-03 a citation that no longer matches upstream at HEAD is a finding of
this confirmation regardless, and both are cheap one-line corrections in the same edit.

## Batches

The TSPEC edit is 9 insertions / 4 deletions across three places. Below, each edited upstream
location against the PLAN material that leans on it, and the verdict for that pairing.

| TSPEC location at HEAD | What changed | PLAN material that leans on it | Still faithful? |
|---|---|---|---|
| Metadata `Version` | `1.2` → `1.3` | PLAN pins no TSPEC version number anywhere (its metadata names only its own version and its own cross-review file) | Yes — nothing to restate |
| Revision history, row `1.3` | New row recording the round-4 erratum: floor re-assigned from "the last wave's `postWaveCommand`" to "the last implementation task (PLAN T-10, RK-2, PLAN §3.4)"; scope explicitly unchanged | PLAN §1.1's delta enumeration D-1 … D-11; PLAN's own revision history | Yes — the row names PLAN as the source of the correction and adds no delta row; D-1 … D-11 are untouched |
| §5.8 body | "the **last wave's `postWaveCommand`**" → "the **last implementation task** (PLAN T-10, RK-2)", plus the explicit V-13 four-key non-expressibility reasoning | T-10 (§2.1, cited "RT-7, TSPEC §5.8"); §3.4 `Coverage floor` row; RK-2 (§4.4); §4.2 batch-4 gate; §4.5's DoD checkbox; §4.5.1's delta map | Substance yes, wording stale in two places — F-01, F-02 |
| §6.4 `RT-7` mitigation | Same re-assignment, plus "Not `implementation.postWaveCommand`: that key is a single *global* setting (V-13's four-key surface)" | T-10's parenthetical `(RT-7, TSPEC §5.8)`; RK-2's framing | Substance yes; RK-2's "difference from TSPEC's wording" is the stale half — F-02 |

**The obligation PLAN carries is unchanged, and I checked it as an obligation, not as a string.**
TSPEC §5.8 at HEAD asks for four things: (i) the floor is `npm run test:coverage` from
`pdlc/workflows` at `--per-file --branches 85`; (ii) it is run by the last implementation task;
(iii) that task reports the *measured* per-file branch number; (iv) the floor closes inside Phase I
rather than surfacing at PUB. PLAN discharges each: (i) and (ii) in T-10's row and §4.2's batch-4
gate ("`npm run test:coverage` from `pdlc/workflows` exits 0 (`--per-file --branches 85`)"), (iii)
in T-10's oracle (i) — "with the measured per-file branch number for `orchestrate-dev.js`
reported" — and again in §4.5's DoD checkbox, (iv) by T-10 sitting in batch 4 of Phase I with
`Deps` `T-07, T-08, T-03, T-04`, i.e. genuinely last. Set-equality, not containment: there is no
fifth obligation in §5.8 at HEAD that PLAN leaves homeless.

**Nothing else in the batch/task table is reachable from this edit.** The edit adds no delta row,
no AT, no property, no config key, and no file. The `#`/`Deps` cells, §3.3's ownership manifest and
§4.6's recorded parse are untouched by anything upstream now says, so the converged-PLAN
self-parse I reproduced at v2 remains valid without re-running it — and the corrections F-01 and
F-02 ask for touch prose in §3.4 and §4.4 only, not the task table.

## Dependencies

*(pending)*

## Verification

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Verdict

*(pending)*
