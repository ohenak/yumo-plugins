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

Everything below was **run**, not read, at HEAD of `feat-pdlc-advisory-wave-gate`.

| Claim | Command / oracle | Result |
|---|---|---|
| Upstream at dispatch hashes | `shasum -a 256` over REQ/FSPEC/TSPEC/DECISIONS | All four reproduce the dispatch hashes; DECISIONS is the only one moved since v11 (`25f8e954…` → `84deee10…`) |
| Erratum extent | `git show 8a44b84b -- DECISIONS` | +20/-3, confined to the Cross-Reviews cell, the version row, one word in the v1.8 paragraph, and a new v1.9 paragraph. No decision entry, no `## Consequences` bullet touched |
| PLAN bytes frozen | `git log -- PLAN` | Unchanged since `b902f40b` (my v11 REVIEWED-COMMIT interval) |
| *"DECISIONS now keeps only column (1)'s four"* | grep over DECISIONS at HEAD | **Holds** — `four` survives in `What follows for the whole feature`; `twelve` / `twenty-five` appear nowhere as current claims |
| PLAN's three-column figures vs the appendix | grep over `SIZING-pdlc-advisory-wave-gate.md` | Exact match: column (1) **four**, column (2) **twelve** (= **ten** oracles + **two** green inputs), column (3) **twenty-five** |
| Dispatcher contract | shipped `parsePlanTasks` / `parsePlanOwnership` / `computeWaves` over PLAN | **11 tasks, 11 manifest rows, 7 waves** — identical to v10 and v11 |
| Closable numerator | `git ls-files \| grep -c '\.bak$'` | **14** tracked `.bak` blobs, all 14 present in the residual — A6-00 Edit 1's *"closes 14"* still holds and still cannot be false-greened by a no-op |
| Residual size | `npx jest __tests__/documentOracles.test.js -t "unfiltered sweep"` | **35** paths: **14** `.bak` + **4** consumer-runtime + **17** feature documents. PLAN prints `28` and class 3 `10` (**F-01**) |
| Class-2 set-equality leg | same oracle's printed residual | Exactly the four named artifacts (`.pdlc-drift-state.json`, both `.bundle.js`, `pdlc-cli.mjs`); `.pdlc-sync-manifest.json` still correctly absent — DoD's set-equality leg passes for the right reason |
| Class-3 membership leg | same oracle's printed residual | All 17 under `docs/pdlc-advisory-wave-gate/**`, none a `.bak` blob — the round-9 membership predicate I approved in v10 still holds, and is exactly what keeps day-scale growth (34 → 35 since v11) non-gating |
| T21 still green | `documentOracles.test.js` T21 | Green at HEAD; the anchored spelling in wave 1's recap remains a live red risk (**F-02**) |

**Why the residual drift is still Medium, not High.** The DoD's falsifiability rests on the two
class-scoped legs, not on the printed integer: set-equality on class 2 (a closed set of four, exactly
reproduced today) and a *membership* predicate on class 3 (a set the pipeline is designed to grow).
Both pass at 35 exactly as they passed at 28 and at 34. The stale integer misleads a reader; it does
not false-green or false-red a gate. It has now drifted on two consecutive confirmations, which is
why the fix I proposed in v11 — restate class 3 as `10 + one per committed cross-review file` (PLAN's
own growth rule, already written two paragraphs below) rather than as a dated integer — is the one
that stops it recurring.

**Mutation spot-check on the load-bearing oracle.** A6-00 Edit 1's claim is that the `.bak` class is
closable here. Reverting the guarded behaviour — leaving the 14 blobs tracked — leaves all 14 in the
printed residual, so the step's effect is an observable 14-path reduction and a no-op edit cannot
false-green it. The complementary claim (the other classes are *not* closable on this branch) is
likewise still true: the 4 branch-introduced runtime artifacts and the 17 feature documents remain,
and the document class provably mints a new member on every committed cross-review file — including
this one.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | PLAN's Overview HEAD-drift note prints `28` residual paths and class 3 `10`, "measured 2026-08-19". Re-running `PROP-SWEEP-2(b)` at HEAD returns **35**, partitioned **14 / 4 / 17** — the figure has now drifted on two consecutive confirmations (28 → 34 → 35) because the document class grows by one per committed cross-review file, this one included. Non-gating: the DoD's two class-scoped legs (set-equality on class 2, membership on class 3) both pass at 35 for the right reason. Fix: restate class 3 as `10 + one per committed cross-review file since 2026-08-19` — PLAN's own growth rule, already written two paragraphs below — and drop the dated total, which is wrong on every day but the one it was written. The 14-closable numerator is unaffected and needs no change. | Overview → HEAD-drift note, three-class partition |
| F-02 | Medium | Local | The wave-1 *(specifics)* gate recap still narrates *"the same step adds `.claude/workflows/.pdlc-backups/` to `.gitignore`"* — the anchored literal A6-00's Edit 1 explicitly retires (*"that exact literal, not an anchored path"*), because `documentOracles.test.js`'s T21 asserts `not.toEqual(expect.stringContaining(".claude/workflows/"))` and is **green at HEAD**. Four sites carry the bare `.pdlc-backups/` rule with its T21 rationale; this fifth contradicts them. An implementer who works from the recap reddens a currently-passing oracle and the wave gate surfaces it as drift. Sweep the recap to the bare literal. Inherited (v1.8's rule flip left this one narration unswept) and unchanged by this erratum. | Batches → wave 1 (specifics), inherited-red paragraph |
| F-03 | Low | Process | DECISIONS v1.9 now states that `SIZING-pdlc-advisory-wave-gate.md` *"remains the sole carrier of that number"* and that DECISIONS *"deliberately restates none of them"*, and records PM v9 F-01 asking PLAN to cite the appendix rather than restate column (1)'s count. PLAN's Overview still prints all of them inline — four, twelve (ten + two), twenty-five. Every integer reproduces the appendix today, so nothing is false; but PLAN is now the second carrier of figures upstream has just declared single-carrier, which is the drift generator POSTMORTEM-D §5 names and the reason the block was relocated in the first place. Fix in PLAN's ordinary loop: keep the appendix citation and the qualitative shape ("gate-demanded edits / already-migrated sites / ungated prose"), drop the integers, keep the *"Re-measure it, do not carry it forward"* instruction that already follows. Tagged Process as well as PLAN-local: this is the fourth round in which a duplicated count between two documents produced a finding. | Overview → three-column paragraph ↔ DECISIONS `What follows for the whole feature` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None. F-01, F-02 and F-03 each have a single obvious fix already written elsewhere in PLAN or in the appendix; none needs an author decision. |

## Positive Observations

- **The erratum shrank upstream's claim surface and PLAN survived it unchanged.** v1.9 removed the
  last HEAD measurement from DECISIONS. Nothing PLAN cites went with it: the relocation account, the
  *"column (1)'s four"* sentence and all four `DEC-A6-0x` entries are byte-identical, so the
  compression PLAN performs still has the same upstream text underneath it.
- **The design citations inside task rows are the ones that matter, and none moved.** A6-10's
  snapshot mechanism (`DEC-A6-01`, `DEC-A6-03`) and A6-21's promotion-commit message form
  (`DEC-A6-02`) are stated identically in both documents, so the red steps those rows promise remain
  falsifiable against a live upstream decision rather than a withdrawn one.
- **The class-split DoD keeps absorbing growth without a false green or a false red.** The residual
  moved 34 → 35 between confirmations purely because a cross-review file was committed. Set-equality
  on the closed class still holds exactly; membership on the growing class still holds. That is the
  round-9 fix earning its keep for the second time.
- **The 14-closable numerator is exact and mutation-checked.** `git ls-files` returns 14 tracked
  `.bak` blobs and the oracle prints all 14 in the residual, so A6-00 Edit 1 produces an observable
  14-path reduction and cannot be satisfied by a no-op.
- **The dispatcher reads what it read at approval.** The shipped parser returns 11 tasks, 11
  manifest rows and 7 waves over the unmodified document — the machine-level contract this
  confirmation exists to protect is intact.

## Recommendation

**Approved with minor changes**

PLAN still holds as approved against DECISIONS as it now stands. The erratum was a
measurement-removal and a bookkeeping update: it contradicts nothing in PLAN, forecloses no task,
withdraws no decision PLAN cites, and moves no batch, wave, dependency edge or ownership cell — the
shipped parser reads the same 11 tasks, 11 manifest rows and 7 waves it read at approval. Three
non-gating findings: two inherited (the dated residual figures no longer reproduce, F-01; one recap
still spells the retired anchored `.gitignore` literal, F-02) and one created by the delta's
ownership statement (PLAN is now a second carrier of figures upstream declares single-carrier, F-03).
All three fixes are already written elsewhere in PLAN or its appendix and touch no task row.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48
APPROVAL-HASH-NORMALIZED: sha256:852d84755e8643c5312d58baa778e50476c118744f019850e6389c92cef38c69
REVIEWED-COMMIT: 570fbe11cd8261478dd62735d3f99c0da2f450e2
UPSTREAM-STATE: REQ sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:1531143c923857242241c61a35d43fc9677e152d6cca1162533778bb0c30c004
UPSTREAM-STATE: DECISIONS sha256:84deee10d5c5743a60ac0279bf3135f67e1430d4e9976176f6b2691adf5833dc
