# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` (v1.0)
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** testability, edge-case completeness, oracle falsifiability, and acceptance-test coverage of the FSPEC and its 68-test acceptance matrix. Every existing-behaviour claim (§2's B-1…B-16) re-verified at the pinned default-branch commit `26c3f1c`. Not product strategy, not architecture, not module placement.

## Verification Log

Every §2 baseline row re-read at `26c3f1c` (`git rev-parse main` → `26c3f1c5d68f…`, the commit REQ
BL-02 pins). `dev` = `pdlc/workflows/orchestrate-dev.js`, `queue` = `pdlc/workflows/orchestrate-queue.js`.

| Baseline | Checked at | Result |
|---|---|---|
| B-1 — three triage verdicts; `blocked` and `needs-human` both skip | `queue:653-668` (`triagePrompt` emits exactly `ready` / `blocked` / `needs-human`), `queue:907-921` (both branches `emit` + `skipped.push` + `continue`) | Confirmed |
| B-2 — pre-check one-sided | `queue:631-649`: `{blocked:true}` only for `match && match.status !== "done"`; comment at `:646` *"Dependency done, or not in the queue at all → inconclusive here; defer to triage"* | Confirmed |
| B-3 — no re-grounding obligation in the triage prompt | `queue:656-666`: the only staleness-adjacent line is `Also flag if the REQ references subsystems that do not yet exist` | Confirmed |
| B-4 — DoD capped at 3, third failing verify returns without remediating | `dev:25` (`DOD_MAX_ITERATIONS = 3`), `dev:6164`, `dev:6190-6191` (`if (iteration === maxIterations) return {passed:false,…}`) | Confirmed |
| B-5 — not-passed records ❌ and halts with finding counts | `dev:8179-8188` (`recordPhase("DOD",…"❌"…)` then `throw haltError(…)` with the stub/mock/unwired/coverage/req_gaps detail) | Confirmed |
| B-6 — step-0 rebase conflict records ❌ and halts, branch unchanged | `dev:8161-8172` (`if (rebaseStatus === "conflict") { recordPhase(…"❌"…); throw haltError(…) }`) | Confirmed |
| B-7 — PUB rollup: passed→success, failed→halt, completion cap halts, no-checks→pass | `dev:6250-6286`, all four arms present; `return { prUrl, ciStatus: "no-checks" }` at `:6284` | Confirmed |
| B-8 — the no-checks pass is reported on the phase row | `dev:8267-8271`, literal `no GHA checks detected within timeout (assumed none configured)` | Confirmed |
| B-9 — CI read mechanically, no agent in the loop | `dev:5812-5824` (`checkPrCi` shells `gh pr view … --json statusCheckRollup`), `dev:6245-6250` (script owns cadence) | Confirmed |
| B-10 — one constant per rung, all bare aliases | `dev:1578` `MODEL_DEFAULT = "opus"`, `dev:1621` `MODEL_IMPLEMENTATION = "sonnet"`, `queue:69` `MODEL_QUEUE = "sonnet"` | Confirmed |
| B-11 — named top-level sections, independently parsed, degrading to own defaults | `dev:43` (`MERGE_CONFIG_PATH`), `dev:101-152` (`parseMergeConfig` returns `MERGE_DEFAULTS` on null/unparseable), `dev:181-200` (`parseImplementationConfig`, its own `degraded()`) | Confirmed |
| B-12 — no tracked `.claude/pdlc.config.json`; the working-tree copy has an `implementation` section only | `git ls-tree 26c3f1c .claude/` → empty; working tree file carries `implementation` only, no `merge` | Confirmed |
| B-13 — `notices` channel; merge escalations under a frozen prefix carrying `ESCALATION:` | `dev:1319-1328` (`MERGE_ESCALATIONS` frozen, all four literals begin `MERGE ESCALATION:`), `dev:8291-8292`, `dev:8395`, `dev:8402` | Confirmed |
| B-14 — guard matches only `CROSS-REVIEW` / `CODE_REVIEW`, refuses without a sibling `LEARNINGS-*.md` | `guard-harvest-before-delete.sh:35` (token gate), `:43` (token regex), `:52-59` (`glob(… "LEARNINGS-*.md")` → `blocked`) | Confirmed |
| B-15 — tail order DOD → H → PUB → MERGE | `dev:8151`, `:8192`, `:8248`, `:8274` — the four phase banners in that order | Confirmed |
| B-16 — `docs/_queue/` holds `QUEUE.md` only | `ls docs/_queue/` | Confirmed |
| §14.3 — the traceability matrix it defers to exists | `docs/requirements/traceability-matrix.md` | Confirmed (present) |

One new code observation, which F-01 rests on: at `queue:890-897` a blocked pre-check `continue`s
**before** the triage dispatch at `queue:900-903`. A `needs-human` verdict therefore cannot coexist
with a blocked pre-check on the production path.

## Findings

Twelve findings: three High, five Medium, four Low. The Highs are all of one shape — an enumerated
contract or an invariant that the acceptance matrix cannot falsify — which is the shape this
document is otherwise unusually good at avoiding.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **T-04-3's fixture is unreachable on the production path, so the test can only pass — a precedence-chain false green.** The test reads "*Given* the dependency pre-check reports a candidate blocked · *When* an A1 verdict of `run-candidate` is returned for it · *Then* the candidate is not run and the seam escalates." But at `26c3f1c:pdlc/workflows/orchestrate-queue.js:890-897` a blocked pre-check does `emit` → `skipped.push` → `continue`, **before** the triage dispatch at `:900-903`. A `needs-human` verdict — A1's own trigger (§6.2) — therefore cannot exist for a candidate the pre-check reports blocked. The fixture cannot defeat the earlier branch, so at the workflow level the test is unwritable and at the unit level it asserts a state the composition root never produces. The same defect propagates to §5.4's A1 gate row and §6.3 A1-2: the "gate that re-runs" ran before the seam fired, A1-4 says A1 changes no file, so its inputs are unchanged and the re-run returns not-blocked for the reason it did the first time. (This is the residual of REQ finding F-21, still open there; what makes it an FSPEC-level High is that the FSPEC turns it into a named acceptance test.) **Resolution:** state in §5.4 that A1 has **no independent post-action gate** and that A1's safety rests on A1-3's escalate-when-unsettled rule; replace T-04-3 with (a) a reachable integration assertion — a blocked pre-check yields a skip and **no advisory invocation at all** (positive: `invocations == 0` for A1 in the summary) — and (b) an explicitly unit-scoped guard test on the adjudicator, labelled as a defence-in-depth assertion over a state the pipeline cannot reach. | §5.4 (A1 row), §6.3 A1-2, §6.6 T-04-3 |
| F-02 | High | Local | **No set-equality test pins the envelope enumeration or the exclusion set; every envelope test is containment-shaped.** T-03-5 supplies set-equality for the eight refusal reasons and §18.2 correctly names it as the companion to the for-each tests — but the same discipline is absent for the two enumerations that decide what the tier may *do*. Nothing in T-01…T-10 compares the shipped permitted-action set with §5.2's {E-1, E-2, E-3, E-4}, so a fifth permitted action added later passes all 68 tests. The exclusion set fares worse: X-a is quantified by T-03-3, X-c is exercised by T-06-4, X-b is reachable through T-03-6/P-1 — but **X-d (declared scope) and X-e (self-modification guard paths) have no acceptance test at all**, and X-e is the exclusion that keeps the tier from editing `pdlc/workflows/` in this very repo. **Resolution:** add (i) a set-equality test over the shipped permitted-action set against §5.2 in the manner of T-03-5, (ii) a set-equality test over {X-a…X-e}, and (iii) one behavioural test each for X-d and X-e — for X-e, a proposed diff under a guard path is reverted whole with reason `out-of-envelope` and the guarded file is byte-identical afterwards. | §5.2, §5.5, §18.2 |
| F-03 | High | Local | **§4.3 V-7 declares exactly two terminal dispositions, and five edge-case rows introduce a third — leaving the summary's counts under-determined.** V-7: "Every terminal disposition is exactly one of `resolved` or `escalated`. There is no third outcome." Yet §4.4 ("recorded as an invocation with no action"), §6.5 ("records 'no drift found', which is an invocation with no action, **not a resolution**"), §8.3 ("records 'condition gone'"), §9.3 ("records 'condition gone'") and §10.1 R-4 ("invocations that took no action are recorded too") all describe an invocation that is neither. §10.3 S-1's summary carries three counters — invocations, resolved, escalated — with no bucket for the fourth kind, so a test author writing T-08-6's expected counts (or §12.2's "five zero rows") cannot transcribe a literal: is a condition-gone invocation counted in `invocations` while appearing in neither `resolved` nor `escalated`, making `invocations ≠ resolved + escalated`? **Resolution:** either name the third disposition (`no-action`) in V-7, give it a summary counter and state the arithmetic identity the summary must satisfy, or fold it into `escalated` explicitly. Then add a test pinning the identity — a run with one condition-gone invocation, asserting each of the three (or four) counters by literal value. | §4.3 V-7, §4.4, §6.5, §8.3, §9.3, §10.1 R-4, §10.3 S-1 |
| F-04 | Medium | Local | **The rung is resolved lazily in §3.2 and eagerly in §15.2, and the two give opposite outcomes for a constructible run.** §3.2's flow is "evaluated **at the first advisory dispatch** of a run"; §3.3's second row assumes the same ("Tier enabled but no seam fires … the summary … names the rung as *not exercised*"). §15.2's run-level diagram instead resolves the rung immediately after the config read, before "pipeline proceeds", and routes "neither rung resolves" to "the run fails loudly" at that point — even though §15 claims to "state no new rule". The distinguishing run is easy to build and is not tested: tier enabled, neither rung resolves, **no seam condition arises**. Lazy → the run completes normally with a five-zero summary (T-10-5's shape); eager → the run fails with a model-resolution error. T-01-4 pins only the seam-fires case. **Resolution:** pick one, make §15.2 cite §3.2 rather than restate it, and add the missing test with the chosen literal outcome. | §3.2, §3.3, §15.2, §3.4 T-01-4 |
| F-05 | Medium | Local | **The refusal ladder still does not say what its triggers are evaluated *against*, and §4.4 now answers it one way while §9.2/§9.4 leave the flagship path blank.** §5.3 says only "Triggers can co-occur, so the set is ordered and the first match wins". §4.4's malformed row resolves a budget-exhaustion case in favour of the **earlier** row: "consumes an attempt; if the budget remains, retry, else escalate with `malformed-verdict`" — i.e. row 6 beats row 8 when the budget is what ended the invocation. Apply that same rule to A5 and an exhausted fix→push→re-poll cycle (A5-3), each attempt of which failed its post-action gate, must report `post-action-verification-failed` (row 4) — but REQ AC-2.4/NFR-4 and T-02-5 both plainly intend `budget-exhausted`. T-07-6, the most-exercised A5 test, names no reason at all, which is where the ambiguity is visible. T-02-6 quantifies over *every* reason in §5.3 and therefore cannot be written until this is decided. **Resolution:** one sentence above §5.3's table fixing the domain — a trigger matches the condition on which the invocation **terminates**, not conditions encountered earlier in it — then re-state §4.4's malformed row consistently and put the expected reason literal into T-07-6. (Reproduces REQ F-22, but the FSPEC compounds it by adding a worked case that points the other way.) | §5.3, §4.4, §9.2 A5-3, §9.4 T-07-6, §4.5 T-02-6 |

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
