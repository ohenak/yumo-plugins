# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** delta re-review — v1 findings F-01…F-15, plus new issues in changed sections only

## Review base

Diffed `bb297bf..HEAD` on the REQ (+165/−87, 9 revision commits, 252→343 lines). Every
existing-behaviour claim in the changed text was re-checked against **`main`**, which is the base
the REQ now declares it is written against (BL-02) and the base this feature will be implemented on.
`feat-pdlc-advisory-tier` is still 37 commits behind `main` — an operational note for the Phase-DOD
rebase, not a defect of this document.

Facts re-verified this round (all as the REQ describes them):

| Claim | Verified at (`main`) |
|---|---|
| Phase MERGE, its mode catalogue, its config reader are shipped | `pdlc/workflows/orchestrate-dev.js:43`, `:54`, `:60`, `:122-124`, `:1373` |
| `.claude/pdlc.config.json` is the config home for both Phase MERGE **and** the distribution gate | `orchestrate-dev.js:43`; `pdlc/hooks/scripts/lib/pdlc-drift.sh:845` |
| REQ-MERGE-03 self-modification paths (`pdlc/workflows/`, `pdlc/skills/`), additive, two defaults non-removable | `docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md` REQ-MERGE-03 AC-3.1/AC-3.3 |
| §1 A1 — `needs-human` skips the candidate and the loop tries the next | `orchestrate-queue.js:912-921` (`continue`); parse `:296-314`, default `needs-human` `:304-305` |
| §1 A2 — no distinct code signal; triage verdicts are exactly `ready\|blocked\|needs-human` | `orchestrate-queue.js:314` regex, prompt catalogue `:664-666` |
| §1 A3 — 3 DoD iterations | `orchestrate-dev.js:25` (`DOD_MAX_ITERATIONS = 3`) |
| §1 A4 — `REBASE_STATUS: conflict` → halt, branch unchanged | `orchestrate-dev.js:5792`, `:5915-5918`, halt at `:8166-8171` |
| §1 A5 — red halts; no-checks passes | `raisePrAndVerifyCi`, `orchestrate-dev.js:6222-6285` (`throw haltError` on `failed`, `return { ciStatus: "no-checks" }`) |
| AC-8.2's "Phase PUB's own completion timeout" is a real, separate budget | `CI_COMPLETION_TIMEOUT_MS`, `orchestrate-dev.js:6230`, enforced `:6266-6273`; no-checks window `:33` |
| Phase order H → PUB → MERGE (AC-8.3/AC-9.3 premise) | `orchestrate-dev.js:8192` (H), `:8247` (PUB), `:8272` (MERGE) |
| Harvest delete-guard recognises only `CROSS-REVIEW` / `CODE_REVIEW` | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:35`, `:43` |
| Queue row 2 for `pdlc-merge-phase` still reads `pending` (BL-02's parenthetical) | `docs/_queue/QUEUE.md:15` |
| `MODEL_DEFAULT` / `MODEL_IMPLEMENTATION` / `MODEL_QUEUE` live in two modules | `orchestrate-dev.js:1578`, `:1621`; `orchestrate-queue.js:69` |

Still no `docs/_constraints/` or `docs/_decisions/` in this repo, so no standing constraint is
contradicted.

## Disposition of v1 findings

All fifteen are closed. Notes only where the resolution differs from what I asked for.

| v1 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BL-02 now reads "Satisfied", states the REQ is written against `main`, and records the stale queue row as an operator note. §1 rows re-checked and all five hold (see review base). |
| F-02 | High | **Resolved** | AC-10.5 reconciles the two channels: shipped notices unchanged, an advisory escalation additionally emits one pointing at its `ESCALATIONS.md` entry, and the durability rationale (the operator's turn begins after the process exits) is stated. Naming nit only — see F-19. |
| F-03 | High | **Resolved** | AC-8.3 is now an outcome about DoD-passed reporting ("names the verified commit; a branch head beyond it is reported unverified") with the restoration mechanism left to TSPEC. Correct altitude. |
| F-04 | High | **Resolved** | AC-9.3 states the ordering constraint as an outcome (no record deleted while a later phase can still append) and names the guard extension explicitly, which the guard script's two-prefix match (`guard-harvest-before-delete.sh:35`) does require. |
| F-05 | High | **Resolved** | AC-1.7 declares four knobs with names, defaults and one owning `advisory` section of `.claude/pdlc.config.json` — the config home Phase MERGE and the drift gate already use. The A5 fix-cycle budget is explicitly bound to the same `attemptBudget`, which closes the double-counting question AC-8.2 would otherwise have raised. |
| F-06 | High | **Resolved** | AC-3.2 is now post-hoc refusal ("one already written is reverted"), AC-3.5 is the AC-7.4 revert-and-escalate template, and AC-3.4(a) enumerates the tamper operations with a per-operation test obligation. Attainable at the `agent()` seam the runtime actually provides. |
| F-07 | Medium | **Partly** | AC-4.5 now names a gate per seam and AC-5.1 limits adjudication to abstentions and forbids overturning `blocked` — the right shape. The A1 row's factual premise is wrong; refiled as F-16. |
| F-08 | Medium | **Resolved** | BL-05 added as its own blocker, distinguished from BL-03 and from the PR rollup, and AC-8.4 states the unavailable-capability behaviour (escalate with the comparison undone, no fix attempted). |
| F-09 | Medium | **Resolved** | AC-5.5 requires a machine-readable seam token on the `needs-human` result with a default route to A1. Implementable: the reason is free text after the verdict token (`orchestrate-queue.js:314`), so a token can ride there. |
| F-10 | Medium | **Resolved** | A1 verdicts renamed `run-candidate` / `hold` / `escalate`; AC-4.2 carries the disambiguating note. No collision with the `ready: true` frontmatter flag remains. |
| F-11 | Medium | **Resolved** | AC-1.2 defines non-resolution observably (runtime rejects the dispatch with a model/alias error before output; any other failure is not non-resolution) and AC-1.4 hands the detection point to TSPEC. |
| F-12 | Low | **Resolved** | AC-1.5 now says "both the dev and the queue module (seams A1/A2 live in the queue module)". |
| F-13 | Low | **Resolved** | §1's A5 row covers both outcomes and AC-8.6 defines the no-checks case: seam does not fire, existing pass stands, outcome named in the summary. |
| F-14 | Low | **Resolved** | D-ADV-02/04 marked "Closed, not deferred — no successor"; D-ADV-05 bound to `pdlc-consolidation-agent`. Nothing left for the DoD boundary check to flag. |
| F-15 | Low | **Resolved** | The uncited anecdote is gone; AC-8.4's rationale now rests on BL-05. |

## Findings

Numbering continues from v1. All four are in text this round introduced or rewrote; nothing
unchanged is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-16 | Medium | Local | **The deterministic backstop AC-4.5/AC-5.1 lean on cannot reach the state they name.** AC-4.5's A1 row makes the pre-check the gate that re-runs and gives it the state "every declared dependency present in base"; AC-5.1 says an absent dependency "remains a deterministic check". The shipped pre-check is `precheckDependencies` (`main:pdlc/workflows/orchestrate-queue.js:628-648`) and it is **conservative by construction**: it can only prove *blocked* (a dependency with a non-`done` queue row, `:638-644`); a dependency that is `done`, or absent from the queue entirely, returns `{blocked: false}` — its own doc comment says that case "CANNOT be judged from the queue alone" and defers it to the triage agent (`:618-627`). So the gate answers "not provably blocked by the queue", never "present in base", and it is also wrong in both directions in practice: `pdlc-merge-phase` is in base today while its queue row still reads `pending` (`docs/_queue/QUEUE.md:15`), so the pre-check would call this very feature blocked. As written, the only judge of dependency presence at A1 is the advisory agent — which is what US-03/US-05 promise it will not be. Restate the A1 row's state as what the pre-check can observe, and state what observation establishes "present in base" and which non-advisory actor makes it. | AC-4.5 (A1 row), AC-5.1 |
| F-17 | Medium | Local | **AC-3.6's refusal-reason set is neither total nor one-to-one, and it is a parsed contract.** The seven reasons are consumed by the advisory record (AC-9.1) and by `ESCALATIONS.md` (AC-10.1), which `pdlc-engineering-loop` reads as a log (AC-10.4) — so an implementer facing an outcome with no token will invent one. Two gaps: (a) **no member covers a verification failure after an in-envelope action.** AC-7.4 (resolution applied → tests re-run → failure reverts and escalates) and AC-4.5's A3/A4/A5 rows (the gate re-runs and reaches a *failing* verdict) all produce an escalation whose only near-fit token is `revert-on-test-touch`, which mislabels it — nothing touched a test, the tests failed. (b) **`revert-on-test-touch` is ambiguous with `out-of-envelope`**: AC-3.6 lists the trigger as "a reverted diff", but AC-3.2 also reverts an out-of-envelope non-test change, so one event maps to two tokens. Add a member for post-action verification failure and give AC-3.6 an explicit trigger→reason table so the mapping is total and injective; test it by set-equality over the full enumeration so a deleted case fails. | AC-3.6, AC-7.4, AC-4.5 |
| F-18 | Low | Local | **E-1 needs a `gh` capability §6 does not declare, and it is a *write*.** "Re-running a flaky check" on the identical sha cannot be done by pushing (that changes the sha and breaks E-1's own rule) — it needs `gh run rerun`, a write against Actions requiring workflow scope, whereas BL-03 and BL-05 are both reads and the pipeline's only shipped CI surfaces are reads (`gh pr view --json statusCheckRollup`, `main:orchestrate-dev.js:323`; the `_ghRun` transport takes a whole command string from a closed catalogue, `:310-333`, so adding one is cheap — the question is the token, not the plumbing). Relatedly, E-2's "the same check passes at the merge-base commit" reads check history for a commit on the default branch, i.e. the BL-05 capability, which §6 currently ties to AC-8.4 alone. Declare both in §6 with the same unavailable-behaviour clause AC-8.4 already models. | AC-3.3 (E-1, E-2), §6 |
| F-19 | Low | Local | **AC-10.5 names the shipped channel imprecisely.** The in-process notices are `MERGE ESCALATION: …` — a frozen four-member catalogue, merge-specific (`MERGE_ESCALATIONS`, `main:pdlc/workflows/orchestrate-dev.js:1321-1328`, emitted at `:908`, `:920`, `:950`, `:1509`, `:1542`), pinned by test to that exact prefix (`main:pdlc/workflows/__tests__/mergePhase.test.js:986-989`, `:1051`). AC-10.5 calls them "`ESCALATION:` notices", which is not the shipped literal. Say whether an advisory notice joins that catalogue (widening a frozen, test-pinned set) or adds a sibling channel with its own prefix — as an outcome, the exact string being TSPEC's. | AC-10.5 |

## Questions

v1's Q-02, Q-03, Q-04 and Q-05 are answered by the revision (AC-8.3; E-3's merge-base **and**
default-branch-tip rule; AC-1.6/NFR-3's "no advisory summary" when disabled; AC-2.2's "the envelope
is the control, confidence only lets the agent decline"). Q-01 remains open and one new question.

| ID | Question |
|----|---------|
| Q-01 | (carried) Phase MERGE now runs *after* Phase PUB (`main:orchestrate-dev.js:8272`) and resolves `deferred`/`refused` on four named conditions, leaving the queue row `awaiting-merge` — structurally the same "operator arrives at an unexplained stop" §1 describes. §5 puts merging out of scope, which I read as *the tier never merges* rather than *the tier never diagnoses a refused merge*. If the second reading is intended, is that a deferral worth an entry in §7? |
| Q-06 | AC-9.3 protects the record from being deleted while a later phase can still append. Phase MERGE runs after Phase PUB and can itself escalate. If the tier never touches MERGE (Q-01), the last possible appender is A5 in PUB — is that the intended definition of "later phase", or does the protection need to extend to the end of the run regardless of which phases can append? |

## Positive Observations

- The revision is a genuine re-grounding, not a patch: BL-02's reversal, the §1 A2/A5 row rewrites,
  and AC-8.3/AC-9.3's restatement all follow from the same corrected base, and every §1 row I
  re-checked against `main` still holds.
- AC-1.7 is exactly the right resolution of F-05 — one table, one owning config section, real
  defaults, and the A5 fix-cycle budget explicitly folded into `attemptBudget` rather than left as a
  second implicit counter.
- AC-3.3's four decidable rules are the strongest part of the document. E-3's "absent from the
  merge-base tree **and** absent from the default-branch tip" is precisely the shared-file case Q-03
  worried about, closed with a rule an implementer can evaluate without judgment.
- AC-3.4(a) enumerating the tamper operations (assertion edit, file/case deletion, rename out of
  collection, skip/xfail marker, narrowed parametrisation, lowered threshold) with a per-operation
  test obligation in AC-3.5 is the right shape: a closed set, each member independently falsifiable.
- AC-4.6's requirement that each prohibition test assert the AC-3.6 positive triple on the same path
  is the absence-only-oracle trap named and closed in the REQ itself. That is unusual and welcome.
- AC-8.6 turning the silent no-checks pass into a *named* outcome converts today's genuinely
  invisible state (`orchestrate-dev.js:6275-6285`) into something the summary reports, at zero
  behavioural cost.

## Recommendation

## Verdict
