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

v2's Q-01 is answered on the half that mattered to me. It asked, of A2-6's unpushed commit, whether
"a subsequent invocation reading that branch's head" meant the same working tree or a fresh clone —
two different fixtures, only one constructible. T-08-8's new wording settles it: "a second process
reading that branch's head finds it", i.e. the same clone, which is constructible. The remaining half
(whether an unpushed commit on a protected default branch is the intended durable state) is a product
question, not a testability one, and I leave it to the PM lens. No new questions.

| ID | Question |
|----|---------|
| — | none |

## Positive Observations

- **The revision closed all four High/Medium findings by adding falsifiability, and closed none of
  them by weakening a claim.** Three new tests (T-07-11, T-07-12, T-08-4b) and three re-Givens
  (T-04-3b, T-08-4, T-08-8) — the count went 78 → 81, and every added row exists because a reviewer
  said a rule could not go red. Across two deltas now, nineteen findings have been closed without a
  single claim being softened to close one.
- **D-6's golden-master formulation is the right resolution of the tautology, and it says why.**
  "Observed once and transcribed into the test, never re-derived by running the code under test",
  with the general rule stated inline ("a comparison whose expected value is produced by the system
  under test cannot fail"), pinned to a sha §2 already establishes. That is a reusable statement of
  the anti-echo rule, not just a local fix, and T-10-3 names the red direction rather than leaving it
  implicit.
- **T-08-10 is now a full transcription, six rows deep.** Naming which seam produced each invocation
  turned an unwritable Given into five literal seam rows plus a literal total, with the identity
  checkable on each. This is the shape every enumerated-contract assertion in the document should
  take: set-equality over the full enumeration, zero rows included, so a deleted seam fails.
- **T-08-4 / T-08-4b repeats the T-04-3 / T-04-3b pattern deliberately, and labels it.** The
  production-path assertion carries the three positives; the unit-scoped guard test carries an inline
  label saying what it is and which row is the reachable one. Two independent findings, one at §6.6
  and one at §10.6, have now been resolved into the same documented shape — that consistency is worth
  more than either fix alone.
- **H-2's correction went the harder way.** It would have been easy to leave "defers or refuses with
  its existing notice" and add a test; instead the rule was corrected to the code (`ciRule` at
  `dev:759-784` — a non-escalating refusal, no `MERGE ESCALATION:` notice) *and* the Phase MERGE
  outcome was explicitly declared out of scope with T-08-3 named as the tested boundary. A stated
  scope boundary is a better artifact than a test that pretends to cover a neighbouring phase.
- **§18.1's arithmetic still reconciles.** 7 + 6 + 10 + 10 + 6 + 6 + 12 + 11 + 8 + 5 = 81, every
  §14.1 range matches its §18.1 row (T-07-1 … T-07-12; T-08-1 … T-08-10 plus T-08-4b), and §16.1's
  register was updated to `S-1 … S-5` in the same pass. Three separate index surfaces moved together.

## Recommendation

**Approved with minor changes**

All seven v2 findings — one High, three Medium, three Low — are resolved, each in the way the finding
asked for. The two findings above are Low, both are single clauses in rows this revision added, and
neither blocks: F-01 asks that T-07-12's Given fix the last re-poll's outcome so its third conjunct
becomes a literal, and F-02 asks that §18.3's AT-2 list either drop T-09-8 or qualify it as the
documented exception. Both are one-line edits and neither changes a behaviour, a rule, or a count.

From the testing lens the document is now in the state I want a FSPEC to reach before TSPEC: every
business rule in §3–§12 has at least one acceptance test that can go red for it, the enumerated
contracts (refusal reasons §5.3/T-03-5, permitted actions and exclusions §5.2/T-03-8, the five-seam
summary §10.3/T-08-10, the disabled-run created-file set §12.1/T-10-3) are all asserted by
set-equality over the full enumeration rather than by containment, the negative assertions I checked
are each paired with a positive on the same path, and the one place where an expected value was being
produced by the system under test has been replaced by a transcribed golden master pinned to a named
sha. The unreachable-but-guarded cases are labelled as such and paired with their reachable
integration siblings rather than being dressed up as end-to-end proofs.

Two upstream items are routed as errata rather than counted here. Both are the same ones I raised in
v2 and both are still open in `REQ-pdlc-advisory-tier.md` at HEAD:

1. **AC-8.2** (`REQ:245-248`) defines one attempt as a *fix → push → re-poll* cycle. §9.2 A5-3 has
   deliberately generalised this to *act → push → re-poll*, "under E-1 the act is a re-run with no
   fix and no push". The FSPEC's generalisation is the correct one — E-1's re-run-only cycle has no
   fix and no push to speak of — and the REQ is the document that should carry it.
2. **NFR-4** (`REQ:320-322`) defines the seam budget as unqualified wall-clock "measured from
   dispatch to verdict". §4.3 V-5 and §9.2 A5-3 now exclude rollup wait from it, with a rationale I
   verified is arithmetically live (`dev:34`: the CI completion window is 30 minutes against a
   shipped 10-minute seam budget, so an unqualified bound would end every A5 invocation inside its
   first attempt and `attemptBudget` would never bind). The exclusion belongs in the REQ.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:add0010006f28fe715ea861cb150ee2bda4a54cdd63c32fab011eb56a7d3d8f6
REVIEWED-COMMIT: 502c070f77c65d033c7a300ca53fdfd3a1f2cce5
