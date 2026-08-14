# POSTMORTEM — Phase P — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `PLAN` → **POSTMORTEM-P** |
| Downstream | operator decision; `LEARNINGS-pdlc-engine-distribution.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{1..4}.md` (8 files); `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v3.md` (2 files, erratum confirmation) |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 1.0 | 2026-08-13 |

RESOLVED: no

## Phase Summary

**Phase P's own review loop converged. The halt is the erratum channel, not the PLAN.**
`PLAN-pdlc-engine-distribution.md` reached `v0.4` and both reviewers signed it in round 4
(`Approved with minor changes`, anchors recorded at `3820543b`). What halted the phase is the
*upstream* erratum raised against the FSPEC during the PLAN rounds: the erratum edit landed, the
bounded delta-confirmation round ran, and **both confirming reviewers returned Needs revision with
one High each**. The erratum budget is one round per upstream document per phase, so the failed
confirmation halts Phase P.

| | |
|---|---|
| PLAN | `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` **v0.4**, 59 tasks, 11 batches, both verdicts `Approved with minor changes` |
| Upstream under erratum | `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` **v0.3 at HEAD** |
| Branch | `feat-pdlc-engine-distribution` |
| Halt reason | Erratum delta-confirmation failed: `se-review` `{1, 1, 1}` and `te-review` `{1, 0, 1}`, both High, one erratum round per upstream doc per phase already spent |
| Round budget | Phase P review rounds: **4 of 5 used**, not exhausted. FSPEC lifetime rounds: **3 of 15**. Neither budget is the constraint — the erratum-round budget is |
| Commits under confirmation | `aa4d4a50..HEAD` on the FSPEC — `8bb5fb40` (erratum edit), `768a0046` (changelog avoids restating the dangling id) |

The distinction matters for the fix: nothing in the PLAN was found wrong, and no reviewer re-opened
a settled PLAN decision. The blocking defect is entirely inside the five lines the erratum edit
itself wrote into the FSPEC.

## The Erratum Round

Two items were routed upstream to the FSPEC across the PLAN rounds, plus a re-grounding obligation
on REQ `v0.10` (which moved under the FSPEC during Phase F's own erratum round).

| # | Raised item | Filed by | Landed in `v0.3`? | Evidence |
|---|---|---|---|---|
| 1 | §3 F-7 step 4 cites "§8's AT-7.2"; §8 enumerates no `AT-7` group — the criterion meant **AT-6.2** | `pm-review`, `te-review`, `se-author` (5 filings across rounds) | **Yes, cleanly** | `FSPEC:296` now reads "§8's AT-6.2"; `grep -n 'AT-7'` returns only the changelog's description of the fix (`:20-21`), no dangling id survives. Both confirmers checked the target on substance, not numbering: AT-6.2 (`:755`) is the manual load-root/coexistence observation whose two-conjunct channel test F-7 step 4 describes (`:773`, `:775` corroborate) |
| 2 | AT-3.8a's expected packed set ("the manifest, `bin/pdlc.mjs`, twelve named `lib/*.mjs` modules") contradicts TSPEC §5.4's `PK-*` table (23 members before N-2, 24 after E-4b's `bin/cli.mjs` split) — an implementer transcribing the FSPEC ships four members | `se-author` (twice) | **Partly — contradiction removed, replacement is the blocking finding** | §5.2's CLI-entry and engine-module rows no longer enumerate members ("named in TSPEC §5.4", `:474-478`); AT-3.8a (`:691`) now says the members "are named downstream, in TSPEC §5.4's `PK-*` table" and that this document must not restate the list. The wrong literal is gone; no literal replaced it |
| 3 | Re-ground on REQ `v0.10` — NG-6/O-2's run-reads-`engine.*`-pin scope, AC-3.5's paired positives | erratum protocol (DEC-ERR-01) | **Yes** | Header cites REQ `v0.10` (`:9`); NG-6/O-2 recorded as **absorbed** (already carried by §3 F-4, BR-2.2, BR-4.7, I-4, E-11); AT-3.5 (`:678-684`) now carries AC-3.5's two positives — credential present ⇒ authenticated publish and release cut, absent ⇒ named failure, nothing published |

Both confirmers verified the edit stayed targeted: `git diff` over `aa4d4a50..HEAD` touches only the
header/changelog, `FSPEC:296`, two §5.2 rows, AT-3.5 and AT-3.8a. No settled section moved, and
AT-3.8b remains correctly `[blocked on O-10]`.

## Delta-Confirmation Verdicts

## The Two Highs Are One Defect

## Best-Guess Root Cause

## Recommendation
