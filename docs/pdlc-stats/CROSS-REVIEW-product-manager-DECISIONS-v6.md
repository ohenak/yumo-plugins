# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.4, bytes unchanged)
**Upstream re-grounded on:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.3, erratum round 4)
**Date:** 2026-08-31
**Iteration:** 6 (upstream-cascade confirmation)

## Context

This is an **upstream-cascade confirmation**, not a re-review. `DECISIONS-pdlc-stats.md` is
byte-identical to the v1.4 I approved at `42cf8850d` (`CROSS-REVIEW-product-manager-DECISIONS-v5.md`,
*Approved with minor changes*, 0 High / 2 Medium). What moved is TSPEC: my approval recorded
`UPSTREAM-STATE: TSPEC` against the v1.1 blob at `66c4049ac`, and TSPEC has since taken **erratum
rounds 3 and 4** (`3eefae1ef` … `e952268bd`, +170/−59 lines), reaching v1.3 at
`sha256:ad630797…`. REQ (`60a516fb…`) and FSPEC (`0b8864d6…`) are unchanged from my approval, so the
whole cascade surface is TSPEC.

The single question: **is DECISIONS still a faithful compression of TSPEC as it now stands?**

What the two erratum rounds changed in the material DECISIONS leans on:

| TSPEC change (v1.1 → v1.3) | Where | Does DECISIONS lean on it? |
|---|---|---|
| Co-change set restated five → nine → **ten** in-repo sites; `pdlc/README.md`'s prose enumeration added as a **row of the site table** | §2.1, §6.4, §7.3, RK-1 | Yes — DEC-STATS-01's cost is the decision's whole rationale |
| The count is made **derivable**: repo-scoped `git grep -l` on probe `lib/loop-session.mjs` → **24** candidates, one stated filter drops the **14** pure consumers, 24 − 14 = 10 | §2.1 | Yes — K-9 promotes the sweep as a durable constraint |
| `loop-distribution.test.js` row gains an eighth assertion edit (P7-02's `vendoredClassWord` ternary) | §2.1 | Yes — K-8 owns that file |
| `coverageInstrumentation.test.js` row names P9-02's title, six → **seven** | §2.1 | Yes — K-3 owns that pair |
| §6.4 grows five → **seven** oracles; classifier purity is **split by return type** — non-aliasing for the three object-returning classifiers, **A-B-A** for `deriveDodRoundIndex` — plus a construction-site-count oracle | §6.4 | Yes — DEC-STATS-03's named detector and K-4 |
| BR-11 / BR-16 / BR-25 errata closed at FSPEC v1.4 and removed from §8.3 | §4.3, §8.3 | No — DECISIONS routes no BR erratum |
| Option B's row now names `publish-preflight.mjs`'s second copy of the engine `lib/` class | §2.1 table | Partly — DECISIONS already carries this from its own v1.4 |

I re-ran TSPEC's new derivation at HEAD rather than trusting it: `git grep -l "lib/loop-session.mjs"
-- . ':!docs/'` returns **24** files; the 14 the stated filter drops are `bin/cli.mjs`,
`orchestrate-dev.js`, `orchestrate-queue.js`, the generated `workflows/dist/pdlc-cli.mjs` and ten
`loop*`/`loopSession*` test files; the ten that survive are exactly §2.1's rows, `pdlc/README.md`
included. TSPEC's ten is reproducible. DECISIONS' nine is not a different-but-defensible count — it
is the same class measured before the README row was admitted, and DECISIONS states in prose that
the README **is not** a tenth site-table row. That sentence is now a positive contradiction of its
upstream, not a lag.

## Options Considered

Three readings of "does DECISIONS still hold" were available, and the choice between them decides the
verdict, so it is stated rather than assumed.

**Reading 1 — the items landed, so the confirmation passes.** Rejected. The dispatch is explicit that
the item list is necessary, not sufficient (DEC-ERR-03), and nothing in the erratum items was routed
*to* DECISIONS at all: DECISIONS' bytes never moved. If the confirmation only asked "did the routed
edits land in TSPEC", it would pass trivially and let a document whose central number now disagrees
with its upstream stand as approved.

**Reading 2 — the divergences are cosmetic, since the decision does not change.** Rejected, though it
is the tempting one and it is half true. DEC-STATS-01 still chooses option A, DEC-STATS-02 and
DEC-STATS-03 are untouched, and no divergence below flips a verdict. But DECISIONS is not consumed as
a verdict; it is consumed as the **implementation contract** — its K-rows are the task list a PLAN
author partitions and an implementer executes. Two of the divergences below would put wrong
instructions into that contract: a nine-row co-change checklist against a ten-site upstream, and a
purity assertion TSPEC now states reds against a *correct* implementation. A finding an implementer
would act on wrongly is not cosmetic.

**Reading 3 (taken) — measure DECISIONS' citations against TSPEC at HEAD, clause by clause, and
report every place upstream no longer says what DECISIONS says it says.** This is what DEC-ERR-03
asks for. I walked every DECISIONS claim that names a TSPEC section, number, oracle or site, re-read
the corresponding TSPEC text at v1.3, and checked the underlying fact against the tree where the
claim is mechanical.

**Scope discipline.** I did not re-open DEC-STATS-01's chosen option, DEC-STATS-02, DEC-STATS-03's
substance, K-2, K-5, K-6, K-7, the *What these decisions do not decide* section, or the project-level
decisions — all were approved at v5 and none is touched by the TSPEC delta. Findings F-01…F-05 below
are all consequences of the TSPEC edit; F-06 is my own v5 Medium, restated as inherited so it is
visibly still open and visibly non-gating.

**One divergence runs the other way**, and I resolved it toward DECISIONS. TSPEC's new
`coverageInstrumentation.test.js` row says P9-02's title moves "six → seven". At HEAD the title says
`six` while `pkg.c8.include` already holds **seven** entries — the title is stale by one before this
feature starts, so the feature takes it to **eight**. DECISIONS' v1.4 changelog has this right
(`REQUIRED_INCLUDES` … "seven not six today, eight after the feature"), which I verified at v5 and
re-verified here. The repair is owed **upstream**, and DECISIONS must not be "corrected" into
agreement with it (F-05).

## Decision

_pending_

## Consequences

_pending_

## Positive Observations

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
