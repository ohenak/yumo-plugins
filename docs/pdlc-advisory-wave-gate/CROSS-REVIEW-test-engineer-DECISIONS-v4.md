# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.2)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v3.md` (v1.1, TSPEC v1.5 pin)
**Delta reviewed:** `c05f497f..9a569157` (six commits, DECISIONS only)
**Date:** 2026-08-19
**Iteration:** 4

## Context

v3 was an upstream-cascade confirmation: the four decisions held, but four passages described an
upstream state that had stopped existing, two of them in the shape "no test falsifies this" about
regressions the erratum round had just made falsifiable. I raised two High, two Medium, one Low.

This round's delta is the revision I asked for, and it is bigger than the one I scoped: upstream
moved further while it was being written (TSPEC v1.6 → v1.10), and the author re-grounded against
v1.10 rather than the version my findings cited. Two of my citations are consequently stale in the
document's favour — the engine-channel expectation no longer lives where TSPEC v1.6 put it
(`ci-arrangement.test.js`), and v1.10 re-homed it to a purpose-named new file. The revision tracks
that move rather than transcribing my v3 text.

Scope held to the delta: six commits touching this file only, no decision line altered, plus a
re-check of every upstream anchor the delta newly cites. I did not re-read unchanged sections
except where the delta cites them.

## Decision

**All five v3 findings are resolved, none by weakening a claim.** Each anchor re-verified at HEAD:

| v3 finding | Resolution | Verified at |
|---|---|---|
| F-01 (High) — `0`-vs-`enabled: false` collapse recorded as unfalsifiable | Bullet now reads "The collapse is falsified upstream at TSPEC v1.10" and reproduces the landed fixture, keeping the present-and-zero conjunct as the separating assertion | `TSPEC:1427-1436` — enabled tier, `waveBudgetPerRun: 0`, red gate ⇒ `escalated` / `reason: "budget-exhausted"`, zero `_agent` calls, snapshot still taken, advisory summary key **present** with sixth-row counters zero |
| F-02 (High) — DEC-03 fixed-name rejection recorded "stated but not falsifiable" | Paragraph now records the closed loop: rejection is falsifiable, with the two-wave set-equality quoted | `TSPEC:1225` (§4.5 row qualified "asserted on §5.2's two-red-wave run"); `TSPEC:1437-1444` (set-equal `{a6-snapshot-1, a6-snapshot-2}`, two distinct targets each written once) |
| F-03 (Medium) — DEC-A6-02 quoted an O-8 row that no longer exists | Paragraph rewritten to "Upstream now states this shape, and cites this entry for the rejection"; the new quote is verbatim, and "two pieces" is correctly reduced to one | `TSPEC:262` — "**One further `commitPaths` call** … the owning task's own commit keeps its own pathspec, unwidened", naming "the rejected option A of … DEC-A6-02". FSPEC BR-8's permissive clause does still stand (`FSPEC:196`) |
| F-04 (Medium) — engine-channel routing status stale | Rewritten past my own citation: the expectation is owned by a **new** file, not `ci-arrangement.test.js`, and the "no AT covers it" phrasing is replaced by a deliberate-allocation statement | `TSPEC:1330` (§5.1 map: `pdlc/engine/__tests__/advisory-config-example.test.js`, new file); `TSPEC:1174-1182` (§4.4's rationale); the named required check `Engine tests (ubuntu-latest)` exists (`.github/workflows/pr-tests.yml:88`) |
| F-05 (Low) — stale upstream pin, cross-review list | Upstream re-pinned to TSPEC v1.10 in both the metadata table and §Context's opener; Cross-Reviews cell now lists all three PM/TE pairs | Metadata table, `DECISIONS:5,11` |

**v2's carried findings are discharged in the same pass, as Q-01 asked.** v2 F-01 (the `-m`-less
`commit-tree` failure mode) is corrected rather than carried: DEC-A6-01 now says the failure is
silence, not a block. I re-measured the corrected claim rather than accepting it — `defaultGit`
does run `execFileSync("git", args, { stdio: "pipe", encoding: "utf8" })` with no `input`
(`pdlc/workflows/orchestrate-dev.js:11658-11667`), and against real git `git commit-tree {tree} -p
HEAD </dev/null` exits `0`, prints an object id and yields an **empty** commit message. The
document's account now matches measurement, and the operator-facing consequence it draws (an
unlabelled snapshot commit) is the right one. v2 F-03 (seventh transcription site) is folded in too.

## Findings

## Questions

## Positive Observations

## Consequences

## Recommendation

## Verdict
