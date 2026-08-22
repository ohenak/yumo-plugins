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

PLAN cites TSPEC in nineteen places. Every one was re-read against TSPEC at HEAD, not against my
memory of TSPEC at approval time. Grouped by whether the cascade could reach them:

| PLAN citation | TSPEC at HEAD | Reached by this edit? |
|---|---|---|
| §1.1 "TSPEC §1.2 scopes this feature to eleven delta rows (D-1 … D-11)" | §1.2 still carries D-1 … D-11 | No |
| §1.2 "REQ BL-04 / FSPEC OB-F1 / TSPEC §6.2" (rebase precondition) | §6.2 OB-F1 unchanged | No |
| §1.2 "TSPEC §5.4 AT-14 and §6.2 OB-F1" | unchanged | No |
| §1.3 "(TSPEC RT-2)", "(TSPEC §1.3)" Phase PT out of scope | unchanged | No |
| §1.3 / §3.3 "FSPEC OB-F6, TSPEC AT-17" `postWavePathspecs` | unchanged | No |
| §2.1 T-02 "all eight rows of TSPEC §3.2's guard table", `RESUME_OUTCOMES` set-equality | §3.2 guard table still eight rows | No |
| §2.1 T-04 "AT-16 exactly as DEC-WVR-07 scopes it" | DECISIONS unchanged (`sha256:37b3684d…`) | No |
| §2.1 T-08 P-1 … P-4 ← "TSPEC §5.7 laws" | §5.7 unchanged | No |
| §2.1 T-10 "(RT-7, TSPEC §5.8)" | **§5.8 and RT-7 both edited** — and both now name T-10 explicitly | Yes, and it strengthens the citation |
| §3.1 "TSPEC §5.3 makes it a design obligation"; §3.2 "the four TSPEC §5.3 names" | §5.3 catalogue unchanged (four new files) | No |
| §3.4 `implementation.postWaveCommand` ← RT-5 | RT-5 unchanged | No |
| §3.4 `Coverage floor` row | **edited** | Yes — F-01 |
| §4.2 rule 1 "transcribed from the TSPEC"; §4.2 "TSPEC §5.5 records `toContainEqual` passes" | §5.5 unchanged | No |
| §4.4 RK-2 | **edited** | Yes — F-02 |
| §4.4 RK-3 "(TSPEC RT-1)" 734,711 B; RK-4 "(TSPEC RT-3's residual)" | RT-1/RT-3 unchanged at HEAD | No |
| §4.5 "All eleven TSPEC delta rows D-1 … D-11"; "each named by TSPEC §2.4"; "(REQ C-3, TSPEC §3.4/§3.5)" | unchanged | No |
| §4.5.1 "`classifyWaveLedger` guard arms (TSPEC §3.2) — 8" | unchanged | No |

**REQ, FSPEC and DECISIONS are byte-identical to the versions my approval was taken against.** I
re-hashed all three: `REQ sha256:17e83bfc…`, `FSPEC sha256:9a6be7b5…`,
`DECISIONS sha256:37b3684d…` — each matches the `UPSTREAM-STATE:` anchor in
`CROSS-REVIEW-product-manager-PLAN-v2.md` exactly. So the product-lens chain I verified by set
equality at v2 (REQ-WVR-01 … -10 → FSPEC-WVR-01 … -07 → AT-01 … AT-18 → owning task) is undisturbed
at its source; only the technical-compression layer between TSPEC and PLAN moved, and it moved
toward PLAN.

**The one dependency worth naming as durable signal, and it is already handled.** PLAN's RK-2 is a
worked example of the behaviour the pipeline wants from a downstream author who finds an upstream
defect: implement the reading that is expressible, state the divergence, route an erratum, do not
silently re-specify. That erratum has now landed upstream and the divergence is gone. The residual
work is only that RK-2 and §3.4 still narrate the disagreement in the present tense.

## Verification

Every claim in this confirmation is a command I ran, not an impression.

| Claim | Verification | Result |
|---|---|---|
| PLAN's bytes are unchanged since approval | `shasum -a 256 docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` vs. v2's `APPROVAL-HASH` | `5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85` — identical |
| TSPEC is the only feature document that moved | `git diff --stat b8ddcc56 HEAD -- docs/pdlc-wave-resume/` | one non-review file changed: `TSPEC-pdlc-wave-resume.md`, `9 insertions(+), 4 deletions(-)` |
| REQ / FSPEC / DECISIONS match my approval's upstream anchors | `shasum -a 256` on each vs. `UPSTREAM-STATE:` lines in v2 | `17e83bfc…` / `9a6be7b5…` / `37b3684d…` — all three exact |
| TSPEC at HEAD matches the hash this dispatch names | `shasum -a 256 …/TSPEC-…md` | `5ed76227d8e4cb5b37681421d30a3c50d29e755a7334d37e5ef09c996832234a` — exact |
| The edit is confined to three locations | `git diff b8ddcc56 HEAD -- …/TSPEC-…md` | metadata `Version`, one new revision-history row, §5.8 body, §6.4 `RT-7` mitigation — nothing else |
| §5.8 no longer says "wave's `postWaveCommand`" | `grep -n "### 5.8" -A 30 …/TSPEC-…md` | reads "the **last implementation task** (PLAN T-10, RK-2)"; the phrase survives only as the explicitly-rejected alternative |
| RT-7's mitigation now names T-10 | `grep RT-7` in §6.4 | "§5.8: the last implementation **task** (PLAN T-10, RK-2) runs `npm run test:coverage` …" |
| PLAN pins no TSPEC version | `grep -n "TSPEC" …/PLAN-…md` | nineteen citations, all by section/id (`§1.2`, `§5.8`, `RT-1`, `AT-17`, `V-13`), zero by version number |
| PLAN's floor obligation is command-identical to §5.8's | compare T-10 row, §4.2 batch-4 gate, §4.5 DoD box | all three say `npm run test:coverage` from `pdlc/workflows`, `--per-file --branches 85`, measured per-file number reported |
| The two stale sentences are the whole residue | `grep -n "erratum\|last wave's" …/PLAN-…md` | exactly two hits: §3.4's `Coverage floor` row, §4.4's RK-2 |

**What I deliberately did not re-do.** I did not re-run §4.6's `parsePlanTasks` /
`computeTopologicalBatches` / `computeWaves` verification, and that is a judgement, not an
omission: the edit adds no task, no `Deps` cell and no ownership row, and PLAN's bytes are
hash-identical to the ones I parsed at v2, so the recorded parse cannot have changed. I did not
re-litigate Q-01 (the fifth test file, `waveResumePreflight.test.js`), Q-02 (AT-16's
characterisation shape) or Q-03 (where §4.5.1's filled-in table is checked); all three were
open questions at v2, none is touched by this edit, and none is re-opened here. F-01 … F-04 from
v2 remain the author's outstanding non-gating list and are not restated as findings of this round.

**The check that decides the verdict.** With §5.8 and RT-7 both re-read at HEAD, PLAN's coverage
floor assignment is not merely compatible with upstream — it is the assignment upstream now
prescribes, down to the task id. No P0 or P1 requirement lost an owning task, no acceptance
criterion was narrowed, broadened or re-triggered, and nothing entered scope. PLAN holds as
approved; the two Low findings are corrections to how it *describes* upstream, not to what it
plans.

## Delta-Confirmation Findings

*(pending)*

## Verdict

*(pending)*
