# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** REQ (phase R), testing lens only. Delta re-review against
`CROSS-REVIEW-test-engineer-REQ-v1.md`, over `git diff 7b2c3879..HEAD` on the REQ
(207 insertions, 47 deletions). Unchanged sections not re-litigated.

## Delta Verification — v1 findings

Verified at HEAD `8ac7374b` on `feat-pdlc-advisory-wave-gate`. Every new shipped-behaviour claim
the revision leans on was re-measured in code, not taken from the baseline file's prose.

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-3.2 now states the guard paths bind A6 unchanged and names the consequence (the 2026-08-09 incident would today escalate `out-of-envelope`). Grounded: the advisory gate context is built once, for every seam, with `guardPaths: effectiveGuardPaths(undefined)` (`pdlc/workflows/orchestrate-dev.js:3500`), and exclusion `X-e` runs that set through Phase MERGE's own matcher (`:2421`, `guardVerdict` `:959-963`, `MERGE_GUARD_DEFAULTS` `:48`). `pdlc/workflows/consolidate-learnings.js` matches by prefix. One oracle now, not two. |
| F-02 | High | **Resolved** | AC-2.2 adds the receiving-side rule: a classification absent or outside the set reads as `unclassified`, which authorises nothing, escalates, and consumes no attempt (an attempt being one repair→re-gate cycle). Total and testable. See F-03 below for the one residual reading. |
| F-04 | High | **Resolved** | BL-06 and R-5 now enumerate three transcribed surfaces, not one — `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS` — and name the disabled-tier fixtures explicitly. Confirmed the fixture case is real: `advisoryDisabled.test.js:620` asserts `rows` `toHaveLength(5)`, which a sixth seam reds. |
| F-03 | Medium | **Resolved** | AC-2.4 now says only resolutions consume wave budget, and states both oracles a test must separate (two escalated waves leave budget untouched; one resolved wave exhausts the shipped default `1`). C-2's default moved `2` → `1` consistently in C-2, R-3 and Q-1. |
| F-05 | Medium | **Resolved** | NFR-2 now carries the positive conjunct: the advisory summary key is **absent/undefined**, not a six-row all-zero summary. Matches shipped behaviour — `expect(result.advisory).toBeUndefined()` when disabled vs. five zero rows when enabled-but-quiet (`advisoryDisabled.test.js:603`, `:620`). |
| F-06 | Medium | **Resolved** | AC-1.5 now specifies a cardinality on a named surface — exactly one inapplicability notice per run, naming which of BL-03/BL-04 was absent, and none in a run where A6 applies (negative paired with positive). The BL-04 half is grounded: the shipped degradation notice is emitted once per run, naming the missing halves (`orchestrate-dev.js:14144-14152`). |
| F-07 | Medium | **Partly resolved** | AC-4.4 now defines the re-gate as the wave's whole gate sequence in shipped order, and adds a runtime observation. Order claim verified: post-wave command at `orchestrate-dev.js:14347-14357` runs before the test gate at `:14361`. The oracle itself is still weaker than the clause — see F-01 below. |
| F-08 | Low | **Resolved** | AC-5.1 now routes the restoration mechanism to O-1. |
| F-09 | Low | **Resolved** | AC-2.3 now distinguishes the full captured gate output A6 receives from the truncated tail the halt message shows a human, so the criterion is satisfiable on a long suite. |

Also re-measured for the new material: AC-3.4's "no ninth refusal reason" holds — the shipped
escalation entry renders `| Refusal reason | ${reason ?? "n/a"} |` (`orchestrate-dev.js:3044-3070`),
so a diagnosis-only outcome needs no new member. AC-4.6/O-8's premise holds — the per-wave commit
loop commits `task.files` for tasks **in that wave** only (`:14400-14415`), so a repair inside a
later wave's owned paths would indeed be left uncommitted. Every cited path exists:
`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (AC-1.6, AC-2.3 present),
`docs/completed/pdlc-consolidation-agent/`, `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | AC-4.4's stated oracle is containment-shaped and cannot falsify the exact failure mode the AC's own prose names. The normative clause is right — the wave's *whole* gate sequence re-runs, post-wave command then test command, in the shipped order (verified: `orchestrate-dev.js:14347-14357` then `:14361`). But the observation offered is "the configured command transport is invoked again for that wave — the test command at least twice in total, the last invocation green". A run that re-invokes only the test command and never the post-wave build satisfies that oracle exactly, which is the "source-touching repair re-reds on its own unbuilt outputs" case the clause exists to forbid. Make the observable the **ordered sequence** of configured gate-command invocations for the wave, set-equal to the shipped sequence repeated once per attempt (e.g. `[postWave, test, postWave, test]` where both are configured, `[test, test]` where only the test command is), rather than a floor on one command's count. Same shape as AC-1.5's cardinality fix, applied here. | AC-4.4, AC-4.1, M-WG-2, M-WG-3 |
| F-02 | Medium | Cross-Feature | The REQ's global baseline citation is pinned to a version that does not contain the facts this round added. §1 reads "Measured facts about the gate live in `docs/_constraints/pdlc-wave-gate-baseline.md` v1.0, cited here by id" (`REQ-pdlc-advisory-wave-gate.md:60`), but the baseline is now `Version 1.1 · 2026-08-18` (`pdlc-wave-gate-baseline.md:7`) and M-WG-9…M-WG-12 — carrying AC-3.2, AC-3.4, AC-4.6 and BL-06 this round — exist only at v1.1. The v1.4 changelog itself cites v1.1 (`:27`), so the document disagrees with itself. The baseline's own change-control rule is explicit that "a consumer cites this file **at its `Version`**" (`pdlc-wave-gate-baseline.md:14`); §9's second citation (`:213`) carries no version at all. This is a verification defect, not a nit: a downstream test author or reviewer resolving M-WG-10 at the cited v1.0 finds nothing, and the version pin is the only mechanism that makes baseline drift detectable. Bump `:60` to v1.1 and give `:213` a version. | §1, §9, BL-06 |
| F-03 | Low | Local | AC-2.1 and AC-2.2 need an explicit specific-over-general reading for one input. AC-2.1 says A6's verdict carries "no field added or removed except the classification of AC-2.2" and defers malformedness to the tier, whose definition is only "malformed or unparseable" with no enumeration of required fields (`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md:112-113`). AC-2.2 then says an **absent** classification reads as `unclassified` and consumes no attempt. A test author writing the "verdict with no classification field" case can reach either outcome by reading order: escalation-consuming-an-attempt (AC-2.1 via the tier) or escalation-consuming-nothing (AC-2.2). AC-2.2 is the more specific rule and plainly intends to win; one half-sentence in AC-2.1 saying so ("the classification is optional on the wire; its absence is AC-2.2's business, not malformedness") closes it without touching either contract. | AC-2.1, AC-2.2, C-3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Under F-01: where only `implementation.testCommand` is configured and no post-wave command exists, is the intended re-gate observation `[test, test]` exactly, or is a single re-invocation of a *composite* operator command acceptable as "the whole sequence"? The answer decides whether the property is written over the transport's invocation list or over its argument list. |
| Q-02 | AC-3.2 now makes the motivating incident escalate rather than repair in **this** repo, since every wave here owns `pdlc/workflows/`. Is A6 therefore expected to demonstrate its value in this repo only through the escalation path, with the repair path proven exclusively on consumer-repo-shaped fixtures? PROPERTIES will need to know which side the load-bearing tests sit on. |

## Positive Observations

- Every claim the revision added is measurable and measured true. AC-3.2's guard-path binding, AC-3.4's
  "no ninth reason", AC-4.4's gate order and AC-4.6's uncommitted-repair premise each resolved to a
  specific line I could read, and each said what the REQ said it said. Three High findings closed
  without a single unverifiable assertion added is the good version of an erratum round.
- AC-1.5 is the model fix in this round: it replaced "named once in the run report" with a cardinality
  on a named surface, then paired it with the negative case (none at all in a run where A6 applies).
  That is a set-equality, not a mention, and it is the shape F-01 still wants for AC-4.4.
- NFR-2's disabled-state oracle now distinguishes absent from all-zero, which is exactly the
  distinction the shipped suite already draws — the REQ and the code now describe the same observable.
- AC-2.4's budget rule is stated as the two oracles a test must separate rather than as a policy,
  which is what made F-03 (v1) collapse cleanly.
- Relocating §8's provenance to `DECISIONS-advisory-wave-gate-questions.md` and leaving a one-row
  decision table kept the document under the size budget (547 lines) while making every question's
  answer readable in one screen. The REQ got smaller while getting more complete.
- §1's withdrawal of the "no wave-state ledger ever survived here" claim, after re-measuring and
  finding an untracked ledger file, is a correction against the author's own argument. Reviewers see
  that rarely and should say so when they do.

## Recommendation

**Approved with minor changes**

All three v1 High findings are resolved, and the resolutions are grounded in code rather than in
prose. Two Medium and one Low remain: F-01 asks AC-4.4's oracle to match the strength of AC-4.4's own
clause, F-02 is a one-token version pin that the baseline file's change-control rule requires, and
F-03 is a half-sentence disambiguation. None blocks; all three are cheap enough to fold into the next
version, and F-01 in particular should land before TSPEC derives the re-gate property from it.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
