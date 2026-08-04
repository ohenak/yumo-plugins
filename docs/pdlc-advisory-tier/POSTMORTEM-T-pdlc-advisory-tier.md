# POSTMORTEM — Phase T (erratum channel to FSPEC) — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | `TSPEC-pdlc-advisory-tier.md` (v1, HEAD `ae55f25`) → **POSTMORTEM-T** |
| Downstream | `LEARNINGS-pdlc-advisory-tier.md`, `docs/_queue/QUEUE.md` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v4.md` (the erratum delta-confirmation round) |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |
| Author | se-author (Claude) |
| Date | 2026-08-03 |
| Version | 1.0 |
| Scope | Non-convergence of the FSPEC **erratum** delta-confirmation dispatched from Phase T. Not a re-review of the TSPEC or FSPEC; not a technical-design record. |

---

## Phase

**Phase T — TSPEC authoring and cross-review**, feature `pdlc-advisory-tier`, branch
`feat-pdlc-advisory-tier`. The halt is not in the TSPEC review loop itself — that loop **converged**:
pm-review, se-review and te-review all approved TSPEC v3 (`5f280c5`, `b5b9708`, and the pm/te/se v3
files). The halt is in the **erratum channel** Phase T opened against the *upstream* FSPEC.

While authoring the TSPEC, the author found what looked like four defects in
`FSPEC-pdlc-advisory-tier.md` and — per the erratum protocol (CLAUDE.md, "Errata are a first-class
signal") — emitted `ERRATUM: FSPEC: …` lines rather than editing the FSPEC or mis-filing the findings
in the TSPEC. After the phase converged, the orchestrator routed those errata to the FSPEC's author,
who applied a single targeted versioned edit (commit `3bbf934`, FSPEC v1.2 → v1.3), and then
dispatched the FSPEC's own two approvers — se-review and te-review — to write the **delta-confirmation**
as the next append-only cross-review round (`-v4`).

That confirmation did not pass. Per the bounded rule — **one erratum round per upstream doc per
phase** (CLAUDE.md, "Bounded: … a failed confirmation … halts to the current phase's POSTMORTEM") —
Phase T halts here rather than opening a second erratum round.

The single most important fact in this document: **two of the four erratum items were false.** They
rest on the premise that default-branch commit `26c3f1c` *predates* Phase PUB's file-creating code
`raisePrAndVerifyCi`. It does not — `26c3f1c` already carries it. The confirmation reviewer's own
grounding discipline caught this, withdrew the erratum, and refused the edit that acted on it. The halt
is therefore the protocol working, not misfiring: it stopped a regression from landing on the FSPEC.
This is developed in Root Cause 1.

## Iterations

The erratum channel ran its **one** permitted round: one FSPEC edit, one dual delta-confirmation.

| Step | Actor | Commit | Result |
|---|---|---|---|
| Errata emitted | se-author (Phase T) | — | 4 items routed against FSPEC: two D-6 (created-file baseline), one A2-6/R-2 (ordering), one C-2 (degraded-key report) |
| Targeted edit | se-author (FSPEC owner) | `3bbf934` — "erratum round — decouple D-6 baseline citation pin, decide A2 record/commit order, gate C-2 report on enabled" (v1.2 → v1.3) | 3 regions touched: §3.2/§5 C-2, §4.1 step-order, §12.1 D-6 / §12.2 T-10-3 |
| Confirmation — se-review | se-review (`-v4`) | `f3b9a94`/`90bb82f`/`f1e9b8f` | **Approved minor changes** — `{high:0, medium:0, low:0}` |
| Confirmation — te-review | te-review (`-v4`) | `ae55f25` | **Needs revision** — `{high:1, medium:0, low:0}`, F-01 High |

The routed erratum items, verbatim, and their fate in the confirmation:

| # | Item (as routed) | Confirmation verdict |
|---|---|---|
| 1 | D-6 pins the disabled-run created-file baseline to `26c3f1c`, which "predates" `raisePrAndVerifyCi`/Phase PUB, so a branch-HEAD disabled run is compared against a stale literal; baseline should be the pre-feature branch tip | **Premise disproved** — not a defect |
| 2 | D-6 (se-author variant of the same claim) | **Premise disproved** — same false "predates" claim |
| 3 | A2-6 (re-grounding durable before invocation end) vs R-2 (failed record write un-takes the action) — FSPEC never reconciles the ordering | **Resolved** (both reviewers) |
| 4 | C-2 unconditionally reports a degraded config key, contradicting D-5/S-4/T-10-4's "a disabled run carries no advisory content" | **Resolved** (both reviewers) |

So the round is **2-of-4 sound, 2-of-4 false-premise**. The two sound errata (items 3, 4) were applied
correctly and both reviewers confirm them. The two D-6 errata (items 1, 2) share one false factual
premise; the edit that acted on them replaced a *correct* baseline (`26c3f1c`) with a fork-point
baseline on a reversed, unverified rationale, and te-review's grounding check caught it.

**A note on the halt roster.** The dispatching orchestrator recorded non-approving `[se-review,
te-review]`. On disk only **te-review** blocks: its `VERDICT: Needs revision` carries the lone High.
se-review's `-v4` verdict is `VERDICT: Approved minor changes`, which is an **accepted approval token**
(`orchestrate-dev.js:3513` — `verdict === "Approved" || verdict === "Approved minor changes"`), so the
confirmation is non-unanimous, not doubly-refused. The distinction matters for the Recommendation: only
the D-6 half needs another turn; se-review's approval of the whole edit stands and need not be re-run.

## Reviewers

| Role | Skill | Lens in the delta-confirmation | `-v4` verdict |
|---|---|---|---|
| Software Engineer | `pdlc:se-review` | Does the delta resolve the four routed items at FSPEC altitude without pulling an implementation contract up, and without regressing anything approved at v3? | **Approved minor changes** (`{0,0,0}`) |
| Test Engineer | `pdlc:te-review` | Same delta question, plus the skill's standing obligation: **every "X does / does not exist at commit C" claim is verified against the git object, not the prose** | **Needs revision** (`{1,0,0}`) |

Both reviewers scoped strictly to the erratum delta (`git diff 502c070 HEAD -- FSPEC…`, the single
commit `3bbf934`), did not re-litigate sections the edit did not touch, and both opened with a
disposition table for the four routed items — the round-2+ delta discipline the review loop mandates.

They **agree** on three of the four items:

- Item 3 (A2-6/R-2 ordering) — **both resolved.** §4.1's step-7 paragraph now names A2 alongside A5 as
  a seam whose action is made durable through git, so R-2 governs A2 on the same revert-before-durable
  terms it governs A5; consistent with §6.4 A2-6 (`FSPEC:454`) and R-2 (`FSPEC:690`). The apply/verifyGate
  split that the routed item flagged as unreconciled lives TSPEC-side (§4.4, `TSPEC:404`/`TSPEC:430`) and
  was correctly *not* pulled up into the FSPEC.
- Item 4 (C-2 vs D-5/S-4/T-10-4) — **both resolved.** §5 C-2 (`FSPEC:145`) now gates the substitution
  notice on the resolved config leaving the tier *enabled*; a malformed `advisory.enabled` resolves the
  tier disabled and carries no advisory content, matching D-5 (`FSPEC:834`), S-4 (`FSPEC:718`) and
  T-10-4 (`FSPEC:856`). The emit-side suppression the routed item pointed at (TSPEC §3.2) is honoured.

They **diverge** only on the D-6 pair — and the divergence is not between the two reviewers over a
judgement call. se-review accepted the D-6 edit as a plausible FSPEC-altitude clarification without
re-running the underlying `git grep`; te-review ran it, found the premise false, and blocked. The
disagreement is between the edit and the repository, surfaced by the one reviewer whose skill requires
it to check.

## Pattern of Disagreement

<!-- body -->

## Best-Guess Root Cause

<!-- body -->

## Recommendation

<!-- body -->
