# Iteration & token-burn analysis — pdlc-consolidation-agent

Date: 2026-08-10 · Author: operator session analysis (Claude Fable 5) · Status: evidence-backed post-hoc accounting

The feature: one workflow module (`consolidate-learnings.js`, ~2,400 lines) plus tests, a hook edit,
and a SKILL. The bill: **84 lifetime review rounds across six documents, 176 cross-review files,
558 commits on the branch, ~12 pipeline invocations on 2026-08-10 alone (~9.5 h wall, ~186 agent
dispatches, ≈half Opus), and five POSTMORTEM episodes.** This document allocates that bill to root
causes with evidence, and ranks what would have cut it.

## 1. The numbers

### Review rounds per document (lifetime, from on-disk `CROSS-REVIEW-*-v{N}` basenames)

| Document | Rounds at code-complete (08-10 morning) | Rounds now | Post-hoc delta |
|---|---|---|---|
| REQ | 17 | **21** | +4 |
| FSPEC | 15 | **18** | +3 |
| TSPEC | 10 | **18** | +8 |
| DECISIONS | 8 | 9 | +1 |
| PLAN | 5 | 9 | +4 |
| PROPERTIES | 4 | 9 | +5 |
| **Total** | **59** | **84** | **+25 (+42 %)** |

**+25 review rounds — roughly 60–75 Opus dispatches — were spent *after* the implementation was
complete and its full gate green.** Not one of them changed a line of production behaviour; they
re-approved documents whose bytes moved.

### Pipeline invocations measured on 2026-08-10 (from run logs)

| Run (start) | Wall | Dispatches (opus/sonnet) | Outcome |
|---|---|---|---|
| 05:46 | 14 m | 10 (0/10) | wave 4 green → wave 5 gate red (real defect: git-state-dependent test) |
| 06:03 | 1 h 55 | 21 (0/21) | **re-ran waves 1–13 from scratch** (ledger cleared) → wave 14 red (real: NUL byte, stale pin) |
| 08:01 | 45 m | 6 (3/3) | waves 14–15 green, Phase I complete → **PT dispatch 30-min timeout** |
| 08:47 | 51 m | 31 (0/31) | **re-ran waves 1–11 from scratch again** → wave 12 red (real: vacuous-green exposure) |
| 15:41 | 1 h 17 | 14 (9/5) | P re-approve, PT ✅, CR iter 1 → **CR optimizer transport fault** |
| 17:08 | 43 m | 4 (3/1) | CR remediation → **CR optimizer transport fault (2nd)** |
| 17:53 | 1 h 28 | 12 (11/1) | CR ✅ (3 iters) → DOD v1 → **DOD remediation 30-min timeout** |
| 19:25 | 1 h 31 | 24 (23/1) | F re-approve (16 rounds), D erratum round, CR ✅ → **DOD budget exhausted on J1 (anchors)** |
| 22:27 | 55 m | 19 (19/0) | T rounds 13–16 spec churn → **PROPERTIES erratum-confirmation split, POSTMORTEM ep. 2** |
| 23:5x (killed) | ~40 m | 24 (24/0) | T→16, P→6, PR→5–8, PLAN v1.8 "erratum 8" — killed by operator |

≈ **186 dispatches (≈93 Opus / 93 Sonnet)** in this session alone, on top of the 08-09 authoring
runs (~59 rounds ≈ 180 Opus dispatches for the original spec stack, plus 34 implementation tasks).

### Commits (branch total: 558)

| Class | Count | Share |
|---|---|---|
| `docs(…)` total | 337 | 60 % |
| — of which `docs(review)` (cross-review records) | 136 | 24 % |
| — of which erratum / anchor / re-pin / citation / re-measure | **104** | **19 %** |
| `feat` + `fix` + `test` | 128 | 23 % |
| `chore` (rebuilds, anchors, queue) | 34 | 6 % |

**One in five commits on this branch exists to move line-number citations or route errata.**

## 2. Attribution — where the burn actually went

### RC-A — The vacuous-green Phase I (the root defect; ~40 % of the session's total burn, and the trigger for everything after)

The wave agents implemented code but systematically failed to un-skip their `describe.skip` test
blocks; wave gates passed on suites whose relevant cases *reported as skipped*. "All 15 waves
complete" was hollow (≈133 skipped tests at peak). Every subsequent re-run, re-review, hand-finish,
and re-verification traces back to this: the re-run T30 agent un-skipped honestly and exposed an
unimplemented driver, which forced the operator hand-finish, which edited documents, which re-opened
approvals (RC-C). *Fixed durably:* the wave-gate un-skip guard (`checkWaveUnskips`,
commit `9c510245`) makes this class a wave-gate failure.

### RC-B — Ledger cleared/rejected on completion (~52 wasted Sonnet dispatches, ~2.8 h wall)

By design, Phase I completion **cleared** the wave ledger AND the resume path **rejected** a
fully-green record ("re-running is safe, skipping the entire phase is not"). Every post-Phase-I halt
re-dispatched all 15 waves over a finished tree: two full re-runs (06:03, 08:47) of mostly-no-op
agent dispatches. *Fixed durably:* complete ledger honoured, Phase I skipped whole
(commit `98b7429e`).

### RC-C — Byte-pinned approvals + `file:line` anchors (the +25-round tail; ~60–75 Opus dispatches)

Approvals pin document *bytes*. Six line-number-only citation fixes (the DOD J1 class: a table
insertion moved `:70-78` to `:70-79`) staled the approvals of four documents and re-opened four
phases. The anchor convention makes this self-sustaining: the corpus carries hundreds of `file:line`
pins across five documents, so *any* edit anywhere moves lines somewhere, and the review bar treats
a stale anchor as a finding. 104 commits are anchor/citation bookkeeping.

The sharpest exhibit is REQ round 20 (`CROSS-REVIEW-software-engineer-REQ-v20.md` F-01): **the
blocking High was manufactured by round 19's own fix** — v19 added a reason code (`corpus-unreadable`)
to close a Medium, which put REQ in breach of the vocabulary set-equality oracle spanning
**13 pinned locations across four files** (REQ ×8, TSPEC ×1, PROPERTIES ×5 — the reviewer enumerated
them). The system's own review then correctly demanded either a five-file pin migration or reverting
the word. This is the no-damping loop in one finding: each round's repair creates the next round's
work, and the oracles are strong enough to always notice.

### RC-D — Multi-layer erratum waves without a synchronization point (2 POSTMORTEM episodes, ~10 rounds)

An erratum raised in one phase routes edits into other documents; the routing list is minted once
while the wave keeps moving. POSTMORTEM-T episode 2 documents the terminal case: a 27-minute
`REQ → FSPEC → TSPEC → PROPERTIES` wave grew a second upstream arm *after* the list was cut; the
tail absorbed its list fully and still shipped a hole; the two confirming reviewers split on
identical bytes (one ran the routed-list check, one re-measured upstream HEAD). PLAN is now at
v1.8 absorbing its **eighth** erratum. *Partially fixed:* DEC-ERR-01/DEC-ERR-03 (dispatch-time
routing lists, superset confirmations) — recorded as decisions, not yet mechanised.

### RC-E — Transport faults and the 30-minute dispatch ceiling (4 lost long dispatches, ~3 repeated phase cycles)

The CR optimizer died mid-dispatch twice (`faultObserved=true`), and PT and the DOD remediation each
hit `timeoutMs=1800000` once — always the *longest, most expensive* Opus dispatches, always leaving
salvageable-but-uncommitted work the operator had to inspect, finish and commit by hand. Each fault
also cost a full re-entry pass (PT re-run + CR round) on the next invocation, ≈15–20 extra Opus
dispatches total.

### RC-F — What was *not* a major cost

The late-round review quality itself held up: sampled late verdicts (TSPEC v18 "Approved", REQ v21
"Approved with minor changes") show phases genuinely converging each time — they were then
*re-opened* by the next edit, not stuck. The reviewers' findings were essentially always real; their
*stakes* fell by roughly an order of magnitude per generation ("main() never implemented" →
"suite self-contradicts" → "anchor one row short" → "one property lacks its second fixture").
The burn was structural, not reviewer incompetence.

## 3. The cost curve (estimate, from dispatch counts)

| Stage | Approx. dispatches | Model mix | Note |
|---|---|---|---|
| Spec authoring + review to code-complete (08-09) | ~180–200 | Opus | 59 rounds × ~3 dispatches |
| Implementation waves (incl. PT), first pass | ~45 | Sonnet | 34 tasks + gates |
| Wave re-runs from ledger design (RC-B) | ~52 | Sonnet | pure waste |
| Post-hoc spec churn (RC-C/RC-D) | ~90–100 | Opus | +25 rounds, erratum + confirmations |
| CR (3 approvals' worth) + DOD (4 rounds) + recovery re-entries (RC-E) | ~55–65 | Opus | includes re-passes after faults |

Roughly: **of all Opus spend, ~55 % pre-code spec review, ~30 % post-code churn, ~15 % CR/DOD** —
and nearly all of the post-code 30 % plus the Sonnet re-run waste was avoidable in hindsight.

## 4. Ranked recommendations (highest leverage first)

1. **Semantic approval staleness** *(not yet done — biggest structural lever)*: a citation/anchor-only
   edit (line numbers, changelog prose) must not stale a recorded approval. Either compute the
   approval hash over a normalized form (strip `:NNN` anchors and changelog blocks) or give the
   pipeline an "editorial edit" commit class that re-anchors without re-opening the window. This
   single change would have removed most of the +25-round tail.
2. **Lifetime round cap (15) with accept-and-move-forward** *(operator-decided; being implemented)*:
   the backstop that bounds any remaining loop regardless of cause.
3. **Retire `file:line` anchors as a document convention** *(partially done)*: the J1 closure's
   pattern — measure the anchor at run time in a test, cite content not line numbers in prose — is
   the model. 104 commits of pin-shuffling argue this is not a style preference.
4. **Decision freeze as a first-class loop mode** *(exists as postmortem practice only)*: after
   round N (or after CR approval), rounds may decide nothing new — findings file as Low/deferred.
   Measurably worked when Phase F imposed it ad hoc; should be a flag the loop enforces in reviewer
   prompts, not a paragraph an author remembers to write.
5. **Un-skip guard** *(done, `9c510245`)* — kills RC-A's class at the wave gate.
6. **Honour the complete wave ledger / skip Phase I whole** *(done, `98b7429e`)* — kills RC-B.
7. **Dispatch-time erratum routing lists + superset confirmations** *(recorded as DEC-ERR-03;
   mechanise it)* — kills RC-D's terminal case.
8. **Transport resilience** *(not done)*: one automatic retry for a faulted optimizer/remediation
   dispatch before halting, and a chunked remediation protocol so no single dispatch needs 30
   minutes. Four of this session's ten halts were transport, not substance.
