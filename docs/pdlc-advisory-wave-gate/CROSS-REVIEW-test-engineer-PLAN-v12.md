# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 12 (upstream-cascade confirmation; PLAN bytes unchanged since `b902f40b`)

## Overview

**Scope of this round.** PLAN's own bytes have not moved since `b902f40b`, the commit my v11
approval was recorded against. One upstream document moved: **DECISIONS**, in the Phase-P erratum
`8a44b84b` (*"v1.9 drop relocated integer, record round-9 erratum re-grounding"*), +20/-3. I re-read
my v11 review, read that diff, re-read the DECISIONS text this PLAN leans on at its current bytes,
re-measured every figure the two documents share at HEAD, and answer the single question: is PLAN
still a faithful compression of upstream as upstream now stands?

**Upstream hashes verified at dispatch.** `shasum -a 256` over the four upstream documents
reproduces the four dispatch hashes exactly: REQ `817b6745…`, FSPEC `82f74a2d…`, TSPEC `1531143c…`,
DECISIONS `84deee10…`. DECISIONS is the only one that moved since my v11 UPSTREAM-STATE line, which
recorded `25f8e954…`; REQ, FSPEC and TSPEC are byte-identical to the state I last approved against.

**What the erratum did.** Two current-state repairs in DECISIONS, no design change. (1) The v1.8
paragraph *"On v1.8, and the sizing block that used to live here"* quoted the relocated bullet by its
cardinality — *"the **twelve** already-migrated sites"* — and v1.9 drops the integer, naming the
bullet by subject instead (*"the already-migrated-sites bullet"*), so that DECISIONS carries no HEAD
measurement at all; it states that `SIZING-pdlc-advisory-wave-gate.md` *"remains the sole carrier of
that number."* (2) A new paragraph *"On v1.9 (Phase-P erratum round, TE v9 F-01)"* records the
round-9 re-grounding, the round-9 cross-reviews in the Cross-Reviews cell, and the routing of the
round's other two findings — PM v9 F-01 (**PLAN** should cite the appendix rather than restate
column (1)'s count) and PM v9 F-02 (a harvest item).

**Effect on PLAN: no design surface moved.** PLAN cites DECISIONS in exactly three substantive
places — the v1.6 changelog row (the relocation and the appendix citation), the Overview HEAD-drift
note's three-column paragraph (*"DECISIONS now keeps only column (1)'s four"*), and the four
`DEC-A6-01…DEC-A6-04` design citations inside A6-10, A6-18 and A6-21. I re-read each against
DECISIONS at HEAD:

| PLAN claim about DECISIONS | Holds at HEAD? |
|---|---|
| The three-column sizing block was relocated out of DECISIONS into the PLAN appendix (v1.6 row, Overview) | **Yes** — DECISIONS' v1.8 paragraph survives the erratum with its relocation account intact |
| *"DECISIONS now keeps only column (1)'s four"* | **Yes** — `## Consequences → What follows for the whole feature` still reads *"The number an implementer must not get wrong is **four**"* and *"this entry deliberately restates none of them"* |
| `DEC-A6-01` (dangling snapshot commit, never `git stash`), `DEC-A6-02` (promotion commit message form), `DEC-A6-03` (wave-scoped ref, no run discriminator) as cited in A6-10 / A6-21 | **Yes** — all four decision entries stood byte-frozen through this erratum (`git show 8a44b84b` touches only the header block and the two prose notes above `## Context`) |

The one place the delta reaches PLAN is not a contradiction but an **ownership** statement: DECISIONS
now says SIZING is the *sole* carrier of the already-migrated-sites number, and records PM v9 F-01
asking PLAN to cite rather than restate. PLAN's Overview still prints the twelve, the ten, the two,
the twenty-five and the four inline. Every one of those integers reproduces the appendix exactly
today (checked below), so nothing PLAN says is false — but PLAN is now a second carrier of figures
upstream has just declared single-carrier. That is **F-03**, Low, and it touches no task row.

## Batches

PLAN's bytes did not move, so the batch-DAG check is not re-run from scratch — the derivation I
confirmed in v10 and re-confirmed in v11 stands unchanged. What I re-check is the only place this
erratum could have reached a task row: the two sites where PLAN restates figures DECISIONS has now
disclaimed, and the four `DEC-A6-0x` citations that sit inside task rows.

| Site | What the erratum changed upstream | Holds at HEAD? |
|---|---|---|
| Overview → three-column paragraph (feeds A6-05's "verification, not editing" sizing) | DECISIONS drops its quoted `twelve`; SIZING declared sole carrier | Figures **still reproduce** the appendix (four / twelve = ten + two / twenty-five). Carrier duplication only (**F-03**) |
| A6-10, A6-21 `DEC-A6-01`…`DEC-A6-03` citations | nothing — decision entries byte-frozen | **Yes**, verbatim |
| A6-18 `PROP-DIS-06` three-`.enabled`-reads oracle | nothing — that pin lives in TSPEC, unmoved this round | **Yes** |
| Overview → HEAD-drift note residual figures (`28`, class 3 `10`) | untouched by this erratum; still PLAN-owned | **No** — re-measured **35 / 14 / 4 / 17** today (**F-01**, inherited) |
| Wave-1 *(specifics)* gate recap, `.gitignore` rule form | untouched | **No** — still spells the anchored literal A6-00's Edit 1 retires (**F-02**, inherited) |

**Dispatcher contract re-run against the unmodified document.** I ran the shipped parser over PLAN
at HEAD to confirm the dispatcher still sees what it saw at approval: `parsePlanTasks` → **11 tasks**
(`A6-00, A6-01, A6-04, A6-05, A6-06, A6-08, A6-10, A6-12, A6-14, A6-18, A6-21`), `parsePlanOwnership`
→ **11 manifest rows**, `computeWaves` → **7 waves**. Identical to v10 and v11. No batch column, wave
map, dependency edge or ownership cell moved, and none could have — the erratum edited a different
document's prose header.

**TDD ordering and `[Fake first]`.** Unchanged and unreachable by this delta; the red-step /
green-step structure inside A6-10, A6-18 and A6-21 is PLAN-internal and cites TSPEC, not DECISIONS.
I re-read A6-10's red step against `DEC-A6-01`/`DEC-A6-03` at HEAD — the snapshot mechanism
(`commit-tree` dangling commit, `refs/pdlc/a6-snapshot-{waveNum}`, no run discriminator) is stated
identically in both documents, so the oracle A6-10 promises still has an upstream decision to be
falsifiable against.

## Dependencies

**Document-level dependency edge.** PLAN's upstream chain is `REQ → FSPEC → TSPEC → DECISIONS →
PLAN`, and the sizing appendix hangs off PLAN (`SIZING`'s own header states
`TSPEC → DECISIONS → PLAN → SIZING`). The erratum tightened that shape rather than disturbing it:
DECISIONS now holds no HEAD measurement at all, PLAN's appendix holds them, and PLAN's Overview
cites the appendix. The direction of compression is still correct — nothing PLAN depends on has
been withdrawn, and nothing new upstream demands a PLAN edit.

**Task-level dependency edges.** Unchanged: A6-00 (⊥) → A6-05/A6-01 → A6-06 → A6-08 → A6-10 →
A6-12 → A6-14 → A6-18 → A6-21, with A6-04 at batch 1 and A6-06 depending on A6-04. `computeWaves`
resolves this to seven waves, ids unique, graph acyclic, every declared dependency resolving — the
same result the dispatcher read at approval. No same-batch same-new-file collision is introduced,
because no file-ownership cell moved.

**What the erratum did *not* foreclose.** No decision entry was edited, so no testing approach the
PROPERTIES document needs is newly closed off; the reversibility ratings ("easy", all four) and the
`ADVISORY_DEFAULTS.enabled = false` default that makes the disabled-tier byte-identity oracle
(A6-21's former-A6-20 red step) possible are untouched. The re-evaluation triggers in
`DEC-A6-01…DEC-A6-04` remain observable in the same way they were when I approved PLAN at v10.

**One routed item lands on PLAN, not on this confirmation's verdict.** DECISIONS v1.9 records PM v9
F-01 — *"asks PLAN to cite the appendix rather than restate column (1)'s count"*. That is a
product-manager finding routed to PLAN's ordinary revision loop; I record its testing-lens
counterpart as F-03 (duplicate carrier of moving figures is the drift generator POSTMORTEM-D §5
names) and note that it is non-gating: PLAN already carries the citation, and its restated integers
reproduce the appendix exactly today.

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

