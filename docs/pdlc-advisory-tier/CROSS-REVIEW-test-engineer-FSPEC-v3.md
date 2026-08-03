# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` (v1.2)
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** delta re-review. Two questions only — are my v2 findings F-01…F-07 resolved, and did the
revision break anything in the sections it touched. Unchanged sections approved in v1/v2 are not
re-litigated. The approval bar is unchanged.

## Delta basis

`git diff a50cafe HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` — 31 insertions,
21 deletions across nine commits (`f2de271` … `502c070`). Touched: §4.1 (flow diagram), §6.6
(T-04-3b), §9.4 (T-07-11, T-07-12), §10.2 (H-2, H-2b), §10.3 (S-3, S-5), §10.6 (T-08-4, T-08-4b,
T-08-8, T-08-10), §12.1 (D-6), §12.3 (T-10-3), §14.1/§14.2, §15.2 (diagram), §16.1 (register),
§18.1/§18.3. Version header 1.1 → 1.2.

Code re-verified for the *changed* claims only; the baseline sha §2 pins (`26c3f1c`) exists in this
clone (`git cat-file -t 26c3f1c` → `commit`), which is what makes D-6's new transcribed-literal
formulation constructible. `dev:N` cites below are at `26c3f1c`, as §2 requires. Local branch and
`origin/feat-pdlc-advisory-tier` are both at `502c070` — no stale base.

| Changed claim | Checked at | Result |
|---|---|---|
| §12.1 D-6 — the expected created-file set is the set at a real pre-feature commit | `26c3f1c` resolves to a commit in this clone; §2 already pins it as the baseline | Confirmed constructible — a golden-master observed once at pre-feature code, not re-derived by the code under test |
| §10.2 H-2 — the pending-CI path is a plain non-escalating refusal | `ciRule` at `dev:759-784`: `pending` → `{result:"refused", row:"10", escalate:false}` | Confirmed; the revised wording now matches the code exactly (my v2 F-07) |
| §9.2 A5-3 rollup-wait exclusion is arithmetically load-bearing | `dev:34` `CI_COMPLETION_TIMEOUT_MS = 30 * 60 * 1000` against the shipped 10-minute seam budget | Confirmed — re-poll wait alone can exceed the seam budget threefold, so T-07-12's fixture is realisable |
| §10.6 T-08-4 — the distil delete must traverse the guarded channel | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:36` (matches `rm`/`unlink`/`git rm` in a Bash `tool_input.command`), registered `pdlc/hooks/hooks.json:9` | Confirmed — T-08-4's new production-path Given is the one that can falsify an unguarded channel; T-08-4b is the labelled unit companion |
| Upstream REQ AC-8.2 and NFR-4 | `REQ-pdlc-advisory-tier.md:245-248`, `:320-322` | Both still carry the wording the FSPEC has diverged from — re-emitted as errata, not counted here |

## Disposition of v2 findings

All seven are **resolved**, each in the way the finding asked for. Detail:

| v2 | Sev | Status | Evidence in v1.2 |
|---|---|---|---|
| F-01 | High | **Resolved** | D-6 now says the right-hand side is "a **literal**: the created-file set of a run of the pipeline at the pre-feature baseline commit §2 pins (`26c3f1c`), observed once and transcribed into the test, never re-derived by running the code under test", and names the red direction. T-10-3 asserts equality "element for element, [against] the transcribed literal set of D-6" and states the failing direction explicitly ("any file created outside that literal set fails the test, whether or not this feature named it"). This is the second of the two options I offered — pin the set at a named sha rather than enumerate it inline — and it is the better one here: the enumeration would rot, the sha does not. The expected value is now produced by *pre-feature* code once, not by the system under test on every run. |
| F-02 | Medium | **Resolved** | T-07-12 is the discriminator I asked for: the Given fixes re-poll waits that alone exceed `seamBudgetMinutes` while the act work does not, and the Then asserts the invocation reached its full `attemptBudget` cycles and did **not** escalate `budget-exhausted` on the first. An implementation that counted rollup wait ends after one cycle and fails the first conjunct. §14.2's NFR-4 row now cites `T-02-5, T-07-12`. One residual clause in its Then is F-01 below. |
| F-03 | Medium | **Resolved** | T-07-11 is written exactly as sketched: `attemptBudget` 2, first re-poll reaching the completion cap, second cycle red · Then the run did **not** halt at the cap, exactly two attempts were consumed, disposition `escalated` with reason `budget-exhausted`. Three positive conjuncts, and an implementation that lets `dev:6267-6272`'s existing `haltError` propagate fails the first one — which was the whole point. §9.3's two cap rows now each own a test (T-07-10 for the halting one, T-07-11 for the attempt-consuming one). |
| F-04 | Medium | **Resolved** | T-08-4 is re-Given on the production path — "a completed run reaching the distil step with no `LEARNINGS-{feature}.md` present · **When** the distil step attempts its delete" — with the three positives (refusal emitted **and names the artifact class**, `ADVISORY-{feature}.md` still exists with its entries intact, run report names the refusal). The direct-delete case survives as T-08-4b, explicitly labelled unit-scoped over the guard itself, in the T-04-3b shape. §14.1 and §18.1 both count it. |
| F-05 | Low | **Resolved** | T-08-10's Given now names the seams (A3 `no-action`, A4 `resolved`, A5 `escalated`) and the Then transcribes all six rows as literals: A1 0/0/0/0, A2 0/0/0/0, A3 1/0/0/1, A4 1/1/0/0, A5 1/0/1/0, total 3/1/1/1. I re-derived the identity on each: 1=0+0+1, 1=1+0+0, 1=0+1+0, 0=0+0+0 twice, 3=1+1+1. All hold, and the whole summary table is now a transcription rather than a derivation. |
| F-06 | Low | **Resolved** | T-04-3b is re-Given on "the A1 seam's verdict handler — the component that decides whether a verdict is honoured (BR-1)". The control is now the unit under test, not the proposer. |
| F-07 | Low | **Resolved** | H-2 takes the second option I offered and takes it fully: it corrects "defers or refuses with its existing notice" to "declines under its existing preconditions — on the pending-CI path that is a plain **non-escalating** refusal, not a merge-escalation notice", matching `ciRule` at `dev:759-784`, **and** declares Phase MERGE's own outcome out of scope for this FSPEC's tests, naming T-08-3 as the boundary. Scoping a claim out with the reason written down beats a test that could not be written here. |

## Findings

Two, both new, both Low, both in sections this revision changed, and neither contests a behaviour or
blocks approval. No High, no Medium — the four High/Medium of v2 are closed and the revision
introduced none.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **T-07-12's third conjunct is not transcribable from its Given, so one of its three assertions cannot be written as a literal.** The Then closes with "its terminal disposition is the one its last re-poll earned". The Given fixes the *timing* of the re-polls (their waits exceed `seamBudgetMinutes`, the act work does not) but never says whether the last re-poll comes back green or red — so the expected disposition is whatever the fixture happens to choose, and the test author has to derive it rather than transcribe it. The two conjuncts that carry the finding's weight are fine and do discriminate (an implementation that counted rollup wait ends after one cycle and fails "reached its full `attemptBudget` cycles"), so the carve-out is now falsifiable; this is only the third clause. **Resolution:** fix the last re-poll's outcome in the Given and state the disposition as a literal — e.g. "…and every cycle's re-poll returns red · **Then** … and the terminal disposition is `escalated` with reason `budget-exhausted`, reached on the **last** cycle rather than the first". Either polarity works; what matters is that the row stops asking the implementer to compute the expected value. | §9.4 T-07-12 |
| F-02 | Low | Local | **§18.3's AT-2 enumeration now includes T-09-8, which is the one escalation where V-8's triple demonstrably does *not* hold in full.** The recount commit (`d1160cd`) completed AT-2's list with `T-03-7, T-07-11, T-09-8`. T-03-7 and T-07-11 are correct additions — both are ordinary escalations carrying a reason. T-09-8 is not: its Given is "an escalating invocation whose `ESCALATIONS.md` write fails", and V-8's triple requires that "the advisory record **and the escalation entry** each carry exactly one refusal reason". In T-09-8 there is no entry — that is the entire point of the test, and §11.3/T-09-8 handle it as the deliberate asymmetry with R-2. Citing it as evidence *for* AT-2 mislabels the exception as an instance; a reader auditing AT-2 by walking its list finds one row that cannot discharge the obligation. AT-2 is amply covered without it (thirteen other tests), so nothing is uncovered — this is a traceability cell, not a coverage gap, hence Low. **Resolution:** either drop T-09-8 from AT-2's list, or keep it with an inline qualifier naming it the documented exception (e.g. "T-09-8 *(the entry-write-failure exception: the outcome and the pre-advisory behaviour hold; the entry conjunct cannot)*"), so the enumeration stays readable as a set. | §18.3 AT-2 |

Two things I checked and did **not** file:

- **§4.1's new step 3b (RE-CHECK → `no-action`) adds no untested claim.** Both of its parenthetical
  assertions already existed and were accepted in v1.1 — "consumes no attempt" is §4.4's re-read row,
  and "no §11 entry" follows from V-7 plus §11.1's entry being written on escalation. The diagram
  change is a depiction of accepted text, and §15.2's diagram moved with it. Counters for the
  disposition are pinned by literal in T-08-10.
- **S-5's second clause is tested by a positive literal, not by an absence.** "An `orchestrate-dev`
  report's A1/A2 rows are therefore always zero" is discharged by T-08-10's `A1 0/0/0/0, A2 0/0/0/0`
  on a dev-side run — a transcribed zero row, which is exactly the shape S-1 demands ("visibly zero,
  not absent"). The queue-side half is T-08-8. I looked for an absence-only oracle here and did not
  find one.

## Questions

## Positive Observations

## Recommendation

## Verdict
