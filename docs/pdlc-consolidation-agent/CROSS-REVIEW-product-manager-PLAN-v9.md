# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 9
**Scope:** Delta confirmation of the erratum edit only (commits `e0b032c1`, `68abfab8`, `6400ef9e`, `99cad6a2` over the v8-approved base `77021ed0`). Not a re-review of the approved PLAN.

## What was checked

Two erratum items, each raised on the same two cells by pm-review, te-author and se-review:

1. **T20 obligation (i)** carried the pre-erratum reading of REQ §4b (`renderConsumedPair`'s output "contains **both** basenames") and planned one fixture where two are owed (`AT-K3b`).
2. **T05** pinned FSPEC `11.5` / TSPEC `2.0`, measured over `FSPEC:2089-2239`, expected **99** ids, and closed "green the moment it is written" without the erratum-8 qualification.

### Item 1 — resolved

`PLAN:397` (T20) now states obligation (i) as **two fixtures in one case, each the other's control**:

- *Fixture 1, mixed corpus* — the pair assertion is **"set-equal to `{readable}`"**, with REQ §4b's rule quoted inline ("an unreadable entry is *not* consumed and stays un-consolidated for the next pass"). The overturned "contains both" wording is gone; grep for `renderConsumedPair` finds no surviving containment claim in the PLAN.
- *Fixture 2, all-unreadable corpus* — explicitly **discharges `AT-K3b`**: terminal `no-op` (not `failed`, not `refused`), empty pair, `|un-consolidated|` **2**, no proposal file, no reason code, status pinned against §6.4's frozen catalogue.

Verified upstream: `AT-K3b` exists at `FSPEC:2210` (v11.7, header `:12`); FSPEC §15 binds it to **AC-1.4** as that criterion's third cause (`FSPEC:2388`); TSPEC v2.8 §12.2 (`:2863`) states both fixtures in the same shape and §12.3 assigns `AT-K3b` to `consolidationPass.test.js` (`:2938`), with `:2944` recording why it is not in `consolidationCredential.test.js`. The PLAN's residual `(no FSPEC AT)` claim is now correctly narrowed to fixture 1 only.

Product-lens check on containment: the new set-equality oracle is *stricter*, not narrower — it preserves NFR-5's "names exactly the consumed set" and adds AC-1.4's third cause, so no previously approved acceptance criterion is weakened or dropped.

### Item 2 — resolved

`PLAN:383` (T05) now pins FSPEC `11.7` (`FSPEC:12`) / TSPEC `2.8` (`TSPEC:12`), measures over `FSPEC:2116-2267`, and expects **100** ids, naming `AT-K3b` (`FSPEC:2210`) as the delta from 99. Re-measured independently: de-duplicated `AT-…` tokens over `FSPEC:2116-2267` = **100**. The "green the moment it is written" claim is now qualified by erratum 8 having **landed** at TSPEC v2.8 (§12.3 count re-derived to 100 at `TSPEC:2908`), which is the qualification PROPERTIES §10.4 records. The design is unchanged: the count is still read at run time, both figures are the pin's expected values.

Consistency sweep of the sites that transcribe these figures — §1 upstream-versions table (`:175-177`: REQ **2.5**, FSPEC **11.7**, TSPEC **2.8**), §1's TSPEC pin (`:189`), §8.3's DoD row (`:681-682`), §9.1 errata rows 4 and 5 and the new erratum-8 entry (`:743-754`), §10's risk row (`:807`) — all agree. No stale `11.5` / `2.0` / `99` / `:2089-2239` remains.

### Nothing previously approved was undone

- Task count unchanged: **68** task rows at the approved base and at HEAD. No new task, no new file, no batch or ownership change — consistent with the v1.8 header's claim, and the reason §5's gate numbers are unmoved.
- `T31 — pass lifecycle` (T20's already-planned block) absorbs both fixtures; T20's file/batch/deps cells (`consolidationPass.test.js`, batch 3, deps T01/T02) are unchanged, as are T05's (batch 2, dep T00).
- No scope creep: nothing added that REQ/FSPEC does not carry — every added obligation traces to REQ v2.5 §4b, FSPEC v11.7 `AT-K3b`/AC-1.4, or TSPEC v2.8 §12.2/§12.3.
- No requirement silently narrowed: AC-1.4's third cause is newly *gained* coverage; AC-7.1's consumed-basename rendering is tightened from containment to set equality.
- Version header bumped to **1.8** with a changelog entry naming both items and stating the no-design-change/no-graph-change invariant.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | No findings. The delta resolves both erratum items and undoes nothing previously approved. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The repair states the corrected rule *and* its product rationale in place (an entry that contributed no evidence must not be marked consumed, or REQ-CONS-05's loop biases toward `prevented`/`insufficient-evidence`), so a later reader cannot re-derive the overturned reading from the PLAN alone.
- Each fixture is explicitly named as the other's control in both directions, which is what keeps the pair from degrading into two happy paths.
- The erratum was absorbed inside an existing task block rather than by minting a task — the cheapest correct repair, and it keeps the approved batch graph and gate numbers honest.

## Recommendation

**Approved** — delta confirmed. Both routed errata are resolved at HEAD, upstream citations re-verified, and no previously approved content is disturbed.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
